import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { format } from "date-fns";
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

type Job = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  completion_date: string | null;
  total_amount: number;
  job_number: string | null;
  salesperson: string | null;
  internal_notes: string | null;
  visit_instructions: string | null;
  repeat: string | null;
  total_visits: number | null;
  schedule_later: boolean | null;
  anytime: boolean | null;
  email_team: boolean | null;
  remind_to_invoice: boolean | null;
  split_invoices: boolean | null;
  job_type: string | null;
  contact_id: string | null;
  contacts?: { name: string } | null;
};

type JobDetailDialogProps = {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onUpdate?: () => void;
};

const jobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  status: z.enum(["draft", "scheduled", "in_progress", "completed"]),
  total_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Total amount must be a valid number",
  }),
  scheduled_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  job_number: z.string().optional(),
  salesperson: z.string().optional(),
  internal_notes: z.string().optional(),
  visit_instructions: z.string().optional(),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-600";
    case "in_progress": return "bg-blue-600";
    case "scheduled": return "bg-purple-600";
    default: return "bg-gray-600";
  }
};

export const JobDetailDialog = ({ job, open, onOpenChange, onDelete, onUpdate }: JobDetailDialogProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [formData, setFormData] = useState({
    title: "",
    status: "draft" as const,
    total_amount: "",
    scheduled_date: "",
    start_time: "",
    end_time: "",
    job_number: "",
    salesperson: "",
    internal_notes: "",
    visit_instructions: "",
    description: "",
  });

  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("currency")
          .eq("id", user.id)
          .single();

        if (data?.currency) {
          setCurrency(data.currency);
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };

    if (open) {
      fetchUserCurrency();
      if (job) {
        setFormData({
          title: job.title,
          status: job.status as any,
          total_amount: job.total_amount.toString(),
          scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : "",
          start_time: job.start_time || "",
          end_time: job.end_time || "",
          job_number: job.job_number || "",
          salesperson: job.salesperson || "",
          internal_notes: job.internal_notes || "",
          visit_instructions: job.visit_instructions || "",
          description: job.description || "",
        });
      }
      setIsEditing(false);
    }
  }, [open, job]);

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$", NZD: "NZ$",
      JPY: "¥", INR: "₹", BRL: "R$", MXN: "MX$", ZAR: "R",
      SEK: "kr", NOK: "kr", DKK: "kr", CHF: "Fr", PLN: "zł", CZK: "Kč", SGD: "S$"
    };
    return symbols[currencyCode] || currencyCode;
  };

  const handleSave = async () => {
    try {
      const validated = jobSchema.parse(formData);
      setIsSaving(true);

      const updateData: any = {
        title: validated.title,
        status: validated.status,
        total_amount: parseFloat(validated.total_amount),
        scheduled_date: validated.scheduled_date || null,
        start_time: validated.start_time || null,
        end_time: validated.end_time || null,
        job_number: validated.job_number || null,
        salesperson: validated.salesperson || null,
        internal_notes: validated.internal_notes || null,
        visit_instructions: validated.visit_instructions || null,
        description: validated.description || null,
      };

      // Set completion_date if status is completed
      if (validated.status === 'completed' && job?.status !== 'completed') {
        updateData.completion_date = new Date().toISOString();
      } else if (validated.status !== 'completed') {
        updateData.completion_date = null;
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", job!.id);

      if (error) throw error;

      toast.success("Job updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating job:", error);
        toast.error("Failed to update job");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!job) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", job.id);

      if (error) throw error;

      toast.success("Job deleted successfully!");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  job.title
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
              <p className="font-medium">{job.contacts?.name || "No client"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              {isEditing ? (
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Total Amount</Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground z-10">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="pl-16"
                  />
                </div>
              ) : (
                <p className="font-medium text-xl">{getCurrencySymbol(currency)}{job.total_amount.toLocaleString()}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Scheduled Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              ) : (
                <p className="font-medium">
                  {job.scheduled_date ? format(new Date(job.scheduled_date), "MMM dd, yyyy") : "Not scheduled"}
                </p>
              )}
            </div>
          </div>

          {job.completion_date && (
            <div>
              <Label className="text-muted-foreground">Completion Date</Label>
              <p className="font-medium">{format(new Date(job.completion_date), "MMM dd, yyyy")}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Job Number</Label>
              {isEditing ? (
                <Input
                  value={formData.job_number}
                  onChange={(e) => setFormData({ ...formData, job_number: e.target.value })}
                  placeholder="Job number"
                />
              ) : (
                <p className="font-medium">{job.job_number || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Salesperson</Label>
              {isEditing ? (
                <Input
                  value={formData.salesperson}
                  onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                  placeholder="Salesperson"
                />
              ) : (
                <p className="font-medium">{job.salesperson || "Not set"}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Time</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              ) : (
                <p className="font-medium">{job.start_time || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">End Time</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              ) : (
                <p className="font-medium">{job.end_time || "Not set"}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Job Type</Label>
              <p className="font-medium">{job.job_type || "One-off"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Repeat</Label>
              <p className="font-medium">{job.repeat || "Does not repeat"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Visits</Label>
              <p className="font-medium">{job.total_visits || 1}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.schedule_later || false}
                disabled
                className="w-4 h-4"
              />
              <Label>Schedule Later</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.anytime || false}
                disabled
                className="w-4 h-4"
              />
              <Label>Anytime</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.email_team || false}
                disabled
                className="w-4 h-4"
              />
              <Label>Email Team</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.remind_to_invoice || false}
                disabled
                className="w-4 h-4"
              />
              <Label>Remind to Invoice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.split_invoices || false}
                disabled
                className="w-4 h-4"
              />
              <Label>Split Invoices</Label>
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
              <p className="mt-2 text-sm whitespace-pre-wrap">{job.description || "No description"}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Visit Instructions</Label>
            {isEditing ? (
              <Textarea
                value={formData.visit_instructions}
                onChange={(e) => setFormData({ ...formData, visit_instructions: e.target.value })}
                placeholder="Visit instructions"
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{job.visit_instructions || "No instructions"}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Internal Notes</Label>
            {isEditing ? (
              <Textarea
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                placeholder="Internal notes"
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{job.internal_notes || "No notes"}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Job
          </Button>
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setFormData({
                  title: job.title,
                  status: job.status as any,
                  total_amount: job.total_amount.toString(),
                  scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : "",
                  start_time: job.start_time || "",
                  end_time: job.end_time || "",
                  job_number: job.job_number || "",
                  salesperson: job.salesperson || "",
                  internal_notes: job.internal_notes || "",
                  visit_instructions: job.visit_instructions || "",
                  description: job.description || "",
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
            This will permanently delete this job. This action cannot be undone.
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