const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');

// Search records
router.get('/records', async (req, res) => {
  try {
    const { q, wallet, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    console.log('🔍 Searching records:', { q, wallet, limit });

    const results = await db.searchRecords(q, wallet || null, parseInt(limit) || 50);

    // Log search activity
    if (wallet) {
      await db.logAccess(
        'search',
        wallet,
        'user',
        'search',
        req.ip,
        req.headers['user-agent']
      );
    }

    res.json({ 
      results,
      count: results.length,
      query: q
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all records for a patient
router.get('/patient/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { limit } = req.query;

    console.log('📄 Getting patient records:', wallet);

    const records = await db.getRecordsByPatient(wallet, parseInt(limit) || 50);

    res.json({ 
      records,
      count: records.length,
      patientWallet: wallet
    });
  } catch (error) {
    console.error('❌ Get patient records error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
