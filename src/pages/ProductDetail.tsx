
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, MinusCircle, PlusCircle } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import products from '@/data/products';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return (
      <Layout>
        <div className="container-page py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/produtos')}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar para produtos
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    setDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
    const productWithQuantity = { ...product, quantity };
    addItem(productWithQuantity);
    setDialogOpen(false);
    navigate('/carrinho');
  };

  return (
    <Layout>
      <div className="container-page py-12">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-gray-100" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-microsoft-light rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain" 
              style={{ maxHeight: '400px' }}
            />
          </div>
          
          {/* Product Info */}
          <div>
            <span className="inline-block bg-microsoft-light text-microsoft-blue px-3 py-1 rounded-full text-sm mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-heading font-bold mb-3">{product.name}</h1>
            <div className="mb-6">
              <span className="text-3xl font-bold text-microsoft-blue">
                {Number(product.price).toLocaleString('pt-AO')} kz
              </span>
              <span className="text-sm text-muted-foreground ml-2">por licença</span>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Licença perpétua (pagamento único)</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Entrega digital imediata</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Garantia de autenticidade</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Suporte técnico por 30 dias</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-microsoft-blue hover:bg-microsoft-blue/90"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} className="mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleAddToCart}
              >
                Comprar Agora
              </Button>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-semibold mb-6">Informações Adicionais</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Requisitos do Sistema</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Sistema operacional: Windows 10 ou posterior</li>
                  <li>• Processador: 1.6 GHz ou superior</li>
                  <li>• RAM: 4 GB mínimo</li>
                  <li>• Espaço em disco: 4 GB</li>
                  <li>• Resolução: 1280 x 768</li>
                </ul>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Detalhes da Licença</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Tipo: Licença digital</li>
                  <li>• Usuários: 1 por licença</li>
                  <li>• Ativação: Online</li>
                  <li>• Garantia: 30 dias</li>
                  <li>• Suporte: Email e telefone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    {Number(product.price).toLocaleString('pt-AO')} kz
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
                  {(product.price * quantity).toLocaleString('pt-AO')} kz
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

    </Layout>
  );
};

export default ProductDetail;
