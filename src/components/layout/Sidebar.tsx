import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Video, 
  Share2, 
  Brain, 
  Bot, 
  TrendingUp,
  Package,
  Settings,
  Zap,
  Workflow,
  CreditCard,
  Store,
  LogOut,
  LifeBuoy,
  Users
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "War Room", href: "/" },
  { icon: TrendingUp, label: "Sales Tracker", href: "/sales" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Video, label: "Video Ad Studio", href: "/video-studio" },
  { icon: Share2, label: "Social Poster", href: "/social-poster" },
  { icon: Zap, label: "Integrations", href: "/integrations" },
  { icon: Brain, label: "CEO Brain", href: "/ceo-brain" },
  { icon: Bot, label: "Bot Swarm", href: "/bot-swarm" },
  { icon: Workflow, label: "n8n Workflows", href: "/n8n" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
  { icon: Store, label: "Connect Store", href: "/onboarding" },
  { icon: CreditCard, label: "Pricing", href: "/pricing" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Users, label: "Admin CRM", href: "/admin", adminOnly: true },
] as const;

export function Sidebar() {
  const location = useLocation();
  const { profile, subscription, signOut } = useAuth();
  
  const brandName = profile?.brand_name || 'PROFIT REAPER';
  
  const tierLabel = subscription?.tier === 'trial' ? 'Free Trial' : 
    subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Trial';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-cyber">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-cyber text-lg font-bold text-primary text-glow-sm">
              {brandName}
            </h1>
            <p className="text-xs text-muted-foreground">Marketing Command</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border-glow" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User / Subscription Status */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Plan</span>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                {tierLabel}
              </Badge>
            </div>
            {subscription?.status === 'trialing' && subscription.trial_ends_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Ends {new Date(subscription.trial_ends_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
