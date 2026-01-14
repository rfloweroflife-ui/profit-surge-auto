import { BotTeam } from "@/hooks/useBotSwarm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BotVisualization } from "./BotVisualization";
import { 
  Users, 
  Play, 
  Pause, 
  Settings, 
  Target,
  TrendingUp,
  Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: BotTeam;
  onToggle?: (teamId: string) => void;
  onAssign?: (teamId: string) => void;
  expanded?: boolean;
}

export function TeamCard({ team, onToggle, onAssign, expanded = false }: TeamCardProps) {
  const activeBots = team.bots?.filter(b => b.status !== "idle").length || 0;
  const totalBots = team.bots?.length || 5;

  return (
    <Card className={cn(
      "bg-card/50 border-border transition-all",
      team.status === "active" && "border-primary/50 border-glow",
      team.status === "optimizing" && "border-accent/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              team.status === "active" ? "gradient-cyber" : "bg-secondary"
            )}>
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-cyber">{team.name}</CardTitle>
              <p className="text-[10px] text-muted-foreground">
                {team.assigned_product || "Unassigned"} • {team.assigned_platform || "All platforms"}
              </p>
            </div>
          </div>
          <Badge 
            variant={team.status === "active" ? "default" : team.status === "optimizing" ? "secondary" : "outline"}
            className="text-[10px]"
          >
            {team.status === "active" && <Activity className="h-2 w-2 mr-1 animate-pulse" />}
            {team.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bot Activity Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{activeBots}/{totalBots} bots active</span>
            <span>{team.posts_created} posts</span>
          </div>
          <Progress value={(activeBots / totalBots) * 100} className="h-1.5" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/30 rounded p-1.5">
            <p className="text-xs font-bold text-primary">${team.revenue_generated.toFixed(0)}</p>
            <p className="text-[8px] text-muted-foreground">Revenue</p>
          </div>
          <div className="bg-secondary/30 rounded p-1.5">
            <p className="text-xs font-bold text-accent">{team.engagement_rate.toFixed(1)}%</p>
            <p className="text-[8px] text-muted-foreground">Engagement</p>
          </div>
          <div className="bg-secondary/30 rounded p-1.5">
            <p className="text-xs font-bold text-neon-blue">{team.performance_score.toFixed(0)}</p>
            <p className="text-[8px] text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Bot Visualization */}
        {expanded && team.bots && (
          <div className="pt-2 border-t border-border">
            <BotVisualization bots={team.bots} compact />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => onToggle?.(team.id)}
          >
            {team.status === "active" ? (
              <>
                <Pause className="h-3 w-3 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" /> Deploy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onAssign?.(team.id)}
          >
            <Target className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
