import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, products, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
    const aiResponse = data.choices?.[0]?.message?.content || "No response generated";

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
