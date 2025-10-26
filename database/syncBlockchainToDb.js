const { ethers } = require('ethers');
require('dotenv').config();
const db = require('../services/databaseService');

const contractABI = require('../artifacts/contracts/HealthLedger.sol/HealthLedger.json').abi;

async function syncPatientToDatabase(hhNumber) {
  console.log(`\n🔄 Syncing patient HH: ${hhNumber} from blockchain to database...`);
  
  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Get patient from blockchain
    console.log('📡 Fetching from blockchain...');
    const patient = await contract.getPatient(hhNumber);
    
    if (!patient[0]) {
      console.log('❌ Patient not found on blockchain');
      return;
    }

    const patientData = {
      name: patient[0],
      dob: new Date(Number(patient[1]) * 1000).toISOString().split('T')[0],
      gender: patient[2],
      bloodGroup: patient[3],
      homeAddress: patient[4],
      email: patient[5],
      walletAddress: patient[6]
    };

    console.log('✅ Found on blockchain:', patientData.name);

    // Check if already in database
    const existingUser = await db.getUserByWallet(patientData.walletAddress);
    
    if (existingUser) {
      console.log('ℹ️  Already in database');
      return;
    }

    // Create user in database
    console.log('💾 Creating user in database...');
    const user = await db.createUser(
      patientData.walletAddress,
      patientData.email,
      'patient',
      hhNumber
    );

    // Create patient profile
    console.log('💾 Creating patient profile...');
    await db.createPatientProfile({
      userId: user.id,
      hhNumber: hhNumber,
      fullName: patientData.name,
      dateOfBirth: patientData.dob,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      homeAddress: patientData.homeAddress,
      phoneNumber: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      allergies: null,
      chronicConditions: null
    });

    console.log('✅ Successfully synced to database!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Wallet: ${user.wallet_address}`);

  } catch (error) {
    console.error('❌ Error syncing patient:', error.message);
  }
}

async function syncDoctorToDatabase(hhNumber) {
  console.log(`\n🔄 Syncing doctor HH: ${hhNumber} from blockchain to database...`);
  
  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Get doctor from blockchain
    console.log('📡 Fetching from blockchain...');
    const doctor = await contract.getDoctor(hhNumber);
    
    if (!doctor[0]) {
      console.log('❌ Doctor not found on blockchain');
      return;
    }

    const doctorData = {
      name: doctor[0],
      specialization: doctor[1],
      hospital: doctor[2],
      email: doctor[3],
      walletAddress: doctor[4]
    };

    console.log('✅ Found on blockchain:', doctorData.name);

    // Check if already in database
    const existingUser = await db.getUserByWallet(doctorData.walletAddress);
    
    if (existingUser) {
      console.log('ℹ️  Already in database');
      return;
    }

    // Create user in database
    console.log('💾 Creating user in database...');
    const user = await db.createUser(
      doctorData.walletAddress,
      doctorData.email,
      'doctor',
      hhNumber
    );

    // Create doctor profile
    console.log('💾 Creating doctor profile...');
    await db.createDoctorProfile({
      userId: user.id,
      hhNumber: hhNumber,
      fullName: doctorData.name,
      specialization: doctorData.specialization,
      hospital: doctorData.hospital,
      licenseNumber: null,
      yearsOfExperience: null,
      phoneNumber: null
    });

    console.log('✅ Successfully synced to database!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Wallet: ${user.wallet_address}`);

  } catch (error) {
    console.error('❌ Error syncing doctor:', error.message);
  }
}

async function main() {
  console.log('🔄 Blockchain to Database Sync Tool\n');
  console.log('This will sync existing blockchain registrations to the database.\n');

  // Sync your patient account
  await syncPatientToDatabase(123456);

  // Sync your doctor account
  await syncDoctorToDatabase(666666);

  console.log('\n✅ Sync complete!\n');
  console.log('Run "npm run db:view" to verify the data.');
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
