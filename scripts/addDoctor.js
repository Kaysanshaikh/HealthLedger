const { ethers } = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const doctor = process.env.DOCTOR || process.env.DOCTOR_ADDRESS || process.argv[2];
  if (!contractAddress || !doctor) {
    console.log('Usage: CONTRACT_ADDRESS=0x... DOCTOR=0xDoctor npx hardhat run scripts/addDoctor.js --network polygonAmoy');
    console.log('Or set CONTRACT_ADDRESS and DOCTOR_ADDRESS in .env file');
    process.exit(1);
  }
  const hl = await ethers.getContractAt('HealthLedger', contractAddress);
  const tx = await hl.addDoctor(doctor);
  console.log('Sent tx:', tx.hash);
  await tx.wait();
  console.log('Doctor added:', doctor);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
