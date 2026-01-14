-- CJ Dropshipping Connections
CREATE TABLE public.cj_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL DEFAULT 'default',
  api_key TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CJ Products (inventory sync)
CREATE TABLE public.cj_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cj_product_id TEXT NOT NULL UNIQUE,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  cj_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  inventory_count INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  supplier_name TEXT,
  shipping_time TEXT,
  is_synced BOOLEAN DEFAULT false,
  last_inventory_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CJ Orders (fulfillment tracking)
CREATE TABLE public.cj_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,
  cj_order_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  order_items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC DEFAULT 0,
  cj_cost NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CJ Inventory Logs
CREATE TABLE public.cj_inventory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cj_product_id TEXT NOT NULL,
  previous_count INTEGER,
  new_count INTEGER,
  change_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cj_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cj_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cj_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cj_inventory_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all cj_connections operations" ON public.cj_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all cj_products operations" ON public.cj_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all cj_orders operations" ON public.cj_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all cj_inventory_logs operations" ON public.cj_inventory_logs FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_cj_products_shopify ON public.cj_products(shopify_product_id);
CREATE INDEX idx_cj_orders_shopify ON public.cj_orders(shopify_order_id);
CREATE INDEX idx_cj_orders_status ON public.cj_orders(status);

-- Trigger for updated_at
CREATE TRIGGER update_cj_connections_updated_at BEFORE UPDATE ON public.cj_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cj_products_updated_at BEFORE UPDATE ON public.cj_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cj_orders_updated_at BEFORE UPDATE ON public.cj_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();