import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, 
  Zap, 
  Loader2, 
  CheckCircle,
  Sparkles,
  Copy,
  Instagram,
  Share2
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAutoAssignProducts, useGenerateViralContent, GeneratedContent } from "@/hooks/useProductAssignment";
import { toast } from "sonner";

export function ProductAssignment() {
  const { data: products, isLoading: productsLoading } = useProducts(30);
  const autoAssign = useAutoAssignProducts();
  const generateContent = useGenerateViralContent();
  
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Top 5 products (by position in list)
  const topProducts = products?.slice(0, 5) || [];

  const toggleProduct = (handle: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(handle)) {
      newSelected.delete(handle);
    } else {
      newSelected.add(handle);
    }
    setSelectedProducts(newSelected);
  };

  const selectTop5 = () => {
    const top5Handles = topProducts.map(p => p.node.handle);
    setSelectedProducts(new Set(top5Handles));
  };

  const handleAssignAndGenerate = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Select at least one product");
      return;
    }

    setIsGenerating(true);

    try {
      // Get selected product details
      const selectedProductData = products
        ?.filter(p => selectedProducts.has(p.node.handle))
        .map(p => ({
          title: p.node.title,
          handle: p.node.handle,
          description: p.node.description,
          price: p.node.priceRange.minVariantPrice.amount,
        })) || [];

      // Auto-assign to teams
      await autoAssign.mutateAsync(
        selectedProductData.map(p => ({ title: p.title, handle: p.handle }))
      );

      toast.success("Products assigned to teams!", {
        description: `${selectedProductData.length} products assigned to ${selectedProductData.length * 2} teams`
      });

      // Generate viral content
      const result = await generateContent.mutateAsync({
        products: selectedProductData,
        platforms: ["pinterest", "instagram"],
      });

      setGeneratedContent(result.content);
      
      toast.success(`🔥 ${result.generated} viral posts generated!`, {
        description: "Content ready for Pinterest & Instagram"
      });
    } catch (error) {
      toast.error("Generation failed. Try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = (content: GeneratedContent) => {
    const text = `${content.hook}\n\n${content.caption}\n\n${content.hashtags.join(" ")}\n\n${content.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Content copied!");
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-cyber flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Assign Products to Bot Teams
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectTop5}>
                Select Top 5
              </Button>
              <Badge variant="outline">
                {selectedProducts.size} selected
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[200px] pr-2 mb-4">
                <div className="grid gap-2">
                  {products?.slice(0, 15).map((product) => {
                    const isSelected = selectedProducts.has(product.node.handle);
                    const isTop5 = topProducts.some(p => p.node.handle === product.node.handle);
                    
                    return (
                      <div
                        key={product.node.handle}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => toggleProduct(product.node.handle)}
                      >
                        <Checkbox checked={isSelected} />
                        <img
                          src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                          alt={product.node.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.node.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                          </p>
                        </div>
                        {isTop5 && (
                          <Badge variant="secondary" className="text-[10px]">
                            Top 5
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <Button
                className="w-full gradient-cyber"
                onClick={handleAssignAndGenerate}
                disabled={isGenerating || selectedProducts.size === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Viral Content...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Assign & Generate Content ({selectedProducts.size} products)
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-cyber flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              Generated Viral Content
              <Badge className="ml-2">{generatedContent.length} posts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-4">
                {generatedContent.map((content, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{content.product}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {content.platform === "pinterest" ? (
                            <Share2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Instagram className="h-3 w-3 mr-1" />
                          )}
                          {content.platform}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContent(content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Hook */}
                    <div className="bg-primary/10 p-2 rounded border-l-2 border-primary">
                      <p className="text-sm font-medium">🔥 {content.hook}</p>
                    </div>

                    {/* Caption Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {content.caption}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {content.hashtags.slice(0, 6).map((tag, i) => (
                        <span key={i} className="text-[10px] text-accent">
                          {tag}
                        </span>
                      ))}
                      {content.hashtags.length > 6 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{content.hashtags.length - 6} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="text-xs text-primary font-medium">
                      {content.cta}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
