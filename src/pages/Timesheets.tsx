import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Clock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { Calendar } from "@/components/ui/calendar";
import { TimesheetDetailDialog } from "@/components/timesheets/TimesheetDetailDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from "date-fns";

type Timesheet = {
  id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  hours: number | null;
  created_at: string;
};

export const Timesheets = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [timerDuration, setTimerDuration] = useState("0:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [timesheetDetailDialogOpen, setTimesheetDetailDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "General",
    notes: "",
    start_time: "",
    end_time: "",
  });
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    fetchTimesheets();
  }, [currentDate, view]);

  useEffect(() => {
    if (isTimerRunning && timerStartTime) {
      timerInterval.current = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - timerStartTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimerDuration(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning, timerStartTime]);

  useEffect(() => {
    const calculateDuration = () => {
      if (!formData.start_time || !formData.end_time) {
        setDuration("0:00");
        return;
      }
      
      const [startHours, startMinutes] = formData.start_time.split(':').map(Number);
      const [endHours, endMinutes] = formData.end_time.split(':').map(Number);
      
      let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      setDuration(`${hours}:${minutes.toString().padStart(2, '0')}`);
    };
    
    calculateDuration();
  }, [formData.start_time, formData.end_time]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("timesheets")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) throw error;
      setTimesheets(data || []);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      toast.error("Failed to load timesheets");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDate = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNextDate = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTodayTimesheets = () => {
    return timesheets.filter(ts => {
      const tsDate = parseISO(ts.start_time);
      return isSameDay(tsDate, currentDate); // Changed from isToday to use currentDate
    });
  };

  const getWeekTimesheets = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    const categories = Array.from(new Set(timesheets.map(ts => {
      const desc = ts.description || "General";
      return desc.split(':')[0];
    })));
    
    return weekDays.map(day => {
      const dayTimesheets = timesheets.filter(ts => {
        const tsDate = parseISO(ts.start_time);
        return isSameDay(tsDate, day);
      });
      
      const categoryHours: Record<string, number> = {};
      categories.forEach(cat => {
        const catHours = dayTimesheets
          .filter(ts => {
            const desc = ts.description || "General";
            return desc.split(':')[0] === cat;
          })
          .reduce((sum, ts) => sum + (ts.hours || 0), 0);
        categoryHours[cat] = catHours;
      });
      
      return {
        date: day,
        timesheets: dayTimesheets,
        categoryHours,
        totalHours: dayTimesheets.reduce((sum, ts) => sum + (ts.hours || 0), 0)
      };
    });
  };

  const getTotalHours = () => {
    if (view === 'day') {
      return getTodayTimesheets().reduce((sum, ts) => sum + (ts.hours || 0), 0).toFixed(1);
    } else {
      return getWeekTimesheets().reduce((sum, day) => sum + day.totalHours, 0).toFixed(1);
    }
  };

  const getDateHeader = () => {
    if (view === 'day') {
      return `My hours for ${format(currentDate, 'MMMM dd, yyyy')}`;
    } else {
      return 'My hours for this week';
    }
  };

  const handleStartTimer = () => {
    const now = new Date();
    setIsTimerRunning(true);
    setTimerStartTime(now);
    setTimerDuration("0:00");
    setShowForm(false); // Don't show form when timer is running
  };

  const handleStopTimer = async () => {
    if (!timerStartTime) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const hours = (now.getTime() - timerStartTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase.from("timesheets").insert([{
        user_id: user.id,
        job_id: null,
        description: `${formData.category}${formData.notes ? ': ' + formData.notes : ''}`,
        start_time: timerStartTime.toISOString(),
        end_time: now.toISOString(),
        hours: hours,
      }]);

      if (error) throw error;

      toast.success("Time logged successfully!");
      setIsTimerRunning(false);
      setTimerStartTime(null);
      setTimerDuration("0:00");
      setShowForm(false);
      setFormData({ category: "General", notes: "", start_time: "", end_time: "" });
      setDuration("0:00");
      fetchTimesheets();
    } catch (error) {
      console.error("Error saving timesheet:", error);
      toast.error("Failed to log time");
    }
  };

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time) {
      toast.error("Start and end times are required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [startHours, startMinutes] = formData.start_time.split(':').map(Number);
      const [endHours, endMinutes] = formData.end_time.split(':').map(Number);
      
      let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      const hours = totalMinutes / 60;

      // Use the selected currentDate instead of today
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const endDateTime = new Date(currentDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      if (editingId) {
        const { error } = await supabase
          .from("timesheets")
          .update({
            description: `${formData.category}${formData.notes ? ': ' + formData.notes : ''}`,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            hours: hours,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Time updated successfully!");
        setEditingId(null);
      } else {
        const { error } = await supabase.from("timesheets").insert([{
          user_id: user.id,
          job_id: null,
          description: `${formData.category}${formData.notes ? ': ' + formData.notes : ''}`,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          hours: hours,
        }]);

        if (error) throw error;
        toast.success("Time logged successfully!");
      }

      setShowForm(false);
      setFormData({ category: "General", notes: "", start_time: "", end_time: "" });
      setDuration("0:00");
      fetchTimesheets();
    } catch (error) {
      console.error("Error saving timesheet:", error);
      toast.error("Failed to save time");
    }
  };

  const handleEdit = (timesheet: Timesheet) => {
    const startDate = new Date(timesheet.start_time);
    const endDate = timesheet.end_time ? new Date(timesheet.end_time) : new Date();
    
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    const description = timesheet.description || "";
    const category = description.split(':')[0] || "General";
    const notes = description.includes(':') ? description.split(':').slice(1).join(':').trim() : "";

    setFormData({
      category,
      notes,
      start_time: startTime,
      end_time: endTime,
    });
    
    setEditingId(timesheet.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("timesheets")
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Time entry deleted");
      fetchTimesheets();
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsTimerRunning(false);
    setTimerStartTime(null);
    setTimerDuration("0:00");
    setEditingId(null);
    setFormData({ category: "General", notes: "", start_time: "", end_time: "" });
    setDuration("0:00");
  };

  const weekData = getWeekTimesheets();
  const categories = Array.from(new Set(timesheets.map(ts => {
    const desc = ts.description || "General";
    return desc.split(':')[0];
  })));

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b bg-card">
        <div className="p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handlePreviousDate}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className="h-8"
              >
                Day
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="h-8"
              >
                Week
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleNextDate}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 ml-2"
              onClick={handleToday}
            >
              Today
            </Button>
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {view === 'day' ? (
          <>
            {!loading && timesheets.length === 0 && !showForm && !isTimerRunning ? (
              <div className="relative min-h-[400px] p-4">
                <EmptyState
                  icon={Clock}
                  title="Track your work hours"
                  description="Log your time for projects and tasks. Keep accurate records of your work hours and improve time management."
                  actionLabel="Start Your First Timesheet"
                  onAction={() => setShowForm(true)}
                />
              </div>
            ) : (
              <Card className="bg-card border">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">{getDateHeader()}</h2>
                    {!showForm && !isTimerRunning && (
                      <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="text-green-600 hover:text-green-700"
                        variant="ghost"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time
                      </Button>
                    )}
                  </div>

                  {/* No entries for selected date */}
                  {!showForm && !isTimerRunning && getTodayTimesheets().length === 0 && timesheets.length > 0 && (
                    <div className="p-6 bg-muted rounded-lg mb-4">
                      <p className="text-sm">No timesheets logged for {format(currentDate, 'MMMM dd')}</p>
                    </div>
                  )}

                {/* Timer Running State */}
                {isTimerRunning && (
                  <div className="space-y-4 mb-4">
                    {/* Category Selection While Timer Running */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-6 flex items-end">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            Started at {timerStartTime && format(timerStartTime, 'HH:mm')}
                          </span>
                          <span className="font-bold text-lg">{timerDuration}</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-end">
                        <Button
                          onClick={handleStopTimer}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          Stop Timer
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-background min-h-[80px]"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}

                {/* Form */}
                {showForm && !isTimerRunning && (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-12 gap-4">
                      {/* Category */}
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Start */}
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">Start</Label>
                        <Input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          className="bg-background"
                        />
                      </div>

                      {/* End */}
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">End</Label>
                        <Input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          className="bg-background"
                        />
                      </div>

                      {/* Duration */}
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">Duration</Label>
                        <Input
                          value={duration}
                          readOnly
                          className="bg-background"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="col-span-3 flex items-end gap-2">
                        {formData.start_time && formData.end_time ? (
                          <>
                            <Button
                              onClick={handleSave}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {editingId ? 'Update' : 'Save'}
                            </Button>
                            <Button
                              onClick={handleCancel}
                              variant="secondary"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleStartTimer}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-background min-h-[80px]"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}

                {/* Today's Entries */}
                {!showForm && !isTimerRunning && getTodayTimesheets().length > 0 && (
                  <div className="space-y-3 mb-4">
                    {getTodayTimesheets().map((timesheet) => {
                      const startDate = new Date(timesheet.start_time);
                      const endDate = timesheet.end_time ? new Date(timesheet.end_time) : new Date();
                      const timeRange = `${format(startDate, 'H:mm')} to ${format(endDate, 'HH:mm')}`;
                      const category = timesheet.description?.split(':')[0] || "General";
                      const hoursDisplay = timesheet.hours?.toFixed(1) || "0.0";

                      return (
                        <div 
                          key={timesheet.id} 
                          className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => {
                            setSelectedTimesheet(timesheet);
                            setTimesheetDetailDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-6">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">{timeRange}</span>
                            <span className="font-bold">{hoursDisplay}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(timesheet)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(timesheet.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}

                  {/* Total Hours */}
                  {timesheets.length > 0 && (
                    <div className="pt-4 border-t flex justify-end">
                      <div className="text-right">
                        <span className="text-sm font-semibold">Total Hours: {getTotalHours()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Week View */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">My hours for this week</h2>
                  <Button
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                    variant="ghost"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Row
                  </Button>
                </div>

                {/* Week Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-4 pr-4 w-32"></th>
                        {weekData.map((day, idx) => (
                          <th key={idx} className="text-center pb-4 px-2 min-w-[100px]">
                            <div className="text-xs text-muted-foreground">
                              {format(day.date, 'EEE')}
                            </div>
                            <div className="font-semibold">
                              {isToday(day.date) ? 'Today' : format(day.date, 'MMM dd')}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-3 pr-4 font-medium">{category}</td>
                          {weekData.map((day, dayIdx) => (
                            <td key={dayIdx} className="py-3 px-2 text-center">
                              <Input
                                value={day.categoryHours[category]?.toFixed(1) || '0:00'}
                                readOnly
                                className="text-center bg-background"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-3 pr-4">Total Hours:</td>
                        {weekData.map((day, dayIdx) => (
                          <td key={dayIdx} className="py-3 px-2 text-center">
                            {day.totalHours.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <Button className="bg-primary">Update Timesheet</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <TimesheetDetailDialog
        timesheet={selectedTimesheet}
        open={timesheetDetailDialogOpen}
        onOpenChange={setTimesheetDetailDialogOpen}
      />
    </div>
  );
};