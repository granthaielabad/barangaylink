import NotificationListContent from '../components/Notifications/NotificationListContent';
import { residentNotifications } from '../data/notificationsData';

const ResidentNotificationPage = () => {
  return (
    <div className="max-w-full mx-6">
      <NotificationListContent initialNotifications={residentNotifications} />
    </div>
  );
};

export default ResidentNotificationPage;
