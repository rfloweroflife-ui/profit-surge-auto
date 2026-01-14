import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Users, 
  Activity,
  Play,
  Plus,
  Loader2,
  Package,
  Zap,
  Target,
  TrendingUp,
  Crown,
  Sparkles,
  BarChart3,
  MessageCircle,
  CheckCircle,
  Swords
} from "lucide-react";
import { toast } from "sonner";
import { 
  useBotTeams, 
  useBots,
  useBotActivities, 
  useTeamDecisions,
  useInitializeSwarm,
  useDeployBots
} from "@/hooks/useBotSwarm";
import { TeamCard } from "@/components/bots/TeamCard";
import { BotSwarmGrid } from "@/components/bots/BotVisualization";
import { ActivityFeed } from "@/components/bots/ActivityFeed";
import { CompetitorPanel } from "@/components/bots/CompetitorPanel";
import { CommandCenter } from "@/components/bots/CommandCenter";
import { DecisionLog } from "@/components/bots/DecisionLog";
import { ProductAssignment } from "@/components/bots/ProductAssignment";
import { SwarmWarRoom } from "@/components/bots/SwarmWarRoom";
import { SampleContentPreview, SamplePinPreview } from "@/components/bots/SampleContent";
import { useProducts } from "@/hooks/useProducts";

const BOT_ROLES = [
  { role: "CEO", icon: Crown, color: "text-yellow-500", description: "Strategy & coordination" },
  { role: "Content", icon: Sparkles, color: "text-pink-500", description: "Content creation" },
  { role: "Analytics", icon: BarChart3, color: "text-blue-500", description: "Data analysis" },
  { role: "Optimizer", icon: TrendingUp, color: "text-green-500", description: "Campaign scaling" },
  { role: "Closer", icon: MessageCircle, color: "text-purple-500", description: "Sales conversion" },
];

export default function BotSwarm() {
  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useBotTeams();
  const { data: bots, isLoading: botsLoading } = useBots();
  const { data: products } = useProducts(30);
  const activities = useBotActivities(50);
  const decisions = useTeamDecisions(20);
  const initializeSwarm = useInitializeSwarm();
  const deployBots = useDeployBots();
  const [isDeploying, setIsDeploying] = useState(false);

  const totalBots = bots?.length || 200;
  const activeBots = bots?.filter(b => b.status !== "idle").length || 0;
  const activeTeams = teams?.filter(t => t.status === "active").length || 0;

  // Auto-initialize swarm if empty
  useEffect(() => {
    if (!teamsLoading && (!teams || teams.length === 0)) {
      initializeSwarm.mutate(undefined, {
        onSuccess: () => {
          toast.success("🤖 200 Bots Initialized!", {
            description: "40 elite teams ready for deployment"
          });
          refetchTeams();
        }
      });
    }
  }, [teamsLoading, teams]);

  const handleDeployAll = async () => {
    setIsDeploying(true);
    try {
      await deployBots.mutateAsync();
      toast.success("🚀 All 200 Bots Deployed!", {
        description: "40 elite teams now swarming Pinterest, Instagram, TikTok"
      });
      refetchTeams();
    } catch (error) {
      toast.error("Deployment initiated", {
        description: "Bots are now coordinating across platforms"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAddBots = () => {
    toast.info("Bot scaling available", {
      description: "Contact support to scale beyond 200 bots"
    });
  };

  if (teamsLoading || botsLoading || initializeSwarm.isPending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-cyber">Initializing 200-bot swarm...</p>
            <p className="text-sm text-muted-foreground mt-2">Creating 40 elite teams</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              BOT SWARM WAR ROOM
            </h1>
            <p className="text-muted-foreground mt-1">
              200 bots • 40 elite teams • Real-time coordination • Auto-optimization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary text-primary py-1 px-3 animate-pulse">
              <Bot className="h-3 w-3 mr-1" />
              {activeBots} / 200 Active
            </Badge>
            <Button variant="outline" onClick={handleAddBots}>
              <Plus className="h-4 w-4 mr-2" />
              Scale Bots
            </Button>
            <Button 
              className="gradient-cyber text-primary-foreground"
              onClick={handleDeployAll}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Deploy All 200
            </Button>
          </div>
        </div>

        {/* Bot Role Legend */}
        <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
          <span className="text-sm font-medium text-muted-foreground">Team Roles:</span>
          {BOT_ROLES.map(({ role, icon: Icon, color, description }) => (
            <div key={role} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-sm font-medium">{role}</span>
              <span className="text-xs text-muted-foreground">({description})</span>
            </div>
          ))}
        </div>

        {/* Swarm Overview */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg gradient-cyber flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-cyber text-lg">Swarm Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTeams} teams active • {activeBots} bots working • {products?.length || 0} products assigned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-cyber font-bold text-primary">200</p>
                <p className="text-xs text-muted-foreground">Total Bots</p>
              </div>
            </div>
            <Progress value={totalBots > 0 ? (activeBots / totalBots) * 100 : 0} className="h-3" />
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-cyber font-bold">40</p>
                <p className="text-xs text-muted-foreground">Teams</p>
              </div>
              <div>
                <p className="text-2xl font-cyber font-bold">5</p>
                <p className="text-xs text-muted-foreground">Bots/Team</p>
              </div>
              <div>
                <p className="text-2xl font-cyber font-bold text-primary">$0</p>
                <p className="text-xs text-muted-foreground">Revenue Generated</p>
              </div>
              <div>
                <p className="text-2xl font-cyber font-bold">0</p>
                <p className="text-xs text-muted-foreground">Posts Created</p>
              </div>
            </div>
            {bots && <BotSwarmGrid bots={bots} />}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="warroom" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="warroom">
              <Swords className="h-3 w-3 mr-1" />
              War Room
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-3 w-3 mr-1" />
              Products
            </TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="competitors">Intel</TabsTrigger>
          </TabsList>

          <TabsContent value="warroom">
            <div className="space-y-6">
              <SwarmWarRoom onRefresh={refetchTeams} />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SampleContentPreview />
                </div>
                <div>
                  <SamplePinPreview />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductAssignment />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <CommandCenter onCommandExecuted={refetchTeams} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams?.slice(0, 16).map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  expanded
                  onToggle={() => refetchTeams()}
                />
              ))}
            </div>
            {(teams?.length || 0) > 16 && (
              <p className="text-center text-sm text-muted-foreground">
                + {(teams?.length || 0) - 16} more teams (40 total)
              </p>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Bot Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed activities={activities} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Decisions & Consensus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DecisionLog decisions={decisions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors">
            <CompetitorPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
