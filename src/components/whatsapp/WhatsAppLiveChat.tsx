import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Check, 
  CheckCheck, 
  Clock,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { WhatsAppMessage } from "@/hooks/useWhatsAppBusiness";
import { format } from "date-fns";

interface WhatsAppLiveChatProps {
  messages: WhatsAppMessage[];
  onSendMessage: (to: string, message: string) => Promise<string | null>;
  onRefresh: () => void;
}

export function WhatsAppLiveChat({ messages, onSendMessage, onRefresh }: WhatsAppLiveChatProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group messages by conversation (phone number)
  const conversations = messages.reduce((acc, msg) => {
    const otherNumber = msg.direction === "inbound" ? msg.from_number : msg.to_number;
    if (!acc[otherNumber]) {
      acc[otherNumber] = {
        phoneNumber: otherNumber,
        customerName: msg.customer_name,
        messages: [],
        lastMessage: msg,
      };
    }
    acc[otherNumber].messages.push(msg);
    return acc;
  }, {} as Record<string, { phoneNumber: string; customerName: string | null; messages: WhatsAppMessage[]; lastMessage: WhatsAppMessage }>);

  const conversationList = Object.values(conversations).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  );

  const selectedConversation = selectedChat ? conversations[selectedChat] : null;

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    setIsSending(true);
    try {
      await onSendMessage(selectedChat, newMessage);
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-[500px]">
      {/* Conversation List */}
      <Card className="col-span-1 bg-card/50">
        <CardHeader className="py-3 px-4 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-cyber flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              Conversations
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="h-[440px]">
          {conversationList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          ) : (
            conversationList.map((conv) => (
              <div
                key={conv.phoneNumber}
                onClick={() => setSelectedChat(conv.phoneNumber)}
                className={`p-3 border-b border-border cursor-pointer transition-colors hover:bg-secondary/50 ${
                  selectedChat === conv.phoneNumber ? "bg-secondary/70" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-500/20 text-green-500">
                      {conv.customerName?.[0]?.toUpperCase() || conv.phoneNumber.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conv.customerName || conv.phoneNumber}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(conv.lastMessage.created_at), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      {conv.lastMessage.direction === "outbound" && (
                        conv.lastMessage.is_bot_response ? (
                          <Bot className="h-3 w-3 text-primary" />
                        ) : (
                          getStatusIcon(conv.lastMessage.status)
                        )
                      )}
                      {conv.lastMessage.content.substring(0, 30)}...
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Chat View */}
      <Card className="col-span-2 bg-card/50 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="py-3 px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-500/20 text-green-500">
                    {selectedConversation.customerName?.[0]?.toUpperCase() || 
                     selectedConversation.phoneNumber.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-cyber">
                    {selectedConversation.customerName || selectedConversation.phoneNumber}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.phoneNumber}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-3">
                {[...selectedConversation.messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.direction === "outbound"
                          ? msg.is_bot_response
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-green-500/20 border border-green-500/30"
                          : "bg-secondary"
                      }`}
                    >
                      {msg.is_bot_response && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-primary font-medium">Auto-Reply</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.created_at), "HH:mm")}
                        </span>
                        {msg.direction === "outbound" && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="bg-secondary/50"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!newMessage.trim() || isSending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
