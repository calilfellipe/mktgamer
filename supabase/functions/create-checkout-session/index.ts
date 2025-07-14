import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14.7.0'

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const { 
      items, 
      buyerId, 
      successUrl, 
      cancelUrl,
      productId,
      sellerId,
      singleProduct 
    } = await req.json()

    if (!buyerId || !successUrl || !cancelUrl) {
      throw new Error('Missing required parameters: buyerId, successUrl, cancelUrl')
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let metadata: Record<string, string> = {
      buyer_id: buyerId
    }

    // Handle single product purchase
    if (singleProduct && productId && sellerId) {
      lineItems = [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: singleProduct.title,
            description: singleProduct.description,
            images: singleProduct.images?.slice(0, 1) || []
          },
          unit_amount: Math.round(singleProduct.price * 100), // Convert to cents
        },
        quantity: 1,
      }]

      metadata = {
        ...metadata,
        product_id: productId,
        seller_id: sellerId
      }
    }
    // Handle cart purchase (multiple items)
    else if (items && Array.isArray(items)) {
      lineItems = items.map(item => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.title,
            description: item.description || `${item.game} - ${item.category}`,
            images: item.images?.slice(0, 1) || []
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }))

      // Store cart items in metadata for webhook processing
      metadata.cart_items = JSON.stringify(items.map(item => ({
        product_id: item.id,
        seller_id: item.seller_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1
      })))
    } else {
      throw new Error('Either singleProduct or items array must be provided')
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: metadata
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
      allow_promotion_codes: false,
      automatic_tax: {
        enabled: false
      }
    })

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})