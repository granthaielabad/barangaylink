import React from 'react';
import { FiFileText, FiMoreVertical, FiEyeOff, FiBellOff, FiBell } from 'react-icons/fi';

const NotificationItem = ({ notification, variant = 'full' }) => {
  const isDropdown = variant === 'dropdown';
  const isRead = notification.isRead;

  return (
    <div className={`
      relative transition-all 
      ${isDropdown 
        ? 'p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0' 
        : 'p-4 sm:p-6 lg:p-8 bg-white rounded-xl border-1 border-gray-300 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 lg:gap-10 xl:gap-16 group shadow-sm transition-all min-w-0'}
      ${!isRead && !isDropdown 
        ? 'border-[#8C0B1A] bg-[#8C0B1A]/5 shadow-md sm:scale-[1.01]' 
        : isDropdown ? 'opacity-100' : 'border-gray-100 opacity-60 grayscale-[0.5]'}
    `}>
      {/* FULL VIEW - Category on the left (Column 1); stacked on narrow screens */}
      {!isDropdown && (
        <div className="w-full sm:w-36 lg:w-40 shrink-0 sm:pt-0.5">
          <span className={`text-sm sm:text-[15px] font-semibold ${!isRead ? 'text-[#8C0B1A]' : 'text-gray-400'}`}>
            {notification.type}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          {/* DROPDOWN VIEW - Category on top row */}
          {isDropdown && (
            <span className={`text-[13px] font-semibold ${!isRead ? 'text-[#8C0B1A]' : 'text-gray-500'}`}>
              {notification.type}
            </span>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            {/* NO MORE THREE DOTS */}
          </div>
        </div>
        
        {/* MESSAGE CARD - Center part */}
        <p className={`
          leading-snug break-words
          ${isDropdown ? 'text-sm' : 'text-base sm:text-[17px]'} 
          ${!isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-500'}
        `}>
          {notification.message}
        </p>

        {notification.attachment && (
          <div className={`
            mt-3 inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-[12px] transition-colors cursor-pointer shadow-sm
            ${!isRead ? 'bg-white border-[#8C0B1A]/30 text-[#8C0B1A]' : 'bg-gray-50 border-gray-200 text-gray-400'}
          `}>
            <div className={`w-4 h-4 rounded flex items-center justify-center ${!isRead ? 'bg-red-500' : 'bg-red-200'}`}>
              <span className="text-[8px] font-semibold text-white">PDF</span>
            </div>
            <span className="font-semibold truncate max-w-[min(180px,calc(100vw-8rem))] sm:max-w-[200px]">{notification.attachment}</span>
          </div>
        )}

        {/* DROPDOWN VIEW - Timestamp at the bottom */}
        {isDropdown && (
          <div className="mt-2 text-xs text-gray-400 font-semibold">
            {notification.timestamp}
          </div>
        )}
      </div>

      {/* FULL VIEW - Timestamp below message on mobile, right column from sm */}
      {!isDropdown && (
        <div className="w-full sm:w-28 lg:w-32 shrink-0 text-left sm:text-right pt-1 sm:pt-0.5 border-t border-gray-100/80 sm:border-0 mt-1 sm:mt-0">
          <span className={`text-xs sm:text-[13px] lg:text-[15px] font-semibold tracking-tight ${!isRead ? 'text-[#8C0B1A]' : 'text-gray-400'}`}>
            {notification.timestamp}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;


