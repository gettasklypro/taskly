import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      initializeConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      checkUnreadMessages();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkUnreadMessages = async () => {
    if (!user) return;

    try {
      // Find the contact linked to this auth user
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!contact) return;

      const { data: conversation } = await supabase
        .from("conversations")
        .select("unread_count")
        .eq("user_id", contact.id)
        .maybeSingle();

      if (conversation) {
        setUnreadCount(conversation.unread_count || 0);
      }
    } catch (error) {
      console.error("Error checking unread messages:", error);
    }
  };

  const initializeConversation = async () => {
    if (!user) return;

    try {
      // First, find the contact linked to this auth user
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!contact) {
        toast.error("No contact profile found. Please contact support.");
        return;
      }

      // Check if conversation exists for this contact
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", contact.id)
        .maybeSingle();

      if (existingConv) {
        setConversationId(existingConv.id);
        markAsRead(existingConv.id);
      } else {
        // Create new conversation using contact ID
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            user_id: contact.id,
            status: "open",
          })
          .select()
          .single();

        if (createError) throw createError;
        setConversationId(newConv.id);
      }
    } catch (error: any) {
      console.error("Error initializing conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender names separately
      const senderIds = [...new Set(data.map((msg: any) => msg.sender_id))];
      const senderNames: Record<string, string> = {};

      for (const senderId of senderIds) {
        // Try profiles first (for admins/users)
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", senderId)
          .maybeSingle();

        if (profile) {
          senderNames[senderId] = profile.full_name || "Unknown";
        } else {
          // Try contacts if not a profile
          const { data: contact } = await supabase
            .from("contacts")
            .select("name")
            .eq("id", senderId)
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
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-widget-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
          if (!isOpen) {
            checkUnreadMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (convId: string) => {
    if (!user) return;

    try {
      // Find the contact ID for this auth user
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!contact) return;

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", convId)
        .neq("sender_id", contact.id);

      await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", convId);

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      // Find the contact ID for this auth user
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!contact) {
        toast.error("Contact profile not found");
        return;
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: contact.id,
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
        .eq("id", conversationId);

      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary-foreground text-primary">
                  T
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">Taskly Support</h3>
                <p className="text-xs opacity-90">We typically reply instantly</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start a conversation with us!</p>
                    <p className="text-xs mt-1">We're here to help</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                            <Avatar className="h-7 w-7 mt-1">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                T
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[75%] rounded-lg p-3",
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};
