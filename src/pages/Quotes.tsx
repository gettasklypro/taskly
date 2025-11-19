import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Send, CheckCircle, XCircle, Clock, Trash2, Star, Upload, Paperclip, ChevronDown } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { QuoteDetailDialog } from "@/components/quotes/QuoteDetailDialog";

type LineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved": return <CheckCircle className="w-4 h-4" />;
    case "sent": return <Send className="w-4 h-4" />;
    case "declined": return <XCircle className="w-4 h-4" />;
    case "expired": return <Clock className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-600";
    case "sent": return "bg-blue-600";
    case "declined": return "bg-red-600";
    case "expired": return "bg-gray-600";
    default: return "bg-yellow-600";
  }
};

export const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [formData, setFormData] = useState({
    title: "",
    contact_id: "",
    valid_until: "",
    salesperson: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), name: "", description: "", quantity: 1, unitPrice: 0 }
  ]);
  const [discount, setDiscount] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [clientMessage, setClientMessage] = useState("");
  const [contractDisclaimer, setContractDisclaimer] = useState("This quote is valid for the next 30 days, after which values may be subject to change.");
  const [internalNotes, setInternalNotes] = useState("");
  const [noteAttachments, setNoteAttachments] = useState<File[]>([]);
  const [linkToJobs, setLinkToJobs] = useState(false);
  const [linkToInvoices, setLinkToInvoices] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    companyName: "",
    useCompanyAsName: false,
    phoneType: "main",
    phone: "",
    emailType: "main",
    email: "",
    leadSource: "",
    street1: "",
    street2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Philippines",
    billingAddressSame: true,
  });
  const [clientDetailsOpen, setClientDetailsOpen] = useState(true);
  const [contactDetailsOpen, setContactDetailsOpen] = useState(true);
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(true);
  const [leadSourceOpen, setLeadSourceOpen] = useState(false);
  const [leadSourceSearch, setLeadSourceSearch] = useState("");
  const [isNewLeadSourceDialogOpen, setIsNewLeadSourceDialogOpen] = useState(false);
  const [newLeadSourceName, setNewLeadSourceName] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quoteDetailDialogOpen, setQuoteDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuotes();
    fetchContacts();
    fetchUserCurrency();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('quotes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, fetchQuotes)
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

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotes")
        .select("*, contacts(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("id, name")
      .order("name");
    setContacts(data || []);
  };

  const generateQuoteNumber = () => {
    return `Q-${Date.now().toString().slice(-8)}`;
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountValue = parseFloat(discount) || 0;
    const taxValue = parseFloat(tax) || 0;
    return subtotal - discountValue + taxValue;
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: crypto.randomUUID(), 
      name: "", 
      description: "", 
      quantity: 1, 
      unitPrice: 0 
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleNoteAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNoteAttachments([...noteAttachments, ...files]);
  };

  const removeNoteAttachment = (index: number) => {
    setNoteAttachments(noteAttachments.filter((_, i) => i !== index));
  };

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientName = newClientData.useCompanyAsName 
      ? newClientData.companyName 
      : `${newClientData.firstName} ${newClientData.lastName}`.trim();

    if (!clientName) {
      toast.error("Client name is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fullAddress = [
        newClientData.street1,
        newClientData.street2,
        newClientData.city,
        newClientData.province,
        newClientData.postalCode,
        newClientData.country
      ].filter(Boolean).join(", ");

      const { data, error } = await supabase
        .from("contacts")
        .insert([{
          user_id: user.id,
          name: clientName,
          email: newClientData.email.trim() || null,
          phone: newClientData.phone.trim() || null,
          company_name: newClientData.companyName.trim() || null,
          address: fullAddress || null,
          status: 'lead',
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Client created successfully!");
      setIsNewClientDialogOpen(false);
      setNewClientData({
        title: "",
        firstName: "",
        lastName: "",
        companyName: "",
        useCompanyAsName: false,
        phoneType: "main",
        phone: "",
        emailType: "main",
        email: "",
        leadSource: "",
        street1: "",
        street2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Philippines",
        billingAddressSame: true,
      });
      
      // Refresh contacts and select the new client
      await fetchContacts();
      if (data) {
        setFormData({ ...formData, contact_id: data.id });
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Job title is required");
      return;
    }

    if (!formData.contact_id) {
      toast.error("Please select a client");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: quoteData, error } = await supabase.from("quotes").insert([{
        user_id: user.id,
        quote_number: generateQuoteNumber(),
        title: formData.title.trim(),
        description: null,
        contact_id: formData.contact_id || null,
        total_amount: calculateTotal(),
        valid_until: formData.valid_until || null,
        salesperson: formData.salesperson.trim() || null,
        status: 'draft',
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        rating: rating || null,
        client_message: clientMessage.trim() || null,
        contract_disclaimer: contractDisclaimer.trim() || null,
        internal_notes: internalNotes.trim() || null,
        link_to_jobs: linkToJobs,
        link_to_invoices: linkToInvoices,
      }] as any).select().single();

      if (error) throw error;

      // Save line items
      if (quoteData && lineItems.length > 0 && lineItems[0].name) {
        const lineItemsData = lineItems.map(item => ({
          quote_id: quoteData.id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }));
        await supabase.from("quote_line_items").insert(lineItemsData);
      }

      toast.success("Quote created successfully!");
      setIsDialogOpen(false);
      setFormData({ title: "", contact_id: "", valid_until: "", salesperson: "" });
      setLineItems([{ id: crypto.randomUUID(), name: "", description: "", quantity: 1, unitPrice: 0 }]);
      setDiscount("");
      setTax("");
      setRating(0);
      setClientMessage("");
      setContractDisclaimer("This quote is valid for the next 30 days, after which values may be subject to change.");
      setInternalNotes("");
      setNoteAttachments([]);
      setLinkToJobs(false);
      setLinkToInvoices(false);
      fetchQuotes();
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error("Failed to create quote");
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Quotes" 
        description="Create and manage customer quotes"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Quote for {contacts.find(c => c.id === formData.contact_id)?.name || "Client Name"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Title"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column - Quote Details */}
                  <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-semibold">Quote details</h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quote number #{generateQuoteNumber().slice(-6)}</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesperson">Salesperson</Label>
                      <Input
                        id="salesperson"
                        value={formData.salesperson}
                        onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                        placeholder="Salesperson name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rate opportunity</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-5 h-5 transition-colors ${
                                star <= rating 
                                  ? 'fill-yellow-500 stroke-yellow-500' 
                                  : 'fill-transparent stroke-muted-foreground'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="client">Client *</Label>
                        <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="link" size="sm" className="h-auto p-0">
                              <Plus className="w-3 h-3 mr-1" />
                              Create New Client
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create a New Client</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateNewClient} className="space-y-6 mt-4">
                              {/* Client Details */}
                              <Collapsible open={clientDetailsOpen} onOpenChange={setClientDetailsOpen}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted">
                                  <span className="font-semibold">Client details</span>
                                  <ChevronDown className={`w-4 h-4 transition-transform ${clientDetailsOpen ? "rotate-180" : ""}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 space-y-4">
                                  <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-3">
                                      <Label>Title</Label>
                                      <Select value={newClientData.title} onValueChange={(value) => setNewClientData({ ...newClientData, title: value })}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="No title" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="mr">Mr</SelectItem>
                                          <SelectItem value="mrs">Mrs</SelectItem>
                                          <SelectItem value="ms">Ms</SelectItem>
                                          <SelectItem value="dr">Dr</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="col-span-4">
                                      <Label>First name</Label>
                                      <Input
                                        value={newClientData.firstName}
                                        onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
                                        placeholder="First name"
                                      />
                                    </div>
                                    <div className="col-span-5">
                                      <Label>Last name</Label>
                                      <Input
                                        value={newClientData.lastName}
                                        onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
                                        placeholder="Last name"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Company name</Label>
                                    <Input
                                      value={newClientData.companyName}
                                      onChange={(e) => setNewClientData({ ...newClientData, companyName: e.target.value })}
                                      placeholder="Company name"
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="use-company-name"
                                      checked={newClientData.useCompanyAsName}
                                      onCheckedChange={(checked) => setNewClientData({ ...newClientData, useCompanyAsName: checked as boolean })}
                                    />
                                    <Label htmlFor="use-company-name" className="cursor-pointer text-sm font-normal">
                                      Use company name as the primary name
                                    </Label>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Contact Details */}
                              <Collapsible open={contactDetailsOpen} onOpenChange={setContactDetailsOpen}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted">
                                  <span className="font-semibold">Contact Details</span>
                                  <ChevronDown className={`w-4 h-4 transition-transform ${contactDetailsOpen ? "rotate-180" : ""}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 space-y-4">
                                  <div className="flex gap-2">
                                    <Select value={newClientData.phoneType} onValueChange={(value) => setNewClientData({ ...newClientData, phoneType: value })}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="mobile">Mobile</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      value={newClientData.phone}
                                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                                      placeholder="Phone number"
                                      className="flex-1"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Select value={newClientData.emailType} onValueChange={(value) => setNewClientData({ ...newClientData, emailType: value })}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="email"
                                      value={newClientData.email}
                                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                      placeholder="Email address"
                                      className="flex-1"
                                    />
                                  </div>

                                  <div>
                                    <Label>Lead Source</Label>
                                    <Popover open={leadSourceOpen} onOpenChange={setLeadSourceOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="w-full justify-between"
                                        >
                                          {newClientData.leadSource || "Select source"}
                                          <Plus className="w-4 h-4 ml-2" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                          <CommandInput 
                                            placeholder="Search to find or create" 
                                            value={leadSourceSearch}
                                            onValueChange={setLeadSourceSearch}
                                          />
                                          <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                              {["Facebook", "Flyer", "Google", "Instagram", "Other", "Referral"]
                                                .filter(source => 
                                                  source.toLowerCase().includes(leadSourceSearch.toLowerCase())
                                                )
                                                .map((source) => (
                                                  <CommandItem
                                                    key={source}
                                                    onSelect={() => {
                                                      setNewClientData({ ...newClientData, leadSource: source });
                                                      setLeadSourceOpen(false);
                                                      setLeadSourceSearch("");
                                                    }}
                                                  >
                                                    {source}
                                                  </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                            <CommandGroup>
                                              <CommandItem
                                                onSelect={() => {
                                                  setLeadSourceOpen(false);
                                                  setIsNewLeadSourceDialogOpen(true);
                                                  setNewLeadSourceName(leadSourceSearch);
                                                }}
                                                className="text-primary"
                                              >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create new
                                              </CommandItem>
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>

                                    {/* Create New Lead Source Dialog */}
                                    <Dialog open={isNewLeadSourceDialogOpen} onOpenChange={setIsNewLeadSourceDialogOpen}>
                                      <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>Create new lead source</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                          <div>
                                            <Label htmlFor="new-lead-source">Lead Source</Label>
                                            <Input
                                              id="new-lead-source"
                                              value={newLeadSourceName}
                                              onChange={(e) => setNewLeadSourceName(e.target.value)}
                                              placeholder="Enter lead source name"
                                              className="mt-2"
                                            />
                                          </div>
                                          <div className="flex justify-end gap-3">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                setIsNewLeadSourceDialogOpen(false);
                                                setNewLeadSourceName("");
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              type="button"
                                              onClick={() => {
                                                if (newLeadSourceName.trim()) {
                                                  setNewClientData({ ...newClientData, leadSource: newLeadSourceName.trim() });
                                                  setIsNewLeadSourceDialogOpen(false);
                                                  setNewLeadSourceName("");
                                                  setLeadSourceSearch("");
                                                  toast.success("Lead source created successfully!");
                                                }
                                              }}
                                            >
                                              Create
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Property Details */}
                              <Collapsible open={propertyDetailsOpen} onOpenChange={setPropertyDetailsOpen}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted">
                                  <span className="font-semibold">Property details</span>
                                  <ChevronDown className={`w-4 h-4 transition-transform ${propertyDetailsOpen ? "rotate-180" : ""}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 space-y-4">
                                  <div>
                                    <Label>Street 1</Label>
                                    <Input
                                      value={newClientData.street1}
                                      onChange={(e) => setNewClientData({ ...newClientData, street1: e.target.value })}
                                      placeholder="Street 1"
                                    />
                                  </div>

                                  <div>
                                    <Label>Street 2</Label>
                                    <Input
                                      value={newClientData.street2}
                                      onChange={(e) => setNewClientData({ ...newClientData, street2: e.target.value })}
                                      placeholder="Street 2"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label>City</Label>
                                      <Input
                                        value={newClientData.city}
                                        onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })}
                                        placeholder="City"
                                      />
                                    </div>
                                    <div>
                                      <Label>State</Label>
                                      <Input
                                        value={newClientData.province}
                                        onChange={(e) => setNewClientData({ ...newClientData, province: e.target.value })}
                                        placeholder="State"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label>Zip code</Label>
                                      <Input
                                        value={newClientData.postalCode}
                                        onChange={(e) => setNewClientData({ ...newClientData, postalCode: e.target.value })}
                                        placeholder="Zip code"
                                      />
                                    </div>
                                    <div>
                                      <Label>Country</Label>
                                      <Select value={newClientData.country} onValueChange={(value) => setNewClientData({ ...newClientData, country: value })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Philippines">Philippines</SelectItem>
                                          <SelectItem value="USA">USA</SelectItem>
                                          <SelectItem value="UK">UK</SelectItem>
                                          <SelectItem value="Canada">Canada</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="billing-same"
                                      checked={newClientData.billingAddressSame}
                                      onCheckedChange={(checked) => setNewClientData({ ...newClientData, billingAddressSame: checked as boolean })}
                                    />
                                    <Label htmlFor="billing-same" className="cursor-pointer text-sm font-normal">
                                      Billing address is the same as property address
                                    </Label>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">Create Client</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valid_until">Valid Until</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-2">
                    <div className="col-span-5">Product / Service</div>
                    <div className="col-span-2">Qty.</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start border border-border rounded-lg p-3 sm:p-4 bg-card">
                      <div className="md:col-span-5 space-y-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                          placeholder="Name"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-3 md:col-span-7 gap-2 md:contents">
                        <div className="md:col-span-2">
                          <Label className="text-xs md:hidden">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs md:hidden">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice || ""}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder={`${getCurrencySymbol(currency)}0.00`}
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center md:h-10">
                          <Label className="text-xs md:hidden">Total</Label>
                          <span className="font-medium">{getCurrencySymbol(currency)}{(item.quantity * item.unitPrice).toFixed(2)}</span>
                        </div>
                        <div className="md:col-span-1 flex items-center md:h-10 col-span-3 justify-end md:justify-start">
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
                    </div>
                  ))}

                  <Button type="button" onClick={addLineItem} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-96 space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{getCurrencySymbol(currency)}{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Discount</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-32 h-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span>Tax</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tax}
                          onChange={(e) => setTax(e.target.value)}
                          className="w-32 h-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                      <span>Total</span>
                      <span>{getCurrencySymbol(currency)}{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Sections */}
                <div className="space-y-6 mt-6">
                  {/* Client Message Section */}
                  <div className="space-y-2">
                    <Label htmlFor="client-message" className="text-base font-semibold">Client message</Label>
                    <Textarea
                      id="client-message"
                      value={clientMessage}
                      onChange={(e) => setClientMessage(e.target.value)}
                      placeholder="Enter message for client..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Contract/Disclaimer Section */}
                  <div className="space-y-2">
                    <Label htmlFor="contract-disclaimer" className="text-base font-semibold">Contract / Disclaimer</Label>
                    <Textarea
                      id="contract-disclaimer"
                      value={contractDisclaimer}
                      onChange={(e) => setContractDisclaimer(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This quote is <span className="bg-yellow-500/30 px-1">valid</span> for the next 30 days, after which values may be subject to change.
                    </p>
                  </div>

                  {/* Internal Notes Section */}
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div>
                      <h3 className="text-base font-semibold">Internal notes</h3>
                      <p className="text-sm text-muted-foreground">Internal notes will only be seen by your team</p>
                    </div>

                    <Textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Note details"
                      rows={4}
                      className="resize-none bg-background"
                    />

                    <input
                      ref={noteInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      multiple
                      onChange={handleNoteAttachment}
                      className="hidden"
                    />

                    <div 
                      onClick={() => noteInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-muted-foreground">
                        Drag your <span className="text-yellow-500">files</span> here or{" "}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm text-primary"
                        >
                          Select a File
                        </Button>
                      </p>
                    </div>

                    {noteAttachments.length > 0 && (
                      <div className="space-y-2">
                        {noteAttachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg border">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNoteAttachment(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Link note to related</p>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="link-jobs"
                            checked={linkToJobs}
                            onCheckedChange={(checked) => setLinkToJobs(checked as boolean)}
                          />
                          <Label htmlFor="link-jobs" className="cursor-pointer text-sm font-normal">
                            Jobs
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="link-invoices"
                            checked={linkToInvoices}
                            onCheckedChange={(checked) => setLinkToInvoices(checked as boolean)}
                          />
                          <Label htmlFor="link-invoices" className="cursor-pointer text-sm font-normal">
                            Invoices
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Quote</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={FileText}
              title="Create professional quotes in minutes"
              description="Win more business with professional quotes. Use templates, send instantly, and track client responses to close deals faster."
              actionLabel="Create Your First Quote"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {quotes.map((quote) => (
              <Card 
                key={quote.id} 
                className="hover-lift cursor-pointer"
                onClick={() => {
                  setSelectedQuote(quote);
                  setQuoteDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(quote.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base">{quote.title}</h3>
                          <span className="text-xs sm:text-sm text-muted-foreground">#{quote.quote_number}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {quote.contacts?.name || "No client assigned"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-xl sm:text-2xl font-bold">
                          {getCurrencySymbol(currency)}{quote.total_amount.toLocaleString()}
                        </p>
                        {quote.valid_until && (
                          <p className="text-xs text-muted-foreground">
                            Valid until {new Date(quote.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(quote.status)} whitespace-nowrap`}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <QuoteDetailDialog
        quote={selectedQuote}
        open={quoteDetailDialogOpen}
        onOpenChange={setQuoteDetailDialogOpen}
        onUpdate={fetchQuotes}
      />
    </div>
  );
};