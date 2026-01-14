import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Bookmark, 
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversionMetric {
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface PinPerformance {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  saves: number;
  clickRate: number;
  image_url?: string;
}

export function PinterestAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversionTokenValid, setConversionTokenValid] = useState(false);
  const [pins, setPins] = useState<PinPerformance[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock conversion metrics for demo
  const conversionMetrics: ConversionMetric[] = [
    { 
      name: "Conversions", 
      value: 847, 
      change: 23.5, 
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-accent"
    },
    { 
      name: "Revenue Attributed", 
      value: 12450, 
      change: 18.2, 
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-500"
    },
    { 
      name: "Click-Through Rate", 
      value: 4.8, 
      change: 1.2, 
      icon: <MousePointerClick className="h-5 w-5" />,
      color: "text-primary"
    },
    { 
      name: "Conversion Rate", 
      value: 2.3, 
      change: -0.4, 
      icon: <Target className="h-5 w-5" />,
      color: "text-neon-blue"
    },
  ];

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      // Check Pinterest connection
      const { data: connectionData, error: connectionError } = await supabase.functions.invoke("pinterest-auth", {
        body: { action: "check_status" }
      });

      if (!connectionError && connectionData?.connected) {
        setIsConnected(true);
      }

      // Check conversion token
      const { data: conversionData, error: conversionError } = await supabase.functions.invoke("pinterest-auth", {
        body: { action: "get_conversion_stats" }
      });

      if (!conversionError && conversionData?.conversionTokenValid) {
        setConversionTokenValid(true);
      }

      // Fetch pins from database
      const { data: pinsData } = await supabase
        .from("pinterest_pins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (pinsData) {
        setPins(pinsData.map(pin => ({
          id: pin.id,
          title: pin.title,
          impressions: pin.impressions || 0,
          clicks: pin.clicks || 0,
          saves: pin.saves || 0,
          clickRate: pin.impressions ? ((pin.clicks || 0) / pin.impressions * 100) : 0,
          image_url: pin.image_url || undefined
        })));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to check Pinterest status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const sendTestConversion = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pinterest-auth", {
        body: {
          action: "send_conversion",
          event_name: "checkout",
          event_time: Math.floor(Date.now() / 1000),
          event_id: crypto.randomUUID(),
          user_data: {
            client_ip_address: "0.0.0.0",
            client_user_agent: navigator.userAgent
          },
          custom_data: {
            currency: "USD",
            value: "99.99",
            content_ids: ["test-product-123"]
          },
          action_source: "web"
        }
      });

      if (error) throw error;

      toast.success("Test conversion sent!", {
        description: "Conversion event tracked successfully"
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to send conversion", {
        description: "Check your Pinterest Conversion Token"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📌</div>
          <div>
            <h3 className="font-semibold">Pinterest Analytics</h3>
            <p className="text-xs text-muted-foreground">
              Conversion tracking & pin performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge className="bg-accent/20 text-accent border-accent/50">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
          {conversionTokenValid && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
              <Target className="h-3 w-3 mr-1" />
              Conversions Active
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnectionStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {conversionMetrics.map((metric) => (
          <Card key={metric.name} className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={metric.color}>{metric.icon}</span>
                <div className={`flex items-center text-xs ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold">
                {metric.name === "Revenue Attributed" ? `$${metric.value.toLocaleString()}` : 
                 metric.name.includes("Rate") ? `${metric.value}%` : 
                 metric.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{metric.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Tracking Actions */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            Conversion Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
            <div>
              <p className="font-medium">Pinterest Conversion API</p>
              <p className="text-xs text-muted-foreground">
                Track checkouts, add-to-carts, and page views
              </p>
            </div>
            <div className="flex items-center gap-2">
              {conversionTokenValid ? (
                <>
                  <Badge className="bg-green-500/20 text-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={sendTestConversion}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    Test Conversion
                  </Button>
                </>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Token Not Set
                </Badge>
              )}
            </div>
          </div>

          {/* Conversion Event Types */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Page Views", count: 24580, icon: Eye },
              { name: "Add to Cart", count: 1245, icon: ShoppingCart },
              { name: "Checkouts", count: 847, icon: Target },
              { name: "Pin Saves", count: 3420, icon: Bookmark }
            ].map((event) => (
              <div key={event.name} className="p-3 rounded-lg bg-secondary/20 text-center">
                <event.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">{event.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{event.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pin Performance */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            Top Performing Pins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pins tracked yet</p>
              <p className="text-xs mt-1">Post pins to see performance data</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {pins.map((pin, index) => (
                  <div 
                    key={pin.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    {pin.image_url ? (
                      <img 
                        src={pin.image_url} 
                        alt={pin.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                        📌
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pin.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {pin.impressions.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {pin.clicks.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Bookmark className="h-3 w-3" />
                          {pin.saves.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{pin.clickRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                    <div className="w-16">
                      <Progress value={Math.min(pin.clickRate * 10, 100)} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
