import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader, ChevronLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MinusCircle, PlusCircle } from 'lucide-react';
import { useProduct } from '@/hooks/use-products';
import { formatPrice } from '@/lib/formatters';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id || '');
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    setDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (product) {
      // Create a copy of the product with the selected quantity
      const productToAdd = { 
        ...product, 
        quantity 
      };
      addItem(productToAdd);
      setDialogOpen(false);
      navigate('/carrinho');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page py-12 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader className="animate-spin h-12 w-12 text-microsoft-blue mb-4" />
          <p className="text-lg">Carregando produto...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-page py-12">
          <Button variant="ghost" className="flex items-center mb-6" onClick={handleBackClick}>
            <ChevronLeft className="mr-1" size={18} /> Voltar
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Produto não encontrado</h1>
            <p className="mb-6">O produto que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => navigate('/produtos')}>Ver todos os produtos</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <Button variant="ghost" className="flex items-center mb-6" onClick={handleBackClick}>
          <ChevronLeft className="mr-1" size={18} /> Voltar
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-microsoft-light rounded-lg overflow-hidden flex items-center justify-center p-8">
            <img 
              src={`/images/${product.image}`} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain" 
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-2 py-1 rounded bg-microsoft-light text-microsoft-blue text-sm mb-2">
                {product.category}
              </span>
              <h1 className="text-3xl font-heading font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-microsoft-blue mb-4">
                {formatPrice(product.price)}
              </p>
              <div className="border-t border-b py-4 my-4">
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <span className={`mr-2 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? '● Em estoque' : '● Sem estoque'}
                </span>
                {product.stock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({product.stock} disponíveis)
                  </span>
                )}
              </div>

              <Button 
                className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2" size={18} />
                Adicionar ao carrinho
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informações importantes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Produto 100% original e licenciado pela Microsoft</li>
                  <li>• Ativação online diretamente no site da Microsoft</li>
                  <li>• Suporte técnico gratuito por 12 meses</li>
                  <li>• Entrega imediata por e-mail após confirmação do pagamento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Cart Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar ao Carrinho</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4 items-center">
                  <div className="h-20 w-20 overflow-hidden rounded bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-full w-full object-cover object-center" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-microsoft-blue font-bold">
                      {formatPrice(product.price)}
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
                    disabled={quantity >= product.stock}
                  >
                    <PlusCircle size={20} />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-microsoft-blue font-bold">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
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
    </Layout>
  );
};

export default ProductDetail;
