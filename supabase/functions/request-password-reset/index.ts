import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user exists
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate secure random token
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join('')

    // Hash the token for storage
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const tokenHash = Array.from(new Uint8Array(hashBuffer), byte => 
      byte.toString(16).padStart(2, '0')
    ).join('')

    // Store token in database (expires in 1 hour)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_email: email,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Error storing reset token:', insertError)
      throw new Error('Failed to create reset token')
    }

    // Send email with reset link
    const resetUrl = `https://gettaskly.ai/reset-password?token=${token}`
    
    const { error: emailError } = await resend.emails.send({
      from: 'Taskly <noreply@gettaskly.ai>',
      to: [email],
      subject: 'Reset Your Password - Taskly',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Taskly</h1>
              </div>
              
              <div style="padding: 40px 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                
                <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                  We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                  Or copy and paste this link into your browser:
                </p>
                
                <p style="color: #667eea; word-break: break-all; margin: 10px 0 30px 0; font-size: 14px;">
                  ${resetUrl}
                </p>
                
                <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
                  <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
                    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </div>
              </div>
              
              <div style="background: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Taskly - Manage your business with ease
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error('Failed to send reset email')
    }

    console.log('Password reset email sent successfully to:', email)

    return new Response(
      JSON.stringify({ success: true, message: 'If an account exists, a reset email will be sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in request-password-reset function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})