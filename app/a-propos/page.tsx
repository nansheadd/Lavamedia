import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata = {
  title: 'À propos',
  description: 'Notre manifeste éditorial et notre manière de concevoir le journalisme responsable.'
};

export default function AProposPage() {
  return (
    <Container className="prose prose-slate py-16 dark:prose-invert">
      <SectionHeading eyebrow="Manifeste" title="Notre mission" />
      <p>
        Lavamedia accompagne les rédactions qui souhaitent créer un journalisme d’impact, participatif et durable. Nous
        combinons savoir-faire éditorial, design systémique et technologies responsables.
      </p>
      <p>
        Notre équipe rassemble des journalistes, des product designers, des développeurs et des chercheurs en sciences
        sociales. Ensemble, nous expérimentons des formats qui mettent les communautés au centre.
      </p>
    </Container>
  );
}
