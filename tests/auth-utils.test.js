import test from 'node:test';
import assert from 'node:assert/strict';
import { authErrorMessage, getTrustedStaffRole, safeNextPath } from '../src/lib/authUtils.js';
import { createAuthStorage } from '../src/lib/authStorage.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test('safeNextPath allows same-origin app routes', () => {
  assert.equal(safeNextPath('/admin'), '/admin');
  assert.equal(safeNextPath('/properties/123?from=auth'), '/properties/123?from=auth');
});

test('safeNextPath rejects external and auth-loop redirects', () => {
  assert.equal(safeNextPath('//attacker.example'), '/onboarding');
  assert.equal(safeNextPath('https://attacker.example'), '/onboarding');
  assert.equal(safeNextPath('/auth?next=/admin'), '/onboarding');
  assert.equal(safeNextPath(undefined), '/onboarding');
});

test('auth errors give useful safe messages without exposing provider details', () => {
  assert.match(authErrorMessage({ message: 'Invalid login credentials' }), /email or password did not match/i);
  assert.match(authErrorMessage({ message: 'For security purposes, rate limit exceeded' }), /wait a few minutes/i);
  assert.match(authErrorMessage({ message: 'OAuth provider is not enabled' }), /not enabled for PREM/i);
  assert.equal(authErrorMessage({ message: 'https://internal.example/secret-token' }), 'We could not complete sign-in. Check your connection and try again.');
});

test('staff access is derived only from trusted app metadata', () => {
  assert.equal(getTrustedStaffRole({ app_metadata: { role: 'staff' }, user_metadata: { role: 'customer' } }), 'staff');
  assert.equal(getTrustedStaffRole({ app_metadata: { role: 'admin' } }), 'admin');
  assert.equal(getTrustedStaffRole({ app_metadata: {}, user_metadata: { role: 'admin' } }), null);
  assert.equal(getTrustedStaffRole({ user_metadata: { role: 'staff' } }), null);
});

test('Remember me stores sessions persistently only when selected', async () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const { storage, setRememberMe } = createAuthStorage({
    getLocalStorage: () => local,
    getSessionStorage: () => session,
    authStorageKey: 'sb-prem-auth-token',
  });

  setRememberMe(true);
  await storage.setItem('sb-prem-auth-token', 'persistent-session');
  assert.equal(local.getItem('sb-prem-auth-token'), 'persistent-session');
  assert.equal(session.getItem('sb-prem-auth-token'), null);

  setRememberMe(false);
  assert.equal(local.getItem('sb-prem-auth-token'), null);
  assert.equal(session.getItem('sb-prem-auth-token'), 'persistent-session');
  await storage.setItem('sb-prem-auth-token', 'session-only');
  assert.equal(local.getItem('sb-prem-auth-token'), null);
  assert.equal(session.getItem('sb-prem-auth-token'), 'session-only');
});

test('session-only mode never falls back to persistent auth storage', async () => {
  const local = new MemoryStorage();
  local.setItem('sb-prem-auth-token', 'old-persistent-token');
  const { storage, setRememberMe } = createAuthStorage({
    getLocalStorage: () => local,
    getSessionStorage: () => ({
      getItem() { throw new Error('session storage unavailable'); },
      setItem() { throw new Error('session storage unavailable'); },
      removeItem() { throw new Error('session storage unavailable'); },
    }),
    authStorageKey: 'sb-prem-auth-token',
  });
  setRememberMe(false);
  assert.equal(await storage.getItem('sb-prem-auth-token'), null);
  await storage.setItem('sb-prem-auth-token', 'memory-only-token');
  assert.equal(local.getItem('sb-prem-auth-token'), null);
  assert.equal(await storage.getItem('sb-prem-auth-token'), 'memory-only-token');
});

test('Remember me falls back to tab storage if persistent storage is blocked', async () => {
  const blockedLocal = {
    getItem() { return null; },
    setItem() { throw new Error('local storage unavailable'); },
    removeItem() {},
  };
  const session = new MemoryStorage();
  const { storage, setRememberMe } = createAuthStorage({
    getLocalStorage: () => blockedLocal,
    getSessionStorage: () => session,
    authStorageKey: 'sb-prem-auth-token',
  });
  setRememberMe(true);
  await storage.setItem('sb-prem-auth-token', 'tab-session');
  assert.equal(session.getItem('sb-prem-auth-token'), 'tab-session');
  assert.equal(await storage.getItem('sb-prem-auth-token'), 'tab-session');
});
