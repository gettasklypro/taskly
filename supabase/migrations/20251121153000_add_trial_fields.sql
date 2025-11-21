-- Add trial fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_at TIMESTAMPTZ;

-- Update handle_new_user function to set default trial period
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, trial_start_at, trial_end_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$;
