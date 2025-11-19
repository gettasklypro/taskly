import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, CreditCard, Bell, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PlanSwitcher from "@/components/PlanSwitcher";

export const Settings = () => {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile with plan
  const { data: profile, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Settings" 
        description="Manage your account and preferences"
      />
      
      <div className="p-6 animate-fade-in space-y-6">
        {isAdmin && (
          <Button 
            onClick={() => navigate("/admin")}
            className="gradient-primary"
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Access Admin Panel
          </Button>
        )}

        {/* Plan Switcher */}
        {user && profile && (
          <PlanSwitcher 
            userId={user.id}
            currentPlan={profile.plan_type || 'basic'}
            onPlanChange={() => refetch()}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: User, title: "Profile", desc: "Update your personal information", path: "/settings/profile" },
            { icon: Building, title: "Business", desc: "Manage business details and branding", path: null },
            { icon: CreditCard, title: "Billing", desc: "Subscription and payment methods", path: null },
            { icon: Bell, title: "Notifications", desc: "Configure email and push notifications", path: null },
          ].map((setting, index) => (
            <Card 
              key={setting.title} 
              className="gradient-card hover-lift border-border/50 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setting.path && navigate(setting.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <setting.icon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{setting.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
