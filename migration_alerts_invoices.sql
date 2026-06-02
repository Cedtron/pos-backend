-- ─────────────────────────────────────────────────────────────────────────────
-- Gula Nang — Migration: Low Stock Alerts + Invoice Settings
-- Run once against your MySQL database.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add low_stock_threshold to products (default 5 units)
ALTER TABLE products_tb
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5;

-- 2. Add invoice settings to companydetails_tb
ALTER TABLE companydetails_tb
  ADD COLUMN IF NOT EXISTS invoice_note    TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS invoice_footer  VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS show_tax        TINYINT(1)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS tax_label       VARCHAR(50)  DEFAULT 'VAT';
