import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/models/product';
import { formatPrice, parseFormattedNumber } from '@/lib/formatters';
import { calculateDiscountedPrice } from '@/lib/utils';

interface ProductEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  isNewProduct: boolean;
}

export const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  setProduct,
  isNewProduct,
}) => {
  // Handle price inputs - modified to properly handle decimal separators
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Allow empty input
    if (value === '') {
      setProduct(prev => ({
        ...prev,
        [name]: ''
      }));
      return;
    }
    
    // Only allow digits, commas, and periods
    if (!/^[0-9.,]+$/.test(value) && value !== '') {
      return;
    }
    
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle other input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields that aren't prices
    if (name === 'stock' || name === 'discount_value') {
      setProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || 0
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle select change for discount type
  const handleDiscountTypeChange = (value: string | null) => {
    setProduct(prev => ({
      ...prev,
      discount_type: value as 'percentage' | 'fixed' | null
    }));
  };

  // Update final price when base price or discount changes
  useEffect(() => {
    if (product.base_price) {
      const basePrice = typeof product.base_price === 'string' 
        ? parseFormattedNumber(product.base_price as unknown as string)
        : product.base_price;
        
      const finalPrice = calculateDiscountedPrice(
        basePrice,
        product.discount_type,
        product.discount_value
      );
      
      setProduct(prev => ({
        ...prev,
        price: finalPrice
      }));
    }
  }, [product.base_price, product.discount_type, product.discount_value, setProduct]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                value={product.name}
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
                value={product.description}
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
                value={product.base_price as string | number}
                onChange={handlePriceInputChange}
                className="mt-1"
                placeholder="0,00"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: 1.000,00</p>
            </label>
            
            <label className="text-sm font-medium">
              Preço Final (kz)
              <Input
                name="price"
                value={typeof product.price === 'number' ? formatPrice(product.price).replace(' kz', '') : product.price}
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
                value={product.discount_type || 'none'} 
                onValueChange={handleDiscountTypeChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem desconto</SelectItem>
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
                value={product.discount_value || ''}
                onChange={handleInputChange}
                disabled={!product.discount_type}
                className="mt-1"
                placeholder={product.discount_type === 'percentage' ? "0-100" : "0,00"}
              />
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium">
              Categoria
              <Input
                name="category"
                value={product.category}
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
                value={product.stock}
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
                value={product.image}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
