import { supabase } from '../lib/supabase';

export class TransactionService {
  static async createTransaction(transactionData: {
    buyer_id: string;
    seller_id: string;
    product_id: string;
    amount: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          status: 'escrow',
          resolved_by_admin: false
        }])
        .select(`
          *,
          buyer:users(id, username, avatar_url),
          seller:users(id, username, avatar_url),
          product:products(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Create notifications
      await Promise.all([
        // Notify seller
        supabase
          .from('notifications')
          .insert([{
            user_id: transactionData.seller_id,
            content: `Nova venda! Produto vendido por R$ ${transactionData.amount.toFixed(2)}`,
            type: 'sale',
            is_read: false,
            action_url: `/chat/${data.id}`
          }]),
        
        // Notify buyer
        supabase
          .from('notifications')
          .insert([{
            user_id: transactionData.buyer_id,
            content: `Compra realizada! Aguarde a entrega do produto.`,
            type: 'purchase',
            is_read: false,
            action_url: `/chat/${data.id}`
          }])
      ]);

      // Create chat room
      await supabase
        .from('chats')
        .insert([{
          buyer_id: transactionData.buyer_id,
          seller_id: transactionData.seller_id,
          product_id: transactionData.product_id,
          messages: []
        }]);

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateTransactionStatus(
    transactionId: string, 
    status: 'completed' | 'disputed' | 'refunded',
    userId: string,
    disputeReason?: string
  ) {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (disputeReason) {
        updates.dispute_reason = disputeReason;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select(`
          *,
          buyer:users(*),
          seller:users(*),
          product:products(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Handle payment release/refund logic here
      if (status === 'completed') {
        // Release payment to seller
        await this.releasePaymentToSeller(data);
      } else if (status === 'refunded') {
        // Refund to buyer
        await this.refundToBuyer(data);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async releasePaymentToSeller(transaction: any) {
    try {
      // Calculate seller amount (minus platform fee)
      const platformFee = transaction.amount * 0.15; // 15% platform fee
      const sellerAmount = transaction.amount - platformFee;

      // Update seller balance
      const { error } = await supabase
        .from('users')
        .update({
          balance: supabase.raw(`COALESCE(balance, 0) + ${sellerAmount}`)
        })
        .eq('id', transaction.seller_id);

      if (error) {
        throw new Error(error.message);
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: transaction.seller_id,
          content: `Pagamento liberado! R$ ${sellerAmount.toFixed(2)} adicionado ao seu saldo.`,
          type: 'sale',
          is_read: false
        }]);

    } catch (error) {
      throw error;
    }
  }

  static async refundToBuyer(transaction: any) {
    try {
      // In a real app, you'd process the refund through payment gateway
      // For now, we'll just create a notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: transaction.buyer_id,
          content: `Reembolso processado! R$ ${transaction.amount.toFixed(2)} será estornado.`,
          type: 'purchase',
          is_read: false
        }]);

    } catch (error) {
      throw error;
    }
  }

  static async getMyTransactions(userId: string, type: 'all' | 'purchases' | 'sales' = 'all') {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          buyer:users(id, username, avatar_url),
          seller:users(id, username, avatar_url),
          product:products(*)
        `)
        .order('created_at', { ascending: false });

      if (type === 'purchases') {
        query = query.eq('buyer_id', userId);
      } else if (type === 'sales') {
        query = query.eq('seller_id', userId);
      } else {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
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