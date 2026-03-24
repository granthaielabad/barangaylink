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
        : 'p-8 bg-white rounded-xl border-1 border-gray-300 mb-6 flex items-center gap-16 group shadow-sm transition-all'}
      ${!isRead && !isDropdown 
        ? 'border-[#005F02] bg-[#005F02]/5 shadow-md scale-[1.01]' 
        : isDropdown ? 'opacity-100' : 'border-gray-100 opacity-60 grayscale-[0.5]'}
    `}>
      {/* FULL VIEW - Category on the left (Column 1) */}
      {!isDropdown && (
        <div className="w-40 shrink-0">
          <span className={`text-[15px] font-semibold ${!isRead ? 'text-[#005F02]' : 'text-gray-400'}`}>
            {notification.type}
          </span>
        </div>
      )}

      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          {/* DROPDOWN VIEW - Category on top row */}
          {isDropdown && (
            <span className={`text-[13px] font-semibold ${!isRead ? 'text-[#005F02]' : 'text-gray-500'}`}>
              {notification.type}
            </span>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            {/* NO MORE THREE DOTS */}
          </div>
        </div>
        
        {/* MESSAGE CARD - Center part */}
        <p className={`
          leading-snug 
          ${isDropdown ? 'text-sm' : 'text-[17px]'} 
          ${!isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-500'}
        `}>
          {notification.message}
        </p>

        {notification.attachment && (
          <div className={`
            mt-3 inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-[12px] transition-colors cursor-pointer shadow-sm
            ${!isRead ? 'bg-white border-[#005F02]/30 text-[#005F02]' : 'bg-gray-50 border-gray-200 text-gray-400'}
          `}>
            <div className={`w-4 h-4 rounded flex items-center justify-center ${!isRead ? 'bg-red-500' : 'bg-red-200'}`}>
              <span className="text-[8px] font-semibold text-white">PDF</span>
            </div>
            <span className="font-semibold truncate max-w-[140px]">{notification.attachment}</span>
          </div>
        )}

        {/* DROPDOWN VIEW - Timestamp at the bottom */}
        {isDropdown && (
          <div className="mt-2 text-xs text-gray-400 font-semibold">
            {notification.timestamp}
          </div>
        )}
      </div>

      {/* FULL VIEW - Timestamp on the right (Column 3) */}
      {!isDropdown && (
        <div className="w-32 text-right shrink-0">
          <span className={`text-[15px] font-semibold tracking-tight ${!isRead ? 'text-[#005F02]' : 'text-gray-400'}`}>
            {notification.timestamp}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
