-- Create Klaviyo connections table
CREATE TABLE public.klaviyo_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL DEFAULT 'default',
    api_key TEXT NOT NULL,
    private_key TEXT,
    public_key TEXT,
    account_id TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    template_id TEXT,
    campaign_type TEXT DEFAULT 'regular',
    status TEXT DEFAULT 'draft',
    list_id TEXT,
    segment_id TEXT,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipients_count INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email flows table for automation
CREATE TABLE public.email_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_conditions JSONB,
    flow_steps JSONB,
    is_active BOOLEAN DEFAULT false,
    total_triggered INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    subject TEXT,
    html_content TEXT,
    json_content JSONB,
    preview_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email subscribers table
CREATE TABLE public.email_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    source TEXT,
    tags TEXT[],
    custom_properties JSONB,
    is_subscribed BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.klaviyo_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this app)
CREATE POLICY "Allow all operations on klaviyo_connections" ON public.klaviyo_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on email_campaigns" ON public.email_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on email_flows" ON public.email_flows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on email_templates" ON public.email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on email_subscribers" ON public.email_subscribers FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_klaviyo_connections_updated_at BEFORE UPDATE ON public.klaviyo_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_flows_updated_at BEFORE UPDATE ON public.email_flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON public.email_subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();