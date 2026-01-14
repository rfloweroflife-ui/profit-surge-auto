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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userIdentifier = "default", ...params } = await req.json();

    // Get active connection
    const { data: connection, error: connError } = await supabase
      .from("x_connections")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "X account not connected", needsAuth: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const accessToken = connection.access_token;

    switch (action) {
      case "post_tweet": {
        const { text, mediaIds } = params;
        
        if (!text || text.length > 280) {
          throw new Error("Tweet text is required and must be 280 characters or less");
        }

        const tweetData: any = { text };
        if (mediaIds && mediaIds.length > 0) {
          tweetData.media = { media_ids: mediaIds };
        }

        const response = await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(tweetData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Tweet post error:", errorData);
          throw new Error("Failed to post tweet");
        }

        const result = await response.json();

        // Store in database
        const { error: storeError } = await supabase
          .from("x_tweets")
          .insert({
            connection_id: connection.id,
            tweet_id: result.data?.id,
            content: text,
            status: "posted",
            posted_at: new Date().toISOString()
          });

        if (storeError) {
          console.error("Store tweet error:", storeError);
        }

        // Update analytics
        await updateDailyAnalytics(supabase, connection.id, "tweet");

        return new Response(
          JSON.stringify({ success: true, tweet: result.data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "post_thread": {
        const { tweets } = params;
        
        if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
          throw new Error("Thread requires at least one tweet");
        }

        const postedTweets = [];
        let replyToId: string | null = null;
        const threadId = crypto.randomUUID();

        for (let i = 0; i < tweets.length; i++) {
          const tweetData: any = { text: tweets[i] };
          
          if (replyToId) {
            tweetData.reply = { in_reply_to_tweet_id: replyToId };
          }

          const response = await fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(tweetData)
          });

          if (!response.ok) {
            console.error(`Failed to post tweet ${i + 1} in thread`);
            break;
          }

          const result = await response.json();
          postedTweets.push(result.data);
          replyToId = result.data.id;

          // Store in database
          await supabase
            .from("x_tweets")
            .insert({
              connection_id: connection.id,
              tweet_id: result.data.id,
              content: tweets[i],
              thread_id: threadId,
              is_thread_parent: i === 0,
              status: "posted",
              posted_at: new Date().toISOString()
            });

          // Small delay between tweets
          if (i < tweets.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Update analytics
        await updateDailyAnalytics(supabase, connection.id, "tweet", postedTweets.length);

        return new Response(
          JSON.stringify({ 
            success: true, 
            thread: postedTweets,
            threadId,
            postedCount: postedTweets.length,
            totalCount: tweets.length
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "schedule_tweet": {
        const { text, scheduledAt, hashtags, productId } = params;

        if (!text || !scheduledAt) {
          throw new Error("Tweet text and scheduled time are required");
        }

        const { data: scheduled, error: scheduleError } = await supabase
          .from("x_tweets")
          .insert({
            connection_id: connection.id,
            content: text,
            hashtags: hashtags || [],
            product_id: productId,
            status: "scheduled",
            scheduled_at: scheduledAt
          })
          .select()
          .single();

        if (scheduleError) {
          throw new Error("Failed to schedule tweet");
        }

        return new Response(
          JSON.stringify({ success: true, scheduled }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_scheduled": {
        const { data: scheduled, error } = await supabase
          .from("x_tweets")
          .select("*")
          .eq("connection_id", connection.id)
          .eq("status", "scheduled")
          .order("scheduled_at", { ascending: true });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, scheduled }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_analytics": {
        const { days = 7 } = params;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: analytics, error } = await supabase
          .from("x_analytics")
          .select("*")
          .eq("connection_id", connection.id)
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (error) throw error;

        // Get tweet stats
        const { data: tweetStats } = await supabase
          .from("x_tweets")
          .select("impressions, likes, retweets, replies, quotes")
          .eq("connection_id", connection.id)
          .eq("status", "posted");

        const totalStats = tweetStats?.reduce((acc, t) => ({
          impressions: acc.impressions + (t.impressions || 0),
          likes: acc.likes + (t.likes || 0),
          retweets: acc.retweets + (t.retweets || 0),
          replies: acc.replies + (t.replies || 0),
          quotes: acc.quotes + (t.quotes || 0)
        }), { impressions: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 });

        return new Response(
          JSON.stringify({ 
            success: true, 
            analytics,
            summary: {
              ...totalStats,
              tweetsPosted: tweetStats?.length || 0
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_tweets": {
        const { limit = 20, status } = params;

        let query = supabase
          .from("x_tweets")
          .select("*")
          .eq("connection_id", connection.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (status) {
          query = query.eq("status", status);
        }

        const { data: tweets, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, tweets }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_scheduled": {
        const { tweetId } = params;

        const { error } = await supabase
          .from("x_tweets")
          .delete()
          .eq("id", tweetId)
          .eq("status", "scheduled");

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_tweets": {
        // Use Lovable AI to generate tweet content
        const { productName, productDescription, count = 5, style = "viral" } = params;

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
          throw new Error("Lovable AI not configured");
        }

        const systemPrompt = `You are a viral social media expert. Generate ${count} engaging tweets for X (Twitter) about a skincare product. Each tweet should be unique, include relevant hashtags, and follow these rules:
- Maximum 280 characters including hashtags
- Use emojis strategically
- Include a call-to-action
- Style: ${style}
- Make them feel authentic, not salesy
Return as JSON array: [{"text": "tweet content with #hashtags", "hashtags": ["tag1", "tag2"]}]`;

        const userPrompt = `Product: ${productName}\nDescription: ${productDescription || "Premium skincare product"}\n\nGenerate ${count} viral tweets.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          })
        });

        if (!aiResponse.ok) {
          throw new Error("Failed to generate tweets");
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "[]";
        
        // Parse JSON from response
        let tweets = [];
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            tweets = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Parse error:", e);
          tweets = [{ text: content, hashtags: [] }];
        }

        return new Response(
          JSON.stringify({ success: true, tweets }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("X post error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function updateDailyAnalytics(supabase: any, connectionId: string, type: string, count = 1) {
  const today = new Date().toISOString().split("T")[0];
  
  const { data: existing } = await supabase
    .from("x_analytics")
    .select("*")
    .eq("connection_id", connectionId)
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("x_analytics")
      .update({
        tweets_posted: (existing.tweets_posted || 0) + count
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("x_analytics")
      .insert({
        connection_id: connectionId,
        date: today,
        tweets_posted: count
      });
  }
}