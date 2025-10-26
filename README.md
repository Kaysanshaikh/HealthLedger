# HealthLedger - Decentralized Health Records System

A comprehensive blockchain-based health records management system with IPFS storage, PostgreSQL database, and React frontend for secure, transparent, and patient-controlled medical data.

## 🏥 Features

- **Blockchain Security**: Immutable health records on Hardhat local blockchain
- **IPFS Storage**: Decentralized file storage via Pinata for medical documents
- **PostgreSQL Database**: Fast queries and search indexing with Neon serverless database
- **Role-Based Access**: Patient, Doctor, and Diagnostic Center roles
- **React Frontend**: Modern, responsive UI with TailwindCSS and shadcn/ui
- **Access Control**: Patient-controlled permissions for doctors
- **File Upload**: Support for PDF, DOC, DOCX, JPG, PNG (max 1MB)
- **Search & Notifications**: Full-text search and real-time notifications

## 📋 Prerequisites

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **MetaMask**: Browser extension for wallet management
- **PostgreSQL**: Neon serverless database (free tier)
- **Pinata Account**: For IPFS storage (free 1GB)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/kaysanshaikh-ai/HealthLedger-main.git
cd HealthLedger-main
npm install
cd frontend
npm install
cd ..
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your details:
```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Blockchain Configuration
PRIVATE_KEY=0x<your_wallet_private_key>
CONTRACT_ADDRESS=<will_be_filled_after_deployment>

# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# JWT Secret (any random string)
JWT_SECRET=your_random_secret_string

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Setup Database

1. **Create a Neon account**: https://neon.tech (free tier)
2. **Create a new project** and database
3. **Copy the connection string** to your `.env` file
4. **Run database migrations**:
```bash
node database/init.js
```

### 4. Deploy Smart Contract

```bash
# Start local blockchain
npx hardhat node

# In a new terminal, deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

**Copy the printed contract address** to your `.env` file:
```env
CONTRACT_ADDRESS=0x<deployed_address_from_output>
```

### 5. Start the Application

```bash
# Terminal 1: Start backend
npm run dev:api

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api

## 📖 Usage Guide

### User Roles

**1. Patient**
- Register with personal and medical information
- View all medical records
- Grant/revoke access to doctors
- Upload medical documents
- Receive notifications

**2. Doctor**
- Register with professional credentials
- View patient records (with permission)
- Access patient list
- View granted permissions

**3. Diagnostic Center**
- Register diagnostic facility
- Create diagnostic reports for patients
- Upload test results and medical files
- View all created reports

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
HealthLedger-main/
├── contracts/
│   └── HealthLedger.sol          # Smart contract
├── controllers/
│   ├── authController.js         # Authentication logic
│   ├── profileController.js      # Profile management
│   ├── recordsController.js      # Medical records CRUD
│   └── registerController.js     # User registration
├── services/
│   ├── databaseService.js        # Database operations
│   ├── healthLedgerService.js    # Blockchain interactions
│   └── pinataService.js          # IPFS file management
├── routes/
│   ├── auth.js                   # Auth routes
│   ├── profile.js                # Profile routes
│   ├── records.js                # Records routes
│   └── register.js               # Registration routes
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── context/              # Auth context
│   │   └── api/                  # API client
│   └── package.json              # Frontend dependencies
├── database/
│   ├── init.js                   # Database initialization
│   ├── schema.sql                # Database schema
│   └── viewData.js               # Data viewer utility
├── scripts/
│   └── deploy.js                 # Contract deployment
├── .env                          # Environment configuration
├── server.js                     # Express server
└── package.json                  # Backend dependencies
```

## 🔐 Security Notes

- **Never commit `.env`** to version control
- **Keep private keys secure** - use hardware wallets in production
- **Database encryption** - All sensitive data is encrypted
- **Access control** - Patient-controlled permissions
- **Audit logs** - All record access is logged
- **File validation** - Size and type restrictions on uploads
- **JWT authentication** - Secure API endpoints

## 🐛 Recent Bug Fixes (October 2024)

- ✅ Fixed duplicate patient records display issue
- ✅ Resolved diagnostic report duplication when uploading files
- ✅ Corrected database query for fetching diagnostic center reports
- ✅ Improved error handling for blockchain interactions
- ✅ Fixed record deduplication logic in patient view
- ✅ Updated `getRecordsByCreator` to use wallet address matching

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
