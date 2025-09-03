const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var required');

  const recordIdInput = process.env.RECORD_ID || process.argv[2] || 'patient-001';
  const cid = process.env.NEW_CID || process.argv[3] || 'QmUpdatedHash456';
  const meta = process.env.NEW_META || process.argv[4] || 'updated-health-record';

  if (!recordIdInput || !cid) {
    console.log('Usage: Set in .env file or pass as arguments:');
    console.log('RECORD_ID=<id|0xbytes32> NEW_CID=<ipfs_cid> [NEW_META=<string>]');
    console.log('Current values:');
    console.log('  RECORD_ID:', recordIdInput);
    console.log('  NEW_CID:', cid);
    console.log('  NEW_META:', meta);
    process.exit(1);
  }

  const recordId = recordIdInput.startsWith('0x') && recordIdInput.length === 66
    ? recordIdInput
    : ethers.id(recordIdInput);

  console.log('Updating record:');
  console.log('  Record ID:', recordIdInput, '->', recordId);
  console.log('  New CID:', cid);
  console.log('  New Meta:', meta);

  const hl = await ethers.getContractAt('HealthLedger', contractAddress);
  const tx = await hl.updateRecord(recordId, cid, meta);
  console.log('Sent tx:', tx.hash);
  await tx.wait();
  console.log('Record updated successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
