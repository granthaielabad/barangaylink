import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TERMS_ITEMS = [
  'I understand that my information will be collected and processed in accordance with barangay policies.',
  'The information provided is true and accurate to the best of my knowledge.',
  'I consent to the use of my data for barangay services and verification purposes.',
  'I acknowledge and accept that my information will be handled in accordance with the Data Privacy Act of 2012 and other applicable laws.',
  'I understand that I can contact the barangay office for any questions or concerns regarding my data.',
];

export default function AgreementModal({ isOpen, onClose, onAgree, initialAgreed = false }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAgreed(initialAgreed);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialAgreed]);

  const handleBack = () => {
    setAgreed(false);
    onClose?.();
  };

  const handleAgreeAndContinue = () => {
    if (!agreed) return;
    setAgreed(false);
    onAgree?.();
    onClose?.();
  };

  const modalContent = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 min-h-screen">
      <div
        className="absolute inset-0 min-h-full bg-black/70"
        style={{ minHeight: '100vh' }}
        onClick={handleBack}
        aria-hidden
      />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-labelledby="agreement-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#8C0B1A] px-6 py-7 text-center">
          <h2 id="agreement-title" className="text-white text-xl font-bold">
            Agreement for Registration
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-gray-800 text-sm">
            Before completing your registration, please review and agree to the following terms to ensure your data privacy and security.
          </p>

          <div className="border border-gray-300 p-3 max-h-48 overflow-y-auto">
            <h3 className="text-[#8C0B1A] font-bold mb-3 border-b border-gray-300 pb-2">Terms and Condition</h3>
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              {TERMS_ITEMS.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="modal-agree-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#8C0B1A] focus:ring-[#8C0B1A] accent-[#0096FF]"
            />  
            <label htmlFor="modal-agree-terms" className="text-sm text-gray-700">
              I have read and agree to the terms and conditions.<span className="text-red-500">*</span>
            </label>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleAgreeAndContinue}
            disabled={!agreed}
            className="px-5 py-2.5 rounded-lg bg-[#8C0B1A] text-white font-medium hover:bg-[#7A0915] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agree and Continue
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return createPortal(modalContent, document.body);
}


