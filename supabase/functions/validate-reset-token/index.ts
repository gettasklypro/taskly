import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hash the token
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const tokenHash = Array.from(new Uint8Array(hashBuffer), byte => 
      byte.toString(16).padStart(2, '0')
    ).join('')

    // Look up token in database
    const { data: tokenData, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !tokenData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or expired token' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, email: tokenData.user_email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in validate-reset-token function:', error)
    return new Response(
      JSON.stringify({ valid: false, error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})