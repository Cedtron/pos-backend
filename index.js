const express = require('express');
const setupMiddleware = require('./conn/conn');
const authRoutes = require('./auth/controller');
const configureEnvironment = require('./conn/config');

const productRoutes = require('./products/controller');
const signupRoutes = require('./user/controller');
const forgotRoutes = require('./forgot/controller');
const timeRoutes = require('./activity/controller');
const salesRoutes = require('./sales/controller');
const expenseRoutes = require('./expenditure/controller');
const itemRoutes = require('./items/controller');
const categoryRoutes = require('./category/controller');
// Import more route files as needed...
const pool = require('./conn/db');
const createTables = require('./conn/createTables');

const app = express();
const port = process.env.PORT || 3000;

// Configure environment variables
configureEnvironment();

// Setup middleware
setupMiddleware(app);
// Create tables on application startup
createTables();

// Use routes
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', signupRoutes);
app.use('/api', timeRoutes);
app.use('/api', salesRoutes);
app.use('/api', expenseRoutes);
app.use('/api', itemRoutes);
app.use('/api', authRoutes);
app.use('/api', forgotRoutes);
// Mount more routes as needed...

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Handle database errors

pool.on('error', (err) => {
  console.error("Database error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // Reconnect if the connection to the database is lost
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error reconnecting to the database:", err);
        process.exit(1);
      }
      console.log("Reconnected to the database");
    });
  } else {
    throw err;
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
