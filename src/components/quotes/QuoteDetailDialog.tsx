import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type Quote = {
  id: string;
  quote_number: string;
  title: string;
  description: string | null;
  status: string;
  total_amount: number;
  valid_until: string | null;
  salesperson: string | null;
  discount: number | null;
  tax: number | null;
  rating: number | null;
  link_to_jobs: boolean | null;
  link_to_invoices: boolean | null;
  client_message: string | null;
  contract_disclaimer: string | null;
  internal_notes: string | null;
  contacts?: { name: string } | null;
};

type QuoteDetailDialogProps = {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
};

const quoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  quote_number: z.string().trim().min(1, "Quote number is required").max(50, "Quote number must be less than 50 characters"),
  status: z.enum(["draft", "sent", "approved", "declined", "expired"]),
  total_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Total amount must be a valid number",
  }),
  discount: z.string().optional(),
  tax: z.string().optional(),
  rating: z.string().optional(),
  salesperson: z.string().max(100, "Salesperson must be less than 100 characters").optional(),
  valid_until: z.string().optional(),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  client_message: z.string().optional(),
  contract_disclaimer: z.string().optional(),
  internal_notes: z.string().optional(),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-600";
    case "sent": return "bg-blue-600";
    case "declined": return "bg-red-600";
    case "expired": return "bg-gray-600";
    default: return "bg-yellow-600";
  }
};

export const QuoteDetailDialog = ({ quote, open, onOpenChange, onUpdate, onDelete }: QuoteDetailDialogProps) => {
  const [currency, setCurrency] = useState("USD");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    quote_number: "",
    status: "draft" as const,
    total_amount: "",
    discount: "",
    tax: "",
    rating: "",
    salesperson: "",
    valid_until: "",
    description: "",
    client_message: "",
    contract_disclaimer: "",
    internal_notes: "",
    link_to_jobs: false,
    link_to_invoices: false,
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
      if (quote) {
        setFormData({
          title: quote.title,
          quote_number: quote.quote_number,
          status: quote.status as any,
          total_amount: quote.total_amount.toString(),
          discount: quote.discount?.toString() || "",
          tax: quote.tax?.toString() || "",
          rating: quote.rating?.toString() || "",
          salesperson: quote.salesperson || "",
          valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : "",
          description: quote.description || "",
          client_message: quote.client_message || "",
          contract_disclaimer: quote.contract_disclaimer || "",
          internal_notes: quote.internal_notes || "",
          link_to_jobs: quote.link_to_jobs || false,
          link_to_invoices: quote.link_to_invoices || false,
        });
      }
      setIsEditing(false);
    }
  }, [open, quote]);

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
      const validated = quoteSchema.parse(formData);
      setIsSaving(true);

      const { error } = await supabase
        .from("quotes")
        .update({
          title: validated.title,
          quote_number: validated.quote_number,
          status: validated.status,
          total_amount: parseFloat(validated.total_amount),
          discount: validated.discount ? parseFloat(validated.discount) : null,
          tax: validated.tax ? parseFloat(validated.tax) : null,
          rating: validated.rating ? parseInt(validated.rating) : null,
          salesperson: validated.salesperson || null,
          valid_until: validated.valid_until || null,
          description: validated.description || null,
          client_message: validated.client_message || null,
          contract_disclaimer: validated.contract_disclaimer || null,
          internal_notes: validated.internal_notes || null,
          link_to_jobs: formData.link_to_jobs,
          link_to_invoices: formData.link_to_invoices,
        })
        .eq("id", quote!.id);

      if (error) throw error;

      toast.success("Quote updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating quote:", error);
        toast.error("Failed to update quote");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quote!.id);

      if (error) throw error;

      toast.success("Quote deleted successfully!");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!quote) return null;

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
                quote.title
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
              <Label className="text-muted-foreground">Quote Number</Label>
              {isEditing ? (
                <Input
                  value={formData.quote_number}
                  onChange={(e) => setFormData({ ...formData, quote_number: e.target.value })}
                  placeholder="Quote number"
                />
              ) : (
                <p className="font-medium">{quote.quote_number}</p>
              )}
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Client</Label>
              <p className="font-medium">{quote.contacts?.name || "No client"}</p>
            </div>
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
                <p className="font-medium text-xl">{getCurrencySymbol(currency)}{quote.total_amount.toLocaleString()}</p>
              )}
            </div>
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
              <p className="font-medium">{quote.salesperson || "Not set"}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Valid Until</Label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            ) : (
              <p className="font-medium">
                {quote.valid_until ? format(new Date(quote.valid_until), "MMM dd, yyyy") : "Not set"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Discount</Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground z-10">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0.00"
                    className="pl-16"
                  />
                </div>
              ) : (
                <p className="font-medium">{quote.discount ? `${getCurrencySymbol(currency)}${quote.discount.toLocaleString()}` : "None"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Tax</Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground z-10">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    placeholder="0.00"
                    className="pl-16"
                  />
                </div>
              ) : (
                <p className="font-medium">{quote.tax ? `${getCurrencySymbol(currency)}${quote.tax.toLocaleString()}` : "None"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Rating</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="1-5"
                />
              ) : (
                <p className="font-medium">{quote.rating ? `${quote.rating}/5` : "Not rated"}</p>
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
              <p className="mt-2 text-sm whitespace-pre-wrap">{quote.description || "No description"}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Client Message</Label>
            {isEditing ? (
              <Textarea
                value={formData.client_message}
                onChange={(e) => setFormData({ ...formData, client_message: e.target.value })}
                placeholder="Client message"
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{quote.client_message || "No message"}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Contract Disclaimer</Label>
            {isEditing ? (
              <Textarea
                value={formData.contract_disclaimer}
                onChange={(e) => setFormData({ ...formData, contract_disclaimer: e.target.value })}
                placeholder="Contract disclaimer"
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{quote.contract_disclaimer || "No disclaimer"}</p>
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
              <p className="mt-2 text-sm whitespace-pre-wrap">{quote.internal_notes || "No notes"}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="link_to_jobs"
                checked={formData.link_to_jobs}
                onChange={(e) => setFormData({ ...formData, link_to_jobs: e.target.checked })}
                disabled={!isEditing}
                className="w-4 h-4"
              />
              <Label htmlFor="link_to_jobs" className="cursor-pointer">Link to Jobs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="link_to_invoices"
                checked={formData.link_to_invoices}
                onChange={(e) => setFormData({ ...formData, link_to_invoices: e.target.checked })}
                disabled={!isEditing}
                className="w-4 h-4"
              />
              <Label htmlFor="link_to_invoices" className="cursor-pointer">Link to Invoices</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Quote
          </Button>
          {isEditing && (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData({
                title: quote.title,
                quote_number: quote.quote_number,
                status: quote.status as any,
                total_amount: quote.total_amount.toString(),
                discount: quote.discount?.toString() || "",
                tax: quote.tax?.toString() || "",
                rating: quote.rating?.toString() || "",
                salesperson: quote.salesperson || "",
                valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : "",
                description: quote.description || "",
                client_message: quote.client_message || "",
                contract_disclaimer: quote.contract_disclaimer || "",
                internal_notes: quote.internal_notes || "",
                link_to_jobs: quote.link_to_jobs || false,
                link_to_invoices: quote.link_to_invoices || false,
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
            This will permanently delete this quote. This action cannot be undone.
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