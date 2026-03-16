import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyResidentProfile,
  getMyEid,
  getMyHousehold,
  getMyEidApplication,
  submitEidApplication,
  submitEidRenewal,
} from '../../../services/supabase/residentPortalService';
import toast from 'react-hot-toast';

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

export function useMyEidApplication() {
  return useQuery({
    queryKey: ['resident-portal', 'eid-application'],
    queryFn:  getMyEidApplication,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmitEidApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitEidApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resident-portal', 'eid-application'] });
      qc.invalidateQueries({ queryKey: ['resident-portal', 'eid'] });
      toast.success('eID application submitted successfully!');
    },
    onError: (err) => toast.error(err.message ?? 'Failed to submit application.'),
  });
}

export function useSubmitEidRenewal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitEidRenewal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resident-portal', 'eid-application'] });
      qc.invalidateQueries({ queryKey: ['resident-portal', 'eid'] });
      toast.success('eID renewal submitted successfully!');
    },
    onError: (err) => toast.error(err.message ?? 'Failed to submit renewal.'),
  });
}