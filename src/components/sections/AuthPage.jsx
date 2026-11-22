import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Mail, Phone } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { setRememberMe, supabase } from '../../lib/supabase';
import { authErrorMessage, safeNextPath } from '../../lib/authUtils';
import { useAuth } from '../../lib/auth/useAuth.js';
import './AuthPage.css';

const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';
const phoneEnabled = import.meta.env.VITE_ENABLE_PHONE_AUTH === 'true';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const params = new URLSearchParams(location.search);
  const nextValue = params.get('next');
  const nextPath = safeNextPath(nextValue);
  const isRecovery = location.pathname === '/auth/reset-password';
  const [method, setMethod] = useState('email');
  const [emailMode, setEmailMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [callbackError, setCallbackError] = useState(false);

  useEffect(() => {
    if (location.pathname !== '/auth/callback' || !supabase) return undefined;
    let active = true;
    if (session) navigate(safeNextPath(nextValue), { replace: true });
    const timeout = window.setTimeout(() => { if (active) setCallbackError(true); }, 12000);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [location.pathname, navigate, nextValue, session]);

  async function handleEmail(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setNotice('');
    setRememberMe(rememberMe);
    try {
      if (isRecovery) {
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
        setNotice('Your password has been updated. You can continue to PREM.');
        navigate('/onboarding', { replace: true });
        return;
      }

      if (emailMode === 'recover') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) throw resetError;
        setNotice('If an account exists for this email, a password reset link is on its way.');
        return;
      }

      if (emailMode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fonboarding` },
        });
        if (signupError) throw signupError;
        if (!data.session) {
          setNotice('Check your email to confirm your account. Then return here to sign in.');
          setEmailMode('signin');
        } else {
          navigate('/onboarding', { replace: true });
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      navigate(nextPath, { replace: true });
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function startGoogleSignIn() {
    if (!supabase || !googleEnabled) return;
    setBusy(true);
    setError('');
    setRememberMe(rememberMe);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
      });
      if (oauthError) throw oauthError;
    } catch (caught) {
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  }

  async function sendPhoneCode(event) {
    event.preventDefault();
    if (!supabase || !phoneEnabled) return;
    setBusy(true);
    setError('');
    setNotice('');
    setRememberMe(rememberMe);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: phone.trim(), options: { shouldCreateUser: true } });
      if (otpError) throw otpError;
      setOtpSent(true);
      setNotice('Enter the verification code sent to your mobile number.');
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function verifyPhoneCode(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: 'sms' });
      if (verifyError) throw verifyError;
      navigate(nextPath, { replace: true });
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (location.pathname === '/auth/callback') {
    return <main className="auth-shell"><section className="auth-card" aria-live="polite"><p className="auth-eyebrow">PREM ACCOUNT</p><h1>{callbackError || params.has('error') ? 'Sign-in did not finish' : 'Completing sign-in'}</h1><p>{callbackError || params.has('error') ? 'The provider could not verify this sign-in. Return to the sign-in page and try again.' : 'Verifying your secure session…'}</p>{callbackError || params.has('error') ? <Link className="auth-back" to="/auth">Return to sign-in</Link> : <div className="auth-spinner" aria-hidden="true" />}</section></main>;
  }

  if (!supabase) {
    return <main className="auth-shell"><section className="auth-card"><p className="auth-eyebrow">PREM ACCOUNT</p><h1>Sign-in setup needed</h1><p>Set the Supabase project URL and publishable key in the app environment.</p><Link className="auth-back" to="/"><ArrowLeft size={16} /> Back to PREM</Link></section></main>;
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" to="/" aria-label="PREM home">PREM<span>.</span></Link>
        <p className="auth-eyebrow">{isRecovery ? 'ACCOUNT RECOVERY' : 'YOUR PREM ACCOUNT'}</p>
        <h1>{isRecovery ? 'Choose a new password' : 'Welcome to PREM'}</h1>
        <p className="auth-subtitle">{isRecovery ? 'Create a new password for your account.' : 'Sign in to save your property journey and enquiries.'}</p>

        {!isRecovery && <div className="auth-methods" role="tablist" aria-label="Choose a sign-in method">
          <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'active' : ''} onClick={() => { setMethod('email'); setError(''); }}><Mail size={16} /> Email</button>
          <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'active' : ''} disabled={!phoneEnabled} onClick={() => { setMethod('phone'); setError(''); }}><Phone size={16} /> Mobile{!phoneEnabled && <span className="auth-coming-soon">Soon</span>}</button>
        </div>}

        {isRecovery || method === 'email' ? (
          <form className="auth-form" onSubmit={handleEmail}>
            {!isRecovery && emailMode !== 'recover' && <div className="auth-mode-toggle"><button type="button" className={emailMode === 'signin' ? 'selected' : ''} onClick={() => setEmailMode('signin')}>Sign in</button><button type="button" className={emailMode === 'signup' ? 'selected' : ''} onClick={() => setEmailMode('signup')}>Create account</button></div>}
            {!isRecovery && <label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
            {isRecovery && <label>New password<input required minLength={10} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>}
            {!isRecovery && emailMode !== 'recover' && <label>Password<input required minLength={8} type="password" autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>}
            {!isRecovery && <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMeState(event.target.checked)} /> Remember me on this device</label>}
            {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
            <button className="auth-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRecovery ? 'Update password' : emailMode === 'signup' ? 'Create account' : emailMode === 'recover' ? 'Send reset link' : 'Sign in'} <ArrowRight size={16} /></button>
            {!isRecovery && emailMode === 'signin' && <button className="auth-link-button" type="button" onClick={() => setEmailMode('recover')}>Forgot your password?</button>}
            {!isRecovery && emailMode === 'recover' && <button className="auth-link-button" type="button" onClick={() => setEmailMode('signin')}>Back to sign in</button>}
          </form>
        ) : (
          <form className="auth-form" onSubmit={otpSent ? verifyPhoneCode : sendPhoneCode}>
            <label>Mobile number<input required type="tel" autoComplete="tel" inputMode="tel" pattern="\+[1-9][0-9]{7,14}" title="Enter the number in international format, such as +919876543210." placeholder="+91 98765 43210" value={phone} onChange={(event) => setPhone(event.target.value.replace(/[\s()-]/g, ''))} disabled={otpSent} /></label>
            {otpSent && <label>Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4,8}" value={otp} onChange={(event) => setOtp(event.target.value)} /></label>}
            <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMeState(event.target.checked)} /> Remember me on this device</label>
            {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
            <button className="auth-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : otpSent ? 'Verify and sign in' : 'Send verification code'} <ArrowRight size={16} /></button>
            {otpSent && <button className="auth-link-button" type="button" onClick={() => { setOtpSent(false); setOtp(''); }}>Use a different number</button>}
          </form>
        )}

        {!isRecovery && <>
          <div className="auth-divider"><span>OR</span></div>
          <button className="auth-google" type="button" disabled={!googleEnabled || busy} onClick={startGoogleSignIn}><span aria-hidden="true">G</span> Continue with Google {!googleEnabled && <small>Setup required</small>}</button>
          {!googleEnabled && <p className="auth-provider-note">Google sign-in will be available after PREM’s OAuth provider and redirect URLs are configured.</p>}
        </>}
        <p className="auth-privacy">Your login credentials are managed by Supabase Auth. PREM never stores your password in its profile data.</p>
        <Link className="auth-back" to="/"><ArrowLeft size={15} /> Back to browsing</Link>
      </section>
    </main>
  );
}

export default AuthPage;
