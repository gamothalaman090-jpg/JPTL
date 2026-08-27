import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, Download, Plus, Search, Filter, 
  Upload, FileCheck, AlertTriangle, ShieldAlert, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { DocumentInspectionModal } from '../dashboard/DocumentInspectionModal';
import { SubmitDocumentModal } from './SubmitDocumentModal';

export const TenantDocumentsTab = ({
  tenant,
  unit,
}) => {
  const [documents, setDocuments] = useState(() => {
    try {
      const savedDocs = sessionStorage.getItem('jptl_documents');
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_DOCUMENTS;
  });

  // Sync state if sessionStorage updates
  const reloadDocsFromStorage = () => {
    try {
      const savedDocs = sessionStorage.getItem('jptl_documents');
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    window.addEventListener('storage', reloadDocsFromStorage);
    return () => window.removeEventListener('storage', reloadDocsFromStorage);
  }, []);

  const updateDocumentList = (newDocs) => {
    setDocuments(newDocs);
    try {
      sessionStorage.setItem('jptl_documents', JSON.stringify(newDocs));
    } catch (e) {
      console.error(e);
    }
  };

  const currentTenantName = tenant?.name || 'Sophia Lin';
  const currentTenantId = tenant?.id || 'usr-tenant-1';

  // Filter documents to ONLY show submitted documents by this tenant or building-wide published rules
  const tenantDocs = documents.filter(d => 
    d.tenantId === currentTenantId || 
    d.tenantName === currentTenantName ||
    d.tenantId === 'all'
  );

  const [docExpirationReminderDays, setDocExpirationReminderDays] = useState('30');
  const [docStatusFilter, setDocStatusFilter] = useState('all'); // 'all' | 'Pending Review' | 'Verified' | 'Rejected'
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDocForInspection, setSelectedDocForInspection] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Handle Tenant File Submission from Modal
  const handleDocModalSubmit = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      tenantId: currentTenantId,
      tenantName: currentTenantName,
      unitLabel: unit?.label || 'Unit 14B',
      propertyName: unit?.propertyName || 'Aura Sky Towers & Residences',
      name: docData.name,
      type: docData.type,
      category: 'upload',
      size: docData.fileSize || '1.4 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending Review',
      fileUrl: `/docs/${docData.name}`
    };

    const updatedList = [newDoc, ...documents];
    updateDocumentList(updatedList);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Resident Compliance Vault</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">
            Documents & Verification Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Submit required lease compliance files (Government ID, Renter Insurance, Income Proof) and view your landlord's verification decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press shrink-0"
        >
          <Plus className="w-4 h-4" /> Submit Document for Review
        </button>
      </div>

      {/* Metric Stats Bar (Matching Landlord layout) */}
      {(() => {
        const pendingCount = tenantDocs.filter(d => d.status === 'Pending Review').length;
        const verifiedCount = tenantDocs.filter(d => d.status === 'Verified' || d.status === 'Active').length;
        const rejectedCount = tenantDocs.filter(d => d.status === 'Rejected').length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">My Total Documents</span>
              <strong className="text-xl text-slate-900 dark:text-white font-grotesk block">{tenantDocs.length}</strong>
              <span className="text-[11px] text-slate-500 font-mono">Personal & Building Files</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass top-shade border border-amber-500/30 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                Pending Review
              </span>
              <strong className="text-2xl text-amber-600 dark:text-amber-400 font-grotesk block">{pendingCount}</strong>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-mono">Submitted for Landlord Verification</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass top-shade border border-emerald-500/20 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                Verified Compliant
              </span>
              <strong className="text-2xl text-emerald-600 dark:text-emerald-400 font-grotesk block">{verifiedCount}</strong>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">Approved Active Files</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass top-shade border border-rose-500/20 bg-rose-500/5 space-y-1">
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">
                Rejected / Needs Action
              </span>
              <strong className="text-2xl text-rose-600 dark:text-rose-400 font-grotesk block">{rejectedCount}</strong>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-400/80 font-mono">Action Required from You</span>
            </div>
          </div>
        );
      })()}

      {/* Filters & Search Toolbar (Matching Landlord layout) */}
      <div className="p-4 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-[#10131F] border border-slate-300/60 dark:border-slate-800 overflow-x-auto w-full md:w-auto">
          {[
            { key: 'all', label: `All (${tenantDocs.length})` },
            { key: 'Pending Review', label: `Pending (${tenantDocs.filter(d => d.status === 'Pending Review').length})` },
            { key: 'Verified', label: `Verified (${tenantDocs.filter(d => d.status === 'Verified' || d.status === 'Active').length})` },
            { key: 'Rejected', label: `Rejected (${tenantDocs.filter(d => d.status === 'Rejected').length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setDocStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl font-grotesk font-semibold transition-all whitespace-nowrap btn-press ${
                docStatusFilter === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category & Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="Search file title..."
              className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <select
            value={docCategoryFilter}
            onChange={(e) => setDocCategoryFilter(e.target.value)}
            className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white text-xs font-mono"
          >
            <option value="all">All Document Types</option>
            <option value="Proof of Insurance">Renter Insurance</option>
            <option value="Government ID">Government ID</option>
            <option value="Income Verification">Income Proof</option>
            <option value="Pet Registration">Pet Registration</option>
            <option value="Lease Agreement">Lease Contract</option>
            <option value="House Rules">Building House Rules</option>
          </select>
        </div>
      </div>

      {/* Master Tenant Documents Table */}
      {(() => {
        const filteredDocs = tenantDocs.filter(d => {
          const matchesStatus = docStatusFilter === 'all' || 
            d.status === docStatusFilter || 
            (docStatusFilter === 'Verified' && d.status === 'Active');
          const matchesCategory = docCategoryFilter === 'all' || d.type === docCategoryFilter;
          const q = docSearchQuery.toLowerCase();
          const matchesSearch = (d.name || '').toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q);
          return matchesStatus && matchesCategory && matchesSearch;
        });

        return (
          <div className="border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden apple-glass top-shade shadow-xl">
            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
                <p className="font-grotesk font-bold text-slate-700 dark:text-slate-300 text-base">
                  No documents found matching filters
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Try adjusting your search or category selection above, or submit a new document.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDocs.map((docItem) => (
                  <div 
                    key={docItem.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors font-mono text-xs hover:bg-slate-50/80 dark:hover:bg-slate-900/40 ${
                      docItem.status === 'Rejected' ? 'bg-rose-500/[0.03]' : ''
                    }`}
                  >
                    {/* Doc Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        docItem.status === 'Verified' || docItem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        docItem.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="font-grotesk font-bold text-sm text-slate-900 dark:text-white truncate">
                            {docItem.name}
                          </strong>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                            {docItem.type}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Scope: <strong className="text-slate-800 dark:text-slate-200">
                            {docItem.tenantId === 'all' ? 'Building-wide Policy' : `${docItem.tenantName} (${docItem.unitLabel})`}
                          </strong>
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>Submitted: {docItem.date}</span>
                          <span>&bull;</span>
                          <span>Size: {docItem.size}</span>
                          {docItem.reviewedBy && (
                            <>
                              <span>&bull;</span>
                              <span>Reviewer: {docItem.reviewedBy}</span>
                            </>
                          )}
                        </div>

                        {/* Rejection feedback banner if flagged by landlord */}
                        {docItem.status === 'Rejected' && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                            <div className="text-[11px] space-y-0.5">
                              <strong className="font-grotesk font-bold block text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Verification Declined by Landlord
                              </strong>
                              <p>Reason: <em>{docItem.rejectionReason || 'Document did not meet requirement specs.'}</em></p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsSubmitModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-grotesk font-bold text-[11px] shrink-0 btn-press flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Upload Corrected File
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 justify-end">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                        docItem.status === 'Verified' || docItem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        docItem.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {(docItem.status === 'Verified' || docItem.status === 'Active') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {docItem.status === 'Rejected' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        {docItem.status === 'Pending Review' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{docItem.status}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedDocForInspection(docItem)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-md shadow-indigo-600/20 btn-press flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>

                      <button
                        type="button"
                        onClick={() => alert(`Downloading official PDF for ${docItem.name}...`)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Expiration Policy Lead Time Card */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-500" /> Automated Compliance Expiration Reminders
        </h3>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <strong className="text-slate-900 dark:text-white block font-grotesk text-sm">Expiration Reminder Notice Lead Time</strong>
            <span className="text-slate-500 text-[11px]">Automatically notify residents before their renter insurance policies or occupancy permits expire.</span>
          </div>
          <select
            value={docExpirationReminderDays}
            onChange={(e) => setDocExpirationReminderDays(e.target.value)}
            className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white text-xs font-mono shrink-0"
          >
            <option value="15">15 Days Before Expiry</option>
            <option value="30">30 Days Before Expiry</option>
            <option value="60">60 Days Before Expiry</option>
          </select>
        </div>
      </div>

      {/* Render Submit Document Modal */}
      <SubmitDocumentModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleDocModalSubmit}
        tenant={tenant}
        unit={unit}
      />

      {/* Render Inspection Modal (Reusing landlord inspection canvas view, read-only for tenant) */}
      {selectedDocForInspection && (
        <DocumentInspectionModal
          document={selectedDocForInspection}
          onClose={() => setSelectedDocForInspection(null)}
          onVerify={null} // Read-only for tenant
          onReject={null} // Read-only for tenant
        />
      )}

    </div>
  );
};
