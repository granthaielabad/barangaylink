// src/features/dashboard/components/residents/ResidentAddEdit/IdentificationDetailForm.jsx
import { IoInformationCircleOutline } from 'react-icons/io5';
import { FormSelect } from '../../../../../shared';
import { RESIDENT_STATUS_FORM_OPTIONS } from '../../../../../core/constants';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

export default function IdentificationDetailForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <IoInformationCircleOutline className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Identification Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ID No. — visible replacement for PhilHealth / SSS / TIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ID No.</label>
          <input
            type="text"
            value={value.idNumber ?? ''}
            onChange={(e) => update('idNumber', e.target.value)}
            placeholder="e.g. National ID, Voter's ID, etc."
            className={inputClass}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <FormSelect
            placeholder="Status"
            value={value.status ?? 'active'}
            onChange={(val) => update('status', val)}
            options={RESIDENT_STATUS_FORM_OPTIONS}
          />
        </div>
      </div>

      {/* Hidden — PhilHealth, SSS, TIN (preserved in state, not rendered) */}
      <input type="hidden" value={value.philhealthNo ?? ''} readOnly />
      <input type="hidden" value={value.sssNo ?? ''} readOnly />
      <input type="hidden" value={value.tinNo ?? ''} readOnly />
    </div>
  );
}