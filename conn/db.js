const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Database configuration
let dbConfig;

if (process.env.DB_URL) {
  // Parse the online DB URL (production)
  const dbUrl = new URL(process.env.DB_URL);

  dbConfig = {
    connectionLimit: 10,
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    port: dbUrl.port,
    ssl: { rejectUnauthorized: true }
  };
} else {
  // Local development configuration
  dbConfig = {
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'baala'
  };
}

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool
module.exports = pool;
