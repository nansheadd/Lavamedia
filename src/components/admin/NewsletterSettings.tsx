'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';

const campaigns = [
  { id: '1', name: 'Brief du lundi', audience: 'Abonnés premium', status: 'Programmée' },
  { id: '2', name: 'Partenariat innovation', audience: 'Prospects B2B', status: 'En rédaction' }
];

export function NewsletterSettings() {
  const [frequency, setFrequency] = useState('hebdomadaire');

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Input label="Fréquence par défaut" value={frequency} onChange={(event) => setFrequency(event.target.value)} />
        <Input label="Nom de l’annonceur en vedette" placeholder="Studio Impact" />
        <Button type="button">Mettre à jour</Button>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">Campagnes en cours</h3>
        <ul className="space-y-3 text-sm text-slate-300">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <p className="font-semibold text-white">{campaign.name}</p>
              <p>{campaign.audience}</p>
              <p className="text-xs uppercase tracking-wide text-primary-300">{campaign.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
