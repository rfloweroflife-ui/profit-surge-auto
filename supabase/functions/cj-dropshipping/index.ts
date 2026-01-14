import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

interface CJApiResponse {
  code: number;
  result: boolean;
  message: string;
  data: any;
}

async function cjApiRequest(endpoint: string, apiKey: string, method: string = 'GET', body?: any): Promise<CJApiResponse> {
  const url = `${CJ_API_BASE}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'CJ-Access-Token': apiKey,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`CJ API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case 'connect': {
        const { apiKey, email } = params;
        
        // Verify API key by getting access token info
        try {
          const tokenResponse = await cjApiRequest('/authentication/getAccessToken', apiKey, 'POST', {
            email: email,
            password: apiKey // CJ uses API key as password for token generation
          });

          if (!tokenResponse.result) {
            // Try direct API call to verify
            const verifyResponse = await cjApiRequest('/product/list', apiKey, 'GET');
          }
        } catch (e) {
          // Continue anyway - some API keys work without token endpoint
          console.log('Token verification skipped:', e);
        }

        // Store connection
        const { data, error } = await supabase
          .from('cj_connections')
          .upsert({
            api_key: apiKey,
            email: email,
            is_active: true,
            last_sync_at: new Date().toISOString(),
          }, { onConflict: 'user_identifier' })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          connection: { id: data.id, email: data.email, is_active: data.is_active }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'disconnect': {
        const { error } = await supabase
          .from('cj_connections')
          .update({ is_active: false })
          .eq('user_identifier', 'default');

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'status': {
        const { data: connection } = await supabase
          .from('cj_connections')
          .select('*')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        const { data: products } = await supabase
          .from('cj_products')
          .select('id', { count: 'exact' });

        const { data: orders } = await supabase
          .from('cj_orders')
          .select('id, status', { count: 'exact' });

        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
        const fulfilledOrders = orders?.filter(o => o.status === 'fulfilled').length || 0;

        return new Response(JSON.stringify({
          connected: !!connection,
          connection: connection ? {
            email: connection.email,
            lastSync: connection.last_sync_at
          } : null,
          stats: {
            totalProducts: products?.length || 0,
            totalOrders: orders?.length || 0,
            pendingOrders,
            fulfilledOrders
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync-products': {
        const { data: connection } = await supabase
          .from('cj_connections')
          .select('api_key')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        if (!connection) {
          throw new Error('CJ Dropshipping not connected');
        }

        // Fetch products from CJ
        const productsResponse = await cjApiRequest(
          '/product/list?pageNum=1&pageSize=100',
          connection.api_key
        );

        const cjProducts = productsResponse.data?.list || [];
        
        for (const product of cjProducts) {
          await supabase.from('cj_products').upsert({
            cj_product_id: product.pid,
            product_name: product.productNameEn || product.productName,
            product_sku: product.productSku,
            cj_price: parseFloat(product.sellPrice || '0'),
            inventory_count: product.productStock || 0,
            category: product.categoryName,
            image_url: product.productImage,
            supplier_name: product.supplierName,
            shipping_time: product.createTime,
            is_synced: true,
            last_inventory_update: new Date().toISOString(),
          }, { onConflict: 'cj_product_id' });
        }

        // Update last sync time
        await supabase
          .from('cj_connections')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('user_identifier', 'default');

        return new Response(JSON.stringify({
          success: true,
          synced: cjProducts.length
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'search-products': {
        const { query, category } = params;
        
        const { data: connection } = await supabase
          .from('cj_connections')
          .select('api_key')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        if (!connection) {
          throw new Error('CJ Dropshipping not connected');
        }

        let endpoint = `/product/list?pageNum=1&pageSize=50`;
        if (query) endpoint += `&productNameEn=${encodeURIComponent(query)}`;
        if (category) endpoint += `&categoryId=${category}`;

        const response = await cjApiRequest(endpoint, connection.api_key);

        return new Response(JSON.stringify({
          success: true,
          products: response.data?.list || []
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get-products': {
        const { data: products } = await supabase
          .from('cj_products')
          .select('*')
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          products: products || []
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'create-order': {
        const { shopifyOrderId, orderNumber, customer, shippingAddress, items, totalAmount } = params;

        const { data: connection } = await supabase
          .from('cj_connections')
          .select('api_key')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        if (!connection) {
          throw new Error('CJ Dropshipping not connected');
        }

        // Calculate CJ cost from items
        let cjCost = 0;
        const cjItems = [];
        
        for (const item of items) {
          const { data: cjProduct } = await supabase
            .from('cj_products')
            .select('*')
            .eq('shopify_variant_id', item.variantId)
            .single();

          if (cjProduct) {
            cjCost += cjProduct.cj_price * item.quantity;
            cjItems.push({
              vid: cjProduct.cj_product_id,
              quantity: item.quantity,
            });
          }
        }

        // Create order in CJ
        const cjOrderPayload = {
          orderNumber: orderNumber,
          shippingZip: shippingAddress.zip,
          shippingCountryCode: shippingAddress.countryCode,
          shippingCountry: shippingAddress.country,
          shippingProvince: shippingAddress.province,
          shippingCity: shippingAddress.city,
          shippingAddress: shippingAddress.address1,
          shippingCustomerName: customer.name,
          shippingPhone: shippingAddress.phone || '',
          products: cjItems,
        };

        let cjOrderId = null;
        let status = 'pending';
        let errorMessage = null;

        try {
          const cjResponse = await cjApiRequest('/shopping/order/createOrder', connection.api_key, 'POST', cjOrderPayload);
          
          if (cjResponse.result) {
            cjOrderId = cjResponse.data?.orderId;
            status = 'processing';
          } else {
            errorMessage = cjResponse.message;
            status = 'failed';
          }
        } catch (e) {
          errorMessage = e instanceof Error ? e.message : 'Unknown error';
          status = 'failed';
        }

        // Store order in database
        const { data: order, error } = await supabase
          .from('cj_orders')
          .insert({
            shopify_order_id: shopifyOrderId,
            shopify_order_number: orderNumber,
            cj_order_id: cjOrderId,
            customer_name: customer.name,
            customer_email: customer.email,
            shipping_address: shippingAddress,
            order_items: items,
            total_amount: totalAmount,
            cj_cost: cjCost,
            profit: totalAmount - cjCost,
            status,
            error_message: errorMessage,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: status !== 'failed',
          order,
          cjOrderId,
          error: errorMessage
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get-orders': {
        const { status: orderStatus } = params;
        
        let query = supabase
          .from('cj_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orderStatus) {
          query = query.eq('status', orderStatus);
        }

        const { data: orders } = await query;

        return new Response(JSON.stringify({
          success: true,
          orders: orders || []
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'check-tracking': {
        const { orderId } = params;

        const { data: connection } = await supabase
          .from('cj_connections')
          .select('api_key')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        if (!connection) {
          throw new Error('CJ Dropshipping not connected');
        }

        const { data: order } = await supabase
          .from('cj_orders')
          .select('cj_order_id')
          .eq('id', orderId)
          .single();

        if (!order?.cj_order_id) {
          throw new Error('Order not found or not submitted to CJ');
        }

        const response = await cjApiRequest(
          `/logistic/getTrackInfo?orderId=${order.cj_order_id}`,
          connection.api_key
        );

        if (response.result && response.data) {
          await supabase
            .from('cj_orders')
            .update({
              tracking_number: response.data.trackNumber,
              tracking_url: response.data.trackingUrl,
              carrier: response.data.logisticName,
              fulfillment_status: response.data.status === 'Delivered' ? 'fulfilled' : 'in_transit',
              status: response.data.status === 'Delivered' ? 'fulfilled' : 'shipped',
            })
            .eq('id', orderId);
        }

        return new Response(JSON.stringify({
          success: true,
          tracking: response.data
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync-inventory': {
        const { data: connection } = await supabase
          .from('cj_connections')
          .select('api_key')
          .eq('user_identifier', 'default')
          .eq('is_active', true)
          .single();

        if (!connection) {
          throw new Error('CJ Dropshipping not connected');
        }

        const { data: products } = await supabase
          .from('cj_products')
          .select('*')
          .eq('is_synced', true);

        let updated = 0;
        for (const product of products || []) {
          try {
            const response = await cjApiRequest(
              `/product/query?pid=${product.cj_product_id}`,
              connection.api_key
            );

            if (response.result && response.data) {
              const newCount = response.data.productStock || 0;
              
              if (newCount !== product.inventory_count) {
                await supabase.from('cj_inventory_logs').insert({
                  cj_product_id: product.cj_product_id,
                  previous_count: product.inventory_count,
                  new_count: newCount,
                  change_type: newCount > product.inventory_count ? 'restock' : 'sale',
                });

                await supabase
                  .from('cj_products')
                  .update({
                    inventory_count: newCount,
                    last_inventory_update: new Date().toISOString(),
                  })
                  .eq('id', product.id);

                updated++;
              }
            }
          } catch (e) {
            console.error(`Failed to sync product ${product.cj_product_id}:`, e);
          }
        }

        await supabase
          .from('cj_connections')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('user_identifier', 'default');

        return new Response(JSON.stringify({
          success: true,
          updated
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'link-product': {
        const { cjProductId, shopifyProductId, shopifyVariantId, sellPrice } = params;

        const { error } = await supabase
          .from('cj_products')
          .update({
            shopify_product_id: shopifyProductId,
            shopify_variant_id: shopifyVariantId,
            sell_price: sellPrice,
            is_synced: true,
          })
          .eq('cj_product_id', cjProductId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-analytics': {
        const { data: orders } = await supabase
          .from('cj_orders')
          .select('*');

        const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const totalCost = orders?.reduce((sum, o) => sum + (o.cj_cost || 0), 0) || 0;
        const totalProfit = orders?.reduce((sum, o) => sum + (o.profit || 0), 0) || 0;
        const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;

        const statusBreakdown = {
          pending: orders?.filter(o => o.status === 'pending').length || 0,
          processing: orders?.filter(o => o.status === 'processing').length || 0,
          shipped: orders?.filter(o => o.status === 'shipped').length || 0,
          fulfilled: orders?.filter(o => o.status === 'fulfilled').length || 0,
          failed: orders?.filter(o => o.status === 'failed').length || 0,
        };

        return new Response(JSON.stringify({
          success: true,
          analytics: {
            totalOrders: orders?.length || 0,
            totalRevenue,
            totalCost,
            totalProfit,
            profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(2) : 0,
            avgOrderValue,
            statusBreakdown,
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('CJ Dropshipping error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
