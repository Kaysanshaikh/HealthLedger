const { query } = require('../config/database');

async function checkAccess() {
  console.log('\n🔍 Checking doctor_patient_access table...\n');
  
  try {
    const result = await query('SELECT * FROM doctor_patient_access ORDER BY granted_at DESC');
    
    if (result.rows.length === 0) {
      console.log('❌ No access grants found in database!');
      console.log('\nThis means the grant access is not saving to the database.');
      console.log('Check the backend logs for errors.\n');
    } else {
      console.log(`✅ Found ${result.rows.length} access grant(s):\n`);
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. Doctor: ${row.doctor_wallet}`);
        console.log(`   Patient: ${row.patient_wallet}`);
        console.log(`   Active: ${row.is_active}`);
        console.log(`   Granted: ${row.granted_at}`);
        console.log(`   Revoked: ${row.revoked_at || 'N/A'}`);
        console.log('   ' + '-'.repeat(70));
      });
    }
    
    // Also check what the doctor query would return
    console.log('\n🔍 Testing doctor patient query...\n');
    
    const doctorWallet = '0xa8117eb413edb55fa7d3d683d141c617131c0dea';
    console.log(`Looking for patients of doctor: ${doctorWallet}\n`);
    
    const patients = await query(
      `SELECT DISTINCT 
        u.hh_number as patient_hh_number,
        pp.full_name,
        pp.blood_group,
        pp.gender,
        u.wallet_address,
        u.email,
        dpa.granted_at
       FROM doctor_patient_access dpa
       JOIN users u ON dpa.patient_wallet = u.wallet_address
       LEFT JOIN patient_profiles pp ON u.hh_number = pp.hh_number
       WHERE dpa.doctor_wallet = $1 AND dpa.is_active = true
       ORDER BY dpa.granted_at DESC`,
      [doctorWallet]
    );
    
    if (patients.rows.length === 0) {
      console.log('❌ Query returned no patients!');
      console.log('\nPossible reasons:');
      console.log('1. No active grants in doctor_patient_access table');
      console.log('2. Wallet address mismatch (case sensitivity)');
      console.log('3. Patient not in users table');
    } else {
      console.log(`✅ Query found ${patients.rows.length} patient(s):\n`);
      patients.rows.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.full_name} (HH: ${patient.patient_hh_number})`);
        console.log(`   Blood Group: ${patient.blood_group}`);
        console.log(`   Email: ${patient.email}`);
        console.log(`   Granted: ${patient.granted_at}`);
        console.log('   ' + '-'.repeat(70));
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkAccess();
