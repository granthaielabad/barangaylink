import { useQuery } from '@tanstack/react-query';
import { getCommunityAnnouncements } from '../../../services/supabase/announcementService';

export const announcementKeys = {
  all: ['community-announcements'],
};

export function useCommunityAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.all,
    queryFn: getCommunityAnnouncements,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
