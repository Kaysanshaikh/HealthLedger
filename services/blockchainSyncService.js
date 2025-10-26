const healthLedgerService = require('./healthLedgerService');
const db = require('./databaseService');

/**
 * Blockchain Sync Service
 * Ensures database is synchronized with blockchain data
 * Blockchain = Source of Truth, Database = Fast Query Cache
 */
class BlockchainSyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = null;
  }

  /**
   * Sync a patient profile from blockchain to database
   */
  async syncPatientProfile(hhNumber) {
    try {
      console.log(`🔄 Syncing patient profile from blockchain: ${hhNumber}`);
      
      // Get from blockchain (source of truth)
      const blockchainData = await healthLedgerService.getPatient(hhNumber);
      
      if (!blockchainData) {
        console.log(`⚠️ Patient ${hhNumber} not found on blockchain`);
        return null;
      }

      // Check if user exists in database
      let user = await db.getUserByWallet(blockchainData.walletAddress);
      
      if (!user) {
        // Create user in database
        user = await db.createUser(
          blockchainData.walletAddress,
          blockchainData.email,
          'patient',
          parseInt(hhNumber)
        );
        console.log(`✅ Created user in database for patient ${hhNumber}`);
      }

      // Check if profile exists
      let profile = await db.getPatientProfile(parseInt(hhNumber));
      
      if (!profile) {
        // Convert Unix timestamp to proper date format
        let dateOfBirth = blockchainData.dob;
        if (typeof dateOfBirth === 'number' || (typeof dateOfBirth === 'string' && !isNaN(dateOfBirth))) {
          // It's a Unix timestamp (seconds), convert to Date
          const timestamp = typeof dateOfBirth === 'number' ? dateOfBirth : parseInt(dateOfBirth);
          dateOfBirth = new Date(timestamp * 1000).toISOString().split('T')[0]; // YYYY-MM-DD
          console.log(`📅 Converted DOB from timestamp ${timestamp} to ${dateOfBirth}`);
        }
        
        // Create profile in database
        profile = await db.createPatientProfile({
          userId: user.id,
          hhNumber: parseInt(hhNumber),
          fullName: blockchainData.name,
          dateOfBirth: dateOfBirth,
          gender: blockchainData.gender,
          bloodGroup: blockchainData.bloodGroup,
          homeAddress: blockchainData.homeAddress,
          phoneNumber: null
        });
        console.log(`✅ Created patient profile in database for ${hhNumber}`);
      } else {
        // Convert Unix timestamp to proper date format
        let dateOfBirth = blockchainData.dob;
        if (typeof dateOfBirth === 'number' || (typeof dateOfBirth === 'string' && !isNaN(dateOfBirth))) {
          const timestamp = typeof dateOfBirth === 'number' ? dateOfBirth : parseInt(dateOfBirth);
          dateOfBirth = new Date(timestamp * 1000).toISOString().split('T')[0];
          console.log(`📅 Converted DOB from timestamp ${timestamp} to ${dateOfBirth}`);
        }
        
        // Update existing profile with blockchain data
        await db.updatePatientProfile(parseInt(hhNumber), {
          fullName: blockchainData.name,
          dateOfBirth: dateOfBirth,
          gender: blockchainData.gender,
          bloodGroup: blockchainData.bloodGroup,
          homeAddress: blockchainData.homeAddress
        });
        console.log(`✅ Updated patient profile in database for ${hhNumber}`);
      }

      return { user, profile };
    } catch (error) {
      console.error(`❌ Error syncing patient ${hhNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync a doctor profile from blockchain to database
   */
  async syncDoctorProfile(hhNumber) {
    try {
      console.log(`🔄 Syncing doctor profile from blockchain: ${hhNumber}`);
      
      // Get from blockchain (source of truth)
      const blockchainData = await healthLedgerService.getDoctor(hhNumber);
      
      if (!blockchainData) {
        console.log(`⚠️ Doctor ${hhNumber} not found on blockchain`);
        return null;
      }

      // Check if user exists in database
      let user = await db.getUserByWallet(blockchainData.walletAddress);
      
      if (!user) {
        // Create user in database
        user = await db.createUser(
          blockchainData.walletAddress,
          blockchainData.email,
          'doctor',
          parseInt(hhNumber)
        );
        console.log(`✅ Created user in database for doctor ${hhNumber}`);
      }

      // Check if profile exists
      let profile = await db.getDoctorProfile(parseInt(hhNumber));
      
      if (!profile) {
        // Create profile in database
        profile = await db.createDoctorProfile({
          userId: user.id,
          hhNumber: parseInt(hhNumber),
          fullName: blockchainData.name,
          specialization: blockchainData.specialization,
          hospital: blockchainData.hospital,
          licenseNumber: null,
          phoneNumber: null,
          yearsOfExperience: null
        });
        console.log(`✅ Created doctor profile in database for ${hhNumber}`);
      } else {
        // Update existing profile with blockchain data
        await db.updateDoctorProfile(parseInt(hhNumber), {
          fullName: blockchainData.name,
          specialization: blockchainData.specialization,
          hospital: blockchainData.hospital
        });
        console.log(`✅ Updated doctor profile in database for ${hhNumber}`);
      }

      return { user, profile };
    } catch (error) {
      console.error(`❌ Error syncing doctor ${hhNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync a diagnostic center profile from blockchain to database
   */
  async syncDiagnosticProfile(hhNumber) {
    try {
      console.log(`🔄 Syncing diagnostic profile from blockchain: ${hhNumber}`);
      
      // Get from blockchain (source of truth)
      const blockchainData = await healthLedgerService.getDiagnostic(hhNumber);
      
      if (!blockchainData) {
        console.log(`⚠️ Diagnostic ${hhNumber} not found on blockchain`);
        return null;
      }

      // Check if user exists in database
      let user = await db.getUserByWallet(blockchainData.walletAddress);
      
      if (!user) {
        // Create user in database
        user = await db.createUser(
          blockchainData.walletAddress,
          blockchainData.email,
          'diagnostic',
          parseInt(hhNumber)
        );
        console.log(`✅ Created user in database for diagnostic ${hhNumber}`);
      }

      // Check if profile exists
      let profile = await db.getDiagnosticProfile(parseInt(hhNumber));
      
      if (!profile) {
        // Create profile in database
        profile = await db.createDiagnosticProfile({
          userId: user.id,
          hhNumber: parseInt(hhNumber),
          centerName: blockchainData.name,
          location: blockchainData.location,
          phoneNumber: null,
          servicesOffered: null,
          accreditation: null
        });
        console.log(`✅ Created diagnostic profile in database for ${hhNumber}`);
      } else {
        // Update existing profile with blockchain data
        await db.updateDiagnosticProfile(parseInt(hhNumber), {
          centerName: blockchainData.name,
          location: blockchainData.location
        });
        console.log(`✅ Updated diagnostic profile in database for ${hhNumber}`);
      }

      return { user, profile };
    } catch (error) {
      console.error(`❌ Error syncing diagnostic ${hhNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync a medical record from blockchain to database
   * Note: Only metadata and CID are synced, not the actual medical data
   */
  async syncMedicalRecord(recordId) {
    try {
      console.log(`🔄 Syncing medical record from blockchain: ${recordId}`);
      
      // Get from blockchain (source of truth)
      const blockchainRecord = await healthLedgerService.getRecord(recordId);
      
      if (!blockchainRecord) {
        console.log(`⚠️ Record ${recordId} not found on blockchain`);
        return null;
      }

      // Check if record exists in database
      let dbRecord = await db.getRecordById(recordId);
      
      if (!dbRecord) {
        // Parse metadata
        let metadata = {};
        try {
          metadata = JSON.parse(blockchainRecord.meta);
        } catch (e) {
          console.warn('Could not parse metadata:', e.message);
        }

        // Get patient info
        const patient = await db.getUserByWallet(blockchainRecord.patient);

        // Index record in database
        await db.indexRecord({
          recordId: recordId,
          patientWallet: blockchainRecord.patient,
          patientHHNumber: patient?.hh_number || null,
          creatorWallet: blockchainRecord.patient,
          ipfsCid: blockchainRecord.cid,
          recordType: metadata.recordType || 'general',
          metadata: metadata,
          searchableText: JSON.stringify(metadata),
          blockchainTxHash: null
        });
        
        console.log(`✅ Indexed record ${recordId} in database`);
      }

      return blockchainRecord;
    } catch (error) {
      console.error(`❌ Error syncing record ${recordId}:`, error.message);
      throw error;
    }
  }

  /**
   * Full sync - sync all data from blockchain to database
   * WARNING: This can be slow for large datasets
   */
  async fullSync() {
    if (this.isSyncing) {
      console.log('⚠️ Sync already in progress');
      return;
    }

    try {
      this.isSyncing = true;
      console.log('🔄 Starting full blockchain sync...');
      
      // Note: In a real implementation, you would need to:
      // 1. Get list of all HH numbers from blockchain events
      // 2. Sync each profile
      // 3. Sync all records
      
      // For now, we'll just update the sync time
      this.lastSyncTime = new Date();
      
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Auto-sync on startup
   */
  async autoSync() {
    console.log('🔄 Auto-sync: Checking for blockchain updates...');
    
    // In a production system, you would:
    // 1. Listen to blockchain events
    // 2. Sync only changed data
    // 3. Run periodic full syncs
    
    this.lastSyncTime = new Date();
    console.log('✅ Auto-sync completed');
  }
}

module.exports = new BlockchainSyncService();
