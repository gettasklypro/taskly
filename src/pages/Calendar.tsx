import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Briefcase, FileText, CheckSquare, Calendar as CalendarIcon, Eye, MapPin, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TaskDialog } from "@/components/calendar/TaskDialog";
import { JobCreationDialog } from "@/components/calendar/JobCreationDialog";
import { RequestCreationDialog } from "@/components/calendar/RequestCreationDialog";
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { toast } from "sonner";

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "day">("month");
  const [showTimeSlotMenu, setShowTimeSlotMenu] = useState(false);
  const [timeSlotMenuPosition, setTimeSlotMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<"job" | "task" | "request">("job");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_id: "",
    status: "draft",
    total_amount: "",
    scheduled_date: "",
    priority: "medium",
    job_id: "",
    due_date: "",
    salesperson: "",
  });
  const [scheduleLater, setScheduleLater] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [repeats, setRepeats] = useState("never");
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [emailTeam, setEmailTeam] = useState(false);
  const [teamReminder, setTeamReminder] = useState("24_hours");
  const [jobs, setJobs] = useState<any[]>([]);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    types: {
      tasks: true,
      visits: true,
      reminders: true,
      events: true,
      requests: true,
      dailyVisitCounts: true,
    },
    status: {
      unassigned: false,
    },
    days: {
      showWeekends: true,
    },
  });

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const displayedDaysOfWeek = filters.days.showWeekends 
    ? daysOfWeek 
    : daysOfWeek.slice(1, 6); // Only MON-FRI
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [jobsRes, tasksRes, requestsRes] = await Promise.all([
        supabase.from("jobs").select("*, contacts(name)").eq("user_id", user.id).not("scheduled_date", "is", null),
        supabase.from("tasks").select("*").eq("user_id", user.id).not("due_date", "is", null),
        supabase.from("service_requests").select("*, contacts(name)").eq("user_id", user.id),
      ]);

      const allEvents = [
        ...(jobsRes.data || []).map((j: any) => ({ ...j, type: "job", date: j.scheduled_date })),
        ...(tasksRes.data || []).map((t: any) => ({ ...t, type: "task", date: t.due_date })),
        ...(requestsRes.data || []).map((r: any) => ({ ...r, type: "request", date: r.created_at })),
      ];

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("contacts")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");
    
    setContacts(data || []);
  };

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("user_id", user.id)
      .order("title");
    
    setJobs(data || []);
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

  useEffect(() => {
    fetchEvents();
    fetchContacts();
    fetchJobs();

    const channel = supabase
      .channel("calendar-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchEvents)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchEvents)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
    }
    
    // Filter out weekends if needed
    if (!filters.days.showWeekends) {
      return days.filter(day => {
        const dayOfWeek = day.fullDate.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Sunday, 6 = Saturday
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      if (eventDate.toDateString() !== date.toDateString()) return false;
      
      // Apply type filters
      if (event.type === "task" && !filters.types.tasks) return false;
      if (event.type === "request" && !filters.types.requests) return false;
      if (event.type === "job" && !filters.types.events) return false;
      
      // Apply status filter (unassigned means no contact_id)
      if (filters.status.unassigned && event.contact_id) return false;
      
      return true;
    });
  };
  
  const clearFilters = () => {
    setFilters({
      types: {
        tasks: true,
        visits: true,
        reminders: true,
        events: true,
        requests: true,
        dailyVisitCounts: true,
      },
      status: {
        unassigned: false,
      },
      days: {
        showWeekends: true,
      },
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (type: "job" | "task" | "request", date: Date, hour?: number) => {
    setEventType(type);
    const eventDate = new Date(date);
    if (hour !== undefined) {
      eventDate.setHours(hour, 0, 0, 0);
    }
    setSelectedDate(eventDate);
    setShowNewEventDialog(true);
    setShowTimeSlotMenu(false);
  };

  const handleTimeSlotClick = (e: React.MouseEvent, date: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTimeSlotMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedTimeSlot({ date, hour });
    setShowTimeSlotMenu(true);
  };

  const handleShowDayView = (date: Date) => {
    setSelectedDate(date);
    setCalendarView("day");
  };

  const handleShowMapView = (date: Date) => {
    toast.info(`Map view for ${date.toLocaleDateString()} - Coming soon!`);
  };

  const formatEventTime = (event: any) => {
    if (event.type === "job" && event.scheduled_date) {
      return new Date(event.scheduled_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return "All day";
  };

  const getStatusBadge = (event: any) => {
    const status = event.status || "new";
    const statusColors: Record<string, string> = {
      scheduled: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      active: "bg-green-500/20 text-green-500 border-green-500/50",
      completed: "bg-primary/20 text-primary border-primary/50",
      todo: "bg-gray-500/20 text-gray-500 border-gray-500/50",
      "in-progress": "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
      new: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      draft: "bg-gray-500/20 text-gray-500 border-gray-500/50",
    };
    return statusColors[status] || statusColors.new;
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedDate) return;

      if (!formData.title.trim()) {
        toast.error("Title is required");
        return;
      }

      if (eventType === "job") {
        const jobData: any = {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || null,
          status: formData.status,
          total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
          salesperson: formData.salesperson.trim() || null,
        };
        
        if (formData.scheduled_date) {
          jobData.scheduled_date = formData.scheduled_date;
        }
        
        await supabase.from("jobs").insert(jobData);
      } else if (eventType === "task") {
        const taskData: any = {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: "todo",
          job_id: formData.job_id || null,
        };
        
        if (formData.due_date) {
          taskData.due_date = formData.due_date;
        }
        
        await supabase.from("tasks").insert(taskData);
      } else if (eventType === "request") {
        await supabase.from("service_requests").insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || null,
          priority: formData.priority,
          status: "new",
        } as any);
      }

      toast.success(`${eventType === "job" ? "Job" : eventType === "task" ? "Task" : "Request"} created successfully`);
      setShowNewEventDialog(false);
      setFormData({ 
        title: "", 
        description: "", 
        contact_id: "", 
        status: "draft", 
        total_amount: "",
        scheduled_date: "",
        priority: "medium",
        job_id: "",
        due_date: "",
        salesperson: "",
      });
      setScheduleLater(false);
      setAllDay(false);
      setRepeats("never");
      setAssignedMembers([]);
      setEmailTeam(false);
      setTeamReminder("24_hours");
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event");
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "job": return <Briefcase className="w-3 h-3" />;
      case "task": return <CheckSquare className="w-3 h-3" />;
      case "request": return <FileText className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "job": return "bg-primary/20 border-primary/50 text-primary";
      case "task": return "bg-accent/20 border-accent/50 text-accent";
      case "request": return "bg-orange-500/20 border-orange-500/50 text-orange-500";
      default: return "bg-muted border-border";
    }
  };

  const days = getDaysInMonth(currentDate);
  const dayViewDate = selectedDate || currentDate;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Calendar" description="Manage your schedule and appointments" />
      
      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleToday} variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Today
            </Button>
            <Button 
              onClick={() => {
                if (calendarView === "month") {
                  handlePrevMonth();
                } else {
                  setSelectedDate(new Date((selectedDate || currentDate).getTime() - 86400000));
                }
              }} 
              variant="outline" 
              size="icon"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => {
                if (calendarView === "month") {
                  handleNextMonth();
                } else {
                  setSelectedDate(new Date((selectedDate || currentDate).getTime() + 86400000));
                }
              }} 
              variant="outline" 
              size="icon"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-base sm:text-lg font-semibold ml-0 sm:ml-4">
              {calendarView === "month" 
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : dayViewDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              }
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setCalendarView("month")}
              variant={calendarView === "month" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 sm:flex-initial"
            >
              Month
            </Button>
            <Button 
              onClick={() => {
                setSelectedDate(currentDate);
                setCalendarView("day");
              }}
              variant={calendarView === "day" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 sm:flex-initial"
            >
              Day
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="flex-1 sm:flex-initial"
                >
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 p-0 bg-card z-50" 
                align="end"
                sideOffset={8}
              >
                <div className="p-4 overflow-y-auto max-h-[600px]">
                  {/* Header with Clear Filters */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  </div>

                  {/* TYPES Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-tasks"
                          checked={filters.types.tasks}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, tasks: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-tasks" className="text-sm cursor-pointer flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                          Tasks
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-visits"
                          checked={filters.types.visits}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, visits: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-visits" className="text-sm cursor-pointer flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          Visits
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-reminders"
                          checked={filters.types.reminders}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, reminders: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-reminders" className="text-sm cursor-pointer flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-red-500" />
                          Reminders
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-events"
                          checked={filters.types.events}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, events: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-events" className="text-sm cursor-pointer flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-yellow-500" />
                          Events
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-requests"
                          checked={filters.types.requests}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, requests: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-requests" className="text-sm cursor-pointer flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          Requests
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-daily-visits"
                          checked={filters.types.dailyVisitCounts}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, types: { ...filters.types, dailyVisitCounts: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-daily-visits" className="text-sm cursor-pointer flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-500" />
                          Daily Visit Counts
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* STATUS Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-unassigned"
                          checked={filters.status.unassigned}
                          onCheckedChange={(checked) =>
                            setFilters({ ...filters, status: { ...filters.status, unassigned: checked as boolean } })
                          }
                        />
                        <label htmlFor="filter-unassigned" className="text-sm cursor-pointer flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500" />
                          Unassigned
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* DAYS Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Days</h4>
                    <div className="flex items-center justify-between">
                      <label htmlFor="show-weekends" className="text-sm cursor-pointer flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-yellow-500" />
                        Show/Hide Weekends
                      </label>
                      <Switch
                        id="show-weekends"
                        checked={filters.days.showWeekends}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, days: { ...filters.days, showWeekends: checked } })
                        }
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Month View */}
        {calendarView === "month" && (
          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
          {/* Days Header */}
          <div className={`grid ${filters.days.showWeekends ? 'grid-cols-7' : 'grid-cols-5'} border-b bg-muted/30`}>
            {displayedDaysOfWeek.map((day) => (
              <div key={day} className="p-1 sm:p-2 md:p-3 text-center text-xs sm:text-sm font-semibold border-r last:border-r-0">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={`grid ${filters.days.showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
            {days.map((day, index) => {
              const dayEvents = day.isCurrentMonth ? getEventsForDate(day.fullDate) : [];
              const isToday = day.fullDate.toDateString() === new Date().toDateString();
              
              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border-r border-b last:border-r-0 p-1 sm:p-2 hover:bg-accent/5 cursor-pointer transition-colors ${
                        !day.isCurrentMonth ? "bg-muted/20 text-muted-foreground" : ""
                      } ${isToday ? "bg-primary/5" : ""}`}
                    >
                      <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isToday ? "text-primary font-bold" : ""}`}>
                        {day.date}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded border flex items-center gap-0.5 sm:gap-1 ${getEventColor(event.type)}`}
                          >
                            <span className="hidden sm:inline">{getEventIcon(event.type)}</span>
                            <span className="truncate flex-1">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground pl-0.5 sm:pl-1">+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  {day.isCurrentMonth && (
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={() => handleAddEvent("job", day.fullDate)}>
                        <Briefcase className="w-4 h-4 mr-2 text-green-500" />
                        New Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEvent("request", day.fullDate)}>
                        <FileText className="w-4 h-4 mr-2 text-orange-500" />
                        New Request
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEvent("task", day.fullDate)}>
                        <CheckSquare className="w-4 h-4 mr-2 text-blue-500" />
                        New Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEvent("task", day.fullDate)}>
                        <CalendarIcon className="w-4 h-4 mr-2 text-yellow-500" />
                        New Calendar Event
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleShowDayView(day.fullDate)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Show on Day View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShowMapView(day.fullDate)}>
                        <MapPin className="w-4 h-4 mr-2" />
                        Show on Map View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              );
            })}
          </div>
        </div>
        )}

        {/* Day View */}
        {calendarView === "day" && (
          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            {/* Wrapper for horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <div className="min-w-[1600px]">
                {/* Timeline Header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                  <div className="flex">
                    <div className="w-24 sm:w-32 flex-shrink-0 border-r bg-muted/30 p-2 sm:p-3 text-xs font-semibold">
                      ANY TIME
                    </div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div 
                        key={i} 
                        className="min-w-[60px] sm:min-w-[100px] flex-shrink-0 border-r p-2 sm:p-3 text-center text-xs font-semibold"
                      >
                        {i}:00
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="relative">
                  {/* Scheduled events rows with time slots */}
                  {Array.from({ length: Math.max(3, getEventsForDate(dayViewDate).filter(e => e.scheduled_date && new Date(e.scheduled_date).getHours() > 0).length) }, (_, rowIndex) => {
                    const scheduledEvents = getEventsForDate(dayViewDate).filter(event => event.scheduled_date && new Date(event.scheduled_date).getHours() > 0);
                    const event = scheduledEvents[rowIndex];

                    return (
                      <div key={rowIndex} className="flex border-b hover:bg-accent/5 min-h-[60px]">
                        <div className="w-24 sm:w-32 flex-shrink-0 border-r p-2 sm:p-3 text-xs sm:text-sm">
                          {event?.contacts?.name || ""}
                        </div>
                        <div className="relative flex-1">
                          {/* Hour grid lines with click areas */}
                          {Array.from({ length: 24 }, (_, i) => (
                            <div 
                              key={i}
                              className="absolute top-0 bottom-0 border-r hover:bg-accent/10 cursor-pointer transition-colors z-0"
                              style={{ left: `${i * 60}px`, width: '60px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTimeSlotClick(e, dayViewDate, i);
                              }}
                            />
                          ))}
                          
                          {/* Event block */}
                          {event && (() => {
                            const eventDate = new Date(event.scheduled_date);
                            const hour = eventDate.getHours();
                            const minutes = eventDate.getMinutes();
                            const leftPosition = hour * 60 + (minutes / 60) * 60;

                            return (
                              <div
                                className={`absolute top-2 h-10 rounded-md border px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 ${getEventColor(event.type)} cursor-pointer hover:opacity-90 transition-opacity z-20 pointer-events-auto`}
                                style={{ 
                                  left: `${leftPosition}px`,
                                  minWidth: '120px',
                                  maxWidth: '200px'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getEventIcon(event.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs sm:text-sm truncate">{event.title}</div>
                                  <div className="text-[10px] sm:text-xs opacity-75">
                                    {eventDate.toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Slot Menu - Outside main content for proper z-index */}
      {showTimeSlotMenu && selectedTimeSlot && (
        <div 
          className="fixed inset-0 z-[9999]"
          onMouseDown={(e) => {
            // Only close if clicking the backdrop, not the menu
            if (e.target === e.currentTarget) {
              setShowTimeSlotMenu(false);
            }
          }}
        >
          <div
            className="absolute bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl w-56 py-2"
            style={{
              left: `${Math.min(timeSlotMenuPosition.x, window.innerWidth - 250)}px`,
              top: `${Math.min(timeSlotMenuPosition.y, window.innerHeight - 300)}px`,
            }}
          >
            <div className="px-3 py-2 text-sm font-semibold text-foreground border-b border-border mb-1">
              Add to {selectedTimeSlot.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleAddEvent("job", selectedTimeSlot.date, selectedTimeSlot.hour);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <Briefcase className="w-4 h-4 text-green-500" />
              <span>New Job</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleAddEvent("request", selectedTimeSlot.date, selectedTimeSlot.hour);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-orange-500" />
              <span>New Request</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleAddEvent("task", selectedTimeSlot.date, selectedTimeSlot.hour);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <span>New Task</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleAddEvent("task", selectedTimeSlot.date, selectedTimeSlot.hour);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <CalendarIcon className="w-4 h-4 text-yellow-500" />
              <span>New Calendar Event</span>
            </button>
          </div>
        </div>
      )}

      {/* New Event Dialogs */}
      {eventType === "task" ? (
        <TaskDialog
          open={showNewEventDialog}
          onOpenChange={setShowNewEventDialog}
          contacts={contacts}
          formData={formData}
          setFormData={setFormData}
          scheduleLater={scheduleLater}
          setScheduleLater={setScheduleLater}
          allDay={allDay}
          setAllDay={setAllDay}
          repeats={repeats}
          setRepeats={setRepeats}
          assignedMembers={assignedMembers}
          setAssignedMembers={setAssignedMembers}
          emailTeam={emailTeam}
          setEmailTeam={setEmailTeam}
          teamReminder={teamReminder}
          setTeamReminder={setTeamReminder}
          onSubmit={handleSubmit}
          onCreateNewClient={() => setShowNewClientDialog(true)}
        />
      ) : eventType === "job" ? (
        <JobCreationDialog
          open={showNewEventDialog}
          onOpenChange={setShowNewEventDialog}
          contacts={contacts}
          onSubmit={handleSubmit}
          onCreateNewClient={() => setShowNewClientDialog(true)}
        />
      ) : (
        <RequestCreationDialog
          open={showNewEventDialog}
          onOpenChange={setShowNewEventDialog}
          contacts={contacts}
          onSubmit={handleSubmit}
          onCreateNewClient={() => setShowNewClientDialog(true)}
        />
      )}

      {/* New Client Dialog */}
      <NewClientDialog 
        open={showNewClientDialog} 
        onOpenChange={setShowNewClientDialog} 
        onSubmit={handleCreateNewClient} 
      />
    </div>
  );
};