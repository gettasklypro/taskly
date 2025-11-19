import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, Receipt, Pencil, X, Check } from "lucide-react";
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

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  reimburse_to: string;
  created_at: string;
  receipt_url: string | null;
};

type ExpenseDetailDialogProps = {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
};

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  expense_date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  reimburse_to: z.string().max(100, "Reimburse to must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

export const ExpenseDetailDialog = ({ expense, open, onOpenChange, onUpdate, onDelete }: ExpenseDetailDialogProps) => {
  const [currency, setCurrency] = useState("USD");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    expense_date: "",
    category: "",
    reimburse_to: "",
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
      if (expense) {
        setFormData({
          amount: expense.amount.toString(),
          expense_date: expense.expense_date.split('T')[0],
          category: expense.category,
          reimburse_to: expense.reimburse_to,
          description: expense.description || "",
        });
      }
      setIsEditing(false);
    }
  }, [open, expense]);

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
      const validated = expenseSchema.parse(formData);
      setIsSaving(true);

      const { error } = await supabase
        .from("expenses")
        .update({
          amount: parseFloat(validated.amount),
          expense_date: validated.expense_date,
          category: validated.category,
          reimburse_to: validated.reimburse_to,
          description: validated.description || null,
        })
        .eq("id", expense!.id);

      if (error) throw error;

      toast.success("Expense updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating expense:", error);
        toast.error("Failed to update expense");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expense!.id);

      if (error) throw error;

      toast.success("Expense deleted successfully!");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!expense) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {isEditing ? (
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category"
                  className="text-2xl font-semibold h-auto p-2"
                />
              ) : (
                expense.category
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
              <Label className="text-muted-foreground">Amount</Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground z-10">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-16"
                  />
                </div>
              ) : (
                <p className="font-medium text-2xl text-red-600">
                  {getCurrencySymbol(currency)}{parseFloat(expense.amount.toString()).toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              ) : (
                <p className="font-medium">{format(new Date(expense.expense_date), "MMM dd, yyyy")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Reimburse To</Label>
              {isEditing ? (
                <Input
                  value={formData.reimburse_to}
                  onChange={(e) => setFormData({ ...formData, reimburse_to: e.target.value })}
                  placeholder="Reimburse to"
                />
              ) : (
                <p className="font-medium">{expense.reimburse_to}</p>
              )}
            </div>
            {expense.receipt_url && (
              <div>
                <Label className="text-muted-foreground">Receipt</Label>
                <div className="mt-1">
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Receipt className="w-4 h-4" />
                    View Receipt
                  </a>
                </div>
              </div>
            )}
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
              <p className="mt-2 text-sm whitespace-pre-wrap">{expense.description || "No description"}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Expense
          </Button>
          {isEditing && (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData({
                amount: expense.amount.toString(),
                expense_date: expense.expense_date.split('T')[0],
                category: expense.category,
                reimburse_to: expense.reimburse_to,
                description: expense.description || "",
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
            This will permanently delete this expense. This action cannot be undone.
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
