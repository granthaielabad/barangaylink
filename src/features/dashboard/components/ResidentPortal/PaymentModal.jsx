import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCreditCard, FiCheck } from 'react-icons/fi';
import gcashIcon from '../../../../assets/icons/gcash.svg';
import paymayaIcon from '../../../../assets/icons/paymaya.svg';


const PAYMENT_METHODS = [
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Mobile Wallet',
    icon: <img src={gcashIcon} alt="GCash" className="w-10 h-10 " />,
    instructions: [
      '1. Send to: 09XX-XXX-XXXX',
      '2. Ref: TXN-20240318-002',
      '3. Screenshot confirmation',
      '4. Click "Confirm Payment"'
    ]
  },
  {
    id: 'paymaya',
    name: 'PayMaya',
    description: 'Digital Payment',
    icon: <img src={paymayaIcon} alt="PayMaya" className="w-10 h-10 " />,
    instructions: [
      '1. Open PayMaya app',
      '2. Scan QR Code or Send to: 09XX-XXX-XXXX',
      '3. Save transaction receipt',
      '4. Click "Confirm Payment"'
    ]
  },
  {
    id: 'otc',
    name: 'Over-the-Counter',
    description: 'Pay at Office',
    icon: <div className="w-10 h-10 bg-[#C04918] rounded-lg flex items-center justify-center text-white"><FiCreditCard className="w-6 h-6" /></div>,
    instructions: [
      '1. Visit the Barangay Office',
      '2. Present your Request ID',
      '3. Pay the processing fee',
      '4. Wait for status update'
    ]
  }
];

export default function PaymentModal({ req, onClose, onConfirm }) {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col">
        
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

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Request Summary */}
          <div className="border border-gray-300 bg-[#F9FAFB] rounded-sm p-5 space-y-4">
            <h3 className="text-base font-semibold tracking-wider">Request Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Document Type:</span>
                <span className="font-semibold text-gray-900">{req.title}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Request ID:</span>
                <span className="font-semibold text-gray-900">{req.id}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Transaction Ref:</span>
                <span className="font-semibold text-gray-900">{req.txnRef}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-300 flex justify-between items-center">
               <span className="font-bold text-gray-800">Amount to pay:</span>
               <span className="text-3xl font-bold text-gray-900">₱{req.fee || 50}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Select Payment Method</h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedMethod.id === method.id 
                    ? 'border-[#005F02] bg-[#F1FBF1]' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod.id === method.id ? 'border-[#005F02]' : 'border-gray-300'
                  }`}>
                    {selectedMethod.id === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#005F02]" />}
                  </div>
                  {method.icon}
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#EBF5FF] border border-[#CCE4FF] rounded-xl p-5 space-y-3">
             <h4 className="text-[#1838B8] font-bold text-sm">{selectedMethod.name} Instructions</h4>
             <ul className="space-y-1">
                {selectedMethod.instructions.map((line, idx) => (
                  <li key={idx} className="text-[#1858D0] text-[13px]">{line}</li>
                ))}
             </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F1FBF1] px-6 py-4 flex justify-end gap-3 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E5E7EB] text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedMethod)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
