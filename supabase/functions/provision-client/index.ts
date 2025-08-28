import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { 
      companyName, 
      email, 
      planId, 
      planName, 
      stripeCustomerId, 
      stripeSubscriptionId,
      userId
    } = await req.json()

    // Validate required fields
    if (!companyName || !email || !stripeCustomerId || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: companyName, email, stripeCustomerId, userId' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Starting client provisioning for:', companyName, 'User ID:', userId)

    // Step 1: Create Telnyx managed account (simulated for now)
    const telnyxAccountId = `telnyx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Created Telnyx managed account:', telnyxAccountId)

    // Step 2: Purchase phone number (simulated for now)
    const phoneNumber = `+1555${Math.floor(Math.random() * 9000000) + 1000000}`
    const phoneNumberId = `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Purchased phone number:', phoneNumber)

    // Step 3: Create AI agent (simulated for now)
    const aiAgentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const agentName = `${companyName} AI Assistant`
    console.log('Created AI agent:', aiAgentId)

    // Step 4: Save client data to database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{
        company_name: companyName,
        email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        telnyx_account_id: telnyxAccountId,
        phone_number: phoneNumber,
        phone_number_id: phoneNumberId,
        ai_agent_id: aiAgentId,
        plan_id: planId || 'entrepreneur',
        plan_name: planName || 'Entrepreneur',
        status: 'active',
        user_id: userId,
      }])
      .select()
      .single()

    if (clientError) {
      console.error('Failed to save client data:', clientError)
      throw clientError
    }

    console.log('Client data saved successfully:', clientData.id, 'for user:', userId)

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      clientId: clientData.id,
      stripeCustomerId: stripeCustomerId,
      subscriptionId: stripeSubscriptionId,
      telnyxAccountId: telnyxAccountId,
      phoneNumber: phoneNumber,
      aiAgentId: aiAgentId,
      userId: userId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Client provisioning failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// TODO: Replace these simulated functions with actual Telnyx API calls
// when you're ready to integrate with real Telnyx services

async function createTelnyxManagedAccount(companyName: string, email: string) {
  // This would make actual API calls to Telnyx
  // const response = await fetch('https://api.telnyx.com/v2/managed_accounts', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('TELNYX_API_KEY')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     organization_name: companyName,
  //     email: email,
  //   }),
  // })
  // return await response.json()
  
  // For now, return simulated data
  return {
    id: `telnyx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    organization_name: companyName,
    email: email,
    status: 'active',
  }
}

async function purchaseTelnyxPhoneNumber(managedAccountId: string) {
  // This would make actual API calls to Telnyx
  // const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('TELNYX_API_KEY')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     connection_id: managedAccountId,
  //   }),
  // })
  // return await response.json()
  
  // For now, return simulated data
  return {
    id: `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    phone_number: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`,
    status: 'active',
  }
}

async function createTelnyxAIAgent(phoneNumberId: string, companyName: string) {
  // This would make actual API calls to Telnyx AI API
  // const response = await fetch('https://api.telnyx.com/v2/ai/agents', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('TELNYX_API_KEY')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     name: `${companyName} AI Assistant`,
  //     phone_number_id: phoneNumberId,
  //     voice: 'en-US-AriaNeural',
  //     prompt: `You are an AI assistant for ${companyName}. Help customers with inquiries professionally.`,
  //   }),
  // })
  // return await response.json()
  
  // For now, return simulated data
  return {
    id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${companyName} AI Assistant`,
    status: 'active',
  }
}