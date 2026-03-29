import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { setStoreConfig, clearStoreConfig } from "@/lib/shopify";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import VideoStudio from "./pages/VideoStudio";
import Integrations from "./pages/Integrations";
import CEOBrain from "./pages/CEOBrain";
import BotSwarm from "./pages/BotSwarm";
import SalesTracker from "./pages/SalesTracker";
import SocialPoster from "./pages/SocialPoster";
import Settings from "./pages/Settings";
import XProfitHubPage from "./pages/XProfitHubPage";
import XAuthCallback from "./pages/XAuthCallback";
import N8nWorkflows from "./pages/N8nWorkflows";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import Support from "./pages/Support";
import AdminCRM from "./pages/AdminCRM";
import NotFound from "./pages/NotFound";
import { useCartSync } from "./hooks/useCartSync";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isSubscribed, subscription, isAdmin } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  // Admins always have full access; others must have active subscription
  if (!isAdmin && subscription && !isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }
  return <>{children}</>;
}

function AuthOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function StoreConfigLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      clearStoreConfig();
      return;
    }
    // Load user's store connection
    supabase
      .from('store_connections')
      .select('store_domain, storefront_token')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        if (data) {
          setStoreConfig(data.store_domain, data.storefront_token);
        } else {
          clearStoreConfig();
        }
      });
  }, [user]);

  return <>{children}</>;
}

function AppContent() {
  useCartSync();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <StoreConfigLoader>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/product/:handle" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/video-studio" element={<ProtectedRoute><VideoStudio /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/ceo-brain" element={<ProtectedRoute><CEOBrain /></ProtectedRoute>} />
        <Route path="/bot-swarm" element={<ProtectedRoute><BotSwarm /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><SalesTracker /></ProtectedRoute>} />
        <Route path="/social-poster" element={<ProtectedRoute><SocialPoster /></ProtectedRoute>} />
        <Route path="/x-hub" element={<ProtectedRoute><XProfitHubPage /></ProtectedRoute>} />
        <Route path="/auth/x/callback" element={<XAuthCallback />} />
        <Route path="/n8n" element={<ProtectedRoute><N8nWorkflows /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminCRM /></ProtectedRoute>} />
        <Route path="/pricing" element={<AuthOnlyRoute><Pricing /></AuthOnlyRoute>} />
        <Route path="/onboarding" element={<AuthOnlyRoute><Onboarding /></AuthOnlyRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </StoreConfigLoader>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
