import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  contacts?: { name: string } | null;
};

type InvoiceDetailDialogProps = {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
};

const invoiceSchema = z.object({
  invoice_number: z.string().trim().min(1, "Invoice number is required").max(50, "Invoice number must be less than 50 characters"),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  total_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Total amount must be a valid number",
  }),
  due_date: z.string().optional(),
  paid_date: z.string().optional(),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-600";
    case "sent": return "bg-blue-600";
    case "overdue": return "bg-red-600";
    case "cancelled": return "bg-gray-600";
    default: return "bg-yellow-600";
  }
};

export const InvoiceDetailDialog = ({ invoice, open, onOpenChange, onUpdate, onDelete }: InvoiceDetailDialogProps) => {
  const [currency, setCurrency] = useState("USD");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    status: "draft" as const,
    total_amount: "",
    due_date: "",
    paid_date: "",
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
      if (invoice) {
        setFormData({
          invoice_number: invoice.invoice_number,
          status: invoice.status as any,
          total_amount: invoice.total_amount.toString(),
          due_date: invoice.due_date ? invoice.due_date.split('T')[0] : "",
          paid_date: invoice.paid_date ? invoice.paid_date.split('T')[0] : "",
        });
      }
      setIsEditing(false);
    }
  }, [open, invoice]);

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
      const validated = invoiceSchema.parse(formData);
      setIsSaving(true);

      const { error } = await supabase
        .from("invoices")
        .update({
          invoice_number: validated.invoice_number,
          status: validated.status,
          total_amount: parseFloat(validated.total_amount),
          due_date: validated.due_date || null,
          paid_date: validated.paid_date || null,
        })
        .eq("id", invoice!.id);

      if (error) throw error;

      toast.success("Invoice updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating invoice:", error);
        toast.error("Failed to update invoice");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice!.id);

      if (error) throw error;

      toast.success("Invoice deleted successfully!");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!invoice) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Invoice {isEditing ? (
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="Invoice number"
                  className="text-2xl font-semibold h-auto p-2 inline-block w-auto"
                />
              ) : (
                invoice.invoice_number
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
              <p className="font-medium">{invoice.contacts?.name || "No client"}</p>
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
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
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
                <p className="font-medium text-2xl">{getCurrencySymbol(currency)}{invoice.total_amount.toLocaleString()}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium">{format(new Date(invoice.created_at), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Due Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              ) : (
                <p className="font-medium">
                  {invoice.due_date ? format(new Date(invoice.due_date), "MMM dd, yyyy") : "Not set"}
                </p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Paid Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                />
              ) : (
                <p className="font-medium">
                  {invoice.paid_date ? format(new Date(invoice.paid_date), "MMM dd, yyyy") : "Not paid"}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Invoice
          </Button>
          {isEditing && (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData({
                invoice_number: invoice.invoice_number,
                status: invoice.status as any,
                total_amount: invoice.total_amount.toString(),
                due_date: invoice.due_date ? invoice.due_date.split('T')[0] : "",
                paid_date: invoice.paid_date ? invoice.paid_date.split('T')[0] : "",
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
            This will permanently delete this invoice. This action cannot be undone.
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