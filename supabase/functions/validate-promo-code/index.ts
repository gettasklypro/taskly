import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { discount_code, price_id } = await req.json();
        const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');

        if (!PADDLE_API_KEY) {
            throw new Error('Missing PADDLE_API_KEY');
        }

        // Get discount details from Paddle
        const response = await fetch(`https://api.paddle.com/discounts?code=${discount_code}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${PADDLE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Paddle API Error:', JSON.stringify(data));
            return new Response(JSON.stringify({
                valid: false,
                error: data.error?.detail || 'Invalid promo code'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Check if discount exists and is active
        if (!data.data || data.data.length === 0) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Promo code not found'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const discount = data.data[0];

        // Check if discount is 100%
        const is100Percent = discount.amount === '100' && discount.type === 'percentage';

        return new Response(JSON.stringify({
            valid: true,
            discount: discount,
            is100Percent: is100Percent,
            discountId: discount.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            valid: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
