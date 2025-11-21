import React from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

// UpgradeButton: triggers checkout creation and redirects to Paddle checkout URL
export default function UpgradeButton({ planId }: { planId: string }) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleUpgrade = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Call server API to create checkout session
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, user_id: session.user.id }),
    });

    const data = await res.json();
    if (data?.url) {
      // Redirect to Paddle Checkout
      window.location.href = data.url;
    } else {
      alert('Failed to create checkout session');
    }
  };

  return (
    <button onClick={handleUpgrade} className="btn btn-primary">
      Upgrade
    </button>
  );
}
