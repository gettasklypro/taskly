import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const mockEvents = [
  { id: 1, title: "Client Meeting - Acme Corp", time: "9:00 AM", duration: "1h", type: "meeting" },
  { id: 2, title: "Site Visit - BuildRight LLC", time: "11:00 AM", duration: "2h", type: "visit" },
  { id: 3, title: "Project Review", time: "2:00 PM", duration: "1h", type: "review" },
  { id: 4, title: "Team Standup", time: "4:00 PM", duration: "30m", type: "meeting" },
];

export const Schedule = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Schedule" 
        description="View and manage your appointments and tasks"
      />
      
      <div className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Calendar view coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {mockEvents.map((event, i) => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-lg bg-secondary/50 border border-border/50 hover-lift"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">{event.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
