import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Users, Search, Eye, Ticket, Mail, Phone, MapPin, Bot,
  Store, Crown, AlertTriangle, CheckCircle, Clock, RefreshCw,
  ChevronRight, Shield
} from 'lucide-react';

interface Customer {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  brand_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  last_seen_at: string | null;
  subscription: {
    tier: string;
    status: string;
    bot_limit: number;
    trial_ends_at: string | null;
  } | null;
  store: {
    store_domain: string;
    store_name: string | null;
    is_active: boolean;
  } | null;
  open_tickets: number;
}

interface CustomerDetail {
  profile: Customer;
  subscription: Record<string, unknown> | null;
  store: Record<string, unknown> | null;
  tickets: Array<{
    id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    admin_notes: string | null;
    created_at: string;
  }>;
  activities: Array<{
    id: string;
    action: string;
    action_type: string;
    created_at: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    status: string;
    assigned_product: string | null;
  }>;
}

export default function AdminCRM() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ticketNote, setTicketNote] = useState('');

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single()
      .then(({ data }) => {
        setIsAdmin(!!data);
        if (data) loadCustomers();
        else setIsLoading(false);
      });
  }, [user]);

  const loadCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-api', {
      body: { action: 'list_customers' },
    });
    if (error) {
      toast.error('Failed to load customers');
    } else {
      setCustomers(data.customers || []);
    }
    setIsLoading(false);
  };

  const viewCustomer = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('admin-api', {
      body: { action: 'get_customer', data: { userId } },
    });
    if (error) {
      toast.error('Failed to load customer details');
    } else {
      setSelectedCustomer(data);
    }
  };

  const updateTicket = async (ticketId: string, status: string) => {
    const { error } = await supabase.functions.invoke('admin-api', {
      body: { action: 'update_ticket', data: { ticketId, status, admin_notes: ticketNote || undefined } },
    });
    if (error) {
      toast.error('Failed to update ticket');
    } else {
      toast.success('Ticket updated');
      setTicketNote('');
      if (selectedCustomer) viewCustomer(selectedCustomer.profile.id);
      loadCustomers();
    }
  };

  const updateSubscription = async (userId: string, tier: string, status: string, botLimit: number) => {
    const { error } = await supabase.functions.invoke('admin-api', {
      body: { action: 'update_subscription', data: { userId: userId, tier, status: status, bot_limit: botLimit } },
    });
    if (error) {
      toast.error('Failed to update subscription');
    } else {
      toast.success('Subscription updated');
      loadCustomers();
      if (selectedCustomer) viewCustomer(userId);
    }
  };

  const filtered = customers.filter(c =>
    !search || 
    c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'trialing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'expired': case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': case 'urgent': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!isAdmin && !isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground">You need admin privileges to access the CRM dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">ADMIN CRM</h1>
            <p className="text-muted-foreground mt-1">Customer management & support</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary">
              {customers.length} Customers
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              {customers.filter(c => c.open_tickets > 0).length} Open Tickets
            </Badge>
            <Button variant="outline" size="sm" onClick={loadCustomers}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Customers', value: customers.length, icon: Users },
            { label: 'Active Subs', value: customers.filter(c => c.subscription?.status === 'active').length, icon: Crown },
            { label: 'Trialing', value: customers.filter(c => c.subscription?.status === 'trialing').length, icon: Clock },
            { label: 'With Store', value: customers.filter(c => c.store).length, icon: Store },
            { label: 'Open Tickets', value: customers.reduce((s, c) => s + c.open_tickets, 0), icon: Ticket },
          ].map(s => (
            <Card key={s.label} className="bg-card/50 border-border">
              <CardContent className="pt-4 pb-3 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No customers found</div>
            ) : filtered.map(c => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedCustomer?.profile.id === c.id ? 'border-primary bg-primary/5' : 'bg-card/50'}`}
                onClick={() => viewCustomer(c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{c.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email || 'No email'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.open_tickets > 0 && (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                          {c.open_tickets}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${statusColor(c.subscription?.status || '')}`}>
                        {c.subscription?.tier || 'none'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Customer Detail */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets ({selectedCustomer.tickets?.length || 0})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="manage">Manage</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {selectedCustomer.profile.display_name || 'Customer'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCustomer.profile.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedCustomer.profile.email}</span>
                          </div>
                        )}
                        {selectedCustomer.profile.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedCustomer.profile.phone}</span>
                          </div>
                        )}
                        {(selectedCustomer.profile.city || selectedCustomer.profile.country) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {[selectedCustomer.profile.city, selectedCustomer.profile.state, selectedCustomer.profile.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {selectedCustomer.profile.company_name && (
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedCustomer.profile.company_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                        Joined: {new Date(selectedCustomer.profile.created_at).toLocaleDateString()}
                        {selectedCustomer.profile.last_seen_at && (
                          <> · Last seen: {new Date(selectedCustomer.profile.last_seen_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription */}
                  <Card className="bg-card/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Subscription</p>
                          <p className="font-medium capitalize">{(selectedCustomer.subscription as Record<string, unknown>)?.tier as string || 'None'}</p>
                        </div>
                        <Badge className={statusColor((selectedCustomer.subscription as Record<string, unknown>)?.status as string || '')}>
                          {(selectedCustomer.subscription as Record<string, unknown>)?.status as string || 'none'}
                        </Badge>
                      </div>
                      {(selectedCustomer.subscription as Record<string, unknown>)?.trial_ends_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Trial ends: {new Date((selectedCustomer.subscription as Record<string, unknown>).trial_ends_at as string).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Store & Bots */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-card/50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Store</p>
                        <p className="font-medium text-sm truncate">
                          {(selectedCustomer.store as Record<string, unknown>)?.store_domain as string || 'Not connected'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Bot Teams</p>
                        <p className="font-medium">{selectedCustomer.teams?.length || 0} teams</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tickets" className="space-y-3 mt-4">
                  {(!selectedCustomer.tickets || selectedCustomer.tickets.length === 0) ? (
                    <Card className="bg-card/50">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No support tickets yet
                      </CardContent>
                    </Card>
                  ) : selectedCustomer.tickets.map(t => (
                    <Card key={t.id} className="bg-card/50">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{t.subject}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={priorityColor(t.priority)}>{t.priority}</Badge>
                            <Badge variant="outline" className={t.status === 'open' ? 'border-yellow-500/50 text-yellow-400' : 'border-green-500/50 text-green-400'}>
                              {t.status}
                            </Badge>
                          </div>
                        </div>
                        {t.admin_notes && (
                          <div className="bg-secondary/30 p-2 rounded text-sm">
                            <span className="text-xs text-muted-foreground">Admin note:</span> {t.admin_notes}
                          </div>
                        )}
                        {t.status === 'open' && (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Add admin note..."
                              value={ticketNote}
                              onChange={e => setTicketNote(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={() => updateTicket(t.id, 'in_progress')}>
                              In Progress
                            </Button>
                            <Button size="sm" onClick={() => updateTicket(t.id, 'resolved')}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          </div>
                        )}
                        {t.status === 'in_progress' && (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Resolution note..."
                              value={ticketNote}
                              onChange={e => setTicketNote(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => updateTicket(t.id, 'resolved')}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <Card className="bg-card/50">
                    <CardContent className="pt-4">
                      {(!selectedCustomer.activities || selectedCustomer.activities.length === 0) ? (
                        <p className="text-center py-8 text-muted-foreground">No activity logged</p>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                          {selectedCustomer.activities.map(a => (
                            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                              <Bot className="h-4 w-4 text-primary shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate">{a.action}</p>
                                <p className="text-xs text-muted-foreground">{a.action_type} · {new Date(a.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manage" className="space-y-4 mt-4">
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Subscription Management</CardTitle>
                      <CardDescription>Modify this customer's plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { tier: 'starter', label: 'Starter', limit: 50 },
                          { tier: 'pro', label: 'Pro', limit: 200 },
                          { tier: 'agency', label: 'Agency', limit: 1000 },
                        ].map(plan => (
                          <Button
                            key={plan.tier}
                            variant={(selectedCustomer.subscription as Record<string, unknown>)?.tier === plan.tier ? 'default' : 'outline'}
                            onClick={() => updateSubscription(selectedCustomer.profile.id, plan.tier, 'active', plan.limit)}
                            className="w-full"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            {plan.label}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-yellow-400 border-yellow-500/50"
                          onClick={() => updateSubscription(
                            selectedCustomer.profile.id, 'trial', 'trialing',
                            (selectedCustomer.subscription as Record<string, unknown>)?.bot_limit as number || 50
                          )}
                        >
                          Reset Trial
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive border-destructive/50"
                          onClick={() => updateSubscription(
                            selectedCustomer.profile.id,
                            (selectedCustomer.subscription as Record<string, unknown>)?.tier as string || 'trial',
                            'canceled',
                            (selectedCustomer.subscription as Record<string, unknown>)?.bot_limit as number || 50
                          )}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-card/50 border-border">
                <CardContent className="py-20 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a customer to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}