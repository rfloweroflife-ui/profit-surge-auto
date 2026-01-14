import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Bot {
  id: string;
  name: string;
  role: "ceo" | "content" | "analytics" | "optimizer" | "closer";
  team_id: string | null;
  status: "idle" | "working" | "analyzing" | "optimizing" | "posting";
  current_task: string | null;
  efficiency_score: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
}

export interface BotTeam {
  id: string;
  name: string;
  assigned_product: string | null;
  assigned_platform: "pinterest" | "instagram" | "both" | null;
  strategy: string | null;
  performance_score: number;
  revenue_generated: number;
  posts_created: number;
  engagement_rate: number;
  status: "standby" | "active" | "optimizing";
  created_at: string;
  updated_at: string;
  bots?: Bot[];
}

export interface BotActivity {
  id: string;
  bot_id: string | null;
  team_id: string | null;
  action: string;
  action_type: "analyze" | "create" | "post" | "optimize" | "steal" | "decision";
  target: string | null;
  result: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CompetitorAnalysis {
  id: string;
  competitor_name: string;
  platform: "pinterest" | "instagram" | "tiktok";
  content_url: string | null;
  content_type: "video" | "image" | "reel" | "pin" | null;
  engagement_count: number;
  views_count: number;
  hooks: string[];
  hashtags: string[];
  analyzed_by: string | null;
  stolen_elements: Record<string, unknown>;
  our_version_created: boolean;
  created_at: string;
}

export interface TeamDecision {
  id: string;
  team_id: string | null;
  decision_type: "scale" | "pause" | "modify" | "steal" | "create" | "target";
  decision: string;
  reasoning: string | null;
  votes: Record<string, unknown>;
  consensus_reached: boolean;
  executed: boolean;
  outcome: string | null;
  created_at: string;
}

export interface BotCommand {
  id: string;
  command: string;
  command_type: "global" | "team" | "individual";
  target_ids: string[] | null;
  status: "pending" | "executing" | "completed" | "failed";
  result: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

// Fetch all bots
export function useBots() {
  return useQuery({
    queryKey: ["bots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Bot[];
    },
  });
}

// Fetch all teams with their bots
export function useBotTeams() {
  return useQuery({
    queryKey: ["bot_teams"],
    queryFn: async () => {
      const { data: teams, error: teamsError } = await supabase
        .from("bot_teams")
        .select("*")
        .order("created_at", { ascending: true });
      if (teamsError) throw teamsError;

      const { data: bots, error: botsError } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: true });
      if (botsError) throw botsError;

      return (teams as BotTeam[]).map((team) => ({
        ...team,
        bots: (bots as Bot[]).filter((bot) => bot.team_id === team.id),
      }));
    },
  });
}

// Fetch recent activities with realtime subscription
export function useBotActivities(limit = 50) {
  const [activities, setActivities] = useState<BotActivity[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from("bot_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) {
        setActivities(data as BotActivity[]);
      }
    };
    fetchActivities();

    // Realtime subscription
    const channel = supabase
      .channel("bot_activities_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bot_activities" },
        (payload) => {
          setActivities((prev) => [payload.new as BotActivity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return activities;
}

// Fetch team decisions with realtime
export function useTeamDecisions(limit = 20) {
  const [decisions, setDecisions] = useState<TeamDecision[]>([]);

  useEffect(() => {
    const fetchDecisions = async () => {
      const { data, error } = await supabase
        .from("team_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) {
        setDecisions(data as TeamDecision[]);
      }
    };
    fetchDecisions();

    const channel = supabase
      .channel("team_decisions_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_decisions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDecisions((prev) => [payload.new as TeamDecision, ...prev].slice(0, limit));
          } else if (payload.eventType === "UPDATE") {
            setDecisions((prev) =>
              prev.map((d) => (d.id === payload.new.id ? (payload.new as TeamDecision) : d))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return decisions;
}

// Fetch competitor analyses
export function useCompetitorAnalysis() {
  return useQuery({
    queryKey: ["competitor_analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitor_analysis")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CompetitorAnalysis[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Initialize swarm with 200 bots in 40 teams
export function useInitializeSwarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Check if already initialized
      const { data: existingTeams } = await supabase.from("bot_teams").select("id").limit(1);
      if (existingTeams && existingTeams.length > 0) {
        return { message: "Swarm already initialized" };
      }

      const roles: Bot["role"][] = ["ceo", "content", "analytics", "optimizer", "closer"];
      const platforms: BotTeam["assigned_platform"][] = ["pinterest", "instagram", "both"];
      
      // Create 40 teams
      const teams: Omit<BotTeam, "id" | "created_at" | "updated_at" | "bots">[] = [];
      for (let i = 1; i <= 40; i++) {
        teams.push({
          name: `Elite Team ${i}`,
          assigned_product: null,
          assigned_platform: platforms[i % 3],
          strategy: null,
          performance_score: 0,
          revenue_generated: 0,
          posts_created: 0,
          engagement_rate: 0,
          status: "standby",
        });
      }

      const { data: createdTeams, error: teamsError } = await supabase
        .from("bot_teams")
        .insert(teams)
        .select();
      if (teamsError) throw teamsError;

      // Create 5 bots per team (200 total)
      const bots: Omit<Bot, "id" | "created_at" | "updated_at">[] = [];
      createdTeams?.forEach((team, teamIndex) => {
        roles.forEach((role, roleIndex) => {
          bots.push({
            name: `${role.toUpperCase()}-${teamIndex + 1}-${roleIndex + 1}`,
            role,
            team_id: team.id,
            status: "idle",
            current_task: null,
            efficiency_score: 100,
            tasks_completed: 0,
          });
        });
      });

      const { error: botsError } = await supabase.from("bots").insert(bots);
      if (botsError) throw botsError;

      return { message: "200 bots initialized in 40 teams" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}

// Send command to bots
export function useSendCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      command: string;
      commandType: "global" | "team" | "individual";
      targetIds?: string[];
    }) => {
      const response = await supabase.functions.invoke("bot-command", {
        body: params,
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}

// Deploy all bots
export function useDeployBots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Update all teams to active
      const { error: teamsError } = await supabase
        .from("bot_teams")
        .update({ status: "active" })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all
      if (teamsError) throw teamsError;

      // Update all bots to working
      const { error: botsError } = await supabase
        .from("bots")
        .update({ status: "working" })
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (botsError) throw botsError;

      // Log activity
      await supabase.from("bot_activities").insert({
        action: "All 200 bots deployed and active",
        action_type: "decision",
        target: "global",
        result: "success",
      });

      return { deployed: 200 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}

// Add competitor for analysis
export function useAnalyzeCompetitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      competitorName: string;
      platform: CompetitorAnalysis["platform"];
      contentUrl?: string;
    }) => {
      const response = await supabase.functions.invoke("analyze-competitor", {
        body: params,
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor_analysis"] });
    },
  });
}
