import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const {
            user_id,
            plan_id,
            promo_code,
            paddle_discount_id,
        } = await req.json();

        if (!user_id || !plan_id) {
            return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Create a fake Paddle subscription ID for a free transaction
        const fakePaddleId = `free-${Date.now()}`;

        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.7");
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        const { error } = await supabase.from("subscriptions").insert({
            user_id,
            plan_id,
            status: "active",
            paddle_subscription_id: fakePaddleId,
            paddle_customer_id: null,
            paddle_discount_id: paddle_discount_id || null,
        });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, subscription_id: fakePaddleId }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
