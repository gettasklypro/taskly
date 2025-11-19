import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircle, Plus, GripVertical, Trash2, X } from "lucide-react";
import { format, addMonths, addWeeks, addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";

interface JobCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: { id: string; name: string }[];
  onSubmit: (data: any) => void;
  onCreateNewClient: () => void;
}

export const JobCreationDialog = ({ open, onOpenChange, contacts, onSubmit, onCreateNewClient }: JobCreationDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_id: "",
    status: "draft",
    scheduled_date: "",
    total_amount: "",
    salesperson: "",
    jobNumber: "",
    jobType: "one-off",
    totalVisits: "1",
    startTime: "",
    endTime: "",
    scheduleLater: false,
    anytime: false,
    emailTeam: false,
    repeat: "does-not-repeat",
    calculatedEndDate: "",
  });

  const [assignedTeamMembers, setAssignedTeamMembers] = useState<string[]>([]);
  const [isAssignedPopoverOpen, setIsAssignedPopoverOpen] = useState(false);
  const [serviceItems, setServiceItems] = useState<{
    id: string;
    name: string;
    quantity: string;
    unitCost: string;
    unitPrice: string;
    description: string;
  }[]>([]);

  useEffect(() => {
    if (formData.scheduled_date) {
      const startDate = new Date(formData.scheduled_date);
      if (formData.jobType === "one-off" && formData.repeat !== "does-not-repeat") {
        const endDate = addMonths(startDate, 6);
        const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        let totalVisits = 1;
        switch (formData.repeat) {
          case "daily": totalVisits = diffDays; break;
          case "weekly": totalVisits = Math.floor(diffDays / 7); break;
          case "monthly": totalVisits = Math.ceil(diffDays / 30); break;
        }
        setFormData(prev => ({ ...prev, totalVisits: totalVisits.toString(), calculatedEndDate: format(endDate, "yyyy-MM-dd") }));
      } else if (formData.jobType === "one-off" && formData.repeat === "does-not-repeat") {
        setFormData(prev => ({ ...prev, totalVisits: "1", calculatedEndDate: "" }));
      }
    }
  }, [formData.scheduled_date, formData.jobType, formData.repeat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    const calculatedTotal = serviceItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return total + (quantity * unitPrice);
    }, 0);
    onSubmit({ ...formData, total_amount: calculatedTotal });
  };

  const handleAddServiceItem = () => {
    setServiceItems([...serviceItems, { id: String(Date.now()), name: "", quantity: "0", unitCost: "0.00", unitPrice: "0.00", description: "" }]);
  };

  const handleRemoveServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const handleServiceItemChange = (id: string, field: string, value: string) => {
    setServiceItems(serviceItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateServiceTotal = (item: { quantity: string; unitPrice: string }) => {
    return ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              required
            />
          </div>

          {/* Client and Job Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select a client</Label>
              <Select 
                value={formData.contact_id} 
                onValueChange={(value) => {
                  if (value === "create_new") {
                    onCreateNewClient();
                  } else {
                    setFormData({ ...formData, contact_id: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_new" className="text-green-600 font-semibold">
                    + Add a client
                  </SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobNumber">Job #</Label>
              <Input
                id="jobNumber"
                value={formData.jobNumber}
                onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          {/* Salesperson */}
          <div className="space-y-2">
            <Label htmlFor="salesperson">Salesperson</Label>
            <Input
              id="salesperson"
              value={formData.salesperson}
              onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
              placeholder="Enter salesperson name"
            />
          </div>

          {/* Job Type */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Job type</h3>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.jobType === "one-off" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, jobType: "one-off" })}
              >
                One-off
              </Button>
              <Button
                type="button"
                variant={formData.jobType === "recurring" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, jobType: "recurring" })}
              >
                Recurring
              </Button>
            </div>
          </div>

          {/* Schedule */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Schedule</h3>
            {formData.scheduled_date && (
              <div className="text-sm">
                <span>Total visits {formData.totalVisits}</span>
                <span className="text-muted-foreground ml-3">
                  {formData.repeat === "does-not-repeat" ? "On" : "First"} {format(new Date(formData.scheduled_date), "MMM dd, yyyy")}
                </span>
                {formData.repeat !== "does-not-repeat" && formData.calculatedEndDate && (
                  <span className="text-muted-foreground ml-3">
                    Last {format(new Date(formData.calculatedEndDate), "MMM dd, yyyy")}
                  </span>
                )}
              </div>
            )}

            {!(formData.jobType === "one-off" && formData.scheduleLater) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    disabled={formData.anytime}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    disabled={formData.anytime}
                  />
                </div>
              </div>
            )}

            {formData.jobType === "one-off" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scheduleLater"
                  checked={formData.scheduleLater}
                  onCheckedChange={(checked) => setFormData({ ...formData, scheduleLater: checked as boolean })}
                />
                <Label htmlFor="scheduleLater" className="font-normal">Schedule later</Label>
              </div>
            )}

            {!(formData.jobType === "one-off" && formData.scheduleLater) && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anytime"
                  checked={formData.anytime}
                  onCheckedChange={(checked) => setFormData({ ...formData, anytime: checked as boolean })}
                />
                <Label htmlFor="anytime" className="font-normal">Anytime</Label>
              </div>
            )}

            <Popover open={isAssignedPopoverOpen} onOpenChange={setIsAssignedPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start">
                  {assignedTeamMembers.length === 0 ? "Assign team members" : `${assignedTeamMembers.length} assigned`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandEmpty>No team members found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem onSelect={() => setIsAssignedPopoverOpen(false)}>
                        No team members available
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailTeam"
                checked={formData.emailTeam}
                onCheckedChange={(checked) => setFormData({ ...formData, emailTeam: checked as boolean })}
              />
              <Label htmlFor="emailTeam" className="font-normal">Email team when assigned</Label>
            </div>

            {formData.jobType === "one-off" && (
              <div className="space-y-2">
                <Label>Repeat</Label>
                <Select value={formData.repeat} onValueChange={(value) => setFormData({ ...formData, repeat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="does-not-repeat">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Services</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddServiceItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {serviceItems.length > 0 && (
              <div className="space-y-3">
                {serviceItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <Input
                          value={item.name}
                          onChange={(e) => handleServiceItemChange(item.id, "name", e.target.value)}
                          placeholder="Service name"
                          className="max-w-[200px]"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveServiceItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleServiceItemChange(item.id, "quantity", e.target.value)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => handleServiceItemChange(item.id, "unitCost", e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleServiceItemChange(item.id, "unitPrice", e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={calculateServiceTotal(item)}
                          disabled
                          className="mt-1 bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
