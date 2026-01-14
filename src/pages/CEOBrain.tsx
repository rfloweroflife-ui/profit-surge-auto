import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Brain, 
  Mic, 
  Send, 
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function CEOBrain() {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Array<{ type: string; text: string }>>([]);

  const quickCommands = [
    "Generate 20 Pins for Mad Hippie Serum",
    "Scale winners 5x",
    "Create viral Reels for top 5 products",
    "Analyze competitor Glow Recipe",
    "Schedule posts for peak hours",
    "Generate video ads for all serums"
  ];

  const handleSubmit = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    setHistory(prev => [...prev, { type: "user", text: command }]);
    
    // Simulate AI processing - will connect to Lovable AI
    setTimeout(() => {
      setHistory(prev => [...prev, { 
        type: "ai", 
        text: `Processing command: "${command}". This will be powered by the CEO Brain AI. Ready to execute marketing automation.`
      }]);
      setIsProcessing(false);
      setCommand("");
      toast.success("Command received", {
        description: "CEO Brain is processing your request"
      });
    }, 1500);
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
              AI command center • Natural language marketing automation
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
                    <p>Enter a command to start</p>
                    <p className="text-sm">Try: "Generate 20 Pins for Mad Hippie Serum"</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        item.type === "user"
                          ? "bg-primary/10 border border-primary/30 ml-8"
                          : "bg-secondary/50 border border-border mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === "user" ? (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        ) : (
                          <Badge className="text-xs bg-accent">CEO Brain</Badge>
                        )}
                      </div>
                      <p className="text-sm">{item.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command... e.g., 'Generate 20 Pins for Mad Hippie Serum'"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="bg-secondary/30 border-border"
                />
                <Button variant="outline" size="icon">
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
                  onClick={() => setCommand(cmd)}
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
                <p className="text-xs text-muted-foreground">Bulk create Pins, Reels, Videos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold text-sm">Campaign Optimization</h3>
                <p className="text-xs text-muted-foreground">Scale winners, kill losers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-neon-blue" />
              <div>
                <h3 className="font-semibold text-sm">Smart Scheduling</h3>
                <p className="text-xs text-muted-foreground">Auto-post at peak times</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
