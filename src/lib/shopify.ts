import { toast } from "sonner";

// Shopify Configuration - REAL PRODUCTION STORE
export const SHOPIFY_API_VERSION = '2025-07';
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-i664s.myshopify.com';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = '64e0636b2ba6042f8737ff3de609f963';

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Your store needs to be upgraded to a paid plan."
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

export const STOREFRONT_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createStorefrontCheckout(items: CartItem[]): Promise<string> {
  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
  }));

  const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines },
  });

  if (!cartData || cartData.data.cartCreate.userErrors.length > 0) {
    throw new Error('Cart creation failed');
  }

  const cart = cartData.data.cartCreate.cart;
  const url = new URL(cart.checkoutUrl);
  url.searchParams.set('channel', 'online_store');
  return url.toString();
}

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}
