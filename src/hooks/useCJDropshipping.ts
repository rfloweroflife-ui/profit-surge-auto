import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CJConnection {
  email: string | null;
  lastSync: string | null;
}

interface CJStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  fulfilledOrders: number;
}

interface CJProduct {
  id: string;
  cj_product_id: string;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  product_name: string;
  product_sku: string | null;
  cj_price: number;
  sell_price: number;
  inventory_count: number;
  category: string | null;
  image_url: string | null;
  supplier_name: string | null;
  is_synced: boolean;
  last_inventory_update: string | null;
}

interface CJOrder {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string | null;
  cj_order_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  total_amount: number;
  cj_cost: number;
  profit: number;
  status: string;
  tracking_number: string | null;
  carrier: string | null;
  fulfillment_status: string;
  created_at: string;
}

interface CJAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: string;
  avgOrderValue: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    fulfilled: number;
    failed: number;
  };
}

export function useCJDropshipping() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<CJConnection | null>(null);
  const [stats, setStats] = useState<CJStats | null>(null);
  const [products, setProducts] = useState<CJProduct[]>([]);
  const [orders, setOrders] = useState<CJOrder[]>([]);
  const [analytics, setAnalytics] = useState<CJAnalytics | null>(null);

  const invokeFunction = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('cj-dropshipping', {
      body: { action, ...params }
    });

    if (error) throw error;
    return data;
  };

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await invokeFunction('status');
      setIsConnected(data.connected);
      setConnection(data.connection);
      setStats(data.stats);
    } catch (error) {
      console.error('Error checking CJ status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const connect = async (apiKey: string, email: string) => {
    try {
      setIsLoading(true);
      const data = await invokeFunction('connect', { apiKey, email });
      
      if (data.success) {
        toast.success('CJ Dropshipping connected successfully!');
        await checkStatus();
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to connect CJ Dropshipping');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setIsLoading(true);
      await invokeFunction('disconnect');
      setIsConnected(false);
      setConnection(null);
      toast.success('CJ Dropshipping disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      const data = await invokeFunction('sync-products');
      toast.success(`Synced ${data.synced} products from CJ`);
      await fetchProducts();
      await checkStatus();
    } catch (error) {
      toast.error('Failed to sync products');
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await invokeFunction('get-products');
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const searchProducts = async (query: string, category?: string) => {
    try {
      const data = await invokeFunction('search-products', { query, category });
      return data.products;
    } catch (error) {
      toast.error('Failed to search products');
      console.error(error);
      return [];
    }
  };

  const linkProduct = async (cjProductId: string, shopifyProductId: string, shopifyVariantId: string, sellPrice: number) => {
    try {
      await invokeFunction('link-product', { cjProductId, shopifyProductId, shopifyVariantId, sellPrice });
      toast.success('Product linked successfully');
      await fetchProducts();
    } catch (error) {
      toast.error('Failed to link product');
      console.error(error);
    }
  };

  const createOrder = async (orderData: {
    shopifyOrderId: string;
    orderNumber: string;
    customer: { name: string; email: string };
    shippingAddress: Record<string, any>;
    items: Array<{ variantId: string; quantity: number }>;
    totalAmount: number;
  }) => {
    try {
      const data = await invokeFunction('create-order', orderData);
      
      if (data.success) {
        toast.success('Order sent to CJ Dropshipping');
      } else {
        toast.error(`Order failed: ${data.error}`);
      }
      
      await fetchOrders();
      return data;
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
      return null;
    }
  };

  const fetchOrders = async (status?: string) => {
    try {
      const data = await invokeFunction('get-orders', { status });
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const checkTracking = async (orderId: string) => {
    try {
      const data = await invokeFunction('check-tracking', { orderId });
      toast.success('Tracking info updated');
      await fetchOrders();
      return data.tracking;
    } catch (error) {
      toast.error('Failed to get tracking info');
      console.error(error);
      return null;
    }
  };

  const syncInventory = async () => {
    try {
      const data = await invokeFunction('sync-inventory');
      toast.success(`Updated inventory for ${data.updated} products`);
      await fetchProducts();
    } catch (error) {
      toast.error('Failed to sync inventory');
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await invokeFunction('get-analytics');
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return {
    isConnected,
    isLoading,
    connection,
    stats,
    products,
    orders,
    analytics,
    connect,
    disconnect,
    syncProducts,
    fetchProducts,
    searchProducts,
    linkProduct,
    createOrder,
    fetchOrders,
    checkTracking,
    syncInventory,
    fetchAnalytics,
    refresh: checkStatus,
  };
}
