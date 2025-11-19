import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
  status: "lead" | "customer";
  tags: string[] | null;
  lead_source: string | null;
  assigned_to: string | null;
  lifetime_value: number | null;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  website: string | null;
  social_media_links: any;
  billing_address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
};

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSave: (contact: Contact) => void;
}

export const EditClientDialog = ({ open, onOpenChange, contact, onSave }: EditClientDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company_name: "",
    status: "lead" as "lead" | "customer",
    lead_source: "",
    assigned_to: "",
    lifetime_value: "",
    last_contact_date: "",
    next_follow_up_date: "",
    website: "",
    billing_address: "",
    tax_id: "",
    payment_terms: "",
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.address || "",
        company_name: contact.company_name || "",
        status: contact.status,
        lead_source: contact.lead_source || "",
        assigned_to: contact.assigned_to || "",
        lifetime_value: contact.lifetime_value?.toString() || "",
        last_contact_date: contact.last_contact_date ? contact.last_contact_date.split('T')[0] : "",
        next_follow_up_date: contact.next_follow_up_date ? contact.next_follow_up_date.split('T')[0] : "",
        website: contact.website || "",
        billing_address: contact.billing_address || "",
        tax_id: contact.tax_id || "",
        payment_terms: contact.payment_terms || "",
      });
    }
  }, [contact]);

  const handleSubmit = () => {
    if (!contact) return;
    
    onSave({
      ...contact,
      ...formData,
      lifetime_value: formData.lifetime_value ? parseFloat(formData.lifetime_value) : null,
      last_contact_date: formData.last_contact_date || null,
      next_follow_up_date: formData.next_follow_up_date || null,
    });
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Client Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Client Information</h3>
              <p className="text-sm text-muted-foreground">
                View and edit client details
              </p>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                placeholder="Client name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Company Name</Label>
              <Input
                placeholder="Company name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "lead" | "customer") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Details</h3>
            
            <div>
              <Label>Email</Label>
              <Input
                placeholder="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label>Billing Address</Label>
              <Input
                placeholder="Billing address"
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              />
            </div>

            <div>
              <Label>Website</Label>
              <Input
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Business Details</h3>
            
            <div>
              <Label>Tax ID / Business Number</Label>
              <Input
                placeholder="Tax ID or Business Number"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Input
                placeholder="e.g., Net 30"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              />
            </div>

            <div>
              <Label>Lead Source</Label>
              <Input
                placeholder="How did they find you?"
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              />
            </div>

            <div>
              <Label>Assigned To</Label>
              <Input
                placeholder="Team member name"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              />
            </div>

            <div>
              <Label>Lifetime Value</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.lifetime_value}
                onChange={(e) => setFormData({ ...formData, lifetime_value: e.target.value })}
              />
            </div>
          </div>

          {/* Follow-up Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold">Follow-up</h3>
            
            <div>
              <Label>Last Contact Date</Label>
              <Input
                type="date"
                value={formData.last_contact_date}
                onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Next Follow-up Date</Label>
              <Input
                type="date"
                value={formData.next_follow_up_date}
                onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(contact.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(contact.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
