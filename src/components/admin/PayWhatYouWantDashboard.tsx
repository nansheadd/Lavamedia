'use client';

import { useEffect, useState } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type PaywallDashboard,
  type PaywallConfig,
  getPaywallDashboard,
  updatePaywallConfig
} from '@/lib/paywall-service';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(value / 100);
}

export function PayWhatYouWantDashboard() {
  const [data, setData] = useState<PaywallDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingConfig, setUpdatingConfig] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const dashboard = await getPaywallDashboard();
      setData(dashboard);
      setError(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Impossible de charger les données Pay What You Want.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleDatawall = async (config: PaywallConfig) => {
    setUpdatingConfig(config.id);
    try {
      await updatePaywallConfig(config.id, { datawall_enabled: !config.datawall_enabled });
      await load();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Action impossible. Vérifiez vos droits.';
      setError(message);
    } finally {
      setUpdatingConfig(null);
    }
  };

  const togglePaywall = async (config: PaywallConfig) => {
    setUpdatingConfig(config.id);
    try {
      await updatePaywallConfig(config.id, {
        pay_what_you_want_enabled: !config.pay_what_you_want_enabled
      });
      await load();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Action impossible. Vérifiez vos droits.';
      setError(message);
    } finally {
      setUpdatingConfig(null);
    }
  };

  const stats = data?.stats;
  const supporters = stats?.supporters ?? 0;
  const leads = stats?.leads ?? 0;
  const monthly = formatCurrency(stats?.monthly_amount_cents ?? 0);
  const annual = formatCurrency(stats?.annual_amount_cents ?? 0);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Pay What You Want</p>
        <h3 className="text-2xl font-semibold text-slate-900">Pilotez la datawall et vos soutiens</h3>
        <p className="mt-1 text-sm text-slate-500">
          Suivez les leads collectés, visualisez les contributions mensuelles et désactivez la datawall article par article.
        </p>
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardTitle>{supporters}</CardTitle>
          <CardDescription>Soutiens actifs</CardDescription>
        </Card>
        <Card>
          <CardTitle>{leads}</CardTitle>
          <CardDescription>Leads collectés</CardDescription>
        </Card>
        <Card>
          <CardTitle>{monthly}</CardTitle>
          <CardDescription>Revenus mensuels</CardDescription>
        </Card>
        <Card>
          <CardTitle>{annual}</CardTitle>
          <CardDescription>Revenus annuels</CardDescription>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Contributions récentes</CardTitle>
          <CardDescription>Premier aperçu des soutiens Pay What You Want</CardDescription>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {data?.subscriptions?.length ? (
              data.subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {subscription.user?.full_name || subscription.user?.email || subscription.lead_email || 'Lecteur anonyme'}
                  </p>
                  <p>{formatCurrency(subscription.amount_cents ?? 0)} · {subscription.interval}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="info">{subscription.status}</Badge>
                    {subscription.lead_email ? <span className="text-xs text-slate-400">{subscription.lead_email}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucune contribution enregistrée.</p>
            )}
          </div>
        </Card>
        <Card>
          <CardTitle>Leads récents</CardTitle>
          <CardDescription>Emails collectés via la datawall</CardDescription>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {data?.intents?.length ? (
              data.intents.slice(0, 5).map((intent) => (
                <div key={intent.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{intent.email}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{intent.slug}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucun lead pour l’instant.</p>
            )}
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Configuration datawall</CardTitle>
        <CardDescription>Activez ou suspendez la collecte e-mail pour chaque slug.</CardDescription>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {data?.configs?.length ? (
            data.configs.map((config) => (
              <div
                key={config.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{config.slug}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{config.scope}</p>
                  <p className="text-xs text-slate-500">
                    Datawall {config.datawall_enabled ? 'active' : 'désactivée'} · Pay What You Want{' '}
                    {config.pay_what_you_want_enabled ? 'visible' : 'masqué'} · Min {formatCurrency(config.min_amount_cents)} · Max{' '}
                    {formatCurrency(config.max_amount_cents)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void toggleDatawall(config)}
                    disabled={updatingConfig === config.id || loading}
                  >
                    {config.datawall_enabled ? 'Désactiver datawall' : 'Activer datawall'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void togglePaywall(config)}
                    disabled={updatingConfig === config.id || loading}
                  >
                    {config.pay_what_you_want_enabled ? 'Masquer Pay What You Want' : 'Afficher Pay What You Want'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucune configuration enregistrée.</p>
          )}
        </div>
      </Card>
    </section>
  );
}
