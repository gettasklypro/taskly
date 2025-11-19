-- Add site_title column to websites table for custom page titles
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS site_title TEXT;