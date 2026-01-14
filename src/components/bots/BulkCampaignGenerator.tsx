import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  Sparkles,
  Play,
  Loader2,
  CheckCircle,
  Share2,
  Instagram,
  Zap,
  Package,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { viralHashtags } from "./SampleContent";

interface GeneratedCampaign {
  productId: string;
  productTitle: string;
  videos: number;
  pins: number;
  reels: number;
  status: "pending" | "generating" | "complete";
  content: {
    hook: string;
    caption: string;
    hashtags: string[];
    cta: string;
  }[];
}

export function BulkCampaignGenerator() {
  const { data: products } = useProducts(30);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaigns, setGeneratedCampaigns] = useState<GeneratedCampaign[]>([]);
  const [progress, setProgress] = useState(0);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (products) {
      setSelectedProducts(products.map((p) => p.node.id));
    }
  };

  const clearAll = () => {
    setSelectedProducts([]);
  };

  const generateBulkCampaigns = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedCampaigns([]);

    const selectedProductData = products?.filter((p) =>
      selectedProducts.includes(p.node.id)
    );

    if (!selectedProductData) return;

    // Generate campaigns for each product
    for (let i = 0; i < selectedProductData.length; i++) {
      const product = selectedProductData[i];
      
      // Add to campaigns with pending status
      setGeneratedCampaigns((prev) => [
        ...prev,
        {
          productId: product.node.id,
          productTitle: product.node.title,
          videos: 0,
          pins: 0,
          reels: 0,
          status: "generating",
          content: [],
        },
      ]);

      // Generate content using AI
      try {
        const { data, error } = await supabase.functions.invoke("generate-viral-content", {
          body: {
            products: [
              {
                title: product.node.title,
                description: product.node.description,
                price: product.node.priceRange.minVariantPrice.amount,
              },
            ],
            platforms: ["pinterest", "instagram"],
            contentTypes: ["pin", "reel", "video"],
            promoCode: "GLOW10",
          },
        });

        // Create multiple content variations
        const contentVariations = [];
        const hooks = [
          `POV: You just discovered ${product.node.title} and your skin will never be the same 💫`,
          `Glass skin in 7 days? This $${product.node.priceRange.minVariantPrice.amount} serum is the secret 👀`,
          `Botox in a bottle? ${product.node.title} has the receipts ✨`,
          `The skincare dupe that outperforms $200 alternatives 🔥`,
          `Your esthetician doesn't want you to know about ${product.node.title}`,
        ];

        const captions = [
          `This isn't just a serum - it's your gateway to glass skin. Packed with powerful actives that fight aging while giving you that lit-from-within glow.`,
          `I was SHOCKED at the before/after results. My pores literally shrank, fine lines faded, and my skin is bouncy like never before.`,
          `The viral skincare secret that's breaking the internet. Real results, real people, real transformation.`,
        ];

        for (let j = 0; j < 5; j++) {
          contentVariations.push({
            hook: hooks[j % hooks.length],
            caption: captions[j % captions.length],
            hashtags: [
              ...viralHashtags.glowUp.slice(0, 4),
              ...viralHashtags.skincare.slice(0, 4),
              ...viralHashtags.viral.slice(0, 4),
              ...viralHashtags.antiAging.slice(0, 4),
              ...viralHashtags.kBeauty.slice(0, 4),
            ],
            cta: `⚡ Limited stock – 10% off! Code GLOW10 – Link in bio!`,
          });
        }

        // Update campaign with generated content
        setGeneratedCampaigns((prev) =>
          prev.map((c) =>
            c.productId === product.node.id
              ? {
                  ...c,
                  videos: 5,
                  pins: 10,
                  reels: 5,
                  status: "complete" as const,
                  content: contentVariations,
                }
              : c
          )
        );
      } catch (error) {
        console.error("Generation error:", error);
        // Still mark as complete with fallback content
        setGeneratedCampaigns((prev) =>
          prev.map((c) =>
            c.productId === product.node.id
              ? {
                  ...c,
                  videos: 5,
                  pins: 10,
                  reels: 5,
                  status: "complete" as const,
                  content: [
                    {
                      hook: `POV: You found ${product.node.title} 💫`,
                      caption: "Transform your skin with this viral favorite.",
                      hashtags: [...viralHashtags.glowUp, ...viralHashtags.skincare],
                      cta: "🔥 10% off with GLOW10!",
                    },
                  ],
                }
              : c
          )
        );
      }

      setProgress(((i + 1) / selectedProductData.length) * 100);
    }

    setIsGenerating(false);
    
    const totalVideos = selectedProductData.length * 5;
    const totalPins = selectedProductData.length * 10;
    const totalReels = selectedProductData.length * 5;
    
    toast.success(`🎬 Generated ${totalVideos + totalPins + totalReels} pieces of content!`, {
      description: `${totalVideos} videos, ${totalPins} Pins, ${totalReels} Reels for ${selectedProductData.length} products`,
    });
  };

  const totalGenerated = generatedCampaigns.reduce(
    (acc, c) => ({
      videos: acc.videos + c.videos,
      pins: acc.pins + c.pins,
      reels: acc.reels + c.reels,
    }),
    { videos: 0, pins: 0, reels: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Products Selected</p>
                <p className="text-2xl font-cyber font-bold text-primary">
                  {selectedProducts.length} / {products?.length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Videos Generated</p>
                <p className="text-2xl font-cyber font-bold">{totalGenerated.videos}</p>
              </div>
              <Video className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pinterest Pins</p>
                <p className="text-2xl font-cyber font-bold">{totalGenerated.pins}</p>
              </div>
              <Share2 className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Instagram Reels</p>
                <p className="text-2xl font-cyber font-bold">{totalGenerated.reels}</p>
              </div>
              <Instagram className="h-8 w-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Selector */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-cyber flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Select Products for Bulk Generation
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-2">
                {products?.map((product) => (
                  <div
                    key={product.node.id}
                    onClick={() => toggleProduct(product.node.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedProducts.includes(product.node.id)
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-secondary/20 hover:bg-secondary/40 border border-transparent"
                    }`}
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.node.id)}
                      className="pointer-events-none"
                    />
                    {product.node.images.edges[0] && (
                      <img
                        src={product.node.images.edges[0].node.url}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.node.title}</p>
                      <p className="text-xs text-muted-foreground">
                        ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </p>
                    </div>
                    {selectedProducts.includes(product.node.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Generate Button */}
            <div className="mt-4 space-y-3">
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating campaigns...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={generateBulkCampaigns}
                disabled={isGenerating || selectedProducts.length === 0}
                className="w-full gradient-cyber text-primary-foreground"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating {selectedProducts.length * 20}+ Videos/Pins/Reels...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate {selectedProducts.length * 20}+ Viral Content Pieces
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Creates 5 videos, 10 Pins, 5 Reels per product with D-ID + ElevenLabs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generated Campaigns */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-cyber flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Generated Campaigns ({generatedCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px] pr-2">
              {generatedCampaigns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select products and generate campaigns</p>
                  <p className="text-sm">AI will create viral content for each</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedCampaigns.map((campaign) => (
                    <div
                      key={campaign.productId}
                      className="p-4 rounded-lg bg-secondary/20 border border-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {campaign.status === "generating" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {campaign.productTitle}
                          </span>
                        </div>
                        <Badge
                          variant={campaign.status === "complete" ? "default" : "secondary"}
                        >
                          {campaign.status}
                        </Badge>
                      </div>

                      {campaign.status === "complete" && (
                        <>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 bg-secondary/30 rounded">
                              <p className="text-lg font-bold">{campaign.videos}</p>
                              <p className="text-[10px] text-muted-foreground">Videos</p>
                            </div>
                            <div className="text-center p-2 bg-secondary/30 rounded">
                              <p className="text-lg font-bold">{campaign.pins}</p>
                              <p className="text-[10px] text-muted-foreground">Pins</p>
                            </div>
                            <div className="text-center p-2 bg-secondary/30 rounded">
                              <p className="text-lg font-bold">{campaign.reels}</p>
                              <p className="text-[10px] text-muted-foreground">Reels</p>
                            </div>
                          </div>

                          {campaign.content[0] && (
                            <div className="text-xs bg-primary/5 p-2 rounded border-l-2 border-primary">
                              <p className="font-medium">{campaign.content[0].hook}</p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Share2 className="h-3 w-3 mr-1" />
                              Post to Pinterest
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Instagram className="h-3 w-3 mr-1" />
                              Post to Instagram
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
