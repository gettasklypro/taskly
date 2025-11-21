import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// UpgradeButton: triggers checkout creation and redirects to Paddle checkout URL
export default function UpgradeButton({ planId }: { planId: string }) {
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleUpgrade = async () => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan_id: planId,
          user_id: session.user.id,
          email: session.user.email,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session');
    }
  };

  return (
    <Button onClick={handleUpgrade} className="w-full" size="lg">
      Upgrade
    </Button>
  );
}
