import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import { ShoppingCart, Eye, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function Products() {
  const { data: products, isLoading } = useProducts(50);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">
              PRODUCT CATALOG
            </h1>
            <p className="text-muted-foreground mt-1">
              {products?.length || 0} products synced from Shopify
            </p>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            <Package className="h-3 w-3 mr-1" />
            Real Inventory
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border animate-pulse">
                <div className="aspect-square bg-secondary" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.node.id} 
                className="bg-card/50 border-border hover:border-primary/50 transition-all group overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden bg-secondary">
                  {product.node.images.edges[0] ? (
                    <img 
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate mb-1">
                    {product.node.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {product.node.description || "Premium skincare product"}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gradient-cyber text-primary-foreground"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      asChild
                    >
                      <Link to={`/product/${product.node.handle}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-cyber text-lg mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                Your Shopify store doesn't have any products yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
