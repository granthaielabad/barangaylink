import { useState } from 'react';
import { FiFileText, FiHome, FiEye, FiClock, FiExternalLink, FiInfo } from 'react-icons/fi';
import { FaHandsHoldingChild } from 'react-icons/fa6';
import DocumentPreviewModal from '../components/ResidentPortal/DocumentPreviewModal';
import { useMyResidentProfile } from '../../../hooks/queries/resident/useResidentPortal';
import { useMyDocumentRequests } from '../../../hooks/queries/documentRequests/useDocumentRequests';

// ── Status helpers ────────────────────────────────────────────────────────────
function getStatusLabel(status) {
  const map = {
    pending:    'Pending',
    processing: 'Processing',
    ready:      'Ready for Pickup',
    released:   'Approved',
    rejected:   'Rejected',
  };
  return map[status] ?? status;
}

function getStatusStyle(status) {
  const map = {
    pending:    'bg-orange-50 text-orange-700',
    processing: 'bg-blue-50 text-blue-700',
    ready:      'bg-purple-50 text-purple-700',
    released:   'bg-[#E8F5E9] text-[#2E7D32]',
    rejected:   'bg-red-50 text-red-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

function getDocIcon(documentType) {
  if (documentType?.includes('Residency')) return <FiHome className="w-5 h-5" />;
  if (documentType?.includes('Indigency')) return <FaHandsHoldingChild className="w-5 h-5" />;
  return <FiFileText className="w-5 h-5" />;
}

function getDocTitle(documentType) {
  return documentType ?? '—';
}

export default function ResidentRequestPage() {
  const [previewReq, setPreviewReq] = useState(null);
  const { data: resident } = useMyResidentProfile();
  const { data: myRequests = [], isLoading } = useMyDocumentRequests();

  return (
    <div className="max-w mx-8 space-y-8">
      
      {/* ── External System Notice ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-[#8C0B1A]/20 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-[#8C0B1A]/10 rounded-full flex items-center justify-center mb-4">
          <FiFileText className="w-8 h-8 text-[#8C0B1A]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Need a Barangay Document?</h2>
        <p className="text-gray-500 max-w-md mt-2 mb-6">
          Document requests are now handled through our dedicated **Barangay Document Portal**. 
          Click the button below to start your application.
        </p>
        <a 
          href="https://barangayease.web.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-8 py-3 bg-[#8C0B1A] text-white font-bold rounded-xl shadow-lg hover:bg-[#7A0915] transition-all transform hover:-translate-y-0.5 active:scale-95"
        >
          Go to Document Portal
          <FiExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* ── My Requests Tracking ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">My Requests History</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <FiInfo className="w-3 h-3" />
            <span>Updates sync automatically from the Document Portal</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#8C0B1A] border-t-transparent rounded-full" />
          </div>
        ) : myRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm italic">
            No historical requests found in this registry.
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => {
              const statusLabel = getStatusLabel(req.status);
              const isViewable  = req.status === 'released' || req.status === 'ready';

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#8C0B1A]/30 transition-colors">
                  <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 text-[#8C0B1A] rounded-sm flex items-center justify-center shrink-0">
                        {getDocIcon(req.document_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getDocTitle(req.document_type)}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-[200px] lg:max-w-md">{req.purpose}</p>
                        <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tight font-mono">
                          {req.control_number ?? String(req.id).slice(0,8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 md:ml-auto">
                      <div className="flex flex-col items-end gap-1 min-w-[120px]">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="min-w-[100px] flex justify-center">
                        {isViewable ? (
                          <button
                            onClick={() => setPreviewReq(req)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-[#8C0B1A] text-[#8C0B1A] rounded-lg text-sm font-bold hover:bg-[#8C0B1A]/5 transition-colors"
                          >
                            <FiEye className="w-4 h-4" /> View
                          </button>
                        ) : (
                          <div className="text-[11px] text-gray-300 font-semibold uppercase tracking-widest px-4">
                            {req.status === 'rejected' ? 'Rejected' : 'In Transit'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {previewReq && (
        <DocumentPreviewModal
          req={{
            ...previewReq,
            title: getDocTitle(previewReq.document_type),
            icon:  getDocIcon(previewReq.document_type),
          }}
          resident={previewReq.residents ?? resident}
          onClose={() => setPreviewReq(null)}
        />
      )}
    </div>
  );
}
