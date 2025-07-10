import { supabase } from '../lib/supabase';

export class WithdrawalService {
  static async requestWithdrawal(withdrawalData: {
    user_id: string;
    amount: number;
    method: 'pix' | 'bank_transfer';
    pix_key?: string;
    bank_data?: any;
  }) {
    try {
      // Check user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', withdrawalData.user_id)
        .single();

      if (userError || !user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.balance < withdrawalData.amount) {
        throw new Error('Saldo insuficiente');
      }

      if (withdrawalData.amount < 10) {
        throw new Error('Valor mínimo de saque é R$ 10,00');
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          ...withdrawalData,
          status: 'pending'
        }])
        .select(`
          *,
          user:users(id, username, email)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Create notification for user
      await supabase
        .from('notifications')
        .insert([{
          user_id: withdrawalData.user_id,
          content: `Solicitação de saque de R$ ${withdrawalData.amount.toFixed(2)} enviada. Aguarde aprovação.`,
          type: 'withdrawal',
          is_read: false
        }]);

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getMyWithdrawals(userId: string) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateWithdrawalStatus(
    withdrawalId: string, 
    status: 'approved' | 'rejected',
    adminId: string
  ) {
    try {
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', withdrawalId)
        .single();

      if (withdrawalError || !withdrawal) {
        throw new Error('Saque não encontrado');
      }

      // Update withdrawal status
      const { data, error } = await supabase
        .from('withdrawals')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (status === 'approved') {
        // Deduct from user balance
        await supabase
          .from('users')
          .update({
            balance: supabase.raw(`COALESCE(balance, 0) - ${withdrawal.amount}`)
          })
          .eq('id', withdrawal.user_id);
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: withdrawal.user_id,
          content: status === 'approved' 
            ? `Saque de R$ ${withdrawal.amount.toFixed(2)} aprovado e processado!`
            : `Saque de R$ ${withdrawal.amount.toFixed(2)} foi rejeitado.`,
          type: 'withdrawal',
          is_read: false
        }]);

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingWithdrawals() {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          user:users(id, username, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}