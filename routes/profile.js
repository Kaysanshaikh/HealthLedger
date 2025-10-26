const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');
const profileController = require('../controllers/profileController');

// Get user profile by wallet
router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;

    console.log('👤 Getting user profile:', wallet);

    const user = await db.getUserByWallet(wallet);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get patient profile by HH number
router.get('/patient/:hhNumber', async (req, res) => {
  try {
    const { hhNumber } = req.params;

    console.log('🏥 Getting patient profile:', hhNumber);

    const profile = await db.getPatientProfile(parseInt(hhNumber));

    if (!profile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('❌ Get patient profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get patients for doctor 
router.get('/doctor/:hhNumber/patients', async (req, res) => {
  try {
    const { hhNumber } = req.params;
    
    console.log('📋 Getting patients for doctor:', hhNumber);
    
    // Get doctor's wallet address
    const doctor = await db.getUserByHHNumber(parseInt(hhNumber));
    
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor not found',
        patients: []
      });
    }
    
    // Get patients who granted access (using HH number for strict role isolation)
    console.log(`🔍 Querying database for patients who granted access to doctor HH ${hhNumber} (wallet: ${doctor.wallet_address})`);
    const patients = await db.getPatientsForDoctor(doctor.wallet_address, hhNumber);
    
    console.log(`✅ Found ${patients.length} patients for doctor ${hhNumber}:`, 
      patients.map(p => `HH ${p.patient_hh_number} (${p.full_name})`));
    
    if (patients.length === 0) {
      return res.json({
        message: 'No patients have granted you access yet.',
        patients: [],
        count: 0
      });
    }
    
    res.json({
      patients: patients,
      count: patients.length
    });
    
  } catch (error) {
    console.error('❌ Get patients error:', error);
    res.status(500).json({ 
      error: 'Unable to load patient list. Please try again.',
      patients: []
    });
  }
});

// Get doctor profile by HH number
router.get('/doctor/:hhNumber', async (req, res) => {
  try {
    const { hhNumber } = req.params;

    console.log('👨‍⚕️ Getting doctor profile:', hhNumber);

    const profile = await db.getDoctorProfile(parseInt(hhNumber));

    if (!profile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('❌ Get doctor profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get diagnostic profile by HH number
router.get('/diagnostic/:hhNumber', async (req, res) => {
  try {
    const { hhNumber } = req.params;

    console.log('🔬 Getting diagnostic profile:', hhNumber);

    const profile = await db.getDiagnosticProfile(parseInt(hhNumber));

    if (!profile) {
      return res.status(404).json({ error: 'Diagnostic profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('❌ Get diagnostic profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user notifications
router.get('/notifications/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { unread, limit } = req.query;

    console.log('🔔 Getting notifications:', wallet);

    const notifications = await db.getNotifications(
      wallet,
      unread === 'true',
      parseInt(limit) || 50
    );

    res.json({ 
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Marking notification as read:', id);

    const notification = await db.markNotificationAsRead(parseInt(id));

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ 
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('❌ Mark notification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get access logs for a record
router.get('/access-logs/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { limit } = req.query;

    console.log('🔐 Getting access logs:', recordId);

    const logs = await db.getAccessLogs(recordId, parseInt(limit) || 100);

    res.json({ 
      logs,
      count: logs.length,
      recordId
    });
  } catch (error) {
    console.error('❌ Get access logs error:', error);
    res.status(400).json({ error: error.message });
  }
});

// NEW ENDPOINTS

// Check if user is already registered
router.get('/check-registration', profileController.checkRegistration);

// Get complete profile with all details
router.get('/complete/:identifier', profileController.getCompleteProfile);

// Update patient profile
router.put('/patient/:hhNumber', profileController.updatePatientProfile);

// Forgot HH Number - retrieve by email
router.post('/forgot-hh-number', profileController.forgotHHNumber);

module.exports = router;
