import React from 'react';

/**
 * GridFrame renders Efferd-inspired grid lines and crosshair (+) intersection markers.
 */
export const GridFrame = ({ children, className = '' }) => {
  return (
    <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Background Radial Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-x-0 -top-20 z-0 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)] blur-2xl" 
      />

      {/* Left & Right Vertical Boundary Grid Lines (Efferd Style) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-y-0 left-4 sm:left-6 lg:left-8 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800/80 to-transparent" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-y-0 right-4 sm:right-6 lg:right-8 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800/80 to-transparent" 
      />

      {/* Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const GridSeparator = ({ label, action }) => {
  return (
    <div className="relative left-1/2 z-10 my-8 h-px w-screen -translate-x-1/2 bg-slate-200 dark:bg-slate-800/80">
      <div aria-hidden="true" className="max-w-7xl relative mx-auto hidden w-full xl:block">
        {/* Top Left Crosshair (+) */}
        <svg 
          aria-hidden="true" 
          className="pointer-events-none absolute z-20 size-5 shrink-0 stroke-slate-400 dark:stroke-slate-600 top-0 left-8 -translate-x-1/2 -translate-y-1/2 opacity-75" 
          fill="none" 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          viewBox="0 0 24 24" 
          strokeWidth="1"
        >
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>

        {/* Top Right Crosshair (+) */}
        <svg 
          aria-hidden="true" 
          className="pointer-events-none absolute z-20 size-5 shrink-0 stroke-slate-400 dark:stroke-slate-600 top-0 right-8 translate-x-1/2 -translate-y-1/2 opacity-75" 
          fill="none" 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          viewBox="0 0 24 24" 
          strokeWidth="1"
        >
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>
      </div>

      {(label || action) && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 dark:bg-[#070A12] px-4 text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          {label}
          {action}
        </div>
      )}
    </div>
  );
};
