import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KlaviyoRequest {
  action: 'connect' | 'get_lists' | 'get_segments' | 'create_campaign' | 'send_campaign' | 'get_templates' | 'sync_subscribers' | 'create_flow' | 'get_metrics';
  apiKey?: string;
  privateKey?: string;
  campaignData?: any;
  flowData?: any;
  listId?: string;
  segmentId?: string;
}

const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api';

async function klaviyoRequest(endpoint: string, apiKey: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${KLAVIYO_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      'revision': '2024-02-15'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Klaviyo API error: ${response.status} - ${error}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, apiKey, privateKey, campaignData, flowData, listId, segmentId } = await req.json() as KlaviyoRequest;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get API key from secrets or request
    let klaviyoApiKey = apiKey || Deno.env.get('KLAVIYO_API_KEY');
    let klaviyoPrivateKey = privateKey || Deno.env.get('KLAVIYO_PRIVATE_KEY');

    switch (action) {
      case 'connect': {
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key required for connection' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test connection by getting account info
        const accountInfo = await klaviyoRequest('/accounts/', apiKey);
        
        // Store connection
        const { data: connection, error: connError } = await supabase
          .from('klaviyo_connections')
          .upsert({
            api_key: apiKey,
            private_key: privateKey,
            account_id: accountInfo.data?.[0]?.id,
            is_active: true,
            last_sync_at: new Date().toISOString()
          }, { onConflict: 'user_identifier' })
          .select()
          .single();

        if (connError) throw connError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Connected to Klaviyo successfully',
            account: accountInfo.data?.[0],
            connection 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_lists': {
        if (!klaviyoApiKey) {
          return new Response(
            JSON.stringify({ error: 'Klaviyo not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const lists = await klaviyoRequest('/lists/', klaviyoApiKey);
        
        return new Response(
          JSON.stringify({ success: true, lists: lists.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_segments': {
        if (!klaviyoApiKey) {
          return new Response(
            JSON.stringify({ error: 'Klaviyo not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const segments = await klaviyoRequest('/segments/', klaviyoApiKey);
        
        return new Response(
          JSON.stringify({ success: true, segments: segments.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_templates': {
        if (!klaviyoApiKey) {
          return new Response(
            JSON.stringify({ error: 'Klaviyo not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const templates = await klaviyoRequest('/templates/', klaviyoApiKey);
        
        return new Response(
          JSON.stringify({ success: true, templates: templates.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_campaign': {
        if (!klaviyoApiKey || !campaignData) {
          return new Response(
            JSON.stringify({ error: 'API key and campaign data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create campaign in Klaviyo
        const campaign = await klaviyoRequest('/campaigns/', klaviyoApiKey, 'POST', {
          data: {
            type: 'campaign',
            attributes: {
              name: campaignData.name,
              audiences: {
                included: campaignData.listIds || [],
                excluded: []
              },
              send_strategy: {
                method: campaignData.scheduled_at ? 'static' : 'immediate',
                options_static: campaignData.scheduled_at ? {
                  datetime: campaignData.scheduled_at
                } : undefined
              }
            }
          }
        });

        // Store in our database
        const { data: dbCampaign, error: dbError } = await supabase
          .from('email_campaigns')
          .insert({
            name: campaignData.name,
            subject: campaignData.subject,
            preview_text: campaignData.preview_text,
            template_id: campaignData.template_id,
            campaign_type: campaignData.campaign_type || 'regular',
            status: 'draft',
            list_id: campaignData.listId,
            scheduled_at: campaignData.scheduled_at
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            campaign: campaign.data,
            dbCampaign 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_campaign': {
        if (!klaviyoApiKey || !campaignData?.id) {
          return new Response(
            JSON.stringify({ error: 'API key and campaign ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Send campaign
        const result = await klaviyoRequest(`/campaign-send-jobs/`, klaviyoApiKey, 'POST', {
          data: {
            type: 'campaign-send-job',
            attributes: {
              campaign_id: campaignData.id
            }
          }
        });

        // Update our database
        await supabase
          .from('email_campaigns')
          .update({ 
            status: 'sending',
            sent_at: new Date().toISOString()
          })
          .eq('id', campaignData.dbId);

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_subscribers': {
        if (!klaviyoApiKey) {
          return new Response(
            JSON.stringify({ error: 'Klaviyo not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get profiles from Klaviyo
        const profiles = await klaviyoRequest('/profiles/', klaviyoApiKey);
        
        // Sync to our database
        const subscribers = profiles.data?.map((profile: any) => ({
          email: profile.attributes.email,
          first_name: profile.attributes.first_name,
          last_name: profile.attributes.last_name,
          phone: profile.attributes.phone_number,
          source: 'klaviyo_sync',
          is_subscribed: true
        })) || [];

        if (subscribers.length > 0) {
          const { error: syncError } = await supabase
            .from('email_subscribers')
            .upsert(subscribers, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            });

          if (syncError) throw syncError;
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            synced: subscribers.length,
            message: `Synced ${subscribers.length} subscribers from Klaviyo`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_flow': {
        if (!flowData) {
          return new Response(
            JSON.stringify({ error: 'Flow data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store flow in our database (Klaviyo flows are managed via their UI)
        const { data: flow, error: flowError } = await supabase
          .from('email_flows')
          .insert({
            name: flowData.name,
            trigger_type: flowData.trigger_type,
            trigger_conditions: flowData.trigger_conditions,
            flow_steps: flowData.flow_steps,
            is_active: flowData.is_active || false
          })
          .select()
          .single();

        if (flowError) throw flowError;

        return new Response(
          JSON.stringify({ success: true, flow }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_metrics': {
        if (!klaviyoApiKey) {
          return new Response(
            JSON.stringify({ error: 'Klaviyo not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const metrics = await klaviyoRequest('/metrics/', klaviyoApiKey);
        
        return new Response(
          JSON.stringify({ success: true, metrics: metrics.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Klaviyo function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
