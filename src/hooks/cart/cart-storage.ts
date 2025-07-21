
import { CartState } from './cart-types';
import { apiClient } from '@/lib/api-client';

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
    const { data, error } = await apiClient.getCart();
    
    if (!error && data && (data as any).items) {
      console.log("Carrinho carregado do banco de dados para o usuário:", userId);
      return data as CartState;
    }
    
    console.log("Nenhum carrinho encontrado no banco de dados para o usuário:", userId);
    return { items: [], total: 0 };
  } catch (e) {
    console.error("Erro ao carregar carrinho:", e);
    return null;
  }
};

// Save cart to database for a specific user
export const saveCartToDatabase = async (userId: string, cartData: CartState): Promise<void> => {
  try {
    const { error } = await apiClient.saveCart(cartData);
    
    if (error) {
      console.error("Erro ao salvar carrinho no BD:", error);
    } else {
      console.log("Carrinho salvo no banco de dados para o usuário:", userId);
    }
  } catch (e) {
    console.error("Erro ao salvar carrinho:", e);
  }
};
