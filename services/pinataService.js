const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

class PinataService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.secretKey = process.env.PINATA_SECRET_KEY;
    this.baseUrl = 'https://api.pinata.cloud';
    this.gatewayUrl =
      process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

    if (!this.apiKey || !this.secretKey) {
      console.warn('⚠️ Missing Pinata API credentials in environment variables');
    }
  }

  /** ✅ Test Pinata connection */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/data/testAuthentication`, {
        headers: {
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
      });
      console.log('✅ Pinata connection successful');
      return response.data;
    } catch (error) {
      console.error(
        '❌ Pinata connection failed:',
        error.response?.data || error.message
      );
      throw new Error('Failed to connect to Pinata');
    }
  }

  /** 📤 Upload a file buffer to Pinata */
  async uploadFile(fileBuffer, fileName, metadata = {}) {
    try {
      // Validate size (max 1MB)
      const fileSizeMB = fileBuffer.length / (1024 * 1024);
      if (fileSizeMB > 1) {
        throw new Error(`File size ${fileSizeMB.toFixed(2)}MB exceeds 1MB limit`);
      }

      // Validate file type
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const ext = path.extname(fileName).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file type ${ext}. Allowed: ${allowedExtensions.join(', ')}`
        );
      }

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: this.getContentType(ext),
      });

      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: fileName,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            fileType: ext,
            ...metadata,
          },
        })
      );

      formData.append(
        'pinataOptions',
        JSON.stringify({ cidVersion: 1 })
      );

      console.log(`📦 Uploading file to Pinata: ${fileName}`);

      const response = await axios.post(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      const cid = response.data.IpfsHash;
      const url = `${this.gatewayUrl}/${cid}`;

      console.log(`✅ Uploaded: ${fileName} → ${url}`);

      return {
        success: true,
        cid,
        size: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url,
        fileName,
        fileType: ext,
      };
    } catch (error) {
      console.error('❌ Pinata upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  /** 📄 Upload JSON data to Pinata */
  async uploadJSON(jsonData, name = 'data.json') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: jsonData,
          pinataMetadata: {
            name,
            keyvalues: { uploadedAt: new Date().toISOString(), type: 'json' },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      const cid = response.data.IpfsHash;
      return {
        success: true,
        cid,
        url: `${this.gatewayUrl}/${cid}`,
      };
    } catch (error) {
      console.error('❌ JSON upload failed:', error.response?.data || error.message);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  /** 📥 Retrieve file from IPFS */
  async retrieveFile(cid) {
    const gateways = [
      this.gatewayUrl,
      'https://ipfs.io/ipfs',
      'https://cloudflare-ipfs.com/ipfs',
      'https://dweb.link/ipfs',
    ];

    for (const gateway of gateways) {
      try {
        const url = `${gateway}/${cid}`;
        console.log(`📥 Trying ${url}`);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
      } catch (error) {
        console.warn(`⚠️ Gateway failed: ${gateway}`);
      }
    }

    throw new Error(`Failed to retrieve file for CID ${cid}`);
  }

  /** 🔗 Get public file URL */
  getFileUrl(cid) {
    return `${this.gatewayUrl}/${cid}`;
  }

  /** 🧰 MIME type mapper */
  getContentType(ext) {
    const map = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return map[ext] || 'application/octet-stream';
  }
}

module.exports = new PinataService();
