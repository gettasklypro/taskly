import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Inbox, Upload, Calendar, FileText, X, Paperclip } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from "@/components/ui/checkbox";
import { RequestDetailDialog } from "@/components/requests/RequestDetailDialog";
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

type Request = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  schedule_later: boolean | null;
  anytime: boolean | null;
  on_site_assessment: boolean | null;
  assessment_instructions: string | null;
  email_team: boolean | null;
  team_reminder: string | null;
  notes: string | null;
  created_at: string;
  contacts?: { name: string } | null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "bg-blue-600";
    case "contacted": return "bg-yellow-600";
    case "quoted": return "bg-purple-600";
    case "converted": return "bg-green-600";
    case "lost": return "bg-red-600";
    default: return "bg-gray-600";
  }
};

export const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [currentUserName, setCurrentUserName] = useState("User");
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [noteAttachments, setNoteAttachments] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_id: "",
    priority: "medium",
    onSiteAssessment: "",
    notes: "",
    assessmentInstructions: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    scheduleLater: false,
    anytime: false,
    assignedTeam: [] as string[],
    emailTeam: false,
    teamReminder: "no-reminder",
  });

  const timeSlots = [
    "12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM",
    "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM",
    "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
    "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
  ];

  useEffect(() => {
    fetchRequests();
    fetchContacts();
    fetchCurrentUser();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setCurrentUserName(profile.full_name);
          setFormData(prev => ({ ...prev, assignedTeam: [profile.full_name] }));
        } else if (profile?.email) {
          setCurrentUserName(profile.email);
          setFormData(prev => ({ ...prev, assignedTeam: [profile.email] }));
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, contacts(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setUploadedImages([...uploadedImages, ...files]);
  };

  const handleNoteAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNoteAttachments([...noteAttachments, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const removeNoteAttachment = (index: number) => {
    setNoteAttachments(noteAttachments.filter((_, i) => i !== index));
  };

  const uploadFilesToStorage = async (files: File[], userId: string, prefix: string) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('request-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('request-files')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
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

      // Upload files if any
      let imageUrls: string[] = [];
      let attachmentUrls: string[] = [];

      if (uploadedImages.length > 0) {
        imageUrls = await uploadFilesToStorage(uploadedImages, user.id, 'image');
      }

      if (noteAttachments.length > 0) {
        attachmentUrls = await uploadFilesToStorage(noteAttachments, user.id, 'attachment');
      }

      // Insert service request with all data
      const { data: requestData, error } = await supabase.from("service_requests").insert([{
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        contact_id: formData.contact_id || null,
        priority: formData.priority,
        status: 'new',
        scheduled_start_date: formData.scheduleLater ? null : formData.startDate.toISOString(),
        scheduled_end_date: formData.scheduleLater ? null : formData.endDate.toISOString(),
        scheduled_start_time: formData.scheduleLater ? null : formData.startTime,
        scheduled_end_time: formData.scheduleLater ? null : formData.endTime,
        schedule_later: formData.scheduleLater,
        anytime: formData.anytime,
        on_site_assessment: showAssessment,
        assessment_instructions: formData.assessmentInstructions.trim() || null,
        notes: formData.notes.trim() || null,
        email_team: formData.emailTeam,
        team_reminder: formData.teamReminder,
      }] as any).select().single();

      if (error) throw error;

      // Save team assignments
      if (requestData && formData.assignedTeam.length > 0) {
        const teamAssignments = formData.assignedTeam.map(member => ({
          user_id: user.id,
          entity_type: 'request',
          entity_id: requestData.id,
          team_member_name: member,
        }));
        await supabase.from("team_assignments").insert(teamAssignments);
      }

      // Save attachments
      if (requestData && imageUrls.length > 0) {
        const imageAttachments = imageUrls.map(url => ({
          user_id: user.id,
          entity_type: 'request',
          entity_id: requestData.id,
          file_name: 'image',
          file_url: url,
          file_type: 'image',
        }));
        await supabase.from("attachments").insert(imageAttachments);
      }

      if (requestData && attachmentUrls.length > 0) {
        const noteAttachmentsData = attachmentUrls.map(url => ({
          user_id: user.id,
          entity_type: 'request',
          entity_id: requestData.id,
          file_name: 'attachment',
          file_url: url,
          file_type: 'document',
        }));
        await supabase.from("attachments").insert(noteAttachmentsData);
      }

      toast.success("Request created successfully!");
      setIsDialogOpen(false);
      setShowAssessment(false);
      setShowTeamSelector(false);
      setUploadedImages([]);
      setNoteAttachments([]);
      setFormData({ 
        title: "", 
        description: "", 
        contact_id: "", 
        priority: "medium", 
        onSiteAssessment: "", 
        notes: "",
        assessmentInstructions: "",
        startDate: new Date(),
        endDate: new Date(),
        startTime: "04:00 PM",
        endTime: "05:00 PM",
        scheduleLater: false,
        anytime: false,
        assignedTeam: [currentUserName],
        emailTeam: false,
        teamReminder: "no-reminder",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    }
  };

  const handleCreateNewClient = async (data: any) => {
    const name = `${data.firstName} ${data.lastName}`.trim() || "Unnamed Client";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to add clients");
        return;
      }

      const { data: newContact, error } = await supabase
        .from("contacts")
        .insert({
          user_id: session.user.id,
          name: name,
          email: data.email || null,
          phone: data.phoneNumber || null,
          address: `${data.street1} ${data.street2} ${data.city} ${data.province} ${data.postalCode}`.trim() || null,
          company_name: data.companyName || null,
          status: "lead",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Client added successfully!");
      
      if (!data.saveAndCreateAnother) {
        setShowNewClientDialog(false);
      }
      
      // Refresh contacts list
      await fetchContacts();
      
      // Auto-select the newly created client
      if (newContact) {
        setFormData({ ...formData, contact_id: newContact.id });
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Service Requests" 
        description="Manage incoming customer requests"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              <div className="bg-primary text-primary-foreground p-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    New Request
                  </DialogTitle>
                </DialogHeader>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Title"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
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
                      <SelectTrigger className="mt-1">
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

                  <div>
                    <p className="text-sm text-muted-foreground">Requested on</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Overview</h3>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold">Service details</Label>
                    <p className="text-xs text-muted-foreground mb-2">Please provide as much information as you can</p>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder=""
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Share images of the work to be done</p>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{uploadedImages.length}/10</p>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">On-site assessment</h3>
                  {!showAssessment ? (
                    <div 
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setShowAssessment(true)}
                    >
                      <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Visit the property to assess the job before you do the work</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-6 space-y-6 bg-muted/30">
                      <div>
                        <Label>Instructions</Label>
                        <Textarea
                          value={formData.assessmentInstructions}
                          onChange={(e) => setFormData({ ...formData, assessmentInstructions: e.target.value })}
                          placeholder="Instructions"
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Schedule Section */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Schedule</h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Start date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={formData.scheduleLater}
                                    className={cn(
                                      "w-full justify-start text-left font-normal mt-1",
                                      !formData.startDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.startDate ? format(formData.startDate, "MMM dd, yyyy") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={formData.startDate}
                                    onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <Label className="text-xs">End date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={formData.scheduleLater}
                                    className={cn(
                                      "w-full justify-start text-left font-normal mt-1",
                                      !formData.endDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.endDate ? format(formData.endDate, "MMM dd, yyyy") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={formData.endDate}
                                    onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Start time</Label>
                              <Select
                                value={formData.startTime}
                                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                                disabled={formData.scheduleLater || formData.anytime}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">End time</Label>
                              <Select
                                value={formData.endTime}
                                onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                                disabled={formData.scheduleLater || formData.anytime}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="schedule-later"
                              checked={formData.scheduleLater}
                              onCheckedChange={(checked) => setFormData({ ...formData, scheduleLater: checked as boolean })}
                            />
                            <Label htmlFor="schedule-later" className="cursor-pointer text-sm">
                              Schedule later
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="anytime"
                              checked={formData.anytime}
                              onCheckedChange={(checked) => setFormData({ ...formData, anytime: checked as boolean })}
                            />
                            <Label htmlFor="anytime" className="cursor-pointer text-sm">
                              Anytime
                            </Label>
                          </div>
                        </div>

                        {/* Team Section */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Team</h4>

                          {!showTeamSelector ? (
                            <div 
                              className="flex items-center gap-2 p-3 bg-background rounded-lg border cursor-pointer hover:bg-muted/50"
                              onClick={() => setShowTeamSelector(true)}
                            >
                              <span className="text-sm">Assigned | </span>
                              <span className="text-sm font-medium">{formData.assignedTeam.join(", ")}</span>
                            </div>
                          ) : (
                            <div className="space-y-3 p-4 bg-background rounded-lg border">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm">Assigned | </span>
                                <span className="text-sm font-medium">{formData.assignedTeam.join(", ")}</span>
                              </div>
                              
                              <Input
                                placeholder="Search"
                                value={teamSearchQuery}
                                onChange={(e) => setTeamSearchQuery(e.target.value)}
                                className="bg-muted"
                              />

                              <div className="flex items-center justify-between text-sm">
                                <span>{formData.assignedTeam.length} selected</span>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="text-primary h-auto p-0"
                                  onClick={() => setFormData({ ...formData, assignedTeam: [] })}
                                >
                                  Clear
                                </Button>
                              </div>

                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {[currentUserName].filter(name => 
                                  name.toLowerCase().includes(teamSearchQuery.toLowerCase())
                                ).map((name) => (
                                  <div 
                                    key={name}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => {
                                      if (formData.assignedTeam.includes(name)) {
                                        setFormData({ 
                                          ...formData, 
                                          assignedTeam: formData.assignedTeam.filter(t => t !== name) 
                                        });
                                      } else {
                                        setFormData({ 
                                          ...formData, 
                                          assignedTeam: [...formData.assignedTeam, name] 
                                        });
                                      }
                                    }}
                                  >
                                    <span className="text-sm">{name}</span>
                                    {formData.assignedTeam.includes(name) && (
                                      <span className="text-primary">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                                onClick={() => setShowTeamSelector(false)}
                              >
                                Done
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="email-team"
                              checked={formData.emailTeam}
                              onCheckedChange={(checked) => setFormData({ ...formData, emailTeam: checked as boolean })}
                            />
                            <Label htmlFor="email-team" className="cursor-pointer text-sm">
                              Email team when assigned
                            </Label>
                          </div>

                          <div>
                            <Label className="text-sm">Team reminder</Label>
                            <Select
                              value={formData.teamReminder}
                              onValueChange={(value) => setFormData({ ...formData, teamReminder: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-reminder">No reminder set</SelectItem>
                                <SelectItem value="15-min">15 minutes before</SelectItem>
                                <SelectItem value="30-min">30 minutes before</SelectItem>
                                <SelectItem value="1-hour">1 hour before</SelectItem>
                                <SelectItem value="1-day">1 day before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Leave a note"
                      rows={4}
                      className="resize-none bg-background mb-3"
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach files & photos
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">Select or drag files here to upload</p>
                    </div>

                    {noteAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {noteAttachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg border">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNoteAttachment(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                    Save Request
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
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={FileText}
              title="Capture the right details upfront"
              description="Use service requests to gather key information and better understand a job's potential profitability."
              actionLabel="Create Your First Request"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                className="hover-lift cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request);
                  setDetailDialogOpen(true);
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">{request.title}</h3>
                        <Badge variant="outline" className="capitalize text-xs">{request.priority}</Badge>
                      </div>
                      {request.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{request.description}</p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {request.contacts?.name || "No client assigned"} • 
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} whitespace-nowrap text-xs`}>
                      {request.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <RequestDetailDialog
        request={selectedRequest}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onUpdate={fetchRequests}
      />

      <NewClientDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSubmit={handleCreateNewClient}
      />
    </div>
  );
};