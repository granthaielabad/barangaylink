import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiDownload } from 'react-icons/fi';
import BarangayClearanceTemplate from './BarangayClearanceTemplate';

export default function DocumentPreviewModal({ req, resident, onClose }) {
  const printRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = () => {
    // Use browser print dialog targeting only the document content
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    // Clone the document content with all styles
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try { return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n'); }
        catch { return ''; }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${req.title ?? 'Document'}</title>
          <style>
            ${styles}
            body { margin: 0; padding: 24px; background: white; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-[#F9FAFB] w-full max-w-4xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[min(92vh,900px)] min-h-0">

        {/* Header */}
        <div className="flex items-start sm:items-center bg-[#F1FBF1] justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C0B1A] shrink-0">
              {req.icon}
            </div>
            <h2 className="text-lg sm:text-[22px] lg:text-[24px] font-semibold text-gray-900 leading-snug break-words">
              {req.title} Preview
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Document preview */}
        <div className="flex-1 overflow-y-auto md:p-5 bg-gray-50/50">
          <div ref={printRef}>
            <BarangayClearanceTemplate
              resident={resident}
              requestId={req.control_number ?? req.id}
              documentType={req.document_type ?? req.title}
              purpose={req.purpose}
              issuedAt={req.released_at ?? req.processed_at ?? new Date().toISOString()}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F1FBF1] px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 border-t border-[#D1E9D1] shrink-0">
          <button type="button" onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E5E7EB] text-gray-700 hover:bg-gray-300 transition-colors">
            Close
          </button>
          <button type="button" onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-[#8C0B1A] text-white hover:bg-[#7A0915] transition-colors">
            <FiDownload className="w-4 h-4 shrink-0" /> Download / Print
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

