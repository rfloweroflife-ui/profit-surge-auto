import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useXAuth } from "@/hooks/useXAuth";
import { toast } from "sonner";
import {
  Send,
  Calendar,
  BarChart3,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Heart,
  Repeat2,
  MessageCircle,
  Eye,
  Trash2,
  Link2,
  ExternalLink
} from "lucide-react";

// X icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export function XDashboard() {
  const {
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
    generateTweets,
    deleteScheduledTweet
  } = useXAuth();

  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<{ text: string; hashtags: string[] }[]>([]);
  const [productName, setProductName] = useState("Mad Hippie Vitamin C Serum");
  const [scheduleDate, setScheduleDate] = useState("");

  const handlePostTweet = async () => {
    if (!tweetText.trim()) {
      toast.error("Please enter tweet text");
      return;
    }

    setIsPosting(true);
    try {
      await postTweet(tweetText);
      setTweetText("");
    } finally {
      setIsPosting(false);
    }
  };

  const handleScheduleTweet = async () => {
    if (!tweetText.trim() || !scheduleDate) {
      toast.error("Please enter tweet text and schedule date");
      return;
    }

    setIsPosting(true);
    try {
      await scheduleTweet(tweetText, scheduleDate);
      setTweetText("");
      setScheduleDate("");
    } finally {
      setIsPosting(false);
    }
  };

  const handleGenerateTweets = async () => {
    setIsGenerating(true);
    try {
      const tweets = await generateTweets(productName, undefined, 5, "viral");
      setGeneratedTweets(tweets);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTweet = (text: string) => {
    setTweetText(text);
    toast.success("Tweet loaded into composer!");
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!connection.connected) {
    return (
      <Card className="bg-gradient-to-br from-card to-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XIcon className="h-6 w-6" />
            Connect X (Twitter)
          </CardTitle>
          <CardDescription>
            Connect your X account to auto-post tweets, schedule content, and track analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connection.needsSetup ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                X API credentials not configured. Add <code className="bg-black/30 px-1 rounded">X_CLIENT_ID</code> and{" "}
                <code className="bg-black/30 px-1 rounded">X_CLIENT_SECRET</code> to your secrets.
              </p>
            </div>
          ) : (
            <Button 
              onClick={connect}
              disabled={isConnecting}
              className="w-full bg-black hover:bg-slate-800 text-white"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XIcon className="h-4 w-4 mr-2" />
              )}
              Connect X Account
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-gradient-to-br from-card to-slate-900/50 border-green-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connection.profileImage && (
                <img 
                  src={connection.profileImage} 
                  alt={connection.name} 
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <CardTitle className="flex items-center gap-2">
                  <XIcon className="h-5 w-5" />
                  @{connection.username}
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </CardTitle>
                <CardDescription>{connection.name}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{connection.followers?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{connection.following?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{connection.tweets?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Tweets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>Compose Tweet</CardTitle>
              <CardDescription>Write and post or schedule your tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What's happening?"
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={280}
                />
                <div className="flex justify-between text-sm">
                  <span className={tweetText.length > 260 ? "text-yellow-400" : "text-muted-foreground"}>
                    {tweetText.length}/280 characters
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handlePostTweet}
                  disabled={isPosting || !tweetText.trim()}
                  className="flex-1"
                >
                  {isPosting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleScheduleTweet}
                  disabled={isPosting || !tweetText.trim() || !scheduleDate}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Generate Tab */}
        <TabsContent value="generate">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Tweet Generator
              </CardTitle>
              <CardDescription>Generate viral tweets for your products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Product name..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGenerateTweets}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate 5 Tweets
                </Button>
              </div>

              {generatedTweets.length > 0 && (
                <div className="space-y-3">
                  {generatedTweets.map((tweet, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <p className="text-sm mb-3">{tweet.text}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {tweet.hashtags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleUseTweet(tweet.text)}
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Tweets
              </CardTitle>
              <CardDescription>
                {scheduledTweets.length} tweets in queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledTweets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No scheduled tweets yet</p>
                  <p className="text-sm">Schedule tweets from the Compose tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledTweets.map((tweet) => (
                    <div 
                      key={tweet.id}
                      className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm mb-2">{tweet.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(tweet.scheduled_at).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteScheduledTweet(tweet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tweet Analytics
              </CardTitle>
              <CardDescription>Performance metrics for your tweets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold">{analytics?.impressions?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Heart className="h-5 w-5 mx-auto mb-2 text-red-400" />
                  <p className="text-2xl font-bold">{analytics?.likes?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Repeat2 className="h-5 w-5 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold">{analytics?.retweets?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Retweets</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <MessageCircle className="h-5 w-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold">{analytics?.replies?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Replies</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Send className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{analytics?.tweetsPosted || 0}</p>
                  <p className="text-xs text-muted-foreground">Tweets Posted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sample Tweets Preview */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sample Viral Tweets for Mad Hippie Serum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "POV: You found the $28 serum that outperforms $200 alternatives 💫 Glass skin is loading... #GlassSkin #VitaminCSerum #SkincareRoutine",
              "The girlies at the dermatologist HATE this $28 serum (it works too well) ✨ #MadHippie #CleanBeauty #SkincareTok",
              "My 30-day glow up journey using ONE product 🫶 Before/after in comments #GlowUp #VitaminC #BeautyTips",
              "Clean beauty dupe alert 🚨 This $28 serum > $180 brands #BeautyDupe #Skincare #AffordableBeauty",
              "Why is no one talking about this serum?? My texture is GONE in 2 weeks ✨ #SkincareRoutine #ClearSkin"
            ].map((tweet, index) => (
              <div 
                key={index}
                className="p-3 bg-black/30 rounded-lg border border-slate-700/50 flex items-center justify-between"
              >
                <p className="text-sm flex-1">{tweet}</p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleUseTweet(tweet)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}