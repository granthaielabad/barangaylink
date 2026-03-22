// PayMongo integration — redirects resident to PayMongo checkout page.
// Supports: GCash, Maya, Over-the-Counter (7-Eleven, Bayad Center, etc.)
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCreditCard, FiExternalLink, FiLoader } from 'react-icons/fi';
import gcashIcon from '../../../../assets/icons/gcash.svg';
import paymayaIcon from '../../../../assets/icons/paymaya.svg';
import { useCreatePaymentLink } from '../../../../hooks/queries/documentRequests/useDocumentRequests';

const PAYMENT_METHODS = [
  {
    id:          'gcash',
    name:        'GCash',
    description: 'Mobile Wallet',
    icon:        <img src={gcashIcon} alt="GCash" className="w-10 h-10" />,
  },
  {
    id:          'maya',
    name:        'Maya',
    description: 'Digital Payment',
    icon:        <img src={paymayaIcon} alt="Maya" className="w-10 h-10" />,
  },
  {
    id:          'otc',
    name:        'Over-the-Counter',
    description: '7-Eleven, Bayad Center & more',
    icon:        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white"><FiCreditCard className="w-5 h-5" /></div>,
  },
];

export default function PaymentModal({ req, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const { mutate: createLink, isPending } = useCreatePaymentLink();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePay = () => {
    createLink(req._rawId, {
      onSuccess: (data) => {
        // Open PayMongo checkout in a new tab
        window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
        // Close modal — payment status will update via webhook + Realtime
        onClose();
      },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F1FBF1] border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 font-semibold text-gray-800">
            <div className="w-8 h-8 rounded-lg bg-[#005F02]/10 flex items-center justify-center text-[#005F02]">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <span>Complete Payment</span>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors"
            aria-label="Close modal">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Request Summary */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Request Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Document Type:</span>
                <span className="font-semibold text-gray-900">{req.title}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Control No.:</span>
                <span className="font-semibold text-gray-900 font-mono">{req.txnRef ?? '—'}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-800">Amount to pay:</span>
              <span className="text-2xl font-black text-[#005F02]">₱{req.fee ?? 50}</span>
            </div>
          </div>

          {/* Payment method selector (informational only — PayMongo shows all options on checkout) */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Preferred Payment Method</p>
            <p className="text-xs text-gray-400">All available methods will be shown on the checkout page.</p>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button key={method.id} type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedMethod.id === method.id
                      ? 'border-[#005F02] bg-[#F1FBF1]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  {method.icon}
                  <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{method.name}</p>
                  <p className="text-[10px] text-gray-400 text-center leading-tight">{method.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-xs text-blue-700">
            <FiExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You'll be redirected to PayMongo's secure checkout page to complete your payment.
              Once paid, your request status will update automatically within a few seconds.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F1FBF1] px-6 py-4 flex justify-end gap-3 border-t border-gray-200 shrink-0">
          <button type="button" onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E5E7EB] text-gray-700 hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handlePay} disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            {isPending
              ? <><FiLoader className="w-4 h-4 animate-spin" /> Preparing...</>
              : <><FiExternalLink className="w-4 h-4" /> Proceed to Payment</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}