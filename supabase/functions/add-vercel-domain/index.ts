import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain) {
      throw new Error('Domain is required');
    }

    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');

    if (!vercelToken || !vercelProjectId) {
      throw new Error('Vercel credentials not configured');
    }

    console.log(`Adding domain ${domain} to Vercel project ${vercelProjectId}`);

    // Add domain to Vercel project
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Vercel API error:', result);
      
      // Check if domain already exists
      if (result.error?.code === 'domain_already_in_use' || result.error?.code === 'forbidden') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'This domain is already connected to another Vercel project. Please remove it from the other project first.',
            code: 'domain_in_use'
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(result.error?.message || 'Failed to add domain to Vercel');
    }

    console.log('Domain added successfully:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error adding domain:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
