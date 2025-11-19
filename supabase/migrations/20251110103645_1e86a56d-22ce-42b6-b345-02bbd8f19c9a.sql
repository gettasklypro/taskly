-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID,
  last_message TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('open', 'closed', 'pending'))
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT sender_role_check CHECK (sender_role IN ('user', 'admin'))
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = agent_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update conversations"
ON public.conversations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = agent_id);

CREATE POLICY "Admins can delete conversations"
ON public.conversations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid() OR conversations.agent_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid() OR conversations.agent_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Admins can update messages"
ON public.messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Create trigger to update conversations updated_at timestamp
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;