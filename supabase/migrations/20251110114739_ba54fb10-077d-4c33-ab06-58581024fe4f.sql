-- Update contacts SELECT policy to allow users to view contacts where they are the linked auth user
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;

CREATE POLICY "Users can view contacts they own or are linked to"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  -- User owns the contact (business owner viewing their clients)
  (auth.uid() = user_id)
  -- OR user is the contact (client viewing themselves)
  OR (auth.uid() = auth_user_id)
);