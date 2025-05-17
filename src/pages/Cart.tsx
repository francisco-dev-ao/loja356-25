
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useCoupon } from '@/hooks/use-products';
import { ArrowLeft, ArrowRight, ShoppingCart, LogIn, Tag, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, applyCouponDiscount } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { items, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const { data: couponData, isLoading: isLoadingCoupon } = useCoupon(appliedCoupon);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const discountedTotal = React.useMemo(() => {
    if (couponData && !('error' in couponData)) {
      return applyCouponDiscount(
        total,
        couponData.discount_type,
        couponData.discount_value
      );
    }
    return total;
  }, [total, couponData]);

  const discount = total - discountedTotal;

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

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      toast.info('Por favor, faça login para continuar com a compra');
      navigate('/cliente/login', { state: { redirectAfterLogin: '/checkout' } });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom válido');
      return;
    }

    setIsApplyingCoupon(true);

    try {
      // Check if coupon exists
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Cupom não encontrado');
        return;
      }

      // Validate coupon
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      // Check if coupon is within valid date range
      if (validFrom > now) {
        toast.error('Este cupom ainda não está válido');
        return;
      }

      if (validUntil && validUntil < now) {
        toast.error('Este cupom já expirou');
        return;
      }

      // Check if max uses not exceeded
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('Este cupom atingiu o limite de usos');
        return;
      }

      // Apply the coupon
      setAppliedCoupon(couponCode.trim());
      toast.success('Cupom aplicado com sucesso!');
      setCouponCode('');

    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Erro ao aplicar cupom');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Cupom removido');
  };

  const incrementCouponUses = async () => {
    if (!appliedCoupon || !couponData || 'error' in couponData) return;
    
    try {
      await supabase
        .from('coupons')
        .update({ current_uses: (couponData.current_uses || 0) + 1 })
        .eq('id', couponData.id);
    } catch (error) {
      console.error('Error incrementing coupon uses:', error);
    }
  };

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
                      setAppliedCoupon(null);
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
                
                {/* Coupon input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Cupom de Desconto</label>
                  {appliedCoupon ? (
                    <div className="flex items-center bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Tag size={16} className="text-green-600 mr-2" />
                          <span className="font-medium text-green-800">{appliedCoupon}</span>
                        </div>
                        {couponData && !('error' in couponData) && (
                          <span className="text-xs text-green-700 block mt-1">
                            {couponData.discount_type === 'percentage'
                              ? `${couponData.discount_value}% de desconto`
                              : `${formatCurrency(couponData.discount_value)} kz de desconto`}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-8 w-8 p-0"
                      >
                        <X size={16} className="text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Digite o código do cupom"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                      >
                        {isApplyingCoupon ? (
                          <span className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Aplicando...
                          </span>
                        ) : 'Aplicar'}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total)} kz</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>- {formatCurrency(discount)} kz</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de processamento</span>
                    <span>Grátis</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-xl text-microsoft-blue">
                      {formatCurrency(discountedTotal)} kz
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <Button 
                  className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 text-lg py-6"
                  onClick={() => {
                    // Register coupon use when proceeding to checkout
                    if (appliedCoupon && couponData && !('error' in couponData)) {
                      incrementCouponUses();
                    }
                    handleProceedToCheckout();
                  }}
                >
                  {isAuthenticated ? (
                    <span className="flex items-center">
                      Prosseguir para Checkout
                      <ArrowRight size={18} className="ml-2" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Entrar para Comprar
                      <LogIn size={18} className="ml-2" />
                    </span>
                  )}
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
