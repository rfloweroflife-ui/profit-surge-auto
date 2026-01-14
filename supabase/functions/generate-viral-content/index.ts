import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Product {
  title: string;
  handle: string;
  description: string;
  price: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products, platforms, contentTypes } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const generatedContent: Array<{
      product: string;
      platform: string;
      contentType: string;
      hook: string;
      caption: string;
      hashtags: string[];
      cta: string;
    }> = [];

    // Get content bots to assign work
    const { data: contentBots } = await supabase
      .from("bots")
      .select("id")
      .eq("role", "content")
      .limit(5);

    // Update bots to working status
    if (contentBots) {
      await supabase.from("bots").update({
        status: "working",
        current_task: "Generating viral content",
      }).in("id", contentBots.map(b => b.id));
    }

    // Generate content for each product
    for (const product of products as Product[]) {
      for (const platform of platforms as string[]) {
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
                content: `You are a viral skincare marketing expert specializing in ${platform}. Create scroll-stopping content that drives sales. Focus on transformation, urgency, and social proof.`
              },
              {
                role: "user",
                content: `Create viral ${platform} content for this skincare product:

Product: ${product.title}
Description: ${product.description || "Premium skincare product"}
Price: ${product.price}

Generate:
1. A viral hook (first line that stops scrolling - max 10 words)
2. Full caption (engaging, includes benefits, social proof hints)
3. 10 trending hashtags for skincare on ${platform}
4. Urgent CTA with discount code GLOW10

Return as JSON:
{
  "hook": "...",
  "caption": "...",
  "hashtags": ["#tag1", "#tag2", ...],
  "cta": "..."
}`
              }
            ],
          }),
        });

        if (aiResult.ok) {
          const aiData = await aiResult.json();
          const content = aiData.choices?.[0]?.message?.content;
          
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              generatedContent.push({
                product: product.title,
                platform,
                contentType: platform === "pinterest" ? "pin" : "reel",
                hook: parsed.hook || "",
                caption: parsed.caption || "",
                hashtags: parsed.hashtags || [],
                cta: parsed.cta || "",
              });
            }
          } catch (e) {
            console.error("Failed to parse content:", e);
          }
        }
      }
    }

    // Log activities for each generated piece
    for (const content of generatedContent) {
      await supabase.from("bot_activities").insert({
        bot_id: contentBots?.[0]?.id,
        action: `Generated viral ${content.contentType} for ${content.product}`,
        action_type: "create",
        target: content.product,
        result: content.hook,
        metadata: content,
      });
    }

    // Reset bots
    if (contentBots) {
      await supabase.from("bots").update({
        status: "idle",
        current_task: null,
      }).in("id", contentBots.map(b => b.id));
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: generatedContent.length,
        content: generatedContent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Content generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
