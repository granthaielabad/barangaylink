import React from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import { useAuth } from '../../../../hooks/auth/useAuth';
import { useNotifications, useMutateNotifications } from '../../../../hooks/queries/notifications/useNotifications';
import { FiLoader } from 'react-icons/fi';

const NotificationDropdown = ({ onClose }) => {
  const { isSuperadmin, isStaff } = useAuth();
  const isAdmin = isSuperadmin || isStaff;

  const { data: notifications = [], isLoading } = useNotifications();
  const { markAllRead } = useMutateNotifications();

  const dropdownRef = React.useRef(null);

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-semibold text-gray-800">Notification</h3>
        <button
          onClick={handleMarkAllAsRead}
          disabled={markAllRead.isPending}
          className="text-xs font-bold text-[#005F02] hover:underline transition-all"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FiLoader className="w-6 h-6 text-[#005F02] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={`${notif.id}-${notif.isRead}`}
              notification={notif}
              variant="dropdown"
            />
          ))
        )}
      </div>

      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
        <Link
          to={isAdmin ? '/notifications' : '/resident-portal/notifications'}
          onClick={onClose}
          className="text-sm font-semibold text-[#005F02] hover:underline"
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;