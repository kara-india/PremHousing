import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import RequireAuth from './lib/auth/RequireAuth.jsx';

const AdminDashboard = lazy(() => import('./components/sections/AdminDashboard.jsx'));
const PropertyDetailPage = lazy(() => import('./components/sections/PropertyDetailPage.jsx'));
const AuthPage = lazy(() => import('./components/sections/AuthPage.jsx'));
const OnboardingPage = lazy(() => import('./components/sections/OnboardingPage.jsx'));
const LocalityInsightsPage = lazy(() => import('./components/sections/LocalityInsightsPage.jsx'));

function AppRoutes() {
  return (
    <Suspense fallback={<main aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#26382f', font: '600 12px sans-serif' }}>Loading PREM…</main>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/insights" element={<LocalityInsightsPage />} />
        <Route path="/admin" element={<RequireAuth staffOnly><AdminDashboard /></RequireAuth>} />
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
