import { IoLocationOutline } from 'react-icons/io5';
import { BARANGAY } from '../../../../../core/constants';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

const lockedInputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-base cursor-not-allowed select-none';

export default function AddressInformationForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <IoLocationOutline className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Address Information
        </h3>
      </div>

      {/* House No. and Street Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1.5 sm:min-h-[40px] flex items-end">
            <span>House No., block, lot, apt, suite, unit, building, floor, etc: <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            value={value.houseNo ?? ''}
            onChange={(e) => update('houseNo', e.target.value)}
            className={inputClass}
            placeholder="e.g. Blk 1 Lot 2, Phase 3"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1.5 sm:min-h-[40px] flex items-end">
            <span>Street, village, etc. <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            value={value.street ?? ''}
            onChange={(e) => update('street', e.target.value)}
            className={inputClass}
            placeholder="e.g. Sampaguita St., Greenview Village"
            required
          />
        </div>
      </div>

      {/* Sitio and Barangay Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sitio</label>
          <input
            type="text"
            value={value.purok ?? ''}
            onInput={(e) => {
              const v = e.target.value;
              // If user clears the text, also clear the associated purokId
              onChange?.({ ...value, purok: v, purokId: v ? (value.purokId ?? '') : '' });
            }}
            className={inputClass}
            placeholder="e.g. Sitio Uno"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay</label>
          <input
            type="text"
            value={BARANGAY}
            readOnly
            className={lockedInputClass}
          />
        </div>
      </div>
    </div>
  );
}
