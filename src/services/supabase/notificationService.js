import { supabase } from './client';

// ── Relative timestamp formatter ──────────────────────────────────────────────
// Converts a DB timestamp string → "2 mins ago", "3 hrs ago", "Mar 12, 4:21 PM"
export function formatTimestamp(isoString) {
  if (!isoString) return '';
  const now  = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)           return 'Just now';
  if (diff < 3600)         return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  if (diff < 86400 * 2)    return 'Yesterday';

  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function toNotification(row) {
  return {
    id:         row.id,
    type:       row.type,
    message:    row.message,
    timestamp:  formatTimestamp(row.created_at),
    attachment: row.attachment ?? null,
    isRead:     row.is_read,
    metadata:   row.metadata ?? {},
    created_at: row.created_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toNotification);
}

export async function markAsRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toNotification(data);
}

export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(id) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}