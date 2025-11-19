-- Add favicon_url column to websites table
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS favicon_url TEXT;