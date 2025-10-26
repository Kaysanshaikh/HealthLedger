const healthLedgerService = require("../services/healthLedgerService");
const db = require("../services/databaseService");

// Check if user is already registered
exports.checkRegistration = async (req, res) => {
  try {
    const { walletAddress, hhNumber } = req.query;

    if (!walletAddress && !hhNumber) {
      return res.status(400).json({ 
        error: "Either walletAddress or hhNumber is required" 
      });
    }

    let user = null;
    let profile = null;
    let blockchainData = null;

    // Check by wallet address
    if (walletAddress) {
      console.log("🔍 Checking registration for wallet:", walletAddress);
      
      // Check database
      user = await db.getUserByWallet(walletAddress);
      
      if (user) {
        // Get profile based on role
        if (user.role === 'patient') {
          profile = await db.getPatientProfile(user.hh_number);
          
          // Get blockchain data
          try {
            blockchainData = await healthLedgerService.getPatient(user.hh_number);
          } catch (error) {
            console.log("Could not fetch blockchain data:", error.message);
          }
        } else if (user.role === 'doctor') {
          profile = await db.getDoctorProfile(user.hh_number);
          
          try {
            blockchainData = await healthLedgerService.getDoctor(user.hh_number);
          } catch (error) {
            console.log("Could not fetch blockchain data:", error.message);
          }
        } else if (user.role === 'diagnostic') {
          profile = await db.getDiagnosticProfile(user.hh_number);
          
          try {
            blockchainData = await healthLedgerService.getDiagnostic(user.hh_number);
          } catch (error) {
            console.log("Could not fetch blockchain data:", error.message);
          }
        }
      }
    }

    // Check by HH number
    if (!user && hhNumber) {
      console.log("🔍 Checking registration for HH Number:", hhNumber);
      
      user = await db.getUserByHHNumber(parseInt(hhNumber));
      
      if (user) {
        // Get profile based on role
        if (user.role === 'patient') {
          profile = await db.getPatientProfile(parseInt(hhNumber));
        } else if (user.role === 'doctor') {
          profile = await db.getDoctorProfile(parseInt(hhNumber));
        } else if (user.role === 'diagnostic') {
          profile = await db.getDiagnosticProfile(parseInt(hhNumber));
        }
      }
    }

    if (user) {
      return res.json({
        isRegistered: true,
        message: `You are already registered as ${user.role}`,
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
          role: user.role,
          hhNumber: user.hh_number,
          isActive: user.is_active,
          createdAt: user.created_at
        },
        profile: profile,
        blockchainData: blockchainData
      });
    } else {
      return res.json({
        isRegistered: false,
        message: "Not registered. You can proceed with registration."
      });
    }

  } catch (error) {
    console.error("❌ Check registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const { hhNumber } = req.params;
    const updates = req.body;

    console.log("📝 Updating patient profile:", hhNumber);

    // Get current profile
    const profile = await db.getPatientProfile(parseInt(hhNumber));
    
    if (!profile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    // Update in database
    const { query } = require('../config/database');
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.phoneNumber !== undefined) {
      updateFields.push(`phone_number = $${paramIndex++}`);
      values.push(updates.phoneNumber);
    }
    if (updates.homeAddress !== undefined) {
      updateFields.push(`home_address = $${paramIndex++}`);
      values.push(updates.homeAddress);
    }
    if (updates.emergencyContactName !== undefined) {
      updateFields.push(`emergency_contact_name = $${paramIndex++}`);
      values.push(updates.emergencyContactName);
    }
    if (updates.emergencyContactPhone !== undefined) {
      updateFields.push(`emergency_contact_phone = $${paramIndex++}`);
      values.push(updates.emergencyContactPhone);
    }
    if (updates.allergies !== undefined) {
      updateFields.push(`allergies = $${paramIndex++}`);
      values.push(updates.allergies);
    }
    if (updates.chronicConditions !== undefined) {
      updateFields.push(`chronic_conditions = $${paramIndex++}`);
      values.push(updates.chronicConditions);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(parseInt(hhNumber));
    
    const updateQuery = `
      UPDATE patient_profiles 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE hh_number = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    console.log("✅ Profile updated successfully");

    // Create notification
    await db.createNotification(
      profile.wallet_address,
      'Profile Updated',
      'Your profile information has been updated successfully',
      'profile_update',
      null
    );

    res.json({
      message: "Profile updated successfully",
      profile: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Forgot HH Number - retrieve by email
exports.forgotHHNumber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log("🔍 Looking up HH Number for email:", email);

    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ 
        error: "No account found with this email address" 
      });
    }

    // Get profile details
    let profile = null;
    if (user.role === 'patient') {
      profile = await db.getPatientProfile(user.hh_number);
    } else if (user.role === 'doctor') {
      profile = await db.getDoctorProfile(user.hh_number);
    } else if (user.role === 'diagnostic') {
      profile = await db.getDiagnosticProfile(user.hh_number);
    }

    res.json({
      message: "Account found",
      hhNumber: user.hh_number,
      walletAddress: user.wallet_address,
      role: user.role,
      name: profile?.full_name || profile?.center_name,
      email: user.email
    });

  } catch (error) {
    console.error("❌ Forgot HH Number error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get complete user profile with all details
exports.getCompleteProfile = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be wallet address or HH number

    console.log("📋 Getting complete profile for:", identifier);

    let user = null;

    // Try as wallet address first
    if (identifier.startsWith('0x')) {
      user = await db.getUserByWallet(identifier);
    } else {
      // Try as HH number
      user = await db.getUserByHHNumber(parseInt(identifier));
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get profile based on role
    let profile = null;
    let blockchainData = null;

    if (user.role === 'patient') {
      profile = await db.getPatientProfile(user.hh_number);
      try {
        blockchainData = await healthLedgerService.getPatient(user.hh_number);
      } catch (error) {
        console.log("Could not fetch blockchain data");
      }
    } else if (user.role === 'doctor') {
      profile = await db.getDoctorProfile(user.hh_number);
      try {
        blockchainData = await healthLedgerService.getDoctor(user.hh_number);
      } catch (error) {
        console.log("Could not fetch blockchain data");
      }
    } else if (user.role === 'diagnostic') {
      profile = await db.getDiagnosticProfile(user.hh_number);
      try {
        blockchainData = await healthLedgerService.getDiagnostic(user.hh_number);
      } catch (error) {
        console.log("Could not fetch blockchain data");
      }
    }

    // Get notifications
    const notifications = await db.getNotifications(user.wallet_address, false, 10);

    // Get records if patient
    let records = [];
    if (user.role === 'patient') {
      records = await db.getRecordsByPatient(user.wallet_address, 20);
    }

    res.json({
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        role: user.role,
        hhNumber: user.hh_number,
        isActive: user.is_active,
        createdAt: user.created_at
      },
      profile: profile,
      blockchainData: blockchainData,
      notifications: notifications,
      records: records,
      stats: {
        totalRecords: records.length,
        unreadNotifications: notifications.filter(n => !n.is_read).length
      }
    });

  } catch (error) {
    console.error("❌ Get complete profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
