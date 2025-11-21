import BusinessPageForm from '@/components/settings/BusinessPageForm';

/**
 * Business Page Settings route
 * Renders the business page form for editing business info and WhatsApp number
 */
export default function BusinessPageSettings() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Business Page Settings</h1>
      <BusinessPageForm />
    </div>
  );
}
