import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Publish website pipeline
 * Injects business config and WhatsApp button logic into published site
 */
export async function publishWebsite(websiteId: string) {
  // Fetch website record
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('id', websiteId)
    .single();
  if (error || !website) throw new Error('Website not found');

  // Prepare business config
  // Prefer business fields on the website record. If missing, fall back to the owning user's profile settings.
  let business: BusinessPageSettings = {
    business_name: website.business_name || '',
    business_description: website.business_description || '',
    whatsapp_country_code: website.whatsapp_country_code || '',
    whatsapp_number: website.whatsapp_number || '',
    whatsapp_full_number: website.whatsapp_full_number || '',
  };

  if ((!business.whatsapp_full_number || !business.business_name) && website.user_id) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
        .eq('id', website.user_id)
        .single();
      if (profile) {
        business = {
          business_name: business.business_name || profile.business_name || '',
          business_description: business.business_description || profile.business_description || '',
          whatsapp_country_code: business.whatsapp_country_code || profile.whatsapp_country_code || '',
          whatsapp_number: business.whatsapp_number || profile.whatsapp_number || '',
          whatsapp_full_number: business.whatsapp_full_number || profile.whatsapp_full_number || '',
        };
      }
    } catch (e) {
      console.error('Failed to fetch profile business settings during publish', e);
    }
  }

  // Inject into published site config
  const config = {
    ...website,
    business,
  };

  // Example: inject into window.tasklyConfig in static HTML
  // Inline the tasklyConfig and a small WhatsApp button renderer so static published sites
  // don't need to serve a separate component file at `/components/WhatsAppFloatingButton.js`.
  const injectScript = `
    <script>
      window.tasklyConfig = ${JSON.stringify(config)};
      (function(){
        try {
          var biz = window.tasklyConfig && window.tasklyConfig.business;
          var full = biz && biz.whatsapp_full_number;
          if (!full) return;
          var btn = document.createElement('button');
          btn.setAttribute('aria-label','Chat on WhatsApp');
          btn.style.position = 'fixed';
          btn.style.bottom = '24px';
          btn.style.right = '24px';
          btn.style.zIndex = 9999;
          btn.style.background = '#25D366';
          btn.style.borderRadius = '50%';
          btn.style.width = '56px';
          btn.style.height = '56px';
          btn.style.display = 'flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          btn.style.border = 'none';
          btn.style.cursor = 'pointer';
          btn.onclick = function(){ window.open('https://api.whatsapp.com/send?phone='+encodeURIComponent(full)+'&text=Hello','_blank'); };
          btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.693 4.607 2.01 6.553L4 29l7.684-2.01A11.96 11.96 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.933 0-3.77-.56-5.34-1.61l-.38-.24-4.56 1.19 1.22-4.44-.25-.39A9.94 9.94 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.03-7.47c-.276-.138-1.63-.805-1.882-.897-.252-.092-.435-.138-.618.138-.184.276-.71.897-.87 1.083-.161.184-.322.207-.598.069-.276-.138-1.165-.429-2.22-1.366-.82-.73-1.374-1.63-1.535-1.906-.161-.276-.017-.425.121-.563.124-.123.276-.322.414-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.618-1.492-.847-2.043-.223-.536-.45-.463-.618-.471l-.527-.009c-.184 0-.483.069-.737.345-.253.276-.965.945-.965 2.303s.988 2.672 1.126 2.857c.138.184 1.944 2.97 4.716 4.048.66.285 1.174.456 1.575.583.661.211 1.263.181 1.737.11.53-.079 1.63-.666 1.862-1.308.23-.643.23-1.194.161-1.308-.069-.115-.253-.184-.529-.322z"/></svg>';
          document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(btn); });
          if (document.readyState === 'complete' || document.readyState === 'interactive') { document.body.appendChild(btn); }
        } catch (e) { console.error('WhatsApp injector error', e); }
      })();
    </script>
  `;

  // TODO: Add logic to write injectScript into published HTML output
  // ...existing publish logic...

  return config;
}
