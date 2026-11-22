import { createClient } from '@supabase/supabase-js';
import { createAuthStorage } from './authStorage.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const authStorageKey = supabaseUrl ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token` : null;

function getStorage(name) {
  try {
    return typeof window === 'undefined' ? null : window[name];
  } catch {
    return null;
  }
}

const { storage: sessionStorageAdapter, setRememberMe } = createAuthStorage({
  getLocalStorage: () => getStorage('localStorage'),
  getSessionStorage: () => getStorage('sessionStorage'),
  authStorageKey,
});

/** Select where future Auth session tokens are stored before starting sign-in. */
export { setRememberMe };

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: sessionStorageAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null;
