import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function RequestDocumentModal({ cert, resident, onClose, onSubmit, isPending }) {
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    onSubmit({
      document_type: cert.title,
      purpose: purpose,
      fee: cert.fee,
    });
  };

  const fullName = [resident?.first_name, resident?.middle_name, resident?.last_name, resident?.suffix]
    .filter(Boolean).join(' ') || 'Barangay Resident';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex bg-[#F1FBF1] items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#005F02]">
              {cert.icon}
            </div>
            <h2 className="text-[24px] font-semibold text-gray-900">{cert.title}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4">

          {/* Resident Info Verified */}
          <div className="bg-[#F0FDF4] border border-[#B9F8CF] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-[#0D542B]">
              <span className="font-semibold text-sm">Resident Information Verified</span>
            </div>
            <div className="grid grid-cols-2 gap-y-3 text-[13px]">
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Full Name</p>
                <p className="font-semibold text-gray-900">{fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">ID Number</p>
                <p className="font-semibold text-gray-900">{resident?.id_number || '1234-123-12'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Address</p>
                <p className="font-semibold text-gray-900">{resident?.address_line || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Date of Birth</p>
                <p className="font-semibold text-gray-900">
                  {resident?.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString('en-US') : '01/01/2001'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Civil Status</p>
                <p className="font-bold text-gray-900">{resident?.civil_status || 'Single'}</p>
              </div>
            </div>
          </div>

          {/* Purpose of Request */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Purpose of Request <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Please specify the purpose of this certificate request..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] bg-gray-50"
            />
          </div>

          {/* Processing Fee */}
          <div className="bg-[#E8F0F8] border border-[#B8D8F8] rounded-lg px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[#1838B8] font-semibold text-sm">Processing Fee</p>
              <p className="text-[#1858D0] text-[11px]">Payment reference will be generated upon submission</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">₱{cert.fee}</p>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-gray-500 pb-2">
            <FiClock className="w-4 h-4" />
            <span>Processing Time: 3-5 business days</span>
          </div>

          </div>

          {/* Footer Buttons */}
          <div className="bg-[#F1FBF1] px-6 py-4 flex justify-end gap-3 border-t border-[#D1E9D1]">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E5E7EB] text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !purpose.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Submitting...' : 'Submit Request'}
            </button>

          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

