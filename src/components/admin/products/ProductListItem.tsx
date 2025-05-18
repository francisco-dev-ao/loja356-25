
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { Product } from '@/models/product';

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, onEdit, onDelete }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded mr-3 overflow-hidden flex-shrink-0">
            <img 
              src={product.image || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {product.description}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>
        {product.base_price ? formatPrice(product.base_price) : formatPrice(product.price)}
      </TableCell>
      <TableCell>{formatPrice(product.price)}</TableCell>
      <TableCell>
        {product.discount_type && product.discount_value ? (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            {product.discount_type === 'percentage' 
              ? `${product.discount_value}%` 
              : formatPrice(product.discount_value)}
          </span>
        ) : (
          <span className="text-gray-400">Sem desconto</span>
        )}
      </TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(product)}
        >
          <Pencil size={16} className="mr-1" />
          Editar
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-600"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 size={16} className="mr-1" />
          Excluir
        </Button>
      </TableCell>
    </TableRow>
  );
};
