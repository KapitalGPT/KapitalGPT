import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Received Stripe webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout session completed:', session.id)
  
  try {
    // Extract customer and subscription information
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const customerEmail = session.customer_details?.email
    const customerName = session.metadata?.customer_name || session.customer_details?.name
    const companyName = session.metadata?.company || customerName
    const planId = session.metadata?.planId
    const planName = session.metadata?.planName

    if (!customerId || !subscriptionId || !customerEmail) {
      console.error('Missing required data in checkout session:', { customerId, subscriptionId, customerEmail })
      return
    }

    // Step 1: Check if user exists, create if not
    console.log('Checking for existing user with email:', customerEmail)
    
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }

    let userId: string
    const existingUser = existingUsers.users.find(user => user.email === customerEmail)
    
    if (existingUser) {
      console.log('Found existing user:', existingUser.id)
      userId = existingUser.id
    } else {
      console.log('Creating new user account for:', customerEmail)
      
      // Create new user account with email confirmation
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // This will send a confirmation email with magic link
        user_metadata: {
          company_name: companyName,
          plan_name: planName,
          created_via: 'stripe_payment',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId
        }
      })

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        throw createUserError
      }

      if (!newUser.user) {
        throw new Error('Failed to create user account')
      }

      userId = newUser.user.id
      console.log('Created new user account with email confirmation:', userId, customerEmail)
    }

    // Step 2: Check if client already exists (by Stripe customer ID, email, or user ID)
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .or(`stripe_customer_id.eq.${customerId},email.eq.${customerEmail},user_id.eq.${userId}`)
      .single()

    if (existingClient) {
      console.log('Client already exists, updating with new subscription info')
      
      // Update existing client with new subscription info
      await supabase
        .from('clients')
        .update({
          stripe_subscription_id: subscriptionId,
          plan_id: planId || 'entrepreneur',
          plan_name: planName || 'Entrepreneur',
          status: 'active',
          user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingClient.id)
      
      console.log('Updated existing client with new subscription and user linkage')
      return
    }

    // Step 3: Trigger Telnyx provisioning for new client
    console.log('Starting Telnyx provisioning for customer:', customerId)
    
    // Call the provision-client Edge Function
    const provisionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/provision-client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        companyName: companyName || 'Unknown Company',
        email: customerEmail,
        planId: planId || 'entrepreneur',
        planName: planName || 'Entrepreneur',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        userId: userId,
      }),
    })

    if (!provisionResponse.ok) {
      const errorText = await provisionResponse.text()
      console.error('Failed to provision client:', errorText)
      throw new Error(`Provisioning failed: ${errorText}`)
    }

    const provisionResult = await provisionResponse.json()
    console.log('Client provisioning completed successfully:', provisionResult)
    
    // Log the complete workflow success
    console.log('Stripe webhook workflow completed successfully:', {
      userId,
      customerEmail,
      customerId,
      subscriptionId,
      clientId: provisionResult.clientId
    })

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription created:', subscription.id)
  
  try {
    // Save subscription to database
    const { error } = await supabase.from('subscriptions').insert([{
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_id: subscription.items.data[0]?.price?.id,
      amount: subscription.items.data[0]?.price?.unit_amount,
      currency: subscription.items.data[0]?.price?.currency,
    }])

    if (error) {
      console.error('Error saving subscription:', error)
      throw error
    }

    console.log('Subscription saved successfully')
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
      throw error
    }

    // Update client status if subscription is canceled or past due
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      await supabase
        .from('clients')
        .update({ 
          status: subscription.status === 'canceled' ? 'canceled' : 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
    }

    console.log('Subscription updated successfully')
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  try {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    // Update client status
    await supabase
      .from('clients')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log('Subscription deletion processed successfully')
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('Processing payment succeeded:', invoice.id)
  
  try {
    // Update client status to active if payment succeeded
    if (invoice.subscription) {
      await supabase
        .from('clients')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
    }

    console.log('Payment success processed')
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error)
    throw error
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log('Processing payment failed:', invoice.id)
  
  try {
    // Update client status to suspended if payment failed
    if (invoice.subscription) {
      await supabase
        .from('clients')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
    }

    console.log('Payment failure processed')
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error)
    throw error
  }
}