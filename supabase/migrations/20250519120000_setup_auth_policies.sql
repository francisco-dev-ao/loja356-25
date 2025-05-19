-- Ativar RLS em todas as tabelas necessárias
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE multicaixa_express_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para profiles: usuários podem ver seus próprios perfis, admins podem ver todos
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- Política para orders: usuários podem ver seus próprios pedidos, admins podem ver todos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL
  USING (is_admin(auth.uid()));

-- Política para order_items: usuários podem ver seus próprios itens, admins podem ver todos
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
  ));

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL
  USING (is_admin(auth.uid()));

-- Política para settings: apenas admins podem gerenciar
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Public can view settings" ON settings
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Política para multicaixa_express_config: apenas admins podem gerenciar
CREATE POLICY "Admins can manage multicaixa config" ON multicaixa_express_config
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "All users can view multicaixa config" ON multicaixa_express_config
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Política para products: admins podem gerenciar, todos podem ver produtos ativos
CREATE POLICY "Admins can manage products" ON products
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Public can view active products" ON products
  FOR SELECT
  TO PUBLIC
  USING (active = true);
