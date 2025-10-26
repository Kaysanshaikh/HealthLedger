# 📦 Pinata IPFS Integration Guide

## Overview

HealthLedger now uses **Pinata IPFS** for decentralized storage of medical records and documents. This allows secure, permanent storage of medical files with blockchain-verified references.

## 🎯 Supported File Types

- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG
- **Maximum Size**: 1MB per file

## 🔧 Setup

### 1. Get Pinata API Keys

1. Sign up at [https://pinata.cloud](https://pinata.cloud) (Free 1GB storage)
2. Go to **Account → API Keys**
3. Click **New Key**
4. Give it a name (e.g., "HealthLedger")
5. Enable permissions: `pinFileToIPFS`, `pinJSONToIPFS`
6. Copy your **API Key** and **Secret Key**

### 2. Configure Environment Variables

Add to your `.env` file:

```env
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

### 3. Install Dependencies

```bash
npm install
```

This will install:
- `multer` - File upload handling
- `form-data` - Multipart form data
- `axios` - HTTP client (already installed)

### 4. Test Connection

```bash
node scripts/testPinata.js
```

You should see:
```
✅ Pinata connection successful
✅ All tests passed successfully!
```

## 📡 API Endpoints

### Upload Medical Record File

**POST** `/api/records/upload`

Upload a medical record file (PDF, DOC, DOCX, JPG, JPEG, PNG) up to 1MB.

**Request:**
```http
POST /api/records/upload
Content-Type: multipart/form-data

Form Data:
- file: [File] (required)
- patientHHNumber: string (required)
- recordType: string (optional, default: 'medical-record')
- description: string (optional)
- uploaderHHNumber: string (optional)
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/records/upload \
  -F "file=@/path/to/medical-report.pdf" \
  -F "patientHHNumber=555555" \
  -F "recordType=lab-report" \
  -F "description=Blood test results"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('patientHHNumber', '555555');
formData.append('recordType', 'lab-report');
formData.append('description', 'Blood test results');

const response = await fetch('http://localhost:5000/api/records/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload result:', result);
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "recordId": "record-555555-1729567890123",
  "ipfs": {
    "cid": "QmXYZ123...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXYZ123...",
    "size": 245678
  },
  "blockchain": {
    "txHash": "0xabc123...",
    "status": 1
  }
}
```

### Retrieve Medical Record File

**GET** `/api/records/file/:cid`

Retrieve a medical record file from IPFS using its CID.

**Request:**
```http
GET /api/records/file/QmXYZ123...
```

**Response:**
- Returns the actual file with appropriate Content-Type header
- Can be displayed in browser or downloaded

**Example:**
```javascript
// Display PDF in browser
const fileUrl = `http://localhost:5000/api/records/file/${cid}`;
window.open(fileUrl, '_blank');

// Or embed in iframe
<iframe src={`http://localhost:5000/api/records/file/${cid}`} />
```

### Get File URL

**GET** `/api/records/file/:cid/url`

Get the public IPFS gateway URL for a file.

**Request:**
```http
GET /api/records/file/QmXYZ123.../url
```

**Response:**
```json
{
  "success": true,
  "cid": "QmXYZ123...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXYZ123...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXYZ123..."
}
```

## 💻 Frontend Integration

### React File Upload Component

```jsx
import React, { useState } from 'react';
import client from '../api/client';

function MedicalRecordUpload({ patientHHNumber }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file size (1MB)
    if (selectedFile && selectedFile.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientHHNumber', patientHHNumber);
      formData.append('recordType', 'medical-record');
      formData.append('description', 'Medical record uploaded by patient');

      const response = await client.post('/records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      setFile(null);
      alert('File uploaded successfully!');
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload Medical Record</h3>
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {file && (
        <div className="file-info">
          <p>Selected: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
      
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>
      
      {result && (
        <div className="success">
          <h4>Upload Successful!</h4>
          <p>Record ID: {result.recordId}</p>
          <p>IPFS CID: {result.ipfs.cid}</p>
          <a href={result.ipfs.url} target="_blank" rel="noopener noreferrer">
            View on IPFS
          </a>
        </div>
      )}
    </div>
  );
}

export default MedicalRecordUpload;
```

### Display Medical Record

```jsx
function MedicalRecordViewer({ cid, fileName }) {
  const fileUrl = `http://localhost:5000/api/records/file/${cid}`;
  
  // Determine file type
  const isPDF = fileName?.endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png)$/i.test(fileName);
  
  return (
    <div className="record-viewer">
      {isPDF && (
        <iframe
          src={fileUrl}
          width="100%"
          height="600px"
          title="Medical Record"
        />
      )}
      
      {isImage && (
        <img
          src={fileUrl}
          alt="Medical Record"
          style={{ maxWidth: '100%' }}
        />
      )}
      
      <a href={fileUrl} download={fileName} className="download-btn">
        Download {fileName}
      </a>
    </div>
  );
}
```

## 🔒 Security Features

1. **File Size Limit**: Maximum 1MB to prevent abuse
2. **File Type Validation**: Only medical-related file types allowed
3. **Blockchain Verification**: Every upload is recorded on blockchain
4. **Access Control**: Files linked to patient records with access permissions
5. **Immutable Storage**: Files on IPFS cannot be modified or deleted

## 📊 Data Flow

```
┌─────────────┐
│   User      │
│  Uploads    │
│   File      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Multer         │
│  Validates:     │
│  - Size (1MB)   │
│  - Type         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Pinata IPFS    │
│  Returns CID    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Blockchain     │
│  Stores CID +   │
│  Metadata       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Database       │
│  Indexes for    │
│  Fast Search    │
└─────────────────┘
```

## 🧪 Testing

### Test Pinata Connection
```bash
node scripts/testPinata.js
```

### Test File Upload via API
```bash
# Create a test file
echo "Test medical record" > test-record.txt

# Upload it
curl -X POST http://localhost:5000/api/records/upload \
  -F "file=@test-record.txt" \
  -F "patientHHNumber=555555" \
  -F "recordType=test"
```

### Test File Retrieval
```bash
# Get file URL
curl http://localhost:5000/api/records/file/QmXYZ.../url

# Download file
curl http://localhost:5000/api/records/file/QmXYZ... -o downloaded-file.pdf
```

## 📝 Record Types

Suggested record types for categorization:

- `lab-report` - Laboratory test results
- `x-ray` - X-ray images
- `mri-scan` - MRI scan images
- `prescription` - Doctor prescriptions
- `consultation-notes` - Doctor consultation notes
- `discharge-summary` - Hospital discharge summaries
- `vaccination-record` - Vaccination certificates
- `medical-certificate` - Medical certificates
- `insurance-claim` - Insurance claim documents

## 🚨 Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No file uploaded" | File not included in request | Add file to FormData |
| "File size exceeds 1MB limit" | File too large | Compress or resize file |
| "Invalid file type" | Unsupported format | Use PDF, DOC, DOCX, JPG, or PNG |
| "Failed to upload to IPFS" | Pinata API error | Check API keys and connection |
| "Patient not found" | Invalid HH Number | Verify patient is registered |

## 🎯 Best Practices

1. **Compress Files**: Optimize PDFs and images before upload
2. **Use Descriptive Names**: Name files clearly (e.g., "blood-test-2024-10-21.pdf")
3. **Add Descriptions**: Include meaningful descriptions for searchability
4. **Verify Uploads**: Always check the returned CID and blockchain transaction
5. **Store CIDs**: Save IPFS CIDs in your application for future retrieval

## 📚 Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Multer Documentation](https://github.com/expressjs/multer)

## 🆘 Support

If you encounter issues:

1. Check Pinata API keys in `.env`
2. Run `node scripts/testPinata.js` to verify connection
3. Check server logs for detailed error messages
4. Verify file size and type requirements
5. Ensure blockchain node is running

---

**Last Updated**: October 2024
**Version**: 1.0.0
