import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.7.0'

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature) {
      throw new Error('No signature provided')
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    console.log('Webhook event type:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Handle successful payment
        if (paymentIntent.metadata.user_id && paymentIntent.metadata.items) {
          const items = JSON.parse(paymentIntent.metadata.items)
          
          // Create transactions for each item
          for (const item of items) {
            await supabase
              .from('transactions')
              .insert({
                buyer_id: paymentIntent.metadata.user_id,
                seller_id: item.seller_id,
                product_id: item.product_id,
                amount: item.price * item.quantity,
                status: 'escrow',
                stripe_payment_intent_id: paymentIntent.id
              })
          }

          // Clear user's cart
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', paymentIntent.metadata.user_id)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.metadata?.userId && session.metadata?.planId) {
          // Update user's plan
          await supabase
            .from('users')
            .update({ 
              role: session.metadata.planId,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.metadata.userId)

          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: session.metadata.userId,
              content: `Plano ${session.metadata.planId} ativado com sucesso!`,
              type: 'system',
              is_read: false
            })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Downgrade user to free plan
        if (subscription.metadata?.userId) {
          await supabase
            .from('users')
            .update({ 
              role: 'user',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.metadata.userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle failed payment
        if (invoice.customer_email) {
          console.log('Payment failed for customer:', invoice.customer_email)
          // You could send an email notification here
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