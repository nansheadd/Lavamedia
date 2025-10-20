import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Administration Lavamedia',
  description: 'Pilotage des utilisateurs, des campagnes et des performances business.'
};

const insights = [
  { label: 'Abonnés actifs', value: '12 560', insight: 'Taux de conversion newsletter 7,2%' },
  { label: 'Campagnes publicitaires', value: '3 en cours', insight: 'CTR moyen 4,8%' },
  { label: 'Rôles attribués', value: '24 journalistes', insight: '6 administrateurs' }
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Administration"
        title="Coordonnez l’écosystème Lavamedia"
        description="Gérez les accès, optimisez le référencement et pilotez les partenariats commerciaux."
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
    </div>
  );
}
