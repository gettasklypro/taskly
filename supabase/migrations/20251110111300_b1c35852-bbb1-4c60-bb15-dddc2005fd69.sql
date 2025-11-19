-- Update the handle_new_user function to also link contacts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Link any existing contacts with matching email
  UPDATE public.contacts
  SET auth_user_id = NEW.id
  WHERE email = NEW.email
    AND auth_user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create function to auto-link contacts to auth users
CREATE OR REPLACE FUNCTION public.auto_link_contact_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If contact has an email, try to find matching auth user
  IF NEW.email IS NOT NULL AND NEW.auth_user_id IS NULL THEN
    UPDATE public.contacts
    SET auth_user_id = (
      SELECT id 
      FROM public.profiles 
      WHERE email = NEW.email 
      LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new contacts
DROP TRIGGER IF EXISTS on_contact_created ON public.contacts;
CREATE TRIGGER on_contact_created
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_contact_to_auth();

-- Create trigger for updated contacts (when email changes)
DROP TRIGGER IF EXISTS on_contact_email_updated ON public.contacts;
CREATE TRIGGER on_contact_email_updated
  AFTER UPDATE OF email ON public.contacts
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.auto_link_contact_to_auth();