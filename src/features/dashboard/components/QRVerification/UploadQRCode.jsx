import { useRef } from 'react';
import { EIdProfile } from '../eID';

export default function UploadQRCode({ onUpload }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        alert('Only PNG and JPG files are supported');
        return;
      }

      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload?.(event.target?.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full flex flex-col">
      {/* Profile Section */}
      <div className="bg-[#F1F7F2] rounded-t-lg border border-gray-200 flex flex-col items-center py-6 -my-6 mb-6 -mx-6 px-6">
        <div className="rounded-full overflow-hidden">
          <EIdProfile size={100} />
        </div>
        <p className="text-2xl sm:text-3xl font-bold mt-3">-</p>
      </div>

      {/* Last Verified */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">Last Verified: <span className="text-gray-600">-</span></p>
      </div>

      {/* Resident Details */}
      <div className="flex-1 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resident Details</h3>

        {/* Full Name */}
        <div className="mb-6">
          <label className="text-sm font-medium text-[#005F02]">Full Name</label>
          <p className="text-gray-600 pb-2 border-b border-gray-300">-</p>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="text-sm font-medium text-[#005F02]">Address</label>
          <p className="text-gray-600 pb-2 border-b border-gray-300">-</p>
        </div>

        {/* Contact Number */}
        <div className="mb-6">
          <label className="text-sm font-medium text-[#005F02]">Contact Number</label>
          <p className="text-gray-600 pb-2 border-b border-gray-300">-</p>
        </div>

        {/* Birthdate and Sex */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#005F02]">Birthdate</label>
            <p className="text-gray-600 pb-2 border-b border-gray-300">-</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#005F02]">Sex</label>
            <p className="text-gray-600 pb-2 border-b border-gray-300">-</p>
          </div>
        </div>
      </div>

      {/* Upload QR Code Section */}
      <div className="mt-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#F1F7F2] hover:bg-[#005F02]/20 transition-colors rounded-lg py-3 flex items-center justify-center"
        >
          <span className="text-base font-medium text-[#005F02]">Upload QR Code</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
