import { IoInformationCircleOutline } from 'react-icons/io5';
import { FormSelect } from '../../../../../shared';
import { RESIDENT_STATUS_OPTIONS } from '../../../../../core/constants';

// Filter out 'all' and 'archived' — those aren't valid when creating/editing
const STATUS_FORM_OPTIONS = RESIDENT_STATUS_OPTIONS.filter(
  (o) => o.value !== 'all' && o.value !== 'archived'
);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PhilHealth No.</label>
          <input
            type="text"
            value={value.philhealthNo ?? ''}
            onChange={(e) => update('philhealthNo', e.target.value)}
            placeholder="00-000000000-0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">SSS No.</label>
          <input
            type="text"
            value={value.sssNo ?? ''}
            onChange={(e) => update('sssNo', e.target.value)}
            placeholder="00-0000000-0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">TIN No.</label>
          <input
            type="text"
            value={value.tinNo ?? ''}
            onChange={(e) => update('tinNo', e.target.value)}
            placeholder="000-000-000-000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <FormSelect
            placeholder="Status"
            value={value.status ?? 'active'}
            onChange={(val) => update('status', val)}
            options={STATUS_FORM_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}