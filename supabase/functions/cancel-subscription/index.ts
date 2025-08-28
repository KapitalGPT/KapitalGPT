import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'

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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user from JWT token
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Processing cancellation request for user:', user.email)

    // Get client data to find Stripe subscription ID
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('stripe_subscription_id, stripe_customer_id, company_name')
      .eq('email', user.email)
      .single()

    if (clientError || !clientData) {
      console.error('Client not found:', clientError)
      return new Response(JSON.stringify({ error: 'Client account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!clientData.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    console.log('Cancelling Stripe subscription:', clientData.stripe_subscription_id)

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(clientData.stripe_subscription_id, {
      prorate: true, // Prorate the final invoice
    })

    console.log('Subscription canceled successfully:', canceledSubscription.id)

    // Update client status in database (webhook will also handle this, but we do it immediately for consistency)
    await supabase
      .from('clients')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email)

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', clientData.stripe_subscription_id)

    console.log('Database updated successfully for canceled subscription')

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Subscription canceled successfully',
      subscriptionId: canceledSubscription.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    
    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes('No such subscription')) {
      return new Response(JSON.stringify({ 
        error: 'Subscription not found or already canceled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to cancel subscription. Please contact support.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})