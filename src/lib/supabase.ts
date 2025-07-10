import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Desabilitar para evitar problemas
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'gg-sync-market'
    }
  }
});

// Tipos do banco de dados
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  balance: number;
  role: 'user' | 'admin' | 'moderator';
  is_verified: boolean;
  bio?: string;
  discord?: string;
  steam?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: 'account' | 'skin' | 'service' | 'giftcard';
  game: string;
  price: number;
  visibility_score: number;
  status: 'pending_approval' | 'active' | 'paused' | 'removed';
  images: string[];
  rarity?: string;
  level?: number;
  delivery_time: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
  seller?: User;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'escrow' | 'completed' | 'disputed' | 'refunded';
  dispute_reason?: string;
  resolved_by_admin: boolean;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: 'pix' | 'bank_transfer';
  pix_key?: string;
  bank_data?: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  content: string;
  type: 'purchase' | 'sale' | 'withdrawal' | 'system' | 'dispute';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
}