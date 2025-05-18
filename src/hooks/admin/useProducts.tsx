
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/models/product';
import { parseFormattedNumber } from '@/lib/formatters';

// Default empty product
const emptyProduct: Product = {
  id: '',
  name: '',
  description: '',
  price: 0,
  base_price: null,
  discount_type: null,
  discount_value: null,
  image: '',
  category: '',
  stock: 0
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(emptyProduct);

  // Load products from database
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    
    try {
      let query = supabase.from('products').select('*');
      
      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar produtos: ${error.message}`);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Load products on mount and when searchTerm changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle click on "Edit" button
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsNewProduct(false);
    setIsEditDialogOpen(true);
  };

  // Handle click on "New Product" button
  const handleNewClick = () => {
    setCurrentProduct(emptyProduct);
    setIsNewProduct(true);
    setIsEditDialogOpen(true);
  };

  // Save product (create or update)
  const handleSaveProduct = async () => {
    try {
      // Validation
      if (!currentProduct.name) {
        toast.error('Nome do produto é obrigatório');
        return;
      }

      // Process price inputs if they are strings
      let processedProduct = { ...currentProduct };
      
      // Convert string base price to number
      if (typeof processedProduct.base_price === 'string') {
        processedProduct.base_price = parseFormattedNumber(processedProduct.base_price);
      }
      
      // If new product, generate ID and create
      if (isNewProduct) {
        // Generate a UUID
        const { data: idData } = await supabase.rpc('generate_uuid');
        processedProduct.id = idData || crypto.randomUUID();
        
        const { error } = await supabase
          .from('products')
          .insert(processedProduct);
          
        if (error) throw error;
        
        toast.success('Produto criado com sucesso!');
      } else {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(processedProduct)
          .eq('id', processedProduct.id);
          
        if (error) throw error;
        
        toast.success('Produto atualizado com sucesso!');
      }
      
      // Close dialog and refresh products
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(`Erro ao salvar produto: ${error.message}`);
      console.error('Error saving product:', error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error: any) {
      toast.error(`Erro ao excluir produto: ${error.message}`);
      console.error('Error deleting product:', error);
    }
  };

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isNewProduct,
    currentProduct,
    setCurrentProduct,
    handleEditClick,
    handleNewClick,
    handleSaveProduct,
    handleDeleteProduct,
  };
};
