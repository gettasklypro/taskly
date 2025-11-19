-- Add missing columns to contacts table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS lead_source text,
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_contact_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_follow_up_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_media_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS payment_terms text;

-- Create contact_custom_fields table
CREATE TABLE IF NOT EXISTS public.contact_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_value text,
  field_type text DEFAULT 'text', -- text, number, date, boolean, dropdown
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create contact_persons table (additional contacts per client)
CREATE TABLE IF NOT EXISTS public.contact_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  role text, -- 'primary', 'billing', 'technical', 'other'
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create contact_activities table (interaction log)
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
  subject text,
  description text,
  activity_date timestamp with time zone NOT NULL DEFAULT now(),
  duration_minutes integer,
  outcome text,
  follow_up_required boolean DEFAULT false,
  follow_up_date timestamp with time zone,
  created_by_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create contact_communication_settings table
CREATE TABLE IF NOT EXISTS public.contact_communication_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  whatsapp_enabled boolean DEFAULT false,
  preferred_contact_method text DEFAULT 'email', -- 'email', 'phone', 'sms', 'whatsapp'
  contact_frequency text, -- 'weekly', 'monthly', 'quarterly', 'as_needed'
  do_not_contact boolean DEFAULT false,
  marketing_emails boolean DEFAULT true,
  transactional_emails boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contact_id)
);

-- Create contact_relationships table
CREATE TABLE IF NOT EXISTS public.contact_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  related_contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  relationship_type text NOT NULL, -- 'parent_company', 'subsidiary', 'partner', 'referral'
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK (contact_id != related_contact_id)
);

-- Enable RLS on new tables
ALTER TABLE public.contact_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_communication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_custom_fields
CREATE POLICY "Users can view their own contact custom fields"
ON public.contact_custom_fields FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact custom fields"
ON public.contact_custom_fields FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact custom fields"
ON public.contact_custom_fields FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact custom fields"
ON public.contact_custom_fields FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for contact_persons
CREATE POLICY "Users can view their own contact persons"
ON public.contact_persons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact persons"
ON public.contact_persons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact persons"
ON public.contact_persons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact persons"
ON public.contact_persons FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for contact_activities
CREATE POLICY "Users can view their own contact activities"
ON public.contact_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact activities"
ON public.contact_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact activities"
ON public.contact_activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact activities"
ON public.contact_activities FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for contact_communication_settings
CREATE POLICY "Users can view their own contact communication settings"
ON public.contact_communication_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact communication settings"
ON public.contact_communication_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact communication settings"
ON public.contact_communication_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact communication settings"
ON public.contact_communication_settings FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for contact_relationships
CREATE POLICY "Users can view their own contact relationships"
ON public.contact_relationships FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact relationships"
ON public.contact_relationships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact relationships"
ON public.contact_relationships FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact relationships"
ON public.contact_relationships FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_custom_fields_contact_id ON public.contact_custom_fields(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_persons_contact_id ON public.contact_persons(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_date ON public.contact_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_contact_communication_settings_contact_id ON public.contact_communication_settings(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_relationships_contact_id ON public.contact_relationships(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_relationships_related_contact_id ON public.contact_relationships(related_contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON public.contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_source ON public.contacts(lead_source);
CREATE INDEX IF NOT EXISTS idx_contacts_next_follow_up_date ON public.contacts(next_follow_up_date);

-- Add triggers for updated_at columns
CREATE TRIGGER update_contact_custom_fields_updated_at
BEFORE UPDATE ON public.contact_custom_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_persons_updated_at
BEFORE UPDATE ON public.contact_persons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_activities_updated_at
BEFORE UPDATE ON public.contact_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_communication_settings_updated_at
BEFORE UPDATE ON public.contact_communication_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_relationships_updated_at
BEFORE UPDATE ON public.contact_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();