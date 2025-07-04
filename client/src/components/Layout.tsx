import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <TooltipProvider>
        <div className="flex-1 lg:mr-16">
          <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </TooltipProvider>
    </div>
  );
}