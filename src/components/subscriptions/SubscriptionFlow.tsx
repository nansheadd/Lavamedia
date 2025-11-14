'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/forms/input';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage, useTranslationList, useTranslations } from '@/contexts/language-context';
import { createCheckoutSession, getSubscriptionStatus, type SubscriptionStatusPayload, type SubscriptionInterval, type SubscriptionPlanSlug } from '@/lib/billing-service';

type PlanPriceCopy = {
  amount: number;
  currency: string;
  note?: string;
  suffix?: string;
};

type SubscriptionPlanCopy = {
  slug: SubscriptionPlanSlug;
  badge: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  highlight?: 'popular' | 'support';
  includesPrint?: boolean;
  defaultInterval: SubscriptionInterval;
  features: string[];
  prices: Partial<Record<SubscriptionInterval, PlanPriceCopy>>;
};

type IntervalCopy = {
  label: string;
  helper: string;
};

type SubscriptionFlowProps = {
  layout?: 'compact' | 'full';
};

const INTERVALS: SubscriptionInterval[] = ['monthly', 'annual'];

function formatPrice(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function SubscriptionFlow({ layout = 'compact' }: SubscriptionFlowProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const { user, signup, login } = useAuth();
  const plans = useTranslationList<SubscriptionPlanCopy[]>('subscriptions.plans');
  const intervalCopy = useTranslationList<Record<SubscriptionInterval, IntervalCopy>>('subscriptions.intervals');
  const periodSuffix = useTranslationList<Record<SubscriptionInterval, string>>('subscriptions.periodSuffix');
  const formCopy = useTranslationList<{
    title: string;
    description: string;
    existingAccountHint: string;
    fields: Record<'fullName' | 'email' | 'password', string>;
    submit: string;
    errors: { missingFields: string; generic: string };
  }>('subscriptions.form');
  const statusCopy = useTranslationList<{ alreadyActive: string; manage: string }>('subscriptions.status');

  const [selectedInterval, setSelectedInterval] = useState<SubscriptionInterval>('monthly');
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<SubscriptionPlanSlug>(plans[0]?.slug ?? 'classic');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusPayload | null>(null);
  const [formValues, setFormValues] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.slug === selectedPlanSlug) ?? plans[0];
  }, [plans, selectedPlanSlug]);

  useEffect(() => {
    if (!user) {
      setSubscriptionStatus(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const status = await getSubscriptionStatus();
        if (!cancelled) {
          setSubscriptionStatus(status);
        }
      } catch (err) {
        console.warn('Impossible de récupérer le statut de l’abonnement', err);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (selectedPlan) {
      const availableIntervals = Object.keys(selectedPlan.prices) as SubscriptionInterval[];
      if (!availableIntervals.includes(selectedInterval)) {
        setSelectedInterval(selectedPlan.defaultInterval);
      }
    }
  }, [selectedInterval, selectedPlan]);

  const effectiveInterval: SubscriptionInterval = useMemo(() => {
    if (!selectedPlan) {
      return 'annual';
    }
    return (selectedPlan.prices[selectedInterval] ? selectedInterval : selectedPlan.defaultInterval) ?? 'annual';
  }, [selectedInterval, selectedPlan]);

  const price = selectedPlan?.prices[effectiveInterval];
  const formattedPrice = price ? formatPrice(price.amount, price.currency, language === 'nl' ? 'nl-BE' : 'fr-BE') : null;

  const resolvedFormCopy = useMemo(() => ({
    title: formCopy?.title ?? t('subscriptions.labels.formTitleFallback'),
    description: formCopy?.description ?? t('subscriptions.labels.formDescriptionFallback'),
    existingAccountHint: formCopy?.existingAccountHint ?? t('subscriptions.labels.existingAccountHintFallback'),
    submit: formCopy?.submit ?? t('subscriptions.labels.submitFallback'),
    errors: {
      missingFields: formCopy?.errors?.missingFields ?? t('subscriptions.labels.missingFieldsFallback'),
      generic: formCopy?.errors?.generic ?? t('subscriptions.labels.genericErrorFallback')
    },
    fields: {
      fullName: formCopy?.fields?.fullName ?? t('subscriptions.labels.fullNameFallback'),
      email: formCopy?.fields?.email ?? t('subscriptions.labels.emailFallback'),
      password: formCopy?.fields?.password ?? t('subscriptions.labels.passwordFallback')
    }
  }), [formCopy, t]);

  const disabled = pending || (subscriptionStatus?.has_active_subscription ?? false);

  const handleSubscribe = async () => {
    setError(null);
    if (!selectedPlan) {
      setError(t('subscriptions.errors.planUnavailable'));
      return;
    }
    if (!user && (!formValues.email || !formValues.password)) {
      setError(resolvedFormCopy.errors.missingFields);
      return;
    }
    setPending(true);
    try {
      if (!user) {
        try {
          await signup({
            email: formValues.email,
            password: formValues.password,
            fullName: formValues.fullName || undefined
          });
        } catch (authError) {
          const message = authError instanceof Error ? authError.message : '';
          if (message.toLowerCase().includes('email already registered')) {
            await login(formValues.email, formValues.password);
          } else {
            throw authError;
          }
        }
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (!origin) {
        throw new Error(resolvedFormCopy.errors.generic);
      }
      const checkoutUrl = await createCheckoutSession({
        plan: selectedPlan.slug,
        interval: effectiveInterval,
        successUrl: `${origin}/espace?checkout=success`,
        cancelUrl: `${origin}/abonnement?checkout=cancelled`
      });
      window.location.href = checkoutUrl;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : resolvedFormCopy.errors.generic;
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlanCopy) => {
    const cardInterval = plan.prices[selectedInterval] ? selectedInterval : plan.defaultInterval;
    const cardPrice = plan.prices[cardInterval];
    const cardFormattedPrice = cardPrice ? formatPrice(cardPrice.amount, cardPrice.currency, language === 'nl' ? 'nl-BE' : 'fr-BE') : null;
    const isSelected = plan.slug === selectedPlanSlug;
    return (
      <button
        type="button"
        key={plan.slug}
        onClick={() => setSelectedPlanSlug(plan.slug)}
        className={clsx(
          'flex flex-col rounded-3xl border px-4 py-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          isSelected
            ? 'border-primary-500 bg-primary-50 shadow-lg dark:border-primary-400 dark:bg-primary-900/30'
            : 'border-slate-200 bg-white hover:border-primary-200 dark:border-slate-800 dark:bg-slate-900'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-200">
              {plan.badge}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</p>
          </div>
          {plan.highlight === 'popular' ? (
            <span className="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
              <SparklesIcon className="mr-1 h-4 w-4" aria-hidden />
              {t('subscriptions.labels.popular')}
            </span>
          ) : plan.highlight === 'support' ? (
            <span className="inline-flex items-center rounded-full border border-primary-600 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
              {t('subscriptions.labels.support')}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{plan.tagline}</p>
        <div className="mt-4">
          {cardFormattedPrice ? (
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {cardFormattedPrice}{' '}
              <span className="text-base font-medium text-slate-500">
                {cardPrice?.suffix ?? periodSuffix[cardInterval]}
              </span>
            </p>
          ) : (
            <p className="text-base font-semibold text-slate-500">{t('subscriptions.labels.forthcoming')}</p>
          )}
          {cardPrice?.note ? (
            <p className="text-xs text-slate-500">{cardPrice.note}</p>
          ) : null}
        </div>
      </button>
    );
  };

  return (
    <div
      className={clsx(
        'rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950',
        layout === 'full' ? 'lg:p-10' : 'lg:p-8'
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
              {t('subscriptions.eyebrow')}
            </p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('subscriptions.title')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('subscriptions.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {INTERVALS.map((interval) => {
              const copy = intervalCopy?.[interval];
              const fallbackLabel = interval === 'monthly' ? t('subscriptions.labels.monthlyFallback') : t('subscriptions.labels.annualFallback');
              return (
                <button
                  type="button"
                  key={interval}
                  onClick={() => setSelectedInterval(interval)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    selectedInterval === interval
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                      : 'border-slate-200 text-slate-600 hover:border-primary-200 dark:border-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className="block">{copy?.label ?? fallbackLabel}</span>
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                    {copy?.helper ?? t('subscriptions.labels.intervalHelperFallback')}
                  </span>
                </button>
              );
            })}
          </div>
          <div className={clsx('grid gap-4', layout === 'full' ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {plans.map((plan) => renderPlanCard(plan))}
          </div>
          {selectedPlan ? (
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-slate-50 p-6 dark:border-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
                    {selectedPlan.bestFor}
                  </p>
                  {formattedPrice ? (
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {formattedPrice}{' '}
                      <span className="text-base font-medium text-slate-500 dark:text-slate-300">
                        {price?.suffix ?? periodSuffix[effectiveInterval]}
                      </span>
                    </p>
                  ) : null}
                </div>
                {price?.note ? (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{price.note}</p>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{selectedPlan.description}</p>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {selectedPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
              {resolvedFormCopy.title}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{resolvedFormCopy.description}</p>
          </div>
          {subscriptionStatus?.has_active_subscription ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
              {statusCopy.alreadyActive}
              <div className="mt-3">
                <Button asChild size="sm" variant="secondary">
                  <a href="/espace">{statusCopy.manage}</a>
                </Button>
              </div>
            </div>
          ) : null}
          {!user ? (
            <div className="space-y-4">
              <Input
                name="fullName"
                label={resolvedFormCopy.fields.fullName}
                value={formValues.fullName}
                onChange={(event) => setFormValues((prev) => ({ ...prev, fullName: event.target.value }))}
              />
              <Input
                type="email"
                name="email"
                autoComplete="email"
                label={resolvedFormCopy.fields.email}
                value={formValues.email}
                onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
              />
              <Input
                type="password"
                name="password"
                autoComplete="new-password"
                label={resolvedFormCopy.fields.password}
                value={formValues.password}
                onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">{resolvedFormCopy.existingAccountHint}</p>
            </div>
          ) : (
            <p className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
              {t('subscriptions.connectedAs', { email: user.email })}
            </p>
          )}
          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
          <Button className="w-full" disabled={disabled} onClick={() => void handleSubscribe()}>
            {pending ? t('subscriptions.loading') : resolvedFormCopy.submit}
          </Button>
        </div>
      </div>
    </div>
  );
}
