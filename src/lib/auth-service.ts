'use client';

const ACCESS_TOKEN_KEY = 'lavamedia.accessToken';
const REFRESH_TOKEN_KEY = 'lavamedia.refreshToken';

const DEFAULT_API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api';
const LOCAL_FALLBACK_BASES = ['http://127.0.0.1:8000/api', 'http://localhost:8000/api'];
const PRIMARY_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE).trim();
const API_BASE_CANDIDATES = Array.from(
  new Set(
    [
      PRIMARY_API_BASE,
      ...(process.env.NODE_ENV === 'development' ? LOCAL_FALLBACK_BASES : [])
    ]
      .map((candidate) => candidate.trim())
      .filter((candidate) => candidate.length > 0)
      .map((candidate) => candidate.replace(/\/$/, ''))
  )
);
const API_BASES = API_BASE_CANDIDATES.length > 0 ? API_BASE_CANDIDATES : ['/api'];
const MOCK_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH !== 'false' && process.env.NODE_ENV === 'development';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

type SignupResponse = {
  user_id: number;
  mfa_uri?: string | null;
};

export type SignupPayload = {
  email: string;
  password: string;
  fullName?: string | null;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  fullName: string | null;
  roles: string[];
  primaryRole: 'user' | 'journalist' | 'admin';
  stripeCustomerId: string | null;
};

const MOCK_ACCESS_TOKEN = 'mock-access-token';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token';
const MOCK_TOKENS: TokenResponse = {
  access_token: MOCK_ACCESS_TOKEN,
  refresh_token: MOCK_REFRESH_TOKEN,
  token_type: 'Bearer'
};
const MOCK_CREDENTIALS = {
  email: 'admin@lava.com',
  password: 'password'
};

const MOCK_USER: AuthenticatedUser = {
  id: 1,
  email: 'admin@lava.com',
  fullName: 'Administrateur Lavamedia',
  roles: ['admin'],
  primaryRole: 'admin',
  stripeCustomerId: null
};

function buildUrl(base: string | undefined, path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    return cleanPath;
  }

  if (cleanPath.startsWith('/api') && base.endsWith('/api')) {
    return `${base}${cleanPath.slice(4)}`;
  }

  return `${base}${cleanPath}`;
}

async function fetchFromApi(path: string, init?: RequestInit): Promise<Response> {
  let lastNetworkError: unknown;

  for (const base of API_BASES) {
    try {
      return await fetch(buildUrl(base, path), init);
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }
      lastNetworkError = error;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`API base ${base} unreachable, trying next candidate`, error);
      }
    }
  }

  if (lastNetworkError) {
    throw lastNetworkError;
  }

  throw new Error('Aucune URL API valide configurée.');
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body = await parseBody(response);
  if (!response.ok) {
    let message = response.statusText?.trim() || 'Une erreur est survenue. Veuillez réessayer.';
    if (body) {
      if (typeof body === 'string') {
        const trimmed = body.trim();
        const looksLikeHtml = /^<!doctype html>/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);
        if (!looksLikeHtml && trimmed.length > 0) {
          message = trimmed;
        }
      } else if (typeof body === 'object') {
        const candidate = (body as Record<string, unknown>).detail ?? (body as Record<string, unknown>).message;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          message = candidate;
        }
      }
    }
    if (response.status === 404 && message === response.statusText) {
      message = 'Service indisponible. Vérifiez votre configuration serveur et réessayez.';
    }
    throw new Error(message);
  }
  return body as T;
}

function storeTokens(tokens: TokenResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

function isMockAccessToken(token: string | null) {
  return MOCK_AUTH_ENABLED && token === MOCK_ACCESS_TOKEN;
}

function isMockRefreshToken(token: string | null) {
  return MOCK_AUTH_ENABLED && token === MOCK_REFRESH_TOKEN;
}

function canUseMockAuth(email: string, password: string) {
  return MOCK_AUTH_ENABLED && email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password;
}

function isNetworkError(error: unknown): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return error instanceof TypeError || (error instanceof Error && error.message.toLowerCase().includes('network'));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const response = await fetchFromApi('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName ?? null,
      status: 'active',
      role_ids: [],
      mfa_enabled: false
    })
  });

  return handleResponse<SignupResponse>(response);
}

export async function login(email: string, password: string) {
  try {
    const response = await fetchFromApi('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const tokens = await handleResponse<TokenResponse>(response);
    storeTokens(tokens);
  } catch (error) {
    if (canUseMockAuth(email, password) && isNetworkError(error)) {
      storeTokens(MOCK_TOKENS);
      return;
    }
    if (isNetworkError(error)) {
      throw new Error(
        "Impossible de contacter l'API d'authentification. Vérifiez que le backend tourne sur http://localhost:8000 et qu'il est accessible."
      );
    }
    throw error instanceof Error ? error : new Error('Connexion impossible. Réessayez.');
  }
}

export async function logout() {
  const accessToken = getAccessToken();
  if (isMockAccessToken(accessToken)) {
    clearTokens();
    return;
  }
  try {
    if (accessToken) {
      await fetchFromApi('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  } finally {
    clearTokens();
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) {
    return false;
  }

  if (isMockRefreshToken(refresh)) {
    storeTokens(MOCK_TOKENS);
    return true;
  }

  try {
    const response = await fetchFromApi('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refresh })
    });

    const tokens = await handleResponse<TokenResponse>(response);
    storeTokens(tokens);
    return true;
  } catch (error) {
    clearTokens();
    console.warn('Impossible de rafraîchir le token', error);
    return false;
  }
}

export async function getProfile(): Promise<AuthenticatedUser> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Utilisateur non authentifié');
  }

  if (isMockAccessToken(accessToken)) {
    return MOCK_USER;
  }

  const response = await fetchFromApi('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await handleResponse<{
    id: number;
    email: string;
    full_name: string | null;
    roles: Array<{ id: number; name: string }>;
    stripe_customer_id: string | null;
  }>(response);

  const roles = data.roles?.map((role) => role.name) ?? [];
  const priority: Array<'admin' | 'journalist' | 'user'> = ['admin', 'journalist', 'user'];
  const primaryRole = (roles.find((role): role is 'admin' | 'journalist' | 'user' =>
    priority.includes(role as 'admin' | 'journalist' | 'user')
  ) ?? 'user');

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    roles,
    primaryRole,
    stripeCustomerId: data.stripe_customer_id
  };
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
