import { useEffect } from "react";
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
  Loader2
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

export default function BotSwarm() {
  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useBotTeams();
  const { data: bots, isLoading: botsLoading } = useBots();
  const activities = useBotActivities(50);
  const decisions = useTeamDecisions(20);
  const initializeSwarm = useInitializeSwarm();
  const deployBots = useDeployBots();

  const totalBots = bots?.length || 0;
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
    try {
      await deployBots.mutateAsync();
      toast.success("🚀 All 200 Bots Deployed!", {
        description: "Swarm is now active and working"
      });
      refetchTeams();
    } catch (error) {
      toast.error("Deployment failed");
    }
  };

  const handleAddBots = () => {
    toast.info("Bot scaling coming soon", {
      description: "Upgrade to add more bots to your swarm"
    });
  };

  if (teamsLoading || botsLoading || initializeSwarm.isPending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing bot swarm...</p>
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
              BOT SWARM COMMAND
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalBots} bots • {teams?.length || 0} teams • Real-time optimization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary text-primary py-1 px-3">
              <Bot className="h-3 w-3 mr-1" />
              {activeBots} / {totalBots} Active
            </Badge>
            <Button variant="outline" onClick={handleAddBots}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bots
            </Button>
            <Button 
              className="gradient-cyber text-primary-foreground"
              onClick={handleDeployAll}
              disabled={deployBots.isPending}
            >
              {deployBots.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Deploy All
            </Button>
          </div>
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
                    {activeTeams} teams active • {activeBots} bots working
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-cyber font-bold text-primary">{activeBots}</p>
                <p className="text-xs text-muted-foreground">Active Bots</p>
              </div>
            </div>
            <Progress value={totalBots > 0 ? (activeBots / totalBots) * 100 : 0} className="h-3" />
            {bots && <BotSwarmGrid bots={bots} />}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="competitors">Intel</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <CommandCenter onCommandExecuted={refetchTeams} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams?.slice(0, 12).map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  expanded
                  onToggle={() => refetchTeams()}
                />
              ))}
            </div>
            {(teams?.length || 0) > 12 && (
              <p className="text-center text-sm text-muted-foreground">
                + {(teams?.length || 0) - 12} more teams
              </p>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="font-cyber flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Bot Activity
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
                  Team Decisions
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
