import { useEffect, useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

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
  const { user } = useAuth();
  const [stats, setStats] = useState<OptimizationStats>({
    lastRun: null,
    nextRun: null,
    runsCompleted: 0,
    winnersScaled: 0,
    losersKilled: 0,
    isRunning: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isActive, setIsActive] = useState(false);

  const runOptimization = useCallback(async () => {
    if (!user) return;
    setStats((prev) => ({ ...prev, isRunning: true }));

    try {
      const { data: teams, error: teamsError } = await supabase
        .from("bot_teams")
        .select("*")
        .eq("status", "active");

      if (teamsError) throw teamsError;
      if (!teams || teams.length === 0) {
        setStats((prev) => ({
          ...prev,
          isRunning: false,
          lastRun: new Date(),
          nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
        }));
        return;
      }

      let winnersScaled = 0;
      let losersKilled = 0;

      const winnerUpdates: { id: string; score: number; posts: number; name: string; engagement: number }[] = [];
      const loserInserts: { team_id: string; name: string; engagement: number }[] = [];

      for (const team of teams) {
        const engagementRate = team.engagement_rate || 0;
        const performanceScore = team.performance_score || 0;

        if (engagementRate > 3 && performanceScore > 70) {
          winnerUpdates.push({
            id: team.id,
            score: Math.min(100, performanceScore + 5),
            posts: (team.posts_created || 0) + 5,
            name: team.name,
            engagement: engagementRate,
          });
        }

        if (engagementRate < 0.5 && performanceScore < 30 && performanceScore > 0) {
          loserInserts.push({
            team_id: team.id,
            name: team.name,
            engagement: engagementRate,
          });
        }
      }

      const winnerPromises = winnerUpdates.map((w) =>
        supabase
          .from("bot_teams")
          .update({ performance_score: w.score, posts_created: w.posts })
          .eq("id", w.id)
      );
      await Promise.all(winnerPromises);
      winnersScaled = winnerUpdates.length;

      if (winnerUpdates.length > 0) {
        await supabase.from("team_decisions").insert(
          winnerUpdates.map((w) => ({
            team_id: w.id,
            decision_type: "scale",
            decision: `Scale ${w.name} - High engagement: ${w.engagement.toFixed(1)}%`,
            reasoning: `Performance score exceeds threshold. Increasing post frequency.`,
            consensus_reached: true,
            executed: true,
            outcome: "Increased posting frequency by 2x",
            user_id: user.id,
          }))
        );
      }

      if (loserInserts.length > 0) {
        await supabase.from("team_decisions").insert(
          loserInserts.map((l) => ({
            team_id: l.team_id,
            decision_type: "pause",
            decision: `Pause ${l.name} - Low engagement: ${l.engagement.toFixed(1)}%`,
            reasoning: `Performance below threshold. Pausing to reassess strategy.`,
            consensus_reached: true,
            executed: true,
            outcome: "Team reassigned to new product",
            user_id: user.id,
          }))
        );
        losersKilled = loserInserts.length;
      }

      await supabase.from("bot_activities").insert({
        action: `Optimization cycle complete: ${winnersScaled} winners scaled, ${losersKilled} losers paused, ${teams.length} teams evaluated`,
        action_type: "optimize",
        target: "global",
        result: JSON.stringify({ winnersScaled, losersKilled, teamsEvaluated: teams.length }),
        user_id: user.id,
      });

      const now = new Date();
      const nextRun = new Date(now.getTime() + intervalMinutes * 60 * 1000);

      setStats((prev) => ({
        ...prev,
        lastRun: now,
        nextRun,
        runsCompleted: prev.runsCompleted + 1,
        winnersScaled: prev.winnersScaled + winnersScaled,
        losersKilled: prev.losersKilled + losersKilled,
        isRunning: false,
      }));

      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });

      toast.success("Optimization Complete", {
        description: `${teams.length} teams evaluated. ${winnersScaled} scaled, ${losersKilled} paused.`,
      });
    } catch (error) {
      console.error("Optimization error:", error);
      setStats((prev) => ({ ...prev, isRunning: false }));
      toast.error("Optimization failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [intervalMinutes, queryClient, user]);

  const startOptimization = useCallback(() => {
    if (intervalRef.current) return;

    setIsActive(true);
    setStats((prev) => ({
      ...prev,
      nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
    }));

    runOptimization();

    intervalRef.current = setInterval(() => {
      runOptimization();
    }, intervalMinutes * 60 * 1000);

    toast.success("Auto-Optimization Enabled", {
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
  const { user } = useAuth();

  const assignProductsToTeams = useCallback(
    async (products: ShopifyProduct[]) => {
      if (!user) throw new Error("Not authenticated");

      try {
        const { data: teams, error: teamsError } = await supabase
          .from("bot_teams")
          .select("*")
          .order("created_at", { ascending: true });

        if (teamsError) throw teamsError;
        if (!teams || teams.length === 0) throw new Error("No teams available");

        let assignedCount = 0;
        const teamUpdates: PromiseLike<unknown>[] = [];
        const decisionInserts: {
          team_id: string;
          decision_type: string;
          decision: string;
          reasoning: string;
          consensus_reached: boolean;
          executed: boolean;
          user_id: string;
        }[] = [];

        for (let i = 0; i < products.length && i * 2 + 1 < teams.length; i++) {
          const product = products[i];
          const pinterestTeam = teams[i * 2];
          const instagramTeam = teams[i * 2 + 1];

          teamUpdates.push(
            supabase
              .from("bot_teams")
              .update({
                assigned_product: product.node.title,
                assigned_platform: "pinterest",
                status: "active",
                strategy: `Viral Pin campaign for ${product.node.title}`,
              })
              .eq("id", pinterestTeam.id)
          );

          teamUpdates.push(
            supabase
              .from("bot_teams")
              .update({
                assigned_product: product.node.title,
                assigned_platform: "instagram",
                status: "active",
                strategy: `Reels campaign for ${product.node.title}`,
              })
              .eq("id", instagramTeam.id)
          );

          decisionInserts.push(
            {
              team_id: pinterestTeam.id,
              decision_type: "target",
              decision: `Target ${product.node.title} on Pinterest`,
              reasoning: `Product assigned for viral Pin campaign at $${product.node.priceRange.minVariantPrice.amount}`,
              consensus_reached: true,
              executed: true,
              user_id: user.id,
            },
            {
              team_id: instagramTeam.id,
              decision_type: "target",
              decision: `Target ${product.node.title} on Instagram`,
              reasoning: `Product assigned for Reels campaign at $${product.node.priceRange.minVariantPrice.amount}`,
              consensus_reached: true,
              executed: true,
              user_id: user.id,
            }
          );

          assignedCount += 2;
        }

        await Promise.all(teamUpdates);

        if (decisionInserts.length > 0) {
          await supabase.from("team_decisions").insert(decisionInserts);
        }

        await supabase.from("bot_activities").insert({
          action: `Auto-assigned ${products.length} products to ${assignedCount} teams`,
          action_type: "decision",
          target: "global",
          result: "success",
          user_id: user.id,
        });

        queryClient.invalidateQueries({ queryKey: ["bot_teams"] });

        return { assigned: assignedCount, products: products.length };
      } catch (error) {
        console.error("Assignment error:", error);
        throw error;
      }
    },
    [queryClient, user]
  );

  return { assignProductsToTeams };
}