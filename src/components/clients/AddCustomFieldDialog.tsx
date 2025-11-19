import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddCustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appliesTo: "clients" | "properties";
}

export const AddCustomFieldDialog = ({ open, onOpenChange, appliesTo }: AddCustomFieldDialogProps) => {
  const [formData, setFormData] = useState({
    transferable: false,
    fieldName: "",
    fieldType: "text",
    defaultValue: "",
  });

  const handleSubmit = () => {
    // Handle custom field creation
    console.log("Custom field data:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New custom field</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">APPLIES TO</p>
            <p className="font-semibold">All {appliesTo}</p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="transferable"
              checked={formData.transferable}
              onCheckedChange={(checked) => setFormData({ ...formData, transferable: checked as boolean })}
            />
            <div>
              <Label htmlFor="transferable" className="cursor-pointer font-semibold">
                Transferable field
              </Label>
              <p className="text-sm text-muted-foreground">
                Transferable custom fields allow your data to appear in multiple places and follow you through your workflow
              </p>
            </div>
          </div>

          <div>
            <Label>Custom field name</Label>
            <Input
              placeholder="Custom field name"
              value={formData.fieldName}
              onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
            />
          </div>

          <div>
            <Label>Field type</Label>
            <Select value={formData.fieldType} onValueChange={(value) => setFormData({ ...formData, fieldType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm mb-2">
              <span className="font-semibold">Example</span>
            </p>
            <p className="text-sm">
              Serial Number <span className="bg-muted px-2 py-1 rounded">54A17-HEX</span>
            </p>
          </div>

          <div>
            <Label>Default value</Label>
            <Input
              placeholder="Default value"
              value={formData.defaultValue}
              onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            All custom fields can be edited and reordered in{" "}
            <span className="text-primary cursor-pointer">Settings &gt; Custom Fields</span>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
            Create Custom Field
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
