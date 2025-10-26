const { pool } = require('../config/database');

async function testConnection() {
  console.log('🔍 Testing Neon Postgres connection...\n');
  
  try {
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Successfully connected to Neon Postgres!');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableCount = parseInt(tablesResult.rows[0].table_count);
    console.log(`\n📊 Found ${tableCount} tables in the database`);
    
    if (tableCount === 0) {
      console.log('\n⚠️  No tables found. Run "npm run db:migrate" to create the schema.');
    } else {
      // List all tables
      const tablesList = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('\n📋 Available tables:');
      tablesList.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    console.log('\n✨ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Check your .env file has correct PGHOST, PGDATABASE, PGUSER, PGPASSWORD');
    console.error('   2. Ensure your Neon database is active');
    console.error('   3. Verify your IP is allowed in Neon dashboard');
    console.error('   4. Check your internet connection');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
