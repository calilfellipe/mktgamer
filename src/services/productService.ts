import { supabase } from '../lib/supabase';
import { ErrorHandler } from './errorHandler';

export class ProductService {
  // Buscar produtos ativos (PÚBLICO - sem autenticação)
  static async getActiveProducts(filters: {
    category?: string;
    game?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    highlighted?: boolean;
  } = {}) {
    return ErrorHandler.withRetry(async () => {
      console.log('🔍 Buscando produtos ativos (público)...');
      
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users(id, username, avatar_url, is_verified)
        `)
        .eq('status', 'active')
        .order('visibility_score', { ascending: false })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.game) {
        query = query.eq('game', filters.game);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.highlighted) {
        query = query.eq('highlighted', true);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        throw new Error(ErrorHandler.handleSupabaseError(error));
      }

      console.log('✅ Produtos carregados:', data?.length || 0);
      return data || [];
    });
  }

  // Buscar produtos em destaque (PÚBLICO)
  static async getFeaturedProducts(limit = 8) {
    return this.getActiveProducts({
      highlighted: true,
      limit
    });
  }

  // Criar produto (REQUER AUTENTICAÇÃO)
  static async createProduct(productData: {
    seller_id: string;
    title: string;
    description: string;
    category: 'account' | 'skin' | 'service' | 'giftcard';
    game: string;
    price: number;
    images: string[];
    rarity?: string;
    level?: number;
    delivery_time: number;
    commission_rate: number;
  }) {
    return ErrorHandler.withRetry(async () => {
      console.log('📝 Criando produto...');
      
      // Determinar se deve ser destacado (taxa >= 20%)
      const highlighted = productData.commission_rate >= 20;
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          status: 'active',
          highlighted,
          visibility_score: productData.commission_rate * 10 // Score baseado na taxa
        }])
        .select(`
          *,
          seller:users(*)
        `)
        .single();

      if (error) {
        console.error('❌ Erro ao criar produto:', error);
        throw new Error(ErrorHandler.handleSupabaseError(error));
      }

      console.log('✅ Produto criado:', data.id);
      return data;
    });
  }

  // Buscar meus produtos (REQUER AUTENTICAÇÃO)
  static async getMyProducts(sellerId: string) {
    return ErrorHandler.withRetry(async () => {
      console.log('📦 Buscando meus produtos...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar meus produtos:', error);
        throw new Error(ErrorHandler.handleSupabaseError(error));
      }

      console.log('✅ Meus produtos carregados:', data?.length || 0);
      return data || [];
    });
  }

  // Atualizar produto (REQUER AUTENTICAÇÃO)
  static async updateProduct(productId: string, updates: any) {
    return ErrorHandler.withRetry(async () => {
      console.log('🔄 Atualizando produto:', productId);
      
      // Se atualizando commission_rate, recalcular highlighted
      if (updates.commission_rate !== undefined) {
        updates.highlighted = updates.commission_rate >= 20;
        updates.visibility_score = updates.commission_rate * 10;
      }
      
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        throw new Error(ErrorHandler.handleSupabaseError(error));
      }

      console.log('✅ Produto atualizado');
      return data;
    });
  }

  // Deletar produto (REQUER AUTENTICAÇÃO)
  static async deleteProduct(productId: string) {
    return ErrorHandler.withRetry(async () => {
      console.log('🗑️ Removendo produto:', productId);
      
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'removed',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('❌ Erro ao remover produto:', error);
        throw new Error(ErrorHandler.handleSupabaseError(error));
      }

      console.log('✅ Produto removido');
      return true;
    });
  }
}