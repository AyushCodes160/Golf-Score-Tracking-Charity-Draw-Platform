-- ============================================================
-- SEED FILE: Test Accounts for Assignment Evaluation
-- Run this AFTER creating the test accounts on the live site.
-- Replace the emails below with your actual test account emails.
-- ============================================================

-- 1. Activate subscription for both test accounts
UPDATE profiles 
SET subscription_status = 'active'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user@gmail.com', 'admin@gmail.com')
);

-- 2. Grant admin privileges to the admin test account
UPDATE profiles 
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@gmail.com'
);
