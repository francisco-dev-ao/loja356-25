
import { Json } from '@/integrations/supabase/types';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  base_price?: number | null;
  discount_type?: 'percentage' | 'fixed' | null;
  discount_value?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  appliedCoupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountedTotal: number;
  } | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'APPLY_COUPON'; payload: { code: string; discountType: 'percentage' | 'fixed'; discountValue: number } }
  | { type: 'REMOVE_COUPON' };
