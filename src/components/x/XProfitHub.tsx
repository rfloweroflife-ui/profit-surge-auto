import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Bot,
  Hash,
  Megaphone,
  Play,
  Pause,
  RefreshCw,
  Crown,
  Flame,
  LineChart,
  Activity,
  MousePointer
} from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface TweetPreview {
  id: string;
  text: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'posted';
  scheduledAt?: string;
  engagement?: {
    impressions: number;
    likes: number;
    retweets: number;
    replies: number;
  };
}

export function XProfitHub() {
  const {
    connection,
    isLoading,
    isConnecting,
    scheduledTweets,
    analytics,
    connect,
    disconnect,
    postTweet,
    scheduleTweet,
    generateTweets,
    deleteScheduledTweet,
    fetchAnalytics,
    refresh
  } = useXAuth();

  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkPosting, setIsBulkPosting] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<{ text: string; hashtags: string[] }[]>([]);
  const [productName, setProductName] = useState("Mad Hippie Vitamin C Serum");
  const [scheduleDate, setScheduleDate] = useState("");
  const [tweetCount, setTweetCount] = useState(5);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [engagementScore, setEngagementScore] = useState(0);
  const [revenueTracker, setRevenueTracker] = useState(0);
  const [activeBots, setActiveBots] = useState(40);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([
    "GlassSkin", "VitaminCSerum", "SkincareRoutine", "GlowUp", "CleanBeauty",
    "KBeauty", "AntiAging", "ViralSkincare", "BeautyTips", "SkincareTok",
    "MadHippieDupe", "GlowRecipeVibes", "AffordableBeauty", "ClearSkin",
    "SkincareAddict", "BeautyHacks", "NaturalBeauty", "OrganicSkincare",
    "VeganBeauty", "CrueltyFree"
  ]);

  // Simulated real-time analytics updates
  useEffect(() => {
    if (connection.connected) {
      const interval = setInterval(() => {
        fetchAnalytics(7);
      }, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [connection.connected, fetchAnalytics]);

  const handlePostTweet = async () => {
    if (!tweetText.trim()) {
      toast.error("Please enter tweet text");
      return;
    }

    setIsPosting(true);
    try {
      await postTweet(tweetText);
      setTweetText("");
      toast.success("Tweet posted successfully! 🚀");
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
      const tweets = await generateTweets(productName, undefined, tweetCount, "viral");
      setGeneratedTweets(tweets);
      toast.success(`Generated ${tweets.length} viral tweets! 🔥`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkPost = async () => {
    if (generatedTweets.length === 0) {
      toast.error("Generate tweets first!");
      return;
    }

    setIsBulkPosting(true);
    let successCount = 0;

    for (let i = 0; i < Math.min(5, generatedTweets.length); i++) {
      try {
        // Schedule with 1 hour intervals for optimal engagement
        const scheduleTime = new Date();
        scheduleTime.setHours(scheduleTime.getHours() + i + 1);
        scheduleTime.setMinutes(0);
        
        await scheduleTweet(
          generatedTweets[i].text,
          scheduleTime.toISOString(),
          generatedTweets[i].hashtags
        );
        successCount++;
      } catch (err) {
        console.error("Failed to schedule tweet:", err);
      }
    }

    setIsBulkPosting(false);
    toast.success(`Scheduled ${successCount} tweets for auto-posting! 🎯`);
  };

  const handleAutoPostNow = async () => {
    if (generatedTweets.length === 0) {
      toast.error("Generate tweets first!");
      return;
    }

    setIsBulkPosting(true);
    try {
      // Post the first generated tweet immediately
      await postTweet(generatedTweets[0].text);
      toast.success("Tweet auto-posted to X! 🚀");
      
      // Remove the posted tweet from the list
      setGeneratedTweets(prev => prev.slice(1));
    } finally {
      setIsBulkPosting(false);
    }
  };

  const handleUseTweet = (text: string) => {
    setTweetText(text);
    toast.success("Tweet loaded into composer!");
  };

  const handleAddHashtags = (hashtags: string[]) => {
    const hashtagText = hashtags.map(h => `#${h}`).join(" ");
    setTweetText(prev => `${prev}\n\n${hashtagText}`.slice(0, 280));
    toast.success("Hashtags added!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <XIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground font-cyber">INITIALIZING X PROFIT HUB...</p>
        </div>
      </div>
    );
  }

  if (!connection.connected) {
    return (
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/30 overflow-hidden relative">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 font-cyber text-2xl">
            <div className="p-3 rounded-xl bg-black border border-primary/50 box-glow">
              <XIcon className="h-8 w-8 text-foreground" />
            </div>
            X PROFIT HUB
          </CardTitle>
          <CardDescription className="text-lg">
            Connect your X account to unleash viral marketing automation
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          {connection.needsSetup ? (
            <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <Zap className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-1">API Credentials Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Add <code className="bg-black/50 px-2 py-0.5 rounded text-primary">X_CLIENT_ID</code> and{" "}
                    <code className="bg-black/50 px-2 py-0.5 rounded text-primary">X_CLIENT_SECRET</code> to your secrets vault.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Auto-Posting</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-sm font-medium">AI Tweets</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-neon-blue" />
                  <p className="text-sm font-medium">Analytics</p>
                </div>
              </div>
              
              <Button 
                onClick={connect}
                disabled={isConnecting}
                className="w-full h-14 bg-black hover:bg-slate-900 text-foreground text-lg font-cyber border border-primary/50 box-glow"
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <XIcon className="h-5 w-5 mr-3" />
                )}
                CONNECT X ACCOUNT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Status Card */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/30 overflow-hidden relative">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {connection.profileImage && (
                <div className="relative">
                  <img 
                    src={connection.profileImage} 
                    alt={connection.name} 
                    className="h-16 w-16 rounded-full border-2 border-primary box-glow"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-green-500 border-2 border-card">
                    <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                  </div>
                </div>
              )}
              <div>
                <CardTitle className="flex items-center gap-3 font-cyber text-xl">
                  <XIcon className="h-5 w-5" />
                  @{connection.username}
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-normal">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </CardTitle>
                <CardDescription>{connection.name}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50 hover:border-primary/50 transition-colors">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold font-cyber">{connection.followers?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50 hover:border-primary/50 transition-colors">
              <Target className="h-5 w-5 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold font-cyber">{connection.following?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50 hover:border-primary/50 transition-colors">
              <Send className="h-5 w-5 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold font-cyber">{connection.tweets?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Tweets</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50 hover:border-primary/50 transition-colors">
              <Bot className="h-5 w-5 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold font-cyber">{activeBots}</p>
              <p className="text-xs text-muted-foreground">Active Bots</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border/50 hover:border-primary/50 transition-colors">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold font-cyber">${revenueTracker}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="viral-generator" className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-2 h-auto p-1 bg-secondary/50">
          <TabsTrigger value="viral-generator" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Viral Gen</span>
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Compose</span>
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Hashtags</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Queue</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Ads</span>
          </TabsTrigger>
        </TabsList>

        {/* Viral Generator Tab */}
        <TabsContent value="viral-generator" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Generator Controls */}
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-cyber">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  VIRAL TWEET GENERATOR
                </CardTitle>
                <CardDescription>AI-powered viral tweet creation with hooks & CTAs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    placeholder="e.g., Mad Hippie Vitamin C Serum"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">Number of Tweets</label>
                  <div className="flex gap-2">
                    {[3, 5, 10, 20].map(num => (
                      <Button
                        key={num}
                        variant={tweetCount === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTweetCount(num)}
                        className={tweetCount === num ? "bg-accent" : ""}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateTweets}
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-accent to-primary font-cyber"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      GENERATE {tweetCount} VIRAL TWEETS
                    </>
                  )}
                </Button>

                {generatedTweets.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleAutoPostNow}
                      disabled={isBulkPosting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isBulkPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                      Post 1 Now
                    </Button>
                    <Button 
                      onClick={handleBulkPost}
                      disabled={isBulkPosting}
                      variant="outline"
                      className="flex-1 border-primary/50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Tweets Preview */}
            <Card className="bg-card/50 border-border/50 max-h-[500px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    Generated Tweets
                  </span>
                  <Badge variant="outline">{generatedTweets.length} tweets</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[400px] space-y-3 pr-2">
                {generatedTweets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Generate tweets to see them here</p>
                  </div>
                ) : (
                  generatedTweets.map((tweet, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-secondary/30 rounded-xl border border-border/50 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-black/50 text-primary font-cyber text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-3 leading-relaxed">{tweet.text}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {tweet.hashtags?.slice(0, 5).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-primary/10 border-primary/30">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={() => handleUseTweet(tweet.text)}>
                              <Send className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => postTweet(tweet.text)}>
                              <Zap className="h-3 w-3 mr-1" />
                              Post Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cyber">
                <Send className="h-5 w-5 text-primary" />
                COMPOSE TWEET
              </CardTitle>
              <CardDescription>Write and post or schedule your tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What's happening? Write your viral tweet..."
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  className="min-h-[150px] resize-none bg-secondary/30 border-border/50 text-lg"
                  maxLength={280}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleAddHashtags(hashtagSuggestions.slice(0, 5))}
                    >
                      <Hash className="h-4 w-4 mr-1" />
                      Add Hashtags
                    </Button>
                  </div>
                  <span className={`text-sm font-cyber ${tweetText.length > 260 ? "text-destructive" : "text-muted-foreground"}`}>
                    {tweetText.length}/280
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 bg-secondary/30"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePostTweet}
                  disabled={isPosting || !tweetText.trim()}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-cyber"
                >
                  {isPosting ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  POST NOW
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleScheduleTweet}
                  disabled={isPosting || !tweetText.trim() || !scheduleDate}
                  className="flex-1 h-12 border-primary/50 font-cyber"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  SCHEDULE
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cyber">
                <Hash className="h-5 w-5 text-accent" />
                HASHTAG OPTIMIZER
              </CardTitle>
              <CardDescription>Trending hashtags for maximum reach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {hashtagSuggestions.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/20 hover:border-primary/50 transition-colors"
                    onClick={() => setTweetText(prev => `${prev} #${tag}`.slice(0, 280))}
                  >
                    <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Card className="bg-secondary/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Skincare Trending</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["GlassSkin", "SkinCareTok", "GlowUp", "CleanBeauty", "VitaminC"].map((tag, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>#{tag}</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">🔥 Hot</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Beauty Viral</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["BeautyTips", "AffordableBeauty", "SkincareRoutine", "AntiAging", "NaturalBeauty"].map((tag, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>#{tag}</span>
                        <Badge className="bg-accent/20 text-accent text-xs">📈 Rising</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-cyber">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  POST QUEUE
                </span>
                <Badge variant="outline" className="font-normal">
                  {scheduledTweets.length} scheduled
                </Badge>
              </CardTitle>
              <CardDescription>Upcoming tweets waiting to be posted</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledTweets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Queue is Empty</p>
                  <p className="text-sm">Schedule tweets to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledTweets.map((tweet) => (
                    <div 
                      key={tweet.id}
                      className="p-4 bg-secondary/30 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm mb-3">{tweet.content}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tweet.scheduled_at).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                              Pending
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-cyber">
                  <LineChart className="h-5 w-5 text-primary" />
                  ENGAGEMENT METRICS
                </CardTitle>
                <CardDescription>Real-time performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-3xl font-bold font-cyber">{analytics?.impressions?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-red-400" />
                    <p className="text-3xl font-bold font-cyber">{analytics?.likes?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                    <Repeat2 className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-3xl font-bold font-cyber">{analytics?.retweets?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Retweets</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                    <MessageCircle className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-3xl font-bold font-cyber">{analytics?.replies?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Replies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-cyber">
                  <Activity className="h-5 w-5 text-accent" />
                  ACTIVITY SUMMARY
                </CardTitle>
                <CardDescription>Your posting activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Tweets Posted (7d)</span>
                    <span className="font-cyber text-primary">{analytics?.tweetsPosted || 0}</span>
                  </div>
                  <Progress value={(analytics?.tweetsPosted || 0) * 10} className="h-2" />
                </div>
                
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Engagement Rate</span>
                    <span className="font-cyber text-green-400">
                      {analytics?.impressions ? ((((analytics?.likes || 0) + (analytics?.retweets || 0)) / analytics.impressions) * 100).toFixed(2) : 0}%
                    </span>
                  </div>
                  <Progress value={engagementScore} className="h-2" />
                </div>

                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Click-through Rate</span>
                    <span className="font-cyber text-accent">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card className="bg-gradient-to-br from-card to-orange-500/5 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cyber">
                <Megaphone className="h-5 w-5 text-orange-400" />
                AD CAMPAIGN MANAGER
              </CardTitle>
              <CardDescription>Promote tweets and track ROAS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-secondary/30 rounded-xl border border-dashed border-orange-500/30 text-center">
                <Crown className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                <h4 className="font-cyber text-lg mb-2">X Ads Integration</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your X Ads account to create and manage promoted tweets
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600 font-cyber">
                  <Megaphone className="h-4 w-4 mr-2" />
                  CONNECT X ADS
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-green-400" />
                  <p className="text-xl font-bold font-cyber">$0</p>
                  <p className="text-xs text-muted-foreground">Ad Spend</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                  <MousePointer className="h-5 w-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-xl font-bold font-cyber">0</p>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl text-center border border-border/50">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-xl font-bold font-cyber">0x</p>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
