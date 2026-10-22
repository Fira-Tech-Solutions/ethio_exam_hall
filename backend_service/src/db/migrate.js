const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running PostgreSQL migrations for Ethio Exam Hall...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    // Ensure existing databases allow null password_hash for OAuth/Telegram users
    await client.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;');
    console.log('✅ PostgreSQL migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
