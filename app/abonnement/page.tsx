import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SubscriptionPageContent } from '@/components/pages/SubscriptionPageContent';

export const metadata: Metadata = buildMetadata({
  title: 'Abonnements - Lavamedia',
  description: 'Choisissez une formule Print + Digital ou 100% numérique et soutenez l’indépendance éditoriale de Lavamedia.',
  path: '/abonnement',
  type: 'website'
});

export default function SubscriptionPage() {
  return <SubscriptionPageContent />;
}
