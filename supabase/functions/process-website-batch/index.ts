import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, business_name, mode, website_url, auto_publish } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Create or get user
    let userId: string;
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log('Using existing user:', userId);
    } else {
      // Create new user
      const password = 'password123';
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: business_name
        }
      });

      if (authError) throw authError;
      userId = authData.user.id;
      console.log('Created new user:', userId);
    }

    // Step 2: Generate website using service role (bypasses auth requirements)
    console.log('Generating website for:', business_name);
    
    const generatePayload = mode === "url" 
      ? { prompt: website_url, category: "business", businessName: business_name, userId: userId }
      : { prompt: `Create a professional website for ${business_name}`, category: "business", businessName: business_name, userId: userId };

    // Call generate-website-template using service role authorization
    console.log('Calling generate-website-template with payload:', generatePayload);
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-website-template`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generatePayload)
    });

    console.log('generate-website-template response status:', generateResponse.status);
    const genRespHeaders: Record<string, string> = {};
    for (const [k, v] of generateResponse.headers.entries()) genRespHeaders[k] = v;
    console.log('generate-website-template response headers:', genRespHeaders);

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Generation failed:', errorText);
      throw new Error(`Generation failed: ${errorText}`);
    }

    const { websiteId } = await generateResponse.json();
    console.log('Website generated:', websiteId);

    // Step 3: Auto-publish if requested
    if (auto_publish) {
      // Generate subdomain
      const subdomain = business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Update website status and domain
      const fullDomain = `${subdomain}.gettaskly.ai`;
      const { error: updateError } = await supabaseClient
        .from('websites')
        .update({
          status: 'published',
          domain: fullDomain,
          slug: subdomain
        })
        .eq('id', websiteId);

      if (updateError) throw updateError;

      console.log('Website published with subdomain:', subdomain);

      return new Response(
        JSON.stringify({
          status: 'success',
          userId,
          websiteId,
          subdomain: `https://${subdomain}.gettaskly.ai`,
          email
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        userId,
        websiteId,
        email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
