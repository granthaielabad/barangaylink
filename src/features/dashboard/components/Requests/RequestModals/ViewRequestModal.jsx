import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiFileText } from 'react-icons/fi';
import RequestDetails from './RequestDetails';
import { PendingFooter, ProcessingFooter, CompletedFooter } from './RequestActionFooters';

export default function ViewRequestModal({ isOpen, request, onClose, onAction }) {
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes ?? '');
  const modalRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!isOpen || !request) return null;

  const status = request.status?.toLowerCase();

  const handleAction = (type) => {
    onAction?.(request.id, type, adminNotes);
    onClose();
  };

  const renderFooter = () => {
    if (status === 'pending') {
      return (
        <PendingFooter
          onReject={() => handleAction('reject')}
          onProcess={() => handleAction('process')}
          onApprove={() => handleAction('approve')}
        />
      );
    }
    if (status === 'processing') {
      return (
        <ProcessingFooter
          onReject={() => handleAction('reject')}
          onApprove={() => handleAction('approve')}
        />
      );
    }
    return <CompletedFooter onClose={onClose} />;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F1F7F2] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiFileText className="w-6 h-6 text-[#005F02]" />
            <h2 className="text-xl font-bold text-gray-900">{request.type}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <RequestDetails
          request={request}
          adminNotes={adminNotes}
          onAdminNotesChange={setAdminNotes}
        />

        {/* Footer */}
        {renderFooter()}
      </div>
    </div>,
    document.body
  );
}
