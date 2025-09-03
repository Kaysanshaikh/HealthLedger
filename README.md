# HealthLedger - Blockchain Health Records with IPFS

A decentralized health record management system built on Polygon blockchain with IPFS storage for secure, transparent, and patient-controlled medical data.

## 🏥 Features

- **Blockchain Security**: Immutable health records on Polygon Amoy testnet
- **IPFS Storage**: Decentralized file storage for medical documents
- **Role-Based Access**: Admin, Doctor, and Patient permissions
- **Access Control**: Grant/revoke permissions per record
- **Windows Compatible**: All scripts work with PowerShell
- **Free IPFS Options**: Multiple free storage providers

## 📋 Prerequisites

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **MetaMask**: Browser extension for wallet management
- **Test MATIC**: Free tokens from Polygon Amoy faucet

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd healthledger-ipfs
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your details:
```env
# Required: Polygon Amoy RPC (get free from getblock.io)
POLYGON_AMOY_RPC=https://go.getblock.io/<YOUR_TOKEN>/amoy

# Required: Your wallet private key (keep secret!)
PRIVATE_KEY=0x<your_private_key>

# Optional: Admin address (defaults to deployer)
ADMIN_ADDRESS=0x<your_admin_address>

# Will be filled after deployment
CONTRACT_ADDRESS=0x<deployed_contract_address>

# For testing doctor functionality
DOCTOR_ADDRESS=0x<doctor_wallet_address>

# Optional: For IPFS uploads (choose one)
WEB3_STORAGE_TOKEN=eyJ...                    # Free from web3.storage
PINATA_API_KEY=your_key                      # Free 1GB from pinata.cloud
PINATA_SECRET_KEY=your_secret

# For record creation
RECORD_ID=patient-001
PATIENT_ADDRESS=0x<patient_wallet>
CID=QmTestHash123
META=test-health-record
```

### 3. Get Test MATIC

Your deployer wallet needs test MATIC for gas fees:

1. **Find your wallet address** in MetaMask
2. **Visit faucet**: https://faucet.polygon.technology/
3. **Request test MATIC** for Polygon Amoy
4. **Alternative faucets**:
   - https://www.alchemy.com/faucets/polygon-amoy
   - https://cloud.google.com/application/web3/faucet/polygon

### 4. Deploy Contract

```bash
npm run compile
npm run deploy:amoy
```

**Copy the printed contract address** to your `.env` file:
```env
CONTRACT_ADDRESS=0x<deployed_address_from_output>
```

## 📖 Usage Guide

### Admin Operations

**Add a doctor:**
```bash
npm run add:doctor
```

**Grant admin role** (if needed):
```bash
npx hardhat run scripts/addDoctor.js --network polygonAmoy
```

### Health Record Management

**Create a health record:**
```bash
npm run add:record
```

**Read a health record:**
```bash
npm run get:record
```

**Update a health record:**
```bash
npx hardhat run scripts/updateRecord.js --network polygonAmoy
```

### Access Control

**Grant access to a doctor:**
```bash
npm run grant:access
```

**Revoke access:**
```bash
npx hardhat run scripts/revokeAccess.js --network polygonAmoy
```

### IPFS File Upload

**Upload health documents to IPFS:**

1. **Create a test file:**
```bash
echo "Patient: John Doe, Age: 45, Diagnosis: Hypertension" > health-record.txt
```

2. **Upload to IPFS:**
```bash
node utils/uploadToIPFS.js health-record.txt
```

3. **Use the returned CID in records:**
```bash
# Update .env with the real CID
CID=bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
npm run add:record
```

## 🔧 Advanced Commands

### Using Environment Variables (Windows PowerShell)

```powershell
# Set variables and run command
$env:RECORD_ID="patient-002"; $env:PATIENT="0x123..."; $env:CID="QmABC..."; npm run add:record

# Or pass as arguments
npx hardhat run scripts/addRecord.js --network polygonAmoy -- patient-002 0x123... QmABC...
```

### Direct Script Execution

```bash
# Add doctor with specific address
CONTRACT_ADDRESS=0x123... DOCTOR=0xABC... npx hardhat run scripts/addDoctor.js --network polygonAmoy

# Create record with custom data
RECORD_ID=emergency-001 PATIENT=0x456... CID=QmXYZ... META="emergency-visit" npm run add:record

# Read specific record
RECORD_ID=emergency-001 npm run get:record
```

### Network Testing

```bash
# Test network connectivity
npx hardhat console --network polygonAmoy

# In console, test connection:
await ethers.provider.getBlockNumber()
await ethers.provider.getNetwork()

# Exit with Ctrl+C twice
```

## 🆓 Free IPFS Setup Options

### Option 1: Pinata (Recommended)

1. **Sign up**: https://pinata.cloud (free 1GB)
2. **Get API keys**: Account → API Keys → New Key
3. **Add to .env**:
```env
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
```

### Option 2: Web3.Storage

1. **Sign up**: https://web3.storage (free)
2. **Create token**: Account → Create Token
3. **Add to .env**:
```env
WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option 3: Mock CID (Testing Only)

No setup required - the upload script will generate mock CIDs for testing.

## 🛠️ Troubleshooting

### Common Issues

**❌ "insufficient funds for gas"**
```
Solution: Get test MATIC from Polygon Amoy faucet
Faucets: https://faucet.polygon.technology/
```

**❌ "CONTRACT_ADDRESS env var required"**
```
Solution: Deploy contract first, then add address to .env
Command: npm run deploy:amoy
```

**❌ "Cannot find package 'hardhat'"**
```
Solution: Install dependencies
Command: npm install
```

**❌ PowerShell environment variable errors**
```
Solution: Use .env file instead of command line variables
Or use: $env:VARIABLE="value"; npm run command
```

**❌ "Help us improve Hardhat" prompt stuck**
```
Solution: Answer with 'y' or 'n' and press Enter
Or set: HARDHAT_DISABLE_TELEMETRY_PROMPT=true in .env
```

**❌ Network timeout errors**
```
Solution: Check your POLYGON_AMOY_RPC URL
Get new endpoint from: https://getblock.io/
```

### Script Debugging

**Check your configuration:**
```bash
# Verify .env file
cat .env

# Test network connection
npx hardhat console --network polygonAmoy

# Check contract deployment
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

**Reset and redeploy:**
```bash
# Clean build artifacts
npm run clean

# Recompile
npm run compile

# Deploy fresh contract
npm run deploy:amoy
```

## 📁 Project Structure

```
healthledger-ipfs/
├── contracts/
│   └── HealthLedger.sol          # Smart contract
├── scripts/
│   ├── deploy.js                 # Contract deployment
│   ├── addDoctor.js             # Add doctor role
│   ├── addRecord.js             # Create health record
│   ├── getRecord.js             # Read health record
│   ├── updateRecord.js          # Update health record
│   ├── grantAccess.js           # Grant record access
│   └── revokeAccess.js          # Revoke record access
├── utils/
│   └── uploadToIPFS.js          # IPFS file upload utility
├── .env                         # Environment configuration
├── .env.example                 # Environment template
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔐 Security Notes

- **Never commit `.env`** to version control
- **Keep private keys secure** - use hardware wallets in production
- **Use test networks** for development
- **Verify contract addresses** before mainnet deployment
- **Encrypt sensitive health data** before IPFS upload

## 🌐 Network Information

- **Testnet**: Polygon Amoy (Chain ID: 80002)
- **RPC**: GetBlock.io (free tier available)
- **Faucet**: https://faucet.polygon.technology/
- **Explorer**: https://www.oklink.com/amoy

## 📚 Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Polygon Documentation**: https://docs.polygon.technology/
- **IPFS Documentation**: https://docs.ipfs.tech/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for decentralized healthcare**
