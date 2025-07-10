import { supabase } from '../lib/supabase';

export class AdminService {
  static async getDashboardStats() {
    try {
      const [
        usersResult,
        productsResult,
        transactionsResult,
        withdrawalsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      const totalRevenue = transactionsResult.data?.reduce((sum, t) => sum + (t.amount * 0.15), 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalRevenue,
        pendingWithdrawals: withdrawalsResult.count || 0
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUsers(filters: {
    search?: string;
    role?: string;
    verified?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
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

  static async updateUserStatus(userId: string, updates: {
    is_verified?: boolean;
    role?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users(id, username, email, avatar_url)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getTransactions(filters: {
    status?: string;
    disputed?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          buyer:users(id, username, email),
          seller:users(id, username, email),
          product:products(title, category, game)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.disputed) {
        query = query.eq('status', 'disputed');
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
}