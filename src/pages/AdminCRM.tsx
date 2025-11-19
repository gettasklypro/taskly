import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";

interface Lead {
  id: string;
  business_name: string;
  trade: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  business_type: string | null;
  country: string | null;
  created_at: string;
}

const AdminCRM = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    trade: "",
    location: "",
    phone: "",
    email: "",
    website: "",
    notes: "",
    business_type: "",
    country: "",
  });

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Set up realtime subscription
    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!formData.business_name.trim()) {
      toast.error("Business name is required");
      return;
    }

    try {
      const { error } = await supabase.from("leads").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Lead added successfully");
      setFormData({
        business_name: "",
        trade: "",
        location: "",
        phone: "",
        email: "",
        website: "",
        notes: "",
        business_type: "",
        country: "",
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Failed to add lead");
    }
  };

  const handleExtractWebsiteData = async () => {
    if (!formData.website) {
      toast.error("Please enter a website URL first");
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-website-data', {
        body: { url: formData.website }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          business_name: data.data.businessName || prev.business_name,
          email: data.data.email || prev.email,
          phone: data.data.phone || prev.phone,
          location: data.data.location || prev.location,
          notes: data.data.notes || prev.notes,
        }));
        
        toast.success("Website data extracted successfully!");
      }
    } catch (error) {
      console.error('Error extracting website data:', error);
      toast.error("Failed to extract website data");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus as "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.trade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBusinessType =
      businessTypeFilter === "all" || lead.business_type === businessTypeFilter;
    const matchesCountry =
      countryFilter === "all" || lead.country === countryFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesBusinessType && matchesCountry && matchesStatus;
  });

  const businessTypes = Array.from(
    new Set(leads.map((l) => l.business_type).filter(Boolean))
  );
  const countries = Array.from(
    new Set(leads.map((l) => l.country).filter(Boolean))
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Briefcase className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Local Trade Lead Finder & Closer</h1>
      </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, trade, location, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Business Type - All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Business Types</SelectItem>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type!}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Country - All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country!}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lead Status - All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Add Form */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Business</label>
                  <Input
                    placeholder="e.g. Apex Roofing"
                    value={formData.business_name}
                    onChange={(e) =>
                      setFormData({ ...formData, business_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Trade</label>
                  <Input
                    placeholder="e.g. Roofer"
                    value={formData.trade}
                    onChange={(e) =>
                      setFormData({ ...formData, trade: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="e.g. London, UK"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    placeholder="+44 ..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="name@business.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Website</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleExtractWebsiteData}
                      disabled={!formData.website || isExtracting}
                      variant="outline"
                      size="icon"
                      title="Extract data from website"
                    >
                      {isExtracting ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        "🔍"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredLeads.length === leads.length
                ? `All Leads (${leads.length})`
                : `Filtered Leads (${filteredLeads.length} of ${leads.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leads found. Add your first lead above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.business_name}
                        </TableCell>
                        <TableCell>{lead.trade || "-"}</TableCell>
                        <TableCell>{lead.location || "-"}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {lead.email && <div>{lead.email}</div>}
                            {lead.phone && <div>{lead.phone}</div>}
                            {!lead.email && !lead.phone && "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Link
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {lead.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) =>
                              handleUpdateStatus(lead.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="proposal">Proposal</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="won">Won</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

export default AdminCRM;
