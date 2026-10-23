const { Pool } = require('pg');
require('dotenv').config();

const isSsl = process.env.DB_SSL === 'true' || 
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'));

let cleanDatabaseUrl = process.env.DATABASE_URL;
if (cleanDatabaseUrl) {
  // Strip ?sslmode=... or &sslmode=... so pg-connection-string does not force strict CA verification
  cleanDatabaseUrl = cleanDatabaseUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');
}

const poolConfig = cleanDatabaseUrl
  ? {
      connectionString: cleanDatabaseUrl,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      database: process.env.DB_NAME || 'ethio_exam_hall',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
