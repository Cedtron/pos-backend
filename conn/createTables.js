const pool = require('./db');

// SQL queries to create tables
const createCategoryTable = `CREATE TABLE IF NOT EXISTS category_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(50) NOT NULL,
  Name VARCHAR(50) NOT NULL
)`;

const createExpenseTable = `CREATE TABLE IF NOT EXISTS expense_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(20) NOT NULL,
  Reason VARCHAR(50) NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  Date DATE NOT NULL,
  Description VARCHAR(100) NOT NULL
)`; 

const createItemsTable = `CREATE TABLE IF NOT EXISTS items_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(50) NOT NULL,
  Name VARCHAR(50) NOT NULL,
  Category_id INT NOT NULL,
  FOREIGN KEY (Category_id) REFERENCES category_tb(id)
)`;

const createProductsTable = `CREATE TABLE IF NOT EXISTS products_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  brand VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  costprice DECIMAL(10, 2) NOT NULL,
  color VARCHAR(255) NOT NULL,
  expdate DATE NOT NULL,
  stock INT NOT NULL,
  rating DECIMAL(3, 2),
  images JSON,
  category_id INT,
  properties JSON,
  FOREIGN KEY (category_id) REFERENCES category_tb(id)
)`;

const createSalesTable = `CREATE TABLE IF NOT EXISTS sales_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(50) NOT NULL,
  Product VARCHAR(50) NOT NULL,
  Unit VARCHAR(50) NOT NULL,
  Quantity INT NOT NULL,
  StandardAmount DECIMAL(10, 2) NOT NULL,
  TotalAmount DECIMAL(10, 2) NOT NULL,
  Date DATE NOT NULL
)`;

const createSignupTable = `CREATE TABLE IF NOT EXISTS signup_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(10) NOT NULL,
  Name VARCHAR(50) NOT NULL,
  Username VARCHAR(50) NOT NULL,
  Password VARCHAR(50) NOT NULL,
  Status VARCHAR(50) NOT NULL,
  Role VARCHAR(20) NOT NULL,
  passhint VARCHAR(255),
  DOR DATE NOT NULL
)`;

const createTimeTable = `CREATE TABLE IF NOT EXISTS time_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL,
  Time VARCHAR(50) NOT NULL
)`;

// Function to create tables
function createTables() {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    // Execute each query
    connection.query(createCategoryTable, (err) => {
      if (err) throw err;
      console.log('Category table created');
    });

    connection.query(createExpenseTable, (err) => {
      if (err) throw err;
      console.log('Expense table created');
    });

    connection.query(createItemsTable, (err) => {
      if (err) throw err;
      console.log('Items table created');
    });

    connection.query(createProductsTable, (err) => {
      if (err) throw err;
      console.log('Products table created');
    });

    connection.query(createSalesTable, (err) => {
      if (err) throw err;
      console.log('Sales table created');
    });

    connection.query(createSignupTable, (err) => {
      if (err) throw err;
      console.log('Signup table created');
    });

    connection.query(createTimeTable, (err) => {
      if (err) throw err;
      console.log('Time table created');
    });

    // Release the connection
    connection.release();
       
        callback(null);
  });
}

// Call the function to create tables
module.exports = createTables;

