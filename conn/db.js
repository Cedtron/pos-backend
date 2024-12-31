const mysql = require('mysql');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Database configuration
let dbConfig;

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

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool
module.exports = {
  pool,
  initializeSQLite,
  saveToSQLite,
  syncSQLiteToMySQL,
  attemptMySQLConnection
};

// Function to initialize SQLite database
function initializeSQLite() {
  const dbFile = path.join(__dirname, 'offline.db');
  const exists = fs.existsSync(dbFile);

  const sqliteDb = new sqlite3.Database(dbFile);

  sqliteDb.serialize(() => {
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT
    )`);
  });

  return sqliteDb;
}

// Function to save data to SQLite
function saveToSQLite(data) {
  const sqliteDb = initializeSQLite();

  sqliteDb.serialize(() => {
    const stmt = sqliteDb.prepare("INSERT INTO data (content) VALUES (?)");
    stmt.run(data); 
    stmt.finalize();
  });

  sqliteDb.close();
  console.log('Data saved to SQLite:', data);
}
 
// Function to sync data from SQLite to MySQL
function syncSQLiteToMySQL() {
  const sqliteDb = initializeSQLite();

  sqliteDb.serialize(() => {
    sqliteDb.all("SELECT * FROM data", (err, rows) => {
      if (err) {
        console.error('Failed to retrieve data from SQLite:', err);
        return;
      }

      rows.forEach(row => {
        pool.query("INSERT INTO data (content) VALUES (?)", [row.content], (err) => {
          if (err) {
            console.error('Failed to insert data into MySQL:', err);
          } else {
            sqliteDb.run("DELETE FROM data WHERE id = ?", [row.id]);
            console.log('Data synced to MySQL and deleted from SQLite:', row.content);
          }
        });
      });
    });
  });

  sqliteDb.close();
}

// Function to attempt MySQL connection
function attemptMySQLConnection() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Failed to connect to MySQL:', err);
      console.log('Switching to SQLite...');
    } else {
      console.log('Connected to MySQL');
      syncSQLiteToMySQL();
      connection.release(); 
    }
  });
}