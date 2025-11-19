-- Create security definer function to check if user is linked to a contact
-- This bypasses RLS to allow conversation queries to work
CREATE OR REPLACE FUNCTION public.is_linked_to_contact(_user_id uuid, _contact_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contacts
    WHERE id = _contact_id
      AND (auth_user_id = _user_id OR user_id = _user_id)
  )
$$;

-- Update conversation policies to use the security definer function
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.conversations;

CREATE POLICY "Users can view conversations they're part of"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  (auth.uid() = agent_id) 
  OR public.is_linked_to_contact(auth.uid(), user_id)
);

DROP POLICY IF EXISTS "Users can update conversations they're part of" ON public.conversations;

CREATE POLICY "Users can update conversations they're part of"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = agent_id) 
  OR public.is_linked_to_contact(auth.uid(), user_id)
);

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) 
  OR (auth.uid() = agent_id) 
  OR public.is_linked_to_contact(auth.uid(), user_id)
);

-- Update messages policies
DROP POLICY IF EXISTS "Users can view messages in conversations they're part of" ON public.messages;

CREATE POLICY "Users can view messages in conversations they're part of"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR public.is_linked_to_contact(auth.uid(), conversations.user_id)
      )
  )
);

DROP POLICY IF EXISTS "Users can send messages in conversations they're part of" ON public.messages;

CREATE POLICY "Users can send messages in conversations they're part of"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR public.is_linked_to_contact(auth.uid(), conversations.user_id)
      )
  )
);

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;

CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR public.is_linked_to_contact(auth.uid(), conversations.user_id)
      )
  )
);