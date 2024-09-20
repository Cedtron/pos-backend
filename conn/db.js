const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Database configuration
let dbConfig;

if (process.env.DB_URL) {
  // Parse the online DB URL
  const dbUrl = new URL(process.env.DB_URL);

  dbConfig = {
    connectionLimit: 10, // number of connections
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''), // Extract database name
    port: dbUrl.port,
    ssl: { rejectUnauthorized: true } // Enable SSL for secure connection
  };
} else {
  // Local development configuration
  dbConfig = {
    connectionLimit: 10, // number of connections
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
