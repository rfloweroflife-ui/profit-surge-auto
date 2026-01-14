import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface XTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
  scope: string;
}

interface XUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, code, redirectUri, userIdentifier = "default" } = await req.json();

    const clientId = Deno.env.get("X_CLIENT_ID");
    const clientSecret = Deno.env.get("X_CLIENT_SECRET");

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      if (action === "check_status") {
        return new Response(
          JSON.stringify({
            connected: false,
            needsSetup: true,
            message: "X API credentials not configured. Add X_CLIENT_ID and X_CLIENT_SECRET to your secrets."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          error: "X API credentials not configured",
          needsSetup: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    switch (action) {
      case "get_auth_url": {
        const state = crypto.randomUUID();
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        
        // Store code verifier for later use
        await supabase.from("x_connections").upsert({
          user_identifier: userIdentifier,
          access_token: codeVerifier, // Temporarily store code verifier
          is_active: false,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_identifier" });

        const scopes = [
          "tweet.read",
          "tweet.write",
          "users.read",
          "offline.access"
        ].join(" ");

        const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("client_id", clientId);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("scope", scopes);
        authUrl.searchParams.set("state", state);
        authUrl.searchParams.set("code_challenge", codeChallenge);
        authUrl.searchParams.set("code_challenge_method", "S256");

        return new Response(
          JSON.stringify({ authUrl: authUrl.toString(), state }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "exchange_code": {
        if (!code || !redirectUri) {
          throw new Error("Missing code or redirectUri");
        }

        // Get stored code verifier
        const { data: storedConnection } = await supabase
          .from("x_connections")
          .select("access_token")
          .eq("user_identifier", userIdentifier)
          .single();

        const codeVerifier = storedConnection?.access_token;
        if (!codeVerifier) {
          throw new Error("Code verifier not found. Please restart OAuth flow.");
        }

        // Exchange code for tokens
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("X token error:", errorText);
          throw new Error("Failed to exchange authorization code");
        }

        const tokens: XTokenResponse = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics", {
          headers: {
            "Authorization": `Bearer ${tokens.access_token}`
          }
        });

        let userData: XUserResponse | null = null;
        if (userResponse.ok) {
          userData = await userResponse.json();
        }

        // Calculate expiration
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

        // Store connection
        const { error: upsertError } = await supabase
          .from("x_connections")
          .upsert({
            user_identifier: userIdentifier,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_type: tokens.token_type,
            x_user_id: userData?.data?.id,
            x_username: userData?.data?.username,
            x_name: userData?.data?.name,
            x_profile_image: userData?.data?.profile_image_url,
            followers_count: userData?.data?.public_metrics?.followers_count || 0,
            following_count: userData?.data?.public_metrics?.following_count || 0,
            tweet_count: userData?.data?.public_metrics?.tweet_count || 0,
            scopes: tokens.scope.split(" "),
            expires_at: expiresAt,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_identifier" });

        if (upsertError) {
          console.error("Store connection error:", upsertError);
          throw new Error("Failed to store X connection");
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: userData?.data,
            expiresAt
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_status": {
        const { data: connection } = await supabase
          .from("x_connections")
          .select("*")
          .eq("user_identifier", userIdentifier)
          .eq("is_active", true)
          .single();

        if (!connection) {
          return new Response(
            JSON.stringify({ connected: false }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if token is expired
        const isExpired = connection.expires_at && new Date(connection.expires_at) < new Date();

        if (isExpired && connection.refresh_token) {
          // Try to refresh the token
          try {
            const refreshed = await refreshAccessToken(
              connection.refresh_token,
              clientId,
              clientSecret,
              supabase,
              userIdentifier
            );
            
            return new Response(
              JSON.stringify({
                connected: true,
                username: connection.x_username,
                name: connection.x_name,
                profileImage: connection.x_profile_image,
                followers: connection.followers_count,
                following: connection.following_count,
                tweets: connection.tweet_count,
                expiresAt: refreshed.expiresAt,
                refreshed: true
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (err) {
            console.error("Token refresh failed:", err);
            return new Response(
              JSON.stringify({ connected: false, needsRefresh: true }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        return new Response(
          JSON.stringify({
            connected: !isExpired,
            needsRefresh: isExpired,
            username: connection.x_username,
            name: connection.x_name,
            profileImage: connection.x_profile_image,
            followers: connection.followers_count,
            following: connection.following_count,
            tweets: connection.tweet_count,
            expiresAt: connection.expires_at
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "disconnect": {
        const { error } = await supabase
          .from("x_connections")
          .update({ is_active: false })
          .eq("user_identifier", userIdentifier);

        if (error) {
          throw new Error("Failed to disconnect X account");
        }

        return new Response(
          JSON.stringify({ success: true, message: "X account disconnected" }),
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
    console.error("X auth error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper functions for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  supabase: any,
  userIdentifier: string
) {
  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basicAuth}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const tokens: XTokenResponse = await response.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from("x_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refreshToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq("user_identifier", userIdentifier);

  return { expiresAt };
}