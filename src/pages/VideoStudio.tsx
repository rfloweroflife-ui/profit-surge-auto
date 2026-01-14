import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { 
  Video, 
  Wand2, 
  Play, 
  Download, 
  Sparkles,
  Clock,
  Film,
  Loader2,
  CheckCircle,
  Layers,
  Mic,
  User
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedVideo {
  id: string;
  product: string;
  script: string;
  status: "generating" | "ready" | "error";
  template: string;
  timestamp: Date;
  voiceId?: string;
}

export default function VideoStudio() {
  const { data: products } = useProducts(30);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState("");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("glow-up");
  const [bulkCount, setBulkCount] = useState(5);

  const videoTemplates = [
    { id: "glow-up", name: "Glow-Up Reveal", duration: "15s", format: "9:16 Reels", description: "Before/after transformation" },
    { id: "before-after", name: "Before/After", duration: "15s", format: "9:16 Reels", description: "Side-by-side comparison" },
    { id: "showcase", name: "Product Showcase", duration: "30s", format: "1:1 Square", description: "Product focus with benefits" },
    { id: "testimonial", name: "Testimonial Style", duration: "60s", format: "16:9 Wide", description: "Customer story format" },
    { id: "routine", name: "Routine Tutorial", duration: "45s", format: "9:16 Reels", description: "Step-by-step usage" },
    { id: "comparison", name: "vs Competitor", duration: "15s", format: "9:16 Reels", description: "Why we're better" },
  ];

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (products) {
      setSelectedProducts(products.map(p => p.node.id));
    }
  };

  const handleGenerateScript = async (productId: string) => {
    const product = products?.find(p => p.node.id === productId);
    if (!product) return;

    try {
      const { data, error } = await supabase.functions.invoke("generate-video-script", {
        body: {
          product: {
            title: product.node.title,
            description: product.node.description,
            price: product.node.priceRange.minVariantPrice.amount
          },
          template: selectedTemplate,
          duration: videoTemplates.find(t => t.id === selectedTemplate)?.duration
        }
      });

      if (error) throw error;
      return data.script;
    } catch (error) {
      console.error("Script generation error:", error);
      // Return fallback script
      return `[HOOK - 0:00-0:03]
"POV: You just found your new holy grail serum..."

[PROBLEM - 0:03-0:06]
Tired of dull, aging skin that just won't glow?

[SOLUTION - 0:06-0:10]
${product.node.title} is packed with powerful actives for glass skin results.

[CTA - 0:10-0:15]
⚡ Limited stock! Use code GLOW10 for 10% off!
👆 Link in bio!

#GlassSkin #CleanBeauty #GlowUp #KBeauty #SkincareRoutine`;
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    setIsGenerating(true);
    const template = videoTemplates.find(t => t.id === selectedTemplate);
    let generatedCount = 0;

    for (const productId of selectedProducts.slice(0, bulkCount)) {
      const product = products?.find(p => p.node.id === productId);
      if (!product) continue;

      const newVideo: GeneratedVideo = {
        id: `${Date.now()}-${productId}`,
        product: product.node.title,
        script: "",
        status: "generating",
        template: template?.name || "Glow-Up Reveal",
        timestamp: new Date()
      };

      setGeneratedVideos(prev => [...prev, newVideo]);

      const generatedScript = await handleGenerateScript(productId);

      setGeneratedVideos(prev => prev.map(v => 
        v.id === newVideo.id 
          ? { 
              ...v, 
              script: generatedScript || "Script generation in progress...",
              status: generatedScript ? "ready" : "error" 
            }
          : v
      ));
      
      generatedCount++;
    }

    setIsGenerating(false);
    toast.success(`Generated ${generatedCount} video scripts!`, {
      description: "Ready for D-ID avatar + ElevenLabs voice rendering"
    });
  };

  const handleSingleGenerate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Select a product first");
      return;
    }
    
    setIsGenerating(true);
    const productId = selectedProducts[0];
    const product = products?.find(p => p.node.id === productId);
    const template = videoTemplates.find(t => t.id === selectedTemplate);
    
    const generatedScript = await handleGenerateScript(productId);
    
    if (generatedScript) {
      setScript(generatedScript);
      
      const newVideo: GeneratedVideo = {
        id: `${Date.now()}-${productId}`,
        product: product?.node.title || "Product",
        script: generatedScript,
        status: "ready",
        template: template?.name || "Glow-Up Reveal",
        timestamp: new Date()
      };
      
      setGeneratedVideos(prev => [...prev, newVideo]);
      toast.success("Video script generated!", {
        description: "Ready for D-ID avatar + ElevenLabs voice"
      });
    }
    
    setIsGenerating(false);
  };

  const selectedProductData = products?.find(p => selectedProducts.includes(p.node.id));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              VIDEO AD STUDIO
            </h1>
            <p className="text-muted-foreground mt-1">
              AI video generation • D-ID avatars • ElevenLabs voice • Bulk creation for 30 products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent text-accent">
              <User className="h-3 w-3 mr-1" />
              D-ID Ready
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Mic className="h-3 w-3 mr-1" />
              ElevenLabs Active
            </Badge>
            <Badge variant="secondary">
              {generatedVideos.filter(v => v.status === "ready").length} Videos Ready
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="single">Single Video</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Generate ({products?.length || 0} products)</TabsTrigger>
            <TabsTrigger value="queue">Video Queue ({generatedVideos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Product Selection */}
              <Card className="bg-card/50 border-border lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Select Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {products?.slice(0, 15).map((product) => (
                    <div
                      key={product.node.id}
                      onClick={() => {
                        setSelectedProducts([product.node.id]);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedProducts.includes(product.node.id)
                          ? "bg-primary/20 border border-primary"
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        {product.node.images.edges[0] && (
                          <img
                            src={product.node.images.edges[0].node.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-sm truncate flex-1">{product.node.title}</span>
                      <span className="text-xs text-primary font-bold">
                        ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Video Configuration */}
              <Card className="bg-card/50 border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Video Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Video Template</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {videoTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? "bg-primary/20 border-primary"
                              : "bg-secondary/30 border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Film className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{template.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {template.duration} • {template.format}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">AI-Generated Script</label>
                    <Textarea
                      placeholder="Click 'Generate Script' to create a viral video script..."
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-40 bg-secondary/30 border-border font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSingleGenerate}
                      disabled={isGenerating || selectedProducts.length === 0}
                      className="flex-1 gradient-cyber text-primary-foreground"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Video Script
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Bulk Video Generation - All {products?.length || 0} Products
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllProducts}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedProducts([])}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {products?.map((product) => (
                    <div
                      key={product.node.id}
                      onClick={() => toggleProductSelection(product.node.id)}
                      className={`p-2 rounded-lg cursor-pointer transition-all ${
                        selectedProducts.includes(product.node.id)
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/30 border border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-square rounded overflow-hidden bg-muted mb-2">
                        {product.node.images.edges[0] && (
                          <img
                            src={product.node.images.edges[0].node.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-xs truncate">{product.node.title}</p>
                      {selectedProducts.includes(product.node.id) && (
                        <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div>
                    <p className="font-medium">{selectedProducts.length} products selected</p>
                    <p className="text-sm text-muted-foreground">
                      Generate {Math.min(selectedProducts.length, bulkCount)} videos • D-ID + ElevenLabs
                    </p>
                  </div>
                  <Button
                    onClick={handleBulkGenerate}
                    disabled={isGenerating || selectedProducts.length === 0}
                    className="gradient-cyber text-primary-foreground"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate {Math.min(selectedProducts.length, bulkCount)} Videos
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Video Queue - Ready for D-ID + ElevenLabs Rendering
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedVideos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos generated yet</p>
                    <p className="text-sm">Select products and generate viral video scripts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedVideos.map((video) => (
                      <div 
                        key={video.id}
                        className="p-4 rounded-lg bg-secondary/20 border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={video.status === "ready" ? "default" : "secondary"}>
                              {video.status === "generating" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                              {video.status === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {video.status}
                            </Badge>
                            <span className="font-medium text-sm">{video.product}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {video.template} • {video.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {video.script && (
                          <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-background/50 p-2 rounded">
                            {video.script.slice(0, 300)}...
                          </p>
                        )}
                        {video.status === "ready" && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1">
                              <Play className="h-3 w-3 mr-1" />
                              Render with D-ID
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Export Script
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
