import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown } from "lucide-react";

interface UpgradePromptProps {
  userId: string;
  feature: string;
  description?: string;
  onUpgrade?: () => void;
}

export default function UpgradePrompt({ userId, feature, description, onUpgrade }: UpgradePromptProps) {
  const handleTestUpgrade = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan_type: "pro" })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Upgraded to Pro plan (test mode)");
      onUpgrade?.();
    } catch (error) {
      console.error("Error upgrading:", error);
      toast.error("Failed to upgrade plan");
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Pro Feature: {feature}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This feature is only available on the Pro plan.
        </p>
        <Button onClick={handleTestUpgrade} className="w-full">
          Upgrade to Pro (Test Mode)
        </Button>
      </CardContent>
    </Card>
  );
}
