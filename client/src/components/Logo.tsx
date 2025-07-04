
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.svg" 
        alt="Baseless" 
        className={`${sizeClasses[size]} ${showText ? 'mr-3' : ''}`} 
      />
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]}`}>
          Baseless
        </span>
      )}
    </div>
  );
}
