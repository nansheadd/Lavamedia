'use client';

const ACCESS_TOKEN_KEY = 'lavamedia.accessToken';
const REFRESH_TOKEN_KEY = 'lavamedia.refreshToken';

export type Credentials = {
  email: string;
  password: string;
};

type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  role: 'journalist' | 'admin' | 'reader';
  exp: number;
};

const mockUsers: Record<string, Omit<JwtPayload, 'exp'>> = {
  'journaliste@lavamedia.fr': {
    sub: '1',
    name: 'Jeanne Journaliste',
    email: 'journaliste@lavamedia.fr',
    role: 'journalist'
  },
  'admin@lavamedia.fr': {
    sub: '2',
    name: 'Alex Admin',
    email: 'admin@lavamedia.fr',
    role: 'admin'
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createToken(payload: Omit<JwtPayload, 'exp'>, lifetime = 60 * 60): string {
  const exp = Math.floor(Date.now() / 1000) + lifetime;
  const tokenPayload: JwtPayload = { ...payload, exp };
  return btoa(JSON.stringify(tokenPayload));
}

function decodeToken(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token)) as JwtPayload;
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
}

export async function login(email: string, password: string) {
  await wait(500);
  if (!mockUsers[email] || password !== 'password') {
    throw new Error('Identifiants invalides');
  }

  const access = createToken(mockUsers[email], 60 * 15);
  const refresh = createToken(mockUsers[email], 60 * 60 * 24 * 30);
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export async function logout() {
  await wait(200);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function refreshToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return false;
  const payload = decodeToken(refresh);
  if (!payload || payload.exp * 1000 < Date.now()) {
    await logout();
    return false;
  }
  const access = createToken(payload, 60 * 15);
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  return true;
}

export async function getProfile() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) throw new Error('Utilisateur non authentifié');
  const payload = decodeToken(token);
  if (!payload) throw new Error('Token invalide');
  const { exp, sub, ...rest } = payload;
  return {
    id: sub,
    ...rest
  };
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
