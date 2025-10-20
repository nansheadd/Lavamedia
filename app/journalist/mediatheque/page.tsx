import Image from 'next/image';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Médiathèque',
  description: 'Retrouvez vos médias enrichis de métadonnées, prêts pour la publication.'
};

const assets = [
  {
    id: '1',
    title: 'Manifestation climat',
    description: 'Place de la République — Crédit : Léa Martin',
    src: 'https://images.unsplash.com/photo-1521292270410-a8c0caaed1e9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    title: 'Studio podcast',
    description: 'Session enregistrement — Crédit : Louis Chen',
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    title: 'Salle de rédaction',
    description: 'Conférence de rédaction — Crédit : Fanny Lemaire',
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'
  }
];

export default function JournalistMediaLibraryPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Médiathèque"
        title="Vos visuels, sons et vidéos centralisés"
        description="Mots-clés, droits d’utilisation et historique des publications accessibles en un clic."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden p-0">
            <div className="relative h-48 w-full">
              <Image
                src={asset.src}
                alt={asset.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <CardTitle>{asset.title}</CardTitle>
              <CardDescription>{asset.description}</CardDescription>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
