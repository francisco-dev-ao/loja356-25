import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getProducts();
      setProducts((response.data as any[]) || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, isLoading, error };
};

export const useProduct = (productId?: string) => {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProduct = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.getProduct(productId);
      setProduct(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  return { product, isLoading, error };
};

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.getProducts();
      const products = (response.data as any[]) || [];
      const filtered = products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [searchTerm]);

  return {
    searchResults,
    isLoading,
    searchTerm,
    setSearchTerm,
  };
};