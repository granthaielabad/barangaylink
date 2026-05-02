import React from 'react';

export default function TabSwitcher({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-0 sm:gap-1 border-b border-gray-200 overflow-x-auto mb-6 -mx-1 px-1 sm:mx-0 sm:px-0 pb-px">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`
            flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-lg font-semibold whitespace-nowrap border-b-2 transition-all shrink-0
            ${activeTab === tab.key
              ? 'border-[#8C0B1A] text-[#8C0B1A]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`
              text-sm px-2 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? 'bg-[#8C0B1A]/10 text-[#8C0B1A]' : 'bg-gray-100 text-gray-500'}
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}


