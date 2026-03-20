import { useState } from 'react';
import DateRangeFilter from './filters/DateRangeFilter';
import YearFilter      from './filters/YearFilter';
import FilterAll       from './filters/FilterAll';
import CategoryFilter  from './filters/CategoryFilter';
import { ExportButton } from '../../../../shared';

export default function Filters({ onFilterChange, onExport }) {
  const [dateRange,      setDateRange]      = useState('last30');
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 days');
  const [customStart,    setCustomStart]    = useState('');
  const [customEnd,      setCustomEnd]      = useState('');
  const [year,           setYear]           = useState(String(new Date().getFullYear()));
  const [filterAll,      setFilterAll]      = useState('All');
  const [category,       setCategory]       = useState('Category');

  // Build and emit the full unified filters object after any change
  const emit = (patch) => {
    onFilterChange?.({
      dateRange, dateRangeLabel, customStart, customEnd,
      year, filterAll, category,
      ...patch,
    });
  };

  const handleDateRangeChange = ({ dateRange: dr, dateRangeLabel: drl, customStart: cs, customEnd: ce }) => {
    setDateRange(dr);
    setDateRangeLabel(drl);
    setCustomStart(cs);
    setCustomEnd(ce);
    emit({ dateRange: dr, dateRangeLabel: drl, customStart: cs, customEnd: ce });
  };

  const handleYearChange = (y) => {
    setYear(y);
    emit({ year: y });
  };

  const handleFilterAllChange = (v) => {
    setFilterAll(v);
    emit({ filterAll: v });
  };

  const handleCategoryChange = (v) => {
    setCategory(v);
    emit({ category: v });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          dateRangeLabel={dateRangeLabel}
          customStart={customStart}
          customEnd={customEnd}
          onDateRangeChange={handleDateRangeChange}
          filterYear={year}
        />
        <YearFilter
          selectedYear={year}
          onYearChange={handleYearChange}
        />
        <FilterAll
          selectedFilter={filterAll}
          onFilterChange={handleFilterAllChange}
        />
        <CategoryFilter
          selectedCategory={category}
          onCategoryChange={handleCategoryChange}
        />
        <div className="ml-auto">
          <ExportButton onExport={onExport} />
        </div>
      </div>
    </div>
  );
}