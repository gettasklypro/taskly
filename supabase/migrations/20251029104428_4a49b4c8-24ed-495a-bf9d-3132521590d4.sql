-- Add plan_type column to profiles table
ALTER TABLE profiles ADD COLUMN plan_type text DEFAULT 'basic';

-- Add a check constraint to ensure only valid plan types
ALTER TABLE profiles ADD CONSTRAINT valid_plan_type CHECK (plan_type IN ('basic', 'pro'));