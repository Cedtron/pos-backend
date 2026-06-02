-- ─────────────────────────────────────────────────────────────────────────────
-- Gula Nang — Migration: E-Commerce Orders
-- Run once against your MySQL database.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ecom_orders_tb (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  RegNo           VARCHAR(50)   NOT NULL UNIQUE,
  shop_code       VARCHAR(50)   NOT NULL,

  -- Customer info (no account needed)
  customer_name   VARCHAR(100)  NOT NULL,
  customer_email  VARCHAR(150)  NOT NULL,
  customer_phone  VARCHAR(30)   NOT NULL,
  delivery_address TEXT         NOT NULL,
  customer_note   TEXT,

  -- Order totals
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Items: JSON array [{RegNo, title, price, quantity, images}]
  items           JSON          NOT NULL,

  -- Status flow: pending → confirmed → processing → shipped → delivered | cancelled
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled')
                  NOT NULL DEFAULT 'pending',

  payment_method  VARCHAR(50)   DEFAULT 'cash_on_delivery',
  payment_status  ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  payment_ref     VARCHAR(100),

  -- Delivery tracking (links to delivery_tracking table)
  tracking_number VARCHAR(100),

  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX(shop_code),
  INDEX(customer_email),
  INDEX(status)
);
