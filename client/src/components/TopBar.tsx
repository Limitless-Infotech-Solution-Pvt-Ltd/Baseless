import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getPageTitle = () => {
    const path = window.location.pathname;
    switch (path) {
      case "/":
        return "Server Dashboard";
      case "/accounts":
        return "User Accounts";
      case "/packages":
        return "Hosting Packages";
      case "/domains":
        return "Domain Management";
      case "/email":
        return "Email Management";
      case "/databases":
        return "Database Management";
      case "/files":
        return "File Manager";
      case "/monitoring":
        return "Resource Monitoring";
      case "/backups":
        return "Backup Management";
      case "/security":
        return "Security Center";
      default:
        return "Baseless Control Panel";
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <i className="fas fa-bars w-5 h-5"></i>
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">
            {getPageTitle()}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          </div>
          <Button variant="ghost" size="sm" className="relative">
            <i className="fas fa-bell w-5 h-5"></i>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </div>
  );
}
