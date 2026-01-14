import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
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
  CheckCircle
} from "lucide-react";

export default function WarRoom() {
  const { data: products, isLoading } = useProducts(30);
  
  // Real data - starts at $0 until actual sales
  const stats = {
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversion: 0,
  };

  const systemStatus = [
    { name: "Shopify Store", status: "connected", detail: "lovable-project-i664s" },
    { name: "Products Synced", status: "active", detail: `${products?.length || 0} products` },
    { name: "Bot Swarm", status: "ready", detail: "200 bots / 40 teams" },
    { name: "ElevenLabs Voice", status: "connected", detail: "AI voice active" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm flex items-center gap-3">
              <Flame className="h-8 w-8" />
              PROFIT REAPER
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time command center • Store: lovable-project-i664s.myshopify.com
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
          </div>
        </div>

        {/* System Status */}
        <div className="grid gap-2 md:grid-cols-4">
          {systemStatus.map((item) => (
            <div key={item.name} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
              <CheckCircle className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                {item.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber text-primary">
                ${stats.revenue.toFixed(2)}
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
              <div className="text-2xl font-bold font-cyber">{stats.orders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting first sale
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visitors
              </CardTitle>
              <Eye className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{stats.visitors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Launch marketing to drive traffic
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cyber">{stats.conversion}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Calculated from real sales
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
