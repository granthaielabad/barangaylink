// ─────────────────────────────────────────────────────────────
// Global authentication state via Zustand.
// Single source of truth for session, profile, and role.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    (set) => ({
      session: null,
      profile: null,
      isLoading: true, // true while we check the existing session on mount

      setSession: (session) => set({ session }, false, 'setSession'),

      setProfile: (profile) => set({ profile }, false, 'setProfile'),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      /**
       * Called after successful login.
       */
      hydrateAuth: (session, profile) =>
        set({ session, profile, isLoading: false }, false, 'hydrateAuth'),

      /**
       * Called after logout or session expiry.
       */
      clearAuth: () =>
        set({ session: null, profile: null, isLoading: false }, false, 'clearAuth'),

      // ── Derived helpers (accessed as store getters) ──────────
      get role() {
        return this.profile?.role ?? null;
      },
      get isSuperadmin() {
        return this.profile?.role === 'superadmin';
      },
      get isStaff() {
        return this.profile?.role === 'staff';
      },
      get isResident() {
        return this.profile?.role === 'resident';
      },
    }),
    { name: 'auth-store' }
  )
);