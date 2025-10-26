# 🔄 Blockchain Synchronization Guide

## Overview

HealthLedger uses a **hybrid architecture** where:
- **Blockchain = Source of Truth** for all non-confidential data
- **Database = Fast Query Cache** synchronized from blockchain
- **IPFS = Confidential Medical Data** (only CID stored on blockchain)

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA STORAGE LAYERS                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   BLOCKCHAIN     │         │    DATABASE      │         │      IPFS        │
│  (Polygon Amoy)  │         │   (PostgreSQL)   │         │    (Pinata)      │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ ✅ User Profiles │◄────────│ ✅ Cached Profiles│         │ ✅ Medical Files │
│ ✅ Access Control│   Sync  │ ✅ Fast Queries  │         │ ✅ Reports       │
│ ✅ Record CIDs   │────────►│ ✅ Search Index  │         │ ✅ Images        │
│ ✅ Audit Trail   │         │ ✅ Notifications │         │ ✅ Documents     │
│                  │         │                  │         │                  │
│ ❌ Medical Data  │         │ ❌ Medical Data  │         │ 🔒 Encrypted     │
└──────────────────┘         └──────────────────┘         └──────────────────┘
     Source of Truth              Query Cache              Confidential Data
```

## 🎯 What Gets Stored Where

### Blockchain (Immutable, Public)
- ✅ Patient profiles (name, DOB, blood group, etc.)
- ✅ Doctor profiles (name, specialization, hospital)
- ✅ Diagnostic center profiles
- ✅ Access permissions (who can view what)
- ✅ IPFS CIDs (pointers to medical files)
- ✅ Record metadata (test name, type, date)
- ❌ **NO confidential medical data**

### Database (Fast Cache)
- ✅ Synchronized copy of blockchain data
- ✅ Additional fields (phone numbers, notes)
- ✅ Search indexes for fast queries
- ✅ Notifications
- ✅ Session management
- ❌ **NO confidential medical data**

### IPFS (Encrypted Storage)
- ✅ Medical reports (PDF, DOC, images)
- ✅ Lab results
- ✅ X-rays, MRI scans
- ✅ Prescriptions
- 🔒 **All confidential data**

## 🔄 Synchronization Process

### Automatic Sync (On Registration)
When a user registers, data is automatically:
1. **Stored on blockchain** (source of truth)
2. **Cached in database** (for fast queries)
3. **Linked via HH Number** (unique identifier)

### Manual Sync (When Needed)
If database gets out of sync, you can manually sync:

```bash
# Sync a specific patient
npm run sync:blockchain patient 555555

# Sync a specific doctor
npm run sync:blockchain doctor 112233

# Sync a diagnostic center
npm run sync:blockchain diagnostic 444444

# Sync a medical record
npm run sync:blockchain record record-555555-1234567890

# Full sync (all data)
npm run sync:blockchain full

# Auto-sync (smart sync)
npm run sync:blockchain auto
```

## 📝 Usage Examples

### Example 1: Sync Patient Profile
```bash
npm run sync:blockchain patient 555555
```

**Output:**
```
🔄 Blockchain Sync Tool
============================================================

📋 Syncing patient profile: 555555
🔄 Syncing patient profile from blockchain: 555555
✅ Created user in database for patient 555555
✅ Created patient profile in database for 555555
✅ Patient profile synced successfully

============================================================
✅ Sync operation completed successfully
```

### Example 2: Sync Doctor Profile
```bash
npm run sync:blockchain doctor 112233
```

### Example 3: Full Sync
```bash
npm run sync:blockchain full
```

## 🔧 How It Works

### 1. Registration Flow
```javascript
// User registers
POST /api/register/patient

// Step 1: Store on blockchain (source of truth)
await healthLedgerService.registerPatient(...)

// Step 2: Cache in database (for fast queries)
await db.createUser(...)
await db.createPatientProfile(...)

// Result: Data in both places, blockchain is authoritative
```

### 2. Profile Retrieval Flow
```javascript
// Frontend requests profile
GET /api/profile/patient/555555

// Step 1: Try database first (fast)
const profile = await db.getPatientProfile(555555)

// Step 2: If not found, get from blockchain
if (!profile) {
  const blockchainData = await healthLedgerService.getPatient(555555)
  // Sync to database for next time
  await blockchainSync.syncPatientProfile(555555)
}

// Result: Fast queries with blockchain fallback
```

### 3. Medical Record Flow
```javascript
// Diagnostic center creates report
POST /api/records/diagnostic

// Step 1: Upload file to IPFS (confidential data)
const ipfsCID = await pinataService.uploadFile(file)

// Step 2: Store CID on blockchain (reference only)
await healthLedgerService.createRecord(recordId, patientAddress, ipfsCID, metadata)

// Step 3: Index in database (for search)
await db.indexRecord({ recordId, ipfsCID, metadata, ... })

// Result: Confidential data on IPFS, reference on blockchain, searchable in DB
```

## 🛡️ Security & Privacy

### What's Public (Blockchain)
- ✅ Names and basic info
- ✅ Professional credentials
- ✅ Access permissions
- ✅ IPFS CIDs (pointers, not data)

### What's Private (IPFS)
- 🔒 Medical test results
- 🔒 Diagnoses
- 🔒 Treatment plans
- 🔒 Medical images
- 🔒 Lab reports

### Access Control
- Only authorized users can decrypt IPFS files
- Blockchain tracks who has access
- Database enforces access rules
- All access is logged

## 🔍 Verification

### Check Blockchain Data
```bash
# View on blockchain explorer
https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

# Or use Hardhat scripts
npx hardhat run scripts/getPatient.js --network polygonAmoy
```

### Check Database Data
```bash
# View database contents
npm run db:view

# Check specific profile
node database/viewData.js
```

### Check IPFS Data
```bash
# Test Pinata connection
npm run test:pinata

# View file on IPFS gateway
https://gateway.pinata.cloud/ipfs/YOUR_CID
```

## 🚨 Troubleshooting

### Database Out of Sync
**Problem:** Database shows old data

**Solution:**
```bash
# Sync specific profile
npm run sync:blockchain patient 555555

# Or full sync
npm run sync:blockchain full
```

### Blockchain Data Missing
**Problem:** Profile not found on blockchain

**Solution:**
- User needs to re-register
- Check blockchain connection
- Verify contract address

### IPFS File Not Found
**Problem:** Cannot retrieve medical file

**Solution:**
- Check Pinata API keys
- Verify CID is correct
- Check network connection

## 📊 Monitoring

### Check Sync Status
```javascript
const blockchainSync = require('./services/blockchainSyncService');

// Check if sync is running
console.log('Is syncing:', blockchainSync.isSyncing);

// Check last sync time
console.log('Last sync:', blockchainSync.lastSyncTime);
```

### Automated Sync (Future)
In production, you should:
1. Listen to blockchain events
2. Auto-sync on new registrations
3. Periodic full syncs (daily/weekly)
4. Monitor sync health

## 🎯 Best Practices

1. **Always use blockchain as source of truth**
   - Database is just a cache
   - When in doubt, sync from blockchain

2. **Never store confidential data on blockchain**
   - Use IPFS for medical files
   - Only store CIDs on blockchain

3. **Keep database in sync**
   - Run periodic syncs
   - Sync after major operations
   - Monitor for drift

4. **Verify data integrity**
   - Compare blockchain vs database
   - Check IPFS file availability
   - Audit access logs

## 📚 Related Documentation

- [Database Setup Guide](DATABASE_SETUP.md)
- [Pinata IPFS Guide](PINATA_IPFS_GUIDE.md)
- [Integration Complete Guide](INTEGRATION_COMPLETE.md)

---

**Last Updated**: October 2024  
**Version**: 1.0.0
