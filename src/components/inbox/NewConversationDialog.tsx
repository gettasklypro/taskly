import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  company_name?: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Fetch all contacts that don't already have an active conversation
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("id, name, email, company_name")
        .order("name");

      if (contactsError) throw contactsError;

      // Get existing conversations to filter out contacts that already have conversations
      const { data: existingConvs } = await supabase
        .from("conversations")
        .select("user_id");

      const existingUserIds = new Set(
        existingConvs?.map((conv) => conv.user_id) || []
      );

      // For now, show all contacts - they might want multiple conversations
      setContacts(contactsData || []);
      setFilteredContacts(contactsData || []);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (contactId: string) => {
    if (!user) return;
    
    setCreating(true);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", contactId)
        .maybeSingle();

      if (existing) {
        // Conversation already exists, just open it
        onConversationCreated(existing.id);
        onOpenChange(false);
        toast.success("Conversation opened");
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user_id: contactId,
          agent_id: user.id,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Conversation created");
      onConversationCreated(newConv.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select a client to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No clients found"
                  : "No clients available. Add clients first."}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b border-border transition-colors"
                  onClick={() => createConversation(contact.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.email}
                      </p>
                      {contact.company_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
