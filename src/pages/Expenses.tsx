import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, DollarSign, Receipt, Paperclip, X, Image, Wallet } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExpenseDetailDialog } from "@/components/expenses/ExpenseDetailDialog";

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

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<{ name: string; url: string; path: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseDetailDialogOpen, setExpenseDetailDialogOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split('T')[0],
    reimburse_to: "Not reimbursable",
  });

  useEffect(() => {
    fetchExpenses();
    fetchUserCurrency();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchExpenses)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$", NZD: "NZ$",
      JPY: "¥", INR: "₹", BRL: "R$", MXN: "MX$", ZAR: "R",
      SEK: "kr", NOK: "kr", DKK: "kr", CHF: "Fr", PLN: "zł", CZK: "Kč", SGD: "S$"
    };
    return symbols[currencyCode] || currencyCode;
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/receipts/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('request-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('request-files')
        .getPublicUrl(fileName);

      setUploadedReceipt({
        name: file.name,
        url: publicUrl,
        path: fileName
      });

      toast.success("Receipt uploaded successfully!");
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveReceipt = async () => {
    if (!uploadedReceipt) return;

    try {
      const { error } = await supabase.storage
        .from('request-files')
        .remove([uploadedReceipt.path]);

      if (error) throw error;

      setUploadedReceipt(null);
      toast.success("Receipt removed successfully!");
    } catch (error) {
      console.error("Error removing receipt:", error);
      toast.error("Failed to remove receipt");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast.error("Category and amount are required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("expenses").insert([{
        user_id: user.id,
        category: formData.category.trim(),
        description: formData.description.trim() || null,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        reimburse_to: formData.reimburse_to,
        receipt_url: uploadedReceipt?.url || null,
      }] as any);

      if (error) throw error;

      toast.success("Expense recorded successfully!");
      setIsDialogOpen(false);
      setFormData({ category: "", description: "", amount: "", expense_date: new Date().toISOString().split('T')[0], reimburse_to: "Not reimbursable" });
      setUploadedReceipt(null);
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to record expense");
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Expenses" 
        description="Track business expenses and receipts"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Expense</DialogTitle>
                <DialogDescription>
                  Log a new business expense
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Fuel, Tools, Supplies"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expense details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense_date">Date *</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reimburse_to">Reimburse to</Label>
                  <Select 
                    value={formData.reimburse_to} 
                    onValueChange={(value) => setFormData({ ...formData, reimburse_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not reimbursable">Not reimbursable</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                      <SelectItem value="Business Owner">Business Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Receipt</Label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="receipt-upload"
                      accept="image/*,.pdf"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('receipt-upload')?.click()}
                      disabled={uploading || !!uploadedReceipt}
                      className="w-full"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : uploadedReceipt ? 'Receipt Attached' : 'Attach Receipt'}
                    </Button>

                    {uploadedReceipt && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Image className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <a
                            href={uploadedReceipt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline truncate"
                          >
                            {uploadedReceipt.name}
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={handleRemoveReceipt}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Expense</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-3 sm:p-4 md:p-6 animate-fade-in space-y-4 md:space-y-6">
        {expenses.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl sm:text-3xl font-bold">{getCurrencySymbol(currency)}{getTotalExpenses().toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={Wallet}
              title="Track expenses on-the-go"
              description="Capture receipts and track expenses anywhere. Maximize your tax deductions and keep your business finances organized."
              actionLabel="Record Your First Expense"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {expenses.map((expense) => (
              <Card 
                key={expense.id} 
                className="hover-lift cursor-pointer"
                onClick={() => {
                  setSelectedExpense(expense);
                  setExpenseDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">{expense.category}</h3>
                        <Badge variant="outline" className="text-xs">{new Date(expense.expense_date).toLocaleDateString()}</Badge>
                        {expense.receipt_url && (
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs">
                            <Receipt className="w-3 h-3 mr-1" />
                            Receipt
                          </Badge>
                        )}
                        {expense.reimburse_to && expense.reimburse_to !== "Not reimbursable" && (
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs">
                            Reimburse: {expense.reimburse_to}
                          </Badge>
                        )}
                      </div>
                      {expense.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{expense.description}</p>
                      )}
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-red-600 whitespace-nowrap">
                      {getCurrencySymbol(currency)}{parseFloat(expense.amount.toString()).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ExpenseDetailDialog
        expense={selectedExpense}
        open={expenseDetailDialogOpen}
        onOpenChange={setExpenseDetailDialogOpen}
        onUpdate={fetchExpenses}
      />
    </div>
  );
};