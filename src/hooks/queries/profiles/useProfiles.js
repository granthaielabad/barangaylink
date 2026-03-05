import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfiles, updateProfileRole, deactivateProfile, deleteProfile,
} from '../../../services/supabase/profileService';
import toast from 'react-hot-toast';

const profileKeys = {
  all: ['profiles'],
  lists: () => [...profileKeys.all, 'list'],
  list: (f) => [...profileKeys.lists(), f],
};

export function useProfiles({ page = 1, pageSize = 8, search = '', role = 'all', sortBy = 'created_at', order = 'desc' } = {}) {
  const params = { page, pageSize, search, role, sortBy, order };
  return useQuery({
    queryKey: profileKeys.list(params),
    queryFn: () => getProfiles(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });
}

export function useMutateProfile() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: profileKeys.lists() });

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => updateProfileRole(id, role),
    onSuccess: () => { invalidate(); toast.success('Role updated.'); },
    onError: (err) => toast.error(`Failed to update role: ${err.message}`),
  });

  const deactivate = useMutation({
    mutationFn: deactivateProfile,
    onSuccess: () => { invalidate(); toast.success('User deactivated.'); },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => { invalidate(); toast.success('User removed.'); },
    onError: (err) => toast.error(err.message),
  });

  return { changeRole, deactivate, remove };
}