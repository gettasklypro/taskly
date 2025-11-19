-- Drop the existing admin-only delete policy
DROP POLICY IF EXISTS "Admins can delete conversations" ON public.conversations;

-- Create a new policy that allows users to delete conversations they're part of
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (
  (auth.uid() = agent_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (EXISTS (
    SELECT 1
    FROM contacts
    WHERE contacts.id = conversations.user_id
      AND contacts.auth_user_id = auth.uid()
  ))
);