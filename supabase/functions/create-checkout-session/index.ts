import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { priceId, customerEmail, customerName, metadata } = await req.json()

    // Validate required fields
    if (!priceId || !customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields: priceId and customerEmail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construct the success and cancel URLs dynamically based on the request origin
    const origin = 'http://localhost:5173'
    // const origin = req.headers.get('origin') || 'http://localhost:5173'
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/pricing`

    // Create Stripe checkout session using fetch API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'customer_email': customerEmail,
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'metadata[customer_name]': customerName || '',
        'metadata[plan_id]': metadata?.planId || '',
        'metadata[plan_name]': metadata?.planName || '',
        'metadata[company]': metadata?.company || '',
      }),
    })

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json()
      console.error('Stripe API error:', errorData)
      return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripeResponse.json()

    console.log('Checkout session created successfully:', session.id)

    // Return the session ID to the frontend
    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})