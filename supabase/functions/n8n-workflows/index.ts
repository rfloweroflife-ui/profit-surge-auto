import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes?: Array<{ type: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, workflowId, baseUrl, apiKey } = await req.json();
    
    const n8nBaseUrl = baseUrl || Deno.env.get("N8N_BASE_URL") || "https://n8n.profitreaper.com";
    const n8nApiKey = apiKey || Deno.env.get("N8N_API_KEY");

    if (!n8nApiKey) {
      return new Response(
        JSON.stringify({ error: "N8N API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": n8nApiKey,
    };

    let endpoint = "";
    let method = "GET";
    let body = null;

    switch (action) {
      case "list":
        endpoint = "/api/v1/workflows";
        break;
      case "get":
        if (!workflowId) throw new Error("Workflow ID required");
        endpoint = `/api/v1/workflows/${workflowId}`;
        break;
      case "activate":
        if (!workflowId) throw new Error("Workflow ID required");
        endpoint = `/api/v1/workflows/${workflowId}/activate`;
        method = "POST";
        break;
      case "deactivate":
        if (!workflowId) throw new Error("Workflow ID required");
        endpoint = `/api/v1/workflows/${workflowId}/deactivate`;
        method = "POST";
        break;
      case "execute":
        if (!workflowId) throw new Error("Workflow ID required");
        endpoint = `/api/v1/workflows/${workflowId}/run`;
        method = "POST";
        body = JSON.stringify({ runData: {} });
        break;
      case "executions":
        endpoint = workflowId 
          ? `/api/v1/executions?workflowId=${workflowId}&limit=20`
          : "/api/v1/executions?limit=50";
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${n8nBaseUrl}${endpoint}`;
    console.log(`n8n API call: ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "n8n API request failed", 
          status: response.status,
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("n8n workflows error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
