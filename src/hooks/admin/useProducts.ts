
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/models/product';
import { calculateDiscountedPrice } from '@/lib/utils';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit product state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({
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
  });
  
  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Type cast the data to ensure it matches our Product type
      const typedData = data?.map(item => ({
        ...item,
        discount_type: item.discount_type as 'percentage' | 'fixed' | null
      })) || [];
      
      setProducts(typedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Edit product
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsNewProduct(false);
    setIsEditDialogOpen(true);
  };
  
  // New product
  const handleNewClick = () => {
    setCurrentProduct({
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
    });
    setIsNewProduct(true);
    setIsEditDialogOpen(true);
  };
  
  // Save product
  const handleSaveProduct = async () => {
    try {
      // Calculate final price based on base price and discount
      const basePrice = currentProduct.base_price || currentProduct.price;
      const finalPrice = calculateDiscountedPrice(
        basePrice,
        currentProduct.discount_type,
        currentProduct.discount_value
      );

      const productData = {
        ...currentProduct,
        base_price: basePrice,
        price: finalPrice,
      };

      if (isNewProduct) {
        // Generate a unique ID for new products
        const uniqueId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            id: uniqueId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        toast.success('Produto adicionado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProduct.id);
          
        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      }
      
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    }
  };
  
  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação é irreversível.')) {
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
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  return {
    products: filteredProducts,
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
