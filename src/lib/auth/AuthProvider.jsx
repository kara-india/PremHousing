import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { AuthContext } from './AuthContext';
import { getTrustedStaffRole } from '../authUtils';

const SESSION_INIT_TIMEOUT_MS = 10000;

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    let receivedAuthEvent = false;
    const timeoutId = window.setTimeout(() => {
      if (active && !receivedAuthEvent) {
        setSession(null);
        setLoading(false);
      }
    }, SESSION_INIT_TIMEOUT_MS);
    const finishLoading = () => {
      window.clearTimeout(timeoutId);
      setLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (!active) return;
      setSession(nextSession);
      finishLoading();
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || receivedAuthEvent) return;
      setSession(error ? null : data.session);
      finishLoading();
    }).catch(() => {
      if (active && !receivedAuthEvent) {
        setSession(null);
        finishLoading();
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const role = getTrustedStaffRole(session?.user);
  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    role,
    isStaff: role === 'staff' || role === 'admin',
    isAdmin: role === 'admin',
    loading,
    async signOut() {
      if (!supabase) return { error: new Error('Supabase is not configured.') };
      return supabase.auth.signOut();
    },
  }), [loading, role, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
