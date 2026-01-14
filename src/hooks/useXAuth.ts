import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface XConnection {
  connected: boolean;
  username?: string;
  name?: string;
  profileImage?: string;
  followers?: number;
  following?: number;
  tweets?: number;
  expiresAt?: string;
  needsRefresh?: boolean;
  needsSetup?: boolean;
}

interface GeneratedTweet {
  text: string;
  hashtags: string[];
}

interface ScheduledTweet {
  id: string;
  content: string;
  scheduled_at: string;
  status: string;
  hashtags?: string[];
  product_id?: string;
}

interface XAnalytics {
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  tweetsPosted: number;
}

export function useXAuth() {
  const [connection, setConnection] = useState<XConnection>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([]);
  const [analytics, setAnalytics] = useState<XAnalytics | null>(null);

  // Check connection status
  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("x-auth", {
        body: { action: "check_status" }
      });

      if (error) {
        console.error("X status check error:", error);
        setConnection({ connected: false });
        return;
      }

      setConnection(data);
      
      if (data.connected) {
        fetchScheduledTweets();
        fetchAnalytics();
      }
    } catch (err) {
      console.error("X status error:", err);
      setConnection({ connected: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && (window.location.pathname === "/integrations" || window.location.pathname === "/social-poster")) {
        setIsConnecting(true);
        
        try {
          const { data, error } = await supabase.functions.invoke("x-auth", {
            body: { 
              action: "exchange_code", 
              code,
              redirectUri: `${window.location.origin}${window.location.pathname}`
            }
          });

          if (error) throw error;

          if (data.success) {
            toast.success("X (Twitter) Connected!", {
              description: `Connected as @${data.user?.username || "user"}`
            });
            
            window.history.replaceState({}, document.title, window.location.pathname);
            await checkStatus();
          } else {
            throw new Error(data.error || "Connection failed");
          }
        } catch (err: any) {
          console.error("X callback error:", err);
          toast.error("X Connection Failed", {
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
      const { data, error } = await supabase.functions.invoke("x-auth", {
        body: { 
          action: "get_auth_url",
          redirectUri: `${window.location.origin}${window.location.pathname}`
        }
      });

      if (error) throw error;

      if (data.needsSetup) {
        toast.error("X API Setup Required", {
          description: "Add X_CLIENT_ID and X_CLIENT_SECRET to your secrets"
        });
        setIsConnecting(false);
        return;
      }

      if (data.authUrl) {
        sessionStorage.setItem("x_oauth_state", data.state);
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      console.error("X connect error:", err);
      toast.error("Failed to start X OAuth", {
        description: err.message || "Please try again"
      });
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("x-auth", {
        body: { action: "disconnect" }
      });

      if (error) throw error;

      setConnection({ connected: false });
      toast.success("X account disconnected");
    } catch (err: any) {
      toast.error("Failed to disconnect", { description: err.message });
    }
  }, []);

  // Post a tweet
  const postTweet = useCallback(async (text: string, mediaIds?: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "post_tweet", text, mediaIds }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Tweet Posted! 🐦", {
          description: "Your tweet is now live on X"
        });
        return data.tweet;
      }
    } catch (err: any) {
      toast.error("Failed to post tweet", { description: err.message });
      return null;
    }
  }, []);

  // Post a thread
  const postThread = useCallback(async (tweets: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "post_thread", tweets }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Thread Posted! 🧵`, {
          description: `${data.postedCount}/${data.totalCount} tweets in thread`
        });
        return data.thread;
      }
    } catch (err: any) {
      toast.error("Failed to post thread", { description: err.message });
      return null;
    }
  }, []);

  // Schedule a tweet
  const scheduleTweet = useCallback(async (text: string, scheduledAt: string, hashtags?: string[], productId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "schedule_tweet", text, scheduledAt, hashtags, productId }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Tweet Scheduled! ⏰", {
          description: `Will be posted at ${new Date(scheduledAt).toLocaleString()}`
        });
        await fetchScheduledTweets();
        return data.scheduled;
      }
    } catch (err: any) {
      toast.error("Failed to schedule tweet", { description: err.message });
      return null;
    }
  }, []);

  // Fetch scheduled tweets
  const fetchScheduledTweets = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "get_scheduled" }
      });

      if (error) throw error;

      if (data.success) {
        setScheduledTweets(data.scheduled || []);
      }
    } catch (err) {
      console.error("Fetch scheduled error:", err);
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (days = 7) => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "get_analytics", days }
      });

      if (error) throw error;

      if (data.success) {
        setAnalytics(data.summary);
      }
    } catch (err) {
      console.error("Fetch analytics error:", err);
    }
  }, []);

  // Generate tweets with AI
  const generateTweets = useCallback(async (
    productName: string, 
    productDescription?: string, 
    count = 5, 
    style = "viral"
  ): Promise<GeneratedTweet[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "generate_tweets", productName, productDescription, count, style }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Generated ${data.tweets.length} tweets!`);
        return data.tweets;
      }
      return [];
    } catch (err: any) {
      toast.error("Failed to generate tweets", { description: err.message });
      return [];
    }
  }, []);

  // Delete scheduled tweet
  const deleteScheduledTweet = useCallback(async (tweetId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("x-post", {
        body: { action: "delete_scheduled", tweetId }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Scheduled tweet deleted");
        await fetchScheduledTweets();
      }
    } catch (err: any) {
      toast.error("Failed to delete", { description: err.message });
    }
  }, [fetchScheduledTweets]);

  return {
    connection,
    isLoading,
    isConnecting,
    scheduledTweets,
    analytics,
    connect,
    disconnect,
    postTweet,
    postThread,
    scheduleTweet,
    fetchScheduledTweets,
    fetchAnalytics,
    generateTweets,
    deleteScheduledTweet,
    refresh: checkStatus
  };
}