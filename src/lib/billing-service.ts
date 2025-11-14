'use client';

import { fetchFromApi, getAccessToken } from '@/lib/auth-service';

export type SubscriptionPlanSlug = 'classic' | 'digital' | 'supporter';
export type SubscriptionInterval = 'monthly' | 'annual';

export type SubscriptionStatusPayload = {
  has_active_subscription: boolean;
  status?: string | null;
  plan_slug?: string | null;
  interval?: string | null;
  renewal_date?: string | null;
  last_payment_error?: string | null;
};

type SubscriptionUser = {
  id: number;
  email: string;
  full_name: string | null;
};

export type AdminSubscriptionItem = {
  id: number;
  user: SubscriptionUser;
  plan_slug: string;
  interval: string;
  status: string;
  currency: string;
  amount_cents: number | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  last_payment_error: string | null;
  latest_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminSubscriptionsOverview = {
  stats: {
    total: number;
    active: number;
    past_due: number;
    canceling: number;
    issues: number;
  };
  items: AdminSubscriptionItem[];
};

function requireAccessToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vous devez être connecté pour lancer l'abonnement.");
  }
  return token;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  let message = response.statusText || 'Une erreur est survenue.';
  try {
    const payload = (await response.json()) as { detail?: string };
    if (typeof payload?.detail === 'string' && payload.detail.trim().length > 0) {
      message = payload.detail;
    }
  } catch {
    // ignore json parse failure
  }
  throw new Error(message);
}

export async function createCheckoutSession(options: {
  plan: SubscriptionPlanSlug;
  interval: SubscriptionInterval;
  successUrl: string;
  cancelUrl: string;
}) {
  const token = requireAccessToken();
  const response = await fetchFromApi('/api/billing/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      plan: options.plan,
      interval: options.interval,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl
    })
  });

  const data = await parseApiResponse<{ checkout_url: string }>(response);
  if (!data.checkout_url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }
  return data.checkout_url;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatusPayload | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const response = await fetchFromApi('/api/billing/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (response.status === 401) {
    return null;
  }
  return parseApiResponse<SubscriptionStatusPayload>(response);
}

export async function getAdminSubscriptionOverview(): Promise<AdminSubscriptionsOverview> {
  const token = requireAccessToken();
  const response = await fetchFromApi('/api/billing/admin/subscriptions', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return parseApiResponse<AdminSubscriptionsOverview>(response);
}
