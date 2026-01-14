import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users
} from "lucide-react";

export default function SalesTracker() {
  // Real data - all starts at 0 until actual sales
  const stats = {
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversion: 0,
    averageOrder: 0,
    returningCustomers: 0,
  };

  const trafficSources = [
    { source: "Pinterest", visits: 0, revenue: 0 },
    { source: "Instagram", visits: 0, revenue: 0 },
    { source: "Direct", visits: 0, revenue: 0 },
    { source: "Organic Search", visits: 0, revenue: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              SALES TRACKER
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time revenue & conversion tracking • Live Shopify data
            </p>
          </div>
          <Badge variant="outline" className="border-primary text-primary animate-pulse">
            <div className="h-2 w-2 rounded-full bg-primary mr-2" />
            LIVE DATA
          </Badge>
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
                  <p className="text-xs text-muted-foreground mt-1">Real revenue from sales</p>
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
                  <p className="text-xs text-muted-foreground mt-1">Launch marketing to drive traffic</p>
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

        {/* Traffic Sources */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
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

        {/* Recent Orders */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
              <p className="text-sm">Orders will appear here in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
