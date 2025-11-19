import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type Timesheet = {
  id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  hours: number | null;
  created_at: string;
};

type TimesheetDetailDialogProps = {
  timesheet: Timesheet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TimesheetDetailDialog = ({ timesheet, open, onOpenChange }: TimesheetDetailDialogProps) => {
  if (!timesheet) return null;

  const category = timesheet.description?.split(':')[0] || "General";
  const notes = timesheet.description?.includes(':') ? timesheet.description.split(':').slice(1).join(':').trim() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{category}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Time</Label>
              <p className="font-medium">{format(new Date(timesheet.start_time), "MMM dd, yyyy HH:mm")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">End Time</Label>
              <p className="font-medium">
                {timesheet.end_time ? format(new Date(timesheet.end_time), "MMM dd, yyyy HH:mm") : "Still running"}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Duration</Label>
            <p className="font-medium text-2xl">{timesheet.hours?.toFixed(2)} hours</p>
          </div>

          {notes && (
            <div>
              <Label className="text-muted-foreground">Notes</Label>
              <p className="mt-2 text-sm whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
