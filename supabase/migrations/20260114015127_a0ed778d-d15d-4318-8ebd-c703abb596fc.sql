-- Create WhatsApp connections table
CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL DEFAULT 'default',
  phone_number_id TEXT,
  business_account_id TEXT,
  access_token TEXT NOT NULL,
  display_phone_number TEXT,
  verified_name TEXT,
  quality_rating TEXT,
  platform_type TEXT,
  messaging_limit TEXT,
  token_type TEXT DEFAULT 'permanent',
  webhook_verify_token TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp messages table for live chat
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  message_id TEXT,
  from_number TEXT,
  to_number TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  metadata JSONB DEFAULT '{}',
  customer_name TEXT,
  customer_profile_pic TEXT,
  is_bot_response BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create WhatsApp scheduled messages
CREATE TABLE IF NOT EXISTS public.whatsapp_scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  to_number TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  content TEXT NOT NULL,
  template_name TEXT,
  template_params JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp auto-reply rules
CREATE TABLE IF NOT EXISTS public.whatsapp_auto_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  trigger_keywords TEXT[] NOT NULL,
  trigger_type TEXT DEFAULT 'contains' CHECK (trigger_type IN ('contains', 'exact', 'starts_with', 'regex')),
  reply_content TEXT NOT NULL,
  include_products BOOLEAN DEFAULT false,
  product_ids TEXT[],
  include_discount_code TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp analytics
CREATE TABLE IF NOT EXISTS public.whatsapp_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  auto_replies_sent INTEGER DEFAULT 0,
  conversations_started INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(connection_id, date)
);

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo/admin app)
CREATE POLICY "Allow all operations on whatsapp_connections" ON public.whatsapp_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on whatsapp_scheduled_messages" ON public.whatsapp_scheduled_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on whatsapp_auto_replies" ON public.whatsapp_auto_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on whatsapp_analytics" ON public.whatsapp_analytics FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_auto_replies_updated_at
  BEFORE UPDATE ON public.whatsapp_auto_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;