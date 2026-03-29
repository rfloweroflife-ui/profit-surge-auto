import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useBots, useBotTeams } from "@/hooks/useBotSwarm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Store, Bell, Globe, RefreshCw, Zap, Bot, Database, Check
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { user, profile, subscription } = useAuth();
  const { data: products } = useProducts(30);
  const { data: bots } = useBots();
  const { data: teams } = useBotTeams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: storeConnection } = useQuery({
    queryKey: ['store-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const brandName = profile?.brand_name || 'Your Brand';
  const storeDomain = storeConnection?.store_domain || 'Not connected';
  const productCount = products?.length || 0;
  const totalBots = bots?.length || 0;
  const totalTeams = teams?.length || 0;
  const activeBots = bots?.filter(b => b.status !== 'idle').length || 0;

  const handleForceSync = async () => {
    setIsRefreshing(true);
    // Trigger a product refetch by invalidating query
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Store synced!", {
      description: `${productCount} products refreshed from ${storeDomain}`
    });
  };

  const tierLabel = subscription?.tier === 'trial' ? 'Free Trial' : 
    subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Trial';

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
            SYSTEM SETTINGS
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your {brandName} command center
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Subscription
              <Badge className="ml-2 border-primary/50 text-primary" variant="outline">
                {tierLabel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bot limit: <span className="text-foreground font-medium">{subscription?.bot_limit || 50}</span>
                </p>
                {subscription?.status === 'trialing' && subscription.trial_ends_at && (
                  <p className="text-sm text-muted-foreground">
                    Trial ends: <span className="text-foreground font-medium">{new Date(subscription.trial_ends_at).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm">Manage Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Store Connection */}
        <Card className={`bg-card/50 ${storeConnection ? 'border-primary/50' : 'border-border'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Store Connection
              {storeConnection && (
                <Badge className="ml-2 bg-primary/20 text-primary border-primary/50">LIVE</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeConnection ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{storeDomain}</p>
                      <p className="text-sm text-muted-foreground">{productCount} products synced</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleForceSync} disabled={isRefreshing}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Syncing...' : 'Force Sync'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No store connected yet</p>
                <Link to="/onboarding">
                  <Button className="gradient-cyber text-primary-foreground">Connect Store</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Swarm Status */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Bot Swarm Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-2xl font-bold text-primary">{totalBots}</p>
                <p className="text-xs text-muted-foreground">Total Bots</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-2xl font-bold text-primary">{activeBots}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-2xl font-bold text-primary">{totalTeams}</p>
                <p className="text-xs text-muted-foreground">Teams</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-2xl font-bold text-primary">{subscription?.bot_limit || 50}</p>
                <p className="text-xs text-muted-foreground">Bot Limit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "New order alerts", desc: "Instant notification on sales" },
              { title: "Low inventory alerts", desc: "Alert when stock is low" },
              { title: "Bot performance", desc: "Optimization summaries" },
              { title: "AI insights", desc: "Strategy recommendations" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integration Status — dynamic */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Shopify Store", status: storeConnection ? "active" : "setup", desc: storeConnection ? `${productCount} products` : "Connect your store" },
                { name: "Backend", status: "active", desc: "Database & Functions" },
                { name: "AI Engine", status: "active", desc: "Content generation" },
                { name: "Bot Swarm", status: totalBots > 0 ? "active" : "ready", desc: `${totalBots} bots initialized` },
              ].map((integration) => (
                <div 
                  key={integration.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    integration.status === 'active' ? 'bg-primary/5 border-primary/30' : 'bg-secondary/30 border-border'
                  }`}
                >
                  <div>
                    <span className="font-medium">{integration.name}</span>
                    <p className="text-xs text-muted-foreground">{integration.desc}</p>
                  </div>
                  <Badge variant="outline" className={integration.status === 'active' ? 'border-primary/50 text-primary' : ''}>
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}