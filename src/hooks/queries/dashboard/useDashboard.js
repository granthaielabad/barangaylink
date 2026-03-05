import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRecentResidents,
  getRecentActivity,
} from '../../../services/supabase/dashboardService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 1 minute — stats don't need real-time updates
  });
}

export function useRecentResidents() {
  return useQuery({
    queryKey: ['dashboard', 'recent-residents'],
    queryFn: () => getRecentResidents(5),
    staleTime: 1000 * 60,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => getRecentActivity(5),
    staleTime: 1000 * 30,
  });
}