import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEids, getEidById, issueEid,
  revokeEid, suspendEid, reactivateEid,
  deleteEid, getEidStats,
} from '../../../services/supabase/eidService';
import { useEidFilters } from '../../../store/filterStore';
import toast from 'react-hot-toast';

export const eidKeys = {
  all: ['eids'],
  lists: () => [...eidKeys.all, 'list'],
  list: (f) => [...eidKeys.lists(), f],
  stats: () => [...eidKeys.all, 'stats'],
  detail: (id) => [...eidKeys.all, 'detail', id],
};

export function useEids() {
  // ── Select each primitive individually to avoid infinite loop
  const search   = useEidFilters((s) => s.search);
  const status   = useEidFilters((s) => s.status);
  const sortBy   = useEidFilters((s) => s.sortBy);
  const order    = useEidFilters((s) => s.order);
  const page     = useEidFilters((s) => s.page);
  const pageSize = useEidFilters((s) => s.pageSize);

  const params = { search, status, sortBy, order, page, pageSize };

  return useQuery({
    queryKey: eidKeys.list(params),
    queryFn: () => getEids(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });
}

export function useEidStats() {
  return useQuery({
    queryKey: eidKeys.stats(),
    queryFn: getEidStats,
    staleTime: 1000 * 60,
  });
}

export function useEid(id) {
  return useQuery({
    queryKey: eidKeys.detail(id),
    queryFn: () => getEidById(id),
    enabled: !!id,
  });
}

export function useMutateEid() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: eidKeys.lists() });
    qc.invalidateQueries({ queryKey: eidKeys.stats() });
  };

  const issue = useMutation({
    mutationFn: issueEid,
    onSuccess: () => { invalidate(); toast.success('eID issued successfully.'); },
    onError: (err) => toast.error(`Failed to issue eID: ${err.message}`),
  });

  const revoke = useMutation({
    mutationFn: revokeEid,
    onSuccess: () => { invalidate(); toast.success('eID revoked.'); },
    onError: (err) => toast.error(err.message),
  });

  const suspend = useMutation({
    mutationFn: suspendEid,
    onSuccess: () => { invalidate(); toast.success('eID suspended.'); },
    onError: (err) => toast.error(err.message),
  });

  const reactivate = useMutation({
    mutationFn: reactivateEid,
    onSuccess: () => { invalidate(); toast.success('eID reactivated.'); },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: deleteEid,
    onSuccess: () => { invalidate(); toast.success('eID deleted.'); },
    onError: (err) => toast.error(`Delete failed: ${err.message}`),
  });

  return { issue, revoke, suspend, reactivate, remove };
}