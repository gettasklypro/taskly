import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Calendar, X, Paperclip, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RequestCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: { id: string; name: string }[];
  onSubmit: (data: any) => void;
  onCreateNewClient: () => void;
}

export const RequestCreationDialog = ({ open, onOpenChange, contacts, onSubmit, onCreateNewClient }: RequestCreationDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_id: "",
    priority: "medium",
    assessmentInstructions: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    scheduleLater: false,
    anytime: false,
    assignedTeam: [] as string[],
    emailTeam: false,
    notes: "",
  });

  const [showAssessment, setShowAssessment] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [currentUserName] = useState("User");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [noteAttachments, setNoteAttachments] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 10) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    onCreateNewClient();
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
                              <Calendar className="mr-2 h-4 w-4" />
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
                              <Calendar className="mr-2 h-4 w-4" />
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
                        <span className="text-sm font-medium">{formData.assignedTeam.length > 0 ? formData.assignedTeam.join(", ") : currentUserName}</span>
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 bg-background rounded-lg border">
                        <Input
                          placeholder="Search"
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          className="bg-muted"
                        />
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
  );
};
