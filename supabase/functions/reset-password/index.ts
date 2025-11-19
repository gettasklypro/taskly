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
    const { token, password, email } = await req.json()

    if (!token || !password || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token, password, and email are required' }),
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

    // Verify token is valid and not used
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('user_email', email)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error('Failed to update password')
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)

    console.log('Password reset successfully for:', email)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in reset-password function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})