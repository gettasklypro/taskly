import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatWidget } from "./ChatWidget";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="h-14 sm:h-12 border-b border-border flex items-center px-3 sm:px-4 bg-background sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="shrink-0" />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};
