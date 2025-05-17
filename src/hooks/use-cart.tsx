
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const CartContext = createContext<{
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };

        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        };
      } else {
        // Add new item
        const newItem = { ...action.payload, quantity: 1 };
        return {
          ...state,
          items: [...state.items, newItem],
          total: state.total + newItem.price,
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state;
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
      };
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter((item) => item.id !== action.payload.id);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };
    
    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 }, () => {
    // Load cart from localStorage on initialization
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
  });

  // Efeito para carregar o carrinho do usuário quando ele faz login
  useEffect(() => {
    const loadUserCart = async () => {
      if (isAuthenticated && user) {
        // Verificar se existe um carrinho salvo para este usuário no banco de dados
        const { data: cartData, error } = await supabase
          .from('user_carts')
          .select('cart_data')
          .eq('user_id', user.id)
          .single();
        
        if (!error && cartData?.cart_data) {
          // Se encontrar um carrinho salvo, carregá-lo
          dispatch({ type: 'LOAD_CART', payload: cartData.cart_data as CartState });
          console.log("Carrinho carregado do banco de dados para o usuário:", user.id);
        } else {
          // Não fazer nada se não houver carrinho salvo, manter o localStorage atual
          console.log("Nenhum carrinho encontrado no banco de dados para o usuário:", user.id);
        }
      }
    };

    loadUserCart();
  }, [isAuthenticated, user]);

  // Salvar carrinho quando mudar
  useEffect(() => {
    // Sempre salvar no localStorage
    localStorage.setItem('cart', JSON.stringify(state));
    
    // Se o usuário estiver autenticado, salvar também no banco de dados
    const saveUserCart = async () => {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('user_carts')
          .upsert(
            { 
              user_id: user.id, 
              cart_data: state,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          );
          
        if (error) {
          console.error("Erro ao salvar carrinho no BD:", error);
        } else {
          console.log("Carrinho salvo no banco de dados para o usuário:", user.id);
        }
      }
    };

    if (isAuthenticated && user) {
      saveUserCart();
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
        items: state.items,
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
