-- Delete conversations where user_id doesn't exist in contacts table
DELETE FROM public.conversations
WHERE user_id NOT IN (SELECT id FROM public.contacts);

-- Now add the foreign key constraint
ALTER TABLE public.conversations
ADD CONSTRAINT conversations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);