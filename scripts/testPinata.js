require('dotenv').config();
const pinataService = require('../services/pinataService');
const fs = require('fs');
const path = require('path');

async function testPinata() {
  console.log('🧪 Testing Pinata IPFS Integration\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Connection
    console.log('\n📡 Test 1: Testing Pinata Connection...');
    const isConnected = await pinataService.testConnection();
    
    if (!isConnected) {
      console.error('❌ Pinata connection failed. Please check your API keys in .env file');
      console.log('\nRequired environment variables:');
      console.log('  PINATA_API_KEY=your_api_key');
      console.log('  PINATA_SECRET_KEY=your_secret_key');
      return;
    }

    // Test 2: Upload JSON
    console.log('\n📤 Test 2: Uploading JSON to IPFS...');
    const testData = {
      patientName: 'Test Patient',
      diagnosis: 'Test Diagnosis',
      date: new Date().toISOString(),
      notes: 'This is a test medical record'
    };
    
    const jsonResult = await pinataService.uploadJSON(testData, 'test-medical-record');
    console.log('✅ JSON uploaded successfully!');
    console.log('   CID:', jsonResult.cid);
    console.log('   URL:', jsonResult.url);
    console.log('   Size:', jsonResult.size, 'bytes');

    // Test 3: Retrieve JSON
    console.log('\n📥 Test 3: Retrieving JSON from IPFS...');
    const retrievedData = await pinataService.retrieveJSON(jsonResult.cid);
    console.log('✅ JSON retrieved successfully!');
    console.log('   Data:', JSON.stringify(retrievedData, null, 2));

    // Test 4: Create a test PDF file and upload
    console.log('\n📤 Test 4: Creating and uploading a test PDF file...');
    // Create a simple PDF-like content (for testing purposes)
    const testFileContent = '%PDF-1.4\nTest Medical Report\n\nPatient: Test Patient\nDate: ' + new Date().toISOString() + '\n%%EOF';
    const testFileBuffer = Buffer.from(testFileContent, 'utf-8');
    
    const fileResult = await pinataService.uploadFile(
      testFileBuffer,
      'test-report.pdf',
      {
        patientHHNumber: '123456',
        recordType: 'test',
        description: 'Test file upload'
      }
    );
    
    console.log('✅ File uploaded successfully!');
    console.log('   CID:', fileResult.cid);
    console.log('   URL:', fileResult.url);
    console.log('   File Name:', fileResult.fileName);
    console.log('   File Type:', fileResult.fileType);

    // Test 5: Retrieve file
    console.log('\n📥 Test 5: Retrieving file from IPFS...');
    const retrievedFile = await pinataService.retrieveFile(fileResult.cid);
    console.log('✅ File retrieved successfully!');
    console.log('   Size:', retrievedFile.length, 'bytes');
    console.log('   Content:', retrievedFile.toString('utf-8').substring(0, 100) + '...');

    // Test 6: List pinned files
    console.log('\n📋 Test 6: Listing pinned files...');
    const pinnedFiles = await pinataService.listPinnedFiles(5);
    console.log(`✅ Found ${pinnedFiles.length} pinned files`);
    pinnedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.metadata.name} (${file.ipfs_pin_hash})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Pinata connection: ✅');
    console.log('   - JSON upload/retrieval: ✅');
    console.log('   - File upload/retrieval: ✅');
    console.log('   - List pinned files: ✅');
    console.log('\n🎉 Your Pinata IPFS integration is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run tests
if (require.main === module) {
  testPinata();
}

module.exports = { testPinata };
