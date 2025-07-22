import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

export const useProducts = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.getProducts();
      return response.data || [];
    },
  });

  return {
    products: products || [],
    isLoading,
    error,
  };
};

export const useProduct = (productId?: string) => {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await apiClient.getProduct(productId);
      return response.data;
    },
    enabled: !!productId,
  });

  return {
    product,
    isLoading,
    error,
  };
};

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['productSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const response = await apiClient.getProducts();
      const filtered = response.data?.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return filtered || [];
    },
    enabled: searchTerm.trim().length > 0,
  });

  return {
    searchResults: searchResults || [],
    isLoading,
    searchTerm,
    setSearchTerm,
  };
};