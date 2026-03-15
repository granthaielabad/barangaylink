import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfiles, getProfileRoleCounts,
  updateProfileRole, toggleProfileActive, deleteProfile,
} from '../../../services/supabase/profileService';
import toast from 'react-hot-toast';

const profileKeys = {
  all:    ['profiles'],
  lists:  ()  => [...profileKeys.all, 'list'],
  list:   (f) => [...profileKeys.lists(), f],
  counts: ()  => [...profileKeys.all, 'counts'],
};

export function useProfiles({
  page = 1, pageSize = 8, search = '',
  role = 'all', status = 'all', sortBy = 'created_at', order = 'desc',
} = {}) {
  const params = { page, pageSize, search, role, status, sortBy, order };
  return useQuery({
    queryKey:       profileKeys.list(params),
    queryFn:        () => getProfiles(params),
    placeholderData: (prev) => prev,
    staleTime:      1000 * 30,
  });
}

/** Separate query for accurate role tab counts across ALL users. */
export function useProfileRoleCounts() {
  return useQuery({
    queryKey: profileKeys.counts(),
    queryFn:  getProfileRoleCounts,
    staleTime: 1000 * 60,
  });
}

export function useMutateProfile() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: profileKeys.all });

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => updateProfileRole(id, role),
    onSuccess:  () => { invalidate(); toast.success('Role updated.'); },
    onError:    (err) => toast.error(`Failed to update role: ${err.message}`),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => toggleProfileActive(id, isActive),
    onSuccess:  (_, { isActive }) => {
      invalidate();
      toast.success(isActive ? 'User account enabled.' : 'User account disabled.');
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: deleteProfile,
    onSuccess:  () => { invalidate(); toast.success('User removed.'); },
    onError:    (err) => toast.error(err.message),
  });

  return { changeRole, toggleActive, remove };
}