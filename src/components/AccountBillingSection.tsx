import React, { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

// AccountBillingSection: displays current plan and subscription status
export default function AccountBillingSection() {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    const fetchSub = async () => {
      setLoading(true);
      const res = await fetch('/api/check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setSubscription(data.subscription || null);
      setLoading(false);
    };
    fetchSub();
  }, [session]);

  if (!session) return <div>Please log in to view billing.</div>;
  if (loading) return <div>Loading billing info...</div>;

  return (
    <div>
      <h3>Billing</h3>
      {subscription ? (
        <div>
          <p>Plan: {subscription.plan_id}</p>
          <p>Status: {subscription.status}</p>
          <p>Next billing: {subscription.next_billing_at || 'N/A'}</p>
        </div>
      ) : (
        <div>
          <p>No active subscription</p>
        </div>
      )}
    </div>
  );
}
