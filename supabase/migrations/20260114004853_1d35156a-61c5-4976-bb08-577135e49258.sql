-- Create bots table to store individual bot states
CREATE TABLE public.bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ceo', 'content', 'analytics', 'optimizer', 'closer')),
  team_id UUID,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'analyzing', 'optimizing', 'posting')),
  current_task TEXT,
  efficiency_score NUMERIC DEFAULT 100,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot teams table
CREATE TABLE public.bot_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  assigned_product TEXT,
  assigned_platform TEXT CHECK (assigned_platform IN ('pinterest', 'instagram', 'both')),
  strategy TEXT,
  performance_score NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'standby' CHECK (status IN ('standby', 'active', 'optimizing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot activities table for real-time logging
CREATE TABLE public.bot_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.bot_teams(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('analyze', 'create', 'post', 'optimize', 'steal', 'decision')),
  target TEXT,
  result TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitor analysis table
CREATE TABLE public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('pinterest', 'instagram', 'tiktok')),
  content_url TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'image', 'reel', 'pin')),
  engagement_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  hooks TEXT[],
  hashtags TEXT[],
  analyzed_by UUID REFERENCES public.bots(id),
  stolen_elements JSONB DEFAULT '{}',
  our_version_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team decisions table for collaborative decision making
CREATE TABLE public.team_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.bot_teams(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('scale', 'pause', 'modify', 'steal', 'create', 'target')),
  decision TEXT NOT NULL,
  reasoning TEXT,
  votes JSONB DEFAULT '{}',
  consensus_reached BOOLEAN DEFAULT false,
  executed BOOLEAN DEFAULT false,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot commands table for command history
CREATE TABLE public.bot_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('global', 'team', 'individual')),
  target_ids UUID[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  result JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key for team_id in bots table
ALTER TABLE public.bots ADD CONSTRAINT fk_bots_team FOREIGN KEY (team_id) REFERENCES public.bot_teams(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (app-only access, no auth required for this admin tool)
CREATE POLICY "Allow all access to bots" ON public.bots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bot_teams" ON public.bot_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bot_activities" ON public.bot_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to competitor_analysis" ON public.competitor_analysis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to team_decisions" ON public.team_decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bot_commands" ON public.bot_commands FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_commands;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bot_teams_updated_at BEFORE UPDATE ON public.bot_teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();