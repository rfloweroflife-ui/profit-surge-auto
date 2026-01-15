import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useKlaviyo } from '@/hooks/useKlaviyo';
import { 
  Mail, 
  Zap, 
  Plus, 
  Send, 
  Users, 
  TrendingUp, 
  Loader2,
  CheckCircle2,
  RefreshCw,
  Workflow,
  Target,
  DollarSign,
  Eye,
  MousePointer
} from "lucide-react";

export function KlaviyoDashboard() {
  const {
    isConnecting,
    isLoading,
    connection,
    campaigns,
    flows,
    connect,
    getLists,
    syncSubscribers,
    createCampaign,
    createFlow,
    fetchCampaigns,
    fetchFlows,
    checkConnection
  } = useKlaviyo();

  const [apiKey, setApiKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSubject, setNewCampaignSubject] = useState('');
  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    checkConnection();
    fetchCampaigns();
    fetchFlows();
  }, []);

  const handleConnect = async () => {
    if (!apiKey) {
      toast.error('Please enter your Klaviyo API key');
      return;
    }
    await connect(apiKey, privateKey);
    setApiKey('');
    setPrivateKey('');
  };

  const handleLoadLists = async () => {
    const loadedLists = await getLists();
    setLists(loadedLists);
  };

  const handleCreateQuickCampaign = async () => {
    if (!newCampaignName || !newCampaignSubject) {
      toast.error('Please enter campaign name and subject');
      return;
    }

    await createCampaign({
      name: newCampaignName,
      subject: newCampaignSubject,
      preview_text: '🔥 Limited time offer inside!'
    });

    setNewCampaignName('');
    setNewCampaignSubject('');
  };

  const handleCreateWelcomeFlow = async () => {
    await createFlow({
      name: 'Welcome Series - New Subscriber',
      trigger_type: 'list_subscribe',
      trigger_conditions: { list_id: 'new_subscribers' },
      flow_steps: [
        { type: 'email', delay: '0h', subject: 'Welcome to the family! 🎉' },
        { type: 'email', delay: '24h', subject: 'Here\'s your exclusive 10% off!' },
        { type: 'email', delay: '72h', subject: 'Don\'t miss our bestsellers!' }
      ]
    });
  };

  const handleCreateAbandonedCartFlow = async () => {
    await createFlow({
      name: 'Abandoned Cart Recovery',
      trigger_type: 'checkout_started',
      trigger_conditions: { abandoned_after: '1h' },
      flow_steps: [
        { type: 'email', delay: '1h', subject: 'You left something behind! 🛒' },
        { type: 'email', delay: '24h', subject: 'Still thinking about it? Here\'s 15% off!' },
        { type: 'sms', delay: '48h', message: 'Your cart is expiring soon!' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`border-2 transition-all ${
        connection ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="font-cyber text-lg">Klaviyo Email Marketing</CardTitle>
                <Badge className={connection 
                  ? "bg-green-500/20 text-green-500" 
                  : "bg-yellow-500/20 text-yellow-500"
                }>
                  {connection ? '✓ Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
            {connection && (
              <Button variant="outline" size="sm" onClick={syncSubscribers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Subscribers
              </Button>
            )}
          </div>
        </CardHeader>
        
        {!connection && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="klaviyo-api">Private API Key</Label>
                <Input
                  id="klaviyo-api"
                  type="password"
                  placeholder="pk_xxx..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="klaviyo-private">Public API Key (Optional)</Label>
                <Input
                  id="klaviyo-private"
                  type="password"
                  placeholder="Optional for tracking"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !apiKey}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Connect Klaviyo
            </Button>
          </CardContent>
        )}
      </Card>

      {connection && (
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="campaigns">
              <Send className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="flows">
              <Workflow className="h-4 w-4 mr-2" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="quick-create">
              <Plus className="h-4 w-4 mr-2" />
              Quick Create
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cyber text-lg">Email Campaigns</h3>
              <Button variant="outline" size="sm" onClick={handleLoadLists}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Lists
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Send className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{campaigns.length}</p>
                      <p className="text-xs text-muted-foreground">Total Campaigns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {campaigns.reduce((acc, c) => acc + (c.opens || 0), 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Opens</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        ${campaigns.reduce((acc, c) => acc + Number(c.revenue || 0), 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign List */}
            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <Card className="bg-secondary/20">
                  <CardContent className="p-8 text-center">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No campaigns yet. Create your first campaign!</p>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-secondary/20 hover:bg-secondary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={campaign.status === 'sent' ? 'default' : 'outline'}>
                            {campaign.status}
                          </Badge>
                          <div className="text-right text-sm">
                            <p className="text-green-500">{campaign.opens} opens</p>
                            <p className="text-blue-500">{campaign.clicks} clicks</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Flows Tab */}
          <TabsContent value="flows" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cyber text-lg">Automation Flows</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateWelcomeFlow} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Welcome Flow
                </Button>
                <Button size="sm" variant="outline" onClick={handleCreateAbandonedCartFlow} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cart Recovery
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {flows.length === 0 ? (
                <Card className="bg-secondary/20 col-span-2">
                  <CardContent className="p-8 text-center">
                    <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No flows yet. Create your first automation!</p>
                  </CardContent>
                </Card>
              ) : (
                flows.map((flow) => (
                  <Card key={flow.id} className="bg-secondary/20 hover:bg-secondary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{flow.name}</h4>
                        <Badge variant={flow.is_active ? 'default' : 'outline'}>
                          {flow.is_active ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-lg font-bold">{flow.total_triggered}</p>
                          <p className="text-xs text-muted-foreground">Triggered</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-lg font-bold text-green-500">
                            ${Number(flow.revenue_generated || 0).toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <p className="text-lg font-bold text-blue-500">{flow.trigger_type}</p>
                          <p className="text-xs text-muted-foreground">Trigger</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Quick Create Tab */}
          <TabsContent value="quick-create" className="space-y-4">
            <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="font-cyber flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  Quick Campaign Creator
                </CardTitle>
                <CardDescription>Create and send email campaigns in seconds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Flash Sale - January 2025"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-subject">Subject Line</Label>
                    <Input
                      id="campaign-subject"
                      placeholder="🔥 50% OFF - Today Only!"
                      value={newCampaignSubject}
                      onChange={(e) => setNewCampaignSubject(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateQuickCampaign}
                  disabled={isLoading || !newCampaignName || !newCampaignSubject}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Pre-built Campaign Templates */}
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="font-cyber text-lg">🚀 Pre-built Campaign Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { name: 'Flash Sale Blast', subject: '⚡ 24-HOUR FLASH SALE - Up to 70% OFF!', type: 'promotional' },
                    { name: 'New Arrival Alert', subject: '✨ Just Dropped: Your New Favorite Products', type: 'product' },
                    { name: 'VIP Early Access', subject: '🎁 Exclusive: VIP Early Access Starts NOW', type: 'exclusive' },
                    { name: 'Re-engagement', subject: 'We miss you! Here\'s 20% OFF to come back', type: 'winback' },
                    { name: 'Review Request', subject: 'How did we do? Leave a review for 15% OFF', type: 'review' },
                    { name: 'Birthday Special', subject: '🎂 Happy Birthday! Your gift awaits...', type: 'birthday' }
                  ].map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="h-auto py-3 flex-col items-start text-left hover:border-emerald-500/50"
                      onClick={() => {
                        setNewCampaignName(template.name);
                        setNewCampaignSubject(template.subject);
                        toast.success(`Template loaded: ${template.name}`);
                      }}
                    >
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{template.subject}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
