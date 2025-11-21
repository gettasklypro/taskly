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
  const business: BusinessPageSettings = {
    business_name: website.business_name || '',
    business_description: website.business_description || '',
    whatsapp_country_code: website.whatsapp_country_code || '',
    whatsapp_number: website.whatsapp_number || '',
    whatsapp_full_number: website.whatsapp_full_number || '',
  };

  // Inject into published site config
  const config = {
    ...website,
    business,
  };

  // Example: inject into window.tasklyConfig in static HTML
  const injectScript = `
    <script>
      window.tasklyConfig = ${JSON.stringify(config)};
    </script>
    <script src="/components/WhatsAppFloatingButton.js"></script>
  `;

  // TODO: Add logic to write injectScript into published HTML output
  // ...existing publish logic...

  return config;
}
