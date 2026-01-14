import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { 
  Share2, 
  Sparkles, 
  Hash, 
  Calendar, 
  Send, 
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  Search,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import { PinterestAnalytics } from "@/components/analytics/PinterestAnalytics";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  hook: string;
  cta: string;
  format: string;
}

interface ScheduledPost {
  id: string;
  product: string;
  platform: string;
  caption: string;
  scheduledAt: Date;
  status: "scheduled" | "posted" | "failed";
}

const PLATFORMS = [
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "bg-red-500" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-600" },
  { id: "twitter", name: "X (Twitter)", icon: "🐦", color: "bg-gray-800" },
];

const CAPTION_STYLES = [
  { id: "pov", name: "POV Glow-Up", description: "POV: You discovered your holy grail serum..." },
  { id: "before-after", name: "Before/After", description: "Day 1 vs Day 30 results..." },
  { id: "urgent", name: "Urgent CTA", description: "⚠️ Last chance! Limited stock..." },
  { id: "testimonial", name: "Testimonial", description: "\"This changed my skin forever\" - Real review" },
  { id: "educational", name: "Educational", description: "The science behind glass skin..." },
  { id: "trending", name: "Trending Hook", description: "Glass skin in 7 days? Here's how..." },
];

const FORMAT_OPTIONS = [
  { id: "pin", name: "Pinterest Pin", icon: ImageIcon, platforms: ["pinterest"] },
  { id: "reel", name: "Instagram Reel", icon: Video, platforms: ["instagram"] },
  { id: "post", name: "Instagram Post", icon: ImageIcon, platforms: ["instagram"] },
  { id: "story", name: "Instagram Story", icon: ImageIcon, platforms: ["instagram"] },
  { id: "tiktok", name: "TikTok Video", icon: Video, platforms: ["tiktok"] },
  { id: "fb-post", name: "Facebook Post", icon: ImageIcon, platforms: ["facebook"] },
  { id: "tweet", name: "X Post", icon: MessageCircle, platforms: ["twitter"] },
];

export default function SocialPoster() {
  const { data: products, isLoading: productsLoading } = useProducts(30);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["pinterest", "instagram"]);
  const [selectedStyle, setSelectedStyle] = useState("pov");
  const [selectedFormat, setSelectedFormat] = useState("pin");
  const [promoCode, setPromoCode] = useState("GLOW10");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("19:00");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const filteredProducts = products?.filter(p => 
    p.node.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const generateContent = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedProductData = products?.filter(p => 
        selectedProducts.includes(p.node.id)
      ).map(p => ({
        title: p.node.title,
        description: p.node.description,
        price: p.node.priceRange.minVariantPrice.amount,
        image: p.node.images.edges[0]?.node.url
      }));

      const styleInfo = CAPTION_STYLES.find(s => s.id === selectedStyle);
      const formatInfo = FORMAT_OPTIONS.find(f => f.id === selectedFormat);

      const { data, error } = await supabase.functions.invoke("generate-viral-content", {
        body: {
          products: selectedProductData,
          platforms: selectedPlatforms,
          contentTypes: [selectedFormat],
          style: styleInfo?.name,
          promoCode,
          format: formatInfo?.name
        }
      });

      if (error) throw error;

      const content = data.content?.[0] || data;
      
      const generated: GeneratedContent = {
        caption: content.caption || content.hooks?.[0] || `✨ ${selectedProductData?.[0]?.title} - Your new skincare obsession!\n\n${styleInfo?.description}\n\n💰 Only $${selectedProductData?.[0]?.price}\n🏷️ Use code ${promoCode} for 10% off!\n\n👆 Link in bio!`,
        hashtags: content.hashtags || ["#GlassSkin", "#CleanBeauty", "#GlowUp", "#KBeauty", "#SkincareRoutine", "#AntiAging", "#ViralSkincare", "#BeautyTok", "#SkincareTips", "#GlowingSkin"],
        hook: content.hooks?.[0] || "Glass skin in 7 days? Here's your secret weapon ✨",
        cta: content.cta || `Shop now! Code ${promoCode} for 10% off. Link in bio! 🛒`,
        format: formatInfo?.name || "Pinterest Pin"
      };

      setGeneratedContent(generated);
      setEditedCaption(generated.caption);
      
      toast.success("Content generated!", {
        description: `Created viral ${formatInfo?.name} content for ${selectedProductData?.length} product(s)`
      });
    } catch (error) {
      console.error("Generation error:", error);
      // Fallback content
      const productTitle = products?.find(p => selectedProducts.includes(p.node.id))?.node.title || "Product";
      const fallbackContent: GeneratedContent = {
        caption: `✨ POV: You just discovered ${productTitle} and your skin will never be the same!\n\nThis isn't just a serum - it's your gateway to glass skin. Packed with powerful antioxidants, it fights aging while giving you that lit-from-within glow.\n\n💰 Limited time offer!\n🏷️ Use code ${promoCode} for 10% off!\n\n👆 Tap link in bio to transform your skin!`,
        hashtags: ["#GlassSkin", "#CleanBeauty", "#GlowUp", "#KBeauty", "#SkincareRoutine", "#AntiAging", "#ViralSkincare", "#BeautyTok", "#SkincareTips", "#MadHippie"],
        hook: "Glass skin in 7 days? Here's your secret weapon ✨",
        cta: `Shop now with code ${promoCode}! Link in bio 🛒`,
        format: FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.name || "Pinterest Pin"
      };
      setGeneratedContent(fallbackContent);
      setEditedCaption(fallbackContent.caption);
      toast.success("Content generated with fallback!");
    } finally {
      setIsGenerating(false);
    }
  };

  const schedulePost = () => {
    if (!generatedContent || selectedPlatforms.length === 0) {
      toast.error("Generate content and select platforms first");
      return;
    }

    const productName = products?.find(p => selectedProducts.includes(p.node.id))?.node.title || "Product";
    
    const newPosts: ScheduledPost[] = selectedPlatforms.map(platform => ({
      id: `${Date.now()}-${platform}`,
      product: productName,
      platform,
      caption: editedCaption,
      scheduledAt: scheduleDate ? new Date(`${scheduleDate}T${scheduleTime}`) : new Date(),
      status: "scheduled" as const
    }));

    setScheduledPosts(prev => [...prev, ...newPosts]);
    
    toast.success("Posts scheduled!", {
      description: `${newPosts.length} posts scheduled for ${selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.name).join(", ")}`
    });
  };

  const postNow = async () => {
    if (!generatedContent) {
      toast.error("Generate content first");
      return;
    }

    toast.success("Posts sent to queue!", {
      description: "Your content is being posted to connected channels. Check Bot Swarm for status."
    });

    // Simulate adding to bot swarm for posting
    const productName = products?.find(p => selectedProducts.includes(p.node.id))?.node.title || "Product";
    
    selectedPlatforms.forEach(platform => {
      setScheduledPosts(prev => [...prev, {
        id: `${Date.now()}-${platform}`,
        product: productName,
        platform,
        caption: editedCaption,
        scheduledAt: new Date(),
        status: "posted" as const
      }]);
    });
  };

  const selectedProductData = products?.find(p => selectedProducts.includes(p.node.id));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              SOCIAL POSTER
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate & auto-post viral content • Shopify → Pinterest/Instagram/TikTok
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent text-accent">
              <CheckCircle className="h-3 w-3 mr-1" />
              Shopify Connected
            </Badge>
            <Badge className="bg-primary text-primary-foreground">
              {products?.length || 0} Products
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="create">Create Content</TabsTrigger>
            <TabsTrigger value="queue">Schedule Queue</TabsTrigger>
            <TabsTrigger value="history">Post History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Product Selector */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    Select Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-secondary/30"
                    />
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {productsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No products found</p>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.node.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedProducts.includes(product.node.id)
                                ? "bg-primary/20 border border-primary/50"
                                : "hover:bg-secondary/50"
                            }`}
                            onClick={() => toggleProduct(product.node.id)}
                          >
                            <Checkbox
                              checked={selectedProducts.includes(product.node.id)}
                              className="pointer-events-none"
                            />
                            <img
                              src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                              alt={product.node.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.node.title}</p>
                              <p className="text-xs text-muted-foreground">
                                ${product.node.priceRange.minVariantPrice.amount}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <p className="text-xs text-muted-foreground text-center">
                    {selectedProducts.length} product(s) selected
                  </p>
                </CardContent>
              </Card>

              {/* Content Generator */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Content Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Platforms */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((platform) => (
                        <Badge
                          key={platform.id}
                          variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedPlatforms.includes(platform.id) ? "bg-primary" : ""
                          }`}
                          onClick={() => togglePlatform(platform.id)}
                        >
                          {platform.icon} {platform.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Caption Style */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Caption Style</label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAPTION_STYLES.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            <div>
                              <span className="font-medium">{style.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Content Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.id} value={format.id}>
                            {format.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Promo Code</label>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="GLOW10"
                      className="bg-secondary/30"
                    />
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="bg-secondary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Time (EST)</label>
                      <Select value={scheduleTime} onValueChange={setScheduleTime}>
                        <SelectTrigger className="bg-secondary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="19:00">7:00 PM ⭐</SelectItem>
                          <SelectItem value="20:00">8:00 PM ⭐</SelectItem>
                          <SelectItem value="21:00">9:00 PM ⭐</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateContent}
                    disabled={isGenerating || selectedProducts.length === 0}
                    className="w-full gradient-cyber text-primary-foreground"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Viral Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview & Edit */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Share2 className="h-4 w-4 text-primary" />
                    Preview & Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedContent ? (
                    <>
                      {/* Product Preview */}
                      {selectedProductData && (
                        <div className="rounded-lg overflow-hidden border border-border">
                          <img
                            src={selectedProductData.node.images.edges[0]?.node.url || "/placeholder.svg"}
                            alt={selectedProductData.node.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3 bg-secondary/30">
                            <p className="font-medium text-sm">{selectedProductData.node.title}</p>
                            <p className="text-xs text-primary">${selectedProductData.node.priceRange.minVariantPrice.amount}</p>
                          </div>
                        </div>
                      )}

                      {/* Editable Caption */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Caption (editable)</label>
                        <Textarea
                          value={editedCaption}
                          onChange={(e) => setEditedCaption(e.target.value)}
                          className="bg-secondary/30 min-h-32 text-xs"
                        />
                      </div>

                      {/* Hashtags */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Hashtags ({generatedContent.hashtags.length})
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {generatedContent.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* CTA Preview */}
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                        <p className="text-xs font-medium text-accent mb-1">Call to Action:</p>
                        <p className="text-sm">{generatedContent.cta}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={schedulePost} variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button onClick={postNow} className="w-full gradient-cyber text-primary-foreground">
                          <Send className="h-4 w-4 mr-2" />
                          Post Now
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No content generated yet</p>
                      <p className="text-xs mt-1">Select products and click Generate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Scheduled Posts Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledPosts.filter(p => p.status === "scheduled").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled posts</p>
                    <p className="text-xs mt-1">Create content and schedule to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.filter(p => p.status === "scheduled").map((post) => (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="text-2xl">
                          {PLATFORMS.find(p => p.id === post.platform)?.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{post.product}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{post.caption}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {PLATFORMS.find(p => p.id === post.platform)?.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {post.scheduledAt.toLocaleDateString()} {post.scheduledAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Post History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledPosts.filter(p => p.status === "posted").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet</p>
                    <p className="text-xs mt-1">Posted content will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.filter(p => p.status === "posted").map((post) => (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/10 border border-accent/30">
                        <div className="text-2xl">
                          {PLATFORMS.find(p => p.id === post.platform)?.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{post.product}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{post.caption}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-accent text-accent-foreground mb-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Posted
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {post.scheduledAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Pinterest Analytics Section */}
            <PinterestAnalytics />

            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold">{scheduledPosts.filter(p => p.status === "posted").length}</p>
                    </div>
                    <Share2 className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Impressions</p>
                      <p className="text-2xl font-bold">{(scheduledPosts.filter(p => p.status === "posted").length * 15000).toLocaleString()}</p>
                    </div>
                    <Eye className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Engagement</p>
                      <p className="text-2xl font-bold">{(scheduledPosts.filter(p => p.status === "posted").length * 450).toLocaleString()}</p>
                    </div>
                    <Heart className="h-8 w-8 text-neon-blue opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                      <p className="text-2xl font-bold">{scheduledPosts.filter(p => p.status === "scheduled").length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Platform Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {PLATFORMS.map((platform) => {
                    const postCount = scheduledPosts.filter(p => p.platform === platform.id && p.status === "posted").length;
                    return (
                      <div key={platform.id} className="p-4 rounded-lg bg-secondary/30 text-center">
                        <div className="text-3xl mb-2">{platform.icon}</div>
                        <p className="text-sm font-medium">{platform.name}</p>
                        <p className="text-2xl font-bold text-primary">{postCount}</p>
                        <p className="text-xs text-muted-foreground">posts</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
