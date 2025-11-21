import { useState, useEffect } from 'react';
import CountryCodeSelector from '@/components/ui/CountryCodeSelector';
import { updateBusinessSettings } from '@/lib/db/updateBusinessSettings';
import { getBusinessSettings } from '@/lib/db/getBusinessSettings';
import { BusinessPageSettings } from '@/types/BusinessPageSettings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const COUNTRY_CODES = [
  { code: '+63', label: 'Philippines' },
  { code: '+1', label: 'USA' },
  { code: '+44', label: 'UK' },
  { code: '+61', label: 'Australia' },
  { code: '+91', label: 'India' },
];

function validatePhone(phone: string) {
  // Simple E.164 validation: must be digits, 7-15 chars
  return /^\d{7,15}$/.test(phone);
}

/**
 * Business Page Form for editing business info and WhatsApp number
 */
export default function BusinessPageForm() {
  const [settings, setSettings] = useState<BusinessPageSettings>({
    business_name: '',
    business_description: '',
    whatsapp_country_code: '+63',
    whatsapp_number: '',
    whatsapp_full_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing settings from Supabase
    async function load() {
      setLoading(true);
      const data = await getBusinessSettings();
      if (data) setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-generate full WhatsApp number
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      whatsapp_full_number: prev.whatsapp_country_code + prev.whatsapp_number,
    }));
  }, [settings.whatsapp_country_code, settings.whatsapp_number]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  function handleCountryCode(code: string) {
    setSettings((prev) => ({ ...prev, whatsapp_country_code: code }));
  }

  async function handleSave() {
    setError('');
    if (!settings.business_name.trim()) {
      setError('Business name is required');
      return;
    }
    if (!validatePhone(settings.whatsapp_number)) {
      setError('Enter a valid WhatsApp number (7-15 digits)');
      return;
    }
    setLoading(true);
    const res = await updateBusinessSettings(settings);
    setLoading(false);
    if (res && (res as any).ok) {
      toast.success('Business settings saved!');
    } else {
      const message = res && (res as any).error ? (res as any).error : 'Failed to save settings';
      toast.error(message);
    }
  }

  return (
    <form className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Business Name</label>
        <Input name="business_name" value={settings.business_name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Business Description</label>
        <Textarea name="business_description" value={settings.business_description} onChange={handleChange} rows={3} />
      </div>
      <div>
        <label className="block font-medium mb-1">WhatsApp Number</label>
        <div className="flex gap-2">
          <CountryCodeSelector value={settings.whatsapp_country_code} onChange={handleCountryCode} options={COUNTRY_CODES} />
          <Input name="whatsapp_number" value={settings.whatsapp_number} onChange={handleChange} placeholder="e.g. 9123456789" maxLength={15} />
        </div>
        <div className="text-xs text-gray-500 mt-1">Full number: <span className="font-mono">{settings.whatsapp_full_number}</span></div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="button" onClick={handleSave} disabled={loading} className="w-full">{loading ? 'Saving…' : 'Save Settings'}</Button>
    </form>
  );
}
