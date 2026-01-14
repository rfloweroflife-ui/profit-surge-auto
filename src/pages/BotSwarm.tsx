import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Users, 
  Zap, 
  Activity,
  Brain,
  PenTool,
  BarChart3,
  Settings2,
  Target,
  Play,
  Pause,
  CheckCircle,
  Clock
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";

interface BotTeam {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  count: number;
  status: "active" | "standby" | "deploying";
  color: string;
  tasks: string[];
  assignedProduct?: string;
}

interface ActivityLog {
  id: string;
  team: string;
  action: string;
  timestamp: Date;
  status: "success" | "pending" | "running";
}

export default function BotSwarm() {
  const { data: products } = useProducts(30);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // 40 elite teams of 5 bots each = 200 total
  const [botTeams, setBotTeams] = useState<BotTeam[]>([
    {
      id: "ceo",
      name: "CEO Bots",
      role: "Strategy & Coordination",
      icon: Brain,
      count: 40,
      status: "active",
      color: "text-primary",
      tasks: ["Campaign orchestration", "Resource allocation", "Performance analysis", "Budget optimization"]
    },
    {
      id: "content",
      name: "Content Bots",
      role: "Content Creation",
      icon: PenTool,
      count: 40,
      status: "active",
      color: "text-accent",
      tasks: ["Pin generation", "Reel scripts", "Caption writing", "Hashtag research"]
    },
    {
      id: "analytics",
      name: "Analytics Bots",
      role: "Data Analysis",
      icon: BarChart3,
      count: 40,
      status: "active",
      color: "text-neon-blue",
      tasks: ["Performance tracking", "Competitor analysis", "Trend detection", "ROI calculation"]
    },
    {
      id: "optimizer",
      name: "Optimizer Bots",
      role: "Campaign Optimization",
      icon: Settings2,
      count: 40,
      status: "standby",
      color: "text-neon-orange",
      tasks: ["A/B testing", "Budget allocation", "Bid optimization", "Audience targeting"]
    },
    {
      id: "closer",
      name: "Closer Bots",
      role: "Conversion & Engagement",
      icon: Target,
      count: 40,
      status: "standby",
      color: "text-neon-pink",
      tasks: ["Comment responses", "DM automation", "Lead nurturing", "Cart recovery"]
    }
  ]);

  const totalBots = botTeams.reduce((sum, team) => sum + team.count, 0);
  const activeBots = botTeams.filter(t => t.status === "active").reduce((sum, team) => sum + team.count, 0);

  const deployAll = async () => {
    setIsDeploying(true);
    
    // Simulate deployment with activity logs
    const newLogs: ActivityLog[] = [];
    
    for (let i = 0; i < botTeams.length; i++) {
      const team = botTeams[i];
      setTimeout(() => {
        newLogs.push({
          id: `${Date.now()}-${i}`,
          team: team.name,
          action: `Deploying ${team.count} bots to ${team.role.toLowerCase()}...`,
          timestamp: new Date(),
          status: "running"
        });
        setActivityLog([...newLogs]);
        
        setBotTeams(prev => prev.map(t => 
          t.id === team.id ? { ...t, status: "active" as const } : t
        ));
      }, i * 500);
    }

    setTimeout(() => {
      setIsDeploying(false);
      toast.success("🚀 200 Bots Deployed!", {
        description: "All 40 elite teams are now active and optimizing"
      });
      
      // Add final success log
      setActivityLog(prev => [...prev, {
        id: `${Date.now()}-final`,
        team: "Swarm Command",
        action: "All 200 bots deployed successfully. Beginning viral campaign execution.",
        timestamp: new Date(),
        status: "success"
      }]);
    }, botTeams.length * 500 + 500);
  };

  const toggleTeam = (teamId: string) => {
    setBotTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, status: t.status === "active" ? "standby" as const : "active" as const } 
        : t
    ));
    
    const team = botTeams.find(t => t.id === teamId);
    if (team) {
      const newStatus = team.status === "active" ? "paused" : "activated";
      toast.info(`${team.name} ${newStatus}`, {
        description: `${team.count} bots ${newStatus}`
      });
    }
  };

  // Product assignments for teams
  const productAssignments = products?.slice(0, 8).map((p, i) => ({
    product: p.node.title,
    teams: [
      `Team ${i * 5 + 1}`,
      `Team ${i * 5 + 2}`,
      `Team ${i * 5 + 3}`,
      `Team ${i * 5 + 4}`,
      `Team ${i * 5 + 5}`,
    ]
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              BOT SWARM WAR ROOM
            </h1>
            <p className="text-muted-foreground mt-1">
              200-bot army • 40 elite teams • Viral marketing automation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary text-primary">
              <Bot className="h-3 w-3 mr-1" />
              {activeBots} / {totalBots} Active
            </Badge>
            <Button 
              className="gradient-cyber text-primary-foreground"
              onClick={deployAll}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy All 200
                </>
              )}
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
                  <h3 className="font-cyber text-lg">Elite Swarm Status</h3>
                  <p className="text-sm text-muted-foreground">5 divisions × 40 bots = 200 total • 40 teams of 5</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-cyber font-bold text-primary">{activeBots}</p>
                <p className="text-xs text-muted-foreground">Active Bots</p>
              </div>
            </div>
            <Progress value={(activeBots / totalBots) * 100} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Revenue Generated: $0.00</span>
              <span>Campaigns Active: 0</span>
              <span>Posts Created: 0</span>
            </div>
          </CardContent>
        </Card>

        {/* Bot Teams Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {botTeams.map((team) => (
            <Card 
              key={team.id} 
              className={`bg-card/50 border-border hover:border-primary/30 transition-all ${
                team.status === "active" ? "border-glow" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      <team.icon className={`h-4 w-4 ${team.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-cyber">{team.name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{team.role}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-cyber font-bold">{team.count}</span>
                  <Badge 
                    variant={team.status === "active" ? "default" : "secondary"}
                    className={`text-[10px] ${team.status === "active" ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {team.status === "active" ? (
                      <Activity className="h-2 w-2 mr-1 animate-pulse" />
                    ) : (
                      <Pause className="h-2 w-2 mr-1" />
                    )}
                    {team.status}
                  </Badge>
                </div>
                <div className="space-y-0.5 mb-3">
                  {team.tasks.slice(0, 3).map((task, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Zap className={`h-2 w-2 ${team.color}`} />
                      {task}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-xs"
                  onClick={() => toggleTeam(team.id)}
                >
                  {team.status === "active" ? "Pause" : "Activate"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Assignments */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Product Team Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {productAssignments.slice(0, 8).map((assignment, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-lg bg-secondary/20 border border-border"
                >
                  <p className="text-sm font-medium truncate mb-1">{assignment.product}</p>
                  <div className="flex flex-wrap gap-1">
                    {assignment.teams.map((team, j) => (
                      <Badge key={j} variant="outline" className="text-[10px]">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Waiting for deployment</p>
                <p className="text-sm">Click "Deploy All 200" to activate the swarm</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLog.slice().reverse().map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20"
                  >
                    {log.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : log.status === "running" ? (
                      <Activity className="h-4 w-4 text-accent animate-pulse flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.team}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
