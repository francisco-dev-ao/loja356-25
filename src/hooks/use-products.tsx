
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price: number | null;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  image: string;
  category: string;
  stock: number;
  quantity: number;  // Changed from optional to required to match use-cart.tsx
};

export const useProducts = (category?: string) => {
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchProducts = async (): Promise<Product[]> => {
    let query = supabase.from('products').select('*');
    
    if (category && category !== 'all') {
      setIsFiltering(true);
      query = query.eq('category', category);
    } else {
      setIsFiltering(false);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
    
    // Initialize quantity for all products and handle discount_type properly
    return (data || []).map(item => ({
      ...item,
      discount_type: item.discount_type as 'percentage' | 'fixed' | null,
      quantity: 1  // Default quantity to 1 for compatibility with cart
    })) as Product[];
  };

  return useQuery({
    queryKey: ['products', category || 'all'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  const fetchProduct = async (): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
    
    // Initialize quantity
    return {
      ...data,
      quantity: 1  // Default quantity to 1 for compatibility with cart
    } as unknown as Product;
  };

  return useQuery({
    queryKey: ['product', id],
    queryFn: fetchProduct,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to fetch and validate coupon code
export const useCoupon = (code: string | null) => {
  const fetchCoupon = async () => {
    if (!code) return null;
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching coupon:', error);
      throw new Error('Failed to fetch coupon');
    }
    
    if (!data) return null;
    
    // Validate coupon
    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;
    
    // Check if coupon is within valid date range
    if (validFrom > now || (validUntil && validUntil < now)) {
      return { error: 'Cupom expirado ou ainda não válido' };
    }
    
    // Check if max uses not exceeded
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { error: 'Limite de uso do cupom excedido' };
    }
    
    return data;
  };
  
  return useQuery({
    queryKey: ['coupon', code],
    queryFn: fetchCoupon,
    enabled: !!code,
    staleTime: 1000 * 60, // 1 minute
  });
};
