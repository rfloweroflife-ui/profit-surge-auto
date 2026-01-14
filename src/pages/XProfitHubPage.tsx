import { Layout } from "@/components/layout/Layout";
import { XProfitHub } from "@/components/x/XProfitHub";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";

export default function XProfitHubPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm flex items-center gap-3">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X PROFIT HUB
            </h1>
            <p className="text-muted-foreground mt-1">
              Viral tweet generator • Auto-posting • Analytics • Engagement tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected to Bot Swarm
            </Badge>
          </div>
        </div>

        {/* X Profit Hub Component */}
        <XProfitHub />
      </div>
    </Layout>
  );
}
