import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useCoupon } from '@/hooks/use-products';
import { ArrowLeft, ArrowRight, ShoppingCart, LogIn, Tag, Check, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';

const Cart = () => {
  const { items, total, finalTotal, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(appliedCoupon?.code || null);
  const { data: couponData, isLoading: isLoadingCoupon } = useCoupon(appliedCouponCode);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const discount = total - finalTotal;
  const discountPercentage = discount > 0 ? Math.round((discount / total) * 100) : 0;

  if (items?.length === 0) {
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
      setShowAuth(true);
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
      applyCoupon(couponCode.trim(), data.discount_type as 'percentage' | 'fixed', data.discount_value);
      setAppliedCouponCode(couponCode.trim());
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
    removeCoupon();
    setAppliedCouponCode(null);
    toast.info('Cupom removido');
  };

  const incrementCouponUses = async () => {
    if (!appliedCouponCode || !couponData || 'error' in couponData) return;
    
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container-page py-12">
          {/* Header com animação */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-microsoft-blue to-blue-600 bg-clip-text text-transparent">
              Seu Carrinho
            </h1>
            <p className="text-muted-foreground text-lg">Revise seus produtos e finalize sua compra</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Melhorado */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card principal dos itens */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-microsoft-blue/10 shadow-xl overflow-hidden hover-scale">
                <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <ShoppingCart className="mr-3" size={24} />
                    Produtos Selecionados ({items?.length || 0})
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {items?.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="animate-fade-in hover-scale transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CartItem
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        quantity={item.quantity}
                        image={item.image}
                        base_price={item.base_price}
                        discount_type={item.discount_type}
                        discount_value={item.discount_value}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Ações do carrinho */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 flex flex-col sm:flex-row justify-between gap-4 border-t border-microsoft-blue/10">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/produtos')}
                    className="flex items-center hover-scale text-microsoft-blue hover:bg-microsoft-blue/10"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Continue comprando
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover-scale"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
                        clearCart();
                        setAppliedCouponCode(null);
                        toast.success('Carrinho esvaziado com sucesso!');
                      }
                    }}
                  >
                    Limpar carrinho
                  </Button>
                </div>
              </div>

              {/* Seção de autenticação melhorada */}
              {showAuth && !isAuthenticated && (
                <div className="animate-fade-in bg-gradient-to-br from-microsoft-blue/5 via-white to-blue-50/50 rounded-3xl border-2 border-microsoft-blue/20 shadow-2xl overflow-hidden backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-6">
                    <div className="flex items-center text-white">
                      <div className="bg-white/20 p-3 rounded-full mr-4">
                        <User size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Autenticação ou Acesso à Conta</h2>
                        <p className="text-blue-100 mt-1">Entre ou crie sua conta para continuar</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6 bg-microsoft-blue/10 border border-microsoft-blue/20 rounded-xl h-12">
                        <TabsTrigger 
                          value="login" 
                          className="rounded-lg data-[state=active]:bg-microsoft-blue data-[state=active]:text-white font-semibold"
                        >
                          Login
                        </TabsTrigger>
                        <TabsTrigger 
                          value="register" 
                          className="rounded-lg data-[state=active]:bg-microsoft-blue data-[state=active]:text-white font-semibold"
                        >
                          Cadastrar
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="mt-6 animate-fade-in">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-microsoft-blue/10">
                          <LoginForm redirectAfter={false} />
                        </div>
                      </TabsContent>
                      <TabsContent value="register" className="mt-6 animate-fade-in">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-microsoft-blue/10">
                          <RegisterForm redirectAfter={false} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
            
            {/* Resumo do pedido melhorado */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-microsoft-blue/20 shadow-2xl overflow-hidden sticky top-24 hover-scale">
                {/* Header do resumo */}
                <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Tag className="mr-3" size={20} />
                    Resumo do Pedido
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Seção de cupom melhorada */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Cupom de Desconto</label>
                    {appliedCoupon ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 animate-scale-in">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="bg-green-500 p-1 rounded-full mr-3">
                                <Check size={14} className="text-white" />
                              </div>
                              <span className="font-bold text-green-800">{appliedCoupon.code}</span>
                            </div>
                            <span className="text-sm text-green-700 font-medium">
                              {appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discountValue}% de desconto`
                                : `${formatPrice(appliedCoupon.discountValue)} de desconto`}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleRemoveCoupon}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Digite o código do cupom"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="border-microsoft-blue/30 focus:border-microsoft-blue focus:ring-microsoft-blue/20"
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                        </div>
                        <Button 
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                          className="bg-microsoft-blue hover:bg-microsoft-blue/90 hover-scale"
                        >
                          {isApplyingCoupon ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Aplicando...
                            </div>
                          ) : 'Aplicar'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Detalhes do preço melhorados */}
                  <div className="space-y-4 pt-4 border-t border-microsoft-blue/10">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatPrice(total)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3 animate-fade-in">
                        <span className="flex items-center text-green-700 font-medium">
                          Desconto 
                          <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white animate-pulse">
                            {discountPercentage}%
                          </Badge>
                        </span>
                        <span className="text-green-700 font-bold">- {formatPrice(discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Taxa de processamento</span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                    
                    <div className="border-t-2 border-microsoft-blue/20 pt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-microsoft-blue to-blue-600 bg-clip-text text-transparent">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Botão de checkout melhorado */}
                <div className="p-6 border-t border-microsoft-blue/10 bg-gradient-to-r from-gray-50 to-blue-50/30">
                  {isAuthenticated ? (
                    <Button 
                      className="w-full bg-gradient-to-r from-microsoft-blue to-blue-600 hover:from-microsoft-blue/90 hover:to-blue-600/90 text-white text-lg py-6 rounded-xl shadow-lg hover-scale transition-all duration-300"
                      onClick={() => {
                        if (appliedCouponCode && couponData && !('error' in couponData)) {
                          incrementCouponUses();
                        }
                        navigate('/checkout');
                      }}
                    >
                      <span className="flex items-center justify-center">
                        Prosseguir com a Compra
                        <ArrowRight size={20} className="ml-2" />
                      </span>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-microsoft-blue to-blue-600 hover:from-microsoft-blue/90 hover:to-blue-600/90 text-white text-lg py-6 rounded-xl shadow-lg hover-scale transition-all duration-300"
                      onClick={handleProceedToCheckout}
                    >
                      <span className="flex items-center justify-center">
                        {showAuth ? "Complete a autenticação acima" : "Entrar para Comprar"}
                        <LogIn size={20} className="ml-2" />
                      </span>
                    </Button>
                  )}
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="bg-green-100 p-1 rounded-full mr-2">
                        <Check size={12} className="text-green-600" />
                      </div>
                      Pagamentos processados com segurança
                    </div>
                  </div>
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
