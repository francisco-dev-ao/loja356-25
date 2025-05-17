
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  quantity?: number;  // Tornando esta propriedade opcional para compatibilidade com use-cart
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
    
    return data as unknown as Product[];
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
    
    return data as unknown as Product;
  };

  return useQuery({
    queryKey: ['product', id],
    queryFn: fetchProduct,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
