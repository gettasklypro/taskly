import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, DollarSign, Clock, CheckCircle, XCircle, Trash2, GripVertical, Paperclip, X, Receipt } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceDetailDialog } from "@/components/invoices/InvoiceDetailDialog";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-600";
    case "sent": return "bg-blue-600";
    case "overdue": return "bg-red-600";
    case "cancelled": return "bg-gray-600";
    default: return "bg-yellow-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid": return <CheckCircle className="w-4 h-4" />;
    case "sent": return <Clock className="w-4 h-4" />;
    case "cancelled": return <XCircle className="w-4 h-4" />;
    default: return <DollarSign className="w-4 h-4" />;
  }
};

type LineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
};

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
};

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<'select-client' | 'create-invoice'>('select-client');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: '', description: '', quantity: 1, unit_price: 0 }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetailDialogOpen, setInvoiceDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_subject: "",
    issued_date: new Date().toISOString().split('T')[0],
    payment_due: "",
    salesperson: "",
    discount: 0,
    tax: 0,
    deposits: 0,
    client_message: "",
    contract_disclaimer: "Thank you for your business. Please contact us with any questions regarding this invoice.",
    internal_notes: "",
    status: "draft",
  });

  useEffect(() => {
    fetchInvoices();
    fetchContacts();
    fetchUserCurrency();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, fetchInvoices)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserCurrency = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data?.currency) {
        setUserCurrency(data.currency);
      }
    } catch (error) {
      console.error("Error fetching user currency:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("*, contacts(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // If status is paid, set paid_date to now
      if (newStatus === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0]; // Store as date only
      } else {
        // Clear paid_date if status is changed from paid to something else
        updateData.paid_date = null;
      }

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoiceId);

      if (error) throw error;

      toast.success("Invoice status updated!");
      fetchInvoices();
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("id, name, email, phone, address, company_name")
      .order("name");
    setContacts(data || []);
  };

  const handleClientSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setStep('create-invoice');
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - formData.discount + formData.tax - formData.deposits;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$", NZD: "NZ$",
      JPY: "¥", INR: "₹", BRL: "R$", MXN: "MX$", ZAR: "R",
      SEK: "kr", NOK: "kr", DKK: "kr", CHF: "Fr", PLN: "zł", CZK: "Kč", SGD: "S$"
    };
    return symbols[currency] || currency;
  };

  const generateInvoiceNumber = () => {
    return `INV-${Date.now().toString().slice(-8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContact) {
      toast.error("Client is required");
      return;
    }

    if (lineItems.length === 0 || !lineItems[0].name) {
      toast.error("At least one line item is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const total = calculateTotal();

      const { data: invoiceData, error } = await supabase.from("invoices").insert([{
        user_id: user.id,
        invoice_number: generateInvoiceNumber(),
        contact_id: selectedContact.id,
        total_amount: total,
        due_date: formData.payment_due || null,
        status: formData.status,
        subject: formData.invoice_subject.trim() || null,
        issued_date: formData.issued_date || null,
        discount: formData.discount,
        tax: formData.tax,
        deposits: formData.deposits,
        client_message: formData.client_message.trim() || null,
        contract_disclaimer: formData.contract_disclaimer.trim() || null,
        internal_notes: formData.internal_notes.trim() || null,
      }] as any).select().single();

      if (error) throw error;

      // Save line items
      if (invoiceData && lineItems.length > 0 && lineItems[0].name) {
        const lineItemsData = lineItems.map(item => ({
          invoice_id: invoiceData.id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));
        await supabase.from("invoice_line_items").insert(lineItemsData);
      }

      // Save attachments
      if (invoiceData && uploadedFiles.length > 0) {
        const attachmentsData = uploadedFiles.map(file => ({
          user_id: user.id,
          entity_type: 'invoice',
          entity_id: invoiceData.id,
          file_name: file.name,
          file_url: file.url,
          file_type: 'document',
        }));
        await supabase.from("attachments").insert(attachmentsData);
      }

      toast.success("Invoice created successfully!");
      handleDialogClose();
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadedFilesList = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('request-files')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('request-files')
          .getPublicUrl(fileName);

        uploadedFilesList.push({
          name: file.name,
          url: publicUrl,
          path: fileName
        });
      }

      setUploadedFiles([...uploadedFiles, ...uploadedFilesList]);
      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('request-files')
        .remove([path]);

      if (error) throw error;

      setUploadedFiles(uploadedFiles.filter(f => f.path !== path));
      toast.success("File removed successfully!");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setStep('select-client');
    setSelectedContact(null);
    setLineItems([{ id: '1', name: '', description: '', quantity: 1, unit_price: 0 }]);
    setUploadedFiles([]);
    setFormData({
      invoice_subject: "",
      issued_date: new Date().toISOString().split('T')[0],
      payment_due: "",
      salesperson: "",
      discount: 0,
      tax: 0,
      deposits: 0,
      client_message: "",
      contract_disclaimer: "Thank you for your business. Please contact us with any questions regarding this invoice.",
      internal_notes: "",
      status: "draft",
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Invoices" 
        description="Manage billing and payments"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose();
            else setIsDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {step === 'select-client' ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Select Client</DialogTitle>
                    <DialogDescription>
                      Choose a client to create an invoice for
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Select onValueChange={handleClientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} {contact.company_name ? `(${contact.company_name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>Invoice for {selectedContact?.name}</span>
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setStep('select-client');
                          setSelectedContact(null);
                        }}
                      >
                        Change
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Invoice subject</Label>
                      <Input
                        id="subject"
                        placeholder="For Services Rendered"
                        value={formData.invoice_subject}
                        onChange={(e) => setFormData({ ...formData, invoice_subject: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Billing address</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedContact?.address || 'No address'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Property Address</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedContact?.address ? '(Same as billing address)' : 'No address'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Contact details</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedContact?.phone || 'No phone'}
                        </p>
                        <p className="text-sm text-primary">
                          {selectedContact?.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="issued_date">Issued date</Label>
                        <Input
                          id="issued_date"
                          type="date"
                          value={formData.issued_date}
                          onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_due">Payment due</Label>
                        <Input
                          id="payment_due"
                          type="date"
                          value={formData.payment_due}
                          onChange={(e) => setFormData({ ...formData, payment_due: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salesperson">Salesperson</Label>
                        <Button type="button" variant="outline" className="w-full justify-start">
                          Add +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Product / Service</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted grid grid-cols-12 gap-2 p-2 text-sm font-medium">
                          <div className="col-span-5">Name / Description</div>
                          <div className="col-span-2 text-center">Qty.</div>
                          <div className="col-span-2 text-center">Unit Price</div>
                          <div className="col-span-2 text-right">Total</div>
                          <div className="col-span-1"></div>
                        </div>
                        {lineItems.map((item, index) => (
                          <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border-t">
                            <div className="col-span-5 space-y-2">
                              <Input
                                placeholder="Name"
                                value={item.name}
                                onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                              />
                              <Textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                className="min-h-[60px]"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                              />
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{getCurrencySymbol(userCurrency)}</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.unit_price}
                                  onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className="font-medium">
                                {getCurrencySymbol(userCurrency)}{(item.quantity * item.unit_price).toFixed(2)}
                              </span>
                            </div>
                            <div className="col-span-1 flex items-start justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(item.id)}
                                disabled={lineItems.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" onClick={addLineItem}>
                        + Add Line Item
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subtotal</span>
                        <span className="font-medium">{getCurrencySymbol(userCurrency)}{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm">Discount</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                            className="w-32"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm">Tax</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.tax}
                            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                            className="w-32"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">{getCurrencySymbol(userCurrency)}{calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm">Deposits</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.deposits}
                            onChange={(e) => setFormData({ ...formData, deposits: parseFloat(e.target.value) || 0 })}
                            className="w-32"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client_message">Client message</Label>
                      <Textarea
                        id="client_message"
                        value={formData.client_message}
                        onChange={(e) => setFormData({ ...formData, client_message: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_disclaimer">Contract / Disclaimer</Label>
                      <Textarea
                        id="contract_disclaimer"
                        value={formData.contract_disclaimer}
                        onChange={(e) => setFormData({ ...formData, contract_disclaimer: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="internal_notes">Internal notes</Label>
                      <p className="text-xs text-muted-foreground">Internal notes will only be seen by your team</p>
                      <Textarea
                        id="internal_notes"
                        placeholder="Note details"
                        value={formData.internal_notes}
                        onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={uploading}
                        >
                          <Paperclip className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Attach File'}
                        </Button>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.path}
                              className="flex items-center justify-between p-2 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline truncate"
                                >
                                  {file.name}
                                </a>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => handleRemoveFile(file.path)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary">Save Invoice</Button>
                    </div>
                  </form>
                </>
              )}
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={Receipt}
              title="Get paid faster with automated invoicing"
              description="Generate and send invoices automatically, track payments, and get paid faster. Streamline your billing process today."
              actionLabel="Create Your First Invoice"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {invoices.map((invoice) => (
              <Card 
                key={invoice.id} 
                className="hover-lift cursor-pointer"
                onClick={() => {
                  setSelectedInvoice(invoice);
                  setInvoiceDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">#{invoice.invoice_number}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {invoice.contacts?.name || "No client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-xl sm:text-2xl font-bold">
                          {getCurrencySymbol(userCurrency)}{invoice.total_amount.toLocaleString()}
                        </p>
                        {invoice.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                        {invoice.status === 'paid' && invoice.paid_date && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Paid {new Date(invoice.paid_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:min-w-[140px] sm:w-auto">
                        <Select 
                          value={invoice.status} 
                          onValueChange={(value) => handleStatusChange(invoice.id, value)}
                        >
                          <SelectTrigger className="w-full h-9" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={invoiceDetailDialogOpen}
        onOpenChange={setInvoiceDetailDialogOpen}
        onUpdate={fetchInvoices}
      />
    </div>
  );
};
