import React from 'react';
import { X, Wrench, Phone, MessageSquare, ShieldCheck, Clock, CheckCircle2, MapPin, UserCheck } from 'lucide-react';

export const TechnicianDetailModal = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const tech = {
    name: 'Marcus Sterling',
    title: 'Master HVAC & Plumbing Specialist',
    company: 'JPTL Dispatch Maintenance Group',
    phone: '+1 (800) 555-0199 ext. 42',
    rating: '4.9 ★ (128 reviews)',
    badge: 'Certified & Background Checked',
    eta: 'Today between 2:00 PM – 4:00 PM',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 top-shade modal-enter modal-enter-active apple-glass">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 btn-press"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">Assigned Technician</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Work Order Ref: {ticket.id}</p>
          </div>
        </div>

        {/* Technician Profile Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg font-grotesk shrink-0 border border-indigo-500/30">
              MS
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-grotesk text-slate-900 dark:text-white">{tech.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {tech.rating}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{tech.title}</p>
              <p className="text-[11px] font-mono text-slate-400">{tech.company}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-400 text-[10px] block uppercase">Estimated Arrival</span>
              <strong className="text-amber-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {tech.eta}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-400 text-[10px] block uppercase">Verification Badge</span>
              <strong className="text-emerald-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Background Cleared
              </strong>
            </div>
          </div>
        </div>

        {/* Technician Contact Details Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 space-y-2 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Direct Technician Contact Info
          </span>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Phone Hotline:</span>
            <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">{tech.phone}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Direct Email:</span>
            <span className="text-slate-900 dark:text-white font-semibold">m.sterling@jptldispatch.com</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Badge ID:</span>
            <span className="text-slate-700 dark:text-slate-300">TECH-LIC-#99201</span>
          </div>
        </div>

      </div>
    </div>
  );
};
