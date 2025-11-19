import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Info, HelpCircle, Check, X, Trash2, GripVertical, ChevronDown, Briefcase } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addMonths, addWeeks, addDays, format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
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
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "in_progress": return <Clock className="w-4 h-4 text-blue-600" />;
    case "scheduled": return <CalendarIcon className="w-4 h-4 text-purple-600" />;
    default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

export const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  const [isAssignedPopoverOpen, setIsAssignedPopoverOpen] = useState(false);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [splitPaymentType, setSplitPaymentType] = useState<"percentage" | "amount">("percentage");
  const [paymentSchedule, setPaymentSchedule] = useState<{
    id: string;
    dueDate: string;
    status: string;
    percentage: string;
    description: string;
    total: number;
    balance: number;
  }[]>([
    { id: "1", dueDate: "", status: "Upcoming", percentage: "0", description: "Payment 1", total: 0, balance: 0 },
    { id: "2", dueDate: "", status: "Upcoming", percentage: "0", description: "Payment 2", total: 0, balance: 0 },
  ]);
  const [serviceItems, setServiceItems] = useState<{
    id: string;
    name: string;
    quantity: string;
    unitCost: string;
    unitPrice: string;
    description: string;
  }[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_id: "",
    status: "draft",
    scheduled_date: "",
    total_amount: "",
    salesperson: "",
    jobNumber: "",
    jobType: "one-off",
    totalVisits: "1",
    startTime: "",
    endTime: "",
    scheduleLater: false,
    anytime: false,
    emailTeam: false,
    repeat: "does-not-repeat",
    visitInstructions: "",
    remindToInvoice: true,
    splitInvoices: false,
    recurringRepeat: "weekly-mondays",
    endsType: "after",
    endsAfterValue: "6",
    endsAfterUnit: "months",
    endsOnDate: "",
    calculatedEndDate: "",
    calculatedTotalVisits: 27,
  });
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  const [customFieldData, setCustomFieldData] = useState({
    name: "",
    fieldType: "text",
    defaultValue: "",
    transferable: false,
  });
  const [noteText, setNoteText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetailDialogOpen, setJobDetailDialogOpen] = useState(false);

  const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: { [key: string]: string } = {
      USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$", NZD: "NZ$",
      JPY: "¥", INR: "₹", BRL: "R$", MXN: "MX$", ZAR: "R", SEK: "kr",
      NOK: "kr", DKK: "kr", CHF: "CHF", PLN: "zł", CZK: "Kč", SGD: "S$"
    };
    return currencyMap[currencyCode] || "$";
  };

  // Calculate end date and total visits based on job type and repeat settings
  useEffect(() => {
    if (formData.scheduled_date) {
      const startDate = new Date(formData.scheduled_date);
      
      // For one-off jobs with repeat
      if (formData.jobType === "one-off" && formData.repeat !== "does-not-repeat") {
        let endDate: Date;
        let totalVisits = 0;
        const value = parseInt(formData.endsAfterValue) || 6;
        
        // Calculate end date based on unit
        switch (formData.endsAfterUnit) {
          case "years":
            endDate = addMonths(startDate, value * 12);
            break;
          case "months":
            endDate = addMonths(startDate, value);
            break;
          case "weeks":
            endDate = addWeeks(startDate, value);
            break;
          case "days":
            endDate = addDays(startDate, value);
            break;
          default:
            endDate = addMonths(startDate, value);
        }
        
        const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (formData.repeat) {
          case "daily":
            totalVisits = diffDays;
            break;
          case "weekly":
            totalVisits = Math.floor(diffDays / 7);
            break;
          case "monthly":
            totalVisits = Math.ceil(diffDays / 30);
            break;
          default:
            totalVisits = 1;
        }
        
        setFormData(prev => ({
          ...prev,
          totalVisits: totalVisits.toString(),
          calculatedEndDate: format(endDate, "yyyy-MM-dd"),
        }));
      }
      // For one-off jobs without repeat
      else if (formData.jobType === "one-off" && formData.repeat === "does-not-repeat") {
        setFormData(prev => ({
          ...prev,
          totalVisits: "1",
          calculatedEndDate: "",
        }));
      }
      // For recurring jobs
      else if (formData.jobType === "recurring") {
        let endDate: Date;
        let totalVisits = 0;

        if (formData.endsType === "after") {
          const value = parseInt(formData.endsAfterValue) || 6;
          
          switch (formData.endsAfterUnit) {
            case "years":
              endDate = addMonths(startDate, value * 12);
              break;
            case "months":
              endDate = addMonths(startDate, value);
              break;
            case "weeks":
              endDate = addWeeks(startDate, value);
              break;
            case "days":
              endDate = addDays(startDate, value);
              break;
            default:
              endDate = addMonths(startDate, value);
          }

          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Calculate total visits based on repeat pattern
          if (formData.recurringRepeat.startsWith("weekly")) {
            totalVisits = Math.ceil(diffDays / 7);
          } else if (formData.recurringRepeat === "daily") {
            totalVisits = diffDays;
          } else if (formData.recurringRepeat === "monthly") {
            totalVisits = Math.ceil(diffDays / 30);
          }
        } else if (formData.endsType === "on" && formData.endsOnDate) {
          endDate = new Date(formData.endsOnDate);
          
          // Calculate visits between start and end date
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (formData.recurringRepeat.startsWith("weekly")) {
            totalVisits = Math.ceil(diffDays / 7);
          } else if (formData.recurringRepeat === "daily") {
            totalVisits = diffDays;
          } else if (formData.recurringRepeat === "monthly") {
            totalVisits = Math.ceil(diffDays / 30);
          }
        } else {
          endDate = addMonths(startDate, 6);
          const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          totalVisits = Math.ceil(diffDays / 7);
        }

        setFormData(prev => ({
          ...prev,
          calculatedEndDate: format(endDate, "yyyy-MM-dd"),
          calculatedTotalVisits: totalVisits,
        }));
      }
    }
  }, [
    formData.jobType,
    formData.scheduled_date,
    formData.repeat,
    formData.endsType,
    formData.endsAfterValue,
    formData.endsAfterUnit,
    formData.endsOnDate,
    formData.recurringRepeat,
  ]);

  useEffect(() => {
    fetchJobs();
    fetchContacts();
    fetchTeamMembers();
    fetchUserCurrency();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchJobs)
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

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      
      setTeamMembers(
        (data || []).map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.email || "Unknown User"
        }))
      );
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*, contacts(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // If status is completed, set completion_date to now
      if (newStatus === 'completed') {
        updateData.completion_date = new Date().toISOString();
      } else {
        // Clear completion_date if status is changed from completed to something else
        updateData.completion_date = null;
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Job status updated!");
      fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("id, name")
      .order("name");
    setContacts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate total from service items
      const calculatedTotal = serviceItems.reduce((total, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return total + (quantity * unitPrice);
      }, 0);

      const { data: jobData, error } = await supabase.from("jobs").insert([{
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        contact_id: formData.contact_id || null,
        status: formData.status,
        scheduled_date: formData.scheduled_date || null,
        total_amount: calculatedTotal,
        salesperson: formData.salesperson.trim() || null,
        job_number: formData.jobNumber.trim() || null,
        job_type: formData.jobType,
        total_visits: parseInt(formData.totalVisits) || 1,
        start_time: formData.startTime || null,
        end_time: formData.endTime || null,
        schedule_later: formData.scheduleLater,
        anytime: formData.anytime,
        email_team: formData.emailTeam,
        repeat: formData.repeat,
        visit_instructions: formData.visitInstructions.trim() || null,
        remind_to_invoice: formData.remindToInvoice,
        split_invoices: formData.splitInvoices,
        recurring_repeat: formData.recurringRepeat || null,
        ends_type: formData.endsType || null,
        ends_after_value: formData.endsAfterValue || null,
        ends_after_unit: formData.endsAfterUnit || null,
        ends_on_date: formData.endsOnDate || null,
        calculated_end_date: formData.calculatedEndDate || null,
        calculated_total_visits: formData.calculatedTotalVisits || null,
        internal_notes: noteText.trim() || null,
      }] as any).select().single();

      if (error) throw error;

      // Save service items
      if (jobData && serviceItems.length > 0) {
        const serviceItemsData = serviceItems.map(item => ({
          job_id: jobData.id,
          name: item.name,
          description: item.description || null,
          quantity: parseFloat(item.quantity) || 0,
          unit_cost: parseFloat(item.unitCost) || 0,
          unit_price: parseFloat(item.unitPrice) || 0,
        }));
        await supabase.from("job_service_items").insert(serviceItemsData);
      }

      // Save team assignments
      if (jobData && assignedTeamMembers.length > 0) {
        const teamAssignmentsData = assignedTeamMembers.map(member => ({
          user_id: user.id,
          entity_type: 'job',
          entity_id: jobData.id,
          team_member_name: member,
        }));
        await supabase.from("team_assignments").insert(teamAssignmentsData);
      }

      // Save payment schedules
      if (jobData && formData.splitInvoices && paymentSchedule.length > 0) {
        const paymentSchedulesData = paymentSchedule.map(schedule => ({
          job_id: jobData.id,
          due_date: schedule.dueDate || null,
          status: schedule.status,
          percentage: parseFloat(schedule.percentage) || 0,
          description: schedule.description || null,
          total: schedule.total,
          balance: schedule.balance,
        }));
        await supabase.from("job_payment_schedules").insert(paymentSchedulesData);
      }

      toast.success("Job created successfully!");
      setIsDialogOpen(false);
      setFormData({ 
        title: "", 
        description: "", 
        contact_id: "", 
        status: "draft", 
        scheduled_date: "", 
        total_amount: "", 
        salesperson: "",
        jobNumber: "",
        jobType: "one-off",
        totalVisits: "1",
        startTime: "",
        endTime: "",
        scheduleLater: false,
        anytime: false,
        emailTeam: false,
        repeat: "does-not-repeat",
        visitInstructions: "",
        remindToInvoice: true,
        splitInvoices: false,
        recurringRepeat: "weekly-mondays",
        endsType: "after",
        endsAfterValue: "6",
        endsAfterUnit: "months",
        endsOnDate: "",
        calculatedEndDate: "",
        calculatedTotalVisits: 27,
      });
      setAssignedTeamMembers([]);
      setServiceItems([]);
      setNoteText("");
      setUploadedFiles([]);
      fetchJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    }
  };

  const handleAddServiceItem = () => {
    setServiceItems([
      ...serviceItems,
      {
        id: String(Date.now()),
        name: "",
        quantity: "0",
        unitCost: "0.00",
        unitPrice: "0.00",
        description: "",
      },
    ]);
  };

  const handleRemoveServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const handleServiceItemChange = (id: string, field: string, value: string) => {
    setServiceItems(serviceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateServiceTotal = (item: { quantity: string; unitPrice: string }) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  const calculateTotalCost = () => {
    return serviceItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unitCost) || 0;
      return total + (quantity * unitCost);
    }, 0).toFixed(2);
  };

  const calculateTotalPrice = () => {
    return serviceItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return total + (quantity * unitPrice);
    }, 0).toFixed(2);
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
          status: 'customer',
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Client created successfully!");
      setShowNewClientDialog(false);
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
      
      // Refresh contacts list
      await fetchContacts();
      
      // Set the newly created client as selected
      if (data) {
        setFormData({ ...formData, contact_id: data.id });
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Custom Field Dialog */}
      <Dialog open={isCustomFieldDialogOpen} onOpenChange={setIsCustomFieldDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New custom field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">APPLIES TO</p>
              <p className="font-semibold">All jobs</p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="transferable"
                checked={customFieldData.transferable}
                onCheckedChange={(checked) => setCustomFieldData({ ...customFieldData, transferable: checked as boolean })}
              />
              <div>
                <Label htmlFor="transferable" className="font-semibold">Transferable field</Label>
                <p className="text-sm text-muted-foreground">
                  Transferable custom fields allow your data to appear in multiple places and follow you through your workflow
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customFieldName">Custom field name</Label>
              <Input
                id="customFieldName"
                value={customFieldData.name}
                onChange={(e) => setCustomFieldData({ ...customFieldData, name: e.target.value })}
                placeholder="Custom field name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Field type</Label>
              <Select value={customFieldData.fieldType} onValueChange={(value) => setCustomFieldData({ ...customFieldData, fieldType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Example</p>
              <p className="text-sm">Serial Number <span className="text-muted-foreground">54A17-HEX</span></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default value</Label>
              <Input
                id="defaultValue"
                value={customFieldData.defaultValue}
                onChange={(e) => setCustomFieldData({ ...customFieldData, defaultValue: e.target.value })}
                placeholder="Default value"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              All custom fields can be edited and reordered in <span className="text-green-600">Settings &gt; Custom Fields</span>
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCustomFieldDialogOpen(false);
                  setCustomFieldData({ name: "", fieldType: "text", defaultValue: "", transferable: false });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (!customFieldData.name.trim()) {
                    toast.error("Custom field name is required");
                    return;
                  }
                  toast.success("Custom field created!");
                  setIsCustomFieldDialogOpen(false);
                  setCustomFieldData({ name: "", fieldType: "text", defaultValue: "", transferable: false });
                }}
              >
                Create Custom Field
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader 
        title="Jobs" 
        description="Track and manage all your service jobs"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Title"
                    required
                  />
                </div>

                {/* Client and Job Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Select a client</Label>
                    <Select 
                      value={formData.contact_id} 
                      onValueChange={(value) => {
                        if (value === "create_new") {
                          setShowNewClientDialog(true);
                        } else {
                          setFormData({ ...formData, contact_id: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create_new" className="text-green-600 font-semibold">
                          + Add a client
                        </SelectItem>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobNumber">Job #</Label>
                    <Input
                      id="jobNumber"
                      value={formData.jobNumber}
                      onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Salesperson and Add field */}
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="salesperson">Salesperson</Label>
                    <Input
                      id="salesperson"
                      value={formData.salesperson}
                      onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                      placeholder="Enter salesperson name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Want to customize?</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsCustomFieldDialogOpen(true)}
                    >
                      Add field
                    </Button>
                  </div>
                </div>

                {/* Job Type */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Job type</h3>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.jobType === "one-off" ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, jobType: "one-off" })}
                    >
                      One-off
                    </Button>
                    <Button
                      type="button"
                      variant={formData.jobType === "recurring" ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, jobType: "recurring" })}
                    >
                      Recurring
                    </Button>
                  </div>
                </div>

                {/* Schedule */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Schedule</h3>
                    <Button type="button" variant="link" size="sm" className="text-green-600">
                      Show Calendar
                    </Button>
                  </div>

                  {/* Header info based on job type */}
                  {formData.jobType === "one-off" ? (
                    <div className="text-sm">
                      <span>Total visits {formData.totalVisits}</span>
                      {formData.scheduled_date && (
                        <span className="text-muted-foreground ml-3">
                          {formData.repeat === "does-not-repeat" ? "On" : "First"} {format(new Date(formData.scheduled_date), "MMM dd, yyyy")}
                        </span>
                      )}
                      {formData.repeat !== "does-not-repeat" && formData.calculatedEndDate && (
                        <span className="text-muted-foreground ml-3">
                          Last {format(new Date(formData.calculatedEndDate), "MMM dd, yyyy")}
                        </span>
                      )}
                      {formData.repeat !== "does-not-repeat" && (
                        <span className="text-muted-foreground ml-3">
                          Repeats <span className="bg-muted px-2 py-1 rounded">
                            {formData.repeat === "daily" ? "daily" :
                             formData.repeat === "weekly" ? "weekly" :
                             formData.repeat === "monthly" ? "monthly" : ""}
                          </span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span>Total visits {formData.calculatedTotalVisits}</span>
                      {formData.scheduled_date && (
                        <>
                          <span className="text-muted-foreground ml-3">
                            First {format(new Date(formData.scheduled_date), "MMM dd, yyyy")}
                          </span>
                          {formData.calculatedEndDate && (
                            <span className="text-muted-foreground ml-3">
                              Last {format(new Date(formData.calculatedEndDate), "MMM dd, yyyy")}
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-muted-foreground ml-3">
                        Repeats <span className="bg-muted px-2 py-1 rounded">
                          {formData.recurringRepeat === "weekly-mondays" ? "weekly on Mon" :
                           formData.recurringRepeat === "weekly-tuesdays" ? "weekly on Tue" :
                           formData.recurringRepeat === "daily" ? "daily" :
                           formData.recurringRepeat === "monthly" ? "monthly" : "weekly on Mon"}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Only show scheduling fields if not "Schedule later" for one-off jobs */}
                  {!(formData.jobType === "one-off" && formData.scheduleLater) && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <Input
                          type="date"
                          value={formData.scheduled_date?.split('T')[0] || ''}
                          onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start time</Label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          disabled={formData.anytime}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End time</Label>
                        <Input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          disabled={formData.anytime}
                        />
                      </div>
                    </div>
                  )}

                  {formData.jobType === "one-off" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scheduleLater"
                        checked={formData.scheduleLater}
                        onCheckedChange={(checked) => setFormData({ ...formData, scheduleLater: checked as boolean })}
                      />
                      <Label htmlFor="scheduleLater" className="font-normal">Schedule later</Label>
                    </div>
                  )}

                  {/* Only show "Anytime" if scheduling fields are visible */}
                  {!(formData.jobType === "one-off" && formData.scheduleLater) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anytime"
                        checked={formData.anytime}
                        onCheckedChange={(checked) => setFormData({ ...formData, anytime: checked as boolean })}
                      />
                      <Label htmlFor="anytime" className="font-normal">Anytime</Label>
                    </div>
                  )}

                  <Popover open={isAssignedPopoverOpen} onOpenChange={setIsAssignedPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="justify-start">
                        <span className="font-semibold">Assigned</span>
                        {assignedTeamMembers.length > 0 && (
                          <>
                            <span className="mx-2">|</span>
                            <span>{teamMembers.find(m => m.id === assignedTeamMembers[0])?.name}</span>
                            {assignedTeamMembers.length > 1 && (
                              <span className="ml-1">+{assignedTeamMembers.length - 1}</span>
                            )}
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search" />
                        <CommandEmpty>No team member found.</CommandEmpty>
                        <CommandGroup>
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-sm">{assignedTeamMembers.length} selected</span>
                            {assignedTeamMembers.length > 0 && (
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-green-600"
                                onClick={() => setAssignedTeamMembers([])}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                          {teamMembers.map((member) => {
                            const isSelected = assignedTeamMembers.includes(member.id);
                            return (
                              <CommandItem
                                key={member.id}
                                onSelect={() => {
                                  if (isSelected) {
                                    setAssignedTeamMembers(assignedTeamMembers.filter(id => id !== member.id));
                                  } else {
                                    setAssignedTeamMembers([...assignedTeamMembers, member.id]);
                                  }
                                }}
                                className="flex items-center justify-between"
                              >
                                <span>{member.name}</span>
                                {isSelected && <Check className="h-4 w-4" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailTeam"
                      checked={formData.emailTeam}
                      onCheckedChange={(checked) => setFormData({ ...formData, emailTeam: checked as boolean })}
                    />
                    <Label htmlFor="emailTeam" className="font-normal">Email team about assignment</Label>
                  </div>

                  {/* Only show repeats if not "Schedule later" for one-off jobs */}
                  {!(formData.jobType === "one-off" && formData.scheduleLater) && (
                    <>
                      <div className="space-y-2">
                        <Label>Repeats</Label>
                        {formData.jobType === "one-off" ? (
                          <Select value={formData.repeat} onValueChange={(value) => setFormData({ ...formData, repeat: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="does-not-repeat">Does not repeat</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select value={formData.recurringRepeat} onValueChange={(value) => setFormData({ ...formData, recurringRepeat: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly-mondays">Weekly on Mondays</SelectItem>
                              <SelectItem value="weekly-tuesdays">Weekly on Tuesdays</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* One-off repeat end options */}
                      {formData.jobType === "one-off" && formData.repeat !== "does-not-repeat" && (
                        <div className="space-y-4">
                          <RadioGroup value={formData.endsType} onValueChange={(value) => setFormData({ ...formData, endsType: value })}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="after" id="ends-after-oneoff" />
                              <Label htmlFor="ends-after-oneoff" className="font-normal">Ends after</Label>
                            </div>
                            
                            {formData.endsType === "after" && (
                              <div className="grid grid-cols-2 gap-4 ml-6">
                                <Input
                                  type="number"
                                  value={formData.endsAfterValue}
                                  onChange={(e) => setFormData({ ...formData, endsAfterValue: e.target.value })}
                                  placeholder="6"
                                />
                                <Select value={formData.endsAfterUnit} onValueChange={(value) => setFormData({ ...formData, endsAfterUnit: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="years">Years</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="on" id="ends-on-oneoff" />
                              <Label htmlFor="ends-on-oneoff" className="font-normal">Ends on</Label>
                            </div>
                            
                            {formData.endsType === "on" && (
                              <div className="ml-6">
                                <Input
                                  type="date"
                                  value={formData.endsOnDate}
                                  onChange={(e) => setFormData({ ...formData, endsOnDate: e.target.value })}
                                  placeholder="Oct 27, 2025"
                                />
                              </div>
                            )}
                          </RadioGroup>
                        </div>
                      )}

                      {/* Recurring specific fields */}
                      {formData.jobType === "recurring" && (
                        <div className="space-y-4">
                          <RadioGroup value={formData.endsType} onValueChange={(value) => setFormData({ ...formData, endsType: value })}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="after" id="ends-after" />
                              <Label htmlFor="ends-after" className="font-normal">Ends after</Label>
                            </div>
                            
                            {formData.endsType === "after" && (
                              <div className="grid grid-cols-2 gap-4 ml-6">
                                <Input
                                  type="number"
                                  value={formData.endsAfterValue}
                                  onChange={(e) => setFormData({ ...formData, endsAfterValue: e.target.value })}
                                  placeholder="6"
                                />
                                <Select value={formData.endsAfterUnit} onValueChange={(value) => setFormData({ ...formData, endsAfterUnit: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="years">Years</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="on" id="ends-on" />
                              <Label htmlFor="ends-on" className="font-normal">Ends on</Label>
                            </div>
                            
                            {formData.endsType === "on" && (
                              <div className="ml-6">
                                <Input
                                  type="date"
                                  value={formData.endsOnDate}
                                  onChange={(e) => setFormData({ ...formData, endsOnDate: e.target.value })}
                                  placeholder="Oct 27, 2025"
                                />
                              </div>
                            )}
                          </RadioGroup>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Visit instructions</Label>
                    <Textarea
                      value={formData.visitInstructions}
                      onChange={(e) => setFormData({ ...formData, visitInstructions: e.target.value })}
                      placeholder="Visit instructions"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Add a job form</Label>
                    <p className="text-sm text-muted-foreground">
                      Attach custom-built forms to your jobs so that nothing gets missed.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Create a job form in <Button type="button" variant="link" className="h-auto p-0 text-sm text-green-600">Settings</Button>
                    </p>
                  </div>
                </div>

                {/* Invoicing */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Invoicing</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remindToInvoice"
                      checked={formData.remindToInvoice}
                      onCheckedChange={(checked) => setFormData({ ...formData, remindToInvoice: checked as boolean })}
                    />
                    <Label htmlFor="remindToInvoice" className="font-normal">
                      Remind me to invoice when I close this job
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="splitInvoices"
                      checked={formData.splitInvoices}
                      onCheckedChange={(checked) => setFormData({ ...formData, splitInvoices: checked as boolean })}
                    />
                    <Label htmlFor="splitInvoices" className="font-normal">
                      Split into multiple invoices with a payment schedule
                    </Label>
                  </div>

                  {/* Payment Schedule */}
                  {formData.splitInvoices && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Split payments by</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={splitPaymentType === "percentage" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSplitPaymentType("percentage")}
                          >
                            %
                          </Button>
                          <Button
                            type="button"
                            variant={splitPaymentType === "amount" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSplitPaymentType("amount")}
                          >
                            {getCurrencySymbol(userCurrency)}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">Total: {getCurrencySymbol(userCurrency)}0.00</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getCurrencySymbol(userCurrency)}0.00 subtotal + {getCurrencySymbol(userCurrency)}0.00 discount + {getCurrencySymbol(userCurrency)}0.00 taxes
                        </p>
                        
                        <div className="space-y-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-green-600" style={{ width: "0%" }}></div>
                            <div className="bg-yellow-600" style={{ width: "0%" }}></div>
                            <div className="bg-blue-600" style={{ width: "0%" }}></div>
                            <div className="bg-gray-600" style={{ width: "0%" }}></div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-green-600 rounded"></span>
                              Paid: 0% ({getCurrencySymbol(userCurrency)}0.00)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-yellow-600 rounded"></span>
                              Awaiting Payment: 0% ({getCurrencySymbol(userCurrency)}0.00)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-blue-600 rounded"></span>
                              Draft: 0% ({getCurrencySymbol(userCurrency)}0.00)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 bg-gray-600 rounded"></span>
                              Remaining: 0% ({getCurrencySymbol(userCurrency)}0.00)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2">
                          <span>INVOICE</span>
                          <span>DUE DATE</span>
                          <span>STATUS</span>
                          <span>%</span>
                          <span className="col-span-2">DESCRIPTION</span>
                          <span className="text-right">BALANCE</span>
                        </div>
                        
                        {paymentSchedule.map((payment, index) => (
                          <div key={payment.id} className="grid grid-cols-7 gap-2 items-center">
                            <Button type="button" variant="outline" size="sm" className="h-8">
                              Create
                            </Button>
                            <Input
                              type="date"
                              value={payment.dueDate}
                              onChange={(e) => {
                                const updated = [...paymentSchedule];
                                updated[index].dueDate = e.target.value;
                                setPaymentSchedule(updated);
                              }}
                              className="h-8 text-xs"
                            />
                            <span className="text-xs">{payment.status}</span>
                            <Input
                              type="number"
                              value={payment.percentage}
                              onChange={(e) => {
                                const updated = [...paymentSchedule];
                                updated[index].percentage = e.target.value;
                                setPaymentSchedule(updated);
                              }}
                              placeholder="0%"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={payment.description}
                              onChange={(e) => {
                                const updated = [...paymentSchedule];
                                updated[index].description = e.target.value;
                                setPaymentSchedule(updated);
                              }}
                              placeholder="Payment description"
                              className="h-8 text-xs col-span-2"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <div className="text-right space-y-0.5">
                                <div className="text-sm font-semibold">{getCurrencySymbol(userCurrency)}0.00</div>
                                <div className="text-xs text-muted-foreground">Subtotal {getCurrencySymbol(userCurrency)}0.00</div>
                              </div>
                              {paymentSchedule.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setPaymentSchedule(paymentSchedule.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-green-600 p-0 h-auto"
                        onClick={() => {
                          setPaymentSchedule([
                            ...paymentSchedule,
                            {
                              id: String(paymentSchedule.length + 1),
                              dueDate: "",
                              status: "Upcoming",
                              percentage: "0",
                              description: `Payment ${paymentSchedule.length + 1}`,
                              total: 0,
                              balance: 0,
                            },
                          ]);
                        }}
                      >
                        Add Invoice to Payment Schedule
                      </Button>

                      <div className="flex justify-between items-center pt-4 border-t text-sm font-semibold">
                        <span>Total</span>
                        <div className="text-right space-y-0.5">
                          <div>{getCurrencySymbol(userCurrency)}0.00</div>
                          <div className="text-xs text-muted-foreground">Subtotal {getCurrencySymbol(userCurrency)}0.00</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product / Service */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">Product / Service</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep everything on track by adding products and services.
                    </p>
                  </div>
                  
                  {serviceItems.length === 0 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleAddServiceItem}
                    >
                      Add a service
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {serviceItems.map((item) => (
                        <div key={item.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-5 h-5 text-muted-foreground mt-2 flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-5 gap-2">
                                <Input
                                  placeholder="Name"
                                  value={item.name}
                                  onChange={(e) => handleServiceItemChange(item.id, "name", e.target.value)}
                                  className="text-sm"
                                />
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.quantity}
                                    onChange={(e) => handleServiceItemChange(item.id, "quantity", e.target.value)}
                                    className="text-sm"
                                  />
                                  <span className="absolute left-3 top-0 text-xs text-muted-foreground -mt-2 bg-background px-1">
                                    Quantity
                                  </span>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    {getCurrencySymbol(userCurrency)}
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={item.unitCost}
                                    onChange={(e) => handleServiceItemChange(item.id, "unitCost", e.target.value)}
                                    className="text-sm pl-12"
                                  />
                                  <span className="absolute left-3 top-0 text-xs text-muted-foreground -mt-2 bg-background px-1">
                                    Unit cost
                                  </span>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    {getCurrencySymbol(userCurrency)}
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={item.unitPrice}
                                    onChange={(e) => handleServiceItemChange(item.id, "unitPrice", e.target.value)}
                                    className="text-sm pl-12"
                                  />
                                  <span className="absolute left-3 top-0 text-xs text-muted-foreground -mt-2 bg-background px-1">
                                    Unit price
                                  </span>
                                </div>
                                <div className="relative">
                                  <Input
                                    value={`${getCurrencySymbol(userCurrency)}${calculateServiceTotal(item)}`}
                                    disabled
                                    className="text-sm bg-muted"
                                  />
                                  <span className="absolute left-3 top-0 text-xs text-muted-foreground -mt-2 bg-background px-1">
                                    Total
                                  </span>
                                </div>
                              </div>
                              <Textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleServiceItemChange(item.id, "description", e.target.value)}
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="text-destructive h-auto p-0"
                              onClick={() => handleRemoveServiceItem(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleAddServiceItem}
                      >
                        Add Line Item
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm">Total cost</span>
                    <span className="font-semibold">{getCurrencySymbol(userCurrency)}{calculateTotalCost()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total price</span>
                    <span className="font-semibold">{getCurrencySymbol(userCurrency)}{calculateTotalPrice()}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Notes</h3>
                  <Textarea
                    placeholder="Leave a note"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const files = Array.from(e.dataTransfer.files);
                      setUploadedFiles([...uploadedFiles, ...files]);
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          setUploadedFiles([...uploadedFiles, ...files]);
                        }
                      }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("file-upload")?.click();
                        }}
                      >
                        Attach files & photos
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Select or drag files here to upload
                      </p>
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Save Job
                  </Button>
                  <Button type="button" variant="outline" className="w-10 h-10 p-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={Briefcase}
              title="Track jobs from start to finish"
              description="Create and manage jobs with complete visibility. Monitor status updates, schedule work, and ensure nothing falls through the cracks."
              actionLabel="Create Your First Job"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {jobs.map((job, index) => (
              <Card 
                key={job.id} 
                className="hover-lift cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setSelectedJob(job);
                  setJobDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.contacts?.name || "No client assigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select 
                        value={job.status} 
                        onValueChange={(value) => handleStatusChange(job.id, value)}
                      >
                        <SelectTrigger className="w-full" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold text-lg">{getCurrencySymbol(userCurrency)}{job.total_amount.toLocaleString()}</span>
                    </div>
                    {job.scheduled_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Scheduled</span>
                        <span className="font-medium">
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {job.status === 'completed' && job.completion_date && (
                      <div className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        <span className="text-green-700 dark:text-green-400 font-medium">Completed on</span>
                        <span className="font-semibold text-green-800 dark:text-green-300">
                          {new Date(job.completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
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
              <Button type="button" variant="outline" onClick={() => setShowNewClientDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <JobDetailDialog 
        job={selectedJob} 
        open={jobDetailDialogOpen} 
        onOpenChange={setJobDetailDialogOpen}
        onDelete={fetchJobs}
        onUpdate={fetchJobs}
      />
    </div>
  );
};
