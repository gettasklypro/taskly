-- Allow authenticated users to view basic profile information of other users
CREATE POLICY "Authenticated users can view other users' profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);