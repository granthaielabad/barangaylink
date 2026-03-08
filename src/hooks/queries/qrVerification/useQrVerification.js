import { useMutation, useQuery } from '@tanstack/react-query';
import { verifyQrToken } from '../../../services/supabase/eidService';
import { supabase } from '../../../services/supabase/client';
import toast from 'react-hot-toast';

/**
 * Verify a QR token (scan or manual entry).
 * Returns { result, eid, resident } on success.
 */
export function useVerifyQr() {
  return useMutation({
    mutationFn: ({ token, method }) => verifyQrToken({ token, method }),
    onError: (err) => toast.error(`Verification failed: ${err.message}`),
  });
}

/**
 * Fetch recent QR verification history for the current session.
 */
export function useQrHistory(limit = 20) {
  return useQuery({
    queryKey: ['qr-verifications', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_verifications')
        .select(`
          id, result, verified_at, verification_method,
          electronic_ids (
            eid_number,
            residents ( resident_no, first_name, last_name )
          )
        `)
        .order('verified_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 15, // Re-fetch every 15s so history stays fresh
  });
}