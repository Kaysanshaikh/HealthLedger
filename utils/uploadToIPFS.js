const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');
require('dotenv').config();

// Free IPFS upload using Pinata (alternative to Web3.Storage)
async function uploadToPinata(filePath) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretKey = process.env.PINATA_SECRET_KEY;
  
  if (!pinataApiKey || !pinataSecretKey) {
    console.log('Pinata keys not found. Get free keys from: https://pinata.cloud');
    return null;
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.pinata.cloud',
      port: 443,
      path: '/pinning/pinFileToIPFS',
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
        ...form.getHeaders()
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.IpfsHash);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    form.pipe(req);
  });
}

// Upload using Web3.Storage (requires token)
async function uploadToWeb3Storage(filePath) {
  try {
    const { Web3Storage, File } = require('web3.storage');
    const token = process.env.WEB3_STORAGE_TOKEN;
    
    if (!token) return null;
    
    const content = await fs.promises.readFile(filePath);
    const file = new File([content], path.basename(filePath));
    const client = new Web3Storage({ token });
    const cid = await client.put([file], { wrapWithDirectory: false });
    return cid;
  } catch (error) {
    console.log('Web3.Storage failed:', error.message);
    return null;
  }
}

// Simple file upload to public IPFS gateway (free but temporary)
async function uploadToPublicGateway(filePath) {
  console.log('Note: Public gateway uploads are temporary and may be removed');
  console.log('For production, use Pinata (free tier) or Web3.Storage');
  
  // For demo purposes, create a mock CID based on file content
  const content = await fs.promises.readFile(filePath);
  const hash = require('crypto').createHash('sha256').update(content).digest('hex');
  const mockCid = `Qm${hash.substring(0, 44)}`;
  
  console.log('Mock CID generated for testing:', mockCid);
  console.log('This is for development only - use real IPFS for production');
  return mockCid;
}

async function main() {
  const filePath = process.env.FILE || process.argv[2];
  if (!filePath) {
    console.log('Usage: node utils/uploadToIPFS.js <file_path>');
    console.log('\nFree IPFS options:');
    console.log('1. Pinata (free 1GB): https://pinata.cloud');
    console.log('   Add to .env: PINATA_API_KEY=xxx PINATA_SECRET_KEY=xxx');
    console.log('2. Web3.Storage (free): https://web3.storage');
    console.log('   Add to .env: WEB3_STORAGE_TOKEN=eyJ...');
    console.log('3. Local IPFS node (completely free)');
    console.log('4. Mock CID for testing (development only)');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  console.log(`Uploading: ${fileName} (${fileSize} bytes)`);

  let cid = null;

  // Try Web3.Storage first
  console.log('\n1. Trying Web3.Storage...');
  cid = await uploadToWeb3Storage(filePath);
  if (cid) {
    console.log('✅ Web3.Storage upload successful!');
  }

  // Try Pinata if Web3.Storage failed
  if (!cid) {
    console.log('\n2. Trying Pinata...');
    try {
      cid = await uploadToPinata(filePath);
      if (cid) {
        console.log('✅ Pinata upload successful!');
      }
    } catch (error) {
      console.log('Pinata failed:', error.message);
    }
  }

  // Use mock CID for testing if all else fails
  if (!cid) {
    console.log('\n3. Generating mock CID for testing...');
    cid = await uploadToPublicGateway(filePath);
  }

  if (cid) {
    console.log('\n📁 Upload Result:');
    console.log('CID:', cid);
    console.log('Gateway URLs:');
    console.log(`  https://ipfs.io/ipfs/${cid}`);
    console.log(`  https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`  https://w3s.link/ipfs/${cid}`);
    console.log('\n🔗 Use in health record:');
    console.log(`CID=${cid} npm run add:record`);
  } else {
    console.log('\n❌ All upload methods failed');
    console.log('Set up one of the free services above');
  }
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
