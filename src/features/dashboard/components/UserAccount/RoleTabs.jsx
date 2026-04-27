export default function RoleTabs({ roleFilter, onRoleChange, roleCounts }) {
  const ROLE_FILTER = [
    { label: 'All', value: 'all' },
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Staff', value: 'Staff' },
    { label: 'Resident', value: 'Resident' },
  ];

  return (
    <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
      {ROLE_FILTER.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onRoleChange(filter.value)}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            roleFilter === filter.value
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {filter.label} ({roleCounts[filter.value]})
        </button>
      ))}
    </div>
  );
}


