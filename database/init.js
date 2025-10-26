/**
 * HealthLedger Database Initialization Script
 * 
 * This script creates all necessary tables, indexes, and functions
 * for the HealthLedger application.
 * 
 * Usage: node database/init.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  console.log('\n🚀 HealthLedger Database Initialization\n');
  console.log('=' .repeat(60));
  
  try {
    // Test connection
    console.log('\n📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('🔨 Creating tables and indexes...');
    await pool.query(schema);
    console.log('✅ All tables and indexes created successfully\n');

    // Verify tables
    console.log('🔍 Verifying table creation...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`\n✅ Found ${result.rows.length} tables:`);
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('=' .repeat(60));
    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Start Hardhat node: npx hardhat node');
    console.log('  2. Deploy contract: npx hardhat run scripts/deploy.js --network localhost');
    console.log('  3. Start backend: npm run dev:api');
    console.log('  4. Start frontend: cd frontend && npm run dev\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('  1. DATABASE_URL is correct in .env file');
    console.error('  2. Database server is running');
    console.error('  3. You have necessary permissions\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
