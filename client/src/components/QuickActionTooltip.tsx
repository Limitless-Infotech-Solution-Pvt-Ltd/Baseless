import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Keyboard } from "lucide-react";

interface QuickActionTooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  showProgress?: boolean;
  animation?: "glow" | "slide" | "bounce" | "pulse";
}

export function QuickActionTooltip({
  content,
  shortcut,
  children,
  side = "left",
  delay = 150,
  showProgress = true,
  animation = "glow"
}: QuickActionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<NodeJS.Timeout>();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (side) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.top - tooltipRect.height - 16 + scrollY;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.bottom + 16 + scrollY;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 16 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
      case "right":
        x = triggerRect.right + 16 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
    }

    // Ensure tooltip stays within viewport
    const padding = 12;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setPosition({ x, y });
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (progressRef.current) {
      clearTimeout(progressRef.current);
    }

    // Start progress animation
    if (showProgress) {
      setProgress(0);
      progressRef.current = setTimeout(() => {
        setProgress(100);
      }, delay);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(updatePosition, 0);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (progressRef.current) {
      clearTimeout(progressRef.current);
    }
    setIsVisible(false);
    setProgress(0);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible, side]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressRef.current) {
        clearTimeout(progressRef.current);
      }
    };
  }, []);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    
    if (!isVisible) {
      switch (animation) {
        case "glow":
          return `${baseClasses} opacity-0 scale-95 blur-sm pointer-events-none`;
        case "slide":
          const slideClass = side === "top" ? "translate-y-2" : 
                            side === "bottom" ? "-translate-y-2" :
                            side === "left" ? "translate-x-2" : "-translate-x-2";
          return `${baseClasses} opacity-0 ${slideClass} pointer-events-none`;
        case "bounce":
          return `${baseClasses} opacity-0 scale-90 pointer-events-none`;
        case "pulse":
          return `${baseClasses} opacity-0 scale-95 pointer-events-none`;
        default:
          return `${baseClasses} opacity-0 scale-95 pointer-events-none`;
      }
    }

    switch (animation) {
      case "glow":
        return `${baseClasses} opacity-100 scale-100 blur-0 animate-glow-pulse`;
      case "slide":
        return `${baseClasses} opacity-100 translate-x-0 translate-y-0`;
      case "bounce":
        return `${baseClasses} opacity-100 scale-100 animate-tooltip-bounce`;
      case "pulse":
        return `${baseClasses} opacity-100 scale-100 animate-pulse`;
      default:
        return `${baseClasses} opacity-100 scale-100`;
    }
  };

  const getArrowClasses = () => {
    const arrowSize = "w-3 h-3";
    const arrowColor = "bg-gradient-to-br from-slate-800 to-slate-900";
    
    switch (side) {
      case "top":
        return `${arrowSize} ${arrowColor} rotate-45 absolute -bottom-1.5 left-1/2 transform -translate-x-1/2`;
      case "bottom":
        return `${arrowSize} ${arrowColor} rotate-45 absolute -top-1.5 left-1/2 transform -translate-x-1/2`;
      case "left":
        return `${arrowSize} ${arrowColor} rotate-45 absolute -right-1.5 top-1/2 transform -translate-y-1/2`;
      case "right":
        return `${arrowSize} ${arrowColor} rotate-45 absolute -left-1.5 top-1/2 transform -translate-y-1/2`;
      default:
        return `${arrowSize} ${arrowColor} rotate-45`;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {/* Animated tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[9999] px-4 py-3 text-sm rounded-xl shadow-2xl",
          "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900",
          "border border-slate-600/30 backdrop-blur-md",
          "max-w-xs",
          getAnimationClasses()
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Progress bar */}
        {showProgress && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-700 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium leading-tight">
              {content}
            </div>
            
            {/* Shortcut */}
            {shortcut && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-300">
                <Keyboard className="h-3 w-3" />
                <span className="px-1.5 py-0.5 bg-slate-700/50 rounded font-mono text-xs border border-slate-600/30">
                  {shortcut}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className={getArrowClasses()} />

        {/* Glow effect */}
        {animation === "glow" && isVisible && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-xl animate-pulse pointer-events-none" />
        )}
      </div>
    </>
  );
}

// Add custom CSS animations
const tooltipStyles = document.createElement('style');
tooltipStyles.textContent = `
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(168, 85, 247, 0.1); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.2); }
  }
  
  @keyframes tooltip-bounce {
    0% { transform: scale(0.9) translateY(10px); }
    50% { transform: scale(1.05) translateY(-5px); }
    100% { transform: scale(1) translateY(0); }
  }
  
  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }
  
  .animate-tooltip-bounce {
    animation: tooltip-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`;

if (typeof document !== 'undefined' && !document.head.querySelector('#tooltip-styles')) {
  tooltipStyles.id = 'tooltip-styles';
  document.head.appendChild(tooltipStyles);
}