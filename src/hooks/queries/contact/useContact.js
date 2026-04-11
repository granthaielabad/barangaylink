import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  submitContactMessage, 
  getContactMessages, 
  updateMessageStatus 
} from '../../../services/supabase/contactService';
import { useInquiryFilters } from '../../../store/filterStore';

export const contactKeys = {
  all: ['contact-messages'],
  list: (params) => ['contact-messages', 'list', params],
};

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: submitContactMessage,
  });
}

export function useInquiryMessages() {
  const search   = useInquiryFilters((s) => s.search);
  const status   = useInquiryFilters((s) => s.status);
  const sortBy   = useInquiryFilters((s) => s.sortBy);
  const order    = useInquiryFilters((s) => s.order);
  const page     = useInquiryFilters((s) => s.page);
  const pageSize = useInquiryFilters((s) => s.pageSize);

  const params = { search, status, sortBy, order, page, pageSize };
  
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => getContactMessages(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useMutateInquiry() {
  const queryClient = useQueryClient();
  
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });

  return {
    updateStatus,
  };
}
