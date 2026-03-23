import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';

const SORT_OPTIONS = [
  { label: 'Date: Newest', value: 'newest' },
  { label: 'Date: Oldest', value: 'oldest' },
];

export default function ReviewFilter() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchValue, setSearchValue] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-gray-200 pb-3">
      <div className="flex items-center gap-4">
        {/* Custom Sort Dropdown matching shared filter style */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm font-semibold h-[44px] min-w-[160px] hover:bg-gray-50 transition-all shadow-sm focus:outline-none"
          >
            <span>{selectedSort.label}</span>
            <IoIosArrowDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {sortOpen && (
            <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[160px] bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedSort(opt);
                    setSortOpen(false);
                  }}
                  className="flex items-center justify-between w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                >
                  <span className={selectedSort.value === opt.value ? 'font-semibold text-[#005F02]' : 'text-gray-700'}>
                    {opt.label}
                  </span>
                  {selectedSort.value === opt.value && <MdCheck className="w-4 h-4 text-[#005F02]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Filter Toggle Buttons */}
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Under Review'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-[13px] font-semibold border transition-all h-[44px] flex items-center justify-center whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gray-50 text-gray-900 border-gray-400'
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Search Box */}
      <div className="relative w-full md:w-72 h-[44px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-300 w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="block w-full h-full pl-10 pr-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 text-[14px] font-medium"
        />
      </div>
    </div>
  );
}
