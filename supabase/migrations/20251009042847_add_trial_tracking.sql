/*
  # Add Trial Tracking for Email Addresses

  1. Changes to subscriptions table
    - Add `trial_used` column to track if a trial has been used
    - Add `email_at_signup` column to store the email at subscription creation
    
  2. Security
    - Maintain existing RLS policies
    
  3. Purpose
    - Track trial usage per email address to prevent multiple free trials
    - Store email at time of subscription to prevent trial abuse via email changes
*/

-- Add columns to track trial usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'trial_used'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN trial_used boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'email_at_signup'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN email_at_signup text;
  END IF;
END $$;

-- Create index on email_at_signup for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email_at_signup ON subscriptions(email_at_signup);

-- Update existing subscriptions to mark trial as used (retroactive)
UPDATE subscriptions 
SET trial_used = true
WHERE status IN ('active', 'canceled', 'past_due', 'trialing')
AND trial_used = false;
