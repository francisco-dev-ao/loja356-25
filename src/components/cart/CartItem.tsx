import React from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  base_price?: number | null;
  discount_type?: 'percentage' | 'fixed' | null;
  discount_value?: number | null;
}

const CartItem = ({ 
  id, 
  name, 
  price, 
  quantity, 
  image,
  base_price,
  discount_type,
  discount_value
}: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      if (confirm('Deseja remover este item do carrinho?')) {
        removeItem(id);
      }
    }
  };

  // Calculate discount percentage if available
  const hasDiscount = base_price && base_price > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((base_price - price) / base_price) * 100) 
    : null;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <div className="h-12 w-12 overflow-hidden rounded bg-gray-100">
        <img 
          src={image} 
          alt={name}
          className="h-full w-full object-cover object-center" 
        />
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-medium">{name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm font-medium text-microsoft-blue">
            {formatPrice(price)}
          </p>
          
          {hasDiscount && (
            <>
              <p className="text-xs line-through text-gray-500">
                {formatPrice(base_price)}
              </p>
              <Badge variant="destructive" className="text-xs">
                -{discountPercentage}%
              </Badge>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={handleDecrement}
          >
            <Minus size={14} />
          </Button>
          
          <span className="w-8 text-center text-sm">
            {quantity}
          </span>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={handleIncrement}
          >
            <Plus size={14} />
          </Button>
        </div>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => removeItem(id)}
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
