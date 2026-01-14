import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Crosshair, 
  TrendingUp, 
  Hash,
  Sparkles,
  ExternalLink,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { useCompetitorAnalysis, useAnalyzeCompetitor, CompetitorAnalysis } from "@/hooks/useBotSwarm";
import { toast } from "sonner";

export function CompetitorPanel() {
  const { data: analyses, isLoading } = useCompetitorAnalysis();
  const analyzeCompetitor = useAnalyzeCompetitor();
  const [competitorName, setCompetitorName] = useState("");
  const [platform, setPlatform] = useState<"pinterest" | "instagram">("pinterest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!competitorName.trim()) {
      toast.error("Enter a competitor name");
      return;
    }
    
    try {
      await analyzeCompetitor.mutateAsync({
        competitorName: competitorName.trim(),
        platform,
      });
      toast.success(`Analyzing ${competitorName}...`, {
        description: "Analytics bots deployed to steal their strategy"
      });
      setCompetitorName("");
    } catch (error) {
      toast.error("Analysis failed");
    }
  };

  const copyHooks = (analysis: CompetitorAnalysis) => {
    const text = analysis.hooks.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedId(analysis.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Hooks copied!");
  };

  const competitors = [
    { name: "Glow Recipe", platform: "instagram" as const },
    { name: "The Ordinary", platform: "pinterest" as const },
    { name: "Mad Hippie", platform: "instagram" as const },
    { name: "Drunk Elephant", platform: "pinterest" as const },
    { name: "Tatcha", platform: "instagram" as const },
  ];

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-cyber flex items-center gap-2 text-lg">
          <Crosshair className="h-5 w-5 text-destructive" />
          Competitor Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Analyze */}
        <div className="flex gap-2">
          <Input
            placeholder="Competitor name..."
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
            className="flex-1"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
            className="px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="pinterest">Pinterest</option>
            <option value="instagram">Instagram</option>
          </select>
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeCompetitor.isPending}
            className="gradient-cyber"
          >
            {analyzeCompetitor.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Targets */}
        <div className="flex flex-wrap gap-1">
          {competitors.map((c) => (
            <Badge
              key={c.name}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => {
                setCompetitorName(c.name);
                setPlatform(c.platform);
              }}
            >
              {c.name}
            </Badge>
          ))}
        </div>

        {/* Analyses */}
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading analyses...
              </div>
            ) : analyses?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No competitors analyzed yet</p>
                <p className="text-xs">Add a competitor above to steal their strategy</p>
              </div>
            ) : (
              analyses?.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-3 rounded-lg bg-secondary/20 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{analysis.competitor_name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {analysis.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {analysis.views_count.toLocaleString()} views
                    </div>
                  </div>

                  {/* Stolen Hooks */}
                  {analysis.hooks.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Stolen Hooks
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1"
                          onClick={() => copyHooks(analysis)}
                        >
                          {copiedId === analysis.id ? (
                            <Check className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.hooks.slice(0, 3).map((hook, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            "{hook}"
                          </Badge>
                        ))}
                        {analysis.hooks.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{analysis.hooks.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {analysis.hashtags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      {analysis.hashtags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="text-[10px] text-accent">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <Badge
                      variant={analysis.our_version_created ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {analysis.our_version_created ? "✓ Stolen & Improved" : "Pending steal"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
