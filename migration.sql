-- ─────────────────────────────────────────────────────────────────────────────
-- Gula Nang — Migration: Add branding columns to companydetails_tb
-- Run this ONCE against your MySQL database before deploying the new backend.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Accent / brand color
ALTER TABLE companydetails_tb
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#6a5af9';

-- 2. Short tagline (optional)
ALTER TABLE companydetails_tb
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(255) DEFAULT NULL;

-- 3. Business type
ALTER TABLE companydetails_tb
  ADD COLUMN IF NOT EXISTS business_type VARCHAR(100) DEFAULT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- If your MySQL version doesn't support ADD COLUMN IF NOT EXISTS (<8.0),
-- use these instead (safe to run even if columns already exist — they'll error
-- only if the column is already there, which is harmless):
-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER TABLE companydetails_tb ADD COLUMN color VARCHAR(20) DEFAULT '#6a5af9';
-- ALTER TABLE companydetails_tb ADD COLUMN tagline VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE companydetails_tb ADD COLUMN business_type VARCHAR(100) DEFAULT NULL;
