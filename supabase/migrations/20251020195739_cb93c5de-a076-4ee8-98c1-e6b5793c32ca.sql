-- Create contact status enum
CREATE TYPE public.contact_status AS ENUM ('lead', 'customer');

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status contact_status NOT NULL DEFAULT 'lead',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contacts"
  ON public.contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON public.contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();