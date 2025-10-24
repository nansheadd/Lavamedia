'use client';

const ACCESS_TOKEN_KEY = 'lavamedia.accessToken';
const REFRESH_TOKEN_KEY = 'lavamedia.refreshToken';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/$/, '');

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

function buildUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
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
    let message = 'Une erreur est survenue. Veuillez réessayer.';
    if (body) {
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object') {
        const candidate = (body as Record<string, unknown>).detail ?? (body as Record<string, unknown>).message;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          message = candidate;
        }
      }
    }
    throw new Error(message);
  }
  return body as T;
}

function storeTokens(tokens: TokenResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const response = await fetch(buildUrl('/api/auth/signup'), {
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
  const response = await fetch(buildUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const tokens = await handleResponse<TokenResponse>(response);
  storeTokens(tokens);
}

export async function logout() {
  const accessToken = getAccessToken();
  try {
    if (accessToken) {
      await fetch(buildUrl('/api/auth/logout'), {
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

  try {
    const response = await fetch(buildUrl('/api/auth/refresh'), {
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

  const response = await fetch(buildUrl('/api/auth/me'), {
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
