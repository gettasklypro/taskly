-- Fix contacts RLS to prevent auto-linked contacts from appearing to other users
DROP POLICY IF EXISTS "Users can view contacts they own or are linked to" ON public.contacts;

-- Users can only view contacts they created (not contacts where they are the auth_user_id)
CREATE POLICY "Users can view their own contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);