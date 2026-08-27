import React, { useState } from 'react';
import { X, CreditCard, Building, Plus, Trash2, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

const INITIAL_METHODS = [
  {
    id: 'pm-1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    exp: '08/28',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'ach',
    brand: 'Chase Bank',
    last4: '9102',
    isDefault: false,
  },
];

export const PaymentMethodsModal = ({
  isOpen,
  onClose,
}) => {
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newType, setNewType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');

  if (!isOpen) return null;

  const handleSetDefault = (id) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleDelete = (id) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber) return;

    const newMethod = {
      id: `pm-${Date.now()}`,
      type: newType,
      brand: newType === 'card' ? 'Mastercard' : 'Bank ACH',
      last4: cardNumber.slice(-4) || '8812',
      exp: cardExp || '12/29',
      isDefault: methods.length === 0,
    };

    setMethods((prev) => [...prev, newMethod]);
    setIsAddingNew(false);
    setCardNumber('');
    setCardExp('');
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
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">Payment Methods</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage credit cards and bank ACH accounts for rent payments.</p>
          </div>
        </div>

        {!isAddingNew ? (
          <div className="space-y-4">
            {/* List of Methods */}
            <div className="space-y-2">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      {m.type === 'card' ? <CreditCard className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-grotesk">{m.brand} •••• {m.last4}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {m.type === 'card' ? `Expires ${m.exp}` : 'Direct Bank ACH'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.isDefault ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(m.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-indigo-500 underline btn-press"
                      >
                        Set default
                      </button>
                    )}

                    {!m.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 btn-press"
                        title="Remove method"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Trigger */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold font-grotesk btn-press flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Payment Method</span>
            </button>
          </div>
        ) : (
          /* ADD NEW METHOD FORM */
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setNewType('card')}
                className={`p-2.5 rounded-xl border text-xs font-semibold btn-press transition-all flex items-center justify-center gap-2 ${
                  newType === 'card'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setNewType('ach')}
                className={`p-2.5 rounded-xl border text-xs font-semibold btn-press transition-all flex items-center justify-center gap-2 ${
                  newType === 'ach'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank ACH</span>
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {newType === 'card' ? 'Card Number' : 'Bank Account Number'}
              </label>
              <input
                type="text"
                required
                placeholder={newType === 'card' ? '4532 •••• •••• 8812' : '981204882109'}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {newType === 'card' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiration</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CVC Code</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk btn-press shadow-md shadow-indigo-600/20"
              >
                Save Payment Instrument
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
