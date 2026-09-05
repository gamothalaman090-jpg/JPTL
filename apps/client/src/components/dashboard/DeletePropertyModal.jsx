import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Building2, ShieldAlert } from 'lucide-react';

export const DeletePropertyModal = ({
  isOpen,
  onClose,
  property,
  units = [],
  onConfirmDelete,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setIsDeleting(false);
      setErrorMessage('');
    }
  }, [isOpen, property]);

  if (!isOpen || !property) return null;

  // Calculate units under this property
  const propUnits = units.filter((u) => u.propertyId === property.id || u.property === property.id);
  const occupiedUnits = propUnits.filter((u) => u.status === 'occupied');
  const hasOccupiedUnits = occupiedUnits.length > 0;

  const handleDelete = async () => {
    if (hasOccupiedUnits) {
      setErrorMessage(
        `Cannot delete "${property.name}" because it has ${occupiedUnits.length} occupied unit(s). Please reassign or vacate tenants first.`
      );
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await onConfirmDelete(property.id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/30 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-grotesk text-slate-900 dark:text-white">
              Delete Property
            </h2>
            <p className="text-xs text-rose-500/90 font-mono">Irreversible Action</p>
          </div>
        </div>

        {/* Property Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white font-grotesk flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" />
              {property.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {property.category || 'Residential'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{property.address}, {property.city}</p>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Total Units: {propUnits.length}</span>
            <span className={hasOccupiedUnits ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
              {occupiedUnits.length} Occupied &bull; {propUnits.length - occupiedUnits.length} Vacant
            </span>
          </div>
        </div>

        {/* Warning Alert */}
        {hasOccupiedUnits ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3 mb-5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Active Tenants Detected</p>
              <p className="text-[11px] leading-relaxed text-rose-600/80 dark:text-rose-300/80">
                This property has <strong>{occupiedUnits.length} active tenant(s)</strong> assigned to units. You must reassign or end their leases before deleting this property.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-3 mb-5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Are you sure you want to delete this property?</p>
              <p className="text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                All <strong>{propUnits.length} vacant unit(s)</strong>, historical associations, and property configurations will be permanently removed from your portfolio.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-4">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-grotesk transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || hasOccupiedUnits}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold font-grotesk flex items-center gap-2 transition-all shadow-lg ${
              hasOccupiedUnits
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Confirm Delete Property'}
          </button>
        </div>

      </div>
    </div>
  );
};
