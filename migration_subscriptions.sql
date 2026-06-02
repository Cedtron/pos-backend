-- ─────────────────────────────────────────────────────────────────────────────
-- Gula Nang — Migration: Subscription System
-- Run once against your MySQL database.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Plans (defined by super-admin, price editable from admin panel)
CREATE TABLE IF NOT EXISTS plans_tb (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50)     NOT NULL UNIQUE,   -- 'free', 'pro', 'enterprise'
  display_name  VARCHAR(100)    NOT NULL,           -- 'Free', 'Pro', 'Enterprise'
  price         DECIMAL(10,2)   NOT NULL DEFAULT 0, -- monthly price
  currency      VARCHAR(10)     NOT NULL DEFAULT 'UGX',
  duration_days INT             NOT NULL DEFAULT 30, -- billing cycle in days
  description   TEXT,
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Features per plan (which feature keys each plan unlocks)
CREATE TABLE IF NOT EXISTS plan_features_tb (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  plan_id     INT           NOT NULL,
  feature_key VARCHAR(100)  NOT NULL,  -- e.g. 'pos', 'reports', 'delivery', 'ecommerce'
  UNIQUE KEY uq_plan_feature (plan_id, feature_key),
  FOREIGN KEY (plan_id) REFERENCES plans_tb(id) ON DELETE CASCADE
);

-- 3. Shop subscriptions (which plan a shop is currently on)
CREATE TABLE IF NOT EXISTS shop_subscriptions_tb (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  shop_code         VARCHAR(50)   NOT NULL UNIQUE,
  plan_id           INT           NOT NULL,
  status            ENUM('active','expired','cancelled','trial') NOT NULL DEFAULT 'trial',
  started_at        DATE          NOT NULL,
  expires_at        DATE          NOT NULL,
  payment_ref       VARCHAR(100),  -- external payment reference if needed
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans_tb(id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: default plans
-- ─────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO plans_tb (name, display_name, price, currency, duration_days, description) VALUES
('free',       'Free',       0,      'UGX', 30,  'Basic POS and inventory for small shops.'),
('pro',        'Pro',        49000,  'UGX', 30,  'Full POS, reports, delivery, and e-commerce.'),
('enterprise', 'Enterprise', 149000, 'UGX', 30,  'Everything in Pro plus multi-user, API access, and priority support.');

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: features per plan
-- free  = id 1 | pro = id 2 | enterprise = id 3
-- ─────────────────────────────────────────────────────────────────────────────

-- Free features
INSERT IGNORE INTO plan_features_tb (plan_id, feature_key)
SELECT id, feature FROM plans_tb
CROSS JOIN (
  SELECT 'dashboard'  AS feature UNION ALL
  SELECT 'pos'                   UNION ALL
  SELECT 'products'              UNION ALL
  SELECT 'categories'            UNION ALL
  SELECT 'customers'
) f WHERE plans_tb.name = 'free';

-- Pro features (everything in free + more)
INSERT IGNORE INTO plan_features_tb (plan_id, feature_key)
SELECT id, feature FROM plans_tb
CROSS JOIN (
  SELECT 'dashboard'    AS feature UNION ALL
  SELECT 'pos'                     UNION ALL
  SELECT 'products'                UNION ALL
  SELECT 'categories'              UNION ALL
  SELECT 'customers'               UNION ALL
  SELECT 'reports'                 UNION ALL
  SELECT 'sales'                   UNION ALL
  SELECT 'suppliers'               UNION ALL
  SELECT 'delivery'                UNION ALL
  SELECT 'expenditure'             UNION ALL
  SELECT 'barcode'                 UNION ALL
  SELECT 'profit'                  UNION ALL
  SELECT 'stock'
) f WHERE plans_tb.name = 'pro';

-- Enterprise features (everything)
INSERT IGNORE INTO plan_features_tb (plan_id, feature_key)
SELECT id, feature FROM plans_tb
CROSS JOIN (
  SELECT 'dashboard'    AS feature UNION ALL
  SELECT 'pos'                     UNION ALL
  SELECT 'products'                UNION ALL
  SELECT 'categories'              UNION ALL
  SELECT 'customers'               UNION ALL
  SELECT 'reports'                 UNION ALL
  SELECT 'sales'                   UNION ALL
  SELECT 'suppliers'               UNION ALL
  SELECT 'delivery'                UNION ALL
  SELECT 'expenditure'             UNION ALL
  SELECT 'barcode'                 UNION ALL
  SELECT 'profit'                  UNION ALL
  SELECT 'stock'                   UNION ALL
  SELECT 'ecommerce'               UNION ALL
  SELECT 'multi_user'              UNION ALL
  SELECT 'api_access'              UNION ALL
  SELECT 'activity_logs'           UNION ALL
  SELECT 'data_export'
) f WHERE plans_tb.name = 'enterprise';

-- ─────────────────────────────────────────────────────────────────────────────
-- Put all existing shops on the Free plan (trial, 30 days)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO shop_subscriptions_tb (shop_code, plan_id, status, started_at, expires_at)
SELECT
  c.shop_code,
  (SELECT id FROM plans_tb WHERE name = 'free'),
  'trial',
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM companydetails_tb c;
