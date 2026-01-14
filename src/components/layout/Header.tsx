import { Bell, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const totalItems = useCartStore((state) => 
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  
  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search products, commands, analytics..." 
            className="w-80 bg-secondary/50 pl-10 border-border focus:border-primary"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
            3
          </Badge>
        </Button>
        
        <CartDrawer />
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
