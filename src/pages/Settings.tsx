import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Store, 
  Bell, 
  Palette,
  Shield,
  Database,
  ExternalLink,
  Check
} from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
            SETTINGS
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your Profit Reaper command center
          </p>
        </div>

        {/* Store Connection */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Shopify Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">lovable-project-i664s.myshopify.com</p>
                  <p className="text-sm text-muted-foreground">Production store connected</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-sync interval</p>
                <p className="text-sm text-muted-foreground">Sync products every 15 minutes</p>
              </div>
              <Badge variant="outline">15 min</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New order alerts</p>
                <p className="text-sm text-muted-foreground">Get notified on new sales</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low inventory alerts</p>
                <p className="text-sm text-muted-foreground">Alert when stock is low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campaign performance</p>
                <p className="text-sm text-muted-foreground">Daily performance summaries</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Integrations Status */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Shopify Storefront API", status: "active" },
                { name: "Lovable Cloud", status: "active" },
                { name: "Lovable AI (CEO Brain)", status: "active" },
                { name: "Pinterest API", status: "ready" },
                { name: "Instagram API", status: "ready" },
                { name: "D-ID Video API", status: "ready" },
                { name: "ElevenLabs Voice API", status: "ready" },
              ].map((integration) => (
                <div 
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <span className="text-sm">{integration.name}</span>
                  <Badge 
                    variant={integration.status === "active" ? "default" : "secondary"}
                    className={integration.status === "active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
