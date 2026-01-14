import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Users,
  Zap,
  TrendingUp,
  DollarSign,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Sparkles,
  BarChart3,
  Instagram,
  Share2,
} from "lucide-react";
import { useAutoOptimization, useAutoAssignToProducts } from "@/hooks/useAutoOptimization";
import { useBotTeams, useBots, useDeployBots } from "@/hooks/useBotSwarm";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface SwarmWarRoomProps {
  onRefresh: () => void;
}

export function SwarmWarRoom({ onRefresh }: SwarmWarRoomProps) {
  const { data: teams } = useBotTeams();
  const { data: bots } = useBots();
  const { data: products } = useProducts(30);
  const deployBots = useDeployBots();
  const { assignProductsToTeams } = useAutoAssignToProducts();
  const {
    stats,
    isActive,
    startOptimization,
    stopOptimization,
    runOptimization,
  } = useAutoOptimization(15);

  const [isDeploying, setIsDeploying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const totalBots = bots?.length || 200;
  const activeBots = bots?.filter((b) => b.status !== "idle").length || 0;
  const activeTeams = teams?.filter((t) => t.status === "active").length || 0;
  const assignedTeams = teams?.filter((t) => t.assigned_product).length || 0;
  const totalRevenue = teams?.reduce((sum, t) => sum + (t.revenue_generated || 0), 0) || 0;
  const totalPosts = teams?.reduce((sum, t) => sum + (t.posts_created || 0), 0) || 0;

  // Calculate time until next run
  const [timeUntilNext, setTimeUntilNext] = useState("");
  useEffect(() => {
    if (!stats.nextRun) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = stats.nextRun!.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeUntilNext("Running...");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeUntilNext(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.nextRun]);

  const handleDeployAll = async () => {
    setIsDeploying(true);
    try {
      await deployBots.mutateAsync();
      toast.success("🚀 All 200 Bots Deployed!", {
        description: "40 elite teams now active",
      });
      onRefresh();
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!products || products.length === 0) {
      toast.error("No products available");
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignProductsToTeams(products.slice(0, 20));
      toast.success(`✅ Auto-assigned ${result.products} products to ${result.assigned} teams!`);
      onRefresh();
    } catch (error) {
      toast.error("Assignment failed");
    } finally {
      setIsAssigning(false);
    }
  };

  // Platform breakdown
  const pinterestTeams = teams?.filter((t) => t.assigned_platform === "pinterest").length || 0;
  const instagramTeams = teams?.filter((t) => t.assigned_platform === "instagram").length || 0;

  return (
    <div className="space-y-6">
      {/* Swarm Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-cyber font-bold text-primary">
                  {activeBots} / {totalBots}
                </p>
              </div>
              <Bot className="h-8 w-8 text-primary opacity-50" />
            </div>
            <Progress value={(activeBots / totalBots) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-cyber font-bold">{activeTeams} / 40</p>
              </div>
              <Users className="h-8 w-8 text-accent opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {assignedTeams} assigned to products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Posts Created</p>
                <p className="text-2xl font-cyber font-bold">{totalPosts}</p>
              </div>
              <Sparkles className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-cyber font-bold text-primary">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Real sales from Shopify</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Optimization</p>
                <p className="text-2xl font-cyber font-bold">
                  {stats.runsCompleted}
                </p>
              </div>
              <RefreshCw className={`h-8 w-8 opacity-50 ${stats.isRunning ? "animate-spin text-primary" : ""}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cycles completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-cyber flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Swarm Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actions Row */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleDeployAll}
              disabled={isDeploying || activeBots === totalBots}
              className="gradient-cyber"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy All 200 Bots
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleAutoAssign}
              disabled={isAssigning}
            >
              {isAssigning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Auto-Assign Products
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={runOptimization}
              disabled={stats.isRunning}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Run Optimization Now
            </Button>
          </div>

          {/* Auto-Optimization Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isActive ? "bg-primary/20" : "bg-secondary"}`}>
                <Clock className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-medium">Auto-Optimization (15 min)</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? (
                    <>
                      Next run in: <span className="text-primary font-mono">{timeUntilNext}</span>
                    </>
                  ) : (
                    "Enable to automatically scale winners & pause losers"
                  )}
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => {
                if (checked) {
                  startOptimization();
                } else {
                  stopOptimization();
                }
              }}
            />
          </div>

          {/* Optimization Stats */}
          {(stats.runsCompleted > 0 || isActive) && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/10 border border-border">
              <div className="text-center">
                <p className="text-2xl font-cyber font-bold text-primary">{stats.winnersScaled}</p>
                <p className="text-xs text-muted-foreground">Winners Scaled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-cyber font-bold text-red-400">{stats.losersKilled}</p>
                <p className="text-xs text-muted-foreground">Losers Paused</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-cyber font-bold">{stats.runsCompleted}</p>
                <p className="text-xs text-muted-foreground">Cycles Run</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="h-5 w-5 text-red-500" />
              Pinterest Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-cyber font-bold">{pinterestTeams}</span>
              <Badge variant="outline" className="border-red-500/30 text-red-500">
                Active
              </Badge>
            </div>
            <Progress value={(pinterestTeams / 40) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Creating viral Pins & Rich Pins
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Instagram className="h-5 w-5 text-pink-500" />
              Instagram Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-cyber font-bold">{instagramTeams}</span>
              <Badge variant="outline" className="border-pink-500/30 text-pink-500">
                Active
              </Badge>
            </div>
            <Progress value={(instagramTeams / 40) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Posting Reels & Stories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Assignments Preview */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-cyber flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Team Assignments ({assignedTeams} / 40)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {teams?.slice(0, 8).map((team) => (
              <div
                key={team.id}
                className={`p-3 rounded-lg border transition-all ${
                  team.assigned_product
                    ? "bg-primary/5 border-primary/30"
                    : "bg-secondary/20 border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{team.name}</span>
                  {team.status === "active" ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {team.assigned_product || "Unassigned"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {team.assigned_platform || "—"}
                  </Badge>
                  <span className="text-[10px] text-primary">
                    {(team.engagement_rate || 0).toFixed(1)}% eng
                  </span>
                </div>
              </div>
            ))}
          </div>
          {(teams?.length || 0) > 8 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              + {(teams?.length || 0) - 8} more teams
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
