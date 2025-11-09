import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { RubriquesPageContent } from '@/components/pages/RubriquesPageContent';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Rubriques',
  description: 'Naviguez dans nos univers éditoriaux : planète, société, culture et innovation.',
  path: '/rubriques',
  type: 'website'
});

export default function RubriquesPage() {
  return <RubriquesPageContent />;
}
