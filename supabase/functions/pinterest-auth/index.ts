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
    const { action, code, redirectUri } = await req.json();
    
    const PINTEREST_APP_ID = Deno.env.get("PINTEREST_APP_ID");
    const PINTEREST_APP_SECRET = Deno.env.get("PINTEREST_APP_SECRET");
    
    if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: "Pinterest API credentials not configured",
          needsSetup: true,
          setupInstructions: "Add PINTEREST_APP_ID and PINTEREST_APP_SECRET to your secrets"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate OAuth URL for user authorization
    if (action === "get_auth_url") {
      const callbackUrl = redirectUri || `${req.headers.get("origin")}/integrations`;
      const state = crypto.randomUUID();
      
      const scopes = [
        "boards:read",
        "boards:write", 
        "pins:read",
        "pins:write",
        "user_accounts:read"
      ].join(",");
      
      const authUrl = `https://www.pinterest.com/oauth/?` +
        `client_id=${PINTEREST_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${state}`;

      return new Response(
        JSON.stringify({ 
          authUrl, 
          state,
          message: "Redirect user to this URL for Pinterest authorization"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for access token
    if (action === "exchange_code") {
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Authorization code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const callbackUrl = redirectUri || `${req.headers.get("origin")}/integrations`;
      
      const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: callbackUrl
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Pinterest token exchange failed:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for token", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info
      const userResponse = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`
        }
      });

      let userData = null;
      if (userResponse.ok) {
        userData = await userResponse.json();
      }

      // Store in Supabase
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      const storeResponse = await fetch(`${supabaseUrl}/rest/v1/pinterest_connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          user_identifier: "default",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_at: expiresAt,
          pinterest_user_id: userData?.id,
          pinterest_username: userData?.username,
          scopes: tokenData.scope?.split(",") || []
        })
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Pinterest connected successfully!",
          user: userData ? {
            id: userData.id,
            username: userData.username,
            profile_image: userData.profile_image
          } : null,
          expiresAt
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check connection status
    if (action === "check_status") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/pinterest_connections?user_identifier=eq.default&select=*`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        }
      );

      const connections = await response.json();
      
      if (connections.length === 0) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const connection = connections[0];
      const isExpired = new Date(connection.expires_at) < new Date();

      return new Response(
        JSON.stringify({ 
          connected: !isExpired,
          username: connection.pinterest_username,
          expiresAt: connection.expires_at,
          needsRefresh: isExpired
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send conversion event using PINTEREST_CONVERSION_TOKEN
    if (action === "send_conversion") {
      const CONVERSION_TOKEN = Deno.env.get("PINTEREST_CONVERSION_TOKEN");
      
      if (!CONVERSION_TOKEN) {
        return new Response(
          JSON.stringify({ 
            error: "Pinterest Conversion Token not configured",
            needsSetup: true 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { event_name, event_time, event_id, user_data, custom_data, event_source_url, action_source } = await req.json().catch(() => ({}));
      
      const conversionData = {
        data: [{
          event_name: event_name || "checkout",
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          user_data: user_data || {},
          custom_data: custom_data || {},
          event_source_url: event_source_url || "",
          action_source: action_source || "web"
        }]
      };

      const conversionResponse = await fetch("https://api.pinterest.com/v5/ad_accounts/conversions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CONVERSION_TOKEN}`
        },
        body: JSON.stringify(conversionData)
      });

      if (!conversionResponse.ok) {
        const errorData = await conversionResponse.text();
        console.error("Pinterest conversion API error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send conversion event", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await conversionResponse.json();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Conversion event sent successfully",
          result 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get conversion stats
    if (action === "get_conversion_stats") {
      const CONVERSION_TOKEN = Deno.env.get("PINTEREST_CONVERSION_TOKEN");
      
      if (!CONVERSION_TOKEN) {
        return new Response(
          JSON.stringify({ 
            error: "Pinterest Conversion Token not configured",
            needsSetup: true 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate token by making a test API call
      const validateResponse = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: {
          "Authorization": `Bearer ${CONVERSION_TOKEN}`
        }
      });

      if (!validateResponse.ok) {
        return new Response(
          JSON.stringify({ 
            connected: false,
            error: "Invalid or expired conversion token"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userData = await validateResponse.json();
      
      return new Response(
        JSON.stringify({ 
          connected: true,
          conversionTokenValid: true,
          user: {
            id: userData.id,
            username: userData.username
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Pinterest auth error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
