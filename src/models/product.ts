
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price: number | null;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  image: string;
  category: string;
  stock: number;
};
