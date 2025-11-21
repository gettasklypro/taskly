import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// UpgradeButton: triggers checkout creation and redirects to Paddle checkout URL
export default function UpgradeButton({ planId }: { planId: string }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating checkout for plan:', planId);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan_id: planId,
          user_id: session.user.id,
          email: session.user.email,
        },
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to Paddle checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      className="w-full"
      size="lg"
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Upgrade'}
    </Button>
  );
}
