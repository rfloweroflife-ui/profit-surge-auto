import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  Send, 
  Loader2,
  Zap,
  Play,
  Eye,
  PenTool,
  TrendingUp,
  Target
} from "lucide-react";
import { useSendCommand } from "@/hooks/useBotSwarm";
import { toast } from "sonner";

interface CommandCenterProps {
  onCommandExecuted?: () => void;
}

export function CommandCenter({ onCommandExecuted }: CommandCenterProps) {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const sendCommand = useSendCommand();

  const quickCommands = [
    { label: "Deploy All", icon: Play, command: "Deploy all 200 bots now" },
    { label: "Analyze Competitors", icon: Eye, command: "Analyze all competitors and steal winning strategies" },
    { label: "Generate Content", icon: PenTool, command: "Generate 50 viral pins for top products" },
    { label: "Scale Winners", icon: TrendingUp, command: "Scale winning campaigns 5x and kill losers" },
    { label: "Post Viral Content", icon: Target, command: "Post top 10 content pieces to Pinterest and Instagram" },
  ];

  const handleSend = async () => {
    if (!command.trim()) return;

    try {
      const result = await sendCommand.mutateAsync({
        command: command.trim(),
        commandType: "global",
      });
      
      setResponse(result.aiResponse || result.message);
      toast.success("Command executed!", {
        description: result.actions?.join(", ") || "Bots responding"
      });
      setCommand("");
      onCommandExecuted?.();
    } catch (error) {
      toast.error("Command failed");
    }
  };

  const executeQuickCommand = async (cmd: string) => {
    setCommand(cmd);
    try {
      const result = await sendCommand.mutateAsync({
        command: cmd,
        commandType: "global",
      });
      setResponse(result.aiResponse || result.message);
      toast.success("Command executed!");
      onCommandExecuted?.();
    } catch (error) {
      toast.error("Command failed");
    }
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-cyber flex items-center gap-2 text-lg">
          <Terminal className="h-5 w-5 text-primary" />
          Bot Command Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((qc) => (
            <Badge
              key={qc.label}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all py-1.5 px-3"
              onClick={() => executeQuickCommand(qc.command)}
            >
              <qc.icon className="h-3 w-3 mr-1" />
              {qc.label}
            </Badge>
          ))}
        </div>

        {/* Command Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter command... (e.g., 'Generate 20 pins for Mad Hippie Serum')"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 font-mono text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={sendCommand.isPending || !command.trim()}
            className="gradient-cyber"
          >
            {sendCommand.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Response</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {response}
            </p>
          </div>
        )}

        {/* Command Examples */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Example commands:</p>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            <li>"Analyze Glow Recipe's top pins and steal their hooks"</li>
            <li>"Generate 50 reels for all serums with glow-up hooks"</li>
            <li>"Deploy content team to Pinterest at 7 PM EST"</li>
            <li>"Scale winning vitamin C serum campaign 10x"</li>
            <li>"Kill all campaigns with less than 1% engagement"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
