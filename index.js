const express = require('express');
const setupMiddleware = require('./conn/conn');
const configureEnvironment = require('./conn/config');
const pool = require('./conn/db');
const createTables = require('./conn/createTables');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes        = require('./auth/controller');
const productRoutes     = require('./products/controller');
const signupRoutes      = require('./user/controller');
const forgotRoutes      = require('./forgot/controller');
const logRoutes         = require('./activity/controller');
const salesRoutes       = require('./sales/controller');
const expenseRoutes     = require('./expense_cate/controller');
const expendRoutes      = require('./expenditure/controller');
const categoryRoutes    = require('./category/controller');
const categoriesRoutes  = require('./categories/controller');
const customerRoutes    = require('./customer/controller');
const orderRoutes       = require('./order/controller');
const shopRoutes        = require('./shop/controller');
const stockRoutes       = require('./stock/controller');
const supplierRoutes    = require('./supplier/controller');
const unitRoutes        = require('./unit/controller');
const displayRoutes     = require('./display/controller');
const deliveryRoutes    = require('./delivery/controller');
const alertRoutes       = require('./alerts/controller');
const ecommerceRoutes   = require('./ecommerce/controller');
const subscribeRoutes   = require('./subscribe/controller');
const subcribeRoutes    = require('./subcribe/controller');
const superadminRoutes  = require('./superadmin/controller');
const itemRoutes        = require('./items/controller');

const app  = express();
const port = process.env.PORT || 4000;

// ─── Bootstrap ────────────────────────────────────────────────────────────────
configureEnvironment();
setupMiddleware(app);
createTables();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', signupRoutes);
app.use('/api', forgotRoutes);
app.use('/api', shopRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', customerRoutes);
app.use('/api', supplierRoutes);
app.use('/api', unitRoutes);
app.use('/api', salesRoutes);
app.use('/api', stockRoutes);
app.use('/api', orderRoutes);
app.use('/api', expendRoutes);
app.use('/api', expenseRoutes);
app.use('/api', logRoutes);
app.use('/api', displayRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', alertRoutes);
app.use('/api', ecommerceRoutes);
app.use('/api', subscribeRoutes);
app.use('/api', subcribeRoutes);
app.use('/api', superadminRoutes);
app.use('/api', itemRoutes);

// ─── DB error handling ────────────────────────────────────────────────────────
pool.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    pool.getConnection((connErr, connection) => {
      if (connErr) {
        console.error('Error reconnecting to the database:', connErr);
        process.exit(1);
      }
      console.log('Reconnected to the database');
      connection.release();
    });
  } else {
    throw err;
  }
});

// ─── DB connection check ──────────────────────────────────────────────────────
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to the database');
  connection.release();
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
