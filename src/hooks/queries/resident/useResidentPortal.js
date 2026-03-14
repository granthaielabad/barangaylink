// src/hooks/queries/resident/useResidentPortal.js
import { useQuery } from '@tanstack/react-query';
import {
  getMyResidentProfile,
  getMyEid,
  getMyHousehold,
} from '../../../services/supabase/residentPortalService';

const keys = {
  profile:   ['resident-portal', 'profile'],
  eid:       ['resident-portal', 'eid'],
  household: ['resident-portal', 'household'],
};

export function useMyResidentProfile() {
  return useQuery({
    queryKey: keys.profile,
    queryFn:  getMyResidentProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyEid() {
  return useQuery({
    queryKey: keys.eid,
    queryFn:  getMyEid,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyHousehold() {
  return useQuery({
    queryKey: keys.household,
    queryFn:  getMyHousehold,
    staleTime: 1000 * 60 * 5,
  });
}