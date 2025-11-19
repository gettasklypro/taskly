import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Tag, Settings, Shield, ArrowLeft, Briefcase, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/customers", label: "Customers", icon: Users },
  { path: "/admin/crm", label: "CRM", icon: Briefcase },
  { path: "/admin/promos", label: "Promos", icon: Tag },
  { path: "/admin/users", label: "Manage Users", icon: Shield },
  { path: "/admin/automation", label: "Automation", icon: Bot },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-52 border-r bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <div className="px-3 mb-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            asChild
          >
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <nav className="px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 mb-1 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
