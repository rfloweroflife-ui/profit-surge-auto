import { TeamDecision } from "@/hooks/useBotSwarm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain,
  TrendingUp,
  Pause,
  PenTool,
  Crosshair,
  Target,
  CheckCircle,
  Clock,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DecisionLogProps {
  decisions: TeamDecision[];
}

const decisionIcons = {
  scale: TrendingUp,
  pause: Pause,
  modify: PenTool,
  steal: Crosshair,
  create: PenTool,
  target: Target,
};

const decisionColors = {
  scale: "text-primary",
  pause: "text-muted-foreground",
  modify: "text-accent",
  steal: "text-destructive",
  create: "text-neon-blue",
  target: "text-neon-orange",
};

export function DecisionLog({ decisions }: DecisionLogProps) {
  const executeDecision = async (decision: TeamDecision) => {
    try {
      await supabase
        .from("team_decisions")
        .update({ executed: true, outcome: "Executed successfully" })
        .eq("id", decision.id);
      
      // Log activity
      await supabase.from("bot_activities").insert({
        team_id: decision.team_id,
        action: `Executed decision: ${decision.decision}`,
        action_type: "decision",
        target: decision.decision_type,
        result: "success",
      });

      toast.success("Decision executed!", {
        description: decision.decision
      });
    } catch (error) {
      toast.error("Failed to execute decision");
    }
  };

  if (decisions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No team decisions yet</p>
        <p className="text-sm">Bots will make collaborative decisions here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px] pr-2">
      <div className="space-y-3">
        {decisions.map((decision) => {
          const Icon = decisionIcons[decision.decision_type] || Brain;
          
          return (
            <div
              key={decision.id}
              className={cn(
                "p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-2",
                decision.consensus_reached && !decision.executed && "border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "h-7 w-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                    decision.executed ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <Icon className={cn("h-4 w-4", decisionColors[decision.decision_type])} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{decision.decision}</p>
                    {decision.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {decision.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={decision.executed ? "default" : decision.consensus_reached ? "secondary" : "outline"}
                  className="text-[10px] flex-shrink-0"
                >
                  {decision.executed ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </>
                  ) : decision.consensus_reached ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Ready
                    </>
                  ) : (
                    "Voting"
                  )}
                </Badge>
              </div>

              {decision.consensus_reached && !decision.executed && (
                <Button
                  size="sm"
                  className="w-full h-7 text-xs gradient-cyber"
                  onClick={() => executeDecision(decision)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Execute Decision
                </Button>
              )}

              {decision.outcome && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {decision.outcome}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <span className="uppercase">{decision.decision_type}</span>
                <span>{new Date(decision.created_at).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
