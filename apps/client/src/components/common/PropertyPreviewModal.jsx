import React from 'react';
import { X, MapPin, Bed, Bath, Move, ArrowRight } from 'lucide-react';
import { MOCK_UNITS } from '../../data/mockData';

export const PropertyPreviewModal = ({ property, onClose, onOpenLogin }) => {
  if (!property) return null;

  const propertyUnits = MOCK_UNITS.filter((u) => u.propertyId === property.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="glass-panel w-full max-w-3xl rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl relative max-h-[90vh] flex flex-col origin-center">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-[0.92] transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Image */}
        <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden shrink-0">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-md mb-1 inline-block">
                {property.category}
              </span>
              <h3 className="text-2xl font-bold text-white font-heading">{property.name}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {property.address}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block">OCCUPANCY RATE</span>
              <span className="text-lg font-bold text-emerald-400 font-heading">{property.occupancyRate}%</span>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Overview Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-center text-xs">
            <div>
              <div className="text-slate-500 text-[10px]">TOTAL UNITS</div>
              <div className="text-sm font-bold text-white mt-0.5">{property.unitsCount} Units</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">LANDLORD</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">{property.landlordName}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">PWA STATUS</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">VAPID Push Ready</div>
            </div>
          </div>

          {/* Units Inventory Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-white font-heading mb-3 flex items-center justify-between">
              <span>Units & Lease Availability ({propertyUnits.length > 0 ? propertyUnits.length : property.unitsCount})</span>
              <span className="text-xs text-slate-400 font-normal">Real-time status</span>
            </h4>

            {propertyUnits.length > 0 ? (
              <div className="space-y-3">
                {propertyUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 bg-slate-900/60 hover:bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-heading">{unit.label}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          unit.status === 'occupied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {unit.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-slate-500" /> {unit.bedrooms} Bed</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-slate-500" /> {unit.bathrooms} Bath</span>
                        <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 text-slate-500" /> {unit.sqft} sqft</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-white font-heading">${unit.monthlyRent.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span></div>
                        <div className="text-[10px] text-slate-400">{unit.tenantName ? `Tenant: ${unit.tenantName}` : 'Available for Lease'}</div>
                      </div>

                      <button
                        onClick={() => onOpenLogin(unit.status === 'occupied' ? 'tenant' : 'landlord')}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 active:scale-[0.96] transition-transform"
                      >
                        {unit.status === 'occupied' ? 'Tenant PWA' : 'Assign Unit'} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center">
                Detailed unit listings for this property are accessible via the Landlord Web Dashboard.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">RBAC Scoped Access • Express REST API</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl active:scale-[0.96] transition-transform"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
