import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getPageTitle = () => {
    const path = window.location.pathname;
    switch (path) {
      case "/":
        return { title: "Server Dashboard", icon: "fas fa-chart-line" };
      case "/accounts":
        return { title: "User Accounts", icon: "fas fa-users" };
      case "/packages":
        return { title: "Hosting Packages", icon: "fas fa-box" };
      case "/domains":
        return { title: "Domain Management", icon: "fas fa-globe" };
      case "/email":
        return { title: "Email Management", icon: "fas fa-envelope" };
      case "/databases":
        return { title: "Database Management", icon: "fas fa-database" };
      case "/files":
        return { title: "File Manager", icon: "fas fa-folder" };
      case "/monitoring":
        return { title: "Resource Monitoring", icon: "fas fa-chart-bar" };
      case "/backups":
        return { title: "Backup Management", icon: "fas fa-shield-alt" };
      case "/security":
        return { title: "Security Center", icon: "fas fa-lock" };
      default:
        return { title: "Baseless Control Panel", icon: "fas fa-server" };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 lg:px-8 py-5 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-slate-100 rounded-xl"
            onClick={onMenuToggle}
          >
            <i className="fas fa-bars w-5 h-5"></i>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <i className={`${pageInfo.icon} text-white text-lg`}></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {pageInfo.title}
              </h2>
              <p className="text-xs text-slate-500">Manage your server resources efficiently</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative hidden lg:block">
            <Input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-12 pr-4 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors"
            />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">⌘K</kbd>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-slate-100 rounded-xl"
            >
              <i className="fas fa-bell w-5 h-5 text-slate-600"></i>
              <span className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </span>
            </Button>

            <Badge variant="secondary" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200/50">
              <i className="fas fa-circle text-green-500 text-xs mr-2"></i>
              System Healthy
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}