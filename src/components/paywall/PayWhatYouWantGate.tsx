'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { useLanguage, useTranslations } from '@/contexts/language-context';
import {
  type PaywallConfig,
  createPaywallCheckout,
  createPaywallIntent,
  getPaywallConfig
} from '@/lib/paywall-service';

const STORAGE_PREFIX = 'lavamedia.paywall.intent.article.';
const INTENT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type StoredIntent = {
  id: number;
  email: string;
  createdAt: number;
};

function readStoredIntent(slug: string): StoredIntent | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredIntent;
    if (!parsed?.id || !parsed?.email) {
      return null;
    }
    if (Date.now() - parsed.createdAt > INTENT_TTL_MS) {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistIntent(slug: string, intent: StoredIntent) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(intent));
}

export function PayWhatYouWantGate({
  slug,
  children
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const { language } = useLanguage();
  const [config, setConfig] = useState<PaywallConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [intent, setIntent] = useState<StoredIntent | null>(null);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setConfigLoading(true);
    getPaywallConfig('article', slug)
      .then((payload) => {
        setConfig(payload);
        setConfigError(null);
      })
      .catch(() => {
        setConfigError(t('article.paywall.error'));
      })
      .finally(() => {
        setConfigLoading(false);
      });
  }, [slug, t]);

  useEffect(() => {
    const stored = readStoredIntent(slug);
    if (stored) {
      setIntent(stored);
      setEmail(stored.email);
    }
  }, [slug]);

  useEffect(() => {
    if (config && amountCents === null) {
      setAmountCents(config.default_amount_cents);
    }
  }, [config, amountCents]);

  const paywallEnabled = config?.pay_what_you_want_enabled ?? true;

  const datawallDisabled = useMemo(() => {
    if (!config) {
      return false;
    }
    if (!config.datawall_enabled) {
      return true;
    }
    if (!config.disable_datawall_until) {
      return false;
    }
    const until = new Date(config.disable_datawall_until);
    return Number.isFinite(until.getTime()) && until.getTime() > Date.now();
  }, [config]);

  const needsDatawall = paywallEnabled && Boolean(config?.datawall_enabled && !datawallDisabled);
  const hasUnlocked = !needsDatawall || Boolean(intent);

  const minAmount = config?.min_amount_cents ?? 200;
  const maxAmount = config?.max_amount_cents ?? 2500;

  const clampAmount = (value: number) => {
    return Math.min(Math.max(value, minAmount), maxAmount);
  };

  const formattedAmount = (value: number | null) => {
    const formatter = new Intl.NumberFormat(language === 'nl' ? 'nl-BE' : 'fr-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    });
    return formatter.format((value ?? minAmount) / 100);
  };

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createPaywallIntent({
        scope: 'article',
        slug,
        email,
        preferredAmountCents: clampAmount(amountCents ?? config.default_amount_cents)
      });
      const stored: StoredIntent = { id: created.id, email: created.email, createdAt: Date.now() };
      setIntent(stored);
      persistIntent(slug, stored);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('article.paywall.error');
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!config || !intent) {
      return;
    }
    setCheckoutLoading(true);
    setFormError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${origin}/article/${slug}?support=merci`;
      const cancelUrl = `${origin}/article/${slug}?support=annule`;
      const checkoutUrl = await createPaywallCheckout({
        intentId: intent.id,
        amountCents: clampAmount(amountCents ?? config.default_amount_cents),
        interval: 'monthly',
        successUrl,
        cancelUrl
      });
      window.location.assign(checkoutUrl);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('article.paywall.error');
      setFormError(message);
      setCheckoutLoading(false);
    }
  };

  if (config && !paywallEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-8">
      <div className="not-prose rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{t('article.paywall.title')}</h3>
        <p className="mt-2 text-sm text-slate-600">{t('article.paywall.description')}</p>
        {configError ? <p className="mt-2 text-sm text-rose-600">{configError}</p> : null}
        {formError ? <p className="mt-2 text-sm text-rose-600">{formError}</p> : null}
        {needsDatawall && !intent ? (
          <form className="mt-4 space-y-4" onSubmit={handleUnlock}>
            <Input
              label={t('article.paywall.emailLabel')}
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={configLoading || submitting}
            />
            <Button type="submit" disabled={configLoading || submitting || email.trim().length === 0}>
              {submitting ? t('newsletterForm.loading') : t('article.paywall.submit')}
            </Button>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-700">{t('article.paywall.unlockedDescription')}</p>
            <div>
              <label className="text-sm font-medium text-slate-900" htmlFor={`pwyw-slider-${slug}`}>
                {t('article.paywall.sliderLabel')} · <span>{formattedAmount(amountCents)}</span>
              </label>
              <input
                id={`pwyw-slider-${slug}`}
                type="range"
                min={minAmount}
                max={maxAmount}
                step={config?.step_amount_cents ?? 50}
                value={clampAmount(amountCents ?? config?.default_amount_cents ?? minAmount)}
                onChange={(event) => setAmountCents(clampAmount(Number(event.target.value)))}
                className="mt-2 w-full accent-primary-500"
              />
              <p className="mt-1 text-xs text-slate-500">{t('article.paywall.sliderHelper')}</p>
            </div>
            <Button type="button" disabled={checkoutLoading} onClick={handleCheckout}>
              {checkoutLoading
                ? t('article.paywall.checkoutLoading')
                : t('article.paywall.contributeCta', { amount: formattedAmount(amountCents) })}
            </Button>
            {datawallDisabled ? (
              <p className="text-xs text-slate-500">{t('article.paywall.bypassLabel')}</p>
            ) : null}
          </div>
        )}
      </div>
      <div className={needsDatawall && !intent ? 'pointer-events-none select-none opacity-40 blur-sm transition' : 'transition'}>
        {children}
      </div>
    </div>
  );
}
