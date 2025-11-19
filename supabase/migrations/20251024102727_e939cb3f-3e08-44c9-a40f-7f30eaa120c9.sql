-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS main_goal TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster onboarding checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);