-- Add company_name column to contacts table
ALTER TABLE public.contacts
ADD COLUMN company_name text;