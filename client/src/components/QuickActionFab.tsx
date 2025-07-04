import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, 
  Users, 
  Package, 
  Globe, 
  Database, 
  FolderPlus, 
  Monitor,
  X,
  Settings,
  Shield
} from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  shortcut?: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Create User",
    icon: <Users className="h-4 w-4" />,
    href: "/accounts",
    color: "bg-blue-500 hover:bg-blue-600",
    shortcut: "Ctrl+U"
  },
  {
    label: "New Package",
    icon: <Package className="h-4 w-4" />,
    href: "/packages",
    color: "bg-green-500 hover:bg-green-600",
    shortcut: "Ctrl+P"
  },
  {
    label: "Add Domain",
    icon: <Globe className="h-4 w-4" />,
    href: "/domains",
    color: "bg-purple-500 hover:bg-purple-600",
    shortcut: "Ctrl+D"
  },
  {
    label: "New Database",
    icon: <Database className="h-4 w-4" />,
    href: "/databases",
    color: "bg-orange-500 hover:bg-orange-600",
    shortcut: "Ctrl+B"
  },
  {
    label: "Upload Files",
    icon: <FolderPlus className="h-4 w-4" />,
    href: "/files",
    color: "bg-pink-500 hover:bg-pink-600",
    shortcut: "Ctrl+F"
  },
  {
    label: "System Monitor",
    icon: <Monitor className="h-4 w-4" />,
    href: "/monitoring",
    color: "bg-indigo-500 hover:bg-indigo-600",
    shortcut: "Ctrl+M"
  }
];

// Additional contextual actions based on current page
const contextualActions: Record<string, QuickAction[]> = {
  '/accounts': [
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ],
  '/packages': [
    {
      label: "Security",
      icon: <Shield className="h-4 w-4" />,
      href: "/security",
      color: "bg-red-500 hover:bg-red-600"
    }
  ]
};

export default function QuickActionFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleOpen = () => setIsOpen(!isOpen);

  // Get contextual actions based on current page
  const getCurrentActions = () => {
    const currentPath = location.split('?')[0]; // Remove query params
    const contextActions = contextualActions[currentPath as keyof typeof contextualActions] || [];
    return [...quickActions, ...contextActions];
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'u':
            e.preventDefault();
            window.location.href = '/accounts';
            break;
          case 'p':
            e.preventDefault();
            window.location.href = '/packages';
            break;
          case 'd':
            e.preventDefault();
            window.location.href = '/domains';
            break;
          case 'b':
            e.preventDefault();
            window.location.href = '/databases';
            break;
          case 'f':
            e.preventDefault();
            window.location.href = '/files';
            break;
          case 'm':
            e.preventDefault();
            window.location.href = '/monitoring';
            break;
          case 'q':
            e.preventDefault();
            setIsOpen(!isOpen);
            break;
        }
      }
      // Close on escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const actions = getCurrentActions();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col gap-3 mb-4 transition-all duration-300 ease-in-out",
        isOpen 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <Tooltip key={action.label} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="sm"
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg transition-all duration-200",
                  "transform hover:scale-110 hover:shadow-xl",
                  action.color,
                  "animate-in slide-in-from-bottom-2 fade-in-0"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => setIsOpen(false)}
              >
                <Link href={action.href}>
                  {action.icon}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700">
              <div className="flex flex-col items-start gap-1">
                <p className="font-medium">{action.label}</p>
                {action.shortcut && (
                  <p className="text-xs text-gray-300">{action.shortcut}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Main FAB */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleOpen}
            size="lg"
            className={cn(
              "w-14 h-14 rounded-full shadow-xl transition-all duration-300",
              "bg-gradient-to-r from-blue-500 to-purple-600",
              "hover:from-blue-600 hover:to-purple-700",
              "transform hover:scale-110 hover:shadow-2xl",
              "border-2 border-white/20",
              isOpen && "rotate-45"
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700">
          <div className="flex flex-col items-start gap-1">
            <p className="font-medium">{isOpen ? "Close menu" : "Quick actions"}</p>
            <p className="text-xs text-gray-300">Ctrl+Q</p>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}