import { useState, useMemo } from 'react';
import { FiCheckSquare } from 'react-icons/fi';
import NotificationItem from './NotificationItem';
import { SearchBox, TabSwitcher } from '../../../../shared';
import { useNotifications, useMutateNotifications } from '../../../../hooks/queries/notifications/useNotifications';

const NotificationListContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab,   setActiveTab]   = useState('all');

  const { data: notifications = [], isLoading } = useNotifications();
  const { markAllRead } = useMutateNotifications();

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesSearch =
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === 'all'    ? true :
        activeTab === 'read'   ? notif.isRead :
        activeTab === 'unread' ? !notif.isRead :
        true;

      return matchesSearch && matchesTab;
    });
  }, [notifications, searchQuery, activeTab]);

  const tabs = [
    { key: 'all',    label: 'All',    count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter((n) => !n.isRead).length },
    { key: 'read',   label: 'Read',   count: notifications.filter((n) => n.isRead).length },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-10 mb-8">
      <h1 className="text-[25px] font-bold mb-10 text-gray-900">Notifications</h1>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search"
        />

        <button
          onClick={handleMarkAllAsRead}
          disabled={markAllRead.isPending}
          className="flex items-center gap-2 text-white bg-[#005F02] font-semibold text-lg transition-colors px-4 py-2 hover:bg-[#004A01] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiCheckSquare className="w-6 h-6" />
          Mark all as read
        </button>
      </div>

      <TabSwitcher
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-[#005F02] border-t-transparent rounded-full" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <NotificationItem
              key={`${notif.id}-${notif.isRead}`}
              notification={notif}
              variant="full"
            />
          ))
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <h3 className="text-xl font-bold text-gray-400">No notifications found</h3>
            <p className="text-gray-400">Try adjusting your search or tab</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationListContent;