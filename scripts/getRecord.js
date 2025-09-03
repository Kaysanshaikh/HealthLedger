const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var required');

  const recordIdInput = process.env.RECORD_ID || process.argv[2] || 'patient-001';
  if (!recordIdInput) {
    console.log('Usage: Set RECORD_ID in .env file or pass as argument');
    console.log('Current RECORD_ID:', recordIdInput);
    process.exit(1);
  }
  
  const recordId = recordIdInput.startsWith('0x') && recordIdInput.length === 66
    ? recordIdInput
    : ethers.id(recordIdInput);

  console.log('Reading record:');
  console.log('  Record ID:', recordIdInput, '->', recordId);

  const hl = await ethers.getContractAt('HealthLedger', contractAddress);
  const [patient, createdBy, cid, meta, createdAt] = await hl.getRecord(recordId);
  
  console.log('\nRecord found:');
  console.log(JSON.stringify({ 
    recordId, 
    patient, 
    createdBy, 
    cid, 
    meta, 
    createdAt: Number(createdAt),
    createdDate: new Date(Number(createdAt) * 1000).toISOString()
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
