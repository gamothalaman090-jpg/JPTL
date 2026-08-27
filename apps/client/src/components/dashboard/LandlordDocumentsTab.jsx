import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, Download, Plus, Search, Filter, 
  Upload, FileCheck, AlertTriangle, ShieldAlert, Eye, AlertCircle
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { DocumentInspectionModal } from './DocumentInspectionModal';
import { PublishPolicyModal } from './PublishPolicyModal';

export const LandlordDocumentsTab = ({
  documents: documentsProp,
  onUpdateDocumentStatus,
  properties = [],
  units = [],
  tenants = [],
}) => {
  const [docExpirationReminderDays, setDocExpirationReminderDays] = useState('30');
  const [documents, setDocuments] = useState(() => {
    if (documentsProp && documentsProp.length > 0) return documentsProp;
    try {
      const savedDocs = sessionStorage.getItem('jptl_documents');
      if (savedDocs) return JSON.parse(savedDocs);
    } catch (e) {
      console.error(e);
    }
    return MOCK_DOCUMENTS;
  });

  // Keep state synced with prop or sessionStorage updates
  useEffect(() => {
    if (documentsProp) {
      setDocuments(documentsProp);
    }
  }, [documentsProp]);

  // Persist local changes to sessionStorage
  const updateDocumentList = (newDocs) => {
    setDocuments(newDocs);
    try {
      sessionStorage.setItem('jptl_documents', JSON.stringify(newDocs));
    } catch (e) {
      console.error(e);
    }
  };

  const [docStatusFilter, setDocStatusFilter] = useState('all'); // 'all' | 'Pending Review' | 'Verified' | 'Rejected'
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDocForInspection, setSelectedDocForInspection] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Handle Verification
  const handleVerifyDocument = (docId) => {
    const updated = documents.map(d => 
      d.id === docId ? { 
        ...d, 
        status: 'Verified', 
        verifiedAt: new Date().toISOString(), 
        reviewedBy: 'Alexander Vance (Landlord)',
        rejectionReason: undefined 
      } : d
    );
    updateDocumentList(updated);
    if (onUpdateDocumentStatus) onUpdateDocumentStatus(docId, 'Verified');
  };

  // Handle Rejection
  const handleRejectDocument = (docId, reason) => {
    const updated = documents.map(d => 
      d.id === docId ? { 
        ...d, 
        status: 'Rejected', 
        rejectionReason: reason, 
        reviewedBy: 'Alexander Vance (Landlord)',
        reviewedAt: new Date().toISOString()
      } : d
    );
    updateDocumentList(updated);
    if (onUpdateDocumentStatus) onUpdateDocumentStatus(docId, 'Rejected', reason);
  };

  // Handle publishing a new landlord template/rules document from modal
  const handlePublishPolicy = (policyData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      tenantId: policyData.targetScope || 'all',
      tenantName: policyData.targetScope === 'all' ? 'All Residents (Building-wide)' : 'Targeted Residents',
      unitLabel: 'All Units',
      propertyName: 'Property Portfolio',
      name: policyData.fileName || `${policyData.title.replace(/\s+/g, '_')}.pdf`,
      type: policyData.type,
      category: 'rules',
      size: policyData.fileSize || '1.2 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Verified',
      verifiedAt: new Date().toISOString(),
      reviewedBy: 'Alexander Vance (Landlord)',
      fileUrl: '/docs/published-rules.pdf'
    };

    updateDocumentList([newDoc, ...documents]);
    setIsPublishModalOpen(false);
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
            Review resident compliance submissions (Government ID, Renter Insurance, Income Proof) and issue verification decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPublishModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press shrink-0"
        >
          <Plus className="w-4 h-4" /> Publish Building Policy
        </button>
      </div>

      {/* Metric Stats Bar */}
      {(() => {
        const pendingCount = documents.filter(d => d.status === 'Pending Review').length;
        const verifiedCount = documents.filter(d => d.status === 'Verified').length;
        const rejectedCount = documents.filter(d => d.status === 'Rejected').length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Vault Files</span>
              <strong className="text-xl text-slate-900 dark:text-white font-grotesk block">{documents.length}</strong>
              <span className="text-[11px] text-slate-500 font-mono">Resident & Property Files</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass top-shade border border-amber-500/30 bg-amber-500/5 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                  Pending Review
                </span>
                {pendingCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </div>
              <strong className="text-2xl text-amber-600 dark:text-amber-400 font-grotesk block">{pendingCount}</strong>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-mono">Action Required by Landlord</span>
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
                Rejected / Flagged
              </span>
              <strong className="text-2xl text-rose-600 dark:text-rose-400 font-grotesk block">{rejectedCount}</strong>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-400/80 font-mono">Awaiting Resident Re-upload</span>
            </div>
          </div>
        );
      })()}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-[#10131F] border border-slate-300/60 dark:border-slate-800 overflow-x-auto w-full md:w-auto">
          {[
            { key: 'all', label: `All (${documents.length})` },
            { key: 'Pending Review', label: `Pending (${documents.filter(d => d.status === 'Pending Review').length})` },
            { key: 'Verified', label: `Verified (${documents.filter(d => d.status === 'Verified').length})` },
            { key: 'Rejected', label: `Rejected (${documents.filter(d => d.status === 'Rejected').length})` },
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
              placeholder="Search title or resident..."
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
          </select>
        </div>
      </div>

      {/* Master Documents Verification Table */}
      {(() => {
        const filteredDocs = documents.filter(d => {
          const matchesStatus = docStatusFilter === 'all' || d.status === docStatusFilter;
          const matchesCategory = docCategoryFilter === 'all' || d.type === docCategoryFilter;
          const q = docSearchQuery.toLowerCase();
          const matchesSearch = (d.name || '').toLowerCase().includes(q) || (d.tenantName || '').toLowerCase().includes(q) || (d.unitLabel || '').toLowerCase().includes(q);
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
                  Try adjusting your status, search, or document category selections above.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDocs.map((docItem) => (
                  <div 
                    key={docItem.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors font-mono text-xs hover:bg-slate-50/80 dark:hover:bg-slate-900/40 ${
                      docItem.status === 'Pending Review' ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* Doc Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        docItem.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        docItem.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
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
                          Resident: <strong className="text-slate-800 dark:text-slate-200">{docItem.tenantName}</strong> &bull; {docItem.unitLabel} ({docItem.propertyName})
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

                        {docItem.status === 'Rejected' && docItem.rejectionReason && (
                          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 mt-1 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Rejection Feedback: <em>{docItem.rejectionReason}</em></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 justify-end">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                        docItem.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        docItem.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {docItem.status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
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

                      {docItem.status === 'Pending Review' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(docItem.id)}
                          className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 btn-press"
                          title="Quick Verify"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
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

      {/* Render Publish Policy Modal */}
      <PublishPolicyModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublishPolicy}
        properties={properties}
      />

      {/* Render Inspection Modal */}
      {selectedDocForInspection && (
        <DocumentInspectionModal
          document={selectedDocForInspection}
          onClose={() => setSelectedDocForInspection(null)}
          onVerify={handleVerifyDocument}
          onReject={handleRejectDocument}
        />
      )}

    </div>
  );
};
