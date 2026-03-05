// ─────────────────────────────────────────────────────────────
// Global filter, sort, and pagination state via Zustand.
// Persists across route changes within the dashboard session.
// SearchBox, SortFilter, StatusFilter, and Pagination components
// all read from / write to this store.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const defaultFilters = {
  search: '',
  status: 'all',
  sortBy: 'created_at',
  order: 'desc',
  page: 1,
  pageSize: 8,
};

/**
 * Create a scoped filter slice for a given feature (e.g., 'residents').
 * This factory pattern keeps each table's filters independent.
 */
const createFilterSlice = (featureName) => (set, get) => ({
  ...defaultFilters,

  setSearch: (search) =>
    set({ search, page: 1 }, false, `${featureName}/setSearch`),

  setStatus: (status) =>
    set({ status, page: 1 }, false, `${featureName}/setStatus`),

  setSortBy: (sortBy) =>
    set({ sortBy, page: 1 }, false, `${featureName}/setSortBy`),

  setOrder: (order) =>
    set({ order, page: 1 }, false, `${featureName}/setOrder`),

  setPage: (page) =>
    set({ page }, false, `${featureName}/setPage`),

  reset: () =>
    set(defaultFilters, false, `${featureName}/reset`),

  /** Returns a plain params object suitable for passing to a service fn */
  getParams: () => {
    const { search, status, sortBy, order, page, pageSize } = get();
    return { search, status, sortBy, order, page, pageSize };
  },
});

export const useResidentFilters = create(
  devtools(createFilterSlice('residents'), { name: 'resident-filters' })
);

export const useHouseholdFilters = create(
  devtools(createFilterSlice('households'), { name: 'household-filters' })
);

export const useEidFilters = create(
  devtools(createFilterSlice('eid'), { name: 'eid-filters' })
);

export const useDocumentRequestFilters = create(
  devtools(createFilterSlice('document-requests'), { name: 'document-request-filters' })
);