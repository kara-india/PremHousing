import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { AuthContext } from './AuthContext';
import { getTrustedStaffRole } from '../authUtils';

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    let receivedAuthEvent = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || receivedAuthEvent) return;
      setSession(error ? null : data.session);
      setLoading(false);
    }).catch(() => {
      if (active && !receivedAuthEvent) {
        setSession(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
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
