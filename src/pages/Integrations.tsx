import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Instagram, 
  Link2, 
  Check,
  ExternalLink,
  Calendar,
  ImagePlus,
  BarChart3,
  MessageCircle,
  Workflow,
  Zap,
  Settings,
  Play,
  Mic,
  Video,
  ShoppingBag,
  Globe,
  Lock,
  RefreshCw
} from "lucide-react";

// Pinterest icon component
const Pinterest = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.96s-.35-.71-.35-1.78c0-1.66.96-2.9 2.17-2.9 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.02-.28 1.2.6 2.17 1.78 2.17 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.06-4.88-5-4.88-3.4 0-5.4 2.56-5.4 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.37c-.05.22-.18.27-.4.16-1.5-.69-2.43-2.88-2.43-4.64 0-3.77 2.74-7.24 7.91-7.24 4.15 0 7.38 2.96 7.38 6.92 0 4.13-2.6 7.45-6.22 7.45-1.21 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1 0 12 0z"/>
  </svg>
);

// WhatsApp icon component
const WhatsApp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// n8n icon component  
const N8n = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

interface IntegrationCardProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "ready" | "beta";
  description: string;
  features: string[];
  color: string;
  onConnect: () => void;
  isConnecting?: boolean;
}

const IntegrationCard = ({ 
  name, 
  icon: Icon, 
  status, 
  description, 
  features, 
  color,
  onConnect,
  isConnecting 
}: IntegrationCardProps) => (
  <Card className="bg-card/50 border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="font-cyber text-lg">{name}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        <Badge 
          variant={status === "connected" ? "default" : "outline"} 
          className={status === "connected" ? "bg-primary text-primary-foreground" : status === "beta" ? "border-accent text-accent" : "border-muted-foreground"}
        >
          {status === "connected" ? "Connected" : status === "beta" ? "Beta" : "Ready"}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <Badge key={feature} variant="secondary" className="text-xs bg-secondary/50">
            <Check className="h-3 w-3 mr-1 text-primary" />
            {feature}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Button 
          className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : status === "connected" ? (
            <Settings className="h-4 w-4 mr-2" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          {status === "connected" ? "Configure" : "Connect"}
        </Button>
        <Button variant="outline" size="icon" className="border-border">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function Integrations() {
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("");
  const [whatsappToken, setWhatsappToken] = useState("");
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);

  const socialIntegrations = [
    {
      name: "Pinterest",
      icon: Pinterest,
      status: "ready" as const,
      description: "Auto-post Pins, create boards, rich Pins with product data",
      features: ["Auto-post Pins", "Rich Product Pins", "Board Management", "Analytics"],
      color: "from-red-500 to-red-600"
    },
    {
      name: "Instagram",
      icon: Instagram,
      status: "ready" as const,
      description: "Post Reels, Stories, auto-schedule content",
      features: ["Reels Upload", "Story Posts", "Scheduling", "Analytics"],
      color: "from-pink-500 via-purple-500 to-orange-400"
    },
    {
      name: "WhatsApp Business",
      icon: WhatsApp,
      status: "beta" as const,
      description: "Auto-DMs, scheduled messages, live chat, sales closing",
      features: ["Auto-DMs", "Broadcast Lists", "Live Chat", "Sales Bot"],
      color: "from-green-500 to-green-600"
    }
  ];

  const automationIntegrations = [
    {
      name: "n8n Workflows",
      icon: Workflow,
      status: "ready" as const,
      description: "Full automation: auto-post, bot coordination, data sync",
      features: ["Workflow Triggers", "Bot Coordination", "Auto-scaling", "Webhooks"],
      color: "from-orange-500 to-red-500"
    },
    {
      name: "ElevenLabs Voice",
      icon: Mic,
      status: "connected" as const,
      description: "AI voice synthesis for video ads and voice commands",
      features: ["Text-to-Speech", "Voice Cloning", "Video Narration", "Voice Commands"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "Shopify Store",
      icon: ShoppingBag,
      status: "connected" as const,
      description: "Connected to lovable-project-i664s.myshopify.com",
      features: ["30 Products", "Real Inventory", "CJ Fulfillment", "Order Sync"],
      color: "from-green-400 to-emerald-500"
    }
  ];

  const handleConnectSocial = (platform: string) => {
    toast.info(`${platform} OAuth`, {
      description: `Opening ${platform} authorization flow...`
    });
  };

  const handleTestN8nWorkflow = async () => {
    if (!n8nWebhookUrl) {
      toast.error("Please enter your n8n webhook URL");
      return;
    }

    setIsTestingN8n(true);
    try {
      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test_connection",
          timestamp: new Date().toISOString(),
          source: "auraomega_profit_reaper",
          data: {
            action: "ping",
            message: "Testing n8n connection from AURAOMEGA"
          }
        })
      });

      toast.success("n8n Workflow Triggered!", {
        description: "Check your n8n execution history to confirm."
      });
    } catch (error) {
      toast.error("Failed to trigger workflow", {
        description: "Please check your webhook URL and try again."
      });
    } finally {
      setIsTestingN8n(false);
    }
  };

  const handleConnectWhatsapp = async () => {
    if (!whatsappToken) {
      toast.error("Please enter your WhatsApp Business API token");
      return;
    }

    setIsConnectingWhatsapp(true);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("WhatsApp Business Connected!", {
        description: "You can now send auto-DMs and schedule broadcasts."
      });
    } catch (error) {
      toast.error("Connection failed");
    } finally {
      setIsConnectingWhatsapp(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              INTEGRATION HUB
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect all platforms for maximum viral reach & automation
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Check className="h-3 w-3 mr-1" />
              Shopify Connected
            </Badge>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              <Mic className="h-3 w-3 mr-1" />
              ElevenLabs Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="social" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="h-4 w-4 mr-2" />
              Social Platforms
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="n8n" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Workflow className="h-4 w-4 mr-2" />
              n8n Workflows
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          {/* Social Platforms Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {socialIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  {...integration}
                  onConnect={() => handleConnectSocial(integration.name)}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-card to-secondary/20 border-border">
              <CardHeader>
                <CardTitle className="font-cyber flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5">
                    <ImagePlus className="h-6 w-6 text-primary" />
                    <span className="font-medium">Generate Pins</span>
                    <span className="text-xs text-muted-foreground">Bulk create 100+ Pins</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-accent/50 hover:bg-accent/5">
                    <Video className="h-6 w-6 text-accent" />
                    <span className="font-medium">Generate Reels</span>
                    <span className="text-xs text-muted-foreground">Viral 15s videos</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5">
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className="font-medium">Schedule Posts</span>
                    <span className="text-xs text-muted-foreground">7-9 PM EST peak</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-accent/50 hover:bg-accent/5">
                    <BarChart3 className="h-6 w-6 text-accent" />
                    <span className="font-medium">View Analytics</span>
                    <span className="text-xs text-muted-foreground">Track engagement</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {automationIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  {...integration}
                  onConnect={() => toast.info(`Opening ${integration.name} settings...`)}
                />
              ))}
            </div>

            {/* Automation Status */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber">Automation Pipeline Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Content Generation</p>
                        <p className="text-sm text-muted-foreground">AI + ElevenLabs Active</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Workflow className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">n8n Workflows</p>
                        <p className="text-sm text-muted-foreground">Ready to connect</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Shopify Sync</p>
                        <p className="text-sm text-muted-foreground">30 products synced</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* n8n Tab */}
          <TabsContent value="n8n" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="font-cyber flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-orange-500" />
                    Connect n8n Instance
                  </CardTitle>
                  <CardDescription>
                    Connect your n8n instance for full automation workflows
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="n8n-webhook">n8n Webhook URL</Label>
                    <Input
                      id="n8n-webhook"
                      placeholder="https://your-n8n.app.n8n.cloud/webhook/..."
                      value={n8nWebhookUrl}
                      onChange={(e) => setN8nWebhookUrl(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a webhook trigger in n8n and paste the URL here
                    </p>
                  </div>
                  <Button 
                    onClick={handleTestN8nWorkflow}
                    disabled={isTestingN8n || !n8nWebhookUrl}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    {isTestingN8n ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="font-cyber">Recommended Workflows</CardTitle>
                  <CardDescription>
                    Pre-built automation templates for your bot swarm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Auto-Post to Pinterest", trigger: "Every 2 hours", actions: 5 },
                    { name: "Instagram Reel Publisher", trigger: "Content ready", actions: 4 },
                    { name: "Bot Swarm Coordinator", trigger: "Every 15 min", actions: 8 },
                    { name: "Competitor Analysis", trigger: "Daily 6 AM", actions: 6 },
                    { name: "Sales Notification", trigger: "New order", actions: 3 }
                  ].map((workflow) => (
                    <div key={workflow.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground">{workflow.trigger} • {workflow.actions} actions</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* n8n Architecture Diagram */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber">n8n Automation Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border">
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="h-16 w-16 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium">CEO Brain</p>
                      <p className="text-xs text-muted-foreground">Commands</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 w-16 mx-auto rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Workflow className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-sm font-medium">n8n</p>
                      <p className="text-xs text-muted-foreground">Orchestration</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="h-0.5 w-full bg-gradient-to-r from-accent to-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 w-16 mx-auto rounded-lg bg-accent/20 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-accent" />
                      </div>
                      <p className="text-sm font-medium">200 Bots</p>
                      <p className="text-xs text-muted-foreground">Execution</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="font-cyber flex items-center gap-2">
                    <WhatsApp className="h-5 w-5 text-green-500" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription>
                    Connect for auto-DMs, broadcasts, and sales closing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-token">API Access Token</Label>
                    <div className="relative">
                      <Input
                        id="whatsapp-token"
                        type="password"
                        placeholder="EAA..."
                        value={whatsappToken}
                        onChange={(e) => setWhatsappToken(e.target.value)}
                        className="bg-secondary/50 pr-10"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get your token from Meta Business Suite → WhatsApp → API Setup
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnectWhatsapp}
                    disabled={isConnectingWhatsapp || !whatsappToken}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {isConnectingWhatsapp ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Connect WhatsApp
                  </Button>
                  <div className="text-center">
                    <Button variant="link" className="text-xs text-muted-foreground">
                      Or connect via Meta OAuth →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="font-cyber">WhatsApp Features</CardTitle>
                  <CardDescription>
                    Available after connecting your Business account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Auto-Response Bot", desc: "AI-powered sales closing", icon: MessageCircle, enabled: false },
                    { name: "Broadcast Campaigns", desc: "Send to 1000+ contacts", icon: Zap, enabled: false },
                    { name: "Order Notifications", desc: "Auto-send tracking info", icon: ShoppingBag, enabled: false },
                    { name: "Live Chat Dashboard", desc: "Real-time customer chat", icon: Globe, enabled: false },
                    { name: "Scheduled Messages", desc: "Time-based automation", icon: Calendar, enabled: false }
                  ].map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <feature.icon className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.enabled ? "Active" : "Connect First"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sample DM Templates */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber">Auto-DM Templates</CardTitle>
                <CardDescription>Pre-built sales closing messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { title: "Welcome Message", preview: "Hi! 👋 Thanks for reaching out! Looking for glowing skin? We've got you covered..." },
                    { title: "Product Inquiry", preview: "Great choice! Our [Product] is a bestseller. Use code GLOW10 for 10% off..." },
                    { title: "Abandoned Cart", preview: "Hey! We noticed you left something behind. Your glow-up is waiting! 🌟" },
                    { title: "Order Confirmation", preview: "Your order #[ID] is confirmed! Track your package here: [link]" }
                  ].map((template) => (
                    <div key={template.title} className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                      <p className="font-medium text-sm mb-1">{template.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sample Viral Captions */}
        <Card className="bg-gradient-to-br from-card to-secondary/20 border-border">
          <CardHeader>
            <CardTitle className="font-cyber">🔥 Sample Viral Captions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                "✨ Glass skin in 7 days? This serum is IT. 🧴 #SkincareRoutine #GlowUp #KBeauty",
                "POV: You finally found the serum that actually works 💫 #CleanBeauty #SkincareEssentials",
                "Before vs After: 2 weeks with our Vitamin C Serum 🍊 #SkincareTransformation",
                "Your skin deserves this luxury treatment ✨ Code GLOW10 for 10% off 🛍️",
                "The secret to Korean glass skin? This right here 🇰🇷 #KBeauty #GlassSkin",
                "Botox in a bottle for under $50? Say less 💉 #AntiAging #ViralSkincare"
              ].map((caption, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border text-sm hover:border-primary/30 transition-colors cursor-pointer">
                  {caption}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
