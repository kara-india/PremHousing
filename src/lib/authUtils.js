export function safeNextPath(value) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/auth')
    ? value
    : '/onboarding';
}

export function authErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? '';
  if (message.includes('invalid login credentials')) return 'That email or password did not match. Check the details and try again.';
  if (message.includes('user already registered')) return 'An account already exists for this address. Sign in instead.';
  if (message.includes('rate limit')) return 'Too many attempts. Wait a few minutes before trying again.';
  if (message.includes('provider is not enabled')) return 'This sign-in provider is not enabled for PREM yet.';
  return 'We could not complete sign-in. Check your connection and try again.';
}

export function getTrustedStaffRole(user) {
  const role = user?.app_metadata?.role;
  return role === 'staff' || role === 'admin' ? role : null;
}
