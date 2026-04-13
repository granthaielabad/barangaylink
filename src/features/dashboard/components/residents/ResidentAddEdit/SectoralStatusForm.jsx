import { PiTagLight } from 'react-icons/pi';

export default function SectoralStatusForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const statuses = [
    { id: 'isPwd', label: 'Person with Disability (PWD)' },
    { id: 'isSoloParent', label: 'Solo Parent' },
    { id: 'isIndigent', label: 'Indigent' },
  ];

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <PiTagLight className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Sectoral Status
        </h3>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.id} className="flex items-center gap-3">
            <input
              id={status.id}
              type="checkbox"
              checked={value[status.id] ?? false}
              onChange={(e) => update(status.id, e.target.checked)}
              className="w-5 h-5 accent-[#005F02] cursor-pointer rounded border-gray-300 focus:ring-[#005F02]/30"
            />
            <label
              htmlFor={status.id}
              className="text-base text-gray-700 cursor-pointer select-none"
            >
              {status.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
