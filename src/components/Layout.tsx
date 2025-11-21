import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatWidget } from "./ChatWidget";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [loadingTrial, setLoadingTrial] = useState(true);

  useEffect(() => {
    const checkTrial = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('trial_end_at')
        .eq('id', user.id)
        .single();

      if (data?.trial_end_at) {
        const end = new Date(data.trial_end_at);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(diffDays);
      }
      setLoadingTrial(false);
    };

    checkTrial();
  }, [user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Trial Banner */}
          {!loadingTrial && trialDaysLeft !== null && trialDaysLeft <= 14 && (
            <div className={`${trialDaysLeft <= 0 ? 'bg-destructive' : 'bg-indigo-600'} text-white px-4 py-2 text-center text-sm font-medium flex justify-center items-center gap-4`}>
              <span>
                {trialDaysLeft <= 0
                  ? "Your free trial has expired."
                  : `You have ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your free trial.`}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigate('/pricing')}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          <header className="h-14 sm:h-12 border-b border-border flex items-center px-3 sm:px-4 bg-background sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="shrink-0" />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};
