import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';

export const sitioKeys = {
  all: ['sitios'],
};

export async function getSitios() {
  const { data, error } = await supabase
    .from('puroks')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(s => ({
    value: s.id,
    label: s.name
  }));
}

export function useSitios() {
  return useQuery({
    queryKey: sitioKeys.all,
    queryFn: getSitios,
    staleTime: 1000 * 60 * 60, // 1 hour (sitios rarely change)
  });
}
