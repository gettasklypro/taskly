-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;

-- Create a better policy that allows both users and admins to create conversations
CREATE POLICY "Users and admins can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() = agent_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);