import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';



export default function SortFilter({ value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0] || { label: 'Sort' };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="inline-flex items-center text-gray-900 gap-2 px-4 py-2.5 rounded-lg text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 justify-between shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#005F02]/20"
      >
        <span>{selectedOption.label}</span>
        <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
            >
              <span className={value === opt.value ? 'font-semibold text-[#005F02]' : 'text-gray-700'}>
                {opt.label}
              </span>
              {value === opt.value && <MdCheck className="w-4 h-4 text-[#005F02]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
