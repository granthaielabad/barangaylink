import { useState, useRef, useEffect } from 'react';
import { LuCalendarX } from 'react-icons/lu';
import { IoIosArrowDown } from 'react-icons/io';
import { formatDate, toYMD, getCalendarDays, isSameDay, isInRange, MONTH_NAMES } from './filterUtils';

const DATE_RANGE_OPTIONS = [
  { value: 'last30', label: 'Last 30 days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily',  label: 'Daily' },
];

export default function DateRangeFilter({ dateRangeLabel, customStart, customEnd, onDateRangeChange, filterYear }) {
  const [last30Open,   setLast30Open]   = useState(false);
  const [customOpen,   setCustomOpen]   = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const year = filterYear ? parseInt(filterYear, 10) : new Date().getFullYear();
    return { year, month: new Date().getMonth() };
  });
  const [calendarView, setCalendarView] = useState('days');
  const [rangeStart,   setRangeStart]   = useState(null);
  const [rangeEnd,     setRangeEnd]     = useState(null);
  const last30Ref = useRef(null);
  const customRef = useRef(null);

  useEffect(() => {
    if (filterYear) {
      const year = parseInt(filterYear, 10);
      setCalendarMonth((m) => ({ ...m, year }));
    }
  }, [filterYear]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (last30Ref.current && !last30Ref.current.contains(e.target)) setLast30Open(false);
      if (customRef.current && !customRef.current.contains(e.target)) setCustomOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateRangeSelect = (opt) => {
    onDateRangeChange({ dateRange: opt.value, dateRangeLabel: opt.label, customStart: '', customEnd: '' });
    setLast30Open(false);
  };

  const handleCustomApply = () => {
    if (rangeStart && rangeEnd) {
      const start = toYMD(rangeStart);
      const end   = toYMD(rangeEnd);
      onDateRangeChange({
        dateRange: 'custom',
        dateRangeLabel: `${formatDate(start)} - ${formatDate(end)}`,
        customStart: start,
        customEnd:   end,
      });
    }
    setCustomOpen(false);
  };

  const openCustom = () => {
    setCustomOpen(true);
    setLast30Open(false);
    setCalendarView('days');
    if (customStart && customEnd) {
      const start = new Date(customStart + 'T12:00:00');
      const end   = new Date(customEnd   + 'T12:00:00');
      setRangeStart(start);
      setRangeEnd(end);
      setCalendarMonth({ year: start.getFullYear(), month: start.getMonth() });
    } else {
      setRangeStart(null);
      setRangeEnd(null);
      const now  = new Date();
      const year = filterYear ? parseInt(filterYear, 10) : now.getFullYear();
      setCalendarMonth({ year, month: now.getMonth() });
    }
  };

  const handleCalendarDayClick = (day) => {
    if (!day) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      if (day.getTime() < rangeStart.getTime()) { setRangeEnd(rangeStart); setRangeStart(day); }
      else setRangeEnd(day);
    }
  };

  const prevMonth = () => setCalendarMonth((m) => m.month === 0  ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 });
  const nextMonth = () => setCalendarMonth((m) => m.month === 11 ? { year: m.year + 1, month: 0  } : { ...m, month: m.month + 1 });

  const customLabel = customStart && customEnd ? `${formatDate(customStart)} - ${formatDate(customEnd)}` : 'Custom';

  return (
    <div className="inline-flex items-center gap-2 flex-wrap p-2 rounded-xl border-gray-200">
      <span className="text-sm font-semibold px-1">Date Range</span>

      {/* Preset dropdown */}
      <div className="relative" ref={last30Ref}>
        <button
          type="button"
          onClick={() => { setLast30Open((o) => !o); setCustomOpen(false); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[120px] justify-between bg-white hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <LuCalendarX className="w-5 h-5 shrink-0" />
            {dateRangeLabel}
          </span>
          <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${last30Open ? 'rotate-180' : ''}`} />
        </button>
        {last30Open && (
          <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[140px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => handleDateRangeSelect(opt)}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom calendar dropdown */}
      <div className="relative" ref={customRef}>
        <button
          type="button"
          onClick={() => (customOpen ? setCustomOpen(false) : openCustom())}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white hover:bg-gray-50"
        >
          {customLabel}
          <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${customOpen ? 'rotate-180' : ''}`} />
        </button>

        {customOpen && (
          <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" onClick={() => setCalendarView('months')}
                className="text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded px-2 py-1">
                {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </button>
              <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {calendarView === 'days' && (
              <div className="grid grid-cols-7 gap-0.5 mb-3">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
                ))}
                {getCalendarDays(calendarMonth.year, calendarMonth.month).map((day, i) => {
                  const isStart = day && rangeStart && isSameDay(day, rangeStart);
                  const isEnd   = day && rangeEnd   && isSameDay(day, rangeEnd);
                  const inRange = day && isInRange(day, rangeStart, rangeEnd);
                  const isCurrent = day && day.getMonth() === calendarMonth.month;
                  return (
                    <button key={i} type="button" disabled={!day} onClick={() => handleCalendarDayClick(day)}
                      className={`w-8 h-8 rounded-lg text-sm
                        ${!day ? 'invisible' : ''}
                        ${!isCurrent ? 'text-gray-300' : 'text-gray-800'}
                        ${isStart || isEnd ? 'bg-[#005F02] text-white font-semibold' : ''}
                        ${inRange ? 'bg-[#005F02]/20' : ''}
                        ${day && isCurrent && !isStart && !isEnd && !inRange ? 'hover:bg-gray-100' : ''}
                      `}>
                      {day ? day.getDate() : ''}
                    </button>
                  );
                })}
              </div>
            )}

            {calendarView === 'months' && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {MONTH_NAMES.map((name, i) => (
                  <button key={name} type="button"
                    onClick={() => { setCalendarMonth((m) => ({ ...m, month: i })); setCalendarView('days'); }}
                    className="py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100">
                    {name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button type="button" onClick={() => {
                setRangeStart(null); setRangeEnd(null);
                onDateRangeChange({ dateRange: 'last30', dateRangeLabel: 'Last 30 days', customStart: '', customEnd: '' });
                setCustomOpen(false);
              }} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                Reset
              </button>
              <button type="button" onClick={handleCustomApply} disabled={!rangeStart || !rangeEnd}
                className="px-3 py-1.5 text-sm font-medium bg-[#005F02] text-white rounded-lg hover:bg-[#004a02] disabled:opacity-50 disabled:cursor-not-allowed">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}