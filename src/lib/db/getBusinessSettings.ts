import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Get business settings for the current website from Supabase
 */
export async function getBusinessSettings(websiteId?: string): Promise<BusinessPageSettings | null> {
  // If websiteId is provided by the caller, use it. Otherwise try fallbacks.
  let id = websiteId || (window as any)?.tasklyWebsiteId;
  if (!id) {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (user?.id) {
        const { data: sites } = await supabase
          .from('websites')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (sites && sites.length > 0) id = sites[0].id as string;
      }
    } catch (e) {
      console.error('Failed to get current user for website lookup', e);
    }
  }
  if (!id) return null;

  const { data, error } = await supabase
    .from('websites')
    .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
    .eq('id', id)
    .single();
  if (error || !data) {
    console.error('Failed to fetch business settings', error);
    // If website lookup fails, try to return profile-level settings for current user
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (!user?.id) return null;
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number')
        .eq('id', user.id)
        .single();
      if (profErr || !profile) return null;
      return profile as BusinessPageSettings;
    } catch (e) {
      console.error('Failed to fetch profile business settings', e);
      return null;
    }
  }
  return data as BusinessPageSettings;
}
