import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BulkAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkAccountDialog = ({ open, onOpenChange, onSuccess }: BulkAccountDialogProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    role: "user",
    jobRole: "",
    count: 1,
    baseEmail: "",
    defaultPassword: "Default123!",
    trialDays: 14,
  });
  const [createdAccounts, setCreatedAccounts] = useState<any[]>([]);

  const resetForm = () => {
    setStep(1);
    setFormData({
      fullName: "",
      role: "user",
      jobRole: "",
      count: 1,
      baseEmail: "",
      defaultPassword: "Default123!",
      trialDays: 14,
    });
    setCreatedAccounts([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === 1 && !formData.fullName) {
      toast.error("Please enter a name");
      return;
    }
    if (step === 2 && (formData.count < 1 || formData.count > 100)) {
      toast.error("Count must be between 1 and 100");
      return;
    }
    if (step === 3 && !formData.baseEmail) {
      toast.error("Please enter an email");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-bulk-accounts", {
        body: formData,
      });

      if (error) throw error;

      if (data.errors && data.errors.length > 0) {
        toast.warning(`Created ${data.created.length} accounts, but ${data.errors.length} failed`);
      } else {
        toast.success(data.message);
      }

      setCreatedAccounts(data.created);
      setStep(4); // Move to confirmation step
      onSuccess();
    } catch (error: any) {
      console.error("Error creating bulk accounts:", error);
      toast.error(error.message || "Failed to create accounts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step < 4 ? `Add Bulk Accounts - Step ${step} of 3` : "Accounts Created"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter the account user's name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jobRole">Job Role</Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Manager, Developer, Sales"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label htmlFor="count">Number of Accounts</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                placeholder="How many accounts to generate?"
                value={formData.count}
                onChange={(e) => {
                  const value = e.target.value === "" ? 1 : parseInt(e.target.value);
                  setFormData({ ...formData, count: value });
                }}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Maximum 100 accounts at once
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="baseEmail">Main Email</Label>
                <Input
                  id="baseEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={formData.baseEmail}
                  onChange={(e) => setFormData({ ...formData, baseEmail: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Additional accounts will use plus-addressing: test+1@example.com, test+2@example.com, etc.
                </p>
              </div>
              <div>
                <Label htmlFor="password">Default Password</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.defaultPassword}
                  onChange={(e) => setFormData({ ...formData, defaultPassword: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  All accounts will use this password initially
                </p>
              </div>
              <div>
                <Label htmlFor="trialDays">Trial Duration</Label>
                <Select
                  value={formData.trialDays.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trialDays: parseInt(value) })
                  }
                >
                  <SelectTrigger id="trialDays">
                    <SelectValue placeholder="Select trial duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  How long should the trial period last?
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Successfully Created {createdAccounts.length} Accounts</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {createdAccounts.map((account, index) => (
                    <div key={index} className="text-sm border-b border-border/50 pb-2 last:border-0">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-muted-foreground">{account.email}</p>
                      <p className="text-xs text-muted-foreground">Role: {account.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                All accounts have been added to the database with the default password: <strong>{formData.defaultPassword}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button onClick={handleNext} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 3 ? "Create Accounts" : "Next"}
            </Button>
          ) : (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
