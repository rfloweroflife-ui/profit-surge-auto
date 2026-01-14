import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to call n8n API
async function callN8nApi(action: string, workflowId?: string, n8nConfig?: { baseUrl: string; apiKey: string }) {
  const n8nBaseUrl = n8nConfig?.baseUrl || Deno.env.get("N8N_BASE_URL") || "https://n8n.profitreaper.com";
  const n8nApiKey = n8nConfig?.apiKey || Deno.env.get("N8N_API_KEY");

  if (!n8nApiKey) {
    throw new Error("N8N API key not configured");
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
    case "execute":
      if (!workflowId) throw new Error("Workflow ID required");
      endpoint = `/api/v1/workflows/${workflowId}/run`;
      method = "POST";
      body = JSON.stringify({ runData: {} });
      break;
    case "activate":
      if (!workflowId) throw new Error("Workflow ID required");
      endpoint = `/api/v1/workflows/${workflowId}/activate`;
      method = "POST";
      break;
    default:
      throw new Error(`Unknown n8n action: ${action}`);
  }

  const url = `${n8nBaseUrl}${endpoint}`;
  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`n8n API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, products, context, n8nConfig } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch available n8n workflows for context
    let availableWorkflows: any[] = [];
    try {
      const n8nResult = await callN8nApi("list", undefined, n8nConfig);
      availableWorkflows = n8nResult.data || n8nResult || [];
    } catch (e) {
      console.log("Could not fetch n8n workflows:", e);
    }

    const workflowContext = availableWorkflows.length > 0 
      ? `\n\nAVAILABLE N8N WORKFLOWS (you can execute these):\n${availableWorkflows.map((w: any) => `- ${w.name} (ID: ${w.id}, Active: ${w.active})`).join('\n')}`
      : "";

    const systemPrompt = `You are the CEO Brain - an elite AI marketing commander for a high-end skincare e-commerce brand called Aura Luxe.

STORE DATA:
- Connected to: lovable-project-i664s.myshopify.com
- Products: 30 premium skincare products (serums, moisturizers, etc.)
- Fulfillment: CJ Dropshipping (China + US warehouses)
- Target: Maximum viral organic reach on Pinterest & Instagram

YOUR CAPABILITIES:
1. Generate viral content strategies for Pinterest Pins and Instagram Reels
2. Create compelling video scripts for D-ID avatar videos with ElevenLabs voice
3. Analyze competitor strategies (Glow Recipe, The Ordinary, Mad Hippie)
4. Optimize campaigns - scale winners, kill losers
5. Schedule content for peak engagement times (7-9 PM EST)
6. Create hashtag strategies for maximum reach
7. EXECUTE N8N WORKFLOWS - You can trigger automation workflows directly!
${workflowContext}

CONTENT STYLE GUIDE:
- Hooks: "Glass skin in 7 days", "Botox in a bottle under $100", "Clean beauty dupe that works"
- CTAs: "Limited stock - 10% off! Code GLOW10", "Link in bio"
- Hashtags: #GlassSkin #CleanBeauty #GlowUp #KBeauty #AntiAging #ViralSkincare #SkincareRoutine
- Tone: Luxurious, aspirational, urgency-driven, Gen-Z friendly

When given a command, respond with ACTIONABLE output in JSON format:
{
  "action": "string describing what you're executing",
  "content": [array of generated content pieces],
  "schedule": "recommended posting schedule",
  "hashtags": [array of relevant hashtags],
  "metrics": "expected performance metrics",
  "nextSteps": [array of recommended follow-up actions]
}

Current products context: ${JSON.stringify(products?.slice(0, 10) || [])}`;

    // Define n8n tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "execute_n8n_workflow",
          description: "Execute an n8n automation workflow. Use this when the user asks to run, trigger, or execute an automation workflow.",
          parameters: {
            type: "object",
            properties: {
              workflow_id: {
                type: "string",
                description: "The ID of the workflow to execute"
              },
              workflow_name: {
                type: "string",
                description: "The name of the workflow being executed (for confirmation)"
              },
              reason: {
                type: "string",
                description: "Brief explanation of why this workflow is being executed"
              }
            },
            required: ["workflow_id", "workflow_name", "reason"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "list_n8n_workflows",
          description: "List all available n8n workflows. Use this when the user asks what automations or workflows are available.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "activate_n8n_workflow",
          description: "Activate an n8n workflow so it runs on its schedule/trigger.",
          parameters: {
            type: "object",
            properties: {
              workflow_id: {
                type: "string",
                description: "The ID of the workflow to activate"
              }
            },
            required: ["workflow_id"],
            additionalProperties: false
          }
        }
      }
    ];

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command },
        ],
        tools: availableWorkflows.length > 0 ? tools : undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    
    // Check if the AI wants to use tools
    const toolCalls = message?.tool_calls;
    let toolResults: any[] = [];
    
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        try {
          let result: any;
          
          switch (functionName) {
            case "execute_n8n_workflow":
              console.log(`Executing workflow: ${args.workflow_name} (${args.workflow_id})`);
              result = await callN8nApi("execute", args.workflow_id, n8nConfig);
              toolResults.push({
                tool_call_id: toolCall.id,
                function_name: functionName,
                success: true,
                workflow_name: args.workflow_name,
                reason: args.reason,
                execution_result: result
              });
              break;
              
            case "list_n8n_workflows":
              result = await callN8nApi("list", undefined, n8nConfig);
              toolResults.push({
                tool_call_id: toolCall.id,
                function_name: functionName,
                success: true,
                workflows: result.data || result
              });
              break;
              
            case "activate_n8n_workflow":
              result = await callN8nApi("activate", args.workflow_id, n8nConfig);
              toolResults.push({
                tool_call_id: toolCall.id,
                function_name: functionName,
                success: true,
                activation_result: result
              });
              break;
          }
        } catch (error) {
          console.error(`Tool call error for ${functionName}:`, error);
          toolResults.push({
            tool_call_id: toolCall.id,
            function_name: functionName,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      
      // Make a follow-up call to get a natural language response
      const followUpMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
        { role: "assistant", content: null, tool_calls: toolCalls },
        ...toolCalls.map((tc: any, i: number) => ({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(toolResults[i])
        }))
      ];
      
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
          stream: false,
        }),
      });
      
      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalResponse = followUpData.choices?.[0]?.message?.content || "Workflow action completed.";
        
        return new Response(JSON.stringify({ 
          success: true,
          response: finalResponse,
          toolExecutions: toolResults,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Standard response without tool calls
    const aiResponse = message?.content || "No response generated";

    return new Response(JSON.stringify({ 
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CEO Brain error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
