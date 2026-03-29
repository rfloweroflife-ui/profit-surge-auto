import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Zap, Bot, TrendingUp, Shield } from 'lucide-react';

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) toast.error(error.message);
    else toast.success('Welcome back!');
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (error) toast.error(error.message);
    else toast.success('Account created! Check your email to confirm, then sign in.');
    setIsLoading(false);
  };

  const features = [
    { icon: Bot, title: '200 AI Bots', desc: 'Autonomous marketing swarm' },
    { icon: TrendingUp, title: 'Auto-Optimization', desc: '15-minute performance loops' },
    { icon: Zap, title: 'Multi-Platform', desc: 'Pinterest, X, Instagram & more' },
    { icon: Shield, title: 'Full Automation', desc: 'Set it and forget it' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/10 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div>
            <h1 className="font-cyber text-4xl font-bold text-primary text-glow-sm">
              PROFIT REAPER
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              AI-powered marketing automation that sells while you sleep
            </p>
          </div>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border">
                <div className="h-10 w-10 rounded-lg gradient-cyber flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Start your <span className="text-primary font-semibold">3-day free trial</span> — no limits, full access. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Right panel — auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-cyber text-2xl text-primary lg:hidden">PROFIT REAPER</CardTitle>
            <CardTitle className="hidden lg:block">Welcome</CardTitle>
            <CardDescription>Sign in or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Start Free Trial</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full gradient-cyber text-primary-foreground" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name or company" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full gradient-cyber text-primary-foreground" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Start 3-Day Free Trial
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No credit card required to start. Full access for 3 days.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
