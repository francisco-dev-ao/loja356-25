
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart, Product } from '@/hooks/use-cart';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <Card className="card-hover overflow-hidden">
      <CardHeader className="p-0">
        <div className="h-48 overflow-hidden bg-microsoft-light">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" 
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <CardTitle className="mb-2 text-lg">{product.name}</CardTitle>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span className="text-sm bg-microsoft-light px-2 py-1 rounded">{product.category}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link to={`/produtos/${product.id}`} className="text-microsoft-blue hover:underline text-sm">
          Ver detalhes
        </Link>
        <Button 
          onClick={() => addItem(product)} 
          variant="default" 
          size="sm" 
          className="bg-microsoft-blue hover:bg-microsoft-blue/90"
        >
          <ShoppingCart size={16} className="mr-1" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
