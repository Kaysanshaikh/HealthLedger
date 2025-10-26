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
  .then(() => client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'doctor_patient_access' 
    ORDER BY ordinal_position
  `))
  .then(res => {
    console.log('doctor_patient_access columns:');
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
