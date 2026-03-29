import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service key
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, data } = await req.json();

    switch (action) {
      case "list_customers": {
        const { data: profiles } = await admin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: subscriptions } = await admin
          .from("subscriptions")
          .select("*");

        const { data: storeConns } = await admin
          .from("store_connections")
          .select("user_id, store_domain, store_name, is_active");

        const { data: tickets } = await admin
          .from("support_tickets")
          .select("user_id, status")
          .eq("status", "open");

        // Merge data
        const customers = (profiles || []).map((p: Record<string, unknown>) => {
          const sub = (subscriptions || []).find((s: Record<string, unknown>) => s.user_id === p.id);
          const store = (storeConns || []).find((s: Record<string, unknown>) => s.user_id === p.id);
          const openTickets = (tickets || []).filter((t: Record<string, unknown>) => t.user_id === p.id).length;
          return { ...p, subscription: sub || null, store: store || null, open_tickets: openTickets };
        });

        return new Response(JSON.stringify({ customers }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_customer": {
        const userId = data?.userId;
        const { data: profile } = await admin.from("profiles").select("*").eq("id", userId).single();
        const { data: sub } = await admin.from("subscriptions").select("*").eq("user_id", userId).single();
        const { data: store } = await admin.from("store_connections").select("*").eq("user_id", userId).single();
        const { data: tickets } = await admin.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        const { data: activities } = await admin.from("bot_activities").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
        const { data: teams } = await admin.from("bot_teams").select("id, name, status, assigned_product").eq("user_id", userId);

        return new Response(JSON.stringify({ profile, subscription: sub, store, tickets, activities, teams }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_ticket": {
        const { ticketId, status, admin_notes } = data;
        const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
        if (admin_notes) updateData.admin_notes = admin_notes;
        if (status === "resolved") updateData.resolved_at = new Date().toISOString();

        const { error } = await admin.from("support_tickets").update(updateData).eq("id", ticketId);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_subscription": {
        const { userId: subUserId, tier, status: subStatus, bot_limit } = data;
        const { error } = await admin.from("subscriptions").update({
          tier, status: subStatus, bot_limit, updated_at: new Date().toISOString(),
        }).eq("user_id", subUserId);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Admin API error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});