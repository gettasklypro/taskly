import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CommunicationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommunicationSettingsDialog = ({ open, onOpenChange }: CommunicationSettingsDialogProps) => {
  const [settings, setSettings] = useState({
    outstandingQuoteFollowUps: true,
    overdueInvoiceFollowUps: true,
    upcomingVisitReminders: true,
    jobClosureFollowUps: true,
  });

  const handleSave = () => {
    // Handle saving settings
    console.log("Communication settings:", settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Communication Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Automated communications send emails and SMS to the client for key updates. They can be toggled on or off
            per client.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-semibold">
                Quotes & Invoices <span className="text-primary cursor-pointer">Configure</span>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quote-followups">Outstanding quote follow-ups</Label>
              <Switch
                id="quote-followups"
                checked={settings.outstandingQuoteFollowUps}
                onCheckedChange={(checked) => setSettings({ ...settings, outstandingQuoteFollowUps: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="invoice-followups">Overdue invoice follow-ups</Label>
              <Switch
                id="invoice-followups"
                checked={settings.overdueInvoiceFollowUps}
                onCheckedChange={(checked) => setSettings({ ...settings, overdueInvoiceFollowUps: checked })}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Jobs & Visits <span className="text-primary cursor-pointer">Configure</span>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visit-reminders">Upcoming assessment or visit reminders</Label>
              <Switch
                id="visit-reminders"
                checked={settings.upcomingVisitReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, upcomingVisitReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="job-closure">Job closure follow-ups</Label>
              <Switch
                id="job-closure"
                checked={settings.jobClosureFollowUps}
                onCheckedChange={(checked) => setSettings({ ...settings, jobClosureFollowUps: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
