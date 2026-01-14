import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PinData {
  title: string;
  description: string;
  link?: string;
  imageUrl: string;
  boardId?: string;
  altText?: string;
  productId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, pins, boardName } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get stored access token
    const tokenResponse = await fetch(
      `${supabaseUrl}/rest/v1/pinterest_connections?user_identifier=eq.default&select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      }
    );

    const connections = await tokenResponse.json();
    
    if (connections.length === 0) {
      return new Response(
        JSON.stringify({ error: "Pinterest not connected. Please authorize first." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = connections[0].access_token;
    const pinterestUserId = connections[0].pinterest_user_id;

    // Check if token is expired
    if (new Date(connections[0].expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Pinterest token expired. Please reconnect." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create board
    if (action === "get_boards") {
      const boardsResponse = await fetch(
        `https://api.pinterest.com/v5/boards?page_size=100`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );

      if (!boardsResponse.ok) {
        const error = await boardsResponse.text();
        return new Response(
          JSON.stringify({ error: "Failed to fetch boards", details: error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const boards = await boardsResponse.json();
      return new Response(
        JSON.stringify({ boards: boards.items }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a new board
    if (action === "create_board") {
      const createBoardResponse = await fetch(
        "https://api.pinterest.com/v5/boards",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: boardName || "Aura Luxe Skincare",
            description: "Premium skincare products for glowing, radiant skin ✨",
            privacy: "PUBLIC"
          })
        }
      );

      if (!createBoardResponse.ok) {
        const error = await createBoardResponse.text();
        return new Response(
          JSON.stringify({ error: "Failed to create board", details: error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const board = await createBoardResponse.json();
      return new Response(
        JSON.stringify({ success: true, board }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create pin(s)
    if (action === "create_pins") {
      if (!pins || !Array.isArray(pins) || pins.length === 0) {
        return new Response(
          JSON.stringify({ error: "No pins provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = [];
      const errors = [];

      for (const pin of pins as PinData[]) {
        try {
          // Create pin via Pinterest API
          const pinResponse = await fetch(
            "https://api.pinterest.com/v5/pins",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                title: pin.title.substring(0, 100), // Pinterest title limit
                description: pin.description.substring(0, 500), // Pinterest description limit
                link: pin.link,
                board_id: pin.boardId,
                media_source: {
                  source_type: "image_url",
                  url: pin.imageUrl
                },
                alt_text: pin.altText || pin.title.substring(0, 500)
              })
            }
          );

          if (pinResponse.ok) {
            const pinData = await pinResponse.json();
            
            // Store in our database
            await fetch(`${supabaseUrl}/rest/v1/pinterest_pins`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({
                pin_id: pinData.id,
                board_id: pin.boardId,
                product_id: pin.productId,
                title: pin.title,
                description: pin.description,
                link: pin.link,
                image_url: pin.imageUrl,
                status: "posted",
                posted_at: new Date().toISOString()
              })
            });

            results.push({
              success: true,
              pinId: pinData.id,
              title: pin.title
            });
          } else {
            const errorText = await pinResponse.text();
            errors.push({
              title: pin.title,
              error: errorText
            });
          }

          // Rate limiting - wait 500ms between pins
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push({
            title: pin.title,
            error: errorMessage
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: results.length > 0,
          posted: results.length,
          failed: errors.length,
          results,
          errors: errors.length > 0 ? errors : undefined
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get posted pins analytics
    if (action === "get_analytics") {
      const pinsResponse = await fetch(
        `${supabaseUrl}/rest/v1/pinterest_pins?order=created_at.desc&limit=50`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        }
      );

      const storedPins = await pinsResponse.json();
      
      return new Response(
        JSON.stringify({ pins: storedPins }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Pinterest post error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
