-- Create enums for various statuses
CREATE TYPE public.job_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'approved', 'declined', 'expired');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.request_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'lost');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.job_status NOT NULL DEFAULT 'draft',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.quote_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quote_number)
);

-- Invoices table  
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, invoice_number)
);

-- Service Requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  priority public.task_priority DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timesheets table
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  hours DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketing Campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quotes
CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for service_requests
CREATE POLICY "Users can view their own requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own requests" ON public.service_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own requests" ON public.service_requests FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for timesheets
CREATE POLICY "Users can view their own timesheets" ON public.timesheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own timesheets" ON public.timesheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own timesheets" ON public.timesheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own timesheets" ON public.timesheets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Users can view their own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();