import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { CartState, CartItem, Product } from './cart/cart-types';
import { cartReducer, initialState } from './cart/cart-reducer';
import { 
  loadCartFromLocalStorage, 
  saveCartToLocalStorage, 
  loadCartFromDatabase, 
  saveCartToDatabase 
} from './cart/cart-storage';

// Re-export Product and CartItem types for backward compatibility
export type { Product, CartItem };

interface CartContextType {
  items: CartItem[];
  total: number;
  appliedCoupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountedTotal: number;
  } | null;
  finalTotal: number;
  addItem: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountType: 'percentage' | 'fixed', discountValue: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage on initialization
    return loadCartFromLocalStorage() || initialState;
  });

  // Effect to handle cart synchronization between local and database storage
  useEffect(() => {
    const synchronizeCart = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if a cart exists for this user in the database
          const dbCart = await loadCartFromDatabase(user.id);
          
          // Get current local cart
          const localCart = loadCartFromLocalStorage();
          
          if (dbCart && dbCart.items && dbCart.items.length > 0) {
            // If database has items and local cart is empty or has different items, load from database
            if (!localCart || !localCart.items || localCart.items.length === 0) {
              dispatch({ type: 'LOAD_CART', payload: dbCart });
              console.log("Loaded cart from database - local cart was empty");
            } else {
              // Local cart has items - keep the local cart
              // This prevents the cart from resetting during authentication
              saveCartToDatabase(user.id, localCart);
              console.log("Preserved local cart and saved to database");
            }
          } else if (localCart && localCart.items && localCart.items.length > 0) {
            // Database cart is empty but local cart has items - save local cart to database
            saveCartToDatabase(user.id, localCart);
            console.log("Saved local cart to empty database cart");
          }
        } catch (e) {
          console.error("Erro ao sincronizar carrinho:", e);
        }
      }
    };

    synchronizeCart();
  }, [isAuthenticated, user]);

  // Save cart when it changes
  useEffect(() => {
    // Always save to localStorage
    saveCartToLocalStorage(state);
    
    // If the user is authenticated, also save to the database
    if (isAuthenticated && user) {
      saveCartToDatabase(user.id, state);
    }
  }, [state, isAuthenticated, user]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success('Produto adicionado ao carrinho');
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    toast.info('Produto removido do carrinho');
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyCoupon = (code: string, discountType: 'percentage' | 'fixed', discountValue: number) => {
    dispatch({ type: 'APPLY_COUPON', payload: { code, discountType, discountValue } });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const finalTotal = state.appliedCoupon ? state.appliedCoupon.discountedTotal : state.total;

  return (
    <CartContext.Provider
      value={{
        items: state.items || [],
        total: state.total,
        appliedCoupon: state.appliedCoupon,
        finalTotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
