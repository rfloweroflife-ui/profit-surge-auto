
-- Add user_id to bot_teams
ALTER TABLE public.bot_teams ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to bots  
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to bot_activities
ALTER TABLE public.bot_activities ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to bot_commands
ALTER TABLE public.bot_commands ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to team_decisions
ALTER TABLE public.team_decisions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to competitor_analysis
ALTER TABLE public.competitor_analysis ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies and replace with user-scoped ones
DROP POLICY IF EXISTS "Allow all access to bot_teams" ON public.bot_teams;
CREATE POLICY "Users manage own bot_teams" ON public.bot_teams FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow all access to bots" ON public.bots;
CREATE POLICY "Users manage own bots" ON public.bots FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow all access to bot_activities" ON public.bot_activities;
CREATE POLICY "Users manage own bot_activities" ON public.bot_activities FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow all access to bot_commands" ON public.bot_commands;
CREATE POLICY "Users manage own bot_commands" ON public.bot_commands FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow all access to team_decisions" ON public.team_decisions;
CREATE POLICY "Users manage own team_decisions" ON public.team_decisions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow all access to competitor_analysis" ON public.competitor_analysis;
CREATE POLICY "Users manage own competitor_analysis" ON public.competitor_analysis FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Lock down connection tables with user_identifier scoping
DROP POLICY IF EXISTS "Allow all operations on x_connections" ON public.x_connections;
CREATE POLICY "Authenticated access x_connections" ON public.x_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on whatsapp_connections" ON public.whatsapp_connections;
CREATE POLICY "Authenticated access whatsapp_connections" ON public.whatsapp_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all pinterest_connections operations" ON public.pinterest_connections;
CREATE POLICY "Authenticated access pinterest_connections" ON public.pinterest_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all cj_connections operations" ON public.cj_connections;
CREATE POLICY "Authenticated access cj_connections" ON public.cj_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on klaviyo_connections" ON public.klaviyo_connections;
CREATE POLICY "Authenticated access klaviyo_connections" ON public.klaviyo_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);
