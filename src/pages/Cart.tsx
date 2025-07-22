import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/formatters';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, finalTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-6">Adicione alguns produtos ao seu carrinho para continuar.</p>
            <Button asChild>
              <Link to="/products">Ver Produtos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <Button asChild className="w-full mt-6">
              <Link to="/checkout">Finalizar Compra</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}