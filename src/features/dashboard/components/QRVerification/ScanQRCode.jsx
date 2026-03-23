import { useRef, useState } from 'react';
import { BsQrCode } from 'react-icons/bs';

export default function ScanQRCode({ onVerify }) {
  const [manualCode, setManualCode] = useState('');
  const [verificationHistory, setVerificationHistory] = useState([
    {
      id: 1,
      name: 'Eloise Bridgerton',
      status: 'Active',
      time: '10:48 AM',
    }
  ]);

  const handleScanQR = () => {
    // Placeholder for QR scanning logic
    alert('QR Code Scan functionality would be implemented here');
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      onVerify?.(manualCode);
      setManualCode('');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col w-full sm:w-[650px]">
      {/* Section Title */}
      <div className="bg-[#F1F7F2] rounded-t-lg px-6 sm:px-10 py-3 mb-6 -mx-6 -my-6 border border-gray-200">
        <h3 className="text-xl sm:text-[24px] font-semibold">Scan QR Code</h3>
      </div>

      {/* QR Code Display Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 mx-auto flex items-center justify-center bg-gray-50 mb-6 w-full max-w-[400px] min-h-[180px] sm:min-h-[220px]">
        <div className="text-center">
          <BsQrCode className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">QR Code will appear here</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleScanQR}
          className="flex-1 bg-[#005F02] hover:bg-[#004A01] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          Scan QR Code
        </button>
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
          placeholder="Enter Code Manually"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]"
        />
      </div>

      {/* Verification History */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Verification History
        </h4>
        <div className="space-y-2 overflow-y-auto">
          {verificationHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <span className="text-sm text-gray-700">{item.name}</span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${item.status === 'Active'
                      ? 'text-[#005F02]'
                      : 'text-red-600'
                    }`}
                >
                  {item.status}
                </span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
