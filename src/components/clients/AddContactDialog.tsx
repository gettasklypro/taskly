import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddContactDialog = ({ open, onOpenChange }: AddContactDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    role: "",
    billingContact: false,
    phoneNumber: "",
    email: "",
    outstandingQuoteFollowUps: true,
    overdueInvoiceFollowUps: true,
    upcomingVisitReminders: true,
    jobClosureFollowUps: true,
  });

  const handleSubmit = () => {
    // Handle contact creation
    console.log("Contact data:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Details</h3>
            
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <Label>Title</Label>
                <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="No title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr</SelectItem>
                    <SelectItem value="mrs">Mrs</SelectItem>
                    <SelectItem value="ms">Ms</SelectItem>
                    <SelectItem value="dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Label>First name</Label>
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="col-span-5">
                <Label>Last name</Label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Role</Label>
              <Input
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="billing-contact"
                checked={formData.billingContact}
                onCheckedChange={(checked) => setFormData({ ...formData, billingContact: checked as boolean })}
              />
              <Label htmlFor="billing-contact" className="cursor-pointer">
                Set as billing contact
              </Label>
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-4">
            <h3 className="font-semibold">Communication</h3>
            
            <div>
              <Label>Phone number</Label>
              <Input
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Communication settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Communication settings</h3>
            
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
                  checked={formData.outstandingQuoteFollowUps}
                  onCheckedChange={(checked) => setFormData({ ...formData, outstandingQuoteFollowUps: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="invoice-followups">Overdue invoice follow-ups</Label>
                <Switch
                  id="invoice-followups"
                  checked={formData.overdueInvoiceFollowUps}
                  onCheckedChange={(checked) => setFormData({ ...formData, overdueInvoiceFollowUps: checked })}
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
                  checked={formData.upcomingVisitReminders}
                  onCheckedChange={(checked) => setFormData({ ...formData, upcomingVisitReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="job-closure">Job closure follow-ups</Label>
                <Switch
                  id="job-closure"
                  checked={formData.jobClosureFollowUps}
                  onCheckedChange={(checked) => setFormData({ ...formData, jobClosureFollowUps: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
            Add contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
