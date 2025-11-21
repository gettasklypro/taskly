import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Get business settings for the current website from Supabase
 */
export async function getBusinessSettings(): Promise<BusinessPageSettings | null> {
  // TODO: get current website ID from context/session
  const websiteId = window?.tasklyWebsiteId;
  if (!websiteId) return null;
  const { data, error } = await supabase
    .from('websites')
    .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
    .eq('id', websiteId)
    .single();
  if (error || !data) return null;
  return data as BusinessPageSettings;
}
