# HealthLedger Testing Guide

## ✅ PRE-DEPLOYMENT CHECKLIST

Before testing, ensure you have:

1. **Installed all dependencies**:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

2. **Setup database**:
   - Create Neon PostgreSQL database
   - Add `DATABASE_URL` to `.env`
   - Run: `node database/init.js`

3. **Setup Pinata IPFS**:
   - Get API keys from pinata.cloud
   - Add `PINATA_API_KEY` and `PINATA_SECRET_KEY` to `.env`

4. **Compiled and deployed smart contract**:
   ```bash
   # Terminal 1: Start local blockchain
   npx hardhat node
   
   # Terminal 2: Deploy contract
   npx hardhat run scripts/deploy.js --network localhost
   ```
   📝 Copy the contract address to `.env`

5. **Started backend server**:
   ```bash
   npm run dev:api
   ```
   Should show: "HealthLedger API listening on port 5001"

6. **Started frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Should show: "Local: http://localhost:3000"

## 🧪 TESTING STEPS

### Test 1: Database Connection
1. Run database test:
   ```bash
   npm run db:test
   ```
2. ✅ Should show: "Database connection successful"
3. ❌ If error, check `DATABASE_URL` in `.env`

### Test 2: Pinata IPFS Connection
1. Run Pinata test:
   ```bash
   node scripts/testPinata.js
   ```
2. ✅ Should show: "Pinata connection successful"
3. ❌ If error, check Pinata API keys in `.env`

### Test 3: MetaMask Connection
1. Open browser to `http://localhost:3000/patient_registration`
2. Open browser console (F12)
3. MetaMask should auto-connect
4. ✅ If wallet address is shown in form, MetaMask is connected
5. ❌ If error "Please connect your MetaMask wallet", install MetaMask

### Test 4: Patient Registration
1. Go to `http://localhost:3000/patient_registration`
2. Fill all fields:
   - Name: "Test Patient"
   - Date of Birth: "1990-01-01"
   - Gender: "Male"
   - Blood Group: "O+"
   - Email: "patient@test.com"
   - HH Number: "111111"
   - Wallet Address: (auto-fills from MetaMask)
3. Click "Register"
4. ✅ Success: Redirects to login page
5. ❌ Error: Check console and backend logs

### Test 5: Doctor Registration
1. Go to `http://localhost:3000/doctor_registration`
2. Fill in all fields:
   - Name: "Dr. Test"
   - Specialization: "Cardiology"
   - Hospital: "Test Hospital"
   - Email: "doctor@test.com"
   - HH Number: "222222"
   - License Number: "MED12345"
3. Click "Register"
4. ✅ Success: Redirects to login

### Test 6: Diagnostic Center Registration
1. Go to `http://localhost:3000/diagnostic_registration`
2. Fill in all fields:
   - Center Name: "Test Diagnostics"
   - Location: "Test City"
   - Email: "diagnostic@test.com"
   - HH Number: "444444"
3. Click "Register"
4. ✅ Success: Redirects to login

### Test 7: Patient Login
1. Go to `http://localhost:3000/patient_login`
2. Enter HH Number: "111111"
3. Click "Login"
4. MetaMask will pop up - sign the message
5. ✅ Should redirect to patient dashboard

### Test 8: Create Diagnostic Report
1. Login as diagnostic center (HH: 444444)
2. Go to "Create Report"
3. Fill in:
   - Patient HH Number: "111111"
   - Test Name: "Blood Test"
   - Test Type: "Lab"
   - Results: "Normal"
4. Optionally upload a file (PDF, max 1MB)
5. Click "Create Report"
6. ✅ Success: Report created and visible in "My Reports"

### Test 9: View Patient Records
1. Login as patient (HH: 111111)
2. Go to "View Records"
3. ✅ Should see the diagnostic report created in Test 8

### Test 10: Grant Doctor Access
1. Login as patient (HH: 111111)
2. Go to "Manage Access"
3. Enter Doctor HH Number: "222222"
4. Click "Grant Access"
5. ✅ Doctor should appear in granted list

### Test 11: Doctor Views Patient Records
1. Login as doctor (HH: 222222)
2. Go to "Patient List"
3. ✅ Should see patient 111111
4. Click "View Records"
5. ✅ Should see patient's medical records

## 🐛 COMMON ISSUES & FIXES

### Issue: "Database connection failed"
**Fix:**
1. Check `DATABASE_URL` in `.env`
2. Ensure Neon database is active
3. Run `node database/init.js` to create tables
4. Check network connection

### Issue: "Failed to register"
**Check:**
1. Is backend running? (port 5001)
2. Is Hardhat node running?
3. Is contract deployed?
4. Check backend console for errors
5. Check browser console for detailed error

### Issue: "MetaMask not connecting"
**Fix:**
1. Install MetaMask extension
2. Create/import wallet
3. Add Hardhat network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH
4. Import test account from Hardhat node
5. Refresh page

### Issue: "Transaction failed"
**Check:**
1. Is Hardhat node running?
2. Do you have ETH in your test wallet?
3. Is the contract address correct in .env?
4. Check Hardhat node console for errors

### Issue: "Network error"
**Fix:**
1. Check if backend is on port 5001
2. Check frontend API client points to http://localhost:5001/api
3. Restart both servers
4. Check CORS settings

### Issue: "File upload failed"
**Fix:**
1. Check file size (max 1MB)
2. Check file type (PDF, DOC, DOCX, JPG, PNG only)
3. Verify Pinata API keys in `.env`
4. Check Pinata account quota

### Issue: "Duplicate records appearing"
**Fix:**
- This has been fixed in the latest version
- Pull latest changes from GitHub
- Restart backend server

### Issue: "Diagnostic reports not showing"
**Fix:**
- This has been fixed in the latest version
- Ensure you're logged in with correct diagnostic center HH number
- Check backend logs for query errors

## 📊 SUCCESS CRITERIA

✅ Database connection test passes
✅ Pinata IPFS connection test passes
✅ MetaMask connects automatically on registration pages
✅ All three user types can register successfully
✅ Login works with MetaMask signature for all roles
✅ Patient can view their medical records
✅ Diagnostic center can create and view reports
✅ Doctor can view patient records (with permission)
✅ Patient can grant/revoke doctor access
✅ File upload to IPFS works correctly
✅ No duplicate records appear
✅ Search functionality works
✅ Notifications are created and displayed

## 🔍 DEBUGGING COMMANDS

**Check if backend is running:**
```bash
curl http://localhost:5001/api/health
```
Should return: `{"status":"ok"}`

**Test database connection:**
```bash
npm run db:test
```

**View all database data:**
```bash
npm run db:view
```

**Test Pinata connection:**
```bash
node scripts/testPinata.js
```

**Check Hardhat node:**
- Hardhat terminal shows all transactions
- Check for transaction errors

**View backend logs:**
- Backend terminal shows all API requests
- Look for error messages and stack traces

**View frontend logs:**
- Browser console (F12) shows all frontend errors
- Network tab shows API requests/responses

**Check contract deployment:**
```bash
npx hardhat console --network localhost
```
Then in console:
```javascript
const contract = await ethers.getContractAt("HealthLedger", "YOUR_CONTRACT_ADDRESS");
await contract.name(); // Should return contract name
```

---

**Last Updated**: October 2024  
**Version**: 2.0.0
