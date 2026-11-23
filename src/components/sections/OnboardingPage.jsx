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
  const brokerOrganizationsEnabled = import.meta.env.VITE_ENABLE_BROKER_ORGANIZATIONS === 'true';
  const phase2ReviewEnabled = import.meta.env.VITE_ENABLE_PHASE2_REVIEW === 'true';
  const [account, setAccount] = useState(null);
  const [brokerOrganization, setBrokerOrganization] = useState(null);
  const [accountType, setAccountType] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [mahareraNumber, setMahareraNumber] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
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
      if (data?.account_type === 'broker' && brokerOrganizationsEnabled) {
        const { data: organization, error: organizationError } = await supabase
          .from('prem_broker_organizations')
          .select('id,name,maharera_number,contact_email,contact_phone,review_status')
          .eq('created_by', userId)
          .maybeSingle();
        if (!active) return;
        if (organizationError) {
          setError('Your PREM account is ready, but broker registration is not available yet. You can try again later.');
        } else if (organization) {
          setBrokerOrganization(organization);
          setBrokerName(organization.name);
          setMahareraNumber(organization.maharera_number);
          setBrokerPhone(organization.contact_phone ?? '');
        }
      }
      setBusy(false);
    }

    loadAccount().catch(() => {
      if (active) {
        setError('Could not load your PREM account. Please refresh and try again.');
        setBusy(false);
      }
    });
    return () => { active = false; };
  }, [authLoading, brokerOrganizationsEnabled, isAccountPage, metadataName, navigate, trustedRole, userId]);

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

  async function registerBrokerOrganization(event) {
    event.preventDefault();
    if (!brokerOrganizationsEnabled || !supabase || !session || !account || account.account_type !== 'broker') return;
    if (mahareraNumber.trim().length < 4) {
      setError('Enter your MahaRERA registration number to submit your brokerage.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    const { data, error: registerError } = await supabase.rpc('prem_register_broker_organization', {
      p_name: brokerName.trim(),
      p_maharera_number: mahareraNumber.trim(),
      p_contact_email: session.user.email ?? null,
      p_contact_phone: brokerPhone.trim() || null,
    });
    if (registerError || !data) {
      setSaving(false);
      setError('We could not submit your brokerage for review. Confirm your details and try again.');
      return;
    }
    const { data: organization, error: loadError } = await supabase
      .from('prem_broker_organizations')
      .select('id,name,maharera_number,contact_email,contact_phone,review_status')
      .eq('id', data)
      .single();
    setSaving(false);
    if (loadError || !organization) {
      setError('Your application was submitted, but its status could not be loaded. Refresh this page to check it.');
      return;
    }
    setBrokerOrganization(organization);
    setNotice('Brokerage submitted. PREM will review it before listing access is enabled.');
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
        {account?.account_type === 'broker' && phase2ReviewEnabled && <Link className="auth-primary auth-as-link" to="/broker/listings">Open broker listings <ArrowRight size={16} /></Link>}
        {account?.account_type === 'broker' && brokerOrganizationsEnabled && <>
          <p className="auth-notice">Broker listing access is enabled after PREM staff reviews and approves your organization.</p>
          {brokerOrganization ? <p className="auth-account-type">Brokerage <strong>{brokerOrganization.name}</strong> · Review status <strong>{brokerOrganization.review_status}</strong></p> : <form className="auth-broker-registration" onSubmit={registerBrokerOrganization}>
            <label className="auth-label">Brokerage / agency name<input required minLength={2} maxLength={120} value={brokerName} onChange={(event) => setBrokerName(event.target.value)} /></label>
            <label className="auth-label">MahaRERA registration number<input required minLength={4} maxLength={100} autoComplete="off" value={mahareraNumber} onChange={(event) => setMahareraNumber(event.target.value)} /><small>PREM staff will verify this number before approving your brokerage.</small></label>
            <label className="auth-label">Business phone (optional, international format)<input type="tel" autoComplete="tel" pattern="^\+[1-9][0-9]{7,14}" placeholder="+919876543210" value={brokerPhone} onChange={(event) => setBrokerPhone(event.target.value)} /><small>Use + and country code if provided.</small></label>
            <button className="auth-secondary" type="submit" disabled={saving || !brokerName.trim()}>{saving ? 'Submitting…' : 'Submit brokerage for review'}</button>
          </form>}
        </>}
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
