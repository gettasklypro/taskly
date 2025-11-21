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
        const { code, discount_value, discount_type, expires_at, max_uses } = await req.json();
        const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');

        if (!PADDLE_API_KEY) {
            throw new Error('Missing PADDLE_API_KEY');
        }

        // Create discount in Paddle
        const paddlePayload: any = {
            code: code.toUpperCase(),
            description: `Promo code: ${code}`,
            type: discount_type === 'percent' ? 'percentage' : 'flat',
            amount: discount_value.toString(),
        };

        // Add currency for flat discounts
        if (discount_type === 'fixed') {
            paddlePayload.currency_code = 'USD';
        }

        // Add expiration if provided
        if (expires_at) {
            paddlePayload.expires_at = new Date(expires_at).toISOString();
        }

        // Add usage limit if provided
        if (max_uses) {
            paddlePayload.usage_limit = max_uses;
        }

        console.log('Creating Paddle discount:', JSON.stringify(paddlePayload, null, 2));

        const response = await fetch("https://api.paddle.com/discounts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${PADDLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paddlePayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Paddle API Error:', JSON.stringify(data));
            return new Response(JSON.stringify({
                success: false,
                error: data.error?.detail || 'Failed to create discount in Paddle',
                paddleError: data
            }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('Paddle discount created:', JSON.stringify(data, null, 2));

        return new Response(JSON.stringify({
            success: true,
            paddleDiscountId: data.data.id,
            paddleData: data.data
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
