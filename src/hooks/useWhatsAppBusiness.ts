import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WhatsAppConnection {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: string;
  messagingLimit: string;
  connectedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  message_id: string;
  from_number: string;
  to_number: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string;
  status: string;
  customer_name: string | null;
  is_bot_response: boolean;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

export interface WhatsAppAutoReply {
  id: string;
  trigger_keywords: string[];
  trigger_type: string;
  reply_content: string;
  include_products: boolean;
  product_ids: string[] | null;
  include_discount_code: string | null;
  priority: number;
  usage_count: number;
  is_active: boolean;
}

export interface WhatsAppAnalytics {
  totalMessages: number;
  deliveredMessages: number;
  deliveryRate: number;
}

export function useWhatsAppBusiness() {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [autoReplies, setAutoReplies] = useState<WhatsAppAutoReply[]>([]);
  const [analytics, setAnalytics] = useState<WhatsAppAnalytics | null>(null);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { action: "check_status" }
      });

      if (error) throw error;

      if (data?.connected) {
        setIsConnected(true);
        setConnection(data.connection);
      } else {
        setIsConnected(false);
        setConnection(null);
      }
    } catch (error) {
      console.error("WhatsApp status check error:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async (accessToken: string, phoneNumberId?: string, businessAccountId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { 
          action: "connect",
          accessToken,
          phoneNumberId,
          businessAccountId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("WhatsApp Business Connected!", {
          description: `Connected as ${data.connection.verifiedName || data.connection.displayPhoneNumber}`
        });
        await checkStatus();
        return true;
      } else {
        throw new Error(data?.error || "Connection failed");
      }
    } catch (error: any) {
      console.error("WhatsApp connect error:", error);
      toast.error("Connection Failed", {
        description: error.message || "Could not connect to WhatsApp Business API"
      });
      return false;
    }
  }, [checkStatus]);

  const disconnect = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke("whatsapp-business", {
        body: { action: "disconnect" }
      });

      if (error) throw error;

      setIsConnected(false);
      setConnection(null);
      toast.success("WhatsApp Disconnected");
    } catch (error) {
      console.error("WhatsApp disconnect error:", error);
      toast.error("Failed to disconnect");
    }
  }, []);

  const sendMessage = useCallback(async (to: string, message: string, templateName?: string, templateParams?: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { 
          action: "send_message",
          to,
          message,
          templateName,
          templateParams
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Message Sent!");
        await fetchMessages();
        return data.messageId;
      } else {
        throw new Error(data?.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Send message error:", error);
      toast.error("Failed to send message", {
        description: error.message
      });
      return null;
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { action: "get_messages", limit: 100 }
      });

      if (error) throw error;
      setMessages(data?.messages || []);
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  }, []);

  const fetchAutoReplies = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { action: "get_auto_replies" }
      });

      if (error) throw error;
      setAutoReplies(data?.autoReplies || []);
    } catch (error) {
      console.error("Fetch auto-replies error:", error);
    }
  }, []);

  const createAutoReply = useCallback(async (
    triggerKeywords: string[],
    replyContent: string,
    options?: {
      triggerType?: string;
      includeProducts?: boolean;
      productIds?: string[];
      discountCode?: string;
      priority?: number;
    }
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { 
          action: "create_auto_reply",
          triggerKeywords,
          replyContent,
          ...options
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Auto-Reply Created!");
        await fetchAutoReplies();
        return data.autoReply;
      }
    } catch (error: any) {
      console.error("Create auto-reply error:", error);
      toast.error("Failed to create auto-reply");
      return null;
    }
  }, [fetchAutoReplies]);

  const scheduleMessage = useCallback(async (
    to: string,
    content: string,
    scheduledAt: string,
    templateName?: string,
    templateParams?: any
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { 
          action: "schedule_message",
          to,
          content,
          scheduledAt,
          templateName,
          templateParams
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Message Scheduled!");
        return data.scheduled;
      }
    } catch (error: any) {
      console.error("Schedule message error:", error);
      toast.error("Failed to schedule message");
      return null;
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-business", {
        body: { action: "get_analytics" }
      });

      if (error) throw error;
      setAnalytics(data?.summary || null);
    } catch (error) {
      console.error("Fetch analytics error:", error);
    }
  }, []);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!isConnected) return;

    const channel = supabase
      .channel("whatsapp_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages"
        },
        (payload) => {
          const newMessage = payload.new as WhatsAppMessage;
          setMessages(prev => [newMessage, ...prev]);
          
          if (newMessage.direction === "inbound") {
            toast.info("New WhatsApp Message", {
              description: `From ${newMessage.customer_name || newMessage.from_number}: ${newMessage.content.substring(0, 50)}...`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConnected]);

  // Initial data fetch
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (isConnected) {
      fetchMessages();
      fetchAutoReplies();
      fetchAnalytics();
    }
  }, [isConnected, fetchMessages, fetchAutoReplies, fetchAnalytics]);

  return {
    connection,
    isConnected,
    isLoading,
    messages,
    autoReplies,
    analytics,
    connect,
    disconnect,
    sendMessage,
    createAutoReply,
    scheduleMessage,
    refresh: checkStatus,
    refreshMessages: fetchMessages,
  };
}
