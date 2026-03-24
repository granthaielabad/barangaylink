import React from 'react';

export default function TabSwitcher({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`
            flex items-center gap-2 px-6 py-3 text-lg font-semibold whitespace-nowrap border-b-2 transition-all
            ${activeTab === tab.key
              ? 'border-[#005F02] text-[#005F02]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`
              text-sm px-2 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? 'bg-[#005F02]/10 text-[#005F02]' : 'bg-gray-100 text-gray-500'}
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
