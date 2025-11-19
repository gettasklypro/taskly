import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PlanSwitcherProps {
  userId: string;
  currentPlan: string;
  onPlanChange?: (newPlan: string) => void;
}

export default function PlanSwitcher({ userId, currentPlan, onPlanChange }: PlanSwitcherProps) {
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newPlan: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan_type: newPlan })
        .eq("id", userId);

      if (error) throw error;

      setPlan(newPlan);
      onPlanChange?.(newPlan);
      toast.success(`Switched to ${newPlan.toUpperCase()} plan`);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Your Plan
          <Badge variant={plan === "pro" ? "default" : "secondary"}>
            {plan.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test mode: Switch between plans to test features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant={plan === "basic" ? "default" : "outline"}
            onClick={() => handleChange("basic")}
            disabled={loading || plan === "basic"}
          >
            Switch to Basic
          </Button>
          <Button
            variant={plan === "pro" ? "default" : "outline"}
            onClick={() => handleChange("pro")}
            disabled={loading || plan === "pro"}
          >
            Switch to Pro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
