import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth/useAuth.js';
import './AuthPage.css';

function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user?.id;
  const trustedRole = session?.user?.app_metadata?.role;
  const metadataName = session?.user?.user_metadata?.full_name;
  const [account, setAccount] = useState(null);
  const [accountType, setAccountType] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) {
      navigate('/auth?next=%2Fonboarding', { replace: true });
      return undefined;
    }
    if (!supabase) return undefined;
    let active = true;

    async function loadAccount() {
      if (trustedRole === 'admin' || trustedRole === 'staff') {
        navigate('/admin', { replace: true });
        return;
      }
      const { data, error: accountError } = await supabase
        .from('prem_accounts')
        .select('user_id,account_type,display_name,onboarding_status,broker_approval_status')
        .eq('user_id', userId)
        .maybeSingle();
      if (!active) return;
      if (accountError) {
        setError('PREM account setup is not ready yet. Your sign-in succeeded, but the secure account profile table or its access policy is not available.');
        setBusy(false);
        return;
      }
      if (data?.onboarding_status === 'complete' && !isAccountPage) {
        navigate('/account', { replace: true });
      }
      setAccount(data ?? null);
      setAccountType(data?.account_type ?? '');
      setDisplayName(data?.display_name ?? metadataName ?? '');
      setBusy(false);
    }

    loadAccount().catch(() => {
      if (active) {
        setError('Could not load your PREM account. Please refresh and try again.');
        setBusy(false);
      }
    });
    return () => { active = false; };
  }, [authLoading, isAccountPage, metadataName, navigate, trustedRole, userId]);

  async function saveProfile(complete) {
    if (!supabase || !session || (!account && !accountType)) {
      setError('Choose whether you are here as a customer or broker.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      user_id: session.user.id,
      account_type: account?.account_type ?? accountType,
      display_name: displayName.trim() || null,
      onboarding_status: complete ? 'complete' : 'incomplete',
    };
    let result;
    if (account) {
      result = await supabase.from('prem_accounts')
        .update({ display_name: payload.display_name, onboarding_status: payload.onboarding_status })
        .eq('user_id', session.user.id)
        .select('user_id')
        .maybeSingle();
    } else {
      result = await supabase.from('prem_accounts').insert({
        user_id: payload.user_id,
        account_type: payload.account_type,
        display_name: payload.display_name,
      }).select('user_id').single();
      if (!result.error && complete) {
        result = await supabase.from('prem_accounts')
          .update({ onboarding_status: 'complete' })
          .eq('user_id', session.user.id)
          .select('user_id')
          .maybeSingle();
      }
    }
    setSaving(false);
    if (result.error || !result.data) {
      setError('We could not save your account details. PREM account setup may still be pending; your login remains safe.');
      return;
    }
    if (!complete) {
      setNotice('Your account type is saved. You can complete your profile later from your PREM account.');
      setAccount({ ...payload, broker_approval_status: payload.account_type === 'broker' ? 'pending' : 'not_required' });
      return;
    }
    navigate('/account', { replace: true });
  }

  async function signOut() {
    await supabase?.auth.signOut();
    navigate('/', { replace: true });
  }

  if (!supabase) return <main className="auth-shell"><section className="auth-card"><p className="auth-eyebrow">PREM ACCOUNT</p><h1>Account setup needed</h1><p>Set the Supabase project URL and publishable key before using PREM accounts.</p><Link className="auth-back" to="/"><ArrowLeft size={15} /> Back to PREM</Link></section></main>;

  if (busy) return <main className="auth-shell"><section className="auth-card" aria-live="polite"><p className="auth-eyebrow">PREM ACCOUNT</p><h1>Preparing your account</h1><div className="auth-spinner" aria-hidden="true" /></section></main>;

  return (
    <main className="auth-shell">
      <section className="auth-card auth-onboarding-card">
        <Link className="auth-brand" to="/">PREM<span>.</span></Link>
        <p className="auth-eyebrow">A FEW QUICK DETAILS</p>
        <h1>{account ? 'Complete your profile' : 'How will you use PREM?'}</h1>
        <p className="auth-subtitle">Choose your account type and add your name. You can finish optional profile details later.</p>
        {!account && <fieldset className="account-type-options">
          <legend>I'm here as a</legend>
          <label className={accountType === 'customer' ? 'selected' : ''}><input type="radio" name="account-type" value="customer" checked={accountType === 'customer'} onChange={(event) => setAccountType(event.target.value)} /><span><strong>Customer</strong><small>Explore homes and share property requirements.</small></span></label>
          <label className={accountType === 'broker' ? 'selected' : ''}><input type="radio" name="account-type" value="broker" checked={accountType === 'broker'} onChange={(event) => setAccountType(event.target.value)} /><span><strong>Broker</strong><small>Submit listings for PREM review and publication.</small></span></label>
        </fieldset>}
        {account && <p className="auth-account-type">Account type <strong>{account.account_type === 'broker' ? 'Broker' : 'Customer'}</strong></p>}
        {account?.account_type === 'broker' && <p className="auth-notice">Broker listing access is enabled after PREM staff reviews and approves your organization.</p>}
        <label className="auth-label">Name (optional for now)<input type="text" autoComplete="name" maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
        <p className="auth-account-email">Signed in as <strong>{session?.user?.email ?? session?.user?.phone}</strong></p>
        {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
        {error.includes('profile table') ? <Link className="auth-primary auth-as-link" to="/">Continue browsing <ArrowRight size={16} /></Link> : <div className="auth-actions"><button className="auth-primary" type="button" disabled={saving || !account && !accountType} onClick={() => saveProfile(true)}>{saving ? 'Saving…' : 'Save and continue'} <ArrowRight size={16} /></button><button className="auth-secondary" type="button" disabled={saving || !account && !accountType} onClick={() => saveProfile(false)}>Complete later</button></div>}
        <button className="auth-link-button" type="button" onClick={signOut}><LogOut size={14} /> Sign out</button>
        <Link className="auth-back" to="/"><ArrowLeft size={15} /> Back to PREM</Link>
      </section>
    </main>
  );
}

export default OnboardingPage;
