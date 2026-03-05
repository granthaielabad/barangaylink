// ─────────────────────────────────────────────────────────────
// Global UI state: sidebar open/close, toast queue, active modal.
// Keeps layout state out of individual page components.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUiStore = create(
  devtools(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'toggleSidebar'),
      closeSidebar: () => set({ sidebarOpen: false }, false, 'closeSidebar'),
    }),
    { name: 'ui-store' }
  )
);