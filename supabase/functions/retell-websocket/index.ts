// supabase/functions/retell-websocket/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { call_id, event, data } = await req.json()

    // Handle different WebSocket events from Retell
    switch (event) {
      case 'conversation_started':
        console.log('Conversation started:', call_id)
        break
      
      case 'audio_websocket_connected':
        console.log('Audio WebSocket connected:', call_id)
        break
      
      case 'conversation_ended':
        console.log('Conversation ended:', call_id)
        break
      
      default:
        console.log('Unknown event:', event)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})