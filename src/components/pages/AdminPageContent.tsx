'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage, useTranslationList, useTranslations } from '@/contexts/language-context';
import { getAdminSubscriptionOverview, type AdminSubscriptionsOverview } from '@/lib/billing-service';

type MonitoringStatus = 'pending' | 'approved' | 'rejected' | 'notified';

type MonitoringEvent = {
  id: string;
  user: string;
  role: string;
  action: string;
  asset: string;
  timestamp: string;
  status: MonitoringStatus;
  canValidate?: boolean;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'success';
  action?: string;
};

type PermissionState = 'full' | 'approve' | 'edit' | 'view' | 'blocked';

type PermissionRole = { id: string; label: string };

type PermissionMatrixEntry = {
  capability: string;
  description: string;
  rules: Record<string, PermissionState>;
};

type SubscriptionSegment = {
  id: string;
  label: string;
  total: string;
  trend: string;
  roleFocus: string;
  description: string;
  actions: string[];
};

type SubscriptionHighlight = {
  id: string;
  user: string;
  role: string;
  action: string;
};

export function AdminPageContent() {
  const t = useTranslations();
  const insights = useTranslationList<Array<{ label: string; value: string; insight: string }>>('admin.insights');
  const monitoringEvents = useTranslationList<MonitoringEvent[]>('admin.monitoring.events');
  const notifications = useTranslationList<NotificationItem[]>('admin.notifications.items');
  const permissionRoles = useTranslationList<PermissionRole[]>('admin.permissions.roles');
  const permissionMatrix = useTranslationList<PermissionMatrixEntry[]>('admin.permissions.matrix');
  const subscriptionSegments = useTranslationList<SubscriptionSegment[]>('admin.subscriptions.segments');
  const subscriptionHighlights = useTranslationList<SubscriptionHighlight[]>('admin.subscriptions.highlights');
  const planLabels = useTranslationList<Record<string, string>>('admin.subscriptions.planLabels');
  const intervalLabels = useTranslationList<Record<string, string>>('admin.subscriptions.intervalLabels');
  const statusLabels = useTranslationList<Record<string, string>>('admin.subscriptions.statusLabels');
  const { language } = useLanguage();
  const [subscriptionOverview, setSubscriptionOverview] = useState<AdminSubscriptionsOverview | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setSubscriptionLoading(true);
    try {
      const overview = await getAdminSubscriptionOverview();
      setSubscriptionOverview(overview);
      setSubscriptionError(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('admin.subscriptions.error');
      setSubscriptionError(message);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const formatAmount = useCallback(
    (amountCents: number | null, currency: string) => {
      if (amountCents === null || amountCents === undefined) {
        return '—';
      }
      return new Intl.NumberFormat(language === 'nl' ? 'nl-BE' : 'fr-BE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
      }).format(amountCents / 100);
    },
    [language]
  );

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) {
        return '—';
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '—';
      }
      return new Intl.DateTimeFormat(language === 'nl' ? 'nl-BE' : 'fr-BE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    },
    [language]
  );

  const statusTone: Record<MonitoringStatus, 'info' | 'success' | 'warning'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'info',
    notified: 'info'
  };

  const permissionStateTone: Record<PermissionState, string> = {
    full: 'bg-emerald-100 text-emerald-900',
    approve: 'bg-primary-100 text-primary-800',
    edit: 'bg-blue-100 text-blue-900',
    view: 'bg-slate-100 text-slate-900',
    blocked: 'bg-rose-100 text-rose-900'
  };

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t('admin.eyebrow')}
        title={t('admin.title')}
        description={t('admin.description')}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {insights.map((item) => (
          <Card key={item.label} className="bg-slate-900 text-slate-50">
            <CardTitle>{item.value}</CardTitle>
            <CardDescription>{item.label}</CardDescription>
            <p className="mt-4 text-xs text-primary-300">{item.insight}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-slate-800 bg-slate-950 text-slate-50">
          <div className="flex flex-col gap-2 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary-300">{t('admin.monitoring.title')}</p>
              <h3 className="mt-1 text-2xl font-semibold">{t('admin.monitoring.description')}</h3>
            </div>
            <Badge tone="info" className="bg-primary-400/20 text-primary-100">
              {t('admin.monitoring.liveLabel')}
            </Badge>
          </div>
          <ul className="divide-y divide-slate-800">
            {monitoringEvents.map((event) => (
              <li key={event.id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                      {event.user
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{event.user}</p>
                      <p className="text-xs text-slate-400">{event.role}</p>
                    </div>
                  </div>
                  <Badge tone={statusTone[event.status]}>{t(`admin.monitoring.status.${event.status}`)}</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-200">
                  <span className="font-semibold">{event.action}</span> · {event.asset}
                </p>
                <p className="mt-1 text-xs text-slate-500">{event.timestamp}</p>
                {event.canValidate && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="primary" className="bg-emerald-500 hover:bg-emerald-600">
                      {t('admin.monitoring.validate')}
                    </Button>
                    <Button type="button" variant="secondary" className="bg-slate-800 text-slate-50 hover:bg-slate-700">
                      {t('admin.monitoring.invalidate')}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
            <p className="text-sm uppercase tracking-wide text-primary-600">{t('admin.notifications.title')}</p>
            <h3 className="text-xl font-semibold text-slate-900">{t('admin.notifications.description')}</h3>
          </div>
          <ul className="mt-4 space-y-4">
            {notifications.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <Badge tone={item.severity}>{t(`admin.notifications.severity.${item.severity}`)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                {item.action ? (
                  <Button type="button" variant="ghost" className="mt-3 px-0 text-sm font-semibold">
                    {item.action}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary-600">{t('admin.permissions.title')}</p>
            <h3 className="text-2xl font-semibold text-slate-900">{t('admin.permissions.description')}</h3>
          </div>
          <p className="text-sm text-slate-500">{t('admin.permissions.helper')}</p>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-500">{t('admin.permissions.capability')}</th>
                {permissionRoles.map((role) => (
                  <th key={role.id} className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionMatrix.map((entry) => (
                <tr key={entry.capability}>
                  <td className="px-6 py-4 align-top">
                    <p className="font-semibold text-slate-900">{entry.capability}</p>
                    <p className="text-xs text-slate-500">{entry.description}</p>
                  </td>
                  {permissionRoles.map((role) => {
                    const state = entry.rules[role.id];
                    const label = state ? t(`admin.permissions.states.${state}`) : '—';
                    return (
                      <td key={role.id} className="px-4 py-4 text-center">
                        {state ? (
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${permissionStateTone[state]}`}>
                            {label}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary-600">{t('admin.subscriptions.title')}</p>
            <h3 className="text-2xl font-semibold text-slate-900">{t('admin.subscriptions.description')}</h3>
            {subscriptionError ? (
              <p className="text-sm font-medium text-rose-600">{subscriptionError}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="self-start px-0 text-sm font-semibold"
            disabled={subscriptionLoading}
            onClick={() => void loadSubscriptions()}
          >
            {subscriptionLoading ? t('admin.subscriptions.loading') : t('admin.subscriptions.refresh')}
          </Button>
        </div>
        {subscriptionOverview ? (
          <>
            <div className="grid gap-4 lg:grid-cols-4">
              {[
                { key: 'total', value: subscriptionOverview.stats.total, label: t('admin.subscriptions.metrics.total') },
                { key: 'active', value: subscriptionOverview.stats.active, label: t('admin.subscriptions.metrics.active') },
                { key: 'pastDue', value: subscriptionOverview.stats.past_due, label: t('admin.subscriptions.metrics.pastDue') },
                { key: 'issues', value: subscriptionOverview.stats.issues, label: t('admin.subscriptions.metrics.issues') }
              ].map((stat) => (
                <Card key={stat.key} className="bg-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
                </Card>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">{t('admin.subscriptions.liveFeedTitle')}</p>
              {subscriptionOverview.items.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">{t('admin.subscriptions.empty')}</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {subscriptionOverview.items.slice(0, 6).map((item) => {
                    const statusTone: Record<string, 'info' | 'warning' | 'success'> = {
                      active: 'success',
                      trialing: 'info',
                      canceled: 'info',
                      past_due: 'warning',
                      unpaid: 'warning',
                      incomplete: 'warning'
                    };
                    const tone = statusTone[item.status] ?? 'info';
                    return (
                      <li key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.user.full_name ?? item.user.email}
                            </p>
                            <p className="text-xs text-slate-500">{item.user.email}</p>
                          </div>
                          <Badge tone={tone}>{statusLabels[item.status] ?? item.status}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          {planLabels[item.plan_slug] ?? item.plan_slug} ·{' '}
                          {intervalLabels[item.interval] ?? item.interval}
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {formatAmount(item.amount_cents, item.currency)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t('admin.subscriptions.nextCharge', { date: formatDate(item.current_period_end) })}
                        </p>
                        {item.last_payment_error ? (
                          <p className="mt-2 text-xs font-medium text-rose-600">{item.last_payment_error}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {subscriptionSegments.map((segment) => (
                <Card key={segment.id} className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{segment.label}</p>
                    <Badge tone="info">{segment.trend}</Badge>
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{segment.total}</p>
                  <p className="mt-1 text-sm text-slate-600">{segment.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{segment.roleFocus}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {segment.actions.map((action) => (
                      <li key={action} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                        {action}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">{t('admin.subscriptions.highlightsTitle')}</p>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {subscriptionHighlights.map((highlight) => (
                  <li key={highlight.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{highlight.user}</p>
                    <p className="text-xs text-slate-500">{highlight.role}</p>
                    <p className="mt-2 text-sm text-slate-700">{highlight.action}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
