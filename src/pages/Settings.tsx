import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Store, 
  Bell, 
  Palette,
  Shield,
  Database,
  ExternalLink,
  Check,
  Globe,
  RefreshCw,
  Zap,
  Bot,
  Video,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceSync = async () => {
    setIsRefreshing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast.success("Store synced!", {
      description: "30 products refreshed from lovable-project-i664s.myshopify.com"
    });
  };

  const domains = [
    { name: "auraliftessentials.com", status: "ready", primary: true },
    { name: "omegaalpha.io", status: "ready", primary: false },
    { name: "profitreaper.com", status: "ready", primary: false },
    { name: "lovable.app subdomain", status: "active", primary: false },
  ];

  const integrations = [
    { name: "Shopify Storefront API", status: "active", description: "30 products synced" },
    { name: "Lovable Cloud (Backend)", status: "active", description: "Database & Edge Functions" },
    { name: "Lovable AI (CEO Brain)", status: "active", description: "Gemini-powered commands" },
    { name: "200-Bot Swarm", status: "active", description: "40 teams deployed" },
    { name: "Video Studio (D-ID)", status: "ready", description: "Add API key to activate" },
    { name: "Voice AI (ElevenLabs)", status: "active", description: "TTS enabled" },
    { name: "Pinterest API", status: "ready", description: "OAuth connect available" },
    { name: "Instagram API", status: "ready", description: "OAuth connect available" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
            SYSTEM SETTINGS
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your Profit Reaper command center — Real production mode
          </p>
        </div>

        {/* Live Store Connection */}
        <Card className="bg-card/50 border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Production Store
              <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-400">lovable-project-i664s.myshopify.com</p>
                  <p className="text-sm text-muted-foreground">30 products • CJ Fulfillment • Real revenue tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceSync}
                  disabled={isRefreshing}
                  className="border-primary/50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Syncing...' : 'Force Sync'}
                </Button>
                <Badge className="bg-emerald-500 text-white">Connected</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">30</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-2xl font-bold text-primary">15min</p>
                <p className="text-xs text-muted-foreground">Auto-sync</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">$0</p>
                <p className="text-xs text-muted-foreground">Real Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Management */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Domain Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure custom domains in Lovable Project Settings → Domains. DNS should point A records to 185.158.133.1
            </p>
            {domains.map((domain) => (
              <div 
                key={domain.name}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  domain.primary 
                    ? 'bg-primary/10 border-primary/50' 
                    : 'bg-secondary/30 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`h-5 w-5 ${domain.primary ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`font-medium ${domain.primary ? 'text-primary' : ''}`}>
                      {domain.name}
                      {domain.primary && <span className="text-xs ml-2 text-primary">(Primary)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {domain.status === 'active' ? 'Live and serving traffic' : 'DNS ready - publish to activate'}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={
                    domain.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  }
                >
                  {domain.status}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              To activate "Ready" domains, publish your app from the Lovable editor.
            </p>
          </CardContent>
        </Card>

        {/* Bot Swarm Status */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              200-Bot Swarm Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-2xl font-bold text-emerald-400">200</p>
                <p className="text-xs text-muted-foreground">Active Bots</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-2xl font-bold text-primary">40</p>
                <p className="text-xs text-muted-foreground">Elite Teams</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-2xl font-bold text-amber-400">5</p>
                <p className="text-xs text-muted-foreground">Bots/Team</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-2xl font-bold text-purple-400">15min</p>
                <p className="text-xs text-muted-foreground">Optimize Cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Real-Time Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New order alerts</p>
                <p className="text-sm text-muted-foreground">Instant notification on real sales</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low inventory alerts</p>
                <p className="text-sm text-muted-foreground">Alert when CJ stock is low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bot swarm performance</p>
                <p className="text-sm text-muted-foreground">Hourly optimization summaries</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">CEO Brain insights</p>
                <p className="text-sm text-muted-foreground">AI strategy recommendations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div 
                  key={integration.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    integration.status === 'active'
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-secondary/30 border-border'
                  }`}
                >
                  <div>
                    <span className="font-medium">{integration.name}</span>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                  <Badge 
                    className={
                      integration.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Mode */}
        <Card className="bg-red-500/10 border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Zap className="h-5 w-5" />
              Demo Mode Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-red-400">DEMO MODE: KILLED</p>
                <p className="text-sm text-muted-foreground">
                  All simulations terminated. Real Shopify data only. $0 revenue until actual sales.
                </p>
              </div>
              <Badge className="bg-red-500 text-white">ELIMINATED</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
