const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Database configuration
const dbConfig = {
  connectionLimit: 10, // number of connections
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'baala'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool
module.exports = pool;
