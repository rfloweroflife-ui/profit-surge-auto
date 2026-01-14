import { BotActivity } from "@/hooks/useBotSwarm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  BarChart3,
  PenTool,
  Send,
  Settings2,
  Crosshair,
  Brain,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: BotActivity[];
}

const actionIcons = {
  analyze: BarChart3,
  create: PenTool,
  post: Send,
  optimize: Settings2,
  steal: Crosshair,
  decision: Brain,
};

const actionColors = {
  analyze: "text-neon-blue",
  create: "text-accent",
  post: "text-primary",
  optimize: "text-neon-orange",
  steal: "text-destructive",
  decision: "text-neon-pink",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No bot activity yet</p>
        <p className="text-sm">Deploy bots to see live activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = actionIcons[activity.action_type] || Activity;
          const isNew = index === 0;
          
          return (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50 transition-all",
                isNew && "border-primary/30 bg-primary/5"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                isNew ? "gradient-cyber" : "bg-secondary"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isNew ? "text-primary-foreground" : actionColors[activity.action_type]
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight">{activity.action}</p>
                {activity.target && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: {activity.target}
                  </p>
                )}
                {activity.result && (
                  <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {activity.result}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(new Date(activity.created_at))}
                </span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded mt-1 uppercase",
                  actionColors[activity.action_type],
                  "bg-secondary/50"
                )}>
                  {activity.action_type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
