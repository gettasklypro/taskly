import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Contact = {
  id: string;
  name: string;
  email: string | null;
};

export const Tasks = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactSelect, setShowContactSelect] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    scheduleLater: false,
    allDay: false,
    repeats: "never",
    assignedMembers: [] as string[],
    emailTeam: false,
    teamReminder: "24_hours",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, email")
      .order("name");
    
    if (error) {
      console.error("Error fetching contacts:", error);
      return;
    }
    
    setContacts(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!selectedContact) {
      toast.error("Please select a client");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Construct start_time and end_time based on dates and times
      let startDateTime: string | null = null;
      let endDateTime: string | null = null;

      if (formData.startDate && !formData.scheduleLater) {
        const start = new Date(formData.startDate);
        if (formData.startTime && !formData.allDay) {
          const [hours, minutes] = formData.startTime.split(':');
          start.setHours(parseInt(hours), parseInt(minutes));
        } else {
          start.setHours(0, 0, 0);
        }
        startDateTime = start.toISOString();
      }

      if (formData.endDate && !formData.scheduleLater) {
        const end = new Date(formData.endDate);
        if (formData.endTime && !formData.allDay) {
          const [hours, minutes] = formData.endTime.split(':');
          end.setHours(parseInt(hours), parseInt(minutes));
        } else {
          end.setHours(23, 59, 59);
        }
        endDateTime = end.toISOString();
      }

      const description = `${formData.instructions}
Repeats: ${formData.repeats}
Team: ${formData.assignedMembers.join(', ') || 'Unassigned'}
Email Team: ${formData.emailTeam ? 'Yes' : 'No'}
Reminder: ${formData.teamReminder}`;

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: description,
        status: 'todo',
        priority: 'medium',
        due_date: formData.endDate || null,
        job_id: null,
      });

      if (error) throw error;

      toast.success("Task created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        instructions: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        scheduleLater: false,
        allDay: false,
        repeats: "never",
        assignedMembers: [],
        emailTeam: false,
        teamReminder: "24_hours",
      });
      setSelectedContact(null);
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      instructions: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      scheduleLater: false,
      allDay: false,
      repeats: "never",
      assignedMembers: [],
      emailTeam: false,
      teamReminder: "24_hours",
    });
    setSelectedContact(null);
  };

  const removeAssignedMember = (member: string) => {
    setFormData({
      ...formData,
      assignedMembers: formData.assignedMembers.filter(m => m !== member)
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card border-primary/20 border-2">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">
                Task for{" "}
                {selectedContact ? (
                  <span className="underline decoration-dotted">
                    {selectedContact.name}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowContactSelect(!showContactSelect)}
                    className="underline decoration-dotted hover:text-primary transition-colors"
                  >
                    Client Name
                  </button>
                )}
              </h1>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600"
                onClick={() => setShowContactSelect(!showContactSelect)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact Selection */}
            {showContactSelect && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <Label className="mb-2 block">Select Client</Label>
                <Select
                  value={selectedContact?.id || ""}
                  onValueChange={(value) => {
                    const contact = contacts.find(c => c.id === value);
                    setSelectedContact(contact || null);
                    setShowContactSelect(false);
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="mb-6">
              <Label className="text-sm mb-2 block">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border"
                placeholder="Task title"
              />
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <Label className="text-sm mb-2 block">Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="bg-background border-border min-h-[120px]"
                placeholder="Task instructions..."
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Schedule Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Schedule</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Start date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-background border-border"
                      disabled={formData.scheduleLater}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">End date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-background border-border"
                      disabled={formData.scheduleLater}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Start time</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="bg-background border-border"
                      disabled={formData.scheduleLater || formData.allDay}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">End time</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="bg-background border-border"
                      disabled={formData.scheduleLater || formData.allDay}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scheduleLater"
                    checked={formData.scheduleLater}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, scheduleLater: checked as boolean })
                    }
                  />
                  <label htmlFor="scheduleLater" className="text-sm cursor-pointer">
                    Schedule later
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allDay"
                    checked={formData.allDay}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, allDay: checked as boolean })
                    }
                    className="bg-green-500 border-green-500 data-[state=checked]:bg-green-500"
                  />
                  <label htmlFor="allDay" className="text-sm cursor-pointer">
                    All day
                  </label>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Repeats</Label>
                  <Select
                    value={formData.repeats}
                    onValueChange={(value) => setFormData({ ...formData, repeats: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Team Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Team</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500 border-green-500 hover:bg-green-500/10"
                    onClick={() => {
                      const name = prompt("Enter team member name:");
                      if (name && name.trim()) {
                        setFormData({
                          ...formData,
                          assignedMembers: [...formData.assignedMembers, name.trim()]
                        });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>

                {/* Assigned Members */}
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {formData.assignedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      {member}
                      <button
                        onClick={() => removeAssignedMember(member)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailTeam"
                    checked={formData.emailTeam}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, emailTeam: checked as boolean })
                    }
                  />
                  <label htmlFor="emailTeam" className="text-sm cursor-pointer">
                    Email team about assignment
                  </label>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Team reminder</Label>
                  <Select
                    value={formData.teamReminder}
                    onValueChange={(value) => setFormData({ ...formData, teamReminder: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="15_minutes">15 minutes before</SelectItem>
                      <SelectItem value="30_minutes">30 minutes before</SelectItem>
                      <SelectItem value="1_hour">1 hour before</SelectItem>
                      <SelectItem value="24_hours">24 hours before</SelectItem>
                      <SelectItem value="1_week">1 week before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="px-8 bg-green-500 hover:bg-green-600"
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
