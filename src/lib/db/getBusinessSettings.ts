import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Get business settings for the current website from Supabase
 */
export async function getBusinessSettings(): Promise<BusinessPageSettings | null> {
  // Try: 1) window.tasklyWebsiteId (set by editor/viewer), 2) find first website for current user
  let websiteId = (window as any)?.tasklyWebsiteId;
  if (!websiteId) {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (user?.id) {
        const { data: sites } = await supabase
          .from('websites')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (sites && sites.length > 0) websiteId = sites[0].id as string;
      }
    } catch (e) {
      console.error('Failed to get current user for website lookup', e);
    }
  }
  if (!websiteId) return null;

  const { data, error } = await supabase
    .from('websites')
    .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
    .eq('id', websiteId)
    .single();
  if (error || !data) {
    console.error('Failed to fetch business settings', error);
    return null;
  }
  return data as BusinessPageSettings;
}
