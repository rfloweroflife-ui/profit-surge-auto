import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PinterestConnection {
  connected: boolean;
  username?: string;
  expiresAt?: string;
  needsRefresh?: boolean;
  needsSetup?: boolean;
}

interface Board {
  id: string;
  name: string;
  description?: string;
  pin_count?: number;
}

export function usePinterestAuth() {
  const [connection, setConnection] = useState<PinterestConnection>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);

  // Check connection status on mount and when URL changes (for OAuth callback)
  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pinterest-auth", {
        body: { action: "check_status" }
      });

      if (error) {
        console.error("Pinterest status check error:", error);
        setConnection({ connected: false });
        return;
      }

      setConnection(data);
      
      // If connected, fetch boards
      if (data.connected) {
        fetchBoards();
      }
    } catch (err) {
      console.error("Pinterest status error:", err);
      setConnection({ connected: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback from URL
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && window.location.pathname === "/integrations") {
        setIsConnecting(true);
        
        try {
          const { data, error } = await supabase.functions.invoke("pinterest-auth", {
            body: { 
              action: "exchange_code", 
              code,
              redirectUri: `${window.location.origin}/integrations`
            }
          });

          if (error) throw error;

          if (data.success) {
            toast.success("Pinterest Connected!", {
              description: `Connected as @${data.user?.username || "user"}`
            });
            
            // Clean URL
            window.history.replaceState({}, document.title, "/integrations");
            
            // Refresh status
            await checkStatus();
          } else {
            throw new Error(data.error || "Connection failed");
          }
        } catch (err: any) {
          console.error("Pinterest callback error:", err);
          toast.error("Pinterest Connection Failed", {
            description: err.message || "Please try again"
          });
        } finally {
          setIsConnecting(false);
        }
      }
    };

    handleCallback();
    checkStatus();
  }, [checkStatus]);

  // Initiate OAuth flow
  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("pinterest-auth", {
        body: { 
          action: "get_auth_url",
          redirectUri: `${window.location.origin}/integrations`
        }
      });

      if (error) throw error;

      if (data.needsSetup) {
        toast.error("Pinterest API Setup Required", {
          description: "Add PINTEREST_APP_ID and PINTEREST_APP_SECRET to your secrets"
        });
        setIsConnecting(false);
        return;
      }

      if (data.authUrl) {
        // Store state for verification
        sessionStorage.setItem("pinterest_oauth_state", data.state);
        
        // Redirect to Pinterest OAuth
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      console.error("Pinterest connect error:", err);
      toast.error("Failed to start Pinterest OAuth", {
        description: err.message || "Please try again"
      });
      setIsConnecting(false);
    }
  }, []);

  // Fetch boards
  const fetchBoards = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pinterest-post", {
        body: { action: "get_boards" }
      });

      if (error) throw error;

      if (data.boards) {
        setBoards(data.boards);
      }
    } catch (err) {
      console.error("Fetch boards error:", err);
    }
  }, []);

  // Create a new board
  const createBoard = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("pinterest-post", {
        body: { action: "create_board", boardName: name }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Board Created!", {
          description: `Created "${name}" board on Pinterest`
        });
        await fetchBoards();
        return data.board;
      }
    } catch (err: any) {
      toast.error("Failed to create board", {
        description: err.message
      });
      return null;
    }
  }, [fetchBoards]);

  // Post pins
  const postPins = useCallback(async (pins: {
    title: string;
    description: string;
    link?: string;
    imageUrl: string;
    boardId?: string;
    productId?: string;
  }[]) => {
    if (!connection.connected) {
      toast.error("Pinterest not connected", {
        description: "Please connect your Pinterest account first"
      });
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke("pinterest-post", {
        body: { action: "create_pins", pins }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Posted ${data.posted} Pin(s)!`, {
          description: data.failed > 0 ? `${data.failed} failed` : "All pins posted successfully"
        });
      } else if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      toast.error("Failed to post pins", {
        description: err.message
      });
      return null;
    }
  }, [connection.connected]);

  return {
    connection,
    isLoading,
    isConnecting,
    boards,
    connect,
    fetchBoards,
    createBoard,
    postPins,
    refresh: checkStatus
  };
}
