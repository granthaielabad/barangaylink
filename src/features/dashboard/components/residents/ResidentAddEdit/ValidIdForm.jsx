import { useRef } from 'react';
import { PiIdentificationCardLight } from 'react-icons/pi';
import { HiOutlineArrowUpTray } from 'react-icons/hi2';
import { FormSelect } from '../../../../../shared';

const ID_TYPE_OPTIONS = [
  { value: 'national_id',    label: "National ID" },
  { value: 'passport',       label: "Passport" },
  { value: 'drivers_license',label: "Driver's License" },
  { value: 'sss',            label: "SSS ID" },
  { value: 'philhealth',     label: "PhilHealth ID" },
  { value: 'umid',           label: "UMID" },
  { value: 'voters_id',      label: "Voter's ID" },
  { value: 'postal_id',      label: "Postal ID" },
  { value: 'prc_id',         label: "PRC ID" },
  { value: 'tin_id',         label: "TIN ID" },
  { value: 'senior_citizen', label: "Senior Citizen ID" },
  { value: 'pwd_id',         label: "PWD ID" },
  { value: 'barangay_id',    label: "Barangay ID" },
  { value: 'other',          label: "Other" },
];

const MAX_SIZE_MB  = 2;
const MAX_SIZE_B   = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

export default function ValidIdForm({ value = {}, onChange }) {
  const fileInputRef = useRef(null);

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

  const fileName = value.validIdFile?.name ?? null;

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <PiIdentificationCardLight className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Valid ID Identification
        </h3>
      </div>

      {/* ID Type + ID Number row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Valid ID Type
          </label>
          <FormSelect
            placeholder="Select ID Type"
            value={value.validIdType ?? ''}
            onChange={(val) => update('validIdType', val)}
            options={ID_TYPE_OPTIONS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ID Number
          </label>
          <input
            type="text"
            value={value.validIdNumber ?? ''}
            onChange={(e) => update('validIdNumber', e.target.value)}
            placeholder="Enter ID number"
            className={inputClass}
          />
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#005F02]/50 hover:bg-[#F1F7F2] transition-colors cursor-pointer py-7 px-4 text-center"
        >
          <HiOutlineArrowUpTray className="w-6 h-6 text-gray-400" />
          {fileName ? (
            <p className="text-sm text-[#005F02] font-medium">{fileName}</p>
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

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
