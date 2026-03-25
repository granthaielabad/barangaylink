import { useState } from 'react';
import { FiFileText, FiHome, FiEye, FiClock } from 'react-icons/fi';
import { FaHandsHoldingChild } from 'react-icons/fa6';
import RequestDocumentModal from '../components/ResidentPortal/RequestDocumentModal';
import DocumentPreviewModal from '../components/ResidentPortal/DocumentPreviewModal';
import PaymentModal from '../components/ResidentPortal/PaymentModal';
import { useMyResidentProfile, useMyEid } from '../../../hooks/queries/resident/useResidentPortal';
import {
  useMyDocumentRequests,
  useSubmitDocumentRequest,
} from '../../../hooks/queries/documentRequests/useDocumentRequests';

// ── Document catalogue ────────────────────────────────────────────────────────
// document_type values must match the DB trigger's CASE expression exactly
const AVAILABLE_DOCUMENTS = [
  {
    id:             'clearance',
    title:          'Barangay Clearance',
    document_type:  'Barangay Clearance',
    description:    'Required for employment, business permits, and other legal purposes',
    fee:            100,
    processingTime: '3-5 business days',
    icon:           <FiFileText className="w-8 h-8" />,
    iconBg:         'bg-[#E8F5E9]',
    iconColor:      'text-[#2E7D32]',
  },
  {
    id:             'residency',
    title:          'Certificate of Residency',
    document_type:  'Certificate of Residency',
    description:    'Proves your residency in the barangay',
    fee:            100,
    processingTime: '3-5 business days',
    icon:           <FiHome className="w-8 h-8" />,
    iconBg:         'bg-[#E8F5E9]',
    iconColor:      'text-[#2E7D32]',
  },
  {
    id:             'indigency',
    title:          'Certificate of Indigency',
    document_type:  'Certificate of Indigency',
    description:    'For medical, educational, or financial assistance purposes',
    fee:            'Free',
    processingTime: '3-5 business days',
    icon:           <FaHandsHoldingChild className="w-8 h-8" />,
    iconBg:         'bg-[#E8F5E9]',
    iconColor:      'text-[#2E7D32]',
  },
];

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
  // DB now stores human-readable names directly
  return documentType ?? '—';
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResidentRequestPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewReq,  setPreviewReq]  = useState(null);
  const [paymentReq,  setPaymentReq]  = useState(null);

  const { data: resident }                   = useMyResidentProfile();
  const { data: eid }                        = useMyEid();
  const { data: myRequests = [], isLoading } = useMyDocumentRequests();
  const { mutate: submitRequest, isPending } = useSubmitDocumentRequest();

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmitRequest = (formData) => {
    submitRequest(formData, {
      onSuccess: () => setSelectedDoc(null),
    });
  };

  return (
    <div className="max-w mx-8 space-y-10">

      {/* ── Available Documents ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Document</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            >
              <div className={`w-14 h-14 ${doc.iconBg} ${doc.iconColor} rounded-sm flex items-center justify-center mb-6`}>
                {doc.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-base text-gray-500 mb-8 flex-1 leading-relaxed pr-14">
                {doc.description}
              </p>
              <div className="space-y-2 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {typeof doc.fee === 'number' ? `₱${doc.fee}` : doc.fee}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Processing:</span>
                  <span className="font-semibold text-gray-900">{doc.processingTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── My Requests ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Requests</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
          </div>
        ) : myRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">
            You haven't submitted any document requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => {
              const statusLabel = getStatusLabel(req.status);
              const isViewable  = req.status === 'released' || req.status === 'ready';
              const isPaid      = req.payment_status === 'paid' || req.payment_status === 'free';
              const isUnpaid    = req.payment_status === 'unpaid';
              const paymentLabel = req.payment_status === 'free' ? 'Free' : isPaid ? 'Paid' : 'Pending';

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">

                    {/* Icon & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 text-[#005F02] rounded-sm flex items-center justify-center shrink-0">
                        {getDocIcon(req.document_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getDocTitle(req.document_type)}</h3>
                        <p className="text-base text-gray-500">{req.purpose}</p>
                        <p className="text-[12px] text-gray-500 mt-1">
                          Control No.: <span className="font-medium">{req.control_number ?? '—'}</span>
                          {' • '}
                          Requested: {req.requested_at
                            ? new Date(req.requested_at).toLocaleDateString('en-US')
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-6 shrink-0 md:ml-auto">
                      <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                        <span className={`px-3 py-1 rounded-md text-[12px] font-semibold ${getStatusStyle(req.status)}`}>
                          {statusLabel}
                        </span>
                        <p className="text-[12px] text-gray-500 font-medium">
                          Payment:{' '}
                          <span className={isPaid ? 'text-[#2E7D32]' : 'text-orange-600'}>
                            {paymentLabel}
                          </span>
                          {req.fee_amount > 0 && (
                            <span className="text-gray-400"> (₱{req.fee_amount})</span>
                          )}
                        </p>
                      </div>

                      <div className="min-w-[110px] flex justify-center">
                        {isViewable ? (
                          <button
                            onClick={() => setPreviewReq(req)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#005F02] text-white rounded-lg text-[15px] font-semibold hover:bg-[#004A01] transition-colors whitespace-nowrap"
                          >
                            <FiEye className="w-5 h-5" /> View
                          </button>
                        ) : isUnpaid && req.status !== 'rejected' ? (
                          <button
                            onClick={() => setPaymentReq({
                              ...req,
                              _rawId:  req.id,
                              title:   getDocTitle(req.document_type),
                              fee:     req.fee_amount,
                              txnRef:  req.control_number ?? '—',
                            })}
                            className="px-6 py-2.5 border border-gray-200 rounded-lg text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            Pay Now
                          </button>
                        ) : req.status !== 'rejected' ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-400 px-4 whitespace-nowrap">
                            <FiClock className="w-4 h-4" />
                            <span>In progress</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 font-medium">
                      Control No.: {req.control_number ?? '—'}
                      {req.payment_status !== 'free' && req.or_number && (
                        <> &nbsp;•&nbsp; OR No.: {req.or_number}</>
                      )}
                    </p>
                    {req.status === 'rejected' && (
                      <span className="text-[10px] text-red-500 font-medium">
                        {req.admin_notes ? `Reason: ${req.admin_notes}` : 'Request rejected. Please contact the Barangay Office.'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {selectedDoc && (
        <RequestDocumentModal
          cert={selectedDoc}
          resident={resident}
          eidNumber={eid?.eid_number ?? null}
          onClose={() => setSelectedDoc(null)}
          onSubmit={handleSubmitRequest}
          isPending={isPending}
        />
      )}

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

      {paymentReq && (
        <PaymentModal
          req={paymentReq}
          onClose={() => setPaymentReq(null)}
        />
      )}
    </div>
  );
}