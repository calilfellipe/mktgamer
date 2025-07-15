-- Corrigir RLS e políticas de segurança para performance e acesso público

-- 1. TABELA PRODUCTS - Permitir leitura pública, restringir ações para logados
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can create own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can view own products" ON public.products;

-- Permitir leitura pública (consulta de produtos ativos)
CREATE POLICY "Public read active products" ON public.products
FOR SELECT
USING (status = 'active');

-- Bloquear insert/update/delete para usuários não logados
CREATE POLICY "Authenticated insert products" ON public.products
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Authenticated update products" ON public.products
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Authenticated delete products" ON public.products
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = seller_id);

-- 2. TABELA USERS - Otimizar políticas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.users;

-- Permitir leitura pública básica (para mostrar vendedores)
CREATE POLICY "Public read user profiles" ON public.users
FOR SELECT
USING (true);

-- Permitir insert/update apenas do próprio perfil
CREATE POLICY "Authenticated manage own profile" ON public.users
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- 3. TABELA CART_ITEMS - Apenas usuários logados
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

-- Políticas otimizadas para carrinho
CREATE POLICY "Authenticated manage own cart" ON public.cart_items
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. TABELA TRANSACTIONS - Apenas usuários logados
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions as buyer" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

-- Políticas otimizadas para transações
CREATE POLICY "Authenticated view own transactions" ON public.transactions
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id);

CREATE POLICY "Authenticated create transactions" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = buyer_id);

CREATE POLICY "Authenticated update transactions" ON public.transactions
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id);

-- 5. TABELA NOTIFICATIONS - Apenas usuários logados
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Políticas otimizadas para notificações
CREATE POLICY "Authenticated manage own notifications" ON public.notifications
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. TABELA WITHDRAWALS - Apenas usuários logados
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON public.withdrawals;

-- Políticas otimizadas para saques
CREATE POLICY "Authenticated manage own withdrawals" ON public.withdrawals
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 7. TABELA CHATS - Apenas usuários logados
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "System can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;

-- Políticas otimizadas para chats
CREATE POLICY "Authenticated manage own chats" ON public.chats
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id)
WITH CHECK ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id);

-- 8. TABELAS STRIPE - Apenas usuários logados
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas do Stripe
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;

-- Políticas otimizadas para Stripe
CREATE POLICY "Authenticated view own stripe data" ON public.stripe_customers
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated view own subscriptions" ON public.stripe_subscriptions
FOR SELECT
TO authenticated
USING (customer_id IN (
  SELECT customer_id FROM stripe_customers 
  WHERE user_id = (SELECT auth.uid())
));

CREATE POLICY "Authenticated view own orders" ON public.stripe_orders
FOR SELECT
TO authenticated
USING (customer_id IN (
  SELECT customer_id FROM stripe_customers 
  WHERE user_id = (SELECT auth.uid())
));

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_highlighted ON products(highlighted) WHERE highlighted = true;
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON products(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(id); -- Para auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_seller ON transactions(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 10. OTIMIZAR FUNÇÃO DE VISIBILIDADE
CREATE OR REPLACE FUNCTION calculate_visibility_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular score baseado na taxa de comissão
  NEW.visibility_score := COALESCE(NEW.commission_rate * 10, 0);
  
  -- Marcar como destacado se taxa >= 20%
  NEW.highlighted := COALESCE(NEW.commission_rate >= 20, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger otimizado
DROP TRIGGER IF EXISTS calculate_product_visibility ON products;
CREATE TRIGGER calculate_product_visibility
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_visibility_score();

-- 11. FUNÇÃO PARA ATUALIZAR TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de timestamp em tabelas relevantes
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. GARANTIR ADMIN MASTER
INSERT INTO users (id, username, email, role, is_verified, balance)
VALUES (
  'admin-master-id',
  'Admin Master',
  'califellipee@outlook.com',
  'admin',
  true,
  0.00
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- Comentários finais
COMMENT ON POLICY "Public read active products" ON products IS 'Permite leitura pública de produtos ativos para carregar a Home';
COMMENT ON POLICY "Authenticated insert products" ON products IS 'Apenas usuários logados podem criar produtos';
COMMENT ON POLICY "Public read user profiles" ON users IS 'Permite leitura pública de perfis para mostrar vendedores';