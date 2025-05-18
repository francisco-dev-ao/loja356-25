
import { supabase } from '@/integrations/supabase/client';
import { CartState } from './cart-types';
import { Json } from '@/integrations/supabase/types';

// Load cart from localStorage
export const loadCartFromLocalStorage = (): CartState | null => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? {
      ...JSON.parse(savedCart),
      items: JSON.parse(savedCart).items || []
    } : null;
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return null;
  }
};

// Save cart to localStorage
export const saveCartToLocalStorage = (cart: CartState): void => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Load cart from database for a specific user
export const loadCartFromDatabase = async (userId: string): Promise<CartState | null> => {
  try {
    const { data, error } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data && data.cart_data) {
      // Fix for TS2352: Convert to unknown first, then to CartState
      const cartData = data.cart_data as unknown as CartState;
      console.log("Carrinho carregado do banco de dados para o usuário:", userId);
      return cartData;
    }
    
    console.log("Nenhum carrinho encontrado no banco de dados para o usuário:", userId);
    return null;
  } catch (e) {
    console.error("Erro ao carregar carrinho:", e);
    return null;
  }
};

// Save cart to database for a specific user
export const saveCartToDatabase = async (userId: string, cartData: CartState): Promise<void> => {
  try {
    // Fix for TS2769: Convert CartState to Json type for Supabase
    const { error } = await supabase
      .from('user_carts')
      .upsert({
        user_id: userId,
        cart_data: cartData as unknown as Json,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error("Erro ao salvar carrinho no BD:", error);
    } else {
      console.log("Carrinho salvo no banco de dados para o usuário:", userId);
    }
  } catch (e) {
    console.error("Erro ao salvar carrinho:", e);
  }
};
