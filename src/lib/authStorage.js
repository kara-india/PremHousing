const REMEMBER_ME_KEY = 'prem.auth.rememberMe';

export function createAuthStorage({ getLocalStorage, getSessionStorage, authStorageKey }) {
  const memoryStorage = new Map();
  const local = () => getLocalStorage?.() ?? null;
  const session = () => getSessionStorage?.() ?? null;
  const rememberEnabled = () => {
    try { return local()?.getItem(REMEMBER_ME_KEY) !== 'false'; } catch { return true; }
  };
  const preferred = () => rememberEnabled() ? local() : session();
  const read = (store, key) => {
    try { return store?.getItem(key) ?? null; } catch { return null; }
  };
  const write = (store, key, value) => {
    try { store?.setItem(key, value); return Boolean(store); } catch { return false; }
  };

  const storage = {
    async getItem(key) {
      const primary = preferred();
      const alternate = rememberEnabled() ? (primary === local() ? session() : local()) : null;
      return read(primary, key) ?? read(alternate, key) ?? memoryStorage.get(key) ?? null;
    },
    async setItem(key, value) {
      const remember = rememberEnabled();
      const target = preferred();
      let persisted = write(target, key, value);
      let persistedStore = persisted ? target : null;
      if (!persisted && remember) {
        persisted = write(session(), key, value);
        if (persisted) persistedStore = session();
      }
      if (!persisted) memoryStorage.set(key, value);
      const alternate = persistedStore === local() ? session() : local();
      if (persisted) {
        try { alternate?.removeItem(key); } catch { /* Browser storage may be unavailable. */ }
      } else if (!remember) {
        try { local()?.removeItem(key); } catch { /* Never retain a session-only token persistently. */ }
      }
    },
    async removeItem(key) {
      for (const getStore of [getLocalStorage, getSessionStorage]) {
        try { getStore?.()?.removeItem(key); } catch { /* Browser storage may be unavailable. */ }
      }
      memoryStorage.delete(key);
    },
  };

  function setRememberMe(remember) {
    const localStore = local();
    const sessionStore = session();
    const source = remember ? sessionStore : localStore;
    const target = remember ? localStore : sessionStore;
    try { localStore?.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false'); } catch { /* Use memory storage if restricted. */ }
    if (authStorageKey) {
      const existing = read(source, authStorageKey) ?? read(target, authStorageKey);
      const persisted = existing ? write(target, authStorageKey, existing) : true;
      if (persisted || !remember) {
        try { source?.removeItem(authStorageKey); } catch { /* Storage may be unavailable. */ }
      }
    }
  }

  return { storage, setRememberMe };
}
