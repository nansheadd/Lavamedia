import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Input } from '@/components/forms/input';
import { TextArea } from '@/components/forms/textarea';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact',
  description: 'Discutez avec l’équipe Lavamedia pour vos projets éditoriaux, partenariats et recrutements.'
};

export default function ContactPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Écrivez-nous"
        description="Nous répondons sous 48h à toutes les sollicitations presse et partenariats."
      />
      <form className="mt-8 grid gap-6 sm:max-w-xl">
        <Input label="Nom complet" name="name" />
        <Input label="Adresse e-mail" type="email" name="email" />
        <TextArea label="Message" name="message" rows={6} />
        <Button type="submit">Envoyer</Button>
      </form>
    </Container>
  );
}
