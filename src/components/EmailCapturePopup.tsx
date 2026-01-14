import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Gift, X } from "lucide-react";
import { toast } from "sonner";

export function EmailCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or subscribed
    const hasInteracted = localStorage.getItem("email_popup_dismissed");
    if (!hasInteracted) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call - in production, connect to email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem("email_popup_dismissed", "true");
    setIsOpen(false);
    setIsSubmitting(false);
    
    toast.success("Welcome to Aura Luxe! 🎉", {
      description: "Check your email for your 10% discount code: GLOW10"
    });
  };

  const handleDismiss = () => {
    localStorage.setItem("email_popup_dismissed", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-primary/30">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full gradient-cyber flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="font-cyber text-2xl text-primary text-glow-sm">
            Get 10% Off
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Join the Aura Luxe VIP list for exclusive deals, glow-up tips, and early access to new products.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary/30 border-border focus:border-primary"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-cyber text-primary-foreground font-cyber"
          >
            {isSubmitting ? (
              "Subscribing..."
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Unlock My Discount
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No spam. Unsubscribe anytime. Use code GLOW10 at checkout.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
