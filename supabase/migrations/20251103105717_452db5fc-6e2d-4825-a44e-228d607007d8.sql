-- Add trial_end_date to profiles table
ALTER TABLE public.profiles
ADD COLUMN trial_end_date timestamp with time zone;

-- Add index for efficient queries
CREATE INDEX idx_profiles_trial_end_date ON public.profiles(trial_end_date);

COMMENT ON COLUMN public.profiles.trial_end_date IS 'The date when the user trial period ends';