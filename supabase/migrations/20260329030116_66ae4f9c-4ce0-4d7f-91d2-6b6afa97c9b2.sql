
-- Add user_id to tables that need tenant scoping
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.email_flows ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.x_tweets ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.x_analytics ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.x_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.pinterest_pins ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.pinterest_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.whatsapp_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.whatsapp_auto_replies ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.whatsapp_scheduled_messages ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.whatsapp_analytics ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.klaviyo_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cj_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cj_products ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cj_orders ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.cj_inventory_logs ADD COLUMN IF NOT EXISTS user_id uuid;

-- Drop all permissive USING(true) policies and replace with tenant-scoped
DROP POLICY IF EXISTS "Allow all operations on email_campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow all operations on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow all operations on email_flows" ON public.email_flows;
DROP POLICY IF EXISTS "Allow all operations on email_subscribers" ON public.email_subscribers;
DROP POLICY IF EXISTS "Allow all operations on x_tweets" ON public.x_tweets;
DROP POLICY IF EXISTS "Allow all operations on x_analytics" ON public.x_analytics;
DROP POLICY IF EXISTS "Authenticated access x_connections" ON public.x_connections;
DROP POLICY IF EXISTS "Allow all pinterest_pins operations" ON public.pinterest_pins;
DROP POLICY IF EXISTS "Authenticated access pinterest_connections" ON public.pinterest_connections;
DROP POLICY IF EXISTS "Authenticated access whatsapp_connections" ON public.whatsapp_connections;
DROP POLICY IF EXISTS "Allow all operations on whatsapp_messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Allow all operations on whatsapp_auto_replies" ON public.whatsapp_auto_replies;
DROP POLICY IF EXISTS "Allow all operations on whatsapp_scheduled_messages" ON public.whatsapp_scheduled_messages;
DROP POLICY IF EXISTS "Allow all operations on whatsapp_analytics" ON public.whatsapp_analytics;
DROP POLICY IF EXISTS "Authenticated access klaviyo_connections" ON public.klaviyo_connections;
DROP POLICY IF EXISTS "Authenticated access cj_connections" ON public.cj_connections;
DROP POLICY IF EXISTS "Allow all cj_products operations" ON public.cj_products;
DROP POLICY IF EXISTS "Allow all cj_orders operations" ON public.cj_orders;
DROP POLICY IF EXISTS "Allow all cj_inventory_logs operations" ON public.cj_inventory_logs;

-- Create tenant-scoped RLS policies
CREATE POLICY "Users manage own email_campaigns" ON public.email_campaigns FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own email_templates" ON public.email_templates FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own email_flows" ON public.email_flows FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own email_subscribers" ON public.email_subscribers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own x_tweets" ON public.x_tweets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own x_analytics" ON public.x_analytics FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own x_connections" ON public.x_connections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own pinterest_pins" ON public.pinterest_pins FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own pinterest_connections" ON public.pinterest_connections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own whatsapp_connections" ON public.whatsapp_connections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own whatsapp_messages" ON public.whatsapp_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own whatsapp_auto_replies" ON public.whatsapp_auto_replies FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own whatsapp_scheduled_messages" ON public.whatsapp_scheduled_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own whatsapp_analytics" ON public.whatsapp_analytics FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own klaviyo_connections" ON public.klaviyo_connections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own cj_connections" ON public.cj_connections FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own cj_products" ON public.cj_products FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own cj_orders" ON public.cj_orders FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own cj_inventory_logs" ON public.cj_inventory_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Admin policies for all scoped tables
CREATE POLICY "Admins manage all email_campaigns" ON public.email_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all email_templates" ON public.email_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all email_flows" ON public.email_flows FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all email_subscribers" ON public.email_subscribers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all x_tweets" ON public.x_tweets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all x_analytics" ON public.x_analytics FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all x_connections" ON public.x_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all pinterest_pins" ON public.pinterest_pins FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all pinterest_connections" ON public.pinterest_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all whatsapp_connections" ON public.whatsapp_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all whatsapp_messages" ON public.whatsapp_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all whatsapp_auto_replies" ON public.whatsapp_auto_replies FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all whatsapp_scheduled_messages" ON public.whatsapp_scheduled_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all whatsapp_analytics" ON public.whatsapp_analytics FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all klaviyo_connections" ON public.klaviyo_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all cj_connections" ON public.cj_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all cj_products" ON public.cj_products FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all cj_orders" ON public.cj_orders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all cj_inventory_logs" ON public.cj_inventory_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Also fix subscriptions: remove the overly permissive public policy  
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
