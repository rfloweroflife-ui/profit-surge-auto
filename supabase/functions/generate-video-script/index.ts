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
    const { product, template, duration } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a viral video scriptwriter for luxury skincare products. Create scripts for D-ID avatar videos with ElevenLabs voice.

SCRIPT FORMAT (for ${duration || '15s'} ${template || 'Glow-Up Reveal'} video):
1. HOOK (0-3s): Attention-grabbing opening
2. PROBLEM (3-6s): Pain point
3. SOLUTION (6-12s): Product as hero
4. CTA (12-15s): Urgent call to action

STYLE:
- Conversational, Gen-Z friendly
- Aspirational luxury vibes
- Urgency: "Limited stock", "Selling fast"
- Include: "10% off with code GLOW10"

Output JSON:
{
  "script": "Full video script with timing markers",
  "voiceStyle": "recommended ElevenLabs voice style",
  "visualCues": ["array of visual suggestions"],
  "hashtags": ["10 viral hashtags"],
  "caption": "Instagram/Pinterest caption"
}`;

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
          { role: "user", content: `Create a viral ${duration || '15s'} video script for: ${product?.title || 'Premium Skincare Product'}\n\nProduct details: ${product?.description || 'High-end skincare product'}\nPrice: $${product?.price || '49.99'}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const scriptContent = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ 
      success: true,
      script: scriptContent,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
