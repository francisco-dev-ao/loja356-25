
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/hooks/use-cart';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page py-12">
          <h1 className="text-3xl font-heading font-bold mb-8">Seu Carrinho</h1>
          <div className="py-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-dashed border-gray-300 rounded-full">
              <ShoppingCart size={36} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-3">Seu carrinho está vazio</h2>
            <p className="mb-6 text-muted-foreground">
              Parece que você ainda não adicionou nenhum produto ao carrinho
            </p>
            <Button onClick={() => navigate('/produtos')}>
              Ver Produtos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Seu Carrinho</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                  />
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/produtos')}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Continue comprando
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
                      clearCart();
                    }
                  }}
                >
                  Limpar carrinho
                </Button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-6">Resumo do Pedido</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{total.toLocaleString('pt-AO')} kz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de processamento</span>
                    <span>Grátis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-xl text-microsoft-blue">
                      {total.toLocaleString('pt-AO')} kz
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <Button 
                  className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 text-lg py-6"
                  onClick={() => navigate('/checkout')}
                >
                  <span className="flex items-center">
                    Prosseguir para Checkout
                    <ArrowRight size={18} className="ml-2" />
                  </span>
                </Button>
                
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Pagamentos processados com segurança</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
