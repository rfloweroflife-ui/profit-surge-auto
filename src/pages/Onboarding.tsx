import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Store, CheckCircle, Loader2, Link2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Onboarding() {
  const { user } = useAuth();
  const [storeDomain, setStoreDomain] = useState('');
  const [storefrontToken, setStorefrontToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: storeConnection, refetch } = useQuery({
    queryKey: ['store-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsConnecting(true);

    // Normalize domain
    let domain = storeDomain.trim();
    if (!domain.includes('.myshopify.com')) {
      domain = `${domain}.myshopify.com`;
    }
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const { error } = await supabase.from('store_connections').upsert({
      user_id: user.id,
      store_domain: domain,
      storefront_token: storefrontToken.trim(),
      store_name: domain.split('.')[0],
    });

    if (error) {
      toast.error('Failed to save store connection');
    } else {
      toast.success('Store connected!');
      refetch();
    }
    setIsConnecting(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-primary">Connect Your Store</h1>
          <p className="text-muted-foreground mt-1">
            Link your Shopify store so bots can promote your real products
          </p>
        </div>

        {storeConnection ? (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                Store Connected
              </CardTitle>
              <CardDescription>{storeConnection.store_domain}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your bots are ready to promote products from this store. Head to the{' '}
                <a href="/" className="text-primary underline">War Room</a> to deploy.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shopify Store Details
              </CardTitle>
              <CardDescription>
                You'll need your store domain and a Storefront API access token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Store Domain</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="domain"
                      value={storeDomain}
                      onChange={(e) => setStoreDomain(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Your *.myshopify.com domain</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Storefront Access Token</Label>
                  <Input 
                    id="token"
                    value={storefrontToken}
                    onChange={(e) => setStorefrontToken(e.target.value)}
                    placeholder="shpat_xxxxx or storefront token"
                    required
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Shopify Admin → Settings → Apps → Develop apps → Your app → API credentials
                  </p>
                </div>
                <Button type="submit" className="w-full gradient-cyber text-primary-foreground" disabled={isConnecting}>
                  {isConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Connect Store
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
