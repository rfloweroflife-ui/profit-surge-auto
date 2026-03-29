import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCartSync() {
  const cartId = useCartStore(state => state.cartId);
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    // When user returns from checkout tab, check if cart is still valid
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cartId) {
        // Cart will be validated on next interaction
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cartId, clearCart]);
}
