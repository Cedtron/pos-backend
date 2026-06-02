const pool = require('./db');

// ─── Core table definitions ───────────────────────────────────────────────────

const createCategoryNameTable = `
  CREATE TABLE IF NOT EXISTS category_name_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

const createCategoryTable = `
  CREATE TABLE IF NOT EXISTS category_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

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
    currency VARCHAR(20),
    color VARCHAR(20) DEFAULT '#6a5af9',
    tagline VARCHAR(255) DEFAULT NULL,
    business_type VARCHAR(100) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    invoice_note TEXT DEFAULT NULL,
    invoice_footer VARCHAR(255) DEFAULT NULL,
    show_tax TINYINT(1) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    tax_label VARCHAR(50) DEFAULT 'VAT'
  )`;

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
  )`;

const createExpendCategoryTable = `
  CREATE TABLE IF NOT EXISTS expendcategory_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

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
  )`;

const createLogsTable = `
  CREATE TABLE IF NOT EXISTS logs_tb (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    username VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    log_date DATETIME NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

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
  )`;

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
    low_stock_threshold INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(shop_code)
  )`;

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
  )`;

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
  )`;

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
  )`;

const createUnitTable = `
  CREATE TABLE IF NOT EXISTS unit_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

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
  )`;

const createRegTracker = `
  CREATE TABLE IF NOT EXISTS regno_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL UNIQUE,
    last_regno VARCHAR(10) NOT NULL
  )`;

const createDisplayTable = `
  CREATE TABLE IF NOT EXISTS display_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(50) NOT NULL,
    user VARCHAR(50) NOT NULL,
    nav VARCHAR(200),
    screen VARCHAR(200),
    shop_code VARCHAR(50) NOT NULL,
    INDEX(shop_code)
  )`;

const createSubscriptionTable = `
  CREATE TABLE IF NOT EXISTS subscription_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    shop_code VARCHAR(50) NOT NULL,
    subscription_code VARCHAR(50) NOT NULL UNIQUE,
    subscription_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    INDEX(shop_code),
    INDEX(subscription_code)
  )`;

const createDeliveryTable = `
  CREATE TABLE IF NOT EXISTS delivery_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    source_regno VARCHAR(50) NOT NULL,
    source_type ENUM('POS', 'E-Commerce') NOT NULL,
    tracking_number VARCHAR(100),
    status ENUM('Processing', 'Packed', 'Shipped', 'Delivered', 'Failed') DEFAULT 'Processing',
    estimated_delivery DATE,
    actual_delivery DATE,
    shop_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(source_regno),
    INDEX(tracking_number)
  )`;

const createItemsTable = `
  CREATE TABLE IF NOT EXISTS items_tb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RegNo VARCHAR(15) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Category_id INT,
    shop_code VARCHAR(50)
  )`;

// ─── Subscription / plan tables ───────────────────────────────────────────────

const createPlansTable = `
  CREATE TABLE IF NOT EXISTS plans_tb (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50)   NOT NULL UNIQUE,
    display_name  VARCHAR(100)  NOT NULL,
    price         DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency      VARCHAR(10)   NOT NULL DEFAULT 'UGX',
    duration_days INT           NOT NULL DEFAULT 30,
    description   TEXT,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;

const createPlanFeaturesTable = `
  CREATE TABLE IF NOT EXISTS plan_features_tb (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    plan_id     INT          NOT NULL,
    feature_key VARCHAR(100) NOT NULL,
    UNIQUE KEY uq_plan_feature (plan_id, feature_key),
    FOREIGN KEY (plan_id) REFERENCES plans_tb(id) ON DELETE CASCADE
  )`;

const createShopSubscriptionsTable = `
  CREATE TABLE IF NOT EXISTS shop_subscriptions_tb (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    shop_code   VARCHAR(50)  NOT NULL UNIQUE,
    plan_id     INT          NOT NULL,
    status      ENUM('active','expired','cancelled','trial') NOT NULL DEFAULT 'trial',
    started_at  DATE         NOT NULL,
    expires_at  DATE         NOT NULL,
    payment_ref VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans_tb(id)
  )`;

const createEcomOrdersTable = `
  CREATE TABLE IF NOT EXISTS ecom_orders_tb (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    RegNo            VARCHAR(50)   NOT NULL UNIQUE,
    shop_code        VARCHAR(50)   NOT NULL,
    customer_name    VARCHAR(100)  NOT NULL,
    customer_email   VARCHAR(150)  NOT NULL,
    customer_phone   VARCHAR(30)   NOT NULL,
    delivery_address TEXT          NOT NULL,
    customer_note    TEXT,
    subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
    total            DECIMAL(10,2) NOT NULL DEFAULT 0,
    items            JSON          NOT NULL,
    status           ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    payment_method   VARCHAR(50)   DEFAULT 'cash_on_delivery',
    payment_status   ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
    payment_ref      VARCHAR(100),
    tracking_number  VARCHAR(100),
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(shop_code),
    INDEX(customer_email),
    INDEX(status)
  )`;

// ─── Seed data ────────────────────────────────────────────────────────────────

const insertSampleSignupData = `
  INSERT INTO users_tb (RegNo, Name, Email, image, Password, Status, Role, passhint, DOR, shop_code)
  VALUES ('R001', 'John Doe', 'johndoe@gmail.com', 'path/to/image.jpg', 'password123', 'active', 'admin', 'dog', '2024-06-24', 'SHOP001')`;

const insertDefaultPlans = `
  INSERT IGNORE INTO plans_tb (name, display_name, price, currency, duration_days, description) VALUES
  ('free',       'Free',       0,      'UGX', 30, 'Basic POS and inventory for small shops.'),
  ('pro',        'Pro',        49000,  'UGX', 30, 'Full POS, reports, delivery, and e-commerce.'),
  ('enterprise', 'Enterprise', 149000, 'UGX', 30, 'Everything in Pro plus multi-user and priority support.')`;

// ─── Column migration helpers (safe ALTER TABLE) ──────────────────────────────

const columnMigrations = [
  // companydetails_tb — branding + admin columns
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#6a5af9'`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS tagline VARCHAR(255) DEFAULT NULL`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS business_type VARCHAR(100) DEFAULT NULL`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS invoice_note TEXT DEFAULT NULL`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS invoice_footer VARCHAR(255) DEFAULT NULL`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS show_tax TINYINT(1) NOT NULL DEFAULT 0`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00`,
  `ALTER TABLE companydetails_tb ADD COLUMN IF NOT EXISTS tax_label VARCHAR(50) DEFAULT 'VAT'`,
  // products_tb — low stock threshold
  `ALTER TABLE products_tb ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5`,
];

// ─── Main createTables function ───────────────────────────────────────────────

function createTables() {
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    const run = (sql) =>
      new Promise((resolve, reject) =>
        connection.query(sql, (err) => (err ? reject(err) : resolve()))
      );

    const tableExists = (name) =>
      new Promise((resolve, reject) =>
        connection.query(`SHOW TABLES LIKE '${name}'`, (err, result) =>
          err ? reject(err) : resolve(result.length > 0)
        )
      );

    try {
      // ── Core tables ──────────────────────────────────────────────────────
      const tables = [
        { name: 'category_name_tb',      sql: createCategoryNameTable },
        { name: 'category_tb',           sql: createCategoryTable },
        { name: 'companydetails_tb',     sql: createCompanyDetailsTable },
        { name: 'customer_tb',           sql: createCustomerTable },
        { name: 'expendcategory_tb',     sql: createExpendCategoryTable },
        { name: 'expense_tb',            sql: createExpenseTable },
        { name: 'logs_tb',               sql: createLogsTable },
        { name: 'order_tb',              sql: createOrderTable },
        { name: 'products_tb',           sql: createProductsTable },
        { name: 'sales_tb',              sql: createSalesTable },
        { name: 'stock_tb',              sql: createStockTable },
        { name: 'suppliers_tb',          sql: createSuppliersTable },
        { name: 'unit_tb',               sql: createUnitTable },
        { name: 'users_tb',              sql: createUsersTable },
        { name: 'display_tb',            sql: createDisplayTable },
        { name: 'subscription_tb',       sql: createSubscriptionTable },
        { name: 'delivery_tracking',     sql: createDeliveryTable },
        { name: 'items_tb',              sql: createItemsTable },
        { name: 'regno_tracker',         sql: createRegTracker },
        // ── Subscription / plan tables (order matters — plans first) ──────
        { name: 'plans_tb',              sql: createPlansTable },
        { name: 'plan_features_tb',      sql: createPlanFeaturesTable },
        { name: 'shop_subscriptions_tb', sql: createShopSubscriptionsTable },
        // ── E-commerce ────────────────────────────────────────────────────
        { name: 'ecom_orders_tb',        sql: createEcomOrdersTable },
      ];

      for (const table of tables) {
        const exists = await tableExists(table.name);
        if (!exists) {
          await run(table.sql);
          console.log(`✔ Created table: ${table.name}`);

          // Seed default data after first creation
          if (table.name === 'users_tb') {
            await run(insertSampleSignupData);
            console.log('  → Sample user inserted into users_tb');
          }
          if (table.name === 'plans_tb') {
            await run(insertDefaultPlans);
            console.log('  → Default plans inserted into plans_tb');
          }
        }
      }

      // ── Column migrations (safe — ADD COLUMN IF NOT EXISTS) ──────────────
      for (const sql of columnMigrations) {
        try {
          await run(sql);
        } catch (colErr) {
          // Older MySQL (<8.0) doesn't support IF NOT EXISTS on ALTER TABLE.
          // Ignore "duplicate column" errors (ER_DUP_FIELDNAME = 1060).
          if (colErr.errno !== 1060) {
            console.warn('Column migration warning:', colErr.message);
          }
        }
      }

      console.log('✔ All tables and columns are up to date.');
    } catch (error) {
      console.error('Error during table creation:', error);
    } finally {
      connection.release();
    }
  });
}

module.exports = createTables;
