import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GeneratedContent {
  product: string;
  platform: string;
  contentType: string;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface Product {
  title: string;
  handle: string;
  description: string;
  price: string;
}

// Assign products to teams
export function useAssignProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignments: { teamId: string; productName: string; platform: string }[]) => {
      for (const assignment of assignments) {
        await supabase
          .from("bot_teams")
          .update({
            assigned_product: assignment.productName,
            assigned_platform: assignment.platform as "pinterest" | "instagram" | "both",
            status: "active",
          })
          .eq("id", assignment.teamId);

        // Log the assignment
        await supabase.from("bot_activities").insert({
          team_id: assignment.teamId,
          action: `Team assigned to ${assignment.productName} on ${assignment.platform}`,
          action_type: "decision",
          target: assignment.productName,
          result: "Assignment complete",
        });
      }

      return { assigned: assignments.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}

// Generate viral content for products
export function useGenerateViralContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      products: Product[];
      platforms: string[];
      contentTypes?: string[];
    }) => {
      const response = await supabase.functions.invoke("generate-viral-content", {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data as {
        success: boolean;
        generated: number;
        content: GeneratedContent[];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}

// Auto-assign top products to available teams
export function useAutoAssignProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: { title: string; handle: string }[]) => {
      // Get available teams
      const { data: teams, error: teamsError } = await supabase
        .from("bot_teams")
        .select("id, name, assigned_platform")
        .is("assigned_product", null)
        .limit(products.length * 2);

      if (teamsError) throw teamsError;

      const assignments: { teamId: string; productName: string; platform: string }[] = [];

      // Assign 2 teams per product (one for Pinterest, one for Instagram)
      products.forEach((product, index) => {
        const pinterestTeam = teams?.[index * 2];
        const instagramTeam = teams?.[index * 2 + 1];

        if (pinterestTeam) {
          assignments.push({
            teamId: pinterestTeam.id,
            productName: product.title,
            platform: "pinterest",
          });
        }
        if (instagramTeam) {
          assignments.push({
            teamId: instagramTeam.id,
            productName: product.title,
            platform: "instagram",
          });
        }
      });

      // Execute assignments
      for (const assignment of assignments) {
        await supabase
          .from("bot_teams")
          .update({
            assigned_product: assignment.productName,
            assigned_platform: assignment.platform as "pinterest" | "instagram" | "both",
            status: "active",
          })
          .eq("id", assignment.teamId);
      }

      // Create team decisions for each assignment
      for (const assignment of assignments) {
        await supabase.from("team_decisions").insert({
          team_id: assignment.teamId,
          decision_type: "target",
          decision: `Target ${assignment.productName} on ${assignment.platform}`,
          reasoning: `Auto-assigned based on product priority. Team will focus on generating viral ${assignment.platform} content.`,
          consensus_reached: true,
          executed: true,
          outcome: "Assignment complete - generating content",
        });
      }

      return { assigned: assignments.length, assignments };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_teams"] });
    },
  });
}
