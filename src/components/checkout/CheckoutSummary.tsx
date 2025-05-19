
import React from 'react';
import { formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CartItem } from '@/hooks/cart/cart-types';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
}

const CheckoutSummary = ({ items, total }: CheckoutSummaryProps) => {
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Resumo do Pedido</h3>
          <Badge variant="outline" className="text-xs px-2 py-1 rounded">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
        
        <div className="max-h-64 overflow-y-auto mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex-shrink-0 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Qtd: {item.quantity}
                  </span>
                  <span className="text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
                {item.base_price && item.base_price > item.price && (
                  <div className="mt-1">
                    <Badge variant="destructive" className="text-xs">
                      -{Math.round(((item.base_price - item.price) / item.base_price) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de processamento</span>
            <span>Grátis</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="text-xl text-microsoft-blue">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutSummary;
