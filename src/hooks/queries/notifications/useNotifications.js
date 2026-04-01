import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../../services/supabase/notificationService';
import toast from 'react-hot-toast';

export const notificationKeys = {
  all: ['notifications'],
};

export function useNotifications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn:  getNotifications,
    staleTime: 1000 * 30,
  });

  // Supabase Realtime: invalidate whenever a notification row changes for this user
  useEffect(() => {
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'barangaylink', table: 'notifications' },
        () => {
          qc.invalidateQueries({ queryKey: notificationKeys.all });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return query;
}

export function useMutateNotifications() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id) => markAsRead(id),
    // Optimistic update: flip is_read immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData(notificationKeys.all);
      qc.setQueryData(notificationKeys.all, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(notificationKeys.all, ctx.prev);
      toast.error('Failed to mark as read.');
    },
    onSettled: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: markAllAsRead,
    // Optimistic update: mark all read immediately
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData(notificationKeys.all);
      qc.setQueryData(notificationKeys.all, (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(notificationKeys.all, ctx.prev);
      toast.error('Failed to mark all as read.');
    },
    onSuccess: () => toast.success('Marked all as read'),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData(notificationKeys.all);
      qc.setQueryData(notificationKeys.all, (old = []) =>
        old.filter((n) => n.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(notificationKeys.all, ctx.prev);
      toast.error('Failed to delete notification.');
    },
    onSettled: invalidate,
  });

  return { markRead, markAllRead, remove };
}