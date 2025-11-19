import {
  LayoutDashboard,
  Calendar,
  Users,
  Inbox,
  MessageCircle,
  FileCheck,
  Briefcase,
  Receipt,
  DollarSign,
  Clock,
  Globe,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NavLink } from "react-router-dom";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule", url: "/calendar", icon: Calendar },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Requests", url: "/requests", icon: Inbox },
  { title: "Quotes", url: "/quotes", icon: FileCheck },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Timesheets", url: "/timesheets", icon: Clock },
  { title: "Website", url: "/website-builder", icon: Globe },
  { title: "Inbox", url: "/inbox", icon: MessageCircle },
];

const footerNavigation = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help / Support", url: "/support", icon: HelpCircle },
];

export const Sidebar = () => {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === "collapsed";

  // Close sidebar on mobile when clicking menu items
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarComponent className={collapsed ? "w-16" : "w-64"} style={{ "--sidebar-rail-width": "0px" } as React.CSSProperties}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-2">
          <Logo collapsed={collapsed} textClassName="text-sidebar-foreground" />
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          {footerNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 mt-2"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </SidebarComponent>
  );
};
