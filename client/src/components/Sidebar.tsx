import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logo } from "./Logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-line" },
  { name: "User Accounts", href: "/accounts", icon: "fas fa-users" },
  { name: "Hosting Packages", href: "/packages", icon: "fas fa-box" },
  { name: "Domains & DNS", href: "/domains", icon: "fas fa-globe" },
  { name: "Webmail", href: "/webmail", icon: "fas fa-envelope" },
  { name: "Email Accounts", href: "/email", icon: "fas fa-at" },
  { name: "Databases", href: "/databases", icon: "fas fa-database" },
  { name: "File Manager", href: "/files", icon: "fas fa-folder" },
  { name: "Monitoring", href: "/monitoring", icon: "fas fa-chart-bar" },
  { name: "Backups", href: "/backups", icon: "fas fa-shield-alt" },
  { name: "Security", href: "/security", icon: "fas fa-lock" },
  { name: "Baseless Code", href: "/code-editor", icon: "fas fa-code" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-slate-900 shadow-2xl fixed right-0 top-0 h-full z-30 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          isExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={cn(
          "p-4 border-b border-slate-800 transition-all duration-300",
          isExpanded ? "px-6" : "px-3"
        )}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-server text-white text-lg"></i>
            </div>
            {isExpanded && (
              <div className="ml-3 overflow-hidden">
                <h1 className="text-xl font-bold text-white">Baseless</h1>
                <p className="text-xs text-slate-400">Control Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className={cn(
          "py-4 space-y-1 px-3 transition-all duration-300",
          isExpanded && "px-4"
        )}>
          {navigation.map((item) => {
            const isActive = location === item.href;
            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group relative",
                  isExpanded ? "px-4 py-3" : "p-3 justify-center",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
                onClick={onClose}
              >
                {isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
                )}
                <i className={cn(
                  item.icon, 
                  "text-lg",
                  isExpanded ? "w-5" : "w-auto",
                  isActive && "text-white"
                )}></i>
                {isExpanded && (
                  <span className={cn(
                    "ml-3 font-medium transition-opacity duration-200",
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.name}
                  </span>
                )}
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800 bg-slate-900/95 backdrop-blur transition-all duration-300",
          isExpanded && "p-4"
        )}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            {isExpanded && (
              <>
                <div className="flex-1 ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">admin@baseless.com</p>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <i className="fas fa-cog w-5 h-5"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}