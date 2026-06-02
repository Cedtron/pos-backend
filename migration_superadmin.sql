-- ─────────────────────────────────────────────────────────────────────────────
-- Gula Nang — Migration: Super-Admin Dashboard
-- Run once against your MySQL database.
-- ─────────────────────────────────────────────────────────────────────────────

-- Add is_active column to companydetails_tb (shop on/off switch)
ALTER TABLE companydetails_tb
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- All existing shops default to active
UPDATE companydetails_tb SET is_active = 1 WHERE is_active IS NULL;
