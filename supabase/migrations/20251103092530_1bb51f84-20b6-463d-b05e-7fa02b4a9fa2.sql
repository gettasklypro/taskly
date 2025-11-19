-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_password_reset_tokens_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(user_email);

-- Policy: Anyone can insert reset tokens (used by edge function with service role)
CREATE POLICY "Service role can manage reset tokens"
ON public.password_reset_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);