import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getSession, getMyProfile, onAuthStateChange } from '../../services/supabase/authService';

/**
 * Call ONCE at the top of your app (App.jsx).
 * Bootstraps the session on mount and subscribes to auth changes.
 */
export function useAuthInit() {
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const clearAuth   = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await getSession();
        if (!mounted) return;
        if (session?.user) {
          const profile = await getMyProfile(session.user.id);
          hydrateAuth(session, profile);
        } else {
          clearAuth();
        }
      } catch {
        if (mounted) clearAuth();
      }
    })();

    const unsubscribe = onAuthStateChange(async (session) => {
      if (!mounted) return;
      if (session?.user) {
        try {
          const profile = await getMyProfile(session.user.id);
          hydrateAuth(session, profile);
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // ← empty deps: hydrateAuth/clearAuth are stable Zustand actions
}

/**
 * Consume auth state in any component.
 * Each value is selected individually so Zustand can do
 * stable reference-equality checks — no new object on every render.
 *
 * Usage: const { profile, isSuperadmin, isLoading } = useAuth();
 */
export function useAuth() {
  const session  = useAuthStore((s) => s.session);
  const profile  = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Derive role-based booleans from profile — these are primitives (bool/string/null)
  // so Zustand's equality check won't cause re-renders
  const role         = profile?.role ?? null;
  const isSuperadmin = role === 'superadmin';
  const isStaff      = role === 'staff';
  const isResident   = role === 'resident';
  const isAuthenticated = !!session;

  return { session, profile, isLoading, role, isSuperadmin, isStaff, isResident, isAuthenticated };
}