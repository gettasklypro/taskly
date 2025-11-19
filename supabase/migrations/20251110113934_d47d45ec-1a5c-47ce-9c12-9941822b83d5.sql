-- Update conversations policies to allow all authenticated users

-- Drop existing SELECT policy and create a more permissive one
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view conversations they're part of"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  -- User is the assigned agent
  (auth.uid() = agent_id)
  -- OR user is the contact in the conversation
  OR (EXISTS (
    SELECT 1
    FROM contacts
    WHERE contacts.id = conversations.user_id
      AND contacts.auth_user_id = auth.uid()
  ))
  -- OR user owns the contact in the conversation (business owner viewing customer conversations)
  OR (EXISTS (
    SELECT 1
    FROM contacts
    WHERE contacts.id = conversations.user_id
      AND contacts.user_id = auth.uid()
  ))
);

-- Update INSERT policy to allow all authenticated users
DROP POLICY IF EXISTS "Users and admins can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) 
  OR (auth.uid() = agent_id)
  OR (EXISTS (
    SELECT 1
    FROM contacts
    WHERE contacts.id = conversations.user_id
      AND (contacts.auth_user_id = auth.uid() OR contacts.user_id = auth.uid())
  ))
);

-- Update UPDATE policy
DROP POLICY IF EXISTS "Admins can update conversations" ON public.conversations;

CREATE POLICY "Users can update conversations they're part of"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = agent_id)
  OR (EXISTS (
    SELECT 1
    FROM contacts
    WHERE contacts.id = conversations.user_id
      AND (contacts.auth_user_id = auth.uid() OR contacts.user_id = auth.uid())
  ))
);

-- Update messages SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in conversations they're part of"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR (EXISTS (
          SELECT 1
          FROM contacts
          WHERE contacts.id = conversations.user_id
            AND (contacts.auth_user_id = auth.uid() OR contacts.user_id = auth.uid())
        ))
      )
  )
);

-- Update messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

CREATE POLICY "Users can send messages in conversations they're part of"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR (EXISTS (
          SELECT 1
          FROM contacts
          WHERE contacts.id = conversations.user_id
            AND (contacts.auth_user_id = auth.uid() OR contacts.user_id = auth.uid())
        ))
      )
  )
);

-- Update messages UPDATE policy to allow users (not just admins) to mark messages as read
DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;

CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.agent_id = auth.uid()
        OR (EXISTS (
          SELECT 1
          FROM contacts
          WHERE contacts.id = conversations.user_id
            AND (contacts.auth_user_id = auth.uid() OR contacts.user_id = auth.uid())
        ))
      )
  )
);