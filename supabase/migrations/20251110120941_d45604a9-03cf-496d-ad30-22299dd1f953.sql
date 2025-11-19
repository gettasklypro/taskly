-- Create security definer function to get contact name for conversations
-- This bypasses RLS to allow conversation queries to display contact names
CREATE OR REPLACE FUNCTION public.get_conversation_contact_name(_contact_id uuid)
RETURNS TABLE(name text, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT name, email
  FROM public.contacts
  WHERE id = _contact_id
  LIMIT 1
$$;