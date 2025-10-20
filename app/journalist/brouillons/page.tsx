import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Gestion des brouillons',
  description: 'Coordonnez la rédaction collaborative et les validations de vos articles.'
};

const drafts = [
  {
    title: 'Climat : comment couvrir les COP différemment',
    updatedAt: '2024-04-17T11:32:00.000Z',
    status: 'En relecture',
    owner: 'Jeanne Journaliste'
  },
  {
    title: 'Podcast : la voix des quartiers populaires',
    updatedAt: '2024-04-15T09:12:00.000Z',
    status: 'À compléter',
    owner: 'Yanis Reporter'
  }
];

export default function JournalistDraftsPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Brouillons"
        title="Centralisez vos articles en préparation"
        description="Assignez des tâches, commentez les passages clés et suivez les validations."
      />
      <div className="grid gap-6">
        {drafts.map((draft) => (
          <Card key={draft.title}>
            <CardTitle>{draft.title}</CardTitle>
            <CardDescription>{draft.owner}</CardDescription>
            <CardFooter>
              <p className="text-xs text-slate-500">
                Modifié le {new Date(draft.updatedAt).toLocaleString('fr-FR')}
              </p>
              <Button variant="ghost">Ouvrir</Button>
            </CardFooter>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary-500">{draft.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
