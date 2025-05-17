
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
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
      setProducts(data || []);
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
      if (isNewProduct) {
        // Generate a unique ID for new products
        const uniqueId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('products')
          .insert({
            ...currentProduct,
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
            ...currentProduct,
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
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    }));
  };
  
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
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
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
                  <TableCell>{formatCurrency(product.price)} kz</TableCell>
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
                <TableCell colSpan={5} className="text-center py-10">
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
                Preço (kz)
                <Input
                  name="price"
                  type="number"
                  value={currentProduct.price}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="0.00"
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
