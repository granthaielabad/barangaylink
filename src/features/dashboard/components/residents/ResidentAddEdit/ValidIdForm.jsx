import { useRef } from 'react';
import { PiIdentificationCardLight } from 'react-icons/pi';
import { HiOutlineArrowUpTray } from 'react-icons/hi2';
import { FormSelect } from '../../../../../shared';
import { RESIDENT_STATUS_FORM_OPTIONS, VALID_ID_CONFIG } from '../../../../../core/constants';

const ID_TYPE_OPTIONS = Object.entries(VALID_ID_CONFIG).map(([key, cfg]) => ({
  value: key,
  label: cfg.label
}));

const MAX_SIZE_MB  = 2;
const MAX_SIZE_B   = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A]';

export default function ValidIdForm({ value = {}, onChange, status = 'active', onStatusChange, error, mode = 'create' }) {
  const isEdit = mode === 'edit';
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_SIZE_B) {
      alert(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    update('validIdFile', file);
  };

  const onFileChange = (e) => handleFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const fileName      = value.validIdFile?.name ?? null;
  const signatureName = value.signatureFile?.name ?? null;

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <PiIdentificationCardLight className="w-5 h-5 text-[#8C0B1A]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Valid ID Identification
        </h3>
      </div>

      {/* Valid ID Type (Full Width) */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Valid ID Type
        </label>
        <FormSelect
          placeholder="Select ID Type"
          value={value.validIdType ?? ''}
          onChange={(val) => update('validIdType', val)}
          options={ID_TYPE_OPTIONS}
          disabled={isEdit}
        />
      </div>

      {/* ID Number + Status row (Side-by-side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ID Number
          </label>
          <input
            type="text"
            value={value.validIdNumber ?? ''}
            onChange={(e) => update('validIdNumber', e.target.value)}
            placeholder={VALID_ID_CONFIG[value.validIdType]?.placeholder || "Enter ID number"}
            maxLength={VALID_ID_CONFIG[value.validIdType]?.maxLength}
            className={`${inputClass} ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            readOnly={isEdit}
          />
          {error && <p className="text-[11px] text-red-600 mt-1 font-medium">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <FormSelect
            placeholder="Status"
            value={status ?? 'active'}
            onChange={onStatusChange}
            options={RESIDENT_STATUS_FORM_OPTIONS}
          />
        </div>
      </div>

      {/* Upload zone / Display existing ID */}
      <div>
        {isEdit && value.validIdUrl ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase">Existing Valid ID Photo</label>
            <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-h-60 flex justify-center">
              <img src={value.validIdUrl} alt="Valid ID" className="max-h-full object-contain" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
          </div>
        ) : (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#8C0B1A]/50 hover:bg-[#F1F7F2] transition-colors cursor-pointer py-7 px-4 text-center"
            >
              <HiOutlineArrowUpTray className="w-6 h-6 text-gray-400" />
              {fileName ? (
                <p className="text-sm text-[#8C0B1A] font-medium">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Upload Valid ID
                  </p>
                  <p className="text-xs text-gray-400">
                    Click to browse (Max to {MAX_SIZE_MB}MB)
                  </p>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Clear photo showing ID details and address
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Signature Row */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Resident's Signature
        </label>
        
        {isEdit && value.signatureUrl ? (
          <div className="flex justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <img src={value.signatureUrl} alt="Signature" className="h-20 object-contain mix-blend-multiply" />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => signatureInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && signatureInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#8C0B1A]/50 hover:bg-[#F1F7F2] transition-colors cursor-pointer py-4 px-4 text-center"
          >
            <HiOutlineArrowUpTray className="w-5 h-5 text-gray-400" />
            {signatureName ? (
              <p className="text-sm text-[#8C0B1A] font-medium">{signatureName}</p>
            ) : (
              <p className="text-sm font-medium text-gray-700">Upload Signature Image</p>
            )}
          </div>
        )}
        
        {!isEdit && (
          <p className="mt-1.5 text-xs text-gray-400 italic">
            Clear handwritten signature on a plain white background
          </p>
        )}

        <input
          ref={signatureInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) update('signatureFile', file);
          }}
        />
      </div>
    </div>
  );
}
