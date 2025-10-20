import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Partenariats publicitaires',
  description: 'Suivez les partenariats responsables et les campagnes sponsoring Lavamedia.'
};

const partners = [
  { name: 'Fondation Bleu', objective: 'Série documentaire climat', status: 'Actif' },
  { name: 'Collectif Quartiers', objective: 'Webinaire storytelling inclusif', status: 'En négociation' }
];

export default function AdminAdvertisingPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Publicité"
        title="Pilotez vos partenariats responsables"
        description="Suivi des campagnes, conformité éthique et reporting d’impact."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {partners.map((partner) => (
          <Card key={partner.name}>
            <CardTitle>{partner.name}</CardTitle>
            <CardDescription>{partner.objective}</CardDescription>
            <p className="mt-4 text-xs uppercase tracking-wide text-primary-500">{partner.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
