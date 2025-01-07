const pool = require('./db');

const createCategoryNameTable = `
  CREATE TABLE IF NOT EXISTS category_name_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createCategoryTable = `
  CREATE TABLE IF NOT EXISTS category_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createCompanyDetailsTable = `
  CREATE TABLE IF NOT EXISTS companydetails_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    shop_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50),
    logo TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    currency VARCHAR(20)
  
  )
`;

const createCustomerTable = `
  CREATE TABLE IF NOT EXISTS customer_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    image TEXT,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createExpendCategoryTable = `
  CREATE TABLE IF NOT EXISTS expendcategory_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createExpenseTable = `
  CREATE TABLE IF NOT EXISTS expense_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(20) NOT NULL,
    Reason VARCHAR(50) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Date DATE NOT NULL,
    Description VARCHAR(100) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createLogsTable = `
  CREATE TABLE IF NOT EXISTS logs_tb (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    username VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    log_date DATETIME NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createOrderTable = `
  CREATE TABLE IF NOT EXISTS order_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(50) NOT NULL,
    Product VARCHAR(50) NOT NULL,
    Unit VARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    Status INT NOT NULL,
    StandardAmount DECIMAL(10, 2) NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Date DATE NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createProductsTable = `
 CREATE TABLE IF NOT EXISTS products_tb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RegNo VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  costprice DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  unit INT NOT NULL,
  color VARCHAR(50),
  expdate DATE,
  brand VARCHAR(100),
  category VARCHAR(100),
  sub_category VARCHAR(100),
  bar_code TEXT,
  location VARCHAR(25),
  shop_code VARCHAR(50) NOT NULL,
   images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(shop_code)
);
`;

const createSalesTable = `
  CREATE TABLE IF NOT EXISTS sales_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(50) NOT NULL,
    Product TEXT,
    Unit VARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    StandardAmount DECIMAL(10, 2) NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
     Taxes DECIMAL(10, 2) NOT NULL,
    Date DATE NOT NULL,
    user VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createStockTable = `
  CREATE TABLE IF NOT EXISTS stock_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    product_code VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(255),
    reason VARCHAR(255),
    user VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createSuppliersTable = `
  CREATE TABLE IF NOT EXISTS suppliers_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    contact_person VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`; 

const createUnitTable = `
  CREATE TABLE IF NOT EXISTS unit_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(10) NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Email VARCHAR(50),
    image TEXT,
    Password VARCHAR(250) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    passhint VARCHAR(255),
    DOR DATE NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;

const createRegTracker=`
CREATE TABLE regno_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL UNIQUE,
    last_regno VARCHAR(10) NOT NULL
);`
  
const createDisplayTable = `
  CREATE TABLE IF NOT EXISTS display_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(50) NOT NULL,
    user VARCHAR(50) NOT NULL,
    nav VARCHAR(200) ,
    screen VARCHAR(200),
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )
`;
const createSubscriptionTable = `
  CREATE TABLE IF NOT EXISTS subscription_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    subscription_code VARCHAR(50) NOT NULL UNIQUE, -- Unique subscription code
    subscription_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    INDEX(shop_code),
    INDEX(subscription_code) -- Index for faster lookups
  )
`;

const createSubscriptionLogTable = `
  CREATE TABLE IF NOT EXISTS subscription_log_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL, 
    action VARCHAR(50) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_data JSON,
    new_data JSON,
    shop_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscription_tb(id),
    INDEX(shop_code)
  )
`;

const insertSampleSignupData = `
INSERT INTO users_tb (RegNo, Name, Email, image, Password, Status, Role, passhint, DOR, shop_code) 
VALUES ('R001', 'John Doe', 'johndoe@gmail.com', 'path/to/image.jpg', 'password123', 'active', 'admin', 'dog', '2024-06-24', 'SHOP001')
`;

function createTables() {
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    try {
      const tables = [
        { name: 'category_name_tb', createQuery: createCategoryNameTable },
        { name: 'category_tb', createQuery: createCategoryTable },
        { name: 'companydetails_tb', createQuery: createCompanyDetailsTable },
        { name: 'customer_tb', createQuery: createCustomerTable },
        { name: 'expendcategory_tb', createQuery: createExpendCategoryTable },
        { name: 'expense_tb', createQuery: createExpenseTable },
        { name: 'logs_tb', createQuery: createLogsTable },
        { name: 'order_tb', createQuery: createOrderTable },
        { name: 'products_tb', createQuery: createProductsTable },
        { name: 'sales_tb', createQuery: createSalesTable },
        { name: 'stock_tb', createQuery: createStockTable },
        { name: 'suppliers_tb', createQuery: createSuppliersTable },
        { name: 'unit_tb', createQuery: createUnitTable },
        { name: 'users_tb', createQuery: createUsersTable },
        { name: 'display_tb', createQuery: createDisplayTable },
        { name: 'subscription_tb', createQuery: createSubscriptionTable },
        { name: 'subscription_log_tb', createQuery: createSubscriptionLogTable },
        { name: 'regno_tracker', createQuery: createRegTracker }
      ];

      for (const table of tables) {
        const tableExists = await new Promise((resolve, reject) => {
          connection.query(`SHOW TABLES LIKE '${table.name}'`, (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
          });
        });

        if (!tableExists) {
          await new Promise((resolve, reject) => {
            connection.query(table.createQuery, (err) => {
              if (err) return reject(err);
              console.log(`${table.name} table created`);
              resolve();
            });
          });

          if (table.name === 'users_tb') {
            await new Promise((resolve, reject) => {
              connection.query(insertSampleSignupData, (err) => {
                if (err) return reject(err);
                console.log('Sample data inserted into users_tb table');
                resolve();
              });
            });
          }
        } else {
         //console.log(`${table.name} table already exists`);
        }
      }
    } catch (error) {
      console.error('Error creating tables or inserting sample data:', error);
    } finally {
      connection.release();
    }
  });
}

module.exports = createTables;