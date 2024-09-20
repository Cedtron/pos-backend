const express = require('express');
const setupMiddleware = require('./conn/conn');
const authRoutes = require('./auth/controller');
const configureEnvironment = require('./conn/config');

const productRoutes = require('./products/controller');
const signupRoutes = require('./user/controller');
const forgotRoutes = require('./forgot/controller');
const logRoutes = require('./activity/controller');
const salesRoutes = require('./sales/controller');
const expenseRoutes = require('./expense_cate/controller');
const expendRoutes = require('./expenditure/controller');
const categoryRoutes = require('./category/controller');
const categoriesRoutes = require('./categories/controller');
const customerRoutes = require('./customer/controller');
const orderRoutes = require('./order/controller');
const shopRoutes = require('./shop/controller');
const stockRoutes = require('./stock/controller');
const supplierRoutes = require('./supplier/controller');
const unitRoutes = require('./unit/controller');
// Import more route files as needed...
const pool = require('./conn/db');
const createTables = require('./conn/createTables');

const app = express();
const port = process.env.PORT || 4000;

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
app.use('/api', logRoutes);
app.use('/api', salesRoutes);
app.use('/api', expenseRoutes);
app.use('/api', authRoutes);
app.use('/api', forgotRoutes);
app.use('/api', expendRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', customerRoutes);
app.use('/api', orderRoutes);
app.use('/api', shopRoutes);
app.use('/api', stockRoutes);
app.use('/api', supplierRoutes);
app.use('/api', unitRoutes);
// Mount more routes as needed...

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

// Check database connection and log status
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit if connection fails
  } else {
    console.log("Successfully connected to the online database"); // Log success message
    connection.release(); // Release connection back to the pool
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
