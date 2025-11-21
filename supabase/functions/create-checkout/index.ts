import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { plan_id, user_id, email } = await req.json();
        const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');

        if (!PADDLE_API_KEY) {
            throw new Error('Missing PADDLE_API_KEY');
        }

        const payload: any = {
            items: [
                {
                    price_id: plan_id,
                    quantity: 1
                }
            ],
            collection_mode: "automatic",
            custom_data: {
                user_id: user_id
            }
        };

        // Add customer email if provided
        if (email) {
            payload.customer = {
                email: email
            };
        }

        // If user_id looks like a Paddle Customer ID (starts with ctm_), use it
        if (user_id && typeof user_id === 'string' && user_id.startsWith('ctm_')) {
            payload.customer_id = user_id;
            delete payload.customer; // Cannot use both
        }

        const response = await fetch("https://api.paddle.com/transactions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${PADDLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Paddle API Error:', JSON.stringify(data));
            return new Response(JSON.stringify({ error: data.error || 'Failed to create checkout' }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Extract checkout URL from the response
        const checkoutUrl = data.data?.checkout?.url;

        if (!checkoutUrl) {
            console.error('No checkout URL in response:', JSON.stringify(data));
            return new Response(JSON.stringify({ error: 'No checkout URL returned from Paddle' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ url: checkoutUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
