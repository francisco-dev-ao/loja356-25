
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const ProductGrid = ({ products, title }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedProduct) {
      const productWithQuantity = { ...selectedProduct, quantity };
      addItem(productWithQuantity);
      setDialogOpen(false);
      navigate('/carrinho');
    }
  };

  return (
    <div>
      {title && <h2 className="text-2xl font-heading font-semibold mb-6">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar ao Carrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProduct && (
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4 items-center">
                  <div className="h-20 w-20 overflow-hidden rounded bg-gray-100">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover object-center" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedProduct.name}</h4>
                    <p className="text-microsoft-blue font-bold">
                      {Number(selectedProduct.price).toLocaleString('pt-AO')} kz
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <MinusCircle size={20} />
                  </Button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <PlusCircle size={20} />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-microsoft-blue font-bold">
                    {(selectedProduct.price * quantity).toLocaleString('pt-AO')} kz
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-microsoft-blue hover:bg-microsoft-blue/90" 
              onClick={handleConfirmAddToCart}
            >
              Adicionar e ir para o carrinho
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductGrid;
