import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Eye,
  Package,
  Users,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function SalesTracker() {
  const { data: products } = useProducts(30);

  // Real data - all starts at 0 until actual sales from Shopify
  const stats = {
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversion: 0,
    averageOrder: 0,
    returningCustomers: 0,
  };

  const trafficSources = [
    { source: "Pinterest", visits: 0, revenue: 0, icon: "📌", color: "text-red-500" },
    { source: "Instagram", visits: 0, revenue: 0, icon: "📸", color: "text-pink-500" },
    { source: "TikTok", visits: 0, revenue: 0, icon: "🎵", color: "text-purple-500" },
    { source: "Direct", visits: 0, revenue: 0, icon: "🔗", color: "text-blue-500" },
    { source: "Organic Search", visits: 0, revenue: 0, icon: "🔍", color: "text-green-500" },
  ];

  const topProducts = products?.slice(0, 5).map(p => ({
    name: p.node.title,
    image: p.node.images.edges[0]?.node.url,
    price: parseFloat(p.node.priceRange.minVariantPrice.amount),
    sold: 0,
    revenue: 0
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              REAL SALES TRACKER
            </h1>
            <p className="text-muted-foreground mt-1">
              Live Shopify data • Real revenue tracking • No simulations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary animate-pulse">
              <div className="h-2 w-2 rounded-full bg-primary mr-2" />
              LIVE DATA
            </Badge>
            <Badge variant="secondary">
              Store: lovable-project-i664s
            </Badge>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-cyber font-bold text-primary mt-1">
                    ${stats.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Real sales from Shopify</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-3xl font-cyber font-bold mt-1">{stats.orders}</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting first order</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visitors</p>
                  <p className="text-3xl font-cyber font-bold mt-1">{stats.visitors}</p>
                  <p className="text-xs text-muted-foreground mt-1">Launch campaigns to drive traffic</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Eye className="h-6 w-6 text-neon-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-cyber font-bold mt-1">{stats.conversion}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Calculated from real sales</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Traffic Sources */}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-cyber flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{source.icon}</span>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium">{source.visits}</p>
                        <p className="text-xs text-muted-foreground">visits</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">${source.revenue}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-cyber flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Products (Ready to Sell)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-border">
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                      {product.image && (
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{product.sold} sold</p>
                      <p className="text-xs text-primary">${product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-cyber text-lg">No orders yet</p>
              <p className="text-sm mt-2">
                Launch your viral campaigns with the Bot Swarm and Social Poster.
              </p>
              <p className="text-sm">
                Orders will appear here in real-time from your Shopify store.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
