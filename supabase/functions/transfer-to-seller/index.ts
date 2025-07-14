import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize services
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { transactionId, adminUserId } = await req.json()

    if (!transactionId || !adminUserId) {
      throw new Error('Missing required parameters: transactionId, adminUserId')
    }

    // Verify admin permissions
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()

    if (adminError || !admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(`
        *,
        seller:users!seller_id(id, username, email, stripe_account_id),
        product:products(title)
      `)
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status !== 'escrow') {
      throw new Error('Transaction is not in escrow status')
    }

    // Check if seller has Stripe Connect account
    if (!transaction.seller.stripe_account_id) {
      throw new Error('Seller does not have a Stripe Connect account configured')
    }

    try {
      // Create Stripe transfer to seller
      const transfer = await stripe.transfers.create({
        amount: Math.round(transaction.net_amount * 100), // Convert to cents
        currency: 'brl',
        destination: transaction.seller.stripe_account_id,
        transfer_group: `ORDER_${transaction.id}`,
        metadata: {
          transaction_id: transaction.id,
          seller_id: transaction.seller_id,
          product_title: transaction.product.title
        }
      })

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          transfer_id: transfer.id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw new Error('Failed to update transaction status')
      }

      // Update seller balance in our system (for display purposes)
      await supabase
        .from('users')
        .update({
          balance: supabase.raw(`COALESCE(balance, 0) + ${transaction.net_amount}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.seller_id)

      // Create notification for seller
      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.seller_id,
          content: `💰 Pagamento liberado! R$ ${transaction.net_amount.toFixed(2)} transferido para sua conta Stripe. Produto: "${transaction.product.title}".`,
          type: 'sale',
          is_read: false
        })

      // Create notification for buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.buyer_id,
          content: `✅ Transação concluída! Pagamento liberado para o vendedor. Produto: "${transaction.product.title}".`,
          type: 'purchase',
          is_read: false
        })

      return new Response(
        JSON.stringify({
          success: true,
          transfer_id: transfer.id,
          amount_transferred: transaction.net_amount,
          message: 'Transfer completed successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (stripeError) {
      console.error('Stripe transfer error:', stripeError)
      
      // Log the failed transfer attempt
      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.seller_id,
          content: `❌ Erro na transferência: ${stripeError.message}. Entre em contato com o suporte.`,
          type: 'system',
          is_read: false
        })

      throw new Error(`Stripe transfer failed: ${stripeError.message}`)
    }

  } catch (error) {
    console.error('Transfer function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})