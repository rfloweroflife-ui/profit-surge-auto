import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';

const tiers = [
  {
    name: 'Starter',
    price: 29,
    icon: Zap,
    botLimit: 50,
    features: [
      '50 AI Marketing Bots',
      '10 Bot Teams',
      '2 Social Platforms',
      'Basic Optimization Loop',
      'Email Support',
    ],
  },
  {
    name: 'Pro',
    price: 79,
    icon: Crown,
    botLimit: 200,
    popular: true,
    features: [
      '200 AI Marketing Bots',
      '40 Bot Teams',
      'All Social Platforms',
      '15-min Optimization Loop',
      'CEO Brain AI Assistant',
      'Video Ad Studio',
      'Priority Support',
    ],
  },
  {
    name: 'Agency',
    price: 199,
    icon: Rocket,
    botLimit: 1000,
    features: [
      '1,000 AI Marketing Bots',
      'Unlimited Bot Teams',
      'All Social Platforms',
      '5-min Optimization Loop',
      'CEO Brain + Custom AI',
      'White-label Branding',
      'API Access',
      'Dedicated Support',
    ],
  },
];

export default function Pricing() {
  const { subscription } = useAuth();

  const handleSelectPlan = async (tierName: string) => {
    // This will integrate with Stripe checkout
    toast.info(`Stripe checkout for ${tierName} coming soon — enable Stripe to activate`, {
      description: 'Your 3-day trial is active in the meantime',
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-cyber text-3xl font-bold text-primary">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Your 3-day free trial gives you full Pro access. Pick a plan before it ends.
          </p>
          {subscription?.status === 'trialing' && subscription.trial_ends_at && (
            <Badge variant="outline" className="border-primary text-primary">
              Trial ends {new Date(subscription.trial_ends_at).toLocaleDateString()}
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative bg-card border-border hover:border-primary/50 transition-all ${
                tier.popular ? 'border-primary ring-1 ring-primary/30' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-lg gradient-cyber flex items-center justify-center mb-2">
                  <tier.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-cyber">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
                <p className="text-xs text-muted-foreground">{tier.botLimit} bots</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan(tier.name)}
                  className={`w-full ${tier.popular ? 'gradient-cyber text-primary-foreground' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  {subscription?.tier === tier.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
