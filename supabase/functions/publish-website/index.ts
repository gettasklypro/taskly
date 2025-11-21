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

    // Merge profile fields if website missing business fields
    const mergedFields: Record<string, any> = {};
    if (existingSite) {
      if (!existingSite.whatsapp_full_number || !existingSite.business_name) {
        const ownerId = existingSite.user_id;
        if (ownerId) {
          const { data: profileData, error: profErr } = await supabase
            .from('profiles')
            .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
            .eq('id', ownerId)
            .single();
          if (profErr) {
            console.error('Failed to fetch profile during publish merge', profErr);
          } else if (profileData) {
            if (!existingSite.business_name && profileData.business_name) mergedFields.business_name = profileData.business_name;
            if (!existingSite.business_description && profileData.business_description) mergedFields.business_description = profileData.business_description;
            if (!existingSite.whatsapp_country_code && profileData.whatsapp_country_code) mergedFields.whatsapp_country_code = profileData.whatsapp_country_code;
            if (!existingSite.whatsapp_number && profileData.whatsapp_number) mergedFields.whatsapp_number = profileData.whatsapp_number;
            if (!existingSite.whatsapp_full_number && profileData.whatsapp_full_number) mergedFields.whatsapp_full_number = profileData.whatsapp_full_number;
          }
        }
      }
    }

    // Build update object
    const updateData: any = { status: 'published' };
    if (slug) updateData.slug = slug;
    if (domain) updateData.domain = domain;
    if (siteTitle) updateData.site_title = siteTitle;
    if (faviconUrl) updateData.favicon_url = faviconUrl;

    const finalUpdate = Object.keys(mergedFields).length ? { ...updateData, ...mergedFields } : updateData;

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
