import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-line" },
  { name: "User Accounts", href: "/accounts", icon: "fas fa-users" },
  { name: "Hosting Packages", href: "/packages", icon: "fas fa-box" },
  { name: "Domain Management", href: "/domains", icon: "fas fa-globe" },
  { name: "Email Management", href: "/email", icon: "fas fa-envelope" },
  { name: "Databases", href: "/databases", icon: "fas fa-database" },
  { name: "File Manager", href: "/files", icon: "fas fa-folder" },
  { name: "Monitoring", href: "/monitoring", icon: "fas fa-chart-bar" },
  { name: "Backups", href: "/backups", icon: "fas fa-shield-alt" },
  { name: "Security", href: "/security", icon: "fas fa-lock" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-white shadow-sm border-r border-slate-200 fixed left-0 top-0 h-full z-30 lg:relative lg:z-0 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-server text-white text-sm"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Baseless</h1>
              <p className="text-xs text-slate-500">Server Management</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                location === item.href
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              )}
              onClick={onClose}
            >
              <i className={cn(item.icon, "w-5 h-5")}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-slate-600 text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">admin@baseless.com</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-cog w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
