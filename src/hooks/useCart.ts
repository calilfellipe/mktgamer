import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar carrinho do Supabase quando usuário logar
  useEffect(() => {
    if (user) {
      loadCartFromSupabase();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCartFromSupabase = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🛒 Carregando carrinho do usuário:', user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            seller:users(id, username, avatar_url, is_verified)
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao carregar carrinho:', error);
        return;
      }

      console.log('✅ Carrinho carregado:', data?.length || 0, 'itens');

      const cartItems = data?.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          description: item.product.description,
          price: item.product.price,
          category: item.product.category,
          game: item.product.game,
          images: Array.isArray(item.product.images) ? item.product.images : [],
          seller: {
            id: item.product.seller?.id || '',
            username: item.product.seller?.username || 'Vendedor',
            email: '',
            avatar: item.product.seller?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            reputation: 4.8,
            verified: item.product.seller?.is_verified || false,
            plan: 'pro',
            totalSales: 0,
            joinDate: new Date().toISOString()
          },
          featured: false,
          condition: 'excellent' as const,
          tags: [],
          createdAt: item.product.created_at
        },
        quantity: item.quantity
      })) || [];

      setItems(cartItems);
    } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(async (product: Product) => {
    if (!user) {
      alert('Você precisa estar logado para adicionar ao carrinho');
      return;
    }

    try {
      console.log('➕ Adicionando produto ao carrinho:', product.title);
      
      // Verificar se o produto já está no carrinho
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
        console.log('✅ Quantidade atualizada no carrinho');
      } else {
        // Adicionar novo item
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          }]);

        if (error) throw error;
        console.log('✅ Produto adicionado ao carrinho');
      }

      // Recarregar carrinho
      await loadCartFromSupabase();
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar produto ao carrinho');
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      console.log('🗑️ Removendo produto do carrinho:', productId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Atualizar estado local
      setItems(prev => prev.filter(item => item.product.id !== productId));
      console.log('✅ Produto removido do carrinho');
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
    }
  }, [user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      console.log('🔄 Atualizando quantidade:', productId, quantity);
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Atualizar estado local
      setItems(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
      console.log('✅ Quantidade atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
    }
  }, [user, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🧹 Limpando carrinho');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      console.log('✅ Carrinho limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
    }
  }, [user]);

  const checkout = useCallback(async () => {
    if (!user || items.length === 0) return false;

    try {
      setIsLoading(true);
      console.log('💳 Iniciando checkout com', items.length, 'itens');

      // Criar transações para cada item
      const transactions = [];
      
      for (const item of items) {
        console.log('💰 Criando transação para:', item.product.title);
        
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert([{
            buyer_id: user.id,
            seller_id: item.product.seller.id,
            product_id: item.product.id,
            amount: item.product.price * item.quantity,
            status: 'escrow'
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar transação:', error);
          throw error;
        }
        
        transactions.push(transaction);
        console.log('✅ Transação criada:', transaction.id);

        // Criar notificação para o vendedor
        await supabase
          .from('notifications')
          .insert([{
            user_id: item.product.seller.id,
            content: `Nova venda! Produto "${item.product.title}" vendido por R$ ${(item.product.price * item.quantity).toFixed(2)}`,
            type: 'sale',
            is_read: false
          }]);

        // Criar notificação para o comprador
        await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            content: `Compra realizada! Produto "${item.product.title}" adquirido por R$ ${(item.product.price * item.quantity).toFixed(2)}`,
            type: 'purchase',
            is_read: false
          }]);
      }

      // Limpar carrinho após sucesso
      await clearCart();

      console.log('🎉 Checkout realizado com sucesso:', transactions.length, 'transações');
      return true;
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert('Erro ao finalizar compra. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, items, clearCart]);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isOpen,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    toggleCart,
    total,
    itemCount
  };
}