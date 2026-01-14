import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { 
  Brain, 
  Mic, 
  Send, 
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";

interface HistoryItem {
  type: "user" | "ai";
  text: string;
  timestamp: Date;
  status?: "success" | "error";
}

export default function CEOBrain() {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { data: products } = useProducts(30);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickCommands = [
    "Generate 20 Pins for Mad Hippie Vitamin C Serum and schedule daily",
    "Scale winners 5x and kill underperforming campaigns",
    "Create viral Reels for top 5 products with glass skin hooks",
    "Analyze competitor Glow Recipe and find gaps to exploit",
    "Schedule 50 posts for peak hours 7-9 PM EST",
    "Generate video ad scripts for all serums with before/after hooks"
  ];

  const handleSubmit = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    const userCommand = command;
    setCommand("");
    
    setHistory(prev => [...prev, { 
      type: "user", 
      text: userCommand,
      timestamp: new Date()
    }]);

    try {
      const { data, error } = await supabase.functions.invoke("ceo-brain", {
        body: { 
          command: userCommand,
          products: products?.slice(0, 10).map(p => ({
            id: p.node.id,
            title: p.node.title,
            price: p.node.priceRange.minVariantPrice.amount,
            description: p.node.description?.slice(0, 200)
          }))
        }
      });

      if (error) throw error;

      setHistory(prev => [...prev, { 
        type: "ai", 
        text: data.response,
        timestamp: new Date(),
        status: "success"
      }]);

      toast.success("Command executed", {
        description: "CEO Brain has processed your request"
      });
    } catch (error) {
      console.error("CEO Brain error:", error);
      setHistory(prev => [...prev, { 
        type: "ai", 
        text: `Error processing command. Please try again. ${error instanceof Error ? error.message : ""}`,
        timestamp: new Date(),
        status: "error"
      }]);
      toast.error("Command failed", {
        description: "Check your connection and try again"
      });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const formatResponse = (text: string) => {
    // Try to parse as JSON for structured display
    try {
      const parsed = JSON.parse(text);
      return (
        <div className="space-y-2">
          {parsed.action && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">{parsed.action}</span>
            </div>
          )}
          {parsed.content && Array.isArray(parsed.content) && (
            <div className="space-y-1 pl-4 border-l-2 border-primary/30">
              {parsed.content.slice(0, 5).map((item: string, i: number) => (
                <p key={i} className="text-sm text-muted-foreground">{item}</p>
              ))}
            </div>
          )}
          {parsed.hashtags && (
            <div className="flex flex-wrap gap-1">
              {parsed.hashtags.slice(0, 10).map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          {parsed.schedule && (
            <p className="text-xs text-accent">📅 {parsed.schedule}</p>
          )}
        </div>
      );
    } catch {
      // Return as plain text if not JSON
      return <p className="text-sm whitespace-pre-wrap">{text}</p>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              CEO BRAIN
            </h1>
            <p className="text-muted-foreground mt-1">
              AI command center • Natural language marketing automation • Real-time execution
            </p>
          </div>
          <Badge variant="outline" className="border-accent text-accent animate-pulse">
            <Brain className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Command Center */}
          <Card className="bg-card/50 border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Command Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* History */}
              <div className="min-h-64 max-h-96 overflow-y-auto space-y-3 p-4 rounded-lg bg-secondary/20 border border-border">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-cyber">Enter a command to start</p>
                    <p className="text-sm mt-2">Powered by Lovable AI • Real execution</p>
                    <p className="text-xs mt-1 text-primary">Try: "Generate 20 Pins for Mad Hippie Serum"</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        item.type === "user"
                          ? "bg-primary/10 border border-primary/30 ml-8"
                          : item.status === "error"
                          ? "bg-destructive/10 border border-destructive/30 mr-8"
                          : "bg-secondary/50 border border-border mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === "user" ? (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        ) : (
                          <Badge className={`text-xs ${item.status === "error" ? "bg-destructive" : "bg-accent"}`}>
                            {item.status === "error" ? (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            CEO Brain
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {item.type === "ai" ? formatResponse(item.text) : (
                        <p className="text-sm">{item.text}</p>
                      )}
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border mr-8 animate-pulse">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">CEO Brain is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Enter command... e.g., 'Generate 20 viral Pins for Mad Hippie Serum'"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSubmit()}
                  className="bg-secondary/30 border-border"
                  disabled={isProcessing}
                />
                <Button variant="outline" size="icon" title="Voice input (coming soon)">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || !command.trim()}
                  className="gradient-cyber text-primary-foreground"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickCommands.map((cmd, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => {
                    setCommand(cmd);
                    inputRef.current?.focus();
                  }}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-3 w-3 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">{cmd}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Capabilities */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">Content Generation</h3>
                <p className="text-xs text-muted-foreground">Bulk create Pins, Reels, Videos with AI</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold text-sm">Campaign Optimization</h3>
                <p className="text-xs text-muted-foreground">Scale winners, kill losers automatically</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-neon-blue" />
              <div>
                <h3 className="font-semibold text-sm">Smart Scheduling</h3>
                <p className="text-xs text-muted-foreground">Auto-post at peak times 7-9 PM EST</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
