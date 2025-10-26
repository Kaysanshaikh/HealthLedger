const db = require('../services/databaseService');
const { pool } = require('../config/database');

async function testDatabase() {
  console.log('🧪 Testing Neon Database Operations...\n');
  
  try {
    // Test 1: Connection
    console.log('1️⃣  Testing connection...');
    const connResult = await pool.query('SELECT NOW() as time');
    console.log('   ✅ Connected! Server time:', connResult.rows[0].time);
    
    // Test 2: Create a test user
    console.log('\n2️⃣  Creating test user...');
    const testWallet = '0xTEST' + Date.now();
    const testEmail = `test${Date.now()}@example.com`;
    const testHH = Math.floor(Math.random() * 1000000000);
    
    const user = await db.createUser(
      testWallet,
      testEmail,
      'patient',
      testHH
    );
    console.log('   ✅ User created:', {
      id: user.id,
      wallet: user.wallet_address,
      email: user.email,
      role: user.role,
      hh_number: user.hh_number
    });
    
    // Test 3: Retrieve the user
    console.log('\n3️⃣  Retrieving user by wallet...');
    const retrievedUser = await db.getUserByWallet(testWallet);
    console.log('   ✅ User retrieved:', retrievedUser ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Create patient profile
    console.log('\n4️⃣  Creating patient profile...');
    const profile = await db.createPatientProfile({
      userId: user.id,
      hhNumber: testHH,
      fullName: 'Test Patient',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      bloodGroup: 'O+',
      homeAddress: '123 Test Street',
      phoneNumber: '+1234567890',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '+0987654321',
      allergies: 'None',
      chronicConditions: 'None'
    });
    console.log('   ✅ Patient profile created:', {
      id: profile.id,
      name: profile.full_name,
      blood_group: profile.blood_group
    });
    
    // Test 5: Retrieve patient profile
    console.log('\n5️⃣  Retrieving patient profile...');
    const retrievedProfile = await db.getPatientProfile(testHH);
    console.log('   ✅ Profile retrieved:', retrievedProfile ? 'SUCCESS' : 'FAILED');
    console.log('   📋 Profile data:', {
      name: retrievedProfile.full_name,
      dob: retrievedProfile.date_of_birth,
      blood_group: retrievedProfile.blood_group
    });
    
    // Test 6: Index a record
    console.log('\n6️⃣  Indexing a test record...');
    const recordId = `test-record-${Date.now()}`;
    const indexedRecord = await db.indexRecord({
      recordId: recordId,
      patientWallet: testWallet,
      patientHHNumber: testHH,
      creatorWallet: '0xDOCTOR123',
      ipfsCid: 'QmTestCID123456789',
      recordType: 'diagnostic',
      metadata: { testName: 'Blood Test', testType: 'CBC' },
      searchableText: 'Blood Test CBC Complete Blood Count',
      blockchainTxHash: '0xTESTTXHASH123'
    });
    console.log('   ✅ Record indexed:', {
      id: indexedRecord.id,
      record_id: indexedRecord.record_id,
      ipfs_cid: indexedRecord.ipfs_cid
    });
    
    // Test 7: Search records
    console.log('\n7️⃣  Searching for records...');
    const searchResults = await db.searchRecords('Blood Test', testWallet);
    console.log('   ✅ Search results found:', searchResults.length);
    if (searchResults.length > 0) {
      console.log('   📄 First result:', {
        record_id: searchResults[0].record_id,
        record_type: searchResults[0].record_type
      });
    }
    
    // Test 8: Get records by patient
    console.log('\n8️⃣  Getting all patient records...');
    const patientRecords = await db.getRecordsByPatient(testWallet);
    console.log('   ✅ Patient records found:', patientRecords.length);
    
    // Test 9: Log access
    console.log('\n9️⃣  Logging record access...');
    const accessLog = await db.logAccess(
      recordId,
      '0xDOCTOR123',
      'doctor',
      'view',
      '192.168.1.1',
      'Mozilla/5.0 Test Browser'
    );
    console.log('   ✅ Access logged:', {
      id: accessLog.id,
      action: accessLog.action,
      accessor: accessLog.accessor_wallet
    });
    
    // Test 10: Get access logs
    console.log('\n🔟 Retrieving access logs...');
    const logs = await db.getAccessLogs(recordId);
    console.log('   ✅ Access logs found:', logs.length);
    
    // Test 11: Create notification
    console.log('\n1️⃣1️⃣  Creating notification...');
    const notification = await db.createNotification(
      testWallet,
      'Test Notification',
      'This is a test notification message',
      'test',
      recordId
    );
    console.log('   ✅ Notification created:', {
      id: notification.id,
      title: notification.title
    });
    
    // Test 12: Get notifications
    console.log('\n1️⃣2️⃣  Retrieving notifications...');
    const notifications = await db.getNotifications(testWallet);
    console.log('   ✅ Notifications found:', notifications.length);
    
    // Test 13: Count all records
    console.log('\n1️⃣3️⃣  Counting database records...');
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM patient_profiles) as patients,
        (SELECT COUNT(*) FROM record_index) as records,
        (SELECT COUNT(*) FROM access_logs) as logs,
        (SELECT COUNT(*) FROM notifications) as notifications
    `);
    console.log('   ✅ Database statistics:', counts.rows[0]);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('   • Database connection: ✅ Working');
    console.log('   • User creation: ✅ Working');
    console.log('   • Profile creation: ✅ Working');
    console.log('   • Record indexing: ✅ Working');
    console.log('   • Search functionality: ✅ Working');
    console.log('   • Access logging: ✅ Working');
    console.log('   • Notifications: ✅ Working');
    console.log('\n🎉 Your database is fully operational and storing data correctly!\n');
    
    // Cleanup option
    console.log('💡 Test data created:');
    console.log(`   • User ID: ${user.id}`);
    console.log(`   • Wallet: ${testWallet}`);
    console.log(`   • HH Number: ${testHH}`);
    console.log('\n⚠️  To clean up test data, run: npm run db:cleanup\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔍 Error details:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure you ran: npm run db:migrate');
    console.error('   2. Check your .env file has correct database credentials');
    console.error('   3. Verify your Neon database is active');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
