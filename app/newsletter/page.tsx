import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { NewsletterForm } from '@/components/forms/newsletter-form';

export const metadata = {
  title: 'Newsletter',
  description: 'Inscrivez-vous à la newsletter Lavamedia pour recevoir nos enquêtes et nos coulisses.'
};

export default function NewsletterPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Newsletter"
        title="Restez connecté·e à l’avant-garde éditoriale"
        description="Une fois par semaine, un condensé de nos meilleurs articles et des opportunités réservées aux abonnés."
        align="center"
      />
      <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <NewsletterForm />
      </div>
    </Container>
  );
}
