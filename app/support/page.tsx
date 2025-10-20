import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

const faqs = [
  {
    question: 'Comment accéder à l’espace journaliste ? ',
    answer: 'Inscrivez-vous avec votre e-mail professionnel. L’équipe admin valide sous 24h.'
  },
  {
    question: 'Puis-je proposer une rubrique ?',
    answer: 'Oui. Envoyez votre pitch via le formulaire contact. Nous revenons vers vous rapidement.'
  }
];

export const metadata = {
  title: 'Support',
  description: 'Assistance éditeurs, journalistes et partenaires.'
};

export default function SupportPage() {
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Support" title="Ressources et FAQ" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <CardTitle>{faq.question}</CardTitle>
            <CardDescription>{faq.answer}</CardDescription>
          </Card>
        ))}
      </div>
    </Container>
  );
}
