import { useState, useRef, useEffect } from 'react';
import { FiLogOut, FiMenu, FiBell } from 'react-icons/fi';
import NotificationDropdown from './Notifications/NotificationDropdown';
import { useNotifications } from '../../../hooks/queries/notifications/useNotifications';

export default function DashboardHeader({
  title = 'Dashboard',
  userName = 'Super Administrator',
  userRole = 'Super Admin',
  onLogout,
  onMenuToggle,
}) {
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Real unread count from DB — works for both admin and resident
  // since getNotifications is scoped to auth.uid()
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (showConfirm && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [showConfirm]);

  const handleOpen    = () => setShowConfirm(true);
  const handleClose   = () => setShowConfirm(false);

  const handleConfirm = async () => {
    try {
      await onLogout?.();
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <header className="h-16 lg:h-21 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Open menu"
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-700" />
          </button>
        )}
        <h1 className="text-2xl lg:text-4xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="text-right leading-tight select-none hidden sm:block">
          <div className="font-semibold">{userName}</div>
          <div className="text-xs text-gray-500">{userRole}</div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="View Notifications"
            title="Notifications"
            className={`
              inline-flex items-center justify-center
              w-9 h-9
              rounded-md
              hover:text-red-600
              focus:outline-none
              transition-colors
              ${showNotifications ? 'bg-gray-100 text-[#005F02]' : 'text-gray-700'}
            `}
          >
            <FiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <button
          type="button"
          onClick={handleOpen}
          aria-label="Log Out"
          title="Log Out"
          className="
            inline-flex items-center justify-center
            w-9 h-9
            rounded-md
            hover:text-red-600
            focus:outline-none
            transition-colors
          "
        >
          <FiLogOut className="w-6 h-6" />
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleClose}
          initialFocusRef={cancelBtnRef}
        />
      )}
    </header>
  );
}


function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  initialFocusRef,
}) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const panelRef = useRef(null);
  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onCancel?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={onBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        className="relative bg-white w-[90%] max-w-sm rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-150"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onCancel}
            className="px-4 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 h-9 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}