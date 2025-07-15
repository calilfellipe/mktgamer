/*
  # Corrigir RLS para acesso público aos produtos

  1. Configurar RLS otimizado
    - Permitir leitura pública de produtos ativos
    - Restringir insert/update/delete para usuários logados
    - Otimizar performance das políticas

  2. Ajustar tabelas relacionadas
    - stripe_customers: apenas usuário logado vê próprios dados
    - stripe_subscriptions: apenas usuário logado vê próprios dados
*/

-- =============================================
-- TABELA PRODUCTS - Acesso público para leitura
-- =============================================

-- Habilitar RLS (Row Level Security) na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (consulta de produtos ativos)
DROP POLICY IF EXISTS "Public read" ON public.products;
CREATE POLICY "Public read" ON public.products
FOR SELECT
USING (status = 'active');

-- Bloquear insert/update/delete para usuários não logados
DROP POLICY IF EXISTS "Authenticated insert" ON public.products;
CREATE POLICY "Authenticated insert" ON public.products
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Authenticated update" ON public.products;
CREATE POLICY "Authenticated update" ON public.products
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Authenticated delete" ON public.products;
CREATE POLICY "Authenticated delete" ON public.products
FOR DELETE
TO authenticated
USING ((select auth.uid()) = seller_id);

-- Remover políticas antigas que podem causar conflito
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can create own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can view own products" ON public.products;

-- =============================================
-- TABELA USERS - Apenas dados próprios
-- =============================================

-- Garantir que users tem RLS ativo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários vejam apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

-- Permitir que usuários atualizem apenas seus próprios dados
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Permitir inserção de perfil (para novos usuários)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- TABELAS STRIPE - Apenas dados próprios
-- =============================================

-- Para stripe_customers (somente usuários logados podem ver o próprio customer)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated view" ON public.stripe_customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can view their own customer data" ON public.stripe_customers
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

-- Para stripe_subscriptions (somente logados)
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated view" ON public.stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data" ON public.stripe_subscriptions
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
  ) AND deleted_at IS NULL
);

-- Para stripe_orders (somente logados)
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;
CREATE POLICY "Users can view their own order data" ON public.stripe_orders
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
  ) AND deleted_at IS NULL
);

-- =============================================
-- OUTRAS TABELAS - Apenas dados próprios
-- =============================================

-- Cart items - apenas próprios itens
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart" ON public.cart_items
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Transactions - apenas próprias transações
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Users can create transactions as buyer" ON public.transactions;
CREATE POLICY "Users can create transactions as buyer" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

-- Notifications - apenas próprias notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id);

-- Sistema pode criar notificações
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Withdrawals - apenas próprios saques
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can create own withdrawals" ON public.withdrawals
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Chats - apenas próprios chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
CREATE POLICY "Users can view own chats" ON public.chats
FOR SELECT
TO authenticated
USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
CREATE POLICY "Users can update own chats" ON public.chats
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "System can create chats" ON public.chats;
CREATE POLICY "System can create chats" ON public.chats
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para otimizar consultas públicas de produtos
CREATE INDEX IF NOT EXISTS idx_products_public_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_public_highlighted ON products(highlighted, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_public_visibility ON products(visibility_score DESC, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_public_game ON products(game, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_public_category ON products(category, status) WHERE status = 'active';

-- Índices para auth.uid() otimização
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(id);
CREATE INDEX IF NOT EXISTS idx_products_seller_auth ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_auth ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_auth ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_auth ON transactions(seller_id);