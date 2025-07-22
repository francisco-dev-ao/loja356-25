import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getProducts();
      setProducts((response.data as any[]) || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    isLoading,
    createProduct: apiClient.createProduct.bind(apiClient),
    updateProduct: apiClient.updateProduct.bind(apiClient),
    deleteProduct: apiClient.deleteProduct.bind(apiClient),
    refreshProducts: loadProducts,
  };
};