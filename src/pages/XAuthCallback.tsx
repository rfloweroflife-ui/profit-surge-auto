import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function XAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to X (Twitter)...");

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Authorization failed: ${error}`);
        toast.error("X Connection Failed", { description: error });
        setTimeout(() => navigate("/social-poster"), 3000);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received");
        toast.error("X Connection Failed", { description: "No authorization code" });
        setTimeout(() => navigate("/social-poster"), 3000);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke("x-auth", {
          body: { 
            action: "exchange_code", 
            code,
            redirectUri: `${window.location.origin}/auth/x/callback`
          }
        });

        if (invokeError) throw invokeError;

        if (data.success) {
          setStatus("success");
          setMessage(`Connected as @${data.user?.username || "user"}`);
          toast.success("X (Twitter) Connected!", {
            description: `Connected as @${data.user?.username || "user"}`
          });
          setTimeout(() => navigate("/social-poster"), 2000);
        } else {
          throw new Error(data.error || "Connection failed");
        }
      } catch (err: any) {
        console.error("X callback error:", err);
        setStatus("error");
        setMessage(err.message || "Failed to connect");
        toast.error("X Connection Failed", { description: err.message });
        setTimeout(() => navigate("/social-poster"), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          )}
          {status === "error" && (
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold">
          {status === "loading" && "Connecting to X..."}
          {status === "success" && "Connected!"}
          {status === "error" && "Connection Failed"}
        </h1>
        
        <p className="text-muted-foreground">{message}</p>
        
        {status !== "loading" && (
          <p className="text-sm text-muted-foreground">
            Redirecting you back...
          </p>
        )}
      </div>
    </div>
  );
}
