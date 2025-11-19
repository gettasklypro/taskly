import { Calendar, FileText, CreditCard, Users, BarChart3, Smartphone, Bell, Cloud, Clock, Receipt, FolderOpen, MessageSquare, MapPin, FileBarChart, Zap, Globe, CheckCircle2 } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: [
        "AI-powered job scheduling",
        "Route optimization",
        "Maximize daily capacity",
        "Drag-and-drop calendar"
      ]
    },
    {
      icon: FileText,
      title: "Quick Quoting",
      description: [
        "Professional quotes in minutes",
        "Customizable templates",
        "Automatic calculations",
        "Digital signatures"
      ]
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: [
        "Accept credit cards & ACH",
        "Online payment processing",
        "Automatic invoice generation",
        "Payment reminders"
      ]
    },
    {
      icon: Users,
      title: "Client Management",
      description: [
        "Detailed client records",
        "Communication history",
        "Service preferences",
        "Contact management"
      ]
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: [
        "Revenue tracking",
        "Job completion rates",
        "Team performance metrics",
        "Live dashboards"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: [
        "iOS and Android apps",
        "Manage on-the-go",
        "Offline access",
        "Real-time sync"
      ]
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: [
        "Automated reminders",
        "Client notifications",
        "Team alerts",
        "Custom triggers"
      ]
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: [
        "Access data anywhere",
        "Secure cloud backup",
        "Automatic sync",
        "99.9% uptime"
      ]
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: [
        "Track hours per job",
        "Automatic timesheets",
        "Payroll integration",
        "Overtime calculations"
      ]
    },
    {
      icon: Receipt,
      title: "Expense Management",
      description: [
        "Receipt capture",
        "Expense tracking",
        "Budget management",
        "Cost monitoring"
      ]
    },
    {
      icon: FolderOpen,
      title: "Document Hub",
      description: [
        "Store contracts & permits",
        "Photo organization",
        "Client file management",
        "Easy search & access"
      ]
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: [
        "Instant messaging",
        "File sharing",
        "Group conversations",
        "Message history"
      ]
    },
    {
      icon: MapPin,
      title: "GPS Tracking",
      description: [
        "Real-time location",
        "Route optimization",
        "Field team tracking",
        "Mileage logging"
      ]
    },
    {
      icon: FileBarChart,
      title: "Custom Reports",
      description: [
        "Revenue reports",
        "Expense analysis",
        "Performance metrics",
        "Export to PDF/Excel"
      ]
    },
    {
      icon: Zap,
      title: "Automation",
      description: [
        "Automated follow-ups",
        "Recurring invoicing",
        "Appointment reminders",
        "Workflow automation"
      ]
    },
    {
      icon: Globe,
      title: "Client Portal",
      description: [
        "24/7 client access",
        "View quotes & invoices",
        "Service history",
        "Self-service booking"
      ]
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to run your business
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All the tools you need, nothing you don't
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex flex-col items-start gap-3 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <ul className="space-y-2 w-full">
                  {feature.description.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
