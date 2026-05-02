import { useState } from 'react';
import { FiFileText, FiHome, FiEye, FiExternalLink, FiInfo } from 'react-icons/fi';
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
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 pb-6">
      
      {/* ── External System Notice ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-[#8C0B1A]/20 p-5 sm:p-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#8C0B1A]/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <FiFileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#8C0B1A]" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 px-2">Need a Barangay Document?</h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mt-2 mb-5 sm:mb-6 px-1 leading-relaxed">
          Document requests are now handled through our dedicated Barangay Document Portal.
          Use the button below to start your application.
        </p>
        <a 
          href="https://barangayease.web.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-[#8C0B1A] text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:bg-[#7A0915] transition-all sm:hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Go to Document Portal
          <FiExternalLink className="w-4 h-4 shrink-0" />
        </a>
      </div>

      {/* ── My Requests Tracking ────────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 shrink-0">My Requests History</h2>
          <div className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-400 bg-gray-50 px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full border border-gray-100 max-w-full sm:max-w-md">
            <FiInfo className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="text-left leading-snug">
              Updates sync automatically from the Document Portal
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#8C0B1A] border-t-transparent rounded-full" />
          </div>
        ) : myRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center text-gray-400 text-sm italic">
            No historical requests found in this registry.
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => {
              const statusLabel = getStatusLabel(req.status);
              const isViewable  = req.status === 'released' || req.status === 'ready';

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#8C0B1A]/30 transition-colors">
                  <div className="p-4 sm:p-5 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-100 text-[#8C0B1A] rounded-sm flex items-center justify-center shrink-0">
                        {getDocIcon(req.document_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base leading-snug">{getDocTitle(req.document_type)}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-none sm:truncate sm:max-w-xl break-words">
                          {req.purpose}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 uppercase tracking-tight font-mono">
                          {req.control_number ?? String(req.id).slice(0,8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:flex-nowrap md:ml-auto md:shrink-0 pt-1 border-t border-gray-50 md:border-0 md:pt-0">
                      <div className="flex flex-col gap-1 min-w-0 md:items-end md:min-w-[120px]">
                        <span className={`inline-flex w-fit px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="flex justify-start sm:justify-end md:justify-center md:min-w-[100px] flex-1 md:flex-initial">
                        {isViewable ? (
                          <button
                            type="button"
                            onClick={() => setPreviewReq(req)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-[#8C0B1A] text-[#8C0B1A] rounded-lg text-sm font-bold hover:bg-[#8C0B1A]/5 transition-colors w-full sm:w-auto justify-center"
                          >
                            <FiEye className="w-4 h-4" /> View
                          </button>
                        ) : (
                          <div className="text-[10px] sm:text-[11px] text-gray-300 font-semibold uppercase tracking-widest px-1 py-2 text-center md:px-4 w-full sm:w-auto">
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
