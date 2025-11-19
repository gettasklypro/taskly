-- Create enum for website template categories
CREATE TYPE public.template_category AS ENUM ('fitness', 'coaching', 'creative', 'business', 'consulting', 'agency', 'other');

-- Create enum for website status
CREATE TYPE public.website_status AS ENUM ('draft', 'published', 'archived');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create websites table
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  category template_category,
  status website_status DEFAULT 'draft',
  template_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on websites
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Websites policies
CREATE POLICY "Users can view their own websites"
  ON public.websites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websites"
  ON public.websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
  ON public.websites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
  ON public.websites FOR DELETE
  USING (auth.uid() = user_id);

-- Create pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  is_homepage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(website_id, slug)
);

-- Enable RLS on pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Pages policies
CREATE POLICY "Users can view pages of their websites"
  ON public.pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can create pages for their websites"
  ON public.pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can update pages of their websites"
  ON public.pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = pages.website_id 
    AND websites.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete pages of their websites"
  ON public.pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = pages.website_id 
    AND websites.user_id = auth.uid()
  ));

-- Create templates table (pre-built templates)
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  thumbnail_url TEXT,
  preview_data JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates policies (public read)
CREATE POLICY "Anyone can view public templates"
  ON public.templates FOR SELECT
  USING (is_public = true);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some default templates
INSERT INTO public.templates (name, description, category, preview_data) VALUES
  ('Fitness Studio Pro', 'Modern fitness studio website with class schedules and membership options', 'fitness', '[]'),
  ('Business Coach Elite', 'Professional coaching website with booking and testimonials', 'coaching', '[]'),
  ('Creative Agency Portfolio', 'Stunning portfolio for creative agencies and designers', 'creative', '[]'),
  ('Consulting Firm Classic', 'Corporate consulting website with services and case studies', 'consulting', '[]');