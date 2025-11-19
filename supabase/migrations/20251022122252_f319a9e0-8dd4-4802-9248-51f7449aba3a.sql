-- Add reimburse_to column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN reimburse_to TEXT DEFAULT 'Not reimbursable';