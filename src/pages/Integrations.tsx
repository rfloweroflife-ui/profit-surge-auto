import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Instagram, 
  Link2, 
  Check,
  ExternalLink,
  Calendar,
  ImagePlus,
  BarChart3
} from "lucide-react";

// Pinterest icon component
const Pinterest = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.96s-.35-.71-.35-1.78c0-1.66.96-2.9 2.17-2.9 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.02-.28 1.2.6 2.17 1.78 2.17 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.06-4.88-5-4.88-3.4 0-5.4 2.56-5.4 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.37c-.05.22-.18.27-.4.16-1.5-.69-2.43-2.88-2.43-4.64 0-3.77 2.74-7.24 7.91-7.24 4.15 0 7.38 2.96 7.38 6.92 0 4.13-2.6 7.45-6.22 7.45-1.21 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1 0 12 0z"/>
  </svg>
);

export default function Integrations() {
  const integrations = [
    {
      name: "Pinterest",
      icon: Pinterest,
      status: "ready",
      description: "Auto-post Pins, create boards, rich Pins with product data",
      features: ["Auto-post Pins", "Rich Product Pins", "Board Management", "Analytics"],
      color: "text-red-500"
    },
    {
      name: "Instagram",
      icon: Instagram,
      status: "ready",
      description: "Post Reels, Stories, auto-schedule content",
      features: ["Reels Upload", "Story Posts", "Scheduling", "Analytics"],
      color: "text-pink-500"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              SOCIAL HUB
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect Pinterest & Instagram for viral organic marketing
            </p>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {integrations.map((integration) => (
            <Card key={integration.name} className="bg-card/50 border-border hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                      <integration.icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <CardTitle className="font-cyber">{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary">
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {integration.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gradient-cyber text-primary-foreground">
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <ImagePlus className="h-6 w-6 text-primary" />
                <span>Generate Pins</span>
                <span className="text-xs text-muted-foreground">Bulk create product Pins</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Calendar className="h-6 w-6 text-accent" />
                <span>Schedule Posts</span>
                <span className="text-xs text-muted-foreground">Auto-post 7-9 PM EST</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-6 w-6 text-neon-blue" />
                <span>View Analytics</span>
                <span className="text-xs text-muted-foreground">Track engagement</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Captions */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="font-cyber">Sample Viral Captions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "✨ Glass skin in 7 days? This serum is IT. 🧴 #SkincareRoutine #GlowUp #KBeauty #GlassSkin",
                "POV: You finally found the serum that actually works 💫 #CleanBeauty #SkincareEssentials #GlowRecipe",
                "Before vs After: 2 weeks with our Vitamin C Serum 🍊 #SkincareTransformation #NaturalGlow",
                "Your skin deserves this luxury treatment ✨ Shop link in bio #SkincareRoutine #SelfCare",
                "The secret to Korean glass skin? This right here 🇰🇷 #KBeauty #GlassSkin #SkincareAddict"
              ].map((caption, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border text-sm">
                  {caption}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
