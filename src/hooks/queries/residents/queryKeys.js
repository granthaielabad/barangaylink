// Centralised query key factory — prevents typos and allows precise invalidation
export const residentKeys = {
  all: ['residents'],
  lists: () => [...residentKeys.all, 'list'],
  list: (filters) => [...residentKeys.lists(), filters],
  details: () => [...residentKeys.all, 'detail'],
  detail: (id) => [...residentKeys.details(), id],
};