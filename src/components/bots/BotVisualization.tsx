import { Bot as BotType } from "@/hooks/useBotSwarm";
import { Bot, Brain, PenTool, BarChart3, Settings2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotVisualizationProps {
  bots: BotType[];
  compact?: boolean;
}

const roleIcons = {
  ceo: Brain,
  content: PenTool,
  analytics: BarChart3,
  optimizer: Settings2,
  closer: Target,
};

const roleColors = {
  ceo: "text-primary",
  content: "text-accent",
  analytics: "text-neon-blue",
  optimizer: "text-neon-orange",
  closer: "text-neon-pink",
};

const statusColors = {
  idle: "bg-muted",
  working: "bg-primary animate-pulse",
  analyzing: "bg-neon-blue animate-pulse",
  optimizing: "bg-neon-orange animate-pulse",
  posting: "bg-accent animate-pulse",
};

export function BotVisualization({ bots, compact = false }: BotVisualizationProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {bots.map((bot) => {
          const Icon = roleIcons[bot.role];
          return (
            <div
              key={bot.id}
              className={cn(
                "h-6 w-6 rounded flex items-center justify-center relative group cursor-pointer transition-transform hover:scale-110",
                statusColors[bot.status]
              )}
              title={`${bot.name}: ${bot.current_task || bot.status}`}
            >
              <Icon className={cn("h-3 w-3", roleColors[bot.role])} />
              {bot.status !== "idle" && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {bots.map((bot) => {
        const Icon = roleIcons[bot.role];
        return (
          <div
            key={bot.id}
            className={cn(
              "p-3 rounded-lg border border-border/50 relative group cursor-pointer transition-all hover:border-primary/50",
              statusColors[bot.status]
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-4 w-4", roleColors[bot.role])} />
              <span className="text-xs font-medium truncate">{bot.role.toUpperCase()}</span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {bot.current_task || "Standing by"}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Tasks: {bot.tasks_completed}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[8px] uppercase",
                bot.status === "idle" ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
              )}>
                {bot.status}
              </span>
            </div>
            {bot.status !== "idle" && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-ping" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BotSwarmGrid({ bots }: { bots: BotType[] }) {
  const roleGroups = {
    ceo: bots.filter((b) => b.role === "ceo"),
    content: bots.filter((b) => b.role === "content"),
    analytics: bots.filter((b) => b.role === "analytics"),
    optimizer: bots.filter((b) => b.role === "optimizer"),
    closer: bots.filter((b) => b.role === "closer"),
  };

  return (
    <div className="space-y-4">
      {Object.entries(roleGroups).map(([role, roleBots]) => {
        const Icon = roleIcons[role as keyof typeof roleIcons];
        const activeBots = roleBots.filter((b) => b.status !== "idle").length;
        
        return (
          <div key={role} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", roleColors[role as keyof typeof roleColors])} />
                <span className="text-sm font-medium capitalize">{role} Bots</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {activeBots}/{roleBots.length} active
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {roleBots.map((bot) => (
                <div
                  key={bot.id}
                  className={cn(
                    "h-4 w-4 rounded-sm transition-all",
                    bot.status === "idle" 
                      ? "bg-muted" 
                      : cn(statusColors[bot.status], "shadow-glow-sm")
                  )}
                  title={`${bot.name}: ${bot.current_task || bot.status}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
