import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Update business settings for the current website in Supabase
 */
export async function updateBusinessSettings(settings: BusinessPageSettings) {
  // TODO: get current website ID from context/session
  const websiteId = window?.tasklyWebsiteId;
  if (!websiteId) return false;
  const { error } = await supabase
    .from('websites')
    .update({
      business_name: settings.business_name,
      business_description: settings.business_description,
      whatsapp_country_code: settings.whatsapp_country_code,
      whatsapp_number: settings.whatsapp_number,
      whatsapp_full_number: settings.whatsapp_full_number,
    })
    .eq('id', websiteId);
  return !error;
}
