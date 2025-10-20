import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata = {
  title: 'Charte éthique',
  description: 'Nos principes de gouvernance, transparence et protection des sources.'
};

export default function ChartePage() {
  return (
    <Container className="prose prose-slate py-16 dark:prose-invert">
      <SectionHeading eyebrow="Éthique" title="Nos engagements" />
      <ul>
        <li>Indépendance éditoriale garantie par un comité composé de membres externes.</li>
        <li>Transparence financière totale sur les partenariats et campagnes sponsorisées.</li>
        <li>Protection renforcée des sources et dispositifs de chiffrement de bout en bout.</li>
      </ul>
    </Container>
  );
}
