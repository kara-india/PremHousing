import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import RequireAuth from './lib/auth/RequireAuth.jsx';

const AdminDashboard = lazy(() => import('./components/sections/AdminDashboard.jsx'));
const PropertyDetailPage = lazy(() => import('./components/sections/PropertyDetailPage.jsx'));
const AuthPage = lazy(() => import('./components/sections/AuthPage.jsx'));
const OnboardingPage = lazy(() => import('./components/sections/OnboardingPage.jsx'));
const LocalityInsightsPage = lazy(() => import('./components/sections/LocalityInsightsPage.jsx'));
const BrokerListingsPage = lazy(() => import('./components/sections/BrokerListingsPage.jsx'));
const phase2ReviewEnabled = import.meta.env.VITE_ENABLE_PHASE2_REVIEW === 'true';

function Phase2Unavailable() {
  return <main className="auth-shell"><section className="auth-card"><p className="auth-eyebrow">BROKER LISTINGS</p><h1>Workspace not enabled</h1><p className="auth-subtitle">PREM is preparing the broker listing workspace for this deployment.</p><Link className="auth-back" to="/account">Back to your account</Link></section></main>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<main aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#26382f', font: '600 12px sans-serif' }}>Loading PREM…</main>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/insights" element={<LocalityInsightsPage />} />
        <Route path="/admin" element={<RequireAuth staffOnly><AdminDashboard /></RequireAuth>} />
        <Route path="/broker/listings" element={phase2ReviewEnabled ? <RequireAuth><BrokerListingsPage /></RequireAuth> : <Phase2Unavailable />} />
        <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<AuthPage />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
        <Route path="*" element={<App />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
