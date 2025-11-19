-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  trade TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  business_type TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads"
  ON public.leads
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads"
  ON public.leads
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;