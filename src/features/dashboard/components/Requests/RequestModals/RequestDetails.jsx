import { FiFileText } from 'react-icons/fi';

export default function RequestDetails({ request, adminNotes, onAdminNotesChange }) {
  const isReadOnly = request.status?.toLowerCase() === 'approved' || request.status?.toLowerCase() === 'rejected';

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {/* Request ID and Status */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 font-medium">Request #{request.id || 'REQ-2024-001'}</p>
        <span className={`px-5 py-1 rounded-full text-xs font-semibold ${
          request.status?.toLowerCase() === 'pending' ? 'bg-[#F4E2B8] text-[#C2410C]' :
          request.status?.toLowerCase() === 'processing' ? 'bg-[#DDF3DD] text-[#1838B8]' :
          'bg-[#BFE8BF] text-[#005F02]'
        }`}>
          {request.status}
        </span>
      </div>

      {/* Resident Information Box */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
        <h3 className="text-[#0D542B] font-semibold mb-4">Resident Information Verified</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Full Name</p>
            <p className="text-sm font-semibold text-gray-900">{request.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">ID Number</p>
            <p className="text-sm font-semibold text-gray-900">{request.residentId || '1234-123-12'}</p>
          </div>
          <div className="col-span-1">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Address</p>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {request.address || '#71 Dahlia Avenue St. Brgy San Bartolome'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Civil Status</p>
            <p className="text-sm font-semibold text-gray-900">{request.civilStatus || 'Single'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Date of Birth</p>
            <p className="text-sm font-semibold text-gray-900">{request.birthDate || '01/01/2001'}</p>
          </div>
        </div>
      </div>

      {/* Purpose of Request */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Purpose of Request <span className="text-red-500">*</span>
        </label>
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 min-h-[80px]">
          {request.purpose || 'gbsdxrfhjdlhfhyt'}
        </div>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Date Requested</label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600">
            {request.date}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Processing</label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600">
            {request.estimatedDate || '—'}
          </div>
        </div>
      </div>

      {/* Processing Fee Box */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[#1D4ED8] font-semibold text-sm">Processing Fee</p>
          <p className="text-[#3B82F6] text-[11px] mt-0.5">Payment reference will be generated upon submission</p>
        </div>
        <div className="text-[#1D4ED8] text-2xl font-black">
          {request.fee?.includes('Free') ? 'Free' : '₱50'}
        </div>
      </div>

      {/* Administrator Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Administrator Notes (Optional)
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => onAdminNotesChange(e.target.value)}
          placeholder="Add any internal notes about this request..."
          readOnly={isReadOnly}
          className={`w-full border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 transition-all min-h-[100px] resize-none ${
            isReadOnly ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-700 hover:border-gray-300'
          }`}
        />
      </div>
    </div>
  );
}
