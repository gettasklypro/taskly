import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { AddCustomFieldDialog } from "./AddCustomFieldDialog";
import { AddContactDialog } from "./AddContactDialog";
import { CommunicationSettingsDialog } from "./CommunicationSettingsDialog";

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

interface PropertyAddress {
  id: string;
  propertyName: string;
  street1: string;
  street2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  taxRate: string;
  billingAddressSame: boolean;
  detailsOpen: boolean;
  contactsOpen: boolean;
}

export const NewClientDialog = ({ open, onOpenChange, onSubmit }: NewClientDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    leadSource: "",
    street1: "",
    street2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    taxRate: "",
    billingAddressSame: true,
  });

  const [additionalProperties, setAdditionalProperties] = useState<PropertyAddress[]>([]);

  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [propertyCustomFieldDialogOpen, setPropertyCustomFieldDialogOpen] = useState(false);
  const [propertyContactDialogOpen, setPropertyContactDialogOpen] = useState(false);
  const [communicationSettingsOpen, setCommunicationSettingsOpen] = useState(false);
  const [additionalClientDetailsOpen, setAdditionalClientDetailsOpen] = useState(false);
  const [additionalContactsOpen, setAdditionalContactsOpen] = useState(false);
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false);
  const [propertyContactsOpen, setPropertyContactsOpen] = useState(false);

  const handleSubmit = (saveAndCreateAnother: boolean = false) => {
    onSubmit({ ...formData, additionalProperties, saveAndCreateAnother });
  };

  const addAnotherProperty = () => {
    setAdditionalProperties([
      ...additionalProperties,
      {
        id: crypto.randomUUID(),
        propertyName: "",
        street1: "",
        street2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
        taxRate: "",
        billingAddressSame: true,
        detailsOpen: true,
        contactsOpen: true,
      },
    ]);
  };

  const removeProperty = (id: string) => {
    setAdditionalProperties(additionalProperties.filter((prop) => prop.id !== id));
  };

  const updateProperty = (id: string, updates: Partial<PropertyAddress>) => {
    setAdditionalProperties(
      additionalProperties.map((prop) => (prop.id === id ? { ...prop, ...updates } : prop))
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">New Client</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Primary contact details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Primary contact details</h3>
                <p className="text-sm text-muted-foreground">
                  Provide the main point of contact to ensure smooth communication and reliable client records.
                </p>
              </div>

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
                <Label>Company name</Label>
                <Input
                  placeholder="Company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
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
              <Button
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => setCommunicationSettingsOpen(true)}
              >
                Communication settings
              </Button>
            </div>

            {/* Lead information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Lead information</h3>
              <div>
                <Label>Lead source</Label>
                <Input
                  placeholder="Lead source"
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                />
              </div>
            </div>

            {/* Additional client details */}
            <Collapsible open={additionalClientDetailsOpen} onOpenChange={setAdditionalClientDetailsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                <span className="font-semibold">Additional client details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${additionalClientDetailsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary"
                  onClick={() => setCustomFieldDialogOpen(true)}
                >
                  Add custom field
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Additional contacts */}
            <Collapsible open={additionalContactsOpen} onOpenChange={setAdditionalContactsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                <span className="font-semibold">Additional contacts</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${additionalContactsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary"
                  onClick={() => setContactDialogOpen(true)}
                >
                  Add contact
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t pt-6" />

            {/* Property address */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Property address</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the primary service address, billing address, or any additional locations where services may take place.
                </p>
              </div>

              <div>
                <Label>Street 1</Label>
                <Input
                  placeholder="Street 1"
                  value={formData.street1}
                  onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                />
              </div>

              <div>
                <Label>Street 2</Label>
                <Input
                  placeholder="Street 2"
                  value={formData.street2}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Province</Label>
                  <Input
                    placeholder="Province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Postal code</Label>
                  <Input
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>No tax rate created</Label>
                <Input
                  placeholder="No tax rate created"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billing-same"
                  checked={formData.billingAddressSame}
                  onCheckedChange={(checked) => setFormData({ ...formData, billingAddressSame: checked as boolean })}
                />
                <Label htmlFor="billing-same" className="cursor-pointer">
                  Billing address is the same as property address
                </Label>
              </div>

              <Button variant="outline" size="sm" className="text-primary border-primary" onClick={addAnotherProperty}>
                Add Another Address
              </Button>
            </div>

            {/* Property details */}
            <Collapsible open={propertyDetailsOpen} onOpenChange={setPropertyDetailsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                <span className="font-semibold">Property details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${propertyDetailsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Need to gather specialized information? Create custom fields to capture exactly what matters to you.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary"
                    onClick={() => setPropertyCustomFieldDialogOpen(true)}
                  >
                    Add custom field
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Property contacts */}
            <Collapsible open={propertyContactsOpen} onOpenChange={setPropertyContactsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                <span className="font-semibold">Property contacts</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${propertyContactsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    For contacts with access limited to this property, e.g., tenants.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary"
                    onClick={() => setPropertyContactDialogOpen(true)}
                  >
                    Add contact
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Additional Properties */}
            {additionalProperties.map((property, index) => (
              <div key={property.id} className="space-y-4 border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Property name</Label>
                    <Input
                      placeholder="Property name"
                      value={property.propertyName}
                      onChange={(e) => updateProperty(property.id, { propertyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Street 1</Label>
                    <Input
                      placeholder="Street 1"
                      value={property.street1}
                      onChange={(e) => updateProperty(property.id, { street1: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Street 2</Label>
                    <Input
                      placeholder="Street 2"
                      value={property.street2}
                      onChange={(e) => updateProperty(property.id, { street2: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={property.city}
                        onChange={(e) => updateProperty(property.id, { city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Province</Label>
                      <Input
                        placeholder="Province"
                        value={property.province}
                        onChange={(e) => updateProperty(property.id, { province: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Postal code</Label>
                      <Input
                        placeholder="Postal code"
                        value={property.postalCode}
                        onChange={(e) => updateProperty(property.id, { postalCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Select
                        value={property.country}
                        onValueChange={(value) => updateProperty(property.id, { country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>No tax rate created</Label>
                    <Input
                      placeholder="No tax rate created"
                      value={property.taxRate}
                      onChange={(e) => updateProperty(property.id, { taxRate: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`billing-same-${property.id}`}
                      checked={property.billingAddressSame}
                      onCheckedChange={(checked) =>
                        updateProperty(property.id, { billingAddressSame: checked as boolean })
                      }
                    />
                    <Label htmlFor={`billing-same-${property.id}`} className="cursor-pointer">
                      Billing address is the same as property address
                    </Label>
                  </div>
                </div>

                {/* Property details for additional property */}
                <Collapsible
                  open={property.detailsOpen}
                  onOpenChange={(open) => updateProperty(property.id, { detailsOpen: open })}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                    <span className="font-semibold">Property details</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${property.detailsOpen ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Need to gather specialized information? Create custom fields to capture exactly what matters to you.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary"
                        onClick={() => setPropertyCustomFieldDialogOpen(true)}
                      >
                        Add custom field
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Property contacts for additional property */}
                <Collapsible
                  open={property.contactsOpen}
                  onOpenChange={(open) => updateProperty(property.id, { contactsOpen: open })}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                    <span className="font-semibold">Property contacts</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${property.contactsOpen ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        For contacts with access limited to this property, e.g., tenants.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary"
                        onClick={() => setPropertyContactDialogOpen(true)}
                      >
                        Add contact
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button variant="destructive" size="sm" onClick={() => removeProperty(property.id)}>
                  Remove property
                </Button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="text-primary border-primary" onClick={() => handleSubmit(true)}>
                Save and Create Another
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => handleSubmit(false)}>
                Save client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddCustomFieldDialog open={customFieldDialogOpen} onOpenChange={setCustomFieldDialogOpen} appliesTo="clients" />
      <AddContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <AddCustomFieldDialog open={propertyCustomFieldDialogOpen} onOpenChange={setPropertyCustomFieldDialogOpen} appliesTo="properties" />
      <AddContactDialog open={propertyContactDialogOpen} onOpenChange={setPropertyContactDialogOpen} />
      <CommunicationSettingsDialog open={communicationSettingsOpen} onOpenChange={setCommunicationSettingsOpen} />
    </>
  );
};
