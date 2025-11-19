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

    console.log(`Removing domain ${domain} from Vercel project ${vercelProjectId}`);

    // Remove domain from Vercel project
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
      }
    );

    if (!response.ok) {
      const result = await response.json();
      console.error('Vercel API error:', result);
      
      // If domain not found, consider it already removed (success)
      if (response.status === 404) {
        console.log('Domain not found in Vercel, considering it already removed');
        return new Response(
          JSON.stringify({ success: true, message: 'Domain not found (already removed)' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(result.error?.message || 'Failed to remove domain from Vercel');
    }

    console.log('Domain removed successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error removing domain:', error);
    
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
