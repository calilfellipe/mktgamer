import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize services
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecret || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature) {
      throw new Error('No signature provided')
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: corsHeaders 
      })
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Processing checkout session:', session.id)
        
        // Extract metadata
        const buyerId = session.metadata?.buyer_id
        const sellerId = session.metadata?.seller_id
        const productId = session.metadata?.product_id
        const cartItems = session.metadata?.cart_items

        if (!buyerId) {
          console.error('Missing buyer_id in session metadata')
          break
        }

        const totalAmount = (session.amount_total || 0) / 100 // Convert from cents

        // Handle single product purchase
        if (productId && sellerId) {
          await processSingleProductPurchase({
            supabase,
            buyerId,
            sellerId,
            productId,
            totalAmount,
            paymentId: session.payment_intent as string,
            sessionId: session.id
          })
        }
        // Handle cart purchase (multiple items)
        else if (cartItems) {
          await processCartPurchase({
            supabase,
            buyerId,
            cartItems,
            totalAmount,
            paymentId: session.payment_intent as string,
            sessionId: session.id
          })
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('Payment intent succeeded:', paymentIntent.id)
        
        // Update transaction status to escrow
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'escrow',
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating transaction status:', updateError)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('Payment intent failed:', paymentIntent.id)
        
        // Update transaction status to failed
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating failed transaction:', updateError)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to process single product purchase
async function processSingleProductPurchase({
  supabase,
  buyerId,
  sellerId,
  productId,
  totalAmount,
  paymentId,
  sessionId
}: {
  supabase: any
  buyerId: string
  sellerId: string
  productId: string
  totalAmount: number
  paymentId: string
  sessionId: string
}) {
  try {
    // Get product details to calculate commission
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('commission_rate, title')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      return
    }

    // Calculate platform fee and net amount for seller
    const commissionRate = product.commission_rate || 15 // Default 15%
    const fee = (totalAmount * commissionRate) / 100
    const netAmount = totalAmount - fee

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        product_id: productId,
        amount: totalAmount,
        fee: fee,
        net_amount: netAmount,
        status: 'escrow',
        payment_id: paymentId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return
    }

    console.log('Transaction created:', transaction.id)

    // Update product status to sold
    await supabase
      .from('products')
      .update({ 
        status: 'sold',
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    // Create notifications
    await Promise.all([
      // Notify seller
      supabase.from('notifications').insert({
        user_id: sellerId,
        content: `🎉 Nova venda! Produto "${product.title}" vendido por R$ ${totalAmount.toFixed(2)}. Valor em escrow: R$ ${netAmount.toFixed(2)} (após taxa de ${commissionRate}%).`,
        type: 'sale',
        is_read: false,
        action_url: `/transaction/${transaction.id}`
      }),
      
      // Notify buyer
      supabase.from('notifications').insert({
        user_id: buyerId,
        content: `✅ Compra realizada! Produto "${product.title}" adquirido por R$ ${totalAmount.toFixed(2)}. Pagamento em escrow - aguarde a entrega.`,
        type: 'purchase',
        is_read: false,
        action_url: `/transaction/${transaction.id}`
      })
    ])

    // Create chat room for buyer and seller communication
    await supabase.from('chats').insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      messages: JSON.stringify([{
        id: crypto.randomUUID(),
        sender_id: 'system',
        content: `💬 Compra realizada para "${product.title}"! Use este chat para coordenar a entrega do produto. O pagamento está em escrow e será liberado após confirmação da entrega.`,
        type: 'system',
        timestamp: new Date().toISOString()
      }])
    })

    console.log('Single product purchase processed successfully')
  } catch (error) {
    console.error('Error processing single product purchase:', error)
  }
}

// Helper function to process cart purchase
async function processCartPurchase({
  supabase,
  buyerId,
  cartItems,
  totalAmount,
  paymentId,
  sessionId
}: {
  supabase: any
  buyerId: string
  cartItems: string
  totalAmount: number
  paymentId: string
  sessionId: string
}) {
  try {
    const items = JSON.parse(cartItems)
    
    for (const item of items) {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('commission_rate, title, seller_id')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        console.error('Error fetching product for cart item:', item.product_id, productError)
        continue
      }

      const itemAmount = item.price * item.quantity
      const commissionRate = product.commission_rate || 15
      const fee = (itemAmount * commissionRate) / 100
      const netAmount = itemAmount - fee

      // Create transaction for each item
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          buyer_id: buyerId,
          seller_id: product.seller_id,
          product_id: item.product_id,
          amount: itemAmount,
          fee: fee,
          net_amount: netAmount,
          status: 'escrow',
          payment_id: paymentId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction for cart item:', item.product_id, transactionError)
        continue
      }

      // Update product status
      await supabase
        .from('products')
        .update({ 
          status: 'sold',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product_id)

      // Create notifications for each transaction
      await Promise.all([
        supabase.from('notifications').insert({
          user_id: product.seller_id,
          content: `🎉 Nova venda! Produto "${product.title}" vendido por R$ ${itemAmount.toFixed(2)}. Valor em escrow: R$ ${netAmount.toFixed(2)}.`,
          type: 'sale',
          is_read: false,
          action_url: `/transaction/${transaction.id}`
        }),
        
        supabase.from('notifications').insert({
          user_id: buyerId,
          content: `✅ Produto "${product.title}" adquirido por R$ ${itemAmount.toFixed(2)}. Pagamento em escrow.`,
          type: 'purchase',
          is_read: false,
          action_url: `/transaction/${transaction.id}`
        })
      ])

      // Create chat room for each seller
      await supabase.from('chats').insert({
        buyer_id: buyerId,
        seller_id: product.seller_id,
        product_id: item.product_id,
        messages: JSON.stringify([{
          id: crypto.randomUUID(),
          sender_id: 'system',
          content: `💬 Compra realizada para "${product.title}"! Coordene a entrega através deste chat.`,
          type: 'system',
          timestamp: new Date().toISOString()
        }])
      })
    }

    // Clear buyer's cart after successful purchase
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', buyerId)

    console.log(`Cart purchase processed: ${items.length} items`)
  } catch (error) {
    console.error('Error processing cart purchase:', error)
  }
}