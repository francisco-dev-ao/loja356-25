
import React from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CartItem = ({ id, name, price, quantity, image }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <div className="h-16 w-16 overflow-hidden rounded bg-gray-100">
        <img 
          src={image} 
          alt={name}
          className="h-full w-full object-cover object-center" 
        />
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="mt-1 text-sm font-medium text-microsoft-blue">
          {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={handleDecrement}
            disabled={quantity <= 1}
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
