import React, { useState } from 'react';
import { X, CreditCard, DollarSign, CheckCircle2, ShieldCheck, Lock, Building, ArrowRight } from 'lucide-react';

export const PayRentModal = ({
  isOpen,
  onClose,
  tenant,
  unit,
  onPaymentSuccess = () => {},
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'ach' | 'apple_pay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isOpen) return null;

  const rentAmount = unit?.monthlyRent || tenant?.monthlyRent || 2400;
  const processingFee = paymentMethod === 'card' ? 45.00 : 0.00;
  const totalAmount = rentAmount + processingFee;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const receipt = {
        transactionId: `TXN_${Math.floor(10000000 + Math.random() * 90000000)}`,
        amount: totalAmount,
        paidAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        method: paymentMethod === 'card' ? 'Visa ending in 4242' : 'Chase Bank ACH ending in 9102',
        period: 'September 2026 Rent',
      };
      setReceiptData(receipt);
      onPaymentSuccess(receipt);
    }, 1200);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={isProcessing ? undefined : handleFinish}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 top-shade modal-enter modal-enter-active apple-glass">
        
        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 btn-press"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isSuccess && receiptData ? (
          /* SUCCESS STATE */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-grotesk text-slate-900 dark:text-white">Payment Confirmed!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your rent transaction has cleared and a digital receipt was issued.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-xs font-mono text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-bold text-indigo-500">{receiptData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="text-slate-900 dark:text-white">{receiptData.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${receiptData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-slate-700 dark:text-slate-300">{receiptData.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-400">{receiptData.paidAt}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk btn-press shadow-lg shadow-indigo-600/20 text-xs"
            >
              Done & Return to Portal
            </button>
          </div>
        ) : (
          /* PAYMENT FORM */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">Pay Monthly Rent</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{unit?.label || 'Unit 14B'} &bull; {tenant?.propertyName || 'Aura Sky Towers'}</p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 btn-press transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ach')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 btn-press transition-all ${
                  paymentMethod === 'ach'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank ACH (0% Fee)</span>
              </button>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 space-y-2 text-xs mb-5 font-mono">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Base Rent (September)</span>
                <span className="font-semibold text-slate-900 dark:text-white">${rentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Payment Processing Fee</span>
                <span className="text-slate-900 dark:text-white">${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-emerald-600 dark:text-emerald-400">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Mock Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="•••• •••• •••• 4242"
                    readOnly
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expires</label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      readOnly
                      className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CVC / Security</label>
                    <input
                      type="text"
                      defaultValue="•••"
                      readOnly
                      className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Guarantee Pill */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-5">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>256-bit encrypted bank checkout via Stripe Webhooks.</span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-grotesk btn-press shadow-lg shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Secure Transaction…</span>
              ) : (
                <>
                  <span>Confirm & Pay ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
