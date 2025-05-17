
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils';

type Product = {
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
};

const ProductsTable = () => {
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
  
  // Update current product state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'base_price' || name === 'stock' || name === 'discount_value' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Handle select change for discount type
  const handleDiscountTypeChange = (value: string | null) => {
    setCurrentProduct(prev => ({
      ...prev,
      discount_type: value as 'percentage' | 'fixed' | null
    }));
  };

  // Update final price as user changes base price and discount
  useEffect(() => {
    if (currentProduct.base_price) {
      const finalPrice = calculateDiscountedPrice(
        currentProduct.base_price,
        currentProduct.discount_type,
        currentProduct.discount_value
      );
      
      setCurrentProduct(prev => ({
        ...prev,
        price: finalPrice
      }));
    }
  }, [currentProduct.base_price, currentProduct.discount_type, currentProduct.discount_value]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Gerenciar Produtos</h2>
        <Button onClick={handleNewClick} className="bg-green-600 hover:bg-green-700">
          <Plus size={16} className="mr-2" />
          Novo Produto
        </Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço Base</TableHead>
              <TableHead>Preço Final</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded mr-3 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.image || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.base_price ? formatCurrency(product.base_price) : formatCurrency(product.price)} kz
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)} kz</TableCell>
                  <TableCell>
                    {product.discount_type && product.discount_value ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        {product.discount_type === 'percentage' 
                          ? `${product.discount_value}%` 
                          : `${formatCurrency(product.discount_value)} kz`}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sem desconto</span>
                    )}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(product)}
                    >
                      <Pencil size={16} className="mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isNewProduct ? 'Adicionar Produto' : 'Editar Produto'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                Nome do Produto
                <Input
                  name="name"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Nome do produto"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                Descrição
                <Input
                  name="description"
                  value={currentProduct.description}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Descrição do produto"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium">
                Preço Base (kz)
                <Input
                  name="base_price"
                  type="number"
                  value={currentProduct.base_price || 0}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="0.00"
                />
              </label>
              
              <label className="text-sm font-medium">
                Preço Final (kz)
                <Input
                  name="price"
                  type="number"
                  value={currentProduct.price}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Calculado automaticamente</p>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium">
                Tipo de Desconto
                <Select 
                  value={currentProduct.discount_type || ''} 
                  onValueChange={handleDiscountTypeChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo de desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem desconto</SelectItem>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (kz)</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              
              <label className="text-sm font-medium">
                Valor do Desconto
                <Input
                  name="discount_value"
                  type="number"
                  value={currentProduct.discount_value || 0}
                  onChange={handleInputChange}
                  disabled={!currentProduct.discount_type}
                  className="mt-1"
                  placeholder={currentProduct.discount_type === 'percentage' ? "0-100" : "0.00"}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium">
                Categoria
                <Input
                  name="category"
                  value={currentProduct.category}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Categoria do produto"
                />
              </label>
              
              <label className="text-sm font-medium">
                Estoque
                <Input
                  name="stock"
                  type="number"
                  value={currentProduct.stock}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="0"
                />
              </label>
            </div>
              
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                URL da Imagem
                <Input
                  name="image"
                  value={currentProduct.image}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="https://example.com/image.jpg"
                />
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTable;
