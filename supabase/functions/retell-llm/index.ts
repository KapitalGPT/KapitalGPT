
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Retell } from 'npm:retell-sdk@0.1.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { call_id, audio_websocket_protocol, audio_encoding, sample_rate } = await req.json()

    const retell = new Retell({
      apiKey: Deno.env.get('RETELL_API_KEY'),
    })

    // Register the call with Retell
    const registerCallResponse = await retell.call.register({
      call_id: call_id,
      audio_websocket_protocol: audio_websocket_protocol,
      audio_encoding: audio_encoding,
      sample_rate: sample_rate,
      agent_id: Deno.env.get('RETELL_AGENT_ID'),
    })

    return new Response(JSON.stringify(registerCallResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})