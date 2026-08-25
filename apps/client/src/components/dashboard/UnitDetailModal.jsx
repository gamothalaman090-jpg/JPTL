import React from 'react';
import { X, Building2, UserPlus, DollarSign, Calendar, Maximize2, Bed, User } from 'lucide-react';

export const UnitDetailModal = ({
  isOpen,
  unit,
  property,
  onClose,
  onAddTenant = () => {},
}) => {
  if (!isOpen || !unit) return null;

  const isVacant = unit.status === 'vacant';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card with Emil's scale(0.95) entry */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 top-shade modal-enter modal-enter-active">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 btn-press focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close unit modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isVacant
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {unit.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-grotesk text-white">{unit.label}</h2>
            <p className="text-xs text-slate-400">{property?.name || unit.propertyName}</p>
          </div>
        </div>

        {/* Unit Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex flex-col items-center justify-center text-center p-2">
            <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-medium">Rent</span>
            <span className="text-sm font-bold text-white">${unit.monthlyRent}/mo</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2 border-x border-slate-800">
            <Bed className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-medium">Beds / Baths</span>
            <span className="text-sm font-bold text-white">{unit.bedrooms} bd / {unit.bathrooms} ba</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Maximize2 className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-medium">Area</span>
            <span className="text-sm font-bold text-white">{unit.sqft} sqft</span>
          </div>
        </div>

        {/* Occupancy / Tenant Section */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Occupancy Status</h3>
          {isVacant ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-400">Unit is Vacant & Ready</p>
                <p className="text-xs text-slate-400">No active lease assigned to this unit.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddTenant(unit.propertyId, unit.id);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-grotesk shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add tenant</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-medium text-xs">
                <User className="w-4 h-4 text-blue-400" />
                <span>Occupant: <strong>{unit.tenantName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Lease term: {unit.leaseStart} &rarr; {unit.leaseEnd}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
