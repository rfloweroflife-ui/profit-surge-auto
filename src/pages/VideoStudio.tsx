import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { 
  Video, 
  Wand2, 
  Play, 
  Download, 
  Sparkles,
  Clock,
  Film,
  Loader2
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function VideoStudio() {
  const { data: products } = useProducts(30);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState("");

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }
    setIsGenerating(true);
    // Simulate generation - will be connected to D-ID/ElevenLabs
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Video generation started!", {
        description: "This feature will be powered by D-ID & ElevenLabs"
      });
    }, 2000);
  };

  const videoTemplates = [
    { name: "Glow-Up Reveal", duration: "15s", format: "9:16 Reels" },
    { name: "Before/After", duration: "15s", format: "9:16 Reels" },
    { name: "Product Showcase", duration: "30s", format: "1:1 Square" },
    { name: "Testimonial Style", duration: "60s", format: "16:9 Wide" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              VIDEO AD STUDIO
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered video generation with D-ID avatars & ElevenLabs voice
            </p>
          </div>
          <Badge variant="outline" className="border-accent text-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Selection */}
          <Card className="bg-card/50 border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Select Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {products?.slice(0, 10).map((product) => (
                <div
                  key={product.node.id}
                  onClick={() => setSelectedProduct(product.node.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    selectedProduct === product.node.id
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
                <div className="grid grid-cols-2 gap-2">
                  {videoTemplates.map((template) => (
                    <div
                      key={template.name}
                      className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 cursor-pointer transition-all"
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
                <label className="text-sm font-medium mb-2 block">Video Script</label>
                <Textarea
                  placeholder="Enter your video script or let AI generate one..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-24 bg-secondary/30 border-border"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedProduct}
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
                      Generate Video
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Videos Queue */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Video Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos generated yet</p>
              <p className="text-sm">Select a product and generate your first viral video</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
