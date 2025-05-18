import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Product } from '../../types/database';
import { parseFormattedNumber } from '../../lib/formatters';

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
  stock: 0,
  active: true
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

      const typedProducts = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        base_price: item.base_price,
        discount_type: item.discount_type as 'percentage' | 'fixed' | null,
        discount_value: item.discount_value,
        image: item.image,
        category: item.category,
        stock: item.stock,
        active: item.active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setProducts(typedProducts);
    } catch (error: any) {
      toast.error(`Erro ao carregar produtos: ${error.message}`);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsNewProduct(false);
    setIsEditDialogOpen(true);
  };

  const handleNewClick = () => {
    setCurrentProduct(emptyProduct);
    setIsNewProduct(true);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      // Validation
      if (!currentProduct.name) {
        toast.error('Nome do produto é obrigatório');
        return;
      }

      let processedProduct = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: currentProduct.price,
        base_price: currentProduct.base_price,
        discount_type: currentProduct.discount_type,
        discount_value: currentProduct.discount_value,
        image: currentProduct.image,
        category: currentProduct.category,
        stock: currentProduct.stock,
        active: currentProduct.active
      };
      
      if (typeof processedProduct.base_price === 'string') {
        processedProduct.base_price = parseFormattedNumber(processedProduct.base_price);
      }
      
      if (isNewProduct) {
        const { error } = await supabase
          .from('products')
          .insert(processedProduct);
          
        if (error) throw error;
        
        toast.success('Produto criado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .update(processedProduct)
          .eq('id', currentProduct.id);
          
        if (error) throw error;
        
        toast.success('Produto atualizado com sucesso!');
      }
      
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(`Erro ao salvar produto: ${error.message}`);
      console.error('Error saving product:', error);
    }
  };

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

  const handleToggleActive = async (productId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active })
        .eq('id', productId);
        
      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, active } : p
      ));
      
      toast.success(`Produto ${active ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error: any) {
      toast.error(`Erro ao ${active ? 'ativar' : 'desativar'} produto: ${error.message}`);
      console.error('Error toggling product status:', error);
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
    handleToggleActive
  };
};
