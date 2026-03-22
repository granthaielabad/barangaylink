import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../../../services/supabase/client';
import {
  getDocumentRequests,
  getDocumentRequestStats,
  updateDocumentRequestStatus,
  setDocumentUrl,
  submitDocumentRequest,
  getMyDocumentRequests,
  updatePaymentMethod,
} from '../../../services/supabase/documentRequestService';
import toast from 'react-hot-toast';

// ── Query keys ────────────────────────────────────────────────────────────────
export const docReqKeys = {
  all:   ['document-requests'],
  lists: ()  => ['document-requests', 'list'],
  list:  (f) => ['document-requests', 'list', f],
  stats: ()  => ['document-requests', 'stats'],
  mine:  ()  => ['document-requests', 'mine'],
};

// ── ADMIN: paginated list ─────────────────────────────────────────────────────
export function useDocumentRequests({
  page = 1, pageSize = 8, search = '',
  status = 'all', sortBy = 'requested_at', order = 'desc',
} = {}) {
  const params = { page, pageSize, search, status, sortBy, order };
  return useQuery({
    queryKey:        docReqKeys.list(params),
    queryFn:         () => getDocumentRequests(params),
    placeholderData: (prev) => prev,
    staleTime:       1000 * 15,
  });
}

// ── ADMIN: stats ──────────────────────────────────────────────────────────────
export function useDocumentRequestStats() {
  return useQuery({
    queryKey: docReqKeys.stats(),
    queryFn:  getDocumentRequestStats,
    staleTime: 1000 * 30,
  });
}

// ── ADMIN: mutations ──────────────────────────────────────────────────────────
export function useMutateDocumentRequest() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: docReqKeys.all });

  const process = useMutation({
    mutationFn: ({ id, adminNotes }) =>
      updateDocumentRequestStatus(id, 'processing', adminNotes),
    onSuccess: () => { invalidate(); toast.success('Request set to Processing.'); },
    onError:   (err) => toast.error(err.message),
  });

  const approve = useMutation({
    mutationFn: ({ id, adminNotes }) =>
      updateDocumentRequestStatus(id, 'released', adminNotes),
    onSuccess: () => { invalidate(); toast.success('Request approved and released.'); },
    onError:   (err) => toast.error(err.message),
  });

  const reject = useMutation({
    mutationFn: ({ id, adminNotes }) =>
      updateDocumentRequestStatus(id, 'rejected', adminNotes),
    onSuccess: () => { invalidate(); toast.success('Request rejected.'); },
    onError:   (err) => toast.error(err.message),
  });

  const markReady = useMutation({
    mutationFn: ({ id, documentUrl, orNumber }) =>
      setDocumentUrl(id, documentUrl, orNumber),
    onSuccess: () => { invalidate(); toast.success('Document ready for pickup.'); },
    onError:   (err) => toast.error(err.message),
  });

  return { process, approve, reject, markReady };
}

// ── RESIDENT: own request history with Realtime ───────────────────────────────
export function useMyDocumentRequests() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('my-doc-requests-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'document_requests',
      }, () => {
        qc.invalidateQueries({ queryKey: docReqKeys.mine() });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: docReqKeys.mine(),
    queryFn:  getMyDocumentRequests,
    staleTime: 1000 * 30,
  });
}

// ── RESIDENT: submit request ──────────────────────────────────────────────────
export function useSubmitDocumentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitDocumentRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docReqKeys.mine() });
      toast.success('Document request submitted successfully!');
    },
    onError: (err) => toast.error(err.message ?? 'Failed to submit request.'),
  });
}

// ── RESIDENT: confirm payment ─────────────────────────────────────────────────
export function useUpdatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod }) => updatePaymentMethod(id, paymentMethod),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docReqKeys.mine() });
      toast.success('Payment confirmed. Your request is now being processed.');
    },
    onError: (err) => toast.error(err.message ?? 'Failed to confirm payment.'),
  });
}