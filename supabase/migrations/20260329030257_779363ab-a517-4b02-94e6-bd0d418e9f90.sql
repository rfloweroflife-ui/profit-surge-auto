
-- Auto-assign admin role to the owner's email on signup
CREATE OR REPLACE FUNCTION public.handle_owner_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'ryanauralift@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    -- Give owner unlimited subscription
    UPDATE public.subscriptions 
    SET tier = 'agency', status = 'active', bot_limit = 10000, 
        current_period_end = now() + interval '100 years'
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_owner_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_owner_admin_role();
