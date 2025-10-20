import { SectionHeading } from '@/components/ui/section-heading';
import { SeoSettings } from '@/components/admin/SeoSettings';

export const metadata = {
  title: 'Paramètres SEO',
  description: 'Personnalisez titres, descriptions et balises pour optimiser votre visibilité.'
};

export default function AdminSeoPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="SEO"
        title="Référencez votre marque média"
        description="Gérez les métadonnées globales, les balises OpenGraph et les données structurées."
      />
      <SeoSettings />
    </div>
  );
}
