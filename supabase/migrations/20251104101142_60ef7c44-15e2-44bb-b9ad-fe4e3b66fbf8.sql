-- Add missing columns to service_requests table
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS scheduled_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS scheduled_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS scheduled_start_time text,
ADD COLUMN IF NOT EXISTS scheduled_end_time text,
ADD COLUMN IF NOT EXISTS schedule_later boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS anytime boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS on_site_assessment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS assessment_instructions text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS email_team boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS team_reminder text DEFAULT 'no-reminder';

-- Add missing columns to quotes table
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating integer,
ADD COLUMN IF NOT EXISTS client_message text,
ADD COLUMN IF NOT EXISTS contract_disclaimer text,
ADD COLUMN IF NOT EXISTS internal_notes text,
ADD COLUMN IF NOT EXISTS link_to_jobs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS link_to_invoices boolean DEFAULT false;

-- Add missing columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS job_number text,
ADD COLUMN IF NOT EXISTS job_type text DEFAULT 'one-off',
ADD COLUMN IF NOT EXISTS total_visits integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS start_time text,
ADD COLUMN IF NOT EXISTS end_time text,
ADD COLUMN IF NOT EXISTS schedule_later boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS anytime boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_team boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS repeat text DEFAULT 'does-not-repeat',
ADD COLUMN IF NOT EXISTS visit_instructions text,
ADD COLUMN IF NOT EXISTS remind_to_invoice boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS split_invoices boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_repeat text,
ADD COLUMN IF NOT EXISTS ends_type text,
ADD COLUMN IF NOT EXISTS ends_after_value text,
ADD COLUMN IF NOT EXISTS ends_after_unit text,
ADD COLUMN IF NOT EXISTS ends_on_date date,
ADD COLUMN IF NOT EXISTS calculated_end_date date,
ADD COLUMN IF NOT EXISTS calculated_total_visits integer,
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Add missing columns to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS issued_date date,
ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposits numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS client_message text,
ADD COLUMN IF NOT EXISTS contract_disclaimer text,
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Create quote_line_items table
CREATE TABLE IF NOT EXISTS public.quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create job_service_items table
CREATE TABLE IF NOT EXISTS public.job_service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create job_payment_schedules table
CREATE TABLE IF NOT EXISTS public.job_payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  due_date date,
  status text DEFAULT 'Upcoming',
  percentage numeric DEFAULT 0,
  description text,
  total numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create attachments table for files/images
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL, -- 'request', 'quote', 'job', 'invoice', 'expense'
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text, -- 'image', 'document', 'receipt'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create team_assignments table
CREATE TABLE IF NOT EXISTS public.team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL, -- 'request', 'job'
  entity_id uuid NOT NULL,
  team_member_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quote_line_items
CREATE POLICY "Users can view their own quote line items"
ON public.quote_line_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quotes
  WHERE quotes.id = quote_line_items.quote_id
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own quote line items"
ON public.quote_line_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quotes
  WHERE quotes.id = quote_line_items.quote_id
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can update their own quote line items"
ON public.quote_line_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.quotes
  WHERE quotes.id = quote_line_items.quote_id
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own quote line items"
ON public.quote_line_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.quotes
  WHERE quotes.id = quote_line_items.quote_id
  AND quotes.user_id = auth.uid()
));

-- RLS Policies for invoice_line_items
CREATE POLICY "Users can view their own invoice line items"
ON public.invoice_line_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.invoices
  WHERE invoices.id = invoice_line_items.invoice_id
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own invoice line items"
ON public.invoice_line_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.invoices
  WHERE invoices.id = invoice_line_items.invoice_id
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can update their own invoice line items"
ON public.invoice_line_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.invoices
  WHERE invoices.id = invoice_line_items.invoice_id
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own invoice line items"
ON public.invoice_line_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.invoices
  WHERE invoices.id = invoice_line_items.invoice_id
  AND invoices.user_id = auth.uid()
));

-- RLS Policies for job_service_items
CREATE POLICY "Users can view their own job service items"
ON public.job_service_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_service_items.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own job service items"
ON public.job_service_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_service_items.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own job service items"
ON public.job_service_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_service_items.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own job service items"
ON public.job_service_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_service_items.job_id
  AND jobs.user_id = auth.uid()
));

-- RLS Policies for job_payment_schedules
CREATE POLICY "Users can view their own job payment schedules"
ON public.job_payment_schedules FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_payment_schedules.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own job payment schedules"
ON public.job_payment_schedules FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_payment_schedules.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own job payment schedules"
ON public.job_payment_schedules FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_payment_schedules.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own job payment schedules"
ON public.job_payment_schedules FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_payment_schedules.job_id
  AND jobs.user_id = auth.uid()
));

-- RLS Policies for attachments
CREATE POLICY "Users can view their own attachments"
ON public.attachments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
ON public.attachments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
ON public.attachments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for team_assignments
CREATE POLICY "Users can view their own team assignments"
ON public.team_assignments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team assignments"
ON public.team_assignments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team assignments"
ON public.team_assignments FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_quote_line_items_updated_at
BEFORE UPDATE ON public.quote_line_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoice_line_items_updated_at
BEFORE UPDATE ON public.invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_service_items_updated_at
BEFORE UPDATE ON public.job_service_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_payment_schedules_updated_at
BEFORE UPDATE ON public.job_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();