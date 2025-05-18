import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { ProductListItem } from './ProductListItem';
import { ProductEditDialog } from './ProductEditDialog';
import { useProducts } from '@/hooks/admin/useProducts';

const ProductsTable = () => {
  const {
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
  } = useProducts();
  
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
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductListItem 
                  key={product.id}
                  product={product}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleActive}
                />
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
      
      <ProductEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveProduct}
        product={currentProduct}
        setProduct={setCurrentProduct}
        isNewProduct={isNewProduct}
      />
    </div>
  );
};

export default ProductsTable;
