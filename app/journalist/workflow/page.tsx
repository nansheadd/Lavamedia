import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Workflow de publication',
  description: 'Gérez chaque étape du pitch à la diffusion avec des actions guidées.'
};

const steps = [
  {
    title: 'Pitch validé',
    description: 'Rassemblez les notes, sources et angle éditorial dans un modèle guidé.',
    actions: ['Attribution du sujet', 'Checklist de faisabilité']
  },
  {
    title: 'Rédaction',
    description: 'Travaillez à plusieurs sur le même brouillon, suivez les versions et commentaires.',
    actions: ['Assignation relecture', 'Validation juridique']
  },
  {
    title: 'Publication',
    description: 'Automatisez la mise en ligne multicanal et le partage aux abonnés.',
    actions: ['Programmation', 'Diffusion newsletter']
  }
];

export default function JournalistWorkflowPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Workflow"
        title="Un circuit de publication maîtrisé"
        description="Synchronisez la rédaction, la validation éditoriale et la diffusion en quelques clics."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
            <ul className="mt-4 space-y-2 text-xs text-slate-500">
              {step.actions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
