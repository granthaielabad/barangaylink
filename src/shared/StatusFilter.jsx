import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';

const DEFAULT_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'pending',     label: 'Pending' },
  { value: 'deactivated', label: 'Deactivated' },
];

export default function StatusFilter({ value, onChange, options = DEFAULT_OPTIONS }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-gray-900 gap-2 px-4 py-2.5 rounded-lg text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 justify-between shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#005F02]/20"
      >
        <span className="text-base font-medium">{selectedOption.label}</span>
        <IoIosArrowDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span className={value === option.value ? 'font-semibold text-[#005F02]' : 'text-gray-700'}>
                {option.label}
              </span>
              {value === option.value && <MdCheck className="w-5 h-5 text-[#005F02]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}