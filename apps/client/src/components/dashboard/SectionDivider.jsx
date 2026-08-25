import React from 'react';

/**
 * SectionDivider renders a letter-spaced monospace eyebrow label flanked by
 * horizontal rules with diamond glyphs (◆) on each side.
 */
export const SectionDivider = ({ label, className = '' }) => {
  return (
    <div className={`relative my-8 flex items-center justify-center ${className}`}>
      {/* Horizontal line left */}
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80" />

      {/* Center eyebrow pill with diamond glyphs */}
      <div className="px-4 py-1 flex items-center gap-2 text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-[0.25em] font-semibold select-none">
        <span className="text-indigo-500/70 text-[9px]">◆</span>
        <span>{label}</span>
        <span className="text-indigo-500/70 text-[9px]">◆</span>
      </div>

      {/* Horizontal line right */}
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80" />
    </div>
  );
};
