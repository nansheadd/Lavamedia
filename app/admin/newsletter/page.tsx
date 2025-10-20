import { SectionHeading } from '@/components/ui/section-heading';
import { NewsletterSettings } from '@/components/admin/NewsletterSettings';

export const metadata = {
  title: 'Newsletter & publicité',
  description: 'Planifiez vos campagnes et coordonnez les partenariats commerciaux.'
};

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Newsletter & publicité"
        title="Activez vos audiences"
        description="Planifiez les campagnes newsletters, gérez les sponsorings et optimisez vos segments."
      />
      <NewsletterSettings />
    </div>
  );
}
