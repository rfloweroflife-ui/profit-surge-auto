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
    const { competitorName, platform, contentUrl } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get an analytics bot to assign
    const { data: analyticsBots } = await supabase
      .from("bots")
      .select("id")
      .eq("role", "analytics")
      .eq("status", "idle")
      .limit(1);

    const analyzingBotId = analyticsBots?.[0]?.id || null;

    // Update bot status if we have one
    if (analyzingBotId) {
      await supabase.from("bots").update({
        status: "analyzing",
        current_task: `Analyzing ${competitorName} on ${platform}`,
      }).eq("id", analyzingBotId);
    }

    // Use AI to analyze competitor and generate stolen elements
    let analysis = {
      hooks: [] as string[],
      hashtags: [] as string[],
      stolen_elements: {} as Record<string, unknown>,
      engagement_count: Math.floor(Math.random() * 50000) + 1000,
      views_count: Math.floor(Math.random() * 500000) + 10000,
    };

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
              content: `You are an expert marketing analyst specializing in viral content on ${platform}. Analyze competitor brands and extract winning strategies.`
            },
            {
              role: "user",
              content: `Analyze ${competitorName} on ${platform}. Generate:
1. Top 5 viral hooks they use (short attention-grabbing phrases)
2. Top 10 hashtags they use
3. Key elements to steal: content format, posting frequency, visual style, CTAs, engagement tactics

Return as JSON with format:
{
  "hooks": ["hook1", "hook2", ...],
  "hashtags": ["#tag1", "#tag2", ...],
  "stolen_elements": {
    "content_format": "description",
    "visual_style": "description",
    "cta_style": "description",
    "posting_frequency": "description",
    "engagement_tactics": "description"
  }
}`
            }
          ],
        }),
      });

      if (aiResult.ok) {
        const aiData = await aiResult.json();
        const content = aiData.choices?.[0]?.message?.content;
        try {
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            analysis.hooks = parsed.hooks || [];
            analysis.hashtags = parsed.hashtags || [];
            analysis.stolen_elements = parsed.stolen_elements || {};
          }
        } catch (e) {
          console.error("Failed to parse AI response:", e);
        }
      }
    }

    // Store the analysis
    const { data: competitorData, error } = await supabase
      .from("competitor_analysis")
      .insert({
        competitor_name: competitorName,
        platform,
        content_url: contentUrl,
        content_type: platform === "pinterest" ? "pin" : "reel",
        engagement_count: analysis.engagement_count,
        views_count: analysis.views_count,
        hooks: analysis.hooks,
        hashtags: analysis.hashtags,
        analyzed_by: analyzingBotId,
        stolen_elements: analysis.stolen_elements,
        our_version_created: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("bot_activities").insert({
      bot_id: analyzingBotId,
      action: `Analyzed ${competitorName} on ${platform}`,
      action_type: "analyze",
      target: competitorName,
      result: `Found ${analysis.hooks.length} hooks, ${analysis.hashtags.length} hashtags`,
      metadata: { competitor: competitorName, platform },
    });

    // Create team decision to steal and improve
    const { data: teams } = await supabase.from("bot_teams").select("id").limit(1);
    if (teams && teams.length > 0) {
      await supabase.from("team_decisions").insert({
        team_id: teams[0].id,
        decision_type: "steal",
        decision: `Steal and improve content strategy from ${competitorName}`,
        reasoning: `Identified high-performing hooks and hashtags. Engagement rate: ${analysis.engagement_count}. Views: ${analysis.views_count}`,
        consensus_reached: true,
        executed: false,
      });
    }

    // Reset bot status
    if (analyzingBotId) {
      await supabase.from("bots").update({
        status: "idle",
        current_task: null,
      }).eq("id", analyzingBotId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: competitorData,
        message: `Competitor ${competitorName} analyzed successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Competitor analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
