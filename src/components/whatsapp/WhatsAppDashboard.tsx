import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Clock, 
  BarChart3, 
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Zap,
  TrendingUp,
  Users,
  Phone,
  RefreshCw,
  Plus
} from "lucide-react";
import { useWhatsAppBusiness } from "@/hooks/useWhatsAppBusiness";
import { WhatsAppLiveChat } from "./WhatsAppLiveChat";
import { toast } from "sonner";

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function WhatsAppDashboard() {
  const {
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
    refresh,
    refreshMessages,
  } = useWhatsAppBusiness();

  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Test message state
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("👋 Hello from AURAOMEGA! Check out our skincare bundles at 10% off with code GLOW10! 🧴✨");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Auto-reply form state
  const [newKeywords, setNewKeywords] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [includeDiscount, setIncludeDiscount] = useState(true);

  const handleConnect = async () => {
    if (!accessToken) {
      toast.error("Please enter your access token");
      return;
    }

    setIsConnecting(true);
    try {
      await connect(accessToken, phoneNumberId || undefined, businessAccountId || undefined);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSendingTest(true);
    try {
      const result = await sendMessage(testNumber, testMessage);
      if (result) {
        toast.success("Test message sent!", {
          description: `Message ID: ${result.substring(0, 20)}...`
        });
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCreateAutoReply = async () => {
    if (!newKeywords || !newReplyContent) {
      toast.error("Please fill in keywords and reply content");
      return;
    }

    const keywords = newKeywords.split(",").map(k => k.trim()).filter(Boolean);
    await createAutoReply(keywords, newReplyContent, {
      discountCode: includeDiscount ? "GLOW10" : undefined
    });

    setNewKeywords("");
    setNewReplyContent("");
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-3">Checking WhatsApp connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className={`bg-gradient-to-br border-2 ${
        isConnected 
          ? "from-green-500/10 to-green-600/5 border-green-500/30" 
          : "from-card to-secondary/20 border-border"
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isConnected 
                  ? "bg-green-500" 
                  : "bg-gradient-to-br from-green-400 to-green-600"
              }`}>
                <WhatsAppIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="font-cyber flex items-center gap-2">
                  WhatsApp Business Cloud API
                  {isConnected ? (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </CardTitle>
                {isConnected && connection && (
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3" />
                    {connection.displayPhoneNumber}
                    {connection.verifiedName && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        {connection.verifiedName}
                      </>
                    )}
                  </CardDescription>
                )}
              </div>
            </div>
            
            {isConnected && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="destructive" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {!isConnected && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="wa-token">Access Token (Permanent)</Label>
                <div className="relative">
                  <Input
                    id="wa-token"
                    type="password"
                    placeholder="EAAxxxxxxx..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="bg-secondary/50 pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-phone-id">Phone Number ID</Label>
                <Input
                  id="wa-phone-id"
                  placeholder="1234567890..."
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-business-id">Business Account ID (Optional)</Label>
                <Input
                  id="wa-business-id"
                  placeholder="Optional..."
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleConnect}
                disabled={isConnecting || !accessToken}
                className="bg-green-500 hover:bg-green-600"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                )}
                Connect WhatsApp Business
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Setup Guide
                </a>
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-secondary/30 text-sm">
              <p className="font-medium mb-1">How to get your credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to Meta Business Manager → System Users</li>
                <li>Create a system user with WhatsApp Business access</li>
                <li>Generate a permanent access token</li>
                <li>Get your Phone Number ID from WhatsApp Manager</li>
              </ol>
            </div>
          </CardContent>
        )}
      </Card>

      {isConnected && (
        <>
          {/* Analytics Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Send className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics?.totalMessages || 0}</p>
                    <p className="text-xs text-muted-foreground">Messages Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics?.deliveredMessages || 0}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics?.deliveryRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Delivery Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{autoReplies.length}</p>
                    <p className="text-xs text-muted-foreground">Auto-Replies Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="chat" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </TabsTrigger>
              <TabsTrigger value="auto-replies" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Bot className="h-4 w-4 mr-2" />
                Auto-Replies
              </TabsTrigger>
              <TabsTrigger value="send-test" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <WhatsAppLiveChat 
                messages={messages}
                onSendMessage={sendMessage}
                onRefresh={refreshMessages}
              />
            </TabsContent>

            <TabsContent value="auto-replies">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Create New Auto-Reply */}
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="font-cyber flex items-center gap-2">
                      <Plus className="h-5 w-5 text-green-500" />
                      Create Auto-Reply
                    </CardTitle>
                    <CardDescription>
                      Set up automatic responses for common inquiries
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Trigger Keywords (comma-separated)</Label>
                      <Input
                        placeholder="price, cost, how much, serum..."
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reply Message</Label>
                      <Textarea
                        placeholder="Thanks for reaching out! Our serums start at $29.99..."
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        className="bg-secondary/50 min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={includeDiscount} 
                        onCheckedChange={setIncludeDiscount}
                      />
                      <Label>Include discount code GLOW10</Label>
                    </div>
                    <Button 
                      onClick={handleCreateAutoReply}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Create Auto-Reply
                    </Button>
                  </CardContent>
                </Card>

                {/* Active Auto-Replies */}
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="font-cyber">Active Auto-Replies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {autoReplies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No auto-replies configured yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {autoReplies.map((rule) => (
                          <div key={rule.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex flex-wrap gap-1">
                                {rule.trigger_keywords.slice(0, 3).map((kw, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {kw}
                                  </Badge>
                                ))}
                                {rule.trigger_keywords.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{rule.trigger_keywords.length - 3}
                                  </Badge>
                                )}
                              </div>
                              <Badge className="bg-green-500/20 text-green-500 text-xs">
                                {rule.usage_count} uses
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {rule.reply_content}
                            </p>
                            {rule.include_discount_code && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Code: {rule.include_discount_code}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="send-test">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="font-cyber flex items-center gap-2">
                    <Send className="h-5 w-5 text-green-500" />
                    Send Test Message
                  </CardTitle>
                  <CardDescription>
                    Send a test message to verify your WhatsApp Business connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone Number (with country code)</Label>
                      <Input
                        placeholder="+1234567890"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendTest}
                    disabled={isSendingTest || !testNumber}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isSendingTest ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Test Message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="font-cyber">Connection Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {connection && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Phone Number ID</Label>
                        <p className="font-mono text-sm">{connection.phoneNumberId}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Display Number</Label>
                        <p className="font-mono text-sm">{connection.displayPhoneNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Verified Name</Label>
                        <p className="font-mono text-sm">{connection.verifiedName || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Quality Rating</Label>
                        <Badge className={
                          connection.qualityRating === "GREEN" 
                            ? "bg-green-500/20 text-green-500"
                            : connection.qualityRating === "YELLOW"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        }>
                          {connection.qualityRating || "N/A"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Messaging Limit</Label>
                        <p className="font-mono text-sm">{connection.messagingLimit || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Connected Since</Label>
                        <p className="font-mono text-sm">
                          {new Date(connection.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
