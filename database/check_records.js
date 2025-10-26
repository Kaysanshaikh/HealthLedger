const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Checking record_index table...\n');
    return client.query(`
      SELECT 
        ri.record_id,
        ri.patient_hh_number,
        ri.creator_wallet,
        ri.record_type,
        u.hh_number as creator_hh_from_users,
        u.role as creator_role
      FROM record_index ri
      LEFT JOIN users u ON LOWER(ri.creator_wallet) = LOWER(u.wallet_address)
      ORDER BY ri.created_at DESC
      LIMIT 20
    `);
  })
  .then(res => {
    console.log('Recent records:');
    console.log('================');
    res.rows.forEach(r => {
      console.log(`Record: ${r.record_id}`);
      console.log(`  Patient HH: ${r.patient_hh_number}`);
      console.log(`  Creator Wallet: ${r.creator_wallet}`);
      console.log(`  Creator HH (from users table): ${r.creator_hh_from_users}`);
      console.log(`  Creator Role: ${r.creator_role}`);
      console.log(`  Record Type: ${r.record_type}`);
      console.log('---');
    });
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
