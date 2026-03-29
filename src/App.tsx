import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import { useCartSync } from "./hooks/useCartSync";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:handle" element={<ProductDetail />} />
        <Route path="/video-studio" element={<VideoStudio />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/ceo-brain" element={<CEOBrain />} />
        <Route path="/bot-swarm" element={<BotSwarm />} />
        <Route path="/sales" element={<SalesTracker />} />
        <Route path="/social-poster" element={<SocialPoster />} />
        <Route path="/x-hub" element={<XProfitHubPage />} />
        <Route path="/auth/x/callback" element={<XAuthCallback />} />
        <Route path="/n8n" element={<N8nWorkflows />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/video-studio" element={<VideoStudio />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/ceo-brain" element={<CEOBrain />} />
          <Route path="/bot-swarm" element={<BotSwarm />} />
          <Route path="/sales" element={<SalesTracker />} />
          <Route path="/social-poster" element={<SocialPoster />} />
          <Route path="/x-hub" element={<XProfitHubPage />} />
          <Route path="/auth/x/callback" element={<XAuthCallback />} />
          <Route path="/n8n" element={<N8nWorkflows />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
