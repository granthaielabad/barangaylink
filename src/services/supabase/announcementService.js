import { supabase } from './client';

/**
 * Fetch announcements from the community (BarangayEase bridge).
 */
export async function getCommunityAnnouncements() {
  const { data, error } = await supabase.rpc('get_community_announcements');
  if (error) throw error;
  return data ?? [];
}
