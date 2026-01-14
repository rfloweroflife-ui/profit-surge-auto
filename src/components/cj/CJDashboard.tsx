import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  RefreshCw, 
  Link, 
  Truck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Unlink
} from 'lucide-react';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';

export function CJDashboard() {
  const {
    isConnected,
    isLoading,
    connection,
    stats,
    products,
    orders,
    analytics,
    connect,
    disconnect,
    syncProducts,
    fetchProducts,
    fetchOrders,
    checkTracking,
    syncInventory,
    fetchAnalytics,
  } = useCJDropshipping();

  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchProducts();
      fetchOrders();
      fetchAnalytics();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    if (!apiKey || !email) return;
    setConnecting(true);
    await connect(apiKey, email);
    setConnecting(false);
    setApiKey('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      processing: { variant: 'secondary', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      shipped: { variant: 'default', icon: <Truck className="w-3 h-3" /> },
      fulfilled: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Connect CJ Dropshipping
          </CardTitle>
          <CardDescription>
            Enter your CJ Dropshipping API credentials to enable automated fulfillment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">CJ Account Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your CJ API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://developers.cjdropshipping.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CJ Developer Portal
              </a>
            </p>
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={!apiKey || !email || connecting}
            className="w-full"
          >
            {connecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Connect CJ Dropshipping
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium text-green-400">CJ Dropshipping Connected</p>
                <p className="text-sm text-muted-foreground">
                  {connection?.email} • Last sync: {connection?.lastSync ? new Date(connection.lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={syncProducts}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Products
              </Button>
              <Button variant="outline" size="sm" onClick={syncInventory}>
                <Package className="w-4 h-4 mr-2" />
                Sync Inventory
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnect}>
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">${analytics.totalProfit.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">{analytics.profitMargin}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Order Fulfillment</CardTitle>
              <CardDescription>Track and manage CJ Dropshipping orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet. Orders from Shopify will appear here for fulfillment.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.shopify_order_number || order.shopify_order_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.customer_name || 'N/A'}</TableCell>
                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">${order.cj_cost.toFixed(2)}</TableCell>
                        <TableCell className="text-green-400">${order.profit.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <span className="text-sm">{order.tracking_number}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => checkTracking(order.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CJ Products</CardTitle>
                  <CardDescription>Products synced from CJ Dropshipping</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products synced yet.</p>
                  <Button variant="outline" className="mt-4" onClick={syncProducts}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Products from CJ
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>CJ Price</TableHead>
                      <TableHead>Sell Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Linked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter(p => !searchQuery || p.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img 
                                  src={product.image_url} 
                                  alt={product.product_name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <span className="font-medium">{product.product_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{product.product_sku || '-'}</TableCell>
                          <TableCell>${product.cj_price.toFixed(2)}</TableCell>
                          <TableCell>${product.sell_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={product.inventory_count > 10 ? 'default' : 'destructive'}>
                              {product.inventory_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.shopify_product_id ? (
                              <Badge variant="outline" className="text-green-400">
                                <Link className="w-3 h-3 mr-1" />
                                Linked
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Unlinked</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Real-time inventory sync with CJ Dropshipping</CardDescription>
                </div>
                <Button onClick={syncInventory}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Inventory
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">In Stock</p>
                    <p className="text-2xl font-bold text-green-400">
                      {products.filter(p => p.inventory_count > 0).length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Low Stock (&lt;10)</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {products.filter(p => p.inventory_count > 0 && p.inventory_count < 10).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>{product.inventory_count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.last_inventory_update 
                          ? new Date(product.last_inventory_update).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {product.inventory_count === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : product.inventory_count < 10 ? (
                          <Badge variant="secondary" className="text-yellow-400">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-400">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
