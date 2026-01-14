import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package, 
  Check,
  Loader2
} from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { handle } = useParams();
  const { data: products, isLoading } = useProducts(50);
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const product = products?.find((p) => p.node.handle === handle);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-cyber text-2xl mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">This product doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const variant = product.node.variants.edges[selectedVariant]?.node;
  const images = product.node.images.edges;

  const handleAddToCart = () => {
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success("Added to cart!", {
      description: product.node.title,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border">
              {images[0] ? (
                <img
                  src={images[0].node.url}
                  alt={product.node.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <div 
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border cursor-pointer hover:border-primary transition-colors"
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-cyber text-3xl font-bold mb-2">{product.node.title}</h1>
              <p className="text-3xl font-bold text-primary">
                ${parseFloat(variant?.price.amount || product.node.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
            </div>

            <p className="text-muted-foreground">
              {product.node.description || "Premium skincare product for your daily routine."}
            </p>

            {/* Variants */}
            {product.node.variants.edges.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Options</label>
                <div className="flex flex-wrap gap-2">
                  {product.node.variants.edges.map((v, i) => (
                    <Button
                      key={v.node.id}
                      variant={selectedVariant === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(i)}
                      className={selectedVariant === i ? "gradient-cyber text-primary-foreground" : ""}
                    >
                      {v.node.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {variant?.availableForSale ? (
                <Badge className="bg-primary text-primary-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Add to Cart */}
            <Button 
              size="lg" 
              className="w-full gradient-cyber text-primary-foreground font-semibold"
              onClick={handleAddToCart}
              disabled={!variant?.availableForSale}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>

            {/* Features */}
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  30-day money-back guarantee
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  CJ Dropshipping fulfilled
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
