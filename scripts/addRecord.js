const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var required');

  const recordIdInput = process.env.RECORD_ID || process.argv[2] || 'patient-001';
  const patient = process.env.PATIENT || process.env.PATIENT_ADDRESS || process.argv[3] || process.env.ADMIN_ADDRESS;
  const cid = process.env.CID || process.argv[4] || 'QmTestHash123';
  const meta = process.env.META || process.argv[5] || 'test-record';

  if (!recordIdInput || !patient || !cid) {
    console.log('Usage: Set in .env file or pass as arguments:');
    console.log('RECORD_ID=<id> PATIENT=<address> CID=<ipfs_cid> [META=<string>]');
    console.log('Or: hardhat run scripts/addRecord.js --network polygonAmoy');
    console.log('Current values:');
    console.log('  RECORD_ID:', recordIdInput);
    console.log('  PATIENT:', patient);
    console.log('  CID:', cid);
    console.log('  META:', meta);
    process.exit(1);
  }

  const recordId = recordIdInput.startsWith('0x') && recordIdInput.length === 66
    ? recordIdInput
    : ethers.id(recordIdInput);

  console.log('Creating record with:');
  console.log('  Record ID:', recordIdInput, '->', recordId);
  console.log('  Patient:', patient);
  console.log('  CID:', cid);
  console.log('  Meta:', meta);

  const hl = await ethers.getContractAt('HealthLedger', contractAddress);
  const tx = await hl.createRecord(recordId, patient, cid, meta);
  console.log('Sent tx:', tx.hash);
  const rec = await tx.wait();
  console.log('Mined in block', rec.blockNumber);
  console.log('Record created successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
