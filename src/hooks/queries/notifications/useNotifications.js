import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../../services/supabase/notificationService';
import toast from 'react-hot-toast';

export const notificationKeys = {
  all: ['notifications'],
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: getNotifications,
  });
}

export function useMutateNotifications() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id) => markAsRead(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message),
  });

  const markAllRead = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      invalidate();
      toast.success('Marked all as read');
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message),
  });

  return { markRead, markAllRead, remove };
}
