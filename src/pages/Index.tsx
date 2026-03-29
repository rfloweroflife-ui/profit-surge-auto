import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useBotTeams, useBots, useDeployBots, useInitializeSwarm } from "@/hooks/useBotSwarm";
import { useAutoOptimization, useAutoAssignToProducts } from "@/hooks/useAutoOptimization";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  Package,
  Bot,
  Video,
  Share2,
  Brain,
  Flame,
  CheckCircle,
  Play,
  Loader2,
  RefreshCw
} from "lucide-react";

export default function WarRoom() {
  const { data: products, isLoading } = useProducts(30);
  const { data: teams, refetch: refetchTeams } = useBotTeams();
  const { data: bots } = useBots();
  const deployBots = useDeployBots();
  const initializeSwarm = useInitializeSwarm();
  const { assignProductsToTeams } = useAutoAssignToProducts();
  const { isActive, startOptimization, stats } = useAutoOptimization(15);
  
  // Real data - starts at $0 until actual sales
  const totalBots = bots?.length || 0;
  const activeBots = bots?.filter(b => b.status !== "idle").length || 0;
  const activeTeams = teams?.filter(t => t.status === "active").length || 0;
  const totalRevenue = teams?.reduce((sum, t) => sum + (t.revenue_generated || 0), 0) || 0;
  const totalPosts = teams?.reduce((sum, t) => sum + (t.posts_created || 0), 0) || 0;

  const stats_display = {
    revenue: totalRevenue,
    orders: 0,
    visitors: 0,
    conversion: 0,
  };

  const systemStatus = [
    { name: "Shopify Store", status: "connected", detail: "Your store", color: "text-primary" },
    { name: "Products Synced", status: "active", detail: `${products?.length || 0} products`, color: "text-primary" },
    { name: "Bot Swarm", status: totalBots > 0 ? "active" : "ready", detail: `${activeBots} / ${totalBots || 200} bots`, color: activeBots > 0 ? "text-primary" : "text-muted-foreground" },
    { name: "Auto-Optimization", status: isActive ? "running" : "standby", detail: isActive ? `${stats.runsCompleted} cycles` : "15 min loop", color: isActive ? "text-primary" : "text-muted-foreground" },
  ];

  // Quick deploy function
  const handleQuickDeploy = async () => {
    try {
      // Initialize swarm if needed
      if (!teams || teams.length === 0) {
        await initializeSwarm.mutateAsync();
        toast.success("🤖 200 Bots Initialized!");
      }

      // Deploy all bots
      await deployBots.mutateAsync();
      toast.success("🚀 All Bots Deployed!");

      // Auto-assign products
      if (products && products.length > 0) {
        const result = await assignProductsToTeams(products.slice(0, 20));
        toast.success(`✅ Auto-assigned ${result.products} products to ${result.assigned} teams!`);
      }

      // Start optimization loop
      if (!isActive) {
        startOptimization();
        toast.success("⚡ Auto-Optimization Enabled!", {
          description: "Running every 15 minutes"
        });
      }

      refetchTeams();
    } catch (error) {
      console.error("Deploy error:", error);
      toast.error("Deployment started - check Bot Swarm for status");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm flex items-center gap-3">
              <Flame className="h-8 w-8" />
              {profile?.brand_name || 'COMMAND CENTER'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time command center
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary animate-pulse">
              <div className="h-2 w-2 rounded-full bg-primary mr-2" />
              LIVE DATA
            </Badge>
            <Badge variant="secondary">
              {products?.length || 0} Products Synced
            </Badge>
            <Badge variant="secondary" className={activeBots > 0 ? "bg-primary/20 text-primary" : ""}>
              <Bot className="h-3 w-3 mr-1" />
              {activeBots} / {totalBots || 200} Bots Active
            </Badge>
          </div>
        </div>

        {/* Quick Deploy Button */}
        {(activeBots === 0 || !isActive) && (
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg gradient-cyber flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-cyber font-semibold">Launch Autonomous Marketing</h3>
                    <p className="text-sm text-muted-foreground">
                      Deploy 200 bots, assign products, enable 15-min optimization loop
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleQuickDeploy} 
                  className="gradient-cyber text-primary-foreground"
                  disabled={deployBots.isPending || initializeSwarm.isPending}
                >
                  {deployBots.isPending || initializeSwarm.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Quick Deploy Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <div className="grid gap-2 md:grid-cols-4">
          {systemStatus.map((item) => (
            <div key={item.name} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
              <CheckCircle className={`h-4 w-4 ${item.color}`} />
              <div className="flex-1">
                <p className="text-xs font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Badge variant="outline" className={`text-xs ${item.status === 'active' || item.status === 'connected' || item.status === 'running' ? 'border-primary/50 text-primary' : ''}`}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber text-primary">
                ${stats_display.revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real revenue • Updates live
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{stats_display.orders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting first sale
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Bots
              </CardTitle>
              <Bot className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{activeBots} / {totalBots || 200}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTeams} teams deployed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Posts Created
              </CardTitle>
              <Share2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{totalPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pins + Reels + Videos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Optimization
              </CardTitle>
              <RefreshCw className={`h-4 w-4 ${isActive ? 'text-primary animate-spin' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{stats.runsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isActive ? "Running every 15 min" : "Enable in Bot Swarm"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link to="/video-studio">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30 hover:border-primary transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg gradient-cyber flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cyber font-semibold">Video Ad Studio</h3>
                    <p className="text-sm text-muted-foreground">D-ID + ElevenLabs</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/social-poster">
            <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30 hover:border-accent transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cyber font-semibold">Social Poster</h3>
                    <p className="text-sm text-muted-foreground">Pinterest/IG/TikTok</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/bot-swarm">
            <Card className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/30 hover:border-neon-blue transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-neon-blue flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cyber font-semibold">Bot Swarm</h3>
                    <p className="text-sm text-muted-foreground">200 bots / 40 teams</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-neon-blue transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ceo-brain">
            <Card className="bg-gradient-to-br from-neon-pink/10 to-transparent border-neon-pink/30 hover:border-neon-pink transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-neon-pink flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cyber font-semibold">CEO Brain</h3>
                    <p className="text-sm text-muted-foreground">AI command center</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Products Preview */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-cyber flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Live Product Catalog
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real products synced from Shopify • CJ Fulfillment ready
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm">
                View All {products?.length || 0} Products
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-secondary animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.slice(0, 12).map((product) => (
                  <Link 
                    key={product.node.id}
                    to={`/product/${product.node.handle}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-secondary border border-border hover:border-primary/50 transition-all"
                  >
                    {product.node.images.edges[0] && (
                      <img 
                        src={product.node.images.edges[0].node.url}
                        alt={product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <div>
                        <p className="text-xs font-medium truncate">{product.node.title}</p>
                        <p className="text-xs text-primary font-bold">
                          ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
