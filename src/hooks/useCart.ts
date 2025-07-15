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
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadCartFromSupabase = async () => {
      if (!user || hasLoaded || !isMounted) return;

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

        if (!isMounted) return;

        if (error) {
          console.error('❌ Erro ao carregar carrinho:', error);
          setItems([]);
        } else {
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
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Erro ao carregar carrinho:', error);
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    if (user) {
      loadCartFromSupabase();
    } else {
      setItems([]);
      setHasLoaded(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]); // Only depend on user

  const addToCart = useCallback(async (product: Product) => {
    if (!user) {
      console.log('⚠️ Usuário não logado - redirecionando para login');
      return;
    }

    try {
      console.log('➕ Adicionando produto ao carrinho:', product.title);
      
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
        console.log('✅ Quantidade atualizada no carrinho');
      } else {
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

      // Reload cart
      setHasLoaded(false);
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
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
      console.log('💳 Iniciando checkout Stripe com', items.length, 'itens');

      const cartItems = items.map(item => ({
        id: item.product.id,
        seller_id: item.product.seller.id,
        title: item.product.title,
        description: item.product.description,
        price: item.product.price,
        quantity: item.quantity,
        images: item.product.images,
        game: item.product.game,
        category: item.product.category
      }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          items: cartItems,
          buyerId: user.id,
          successUrl: `${window.location.origin}/checkout-success`,
          cancelUrl: `${window.location.origin}/checkout-cancel`
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      window.location.href = session.url;
      return true;
    } catch (error: any) {
      console.error('❌ Erro no checkout:', error);
      alert(`Erro ao processar pagamento: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, items]);

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