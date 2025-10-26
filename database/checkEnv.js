require('dotenv').config();

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'PGHOST',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask password
    const displayValue = varName === 'PGPASSWORD' 
      ? '*'.repeat(value.length) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All required environment variables are set!');
  console.log('\nNext steps:');
  console.log('1. Make sure your Neon database is active');
  console.log('2. Check if your IP is allowed in Neon dashboard');
  console.log('3. Try running: npm run db:test');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('\nPlease add them to your .env file:');
  console.log('PGHOST=\'ep-gentle-silence-advwxzzc-pooler.c-2.us-east-1.aws.neon.tech\'');
  console.log('PGDATABASE=\'neondb\'');
  console.log('PGUSER=\'neondb_owner\'');
  console.log('PGPASSWORD=\'your_actual_password_here\'');
}
