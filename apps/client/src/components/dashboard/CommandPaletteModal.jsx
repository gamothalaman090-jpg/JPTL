import React, { useState, useEffect } from 'react';
import { Search, X, Building2, Home, Users, Wrench, ArrowRight } from 'lucide-react';

export const CommandPaletteModal = ({
  isOpen,
  onClose,
  properties = [],
  units = [],
  tenants = [],
  tickets = [],
  onSelectResult = () => {},
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Aggregate searchable items
  const propertyItems = properties
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.city.toLowerCase().includes(query.toLowerCase()))
    .map((p) => ({ type: 'property', id: p.id, title: p.name, subtitle: `${p.city} • ${p.unitsCount} Units`, icon: Building2, raw: p }));

  const unitItems = units
    .filter((u) => u.label.toLowerCase().includes(query.toLowerCase()) || u.propertyName.toLowerCase().includes(query.toLowerCase()))
    .map((u) => ({ type: 'unit', id: u.id, title: `${u.label} (${u.propertyName})`, subtitle: `$${u.monthlyRent}/mo • ${u.status}`, icon: Home, raw: u }));

  const tenantItems = tenants
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.email.toLowerCase().includes(query.toLowerCase()))
    .map((t) => ({ type: 'tenant', id: t.id, title: t.name, subtitle: `${t.email} • ${t.unitLabel || 'Unassigned'}`, icon: Users, raw: t }));

  const ticketItems = tickets
    .filter((tk) => tk.title.toLowerCase().includes(query.toLowerCase()) || tk.id.toLowerCase().includes(query.toLowerCase()))
    .map((tk) => ({ type: 'ticket', id: tk.id, title: `${tk.id}: ${tk.title}`, subtitle: `${tk.propertyName} (${tk.unitLabel}) • ${tk.status}`, icon: Wrench, raw: tk }));

  const allResults = [...propertyItems, ...unitItems, ...tenantItems, ...ticketItems].slice(0, 10);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          onSelectResult(allResults[selectedIndex]);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onSelectResult, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden top-shade modal-enter modal-enter-active">
        
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-indigo-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search properties, units, tenants, or tickets..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white btn-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {allResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No results found for "{query}".
            </div>
          ) : (
            allResults.map((item, index) => {
              const IconComp = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-grotesk flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 uppercase">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-500 opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#080B14] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-600 dark:text-slate-300">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-600 dark:text-slate-300">↵</strong> Select</span>
            <span><strong className="text-slate-600 dark:text-slate-300">ESC</strong> Close</span>
          </div>
          <span>JPTL Command Palette</span>
        </div>

      </div>
    </div>
  );
};
