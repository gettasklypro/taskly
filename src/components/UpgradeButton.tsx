import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

// Declare Paddle global
declare global {
  interface Window {
    Paddle: any;
  }
}

// UpgradeButton: Opens Paddle checkout using Paddle.js
export default function UpgradeButton({ planId }: { planId: string }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [paddleReady, setPaddleReady] = React.useState(false);

  useEffect(() => {
    // Initialize Paddle when component mounts
    if (window.Paddle) {
      const paddleClientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
      if (paddleClientToken) {
        window.Paddle.Initialize({
          token: paddleClientToken,
          eventCallback: function (data: any) {
            console.log('Paddle event:', data);
            if (data.name === 'checkout.completed') {
              // Redirect to success page
              const transactionId = data.data?.transaction_id;
              if (transactionId) {
                navigate(`/checkout/success?_ptxn=${transactionId}`);
              }
            }
          }
        });
        setPaddleReady(true);
      }
    }
  }, [navigate]);

  const handleUpgrade = async () => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    if (!paddleReady || !window.Paddle) {
      alert('Paddle is not ready yet. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      console.log('Opening Paddle checkout for plan:', planId);

      // Open Paddle checkout
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: planId,
            quantity: 1
          }
        ],
        customer: {
          email: session.user.email
        },
        customData: {
          user_id: session.user.id
        }
      });

    } catch (error) {
      console.error('Error opening checkout:', error);
      alert(`Failed to open checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      className="w-full"
      size="lg"
      disabled={loading || !paddleReady}
    >
      {loading ? 'Loading...' : !paddleReady ? 'Initializing...' : 'Upgrade'}
    </Button>
  );
}
