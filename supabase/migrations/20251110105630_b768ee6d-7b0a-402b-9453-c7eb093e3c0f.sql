-- Add optional link from contacts to auth users
ALTER TABLE public.contacts
ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_contacts_auth_user_id ON public.contacts(auth_user_id);

-- Update RLS policy for conversations to allow access if user is linked to the contact
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = agent_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = conversations.user_id
    AND contacts.auth_user_id = auth.uid()
  )
);

-- Update RLS policy for messages to allow clients to view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.agent_id = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.contacts
        WHERE contacts.id = conversations.user_id
        AND contacts.auth_user_id = auth.uid()
      )
    )
  )
);

-- Allow clients to send messages in their own conversations
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.user_id IN (
        SELECT id FROM public.contacts WHERE auth_user_id = auth.uid()
      ) OR
      conversations.agent_id = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role)
    )
  )
);