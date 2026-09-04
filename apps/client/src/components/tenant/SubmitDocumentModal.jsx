import React, { useState } from 'react';
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertCircle, ShieldCheck, 
  FileCheck, Paperclip, File, Sparkles, Loader2 
} from 'lucide-react';

export const SubmitDocumentModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  unit,
}) => {
  const [docType, setDocType] = useState('Proof of Insurance');
  const [fileTitle, setFileTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const fileName = fileTitle.trim()
        ? `${fileTitle.replace(/\s+/g, '_')}.pdf`
        : selectedFile?.name || `${docType.replace(/\s+/g, '_')}_${(tenant?.name || 'Sophia_Lin').replace(/\s+/g, '_')}.pdf`;

      onSubmit({
        name: fileName,
        type: docType,
        notes: notes,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
        file: selectedFile,
      });

      setIsSubmitting(false);
      // Reset form
      setDocType('Proof of Insurance');
      setFileTitle('');
      setNotes('');
      setSelectedFile(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0C0F1D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden apple-glass top-shade my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verification Upload</span>
              </div>
              <h2 className="text-xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-0.5">
                Submit Document for Review
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          
          {/* Document Type Dropdown */}
          <div className="space-y-1">
            <label className="block text-slate-700 dark:text-slate-300 font-bold font-grotesk">
              Document Classification <span className="text-rose-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#101426] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
              required
            >
              <option value="Proof of Insurance">Proof of Renter Insurance</option>
              <option value="Government ID">Government ID (Passport / Driver License)</option>
              <option value="Income Verification">Proof of Income / Pay Stub</option>
              <option value="Pet Registration">Pet Vaccination / Registration</option>
              <option value="Lease Agreement">Lease Contract Addendum</option>
              <option value="Other">Other Compliance Document</option>
            </select>
          </div>

          {/* Custom File Title */}
          <div className="space-y-1">
            <label className="block text-slate-700 dark:text-slate-300 font-bold font-grotesk">
              Document Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="e.g. State_Driver_License_Sophia_Lin"
              className="w-full bg-slate-50 dark:bg-[#101426] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div className="space-y-1">
            <label className="block text-slate-700 dark:text-slate-300 font-bold font-grotesk">
              Attach File <span className="text-rose-500">*</span>
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer relative
                ${isDragOver 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#101426]/50 hover:border-indigo-400 dark:hover:border-indigo-500/50'
                }
              `}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <File className="w-5 h-5 shrink-0 text-indigo-500" />
                    <div className="min-w-0">
                      <strong className="text-slate-900 dark:text-white font-grotesk text-xs block truncate">
                        {selectedFile.name}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Selected
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-grotesk font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      Click to browse or drag and drop file here
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Supports PDF, PNG, JPG (Max file size: 10MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes for Landlord */}
          <div className="space-y-1">
            <label className="block text-slate-700 dark:text-slate-300 font-bold font-grotesk">
              Notes for Landlord <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Policy #POL-99120 - Active coverage through Jan 2027"
              className="w-full bg-slate-50 dark:bg-[#101426] border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          {/* Scope notice */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Document will be logged with timestamp and submitted to your property manager's verification queue.</span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-grotesk font-semibold text-xs btn-press"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 btn-press flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Document for Review</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
