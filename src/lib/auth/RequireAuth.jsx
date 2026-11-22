import { Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from './useAuth.js';

function RequireAuth({ children, staffOnly = false }) {
  const location = useLocation();
  const { session, loading, isStaff, signOut } = useAuth();

  // Preserve the route's existing setup message when Auth has not been configured.
  if (!supabase) return children;

  if (loading) {
    return <main className="auth-shell" aria-live="polite"><section className="auth-card"><p className="auth-eyebrow">PREM ACCOUNT</p><h1>Checking your session</h1><div className="auth-spinner" aria-hidden="true" /></section></main>;
  }

  if (!session) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace state={{ from: location }} />;
  }

  if (staffOnly && !isStaff) {
    return (
      <main className="auth-shell">
        <section className="auth-card" role="alert">
          <p className="auth-eyebrow">STAFF ACCESS</p>
          <h1>Staff role required</h1>
          <p className="auth-subtitle">This account does not have a trusted PREM staff role.</p>
          <button className="auth-secondary" type="button" onClick={() => signOut()}>Sign out</button>
          <Link className="auth-back" to="/">Back to PREM</Link>
        </section>
      </main>
    );
  }

  return children;
}

export default RequireAuth;
