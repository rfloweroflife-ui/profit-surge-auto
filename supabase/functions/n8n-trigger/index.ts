import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface N8nTriggerRequest {
  webhookUrl: string;
  event: string;
  data: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookUrl, event, data } = await req.json() as N8nTriggerRequest;
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Webhook URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare the payload for n8n
    const payload = {
      source: "auraomega_profit_reaper",
      event,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        metadata: {
          version: "2.0",
          environment: "production"
        }
      }
    };

    // Trigger the n8n webhook
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    // Log the activity
    await supabase.from("bot_activities").insert({
      action: `n8n workflow triggered: ${event}`,
      action_type: "automation",
      target: webhookUrl,
      result: n8nResponse.ok ? "success" : "failed",
      metadata: payload
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n trigger failed:", errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "n8n workflow trigger failed",
          status: n8nResponse.status 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let responseData = null;
    try {
      responseData = await n8nResponse.json();
    } catch {
      // n8n might return empty response
    }

    return new Response(
      JSON.stringify({
        success: true,
        event,
        n8nResponse: responseData,
        message: "Workflow triggered successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("n8n trigger error:", error);
    const message = error instanceof Error ? error.message : "Trigger failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
