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
    const body = await req.json();
    const { websiteId, slug, domain, siteTitle, faviconUrl } = body;

    if (!websiteId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing websiteId' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      console.error('Missing Supabase service role key or URL');
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.7");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Read current website row
    const { data: existingSite, error: siteErr } = await supabase
      .from('websites')
      .select('user_id, business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
      .eq('id', websiteId)
      .single();

    if (siteErr) {
      console.error('Failed to fetch website', siteErr);
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch website' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Merge profile fields if any website business/whatsapp field is missing
    const mergedFields: Record<string, any> = {};
    let ownerId: string | null = null;
    if (existingSite) {
      ownerId = existingSite.user_id ?? null;
      const needs = {
        business_name: !existingSite.business_name,
        business_description: !existingSite.business_description,
        whatsapp_country_code: !existingSite.whatsapp_country_code,
        whatsapp_number: !existingSite.whatsapp_number,
        whatsapp_full_number: !existingSite.whatsapp_full_number,
      };

      if (Object.values(needs).some(Boolean)) {
        const ownerId = existingSite.user_id;
        if (ownerId) {
          console.log('Publish: ownerId present, fetching profile', { ownerId, needs });
          const { data: profileData, error: profErr } = await supabase
            .from('profiles')
            .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
            .eq('id', ownerId)
            .single();
          if (profErr) {
            console.error('Failed to fetch profile during publish merge', profErr);
          } else if (profileData) {
            console.log('Publish: fetched profileData', { profileData });
            if (needs.business_name && profileData.business_name) mergedFields.business_name = profileData.business_name;
            if (needs.business_description && profileData.business_description) mergedFields.business_description = profileData.business_description;
            if (needs.whatsapp_country_code && profileData.whatsapp_country_code) mergedFields.whatsapp_country_code = profileData.whatsapp_country_code;
            if (needs.whatsapp_number && profileData.whatsapp_number) mergedFields.whatsapp_number = profileData.whatsapp_number;
            if (needs.whatsapp_full_number && profileData.whatsapp_full_number) mergedFields.whatsapp_full_number = profileData.whatsapp_full_number;
            console.log('Publish: mergedFields after profile merge', { mergedFields });
          }
        }
      }
    }

    // Helper to normalize/construct full WhatsApp number
    function normalizeFullNumber(countryCode: any, number: any, existingFull: any) {
      // prefer explicit existing full if valid
      const asStr = (val: any) => (val === null || val === undefined ? '' : String(val));
      let full = asStr(existingFull);
      if (full) {
        full = full.replace(/^null/, '');
        const plus = full.startsWith('+') ? '+' : '';
        full = plus + full.replace(/[^0-9]/g, '');
        if (full === '+') full = '';
        if (full) return full;
      }

      const cc = asStr(countryCode).replace(/^null/, '');
      const num = asStr(number).replace(/^null/, '');
      let built = `${cc}${num}`;
      built = built.replace(/^null/, '');
      const plus2 = built.startsWith('+') ? '+' : '';
      built = plus2 + built.replace(/[^0-9]/g, '');
      if (built === '+') built = '';
      return built;
    }

    // Build update object
    const updateData: any = { status: 'published' };
    if (slug) updateData.slug = slug;
    if (domain) updateData.domain = domain;
    if (siteTitle) updateData.site_title = siteTitle;
    if (faviconUrl) updateData.favicon_url = faviconUrl;

    // compute whatsapp_full_number safely from available pieces
    const finalUpdateBase = Object.keys(mergedFields).length ? { ...updateData, ...mergedFields } : updateData;
    const computedFull = normalizeFullNumber(
      mergedFields.whatsapp_country_code ?? existingSite.whatsapp_country_code,
      mergedFields.whatsapp_number ?? existingSite.whatsapp_number,
      mergedFields.whatsapp_full_number ?? existingSite.whatsapp_full_number,
    );

    const finalUpdate = { ...finalUpdateBase, whatsapp_full_number: computedFull || (finalUpdateBase.whatsapp_full_number ?? undefined) };

    console.log('Publish: finalUpdate about to write', { websiteId, finalUpdate, ownerId });
    const { error: updateErr } = await supabase.from('websites').update(finalUpdate).eq('id', websiteId);
    if (updateErr) {
      console.error('Failed to update website during publish', updateErr);
      return new Response(JSON.stringify({ success: false, error: updateErr.message || String(updateErr) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, updated: finalUpdate }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error('Publish website function error', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
