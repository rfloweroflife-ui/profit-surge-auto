-- Create X (Twitter) connections table
CREATE TABLE public.x_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL DEFAULT 'default',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  x_user_id TEXT,
  x_username TEXT,
  x_name TEXT,
  x_profile_image TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  tweet_count INTEGER DEFAULT 0,
  scopes TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create X tweets table for tracking posted content
CREATE TABLE public.x_tweets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.x_connections(id) ON DELETE CASCADE,
  tweet_id TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  product_id TEXT,
  thread_id UUID,
  is_thread_parent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  quotes INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create X analytics table
CREATE TABLE public.x_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.x_connections(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tweets_posted INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_retweets INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.x_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for x_connections (allow all for now since no auth)
CREATE POLICY "Allow all operations on x_connections" ON public.x_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on x_tweets" ON public.x_tweets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on x_analytics" ON public.x_analytics FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_x_connections_updated_at
  BEFORE UPDATE ON public.x_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for X tweets
ALTER PUBLICATION supabase_realtime ADD TABLE public.x_tweets;