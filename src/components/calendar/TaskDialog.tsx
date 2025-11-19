import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: any[];
  formData: any;
  setFormData: (data: any) => void;
  scheduleLater: boolean;
  setScheduleLater: (value: boolean) => void;
  allDay: boolean;
  setAllDay: (value: boolean) => void;
  repeats: string;
  setRepeats: (value: string) => void;
  assignedMembers: string[];
  setAssignedMembers: (members: string[]) => void;
  emailTeam: boolean;
  setEmailTeam: (value: boolean) => void;
  teamReminder: string;
  setTeamReminder: (value: string) => void;
  onSubmit: () => void;
  onCreateNewClient: () => void;
}

export const TaskDialog = ({
  open,
  onOpenChange,
  contacts,
  formData,
  setFormData,
  scheduleLater,
  setScheduleLater,
  allDay,
  setAllDay,
  repeats,
  setRepeats,
  assignedMembers,
  setAssignedMembers,
  emailTeam,
  setEmailTeam,
  teamReminder,
  setTeamReminder,
  onSubmit,
  onCreateNewClient
}: TaskDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Task for {formData.contact_id ? contacts.find(c => c.id === formData.contact_id)?.name : "Client Name"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add a task with schedule and team assignment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-xs sm:text-sm">Client *</Label>
            <div className="flex gap-2">
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
                <SelectTrigger className="flex-1 text-xs sm:text-sm">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="create_new" className="text-primary font-medium text-xs sm:text-sm">
                    + Create New Client
                  </SelectItem>
                  {contacts.length > 0 && <DropdownMenuSeparator />}
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id} className="text-xs sm:text-sm">
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">Instructions</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task instructions..."
              rows={4}
              className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Schedule Section */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
              <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Schedule</h4>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Start date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date ? formData.scheduled_date.split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.scheduled_date ? formData.scheduled_date.split('T')[1] : '00:00';
                      setFormData({ ...formData, scheduled_date: date ? `${date}T${time}` : '' });
                    }}
                    className="text-xs sm:text-sm"
                    disabled={scheduleLater}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">End date</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="text-xs sm:text-sm"
                    disabled={scheduleLater}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Start time</Label>
                  <Input
                    type="time"
                    value={formData.scheduled_date ? formData.scheduled_date.split('T')[1]?.substring(0, 5) : ''}
                    onChange={(e) => {
                      const date = formData.scheduled_date ? formData.scheduled_date.split('T')[0] : new Date().toISOString().split('T')[0];
                      setFormData({ ...formData, scheduled_date: `${date}T${e.target.value}` });
                    }}
                    className="text-xs sm:text-sm"
                    disabled={scheduleLater || allDay}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">End time</Label>
                  <Input
                    type="time"
                    disabled
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scheduleLater" 
                  checked={scheduleLater}
                  onCheckedChange={(checked) => setScheduleLater(checked as boolean)}
                />
                <label htmlFor="scheduleLater" className="text-xs sm:text-sm cursor-pointer">
                  Schedule later
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allDay"
                  checked={allDay}
                  onCheckedChange={(checked) => setAllDay(checked as boolean)}
                />
                <label htmlFor="allDay" className="text-xs sm:text-sm cursor-pointer">
                  All day
                </label>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Repeats</Label>
                <Select value={repeats} onValueChange={setRepeats}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Section */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="font-semibold text-base sm:text-lg">Team</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-green-500 border-green-500 hover:bg-green-500/10 text-xs"
                >
                  + Assign
                </Button>
              </div>
              
              <div className="text-xs sm:text-sm text-muted-foreground p-4 border rounded text-center">
                No team members assigned
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="emailTeam"
                  checked={emailTeam}
                  onCheckedChange={(checked) => setEmailTeam(checked as boolean)}
                />
                <label htmlFor="emailTeam" className="text-xs sm:text-sm cursor-pointer">
                  Email team about assignment
                </label>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Team reminder</Label>
                <Select value={teamReminder} onValueChange={setTeamReminder}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="15_minutes">15 minutes before</SelectItem>
                    <SelectItem value="30_minutes">30 minutes before</SelectItem>
                    <SelectItem value="1_hour">1 hour before</SelectItem>
                    <SelectItem value="24_hours">24 hours before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-xs sm:text-sm">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto text-xs sm:text-sm">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
