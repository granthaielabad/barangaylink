import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHouseholds, getHouseholdById, createHousehold,
  updateHousehold, archiveHousehold, deleteHousehold,
  assignMemberToHousehold, removeMemberFromHousehold,
} from '../../../services/supabase/householdService';
import { useHouseholdFilters } from '../../../store/filterStore';
import toast from 'react-hot-toast';

export const householdKeys = {
  all: ['households'],
  lists: () => [...householdKeys.all, 'list'],
  list: (f) => [...householdKeys.lists(), f],
  detail: (id) => [...householdKeys.all, 'detail', id],
};

export function useHouseholds() {
  // ── Select each primitive individually to avoid infinite loop
  const search   = useHouseholdFilters((s) => s.search);
  const status   = useHouseholdFilters((s) => s.status);
  const sortBy   = useHouseholdFilters((s) => s.sortBy);
  const order    = useHouseholdFilters((s) => s.order);
  const page     = useHouseholdFilters((s) => s.page);
  const pageSize = useHouseholdFilters((s) => s.pageSize);

  const params = { search, status, sortBy, order, page, pageSize };

  return useQuery({
    queryKey: householdKeys.list(params),
    queryFn: () => getHouseholds(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });
}

export function useHousehold(id) {
  return useQuery({
    queryKey: householdKeys.detail(id),
    queryFn: () => getHouseholdById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useMutateHousehold() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: householdKeys.lists() });

  const create = useMutation({
    mutationFn: createHousehold,
    onSuccess: () => { invalidate(); toast.success('Household created.'); },
    onError: (err) => toast.error(`Failed to create household: ${err.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateHousehold(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: householdKeys.detail(data.id) });
      invalidate();
      toast.success('Household updated.');
    },
    onError: (err) => toast.error(`Update failed: ${err.message}`),
  });

  const archive = useMutation({
    mutationFn: archiveHousehold,
    onSuccess: () => { invalidate(); toast.success('Household archived.'); },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: deleteHousehold,
    onSuccess: () => { invalidate(); toast.success('Household deleted.'); },
    onError: (err) => toast.error(`Delete failed: ${err.message}`),
  });

  const assignMember = useMutation({
    mutationFn: ({ residentId, householdId }) => assignMemberToHousehold(residentId, householdId),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['residents'] }); },
    onError: (err) => toast.error(`Failed to assign member: ${err.message}`),
  });

  const removeMember = useMutation({
    mutationFn: (residentId) => removeMemberFromHousehold(residentId),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['residents'] }); },
    onError: (err) => toast.error(`Failed to remove member: ${err.message}`),
  });

  return { create, update, archive, remove, assignMember, removeMember };
}