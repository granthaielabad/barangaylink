export default function DeactiveModal({
  isOpen,
  title = 'Deactivate',
  message = 'This record will be deactivated and marked as inactive.',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t-lg border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Deactivate {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to deactivate this {title.toLowerCase()}?
          </h3>
          <p className="text-gray-600 text-sm mb-7">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-10 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-10 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-amber-700 transition-colors"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


