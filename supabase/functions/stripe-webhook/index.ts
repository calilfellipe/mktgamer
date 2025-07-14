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
    // Initialize Stripe and Supabase
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

    console.log('Webhook event type:', event.type)

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

        // Handle single product purchase
        if (productId && sellerId) {
          const amount = (session.amount_total || 0) / 100 // Convert from cents
          
          const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
              buyer_id: buyerId,
              seller_id: sellerId,
              product_id: productId,
              amount: amount,
              status: 'escrow',
              stripe_payment_intent_id: session.payment_intent,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (transactionError) {
            console.error('Error creating transaction:', transactionError)
            return new Response('Error creating transaction', { 
              status: 500,
              headers: corsHeaders 
            })
          }

          console.log('Transaction created:', transaction.id)

          // Create notifications
          await Promise.all([
            // Notify seller
            supabase.from('notifications').insert({
              user_id: sellerId,
              content: `Nova venda! Produto vendido por R$ ${amount.toFixed(2)}. Aguardando entrega.`,
              type: 'sale',
              is_read: false,
              action_url: `/transaction/${transaction.id}`
            }),
            
            // Notify buyer
            supabase.from('notifications').insert({
              user_id: buyerId,
              content: `Compra realizada! Pagamento em escrow. Aguarde a entrega do produto.`,
              type: 'purchase',
              is_read: false,
              action_url: `/transaction/${transaction.id}`
            })
          ])

          // Create chat room for buyer and seller
          await supabase.from('chats').insert({
            buyer_id: buyerId,
            seller_id: sellerId,
            product_id: productId,
            messages: JSON.stringify([{
              id: crypto.randomUUID(),
              sender_id: 'system',
              content: 'Compra realizada! Use este chat para coordenar a entrega do produto.',
              type: 'system',
              timestamp: new Date().toISOString()
            }])
          })
        }

        // Handle cart purchase (multiple items)
        if (cartItems) {
          try {
            const items = JSON.parse(cartItems)
            const totalAmount = (session.amount_total || 0) / 100

            for (const item of items) {
              const itemAmount = item.price * item.quantity
              
              const { data: transaction, error: transactionError } = await supabase
                .from('transactions')
                .insert({
                  buyer_id: buyerId,
                  seller_id: item.seller_id,
                  product_id: item.product_id,
                  amount: itemAmount,
                  status: 'escrow',
                  stripe_payment_intent_id: session.payment_intent,
                  created_at: new Date().toISOString()
                })
                .select()
                .single()

              if (transactionError) {
                console.error('Error creating transaction for item:', item.product_id, transactionError)
                continue
              }

              // Create notifications for each transaction
              await Promise.all([
                supabase.from('notifications').insert({
                  user_id: item.seller_id,
                  content: `Nova venda! Produto "${item.title}" vendido por R$ ${itemAmount.toFixed(2)}`,
                  type: 'sale',
                  is_read: false,
                  action_url: `/transaction/${transaction.id}`
                }),
                
                supabase.from('notifications').insert({
                  user_id: buyerId,
                  content: `Compra realizada! Produto "${item.title}" em escrow.`,
                  type: 'purchase',
                  is_read: false,
                  action_url: `/transaction/${transaction.id}`
                })
              ])

              // Create chat room
              await supabase.from('chats').insert({
                buyer_id: buyerId,
                seller_id: item.seller_id,
                product_id: item.product_id,
                messages: JSON.stringify([{
                  id: crypto.randomUUID(),
                  sender_id: 'system',
                  content: `Compra realizada para "${item.title}"! Use este chat para coordenar a entrega.`,
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

            console.log(`Created ${items.length} transactions for cart purchase`)
          } catch (parseError) {
            console.error('Error parsing cart items:', parseError)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('Payment intent succeeded:', paymentIntent.id)
        
        // Update transaction status if it exists
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'escrow',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

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
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating failed transaction:', updateError)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription event:', event.type, subscription.id)
        
        // Handle subscription updates if needed
        if (subscription.metadata?.user_id && subscription.metadata?.plan_id) {
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
              role: subscription.metadata.plan_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.metadata.user_id)

          if (userUpdateError) {
            console.error('Error updating user plan:', userUpdateError)
          } else {
            // Create notification
            await supabase.from('notifications').insert({
              user_id: subscription.metadata.user_id,
              content: `Plano ${subscription.metadata.plan_id} ativado com sucesso!`,
              type: 'system',
              is_read: false
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription cancelled:', subscription.id)
        
        // Downgrade user to free plan
        if (subscription.metadata?.user_id) {
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
              role: 'user',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.metadata.user_id)

          if (userUpdateError) {
            console.error('Error downgrading user plan:', userUpdateError)
          } else {
            // Create notification
            await supabase.from('notifications').insert({
              user_id: subscription.metadata.user_id,
              content: 'Sua assinatura foi cancelada. Você foi movido para o plano gratuito.',
              type: 'system',
              is_read: false
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Invoice payment failed:', invoice.id)
        
        // Handle failed subscription payment
        if (invoice.subscription && invoice.customer_email) {
          console.log('Subscription payment failed for:', invoice.customer_email)
          
          // You could send email notifications or create system notifications here
          // For now, we'll just log it
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