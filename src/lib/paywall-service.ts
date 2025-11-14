import { fetchFromApi, getAccessToken } from '@/lib/auth-service';

export type PaywallScope = 'article' | 'newsletter';

export type PaywallConfig = {
  id: number;
  scope: PaywallScope | string;
  slug: string;
  label: string | null;
  datawall_enabled: boolean;
  pay_what_you_want_enabled: boolean;
  disable_datawall_until: string | null;
  min_amount_cents: number;
  max_amount_cents: number;
  default_amount_cents: number;
  step_amount_cents: number;
  suggested_amounts: number[] | null;
};

export type PaywallIntent = {
  id: number;
  scope: PaywallScope | string;
  slug: string;
  email: string;
  preferred_amount_cents: number;
  last_checkout_amount_cents: number | null;
  checkout_started_at: string | null;
  created_at: string;
};

export type PaywallDashboard = {
  configs: PaywallConfig[];
  intents: PaywallIntent[];
  stats: {
    supporters: number;
    total_amount_cents: number;
    monthly_amount_cents: number;
    annual_amount_cents: number;
    leads: number;
  };
  subscriptions: AdminSubscription[];
};

export type AdminSubscription = {
  id: number;
  user: { id: number; email: string; full_name: string | null } | null;
  plan_slug: string;
  interval: string;
  status: string;
  currency: string;
  amount_cents: number | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  last_payment_error: string | null;
  latest_invoice_id: string | null;
  lead_email: string | null;
  paywall_intent_id: number | null;
  created_at: string;
  updated_at: string;
};

function ensureOk(response: Response) {
  if (!response.ok) {
    throw new Error('Service paywall indisponible.');
  }
  return response;
}

export async function getPaywallConfig(scope: PaywallScope, slug: string): Promise<PaywallConfig> {
  const response = await fetchFromApi(`/api/paywall/configs/${scope}/${slug}`);
  await ensureOk(response);
  return response.json() as Promise<PaywallConfig>;
}

export async function createPaywallIntent(payload: {
  scope: PaywallScope;
  slug: string;
  email: string;
  preferredAmountCents: number;
}): Promise<PaywallIntent> {
  const response = await fetchFromApi('/api/paywall/intents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scope: payload.scope,
      slug: payload.slug,
      email: payload.email,
      preferred_amount_cents: payload.preferredAmountCents
    })
  });
  await ensureOk(response);
  return response.json() as Promise<PaywallIntent>;
}

export async function createPaywallCheckout(payload: {
  intentId: number;
  amountCents: number;
  interval: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const response = await fetchFromApi('/api/billing/pay-what-you-want/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent_id: payload.intentId,
      amount_cents: payload.amountCents,
      interval: payload.interval,
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl
    })
  });
  await ensureOk(response);
  const data = (await response.json()) as { checkout_url: string };
  if (!data.checkout_url) {
    throw new Error('Session Stripe introuvable.');
  }
  return data.checkout_url;
}

function requireToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentification requise.');
  }
  return token;
}

export async function getPaywallDashboard(): Promise<PaywallDashboard> {
  const token = requireToken();
  const response = await fetchFromApi('/api/paywall/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  await ensureOk(response);
  return response.json() as Promise<PaywallDashboard>;
}

export async function updatePaywallConfig(configId: number, payload: Partial<PaywallConfig>): Promise<PaywallConfig> {
  const token = requireToken();
  const response = await fetchFromApi(`/api/paywall/configs/${configId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  await ensureOk(response);
  return response.json() as Promise<PaywallConfig>;
}

export async function listPaywallConfigs(): Promise<PaywallConfig[]> {
  const token = requireToken();
  const response = await fetchFromApi('/api/paywall/admin/configs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  await ensureOk(response);
  return response.json() as Promise<PaywallConfig[]>;
}
