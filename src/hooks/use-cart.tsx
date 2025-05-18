
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
  addItem: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage on initialization
    return loadCartFromLocalStorage() || initialState;
  });

  // Effect to load user cart when they log in
  useEffect(() => {
    const loadUserCart = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if a cart exists for this user in the database
          const dbCart = await loadCartFromDatabase(user.id);
          
          if (dbCart) {
            dispatch({ type: 'LOAD_CART', payload: dbCart });
          } else {
            // Check if there's a cart in localStorage and save it to the database
            const localCart = loadCartFromLocalStorage();
            if (localCart && localCart.items && localCart.items.length > 0) {
              saveCartToDatabase(user.id, localCart);
            }
          }
        } catch (e) {
          console.error("Erro ao carregar carrinho:", e);
        }
      }
    };

    loadUserCart();
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

  return (
    <CartContext.Provider
      value={{
        items: state.items || [],
        total: state.total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
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
