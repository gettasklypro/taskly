import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Search, 
  MoreVertical, 
  CheckCheck, 
  Clock,
  X,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewConversationDialog } from "@/components/inbox/NewConversationDialog";

interface Conversation {
  id: string;
  user_id: string;
  agent_id: string | null;
  last_message: string | null;
  status: "open" | "closed" | "pending";
  unread_count: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export default function Inbox() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user]);

  // Handle navigation from Clients page
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conversation = conversations.find(
        (c) => c.id === location.state.conversationId
      );
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations for user:", user?.email);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      console.log("Conversations query result:", { data, error });
      if (error) throw error;

      // Fetch contact and agent names for each conversation
      const conversationsWithUserInfo = await Promise.all(
        data.map(async (conv: any) => {
          // Get contact info
          const { data: contactData } = await supabase
            .rpc("get_conversation_contact_name", { _contact_id: conv.user_id });
          const contactInfo = contactData?.[0] || { name: "Unknown User", email: "" };

          // Get agent info
          const { data: agentProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", conv.agent_id)
            .maybeSingle();

          // Determine which name to display based on who the current user is
          let displayName = "Unknown User";
          let displayEmail = "";

          if (conv.agent_id === user?.id) {
            // Current user is the agent, show contact's name
            displayName = contactInfo.name;
            displayEmail = contactInfo.email;
          } else {
            // Current user is the contact, show agent's name
            displayName = agentProfile?.full_name || "Unknown User";
            displayEmail = agentProfile?.email || "";
          }
          
          return {
            ...conv,
            user_name: displayName,
            user_email: displayEmail,
          };
        })
      );

      setConversations(conversationsWithUserInfo);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender names separately for each unique sender
      const senderIds = [...new Set(data.map((msg: any) => msg.sender_id))];
      const senderNames: Record<string, string> = {};

      for (const senderId of senderIds) {
        // Try to get from profiles first (for authenticated users)
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", senderId)
          .maybeSingle();

        if (profile?.full_name) {
          senderNames[senderId] = profile.full_name;
        } else {
          // Try to get from contacts by auth_user_id (for linked contacts)
          const { data: contact } = await supabase
            .from("contacts")
            .select("name")
            .eq("auth_user_id", senderId)
            .maybeSingle();
          
          senderNames[senderId] = contact?.name || "Unknown";
        }
      }

      const messagesWithSenderInfo = data.map((msg: any) => ({
        ...msg,
        sender_name: senderNames[msg.sender_id] || "Unknown",
      }));

      setMessages(messagesWithSenderInfo);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id);

      await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_role: "user",
        message: newMessage.trim(),
      });

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({
          last_message: newMessage.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedConversation.id);

      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const updateStatus = async (conversationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ status })
        .eq("id", conversationId);

      if (error) throw error;
      toast.success(`Conversation marked as ${status}`);
      fetchConversations();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
      console.log("Conversation deleted successfully");
      toast.success("Conversation deleted");
      setSelectedConversation(null);
      fetchConversations();
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      toast.error(`Failed to delete conversation: ${error.message}`);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleConversationCreated = async (conversationId: string) => {
    await fetchConversations();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-3.5rem)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col bg-background">
          <div className="p-4 space-y-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Inbox</h2>
              <Button
                size="icon"
                variant="default"
                onClick={() => setShowNewConversationDialog(true)}
                title="New Conversation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["all", "open", "pending", "closed"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border",
                    selectedConversation?.id === conv.id && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conv.user_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{conv.user_name}</h3>
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conv.last_message || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getStatusColor(conv.status))}>
                          {conv.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Messages Area */}
        {selectedConversation ? (
          <>
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-background">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedConversation.user_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.user_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.user_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {msg.sender_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                            {isOwnMessage && (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                        {isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {msg.sender_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-background">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Conversation Details */}
            <div className="w-80 border-l border-border p-4 bg-background">
              <h3 className="font-semibold mb-4">Conversation Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Contact</label>
                  <p className="font-medium">{selectedConversation.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.user_email}
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="capitalize">{selectedConversation.status}</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => updateStatus(selectedConversation.id, "open")}
                      >
                        Mark as Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(selectedConversation.id, "pending")}
                      >
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(selectedConversation.id, "closed")}
                      >
                        Mark as Closed
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => deleteConversation(selectedConversation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Separator />

                <div>
                  <label className="text-sm text-muted-foreground">Created</label>
                  <p className="text-sm">
                    {format(new Date(selectedConversation.created_at), "PPp")}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Last Updated</label>
                  <p className="text-sm">
                    {format(new Date(selectedConversation.updated_at), "PPp")}
                  </p>
                </div>

                {/* Placeholder for future AI features */}
                <Separator />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    🤖 AI auto-reply and message summary coming soon
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      <NewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onConversationCreated={handleConversationCreated}
      />
    </Layout>
  );
}
