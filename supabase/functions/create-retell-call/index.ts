
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { agentId } = await req.json();

  if (!agentId) {
    return new Response(JSON.stringify({ error: "Agent ID is required." }), { status: 400, headers: corsHeaders });
  }

  try {

    const apiKey = Deno.env.get("RETELL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RETELL_API_KEY not set." }), { status: 500, headers: corsHeaders });
    }

    // Call Retell REST API to create a web call
    const retellResponse = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    });

    if (!retellResponse.ok) {
      const errorText = await retellResponse.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500, headers: corsHeaders });
    }

    const { call_id, access_token } = await retellResponse.json();

    return new Response(JSON.stringify({
      callId: call_id,
      accessToken: access_token,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error creating Retell web call:", error);
    return new Response(JSON.stringify({ error: "Failed to create web call." }), { status: 500, headers: corsHeaders });
  }
});