import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ticket, Plus, CheckCircle, Clock, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';

export default function Support() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support_tickets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });

    if (error) {
      toast.error('Failed to submit ticket');
    } else {
      toast.success('Support ticket submitted! We\'ll get back to you soon.');
      setSubject('');
      setDescription('');
      setPriority('medium');
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
    }
    setIsSubmitting(false);
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'open': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4 text-blue-400" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="font-cyber text-3xl font-bold text-primary text-glow-sm">SUPPORT</h1>
          <p className="text-muted-foreground mt-1">Need help? Submit a ticket and we'll get back to you fast.</p>
        </div>

        {/* Submit Ticket */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              New Support Ticket
            </CardTitle>
            <CardDescription>Describe your issue and we'll investigate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Explain the issue in detail — what happened, what you expected, any error messages..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={5}
                  maxLength={2000}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — General question</SelectItem>
                    <SelectItem value="medium">Medium — Something isn't working right</SelectItem>
                    <SelectItem value="high">High — Feature is broken</SelectItem>
                    <SelectItem value="urgent">Urgent — Business is impacted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-cyber text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Tickets */}
        <div>
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Your Tickets
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !tickets || tickets.length === 0 ? (
            <Card className="bg-card/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                No tickets yet. Submit one above if you need help!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map(t => (
                <Card key={t.id} className="bg-card/50">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {statusIcon(t.status)}
                        <p className="font-medium">{t.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{t.priority}</Badge>
                        <Badge variant="outline" className={`text-xs ${
                          t.status === 'resolved' ? 'border-green-500/50 text-green-400' :
                          t.status === 'in_progress' ? 'border-blue-500/50 text-blue-400' :
                          'border-yellow-500/50 text-yellow-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    {t.admin_notes && (
                      <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                        <p className="text-xs text-primary font-medium mb-1">Response from support:</p>
                        <p className="text-sm">{t.admin_notes}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Submitted {new Date(t.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
