import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, Mail, Phone, Search, Download, Upload, MoreVertical, Trash2, Users, MessageCircle, Edit } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
  status: "lead" | "customer";
  tags: string[] | null;
  lead_source: string | null;
  assigned_to: string | null;
  lifetime_value: number | null;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  website: string | null;
  social_media_links: any;
  billing_address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
};

export const Clients = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, fetchContacts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleNewClientSubmit = async (data: any) => {
    const name = `${data.firstName} ${data.lastName}`.trim() || "Unnamed Client";
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to add clients");
        return;
      }

      const { error } = await supabase.from("contacts").insert({
        user_id: session.user.id,
        name: name,
        email: data.email || null,
        phone: data.phoneNumber || null,
        address: `${data.street1} ${data.street2} ${data.city} ${data.province} ${data.postalCode}`.trim() || null,
        company_name: data.companyName || null,
        status: "lead",
      });

      if (error) throw error;

      toast.success("Client added successfully!");
      
      if (!data.saveAndCreateAnother) {
        setIsDialogOpen(false);
      }
      
      fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = ["Name", "Company", "Email", "Phone", "Address", "Status"];
      const csvRows = contacts.map((contact) => [
        contact.name,
        contact.company_name || "",
        contact.email || "",
        contact.phone || "",
        contact.address || "",
        contact.status,
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `clients_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Clients exported successfully!");
    } catch (error) {
      console.error("Error exporting clients:", error);
      toast.error("Failed to export clients");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        toast.error("Invalid CSV file");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to import clients");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const importedContacts = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
        const contact = {
          user_id: session.user.id,
          name: values[0] || "",
          company_name: values[1] || null,
          email: values[2] || null,
          phone: values[3] || null,
          address: values[4] || null,
          status: (values[5]?.toLowerCase() === "customer" ? "customer" : "lead") as "lead" | "customer",
        };

        if (contact.name) {
          importedContacts.push(contact);
        }
      }

      if (importedContacts.length === 0) {
        toast.error("No valid contacts found in file");
        return;
      }

      const { error } = await supabase.from("contacts").insert(importedContacts);

      if (error) throw error;

      toast.success(`Successfully imported ${importedContacts.length} contacts!`);
      setIsImportDialogOpen(false);
      fetchContacts();
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast.error("Failed to import contacts");
    }
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    try {
      const { error } = await supabase.from("contacts").delete().eq("id", contactToDelete);

      if (error) throw error;

      toast.success("Client deleted successfully!");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete client");
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleRowClick = (contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedContact: Contact) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: updatedContact.name,
          email: updatedContact.email,
          phone: updatedContact.phone,
          address: updatedContact.address,
          company_name: updatedContact.company_name,
          status: updatedContact.status,
        })
        .eq("id", updatedContact.id);

      if (error) throw error;

      toast.success("Client updated successfully!");
      setEditDialogOpen(false);
      fetchContacts();
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update client");
    }
  };

  const handleMessageClient = async (contactId: string) => {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", contactId)
        .maybeSingle();

      if (existing) {
        // Navigate to inbox with the conversation
        navigate("/inbox", { state: { conversationId: existing.id } });
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user_id: contactId,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to inbox with the new conversation
      navigate("/inbox", { state: { conversationId: newConv.id } });
      toast.success("Conversation started");
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };


  const getStats = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newLeads = contacts.filter((c) => c.status === "lead" && new Date(c.created_at) >= thirtyDaysAgo).length;

    const newCustomers = contacts.filter(
      (c) => c.status === "customer" && new Date(c.created_at) >= thirtyDaysAgo,
    ).length;

    return { newLeads, newCustomers };
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Clients"
        description="Manage your client relationships"
        actions={
          <div className="flex gap-2">
            <Button className="gradient-primary" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="w-4 h-4 mr-2" />
                  More actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <NewClientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleNewClientSubmit} />
      
      <EditClientDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        contact={selectedContact}
        onSave={handleEditSave}
      />

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: Name, Company, Email, Phone, Address, Status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="csv-file" className="text-sm font-medium">CSV File</label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="cursor-pointer"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1">CSV Format:</p>
              <p>Name, Company, Email, Phone, Address, Status</p>
              <p className="mt-2 text-xs">Status should be either "lead" or "customer"</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-3 sm:p-4 md:p-6 animate-fade-in space-y-4 md:space-y-6">
        {contacts.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <Card className="gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New leads</p>
                    <p className="text-xs text-muted-foreground">Past 30 days</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stats.newLeads}</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New clients</p>
                    <p className="text-xs text-muted-foreground">Past 30 days</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stats.newCustomers}</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total new clients</p>
                    <p className="text-xs text-muted-foreground">Year to date</p>
                    <p className="text-3xl font-bold">{contacts.filter((c) => c.status === "customer").length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contacts Table */}
            <Card className="gradient-card border-border/50 relative">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Filtered clients ({filteredContacts.length} results)</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredContacts.length === 0 && !loading ? (
                <div className="text-center text-muted-foreground py-8">
                  No contacts found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
                  <div className="inline-block min-w-full align-middle">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Name</TableHead>
                          <TableHead className="min-w-[120px] hidden sm:table-cell">Company</TableHead>
                          <TableHead className="min-w-[150px] hidden md:table-cell">Address</TableHead>
                          <TableHead className="min-w-[180px]">Contact</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px] hidden lg:table-cell">Last Activity</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow 
                        key={contact.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(contact)}
                      >
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{contact.company_name || "—"}</TableCell>
                          <TableCell className="hidden md:table-cell">{contact.address || "—"}</TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs sm:text-sm">
                              {contact.email && (
                                <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={contact.status === "customer" ? "default" : "secondary"}
                              className={`text-xs ${contact.status === "customer" ? "bg-green-600" : "bg-blue-600"}`}
                            >
                              {contact.status === "customer" ? "Active" : "Lead"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                            {new Date(contact.updated_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMessageClient(contact.id);
                                  }}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(contact);
                                  }}
                                >
                                <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(contact.id);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </>
        )}

        {contacts.length === 0 && !loading && (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={Users}
              title="Build your client base"
              description="Start building strong relationships by adding your first client. Keep all customer information organized and accessible in one place."
              actionLabel="Create Your First Client"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
