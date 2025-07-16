/*
  # Corrigir RLS e políticas de segurança para performance e acesso público

  1. Tabela Products
    - Permitir leitura pública de produtos ativos
    - Restringir modificações apenas para donos autenticados
    - Otimizar performance das políticas RLS

  2. Tabela Users  
    - Permitir leitura própria apenas
    - Otimizar consultas de autenticação

  3. Outras tabelas
    - Ajustar políticas para melhor performance
    - Evitar consultas desnecessárias
*/

-- =============================================
-- 1. TABELA PRODUCTS - Acesso público otimizado
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Public read" ON public.products;
DROP POLICY IF EXISTS "Authenticated insert" ON public.products;
DROP POLICY IF EXISTS "Authenticated update" ON public.products;
DROP POLICY IF EXISTS "Authenticated delete" ON public.products;

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (apenas produtos ativos)
CREATE POLICY "Public read active products" ON public.products
FOR SELECT
TO public
USING (status = 'active');

-- Política de inserção (apenas usuários autenticados)
CREATE POLICY "Users can insert own products" ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Política de atualização (apenas dono do produto)
CREATE POLICY "Users can update own products" ON public.products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Política de exclusão (apenas dono do produto)
CREATE POLICY "Users can delete own products" ON public.products
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- =============================================
-- 2. TABELA USERS - Otimizar autenticação
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.users;

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política otimizada para leitura própria
CREATE POLICY "Users can read own data" ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para inserção (criação de perfil)
CREATE POLICY "Users can create own profile" ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para atualização própria
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================
-- 3. TABELA CART_ITEMS - Otimizar carrinho
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

-- Política única para todas as operações do carrinho
CREATE POLICY "Users manage own cart" ON public.cart_items
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. TABELA TRANSACTIONS - Otimizar transações
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions as buyer" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

-- Política para visualizar transações próprias
CREATE POLICY "Users view own transactions" ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Política para criar transações (apenas como comprador)
CREATE POLICY "Users create transactions as buyer" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Política para atualizar transações próprias
CREATE POLICY "Users update own transactions" ON public.transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- =============================================
-- 5. TABELA NOTIFICATIONS - Otimizar notificações
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Política para visualizar notificações próprias
CREATE POLICY "Users view own notifications" ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para atualizar notificações próprias (marcar como lida)
CREATE POLICY "Users update own notifications" ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Política para sistema criar notificações
CREATE POLICY "System creates notifications" ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- 6. TABELA WITHDRAWALS - Otimizar saques
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON public.withdrawals;

-- Política para visualizar saques próprios
CREATE POLICY "Users view own withdrawals" ON public.withdrawals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para criar saques próprios
CREATE POLICY "Users create own withdrawals" ON public.withdrawals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 7. TABELA CHATS - Otimizar chats
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "System can create chats" ON public.chats;

-- Política para visualizar chats próprios
CREATE POLICY "Users view own chats" ON public.chats
FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Política para atualizar chats próprios
CREATE POLICY "Users update own chats" ON public.chats
FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Política para criar chats
CREATE POLICY "Users create chats" ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- =============================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para produtos (consultas públicas)
CREATE INDEX IF NOT EXISTS idx_products_status_active ON public.products (status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_highlighted ON public.products (highlighted, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products (category, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_game_active ON public.products (game, status) WHERE status = 'active';

-- Índices para autenticação
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- Índices para carrinho
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart_items (user_id);

-- Índices para transações
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.transactions (seller_id);

-- =============================================
-- 9. GARANTIR ADMIN MASTER
-- =============================================

-- Garantir que califellipee@outlook.com seja admin
INSERT INTO public.users (id, username, email, role, is_verified, balance)
VALUES (
  gen_random_uuid(),
  'califellipee',
  'califellipee@outlook.com',
  'admin',
  true,
  0.00
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  is_verified = true,
  updated_at = now();

-- =============================================
-- 10. FUNÇÕES AUXILIARES PARA PERFORMANCE
-- =============================================

-- Função para verificar se usuário é dono do produto
CREATE OR REPLACE FUNCTION is_product_owner(product_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM products 
    WHERE id = product_id AND seller_id = user_id
  );
$$;

-- Função para verificar se usuário participa da transação
CREATE OR REPLACE FUNCTION is_transaction_participant(transaction_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM transactions 
    WHERE id = transaction_id AND (buyer_id = user_id OR seller_id = user_id)
  );
$$;