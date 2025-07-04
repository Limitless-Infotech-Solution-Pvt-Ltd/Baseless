import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  showArrow?: boolean;
  animation?: "scale" | "slide" | "fade" | "bounce";
}

export function AnimatedTooltip({
  content,
  children,
  side = "top",
  delay = 200,
  className = "",
  showArrow = true,
  animation = "scale"
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

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
        y = triggerRect.top - tooltipRect.height - 12 + scrollY;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.bottom + 12 + scrollY;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 12 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
      case "right":
        x = triggerRect.right + 12 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
    }

    // Ensure tooltip stays within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setPosition({ x, y });
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Update position after visibility change
      setTimeout(updatePosition, 0);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
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
    };
  }, []);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    
    if (!isVisible) {
      switch (animation) {
        case "scale":
          return `${baseClasses} opacity-0 scale-95 pointer-events-none`;
        case "slide":
          const slideClass = side === "top" ? "translate-y-2" : 
                            side === "bottom" ? "-translate-y-2" :
                            side === "left" ? "translate-x-2" : "-translate-x-2";
          return `${baseClasses} opacity-0 ${slideClass} pointer-events-none`;
        case "fade":
          return `${baseClasses} opacity-0 pointer-events-none`;
        case "bounce":
          return `${baseClasses} opacity-0 scale-95 pointer-events-none`;
        default:
          return `${baseClasses} opacity-0 scale-95 pointer-events-none`;
      }
    }

    switch (animation) {
      case "scale":
        return `${baseClasses} opacity-100 scale-100`;
      case "slide":
        return `${baseClasses} opacity-100 translate-x-0 translate-y-0`;
      case "fade":
        return `${baseClasses} opacity-100`;
      case "bounce":
        return `${baseClasses} opacity-100 scale-100 animate-bounce-in`;
      default:
        return `${baseClasses} opacity-100 scale-100`;
    }
  };

  const getArrowClasses = () => {
    const arrowSize = "w-3 h-3";
    const arrowColor = "bg-slate-800 dark:bg-slate-700";
    
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

      {/* Portal-like tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[9999] px-3 py-2 text-sm text-white rounded-lg shadow-xl",
          "bg-slate-800 dark:bg-slate-700 border border-slate-600/50",
          "backdrop-blur-sm",
          getAnimationClasses(),
          className
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {content}
        {showArrow && <div className={getArrowClasses()} />}
      </div>
    </>
  );
}

// Additional bounce animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-in {
    0% { transform: scale(0.95); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .animate-bounce-in {
    animation: bounce-in 0.3s ease-out;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}