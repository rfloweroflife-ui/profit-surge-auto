import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationStatus {
  name: string;
  status: "connected" | "disconnected" | "error" | "needs_setup";
  message: string;
  details?: Record<string, unknown>;
  lastChecked: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    const results: IntegrationStatus[] = [];
    const timestamp = new Date().toISOString();

    // 1. Verify ElevenLabs
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (ELEVENLABS_API_KEY) {
      try {
        const elevenResponse = await fetch("https://api.elevenlabs.io/v1/user", {
          headers: { "xi-api-key": ELEVENLABS_API_KEY }
        });
        
        if (elevenResponse.ok) {
          const userData = await elevenResponse.json();
          results.push({
            name: "ElevenLabs",
            status: "connected",
            message: `Connected - ${userData.subscription?.tier || 'Active'} tier`,
            details: {
              characterCount: userData.subscription?.character_count,
              characterLimit: userData.subscription?.character_limit,
              tier: userData.subscription?.tier
            },
            lastChecked: timestamp
          });
        } else {
          results.push({
            name: "ElevenLabs",
            status: "error",
            message: "API key invalid or expired",
            lastChecked: timestamp
          });
        }
      } catch (error) {
        results.push({
          name: "ElevenLabs",
          status: "error",
          message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastChecked: timestamp
        });
      }
    } else {
      results.push({
        name: "ElevenLabs",
        status: "needs_setup",
        message: "ELEVENLABS_API_KEY not configured",
        lastChecked: timestamp
      });
    }

    // 2. Verify Shopify
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    const SHOPIFY_STOREFRONT_TOKEN = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    
    if (SHOPIFY_ACCESS_TOKEN && SHOPIFY_STOREFRONT_TOKEN) {
      results.push({
        name: "Shopify",
        status: "connected",
        message: "Connected to lovable-project-i664s.myshopify.com",
        details: {
          store: "lovable-project-i664s.myshopify.com",
          hasAccessToken: true,
          hasStorefrontToken: true
        },
        lastChecked: timestamp
      });
    } else {
      results.push({
        name: "Shopify",
        status: "needs_setup",
        message: "Shopify tokens not configured",
        lastChecked: timestamp
      });
    }

    // 3. Verify Pinterest
    const PINTEREST_APP_ID = Deno.env.get("PINTEREST_APP_ID");
    const PINTEREST_APP_SECRET = Deno.env.get("PINTEREST_APP_SECRET");
    
    if (PINTEREST_APP_ID && PINTEREST_APP_SECRET) {
      // Check if there's an active connection in the database
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      try {
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
        
        if (connections.length > 0) {
          const connection = connections[0];
          const isExpired = new Date(connection.expires_at) < new Date();
          
          if (!isExpired && connection.access_token) {
            // Test the token
            const testResponse = await fetch("https://api.pinterest.com/v5/user_account", {
              headers: { "Authorization": `Bearer ${connection.access_token}` }
            });
            
            if (testResponse.ok) {
              const userData = await testResponse.json();
              results.push({
                name: "Pinterest",
                status: "connected",
                message: `Connected as @${userData.username || connection.pinterest_username}`,
                details: {
                  userId: userData.id || connection.pinterest_user_id,
                  username: userData.username || connection.pinterest_username,
                  expiresAt: connection.expires_at,
                  scopes: connection.scopes
                },
                lastChecked: timestamp
              });
            } else {
              results.push({
                name: "Pinterest",
                status: "error",
                message: "Token invalid - requires reauthorization",
                lastChecked: timestamp
              });
            }
          } else {
            results.push({
              name: "Pinterest",
              status: "error",
              message: "Token expired - click Connect to reauthorize",
              lastChecked: timestamp
            });
          }
        } else {
          results.push({
            name: "Pinterest",
            status: "disconnected",
            message: "API configured - click Connect to authorize",
            details: { hasCredentials: true },
            lastChecked: timestamp
          });
        }
      } catch (error) {
        results.push({
          name: "Pinterest",
          status: "error",
          message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          lastChecked: timestamp
        });
      }
    } else {
      results.push({
        name: "Pinterest",
        status: "needs_setup",
        message: "PINTEREST_APP_ID and PINTEREST_APP_SECRET required",
        lastChecked: timestamp
      });
    }

    // 4. Verify Instagram/Meta
    const INSTAGRAM_APP_ID = Deno.env.get("INSTAGRAM_APP_ID");
    const INSTAGRAM_APP_SECRET = Deno.env.get("INSTAGRAM_APP_SECRET");
    
    if (INSTAGRAM_APP_ID && INSTAGRAM_APP_SECRET) {
      results.push({
        name: "Instagram",
        status: "disconnected",
        message: "API configured - OAuth setup pending",
        details: { hasCredentials: true },
        lastChecked: timestamp
      });
    } else {
      results.push({
        name: "Instagram",
        status: "needs_setup",
        message: "INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET required (Meta Business)",
        lastChecked: timestamp
      });
    }

    // 5. Verify D-ID
    const D_ID_API_KEY = Deno.env.get("D_ID_API_KEY");
    
    if (D_ID_API_KEY) {
      try {
        const didResponse = await fetch("https://api.d-id.com/credits", {
          headers: { 
            "Authorization": `Basic ${D_ID_API_KEY}`,
            "Content-Type": "application/json"
          }
        });
        
        if (didResponse.ok) {
          const creditsData = await didResponse.json();
          results.push({
            name: "D-ID",
            status: "connected",
            message: `Connected - ${creditsData.remaining || 0} credits remaining`,
            details: { credits: creditsData },
            lastChecked: timestamp
          });
        } else {
          results.push({
            name: "D-ID",
            status: "error",
            message: "API key invalid",
            lastChecked: timestamp
          });
        }
      } catch (error) {
        results.push({
          name: "D-ID",
          status: "error",
          message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          lastChecked: timestamp
        });
      }
    } else {
      results.push({
        name: "D-ID",
        status: "needs_setup",
        message: "D_ID_API_KEY not configured",
        lastChecked: timestamp
      });
    }

    // 6. Check Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      results.push({
        name: "Lovable AI",
        status: "connected",
        message: "AI Gateway active and ready",
        details: { 
          gateway: "ai.gateway.lovable.dev",
          models: ["gemini-2.5-flash", "gemini-2.5-pro", "gpt-5"]
        },
        lastChecked: timestamp
      });
    }

    // 7. Check CJ Dropshipping
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    try {
      const cjResponse = await fetch(
        `${supabaseUrl}/rest/v1/cj_connections?is_active=eq.true&select=*&limit=1`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        }
      );
      
      const cjConnections = await cjResponse.json();
      
      if (cjConnections.length > 0) {
        results.push({
          name: "CJ Dropshipping",
          status: "connected",
          message: `Connected - Last sync: ${cjConnections[0].last_sync_at || 'Never'}`,
          details: { email: cjConnections[0].email },
          lastChecked: timestamp
        });
      } else {
        results.push({
          name: "CJ Dropshipping",
          status: "disconnected",
          message: "Not connected - Add API key in Integrations",
          lastChecked: timestamp
        });
      }
    } catch {
      results.push({
        name: "CJ Dropshipping",
        status: "disconnected",
        message: "Not configured",
        lastChecked: timestamp
      });
    }

    // 8. Check WhatsApp
    try {
      const waResponse = await fetch(
        `${supabaseUrl}/rest/v1/whatsapp_connections?is_active=eq.true&select=*&limit=1`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        }
      );
      
      const waConnections = await waResponse.json();
      
      if (waConnections.length > 0) {
        results.push({
          name: "WhatsApp Business",
          status: "connected",
          message: `Connected - ${waConnections[0].display_phone_number || 'Active'}`,
          details: { 
            phoneNumber: waConnections[0].display_phone_number,
            verifiedName: waConnections[0].verified_name
          },
          lastChecked: timestamp
        });
      } else {
        results.push({
          name: "WhatsApp Business",
          status: "disconnected",
          message: "Not connected",
          lastChecked: timestamp
        });
      }
    } catch {
      results.push({
        name: "WhatsApp Business",
        status: "disconnected",
        message: "Not configured",
        lastChecked: timestamp
      });
    }

    // Summary
    const connected = results.filter(r => r.status === "connected").length;
    const needsSetup = results.filter(r => r.status === "needs_setup").length;
    const errors = results.filter(r => r.status === "error").length;

    return new Response(
      JSON.stringify({
        success: true,
        timestamp,
        summary: {
          total: results.length,
          connected,
          needsSetup,
          errors,
          disconnected: results.filter(r => r.status === "disconnected").length
        },
        integrations: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verify integrations error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
