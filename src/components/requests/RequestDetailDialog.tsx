import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Request = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  schedule_later: boolean | null;
  anytime: boolean | null;
  on_site_assessment: boolean | null;
  assessment_instructions: string | null;
  email_team: boolean | null;
  team_reminder: string | null;
  notes: string | null;
  created_at: string;
  contacts?: { name: string } | null;
};

type RequestDetailDialogProps = {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
};

const requestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  contact_id: z.string().optional(),
  status: z.enum(["new", "contacted", "quoted", "converted", "lost"]),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "bg-blue-600";
    case "contacted": return "bg-yellow-600";
    case "quoted": return "bg-purple-600";
    case "converted": return "bg-green-600";
    case "lost": return "bg-red-600";
    default: return "bg-gray-600";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-600";
    case "medium": return "bg-yellow-600";
    case "low": return "bg-blue-600";
    default: return "bg-gray-600";
  }
};

export const RequestDetailDialog = ({ request, open, onOpenChange, onUpdate, onDelete }: RequestDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    contact_id: "",
    status: "new" as const,
    priority: "medium" as const,
    description: "",
    scheduled_start_date: "",
    scheduled_end_date: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    schedule_later: false,
    anytime: false,
    on_site_assessment: false,
    assessment_instructions: "",
    email_team: false,
    team_reminder: "no-reminder",
    notes: "",
  });

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from("contacts")
        .select("id, name")
        .order("name");
      setContacts(data || []);
    };

    if (open) {
      fetchContacts();
      if (request) {
        setFormData({
          title: request.title,
          contact_id: request.contacts?.name || "",
          status: request.status as any,
          priority: request.priority as any,
          description: request.description || "",
          scheduled_start_date: request.scheduled_start_date ? request.scheduled_start_date.split('T')[0] : "",
          scheduled_end_date: request.scheduled_end_date ? request.scheduled_end_date.split('T')[0] : "",
          scheduled_start_time: request.scheduled_start_time || "",
          scheduled_end_time: request.scheduled_end_time || "",
          schedule_later: request.schedule_later || false,
          anytime: request.anytime || false,
          on_site_assessment: request.on_site_assessment || false,
          assessment_instructions: request.assessment_instructions || "",
          email_team: request.email_team || false,
          team_reminder: request.team_reminder || "no-reminder",
          notes: request.notes || "",
        });
      }
      setIsEditing(false);
    }
  }, [open, request]);

  const handleSave = async () => {
    try {
      const validated = requestSchema.parse(formData);
      setIsSaving(true);

      const { error } = await supabase
        .from("service_requests")
        .update({
          title: validated.title,
          status: validated.status,
          priority: validated.priority,
          description: validated.description || null,
          scheduled_start_date: formData.scheduled_start_date || null,
          scheduled_end_date: formData.scheduled_end_date || null,
          scheduled_start_time: formData.scheduled_start_time || null,
          scheduled_end_time: formData.scheduled_end_time || null,
          schedule_later: formData.schedule_later,
          anytime: formData.anytime,
          on_site_assessment: formData.on_site_assessment,
          assessment_instructions: formData.assessment_instructions || null,
          email_team: formData.email_team,
          team_reminder: formData.team_reminder,
          notes: formData.notes || null,
        })
        .eq("id", request!.id);

      if (error) throw error;

      toast.success("Request updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating request:", error);
        toast.error("Failed to update request");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("id", request!.id);

      if (error) throw error;

      toast.success("Request deleted successfully!");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!request) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                  className="text-2xl font-semibold h-auto p-2"
                />
              ) : (
                request.title
              )}
            </DialogTitle>
            {!isEditing && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Client</Label>
              {isEditing ? (
                <Input
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  placeholder="Client name"
                  disabled
                />
              ) : (
                <p className="font-medium">{request.contacts?.name || "No client"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium">{format(new Date(request.created_at), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              {isEditing ? (
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Priority</Label>
              {isEditing ? (
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Description</Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{request.description || "No description"}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.scheduled_start_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_start_date: e.target.value })}
                />
              ) : (
                <p className="mt-1">{request.scheduled_start_date ? format(new Date(request.scheduled_start_date), "MMM dd, yyyy") : "Not scheduled"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">End Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.scheduled_end_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_end_date: e.target.value })}
                />
              ) : (
                <p className="mt-1">{request.scheduled_end_date ? format(new Date(request.scheduled_end_date), "MMM dd, yyyy") : "Not scheduled"}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Time</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={formData.scheduled_start_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
                />
              ) : (
                <p className="mt-1">{request.scheduled_start_time || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">End Time</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={formData.scheduled_end_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                />
              ) : (
                <p className="mt-1">{request.scheduled_end_time || "Not set"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="schedule_later"
                  checked={formData.schedule_later}
                  onChange={(e) => setFormData({ ...formData, schedule_later: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="schedule_later" className="cursor-pointer">Schedule Later</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anytime"
                  checked={formData.anytime}
                  onChange={(e) => setFormData({ ...formData, anytime: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="anytime" className="cursor-pointer">Anytime</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="on_site_assessment"
                  checked={formData.on_site_assessment}
                  onChange={(e) => setFormData({ ...formData, on_site_assessment: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="on_site_assessment" className="cursor-pointer">On-site Assessment</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="email_team"
                  checked={formData.email_team}
                  onChange={(e) => setFormData({ ...formData, email_team: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="email_team" className="cursor-pointer">Email Team</Label>
              </div>
            </div>
          )}

          {formData.on_site_assessment && (
            <div>
              <Label className="text-muted-foreground">Assessment Instructions</Label>
              {isEditing ? (
                <Textarea
                  value={formData.assessment_instructions}
                  onChange={(e) => setFormData({ ...formData, assessment_instructions: e.target.value })}
                  placeholder="Instructions for assessment"
                  rows={3}
                  className="mt-2"
                />
              ) : (
                <p className="mt-2 text-sm">{request.assessment_instructions || "No instructions"}</p>
              )}
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Notes</Label>
            {isEditing ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{request.notes || "No notes"}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Request
          </Button>
          {isEditing && (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData({
                title: request.title,
                contact_id: request.contacts?.name || "",
                status: request.status as any,
                priority: request.priority as any,
                description: request.description || "",
                scheduled_start_date: request.scheduled_start_date ? request.scheduled_start_date.split('T')[0] : "",
                scheduled_end_date: request.scheduled_end_date ? request.scheduled_end_date.split('T')[0] : "",
                scheduled_start_time: request.scheduled_start_time || "",
                scheduled_end_time: request.scheduled_end_time || "",
                schedule_later: request.schedule_later || false,
                anytime: request.anytime || false,
                on_site_assessment: request.on_site_assessment || false,
                assessment_instructions: request.assessment_instructions || "",
                email_team: request.email_team || false,
                team_reminder: request.team_reminder || "no-reminder",
                notes: request.notes || "",
              });
            }}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this request. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
