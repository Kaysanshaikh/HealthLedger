const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS env var required');

  const recordIdInput = process.env.RECORD_ID || process.argv[2] || 'patient-001';
  const grantee = process.env.GRANTEE || process.env.DOCTOR_ADDRESS || process.argv[3];
  
  if (!recordIdInput || !grantee) {
    console.log('Usage: Set in .env file or pass as arguments:');
    console.log('RECORD_ID=<id|0xbytes32> GRANTEE=<address>');
    console.log('Current values:');
    console.log('  RECORD_ID:', recordIdInput);
    console.log('  GRANTEE:', grantee);
    console.log('  (Using DOCTOR_ADDRESS as default grantee)');
    process.exit(1);
  }

  const recordId = recordIdInput.startsWith('0x') && recordIdInput.length === 66
    ? recordIdInput
    : ethers.id(recordIdInput);

  console.log('Granting access:');
  console.log('  Record ID:', recordIdInput, '->', recordId);
  console.log('  Grantee:', grantee);

  const hl = await ethers.getContractAt('HealthLedger', contractAddress);
  const tx = await hl.grantAccess(recordId, grantee);
  console.log('Sent tx:', tx.hash);
  await tx.wait();
  console.log('Access granted to', grantee);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
