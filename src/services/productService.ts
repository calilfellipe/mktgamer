import { supabase } from '../lib/supabase';

export class ProductService {
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
    try {
      // Calculate visibility score based on commission rate
      const visibility_score = Math.floor(productData.commission_rate * 10);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          visibility_score,
          status: 'active' // Produtos são aprovados automaticamente por enquanto
        }])
        .select(`
          *,
          seller:users(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getProducts(filters: {
    category?: string;
    game?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    limit?: number;
  } = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users(id, username, avatar_url, is_verified)
        `)
        .eq('status', filters.status || 'active')
        .order('visibility_score', { ascending: false })
        .order('created_at', { ascending: false });

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

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getProductById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users(id, username, avatar_url, is_verified)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getMyProducts(sellerId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateProductStatus(productId: string, status: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select(`
          *,
          seller:users(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Notify seller
      await supabase
        .from('notifications')
        .insert([{
          user_id: data.seller_id,
          content: status === 'active' 
            ? `Seu produto "${data.title}" foi aprovado!`
            : `Seu produto "${data.title}" foi rejeitado.`,
          type: 'system',
          is_read: false
        }]);

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async uploadProductImages(files: File[]) {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          throw new Error(error.message);
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      throw error;
    }
  }
}