-- Create table for storing Pinterest OAuth tokens
CREATE TABLE IF NOT EXISTS public.pinterest_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL DEFAULT 'default',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'bearer',
  expires_at TIMESTAMPTZ,
  pinterest_user_id TEXT,
  pinterest_username TEXT,
  scopes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_identifier)
);

-- Enable RLS
ALTER TABLE public.pinterest_connections ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (since no auth required in this app)
CREATE POLICY "Allow all pinterest_connections operations" 
  ON public.pinterest_connections 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create table for tracking posted pins
CREATE TABLE IF NOT EXISTS public.pinterest_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id TEXT,
  board_id TEXT,
  product_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_url TEXT,
  hashtags TEXT[],
  status TEXT DEFAULT 'pending',
  posted_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pinterest_pins ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all pinterest_pins operations" 
  ON public.pinterest_pins 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at on pinterest_connections
CREATE OR REPLACE TRIGGER update_pinterest_connections_updated_at
  BEFORE UPDATE ON public.pinterest_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();