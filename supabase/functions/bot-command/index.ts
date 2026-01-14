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
    const { command, commandType, targetIds } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse command and determine actions
    const commandLower = command.toLowerCase();
    
    // Log the command
    await supabase.from("bot_commands").insert({
      command,
      command_type: commandType,
      target_ids: targetIds || [],
      status: "executing",
    });

    let actions: string[] = [];
    let updates: Record<string, unknown> = {};

    // Command parsing
    if (commandLower.includes("deploy all") || commandLower.includes("activate all")) {
      actions.push("Deploying all bots");
      await supabase.from("bot_teams").update({ status: "active" }).neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("bots").update({ status: "working" }).neq("id", "00000000-0000-0000-0000-000000000000");
    }

    if (commandLower.includes("analyze competitor") || commandLower.includes("steal")) {
      actions.push("Initiating competitor analysis");
      // Get analytics bots
      const { data: analyticsBots } = await supabase.from("bots").select("id").eq("role", "analytics").limit(10);
      if (analyticsBots) {
        await supabase.from("bots").update({ 
          status: "analyzing", 
          current_task: "Analyzing competitor content" 
        }).in("id", analyticsBots.map(b => b.id));
      }
    }

    if (commandLower.includes("create content") || commandLower.includes("generate")) {
      actions.push("Content creation initiated");
      const { data: contentBots } = await supabase.from("bots").select("id").eq("role", "content").limit(10);
      if (contentBots) {
        await supabase.from("bots").update({ 
          status: "working", 
          current_task: "Generating viral content" 
        }).in("id", contentBots.map(b => b.id));
      }
    }

    if (commandLower.includes("optimize") || commandLower.includes("scale winner")) {
      actions.push("Optimization cycle started");
      const { data: optimizerBots } = await supabase.from("bots").select("id").eq("role", "optimizer").limit(10);
      if (optimizerBots) {
        await supabase.from("bots").update({ 
          status: "optimizing", 
          current_task: "Scaling winning campaigns" 
        }).in("id", optimizerBots.map(b => b.id));
      }
    }

    if (commandLower.includes("post") || commandLower.includes("publish")) {
      actions.push("Content posting initiated");
      const { data: closerBots } = await supabase.from("bots").select("id").eq("role", "closer").limit(10);
      if (closerBots) {
        await supabase.from("bots").update({ 
          status: "posting", 
          current_task: "Publishing content to platforms" 
        }).in("id", closerBots.map(b => b.id));
      }
    }

    // Log activity
    await supabase.from("bot_activities").insert({
      action: `Command executed: ${command}`,
      action_type: "decision",
      target: commandType,
      result: actions.join(", "),
      metadata: { command, actions }
    });

    // Use AI to generate strategic response
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiResponse = null;

    if (LOVABLE_API_KEY) {
      const aiResult = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an AI marketing commander controlling a swarm of 200 marketing bots organized into 40 elite teams. Each team has 5 specialized bots: CEO (strategy), Content (creation), Analytics (data), Optimizer (scaling), Closer (conversions). Respond to commands with specific tactical actions and assignments. Be concise and actionable.`
            },
            {
              role: "user",
              content: `Command received: "${command}". Provide specific tactical response with bot assignments and actions.`
            }
          ],
        }),
      });

      if (aiResult.ok) {
        const aiData = await aiResult.json();
        aiResponse = aiData.choices?.[0]?.message?.content;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        actions,
        aiResponse,
        message: `Command "${command}" executed successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Bot command error:", error);
    const message = error instanceof Error ? error.message : "Command execution failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
