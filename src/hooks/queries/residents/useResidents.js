import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentKeys } from './queryKeys';
import {
  getResidents, getResidentById, createResident,
  updateResident, archiveResident, deactivateResident,
  activateResident, deleteResident,
} from '../../../services/supabase/residentService';
import { useResidentFilters } from '../../../store/filterStore';
import toast from 'react-hot-toast';

export function useResidents() {
  // ── Select each primitive individually — never return a new object
  // from a Zustand selector or useSyncExternalStore will infinite-loop.
  const search   = useResidentFilters((s) => s.search);
  const status   = useResidentFilters((s) => s.status);
  const sortBy   = useResidentFilters((s) => s.sortBy);
  const order    = useResidentFilters((s) => s.order);
  const page     = useResidentFilters((s) => s.page);
  const pageSize = useResidentFilters((s) => s.pageSize);

  const params = { search, status, sortBy, order, page, pageSize };

  return useQuery({
    queryKey: residentKeys.list(params),
    queryFn: () => getResidents(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });
}

export function useResident(id) {
  return useQuery({
    queryKey: residentKeys.detail(id),
    queryFn: () => getResidentById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useMutateResident() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: residentKeys.lists() });

  const create = useMutation({
    mutationFn: createResident,
    onSuccess: () => { invalidate(); toast.success('Resident created.'); },
    onError: (err) => toast.error(`Failed to create resident: ${err.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateResident(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: residentKeys.detail(data.id) });
      invalidate();
      toast.success('Resident updated.');
    },
    onError: (err) => toast.error(`Update failed: ${err.message}`),
  });

  const archive = useMutation({
    mutationFn: archiveResident,
    onSuccess: () => { invalidate(); toast.success('Resident archived.'); },
    onError: (err) => toast.error(err.message),
  });

  const deactivate = useMutation({
    mutationFn: deactivateResident,
    onSuccess: () => { invalidate(); toast.success('Resident deactivated.'); },
    onError: (err) => toast.error(err.message),
  });

  const activate = useMutation({
    mutationFn: activateResident,
    onSuccess: () => { invalidate(); toast.success('Resident activated.'); },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: deleteResident,
    onSuccess: () => { invalidate(); toast.success('Resident deleted.'); },
    onError: (err) => toast.error(`Delete failed: ${err.message}`),
  });

  return { create, update, archive, deactivate, activate, remove };
}