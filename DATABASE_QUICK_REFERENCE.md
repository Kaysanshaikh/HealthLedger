# 🚀 Database Quick Reference

## ✅ Your Database is Working!

Based on the test results, your Neon Postgres database is **fully operational** and storing data correctly.

---

## 📋 Quick Commands

```bash
# View all data in database
npm run db:view

# Test connection only
npm run db:test

# Full functionality test
npm run db:test-full

# Clean up test data
npm run db:cleanup
```

---

## 💻 Code Examples

### 1. Create a User

```javascript
const db = require('./services/databaseService');

const user = await db.createUser(
  '0x1234567890abcdef',  // wallet address
  'patient@example.com',  // email
  'patient',              // role: 'patient', 'doctor', 'diagnostic', 'admin'
  123456789               // HH number
);

console.log('User created:', user.id);
```

### 2. Create Patient Profile

```javascript
const profile = await db.createPatientProfile({
  userId: user.id,
  hhNumber: 123456789,
  fullName: 'John Doe',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  bloodGroup: 'O+',
  homeAddress: '123 Main Street',
  phoneNumber: '+1234567890',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '+0987654321',
  allergies: 'Penicillin',
  chronicConditions: 'None'
});
```

### 3. Index a Blockchain Record

```javascript
// After creating record on blockchain
const tx = await contract.createRecord(recordId, patientAddr, ipfsCid, meta);
await tx.wait();

// Index in database for fast search
await db.indexRecord({
  recordId: recordId,
  patientWallet: patientAddr,
  patientHHNumber: 123456789,
  creatorWallet: doctorAddr,
  ipfsCid: ipfsCid,
  recordType: 'diagnostic',  // or 'prescription', 'consultation', etc.
  metadata: { testName: 'Blood Test', testType: 'CBC' },
  searchableText: 'Blood Test CBC Complete Blood Count',
  blockchainTxHash: tx.hash
});
```

### 4. Search Records

```javascript
// Search all records
const results = await db.searchRecords('blood test');

// Search specific patient's records
const patientResults = await db.searchRecords('blood test', '0x1234...');

console.log('Found', results.length, 'records');
```

### 5. Get Patient Records

```javascript
// Get all records for a patient
const records = await db.getRecordsByPatient('0x1234567890abcdef');

records.forEach(record => {
  console.log('Record:', record.record_id);
  console.log('IPFS CID:', record.ipfs_cid);
  console.log('Type:', record.record_type);
});
```

### 6. Log Access (Compliance)

```javascript
// Log when someone views a record
await db.logAccess(
  recordId,           // record ID
  doctorWallet,       // who accessed
  'doctor',           // their role
  'view',             // action: 'view', 'create', 'update', 'grant', 'revoke'
  req.ip,             // IP address (optional)
  req.headers['user-agent']  // browser info (optional)
);
```

### 7. Get Access History

```javascript
// Get complete access history for compliance
const logs = await db.getAccessLogs(recordId);

logs.forEach(log => {
  console.log(`${log.accessor_wallet} ${log.action}ed at ${log.accessed_at}`);
});
```

### 8. Create Notification

```javascript
await db.createNotification(
  userWallet,
  'New Record',
  'Doctor added a new diagnostic report',
  'record_created',  // type: 'record_created', 'access_granted', 'access_revoked'
  recordId           // related record (optional)
);
```

### 9. Get User Notifications

```javascript
// Get all notifications
const allNotifs = await db.getNotifications(userWallet);

// Get only unread notifications
const unreadNotifs = await db.getNotifications(userWallet, true);

console.log('Unread:', unreadNotifs.length);
```

### 10. Grant Doctor Access

```javascript
await db.grantDoctorAccess(
  doctorWallet,
  patientWallet,
  patientWallet  // granted by (usually patient)
);
```

---

## 🔄 Complete Workflow Example

### Register Patient & Create Record

```javascript
const db = require('./services/databaseService');
const healthLedger = require('./services/healthLedgerService');

async function registerPatientAndAddRecord(patientData, recordData) {
  try {
    // 1. Register on blockchain
    const tx1 = await healthLedger.registerPatient(
      patientData.name,
      patientData.dob,
      patientData.gender,
      patientData.bloodGroup,
      patientData.address,
      patientData.email,
      patientData.hhNumber,
      patientData.walletAddress
    );
    await tx1.wait();
    
    // 2. Create user in database
    const user = await db.createUser(
      patientData.walletAddress,
      patientData.email,
      'patient',
      patientData.hhNumber
    );
    
    // 3. Create patient profile
    const profile = await db.createPatientProfile({
      userId: user.id,
      hhNumber: patientData.hhNumber,
      fullName: patientData.name,
      dateOfBirth: patientData.dob,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      homeAddress: patientData.address,
      phoneNumber: patientData.phone
    });
    
    // 4. Upload file to IPFS
    const ipfsCid = await uploadToPinata(recordData.file);
    
    // 5. Create record on blockchain
    const recordId = `patient-${patientData.hhNumber}-${Date.now()}`;
    const tx2 = await healthLedger.createRecord(
      recordId,
      patientData.walletAddress,
      ipfsCid,
      JSON.stringify(recordData.metadata)
    );
    await tx2.wait();
    
    // 6. Index in database
    await db.indexRecord({
      recordId,
      patientWallet: patientData.walletAddress,
      patientHHNumber: patientData.hhNumber,
      creatorWallet: recordData.doctorWallet,
      ipfsCid,
      recordType: 'diagnostic',
      metadata: recordData.metadata,
      searchableText: `${recordData.metadata.testName} ${recordData.metadata.testType}`,
      blockchainTxHash: tx2.hash
    });
    
    // 7. Log the creation
    await db.logAccess(
      recordId,
      recordData.doctorWallet,
      'doctor',
      'create'
    );
    
    // 8. Notify patient
    await db.createNotification(
      patientData.walletAddress,
      'New Medical Record',
      'A new diagnostic report has been added to your records',
      'record_created',
      recordId
    );
    
    return {
      success: true,
      user,
      profile,
      recordId,
      txHash: tx2.hash
    };
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 📊 Database Tables Overview

| Table | Purpose | Key Operations |
|-------|---------|----------------|
| `users` | Authentication | `createUser`, `getUserByWallet` |
| `patient_profiles` | Patient info | `createPatientProfile`, `getPatientProfile` |
| `doctor_profiles` | Doctor info | `createDoctorProfile`, `getDoctorProfile` |
| `diagnostic_profiles` | Diagnostic centers | `createDiagnosticProfile` |
| `record_index` | Fast search | `indexRecord`, `searchRecords` |
| `access_logs` | Audit trail | `logAccess`, `getAccessLogs` |
| `doctor_patient_access` | Relationships | `grantDoctorAccess`, `getDoctorPatients` |
| `notifications` | User alerts | `createNotification`, `getNotifications` |
| `sessions` | JWT tokens | (future implementation) |

---

## 🎯 Best Practices

### 1. Always Index Blockchain Records

```javascript
// ✅ Good: Index after blockchain creation
const tx = await contract.createRecord(...);
await tx.wait();
await db.indexRecord({ recordId, ... });

// ❌ Bad: Only blockchain, no search capability
const tx = await contract.createRecord(...);
await tx.wait();
// Missing: database indexing
```

### 2. Always Log Access

```javascript
// ✅ Good: Log every access for compliance
const record = await contract.getRecord(recordId);
await db.logAccess(recordId, userWallet, role, 'view');

// ❌ Bad: No audit trail
const record = await contract.getRecord(recordId);
// Missing: access logging
```

### 3. Use Searchable Text

```javascript
// ✅ Good: Detailed searchable text
searchableText: 'Blood Test CBC Complete Blood Count Hemoglobin WBC RBC'

// ❌ Bad: Minimal text
searchableText: 'Blood Test'
```

### 4. Handle Errors

```javascript
// ✅ Good: Proper error handling
try {
  const user = await db.createUser(...);
  const profile = await db.createPatientProfile(...);
} catch (error) {
  console.error('Database error:', error);
  // Handle error appropriately
}
```

---

## 🔍 Debugging

### Check if Data Exists

```javascript
// Check user exists
const user = await db.getUserByWallet(walletAddress);
if (!user) {
  console.log('User not found');
}

// Check patient profile exists
const profile = await db.getPatientProfile(hhNumber);
if (!profile) {
  console.log('Profile not found');
}
```

### View Raw Database Query

```javascript
const { pool } = require('./config/database');

// Custom query
const result = await pool.query('SELECT * FROM users WHERE role = $1', ['patient']);
console.log('Patients:', result.rows);
```

---

## 📞 Need Help?

- **Full Testing Guide**: `DATABASE_TESTING_GUIDE.md`
- **Setup Instructions**: `DATABASE_SETUP.md`
- **Architecture Overview**: `INTEGRATION_COMPLETE.md`
- **Database Operations**: `database/README.md`

---

## ✅ Verification Checklist

- [x] Database connected
- [x] Tables created (9 tables)
- [x] Can create users
- [x] Can create profiles
- [x] Can index records
- [x] Can search records
- [x] Can log access
- [x] Can create notifications
- [x] Full-text search working

**Your database is production-ready!** 🚀
