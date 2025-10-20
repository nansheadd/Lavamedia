import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Dashboard journaliste',
  description: 'Visualisez vos indicateurs clés et l’activité de la rédaction.'
};

const metrics = [
  { label: 'Lecteurs uniques', value: '38 420', change: '+12% vs. semaine dernière' },
  { label: 'Temps moyen de lecture', value: '4 min 32', change: '+9% sur 30 jours' },
  { label: 'Taux de complétion', value: '72%', change: '+5 pts sur les reportages longs' }
];

export default function JournalistDashboardPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Espace journaliste"
        title="Piloter vos contenus en un coup d’œil"
        description="Suivez la performance de vos articles, coordonnez l’équipe et publiez en toute sérénité."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-gradient-to-br from-primary-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <CardTitle>{metric.value}</CardTitle>
            <CardDescription>{metric.label}</CardDescription>
            <p className="mt-4 text-xs font-semibold text-emerald-600">{metric.change}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
