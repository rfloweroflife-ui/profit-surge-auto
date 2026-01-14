import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";

export function useProducts(count: number = 50) {
  return useQuery({
    queryKey: ["shopify-products", count],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: count });
      if (!data) return [];
      return data.data.products.edges as ShopifyProduct[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes - real data sync
    refetchInterval: 1000 * 60 * 15, // Auto-refresh every 15 minutes
  });
}
