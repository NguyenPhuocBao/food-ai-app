const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'admin_token';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

const getLegacyStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const readToken = (key: string) => {
  const session = getStorage();
  const sessionToken = session?.getItem(key);
  if (sessionToken) return sessionToken;

  const legacy = getLegacyStorage();
  const legacyToken = legacy?.getItem(key);
  if (legacyToken && session) {
    session.setItem(key, legacyToken);
    legacy.removeItem(key);
  }
  return legacyToken;
};

const writeToken = (key: string, value: string) => {
  const session = getStorage();
  const legacy = getLegacyStorage();
  session?.setItem(key, value);
  legacy?.removeItem(key);
};

const clearToken = (key: string) => {
  getStorage()?.removeItem(key);
  getLegacyStorage()?.removeItem(key);
};

export const getUserToken = () => readToken(USER_TOKEN_KEY);
export const setUserToken = (value: string) => writeToken(USER_TOKEN_KEY, value);
export const clearUserToken = () => clearToken(USER_TOKEN_KEY);

export const getAdminToken = () => readToken(ADMIN_TOKEN_KEY);
export const setAdminToken = (value: string) => writeToken(ADMIN_TOKEN_KEY, value);
export const clearAdminToken = () => clearToken(ADMIN_TOKEN_KEY);

