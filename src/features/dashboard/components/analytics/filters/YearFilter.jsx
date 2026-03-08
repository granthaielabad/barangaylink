import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

const PAGE_SIZE = 9;

export default function YearFilter({ selectedYear, onYearChange }) {
  const [open,           setOpen]           = useState(false);
  const [rangeStart,     setRangeStart]     = useState(() => new Date().getFullYear() - 4);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (year) => {
    onYearChange(String(year));
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen((o) => !o);
    const cur = parseInt(selectedYear, 10);
    if (!isNaN(cur)) setRangeStart(Math.max(2000, cur - 4));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-5 px-4 py-2 rounded-lg text-sm border border-gray-300 shrink-0 min-w-[90px] justify-between bg-white hover:bg-gray-50"
      >
        <span className="font-semibold">Year</span>
        <div className="inline-flex items-center gap-0.5 border border-gray-300 rounded px-2 py-0.5">
          {selectedYear}
          <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[240px]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setRangeStart((y) => Math.max(2000, y - PAGE_SIZE))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{rangeStart} – {rangeStart + PAGE_SIZE - 1}</span>
            <button type="button" onClick={() => setRangeStart((y) => y + PAGE_SIZE)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {Array.from({ length: PAGE_SIZE }, (_, i) => rangeStart + i).map((y) => (
              <button key={y} type="button" onClick={() => handleSelect(y)}
                className={`py-2 rounded-lg text-sm font-medium ${String(y) === selectedYear ? 'bg-[#005F02] text-white' : 'text-gray-800 hover:bg-gray-100'}`}>
                {y}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-1 border-t border-gray-100">
            <button type="button" onClick={() => handleSelect(new Date().getFullYear())}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Reset Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
}