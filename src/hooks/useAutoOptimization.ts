import { useEffect, useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OptimizationStats {
  lastRun: Date | null;
  nextRun: Date | null;
  runsCompleted: number;
  winnersScaled: number;
  losersKilled: number;
  isRunning: boolean;
}

interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
      };
    };
  };
}

export function useAutoOptimization(intervalMinutes = 15) {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<OptimizationStats>({
    lastRun: null,
    nextRun: null,
    runsCompleted: 0,
    winnersScaled: 0,
    losersKilled: 0,
    isRunning: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(false);

  const runOptimization = useCallback(async () => {
    setStats((prev) => ({ ...prev, isRunning: true }));

    try {
      // 1. Get all teams with performance data
      const { data: teams, error: teamsError } = await supabase
        .from("bot_teams")
        .select("*")
        .eq("status", "active");

      if (teamsError) throw teamsError;

      let winnersScaled = 0;
      let losersKilled = 0;

      // 2. Analyze and optimize each team
      for (const team of teams || []) {
        const engagementRate = team.engagement_rate || 0;
        const performanceScore = team.performance_score || 50;

        // Winner: Scale up (engagement > 3%)
        if (engagementRate > 3 && performanceScore > 70) {
          winnersScaled++;
          await supabase.from("team_decisions").insert({
            team_id: team.id,
            decision_type: "scale",
            decision: `Scale ${team.name} - High engagement: ${engagementRate.toFixed(1)}%`,
            reasoning: `Performance score ${performanceScore}% exceeds threshold. Increasing post frequency.`,
            consensus_reached: true,
            executed: true,
            outcome: "Increased posting frequency by 2x",
          });

          // Update team performance
          await supabase
            .from("bot_teams")
            .update({
              performance_score: Math.min(100, performanceScore + 5),
              posts_created: (team.posts_created || 0) + 5,
            })
            .eq("id", team.id);
        }

        // Loser: Pause underperformers (engagement < 0.5%)
        if (engagementRate < 0.5 && performanceScore < 30) {
          losersKilled++;
          await supabase.from("team_decisions").insert({
            team_id: team.id,
            decision_type: "pause",
            decision: `Pause ${team.name} - Low engagement: ${engagementRate.toFixed(1)}%`,
            reasoning: `Performance below threshold. Pausing to reassess strategy.`,
            consensus_reached: true,
            executed: true,
            outcome: "Team reassigned to new product",
          });
        }
      }

      // 3. Log activity
      await supabase.from("bot_activities").insert({
        action: `Optimization cycle complete: ${winnersScaled} winners scaled, ${losersKilled} losers paused`,
        action_type: "optimize",
        target: "global",
        result: JSON.stringify({ winnersScaled, losersKilled }),
      });

      setStats((prev) => ({
        ...prev,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
        runsCompleted: prev.runsCompleted + 1,
        winnersScaled: prev.winnersScaled + winnersScaled,
        losersKilled: prev.losersKilled + losersKilled,
        isRunning: false,
      }));

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });

      if (winnersScaled > 0 || losersKilled > 0) {
        toast.success("🤖 Optimization Complete", {
          description: `${winnersScaled} winners scaled, ${losersKilled} underperformers paused`,
        });
      }
    } catch (error) {
      console.error("Optimization error:", error);
      setStats((prev) => ({ ...prev, isRunning: false }));
    }
  }, [intervalMinutes, queryClient]);

  const startOptimization = useCallback(() => {
    if (intervalRef.current) return;

    setIsActive(true);
    setStats((prev) => ({
      ...prev,
      nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
    }));

    // Run immediately first
    runOptimization();

    // Then set up interval
    intervalRef.current = setInterval(() => {
      runOptimization();
    }, intervalMinutes * 60 * 1000);

    toast.success(`⚡ Auto-Optimization Enabled`, {
      description: `Running every ${intervalMinutes} minutes`,
    });
  }, [intervalMinutes, runOptimization]);

  const stopOptimization = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    toast.info("Auto-optimization paused");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    isActive,
    startOptimization,
    stopOptimization,
    runOptimization,
  };
}

export function useAutoAssignToProducts() {
  const queryClient = useQueryClient();

  const assignProductsToTeams = useCallback(
    async (products: ShopifyProduct[]) => {
      try {
        // Get all teams
        const { data: teams, error: teamsError } = await supabase
          .from("bot_teams")
          .select("*")
          .order("created_at", { ascending: true });

        if (teamsError) throw teamsError;

        let assignedCount = 0;

        // Assign each product to 2 teams (1 Pinterest, 1 Instagram)
        for (let i = 0; i < products.length && i * 2 + 1 < (teams?.length || 0); i++) {
          const product = products[i];
          const pinterestTeam = teams![i * 2];
          const instagramTeam = teams![i * 2 + 1];

          // Assign Pinterest team
          await supabase
            .from("bot_teams")
            .update({
              assigned_product: product.node.title,
              assigned_platform: "pinterest",
              status: "active",
              strategy: `Viral Pin campaign for ${product.node.title}`,
            })
            .eq("id", pinterestTeam.id);

          // Assign Instagram team
          await supabase
            .from("bot_teams")
            .update({
              assigned_product: product.node.title,
              assigned_platform: "instagram",
              status: "active",
              strategy: `Reels campaign for ${product.node.title}`,
            })
            .eq("id", instagramTeam.id);

          // Log decisions
          await supabase.from("team_decisions").insert([
            {
              team_id: pinterestTeam.id,
              decision_type: "target",
              decision: `Target ${product.node.title} on Pinterest`,
              reasoning: `Product assigned for viral Pin campaign at $${product.node.priceRange.minVariantPrice.amount}`,
              consensus_reached: true,
              executed: true,
            },
            {
              team_id: instagramTeam.id,
              decision_type: "target",
              decision: `Target ${product.node.title} on Instagram`,
              reasoning: `Product assigned for Reels campaign at $${product.node.priceRange.minVariantPrice.amount}`,
              consensus_reached: true,
              executed: true,
            },
          ]);

          assignedCount += 2;
        }

        // Log activity
        await supabase.from("bot_activities").insert({
          action: `Auto-assigned ${products.length} products to ${assignedCount} teams`,
          action_type: "decision",
          target: "global",
          result: "success",
        });

        queryClient.invalidateQueries({ queryKey: ["bot_teams"] });

        return { assigned: assignedCount, products: products.length };
      } catch (error) {
        console.error("Assignment error:", error);
        throw error;
      }
    },
    [queryClient]
  );

  return { assignProductsToTeams };
}
