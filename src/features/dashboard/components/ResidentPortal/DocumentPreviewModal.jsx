import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiDownload } from 'react-icons/fi';
import BarangayClearanceTemplate from './BarangayClearanceTemplate';

export default function DocumentPreviewModal({ req, resident, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = () => {
    console.log('Downloading PDF for request:', req.id);
    // TODO: Implement actual PDF download logic FR FR
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-[#F9FAFB] w-full max-w-4xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center bg-[#F1FBF1] justify-between px-6 py-4 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#005F02]">
              {req.icon}
            </div>
            <h2 className="text-[24px] font-semibold text-gray-900">{req.title} Preview</h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable Area for Document */}
        <div className="flex-1 overflow-y-auto md:p-5 bg-gray-50/50">
          <BarangayClearanceTemplate resident={resident} requestId={req.id} />
        </div>

        {/* Footer */}
        <div className="bg-[#F1FBF1] px-6 py-4 flex justify-end gap-3 border-t border-[#D1E9D1] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E5E7EB] text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-6 py-2.5 flex items-center gap-2 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
