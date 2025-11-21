import { supabase } from '@/integrations/supabase/client';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';

/**
 * Update business settings for the current website in Supabase
 */
export async function updateBusinessSettings(settings: BusinessPageSettings, websiteId?: string) {
  // Determine websiteId: priority -- explicit param, window.tasklyWebsiteId, current user first site
  let id = websiteId || (window as any)?.tasklyWebsiteId;
  if (!id) {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (user?.id) {
        const { data: sites, error: siteErr } = await supabase
          .from('websites')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (siteErr) console.error('Failed to lookup website for user', siteErr);
        if (sites && sites.length > 0) id = sites[0].id as string;
      }
    } catch (e) {
      console.error('Error getting user for website lookup', e);
    }
  }

  if (!id) {
    console.error('No websiteId available to update business settings');
    // No website selected — persist settings to the user's profile so they can be applied
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (!user?.id) return { ok: false, error: 'No authenticated user' } as any;
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          business_name: settings.business_name,
          business_description: settings.business_description,
          whatsapp_country_code: settings.whatsapp_country_code,
          whatsapp_number: settings.whatsapp_number,
          whatsapp_full_number: (function sanitize(cc?: string, num?: string, full?: string) {
            const s = (v?: string) => (v === null || v === undefined ? '' : String(v));
            if (full) {
              let f = s(full).replace(/^null/, '');
              const p = f.startsWith('+') ? '+' : '';
              f = p + f.replace(/[^0-9]/g, '');
              return f === '+' ? '' : f;
            }
            const built = `${s(cc)}${s(num)}`.replace(/^null/, '');
            const p2 = built.startsWith('+') ? '+' : '';
            const cleaned = p2 + built.replace(/[^0-9]/g, '');
            return cleaned === '+' ? '' : cleaned;
          })(settings.whatsapp_country_code, settings.whatsapp_number, settings.whatsapp_full_number),
        })
        .eq('id', user.id);
      if (profErr) {
        console.error('Failed to update profile business settings', profErr);
        return { ok: false, error: profErr.message || String(profErr) } as any;
      }
      return { ok: true } as any;
    } catch (e) {
      console.error('Error saving business settings to profile', e);
      return { ok: false, error: String(e) } as any;
    }
  }

  const { error } = await supabase
    .from('websites')
    .update({
      business_name: settings.business_name,
      business_description: settings.business_description,
      whatsapp_country_code: settings.whatsapp_country_code,
      whatsapp_number: settings.whatsapp_number,
      whatsapp_full_number: (function sanitize(cc?: string, num?: string, full?: string) {
        const s = (v?: string) => (v === null || v === undefined ? '' : String(v));
        if (full) {
          let f = s(full).replace(/^null/, '');
          const p = f.startsWith('+') ? '+' : '';
          f = p + f.replace(/[^0-9]/g, '');
          return f === '+' ? '' : f;
        }
        const built = `${s(cc)}${s(num)}`.replace(/^null/, '');
        const p2 = built.startsWith('+') ? '+' : '';
        const cleaned = p2 + built.replace(/[^0-9]/g, '');
        return cleaned === '+' ? '' : cleaned;
      })(settings.whatsapp_country_code, settings.whatsapp_number, settings.whatsapp_full_number),
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update business settings', error);
    return { ok: false, error: error.message || String(error) } as any;
  }
  return { ok: true } as any;
}
