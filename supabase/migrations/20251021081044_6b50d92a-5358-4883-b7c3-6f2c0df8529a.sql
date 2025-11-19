-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles (admins can manage all, users can view their own)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_value numeric NOT NULL,
  discount_type text NOT NULL DEFAULT 'percent',
  expires_at date,
  max_uses integer,
  current_uses integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for promo_codes updated_at
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create app_settings table
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  support_email text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.app_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.app_settings (company_name, support_email)
VALUES ('Your SaaS', 'support@yoursaas.com');