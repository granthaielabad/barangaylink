export function PendingFooter({ onReject, onProcess, onApprove }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
      <button
        type="button"
        onClick={onReject}
        className="px-6 py-2.5 rounded-lg text-sm font-bold bg-white border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
      >
        Reject Request
      </button>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onProcess}
          className="px-6 py-2.5 rounded-lg text-sm font-bold bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Set to Processing
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors shadow-sm"
        >
          Approve & Complete
        </button>
      </div>
    </div>
  );
}

export function ProcessingFooter({ onReject, onApprove }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
      <button
        type="button"
        onClick={onReject}
        className="px-6 py-2.5 rounded-lg text-sm font-bold border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
      >
        Reject Request
      </button>
      <button
        type="button"
        onClick={onApprove}
        className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors shadow-sm"
      >
        Approve & Complete
      </button>
    </div>
  );
}

export function CompletedFooter({ onClose }) {
  return (
    <div className="flex items-center justify-end px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
      <button
        type="button"
        onClick={onClose}
        className="px-8 py-2.5 rounded-lg text-sm font-bold bg-white border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
