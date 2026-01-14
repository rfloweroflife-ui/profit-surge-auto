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
  Pause
} from "lucide-react";

export default function BotSwarm() {
  const botTeams = [
    {
      name: "CEO Bots",
      role: "Strategy & Coordination",
      icon: Brain,
      count: 40,
      status: "active",
      color: "text-primary",
      tasks: ["Campaign orchestration", "Resource allocation", "Performance analysis"]
    },
    {
      name: "Content Bots",
      role: "Content Creation",
      icon: PenTool,
      count: 40,
      status: "active",
      color: "text-accent",
      tasks: ["Pin generation", "Reel scripts", "Caption writing"]
    },
    {
      name: "Analytics Bots",
      role: "Data Analysis",
      icon: BarChart3,
      count: 40,
      status: "active",
      color: "text-neon-blue",
      tasks: ["Performance tracking", "Competitor analysis", "Trend detection"]
    },
    {
      name: "Optimizer Bots",
      role: "Campaign Optimization",
      icon: Settings2,
      count: 40,
      status: "standby",
      color: "text-neon-orange",
      tasks: ["A/B testing", "Budget allocation", "Bid optimization"]
    },
    {
      name: "Closer Bots",
      role: "Conversion & Engagement",
      icon: Target,
      count: 40,
      status: "standby",
      color: "text-neon-pink",
      tasks: ["Comment responses", "DM automation", "Lead nurturing"]
    }
  ];

  const totalBots = botTeams.reduce((sum, team) => sum + team.count, 0);
  const activeBots = botTeams.filter(t => t.status === "active").reduce((sum, team) => sum + team.count, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              BOT SWARM
            </h1>
            <p className="text-muted-foreground mt-1">
              200-bot army for viral marketing automation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary text-primary">
              <Bot className="h-3 w-3 mr-1" />
              {activeBots} / {totalBots} Active
            </Badge>
            <Button className="gradient-cyber text-primary-foreground">
              <Play className="h-4 w-4 mr-2" />
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
                  <p className="text-sm text-muted-foreground">5 teams × 40 bots = 200 total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-cyber font-bold text-primary">{activeBots}</p>
                <p className="text-xs text-muted-foreground">Active Bots</p>
              </div>
            </div>
            <Progress value={(activeBots / totalBots) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Bot Teams Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {botTeams.map((team) => (
            <Card 
              key={team.name} 
              className={`bg-card/50 border-border hover:border-primary/30 transition-all ${
                team.status === "active" ? "border-glow" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <team.icon className={`h-5 w-5 ${team.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-cyber">{team.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{team.role}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={team.status === "active" ? "default" : "secondary"}
                    className={team.status === "active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {team.status === "active" ? (
                      <Activity className="h-3 w-3 mr-1 animate-pulse" />
                    ) : (
                      <Pause className="h-3 w-3 mr-1" />
                    )}
                    {team.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-cyber font-bold">{team.count}</span>
                  <span className="text-xs text-muted-foreground">bots</span>
                </div>
                <div className="space-y-1">
                  {team.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className={`h-3 w-3 ${team.color}`} />
                      {task}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                >
                  {team.status === "active" ? "Pause Team" : "Activate Team"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for deployment</p>
              <p className="text-sm">Deploy bots to see live activity feed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
