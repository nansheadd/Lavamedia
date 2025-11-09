import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { HomePageContent } from '@/components/pages/HomePageContent';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: 'Lavamedia',
  description: 'Magazine numérique pour journalistes modernes et rédactions agiles.',
  path: '/',
  type: 'website'
});

export default function HomePage() {
  return <HomePageContent />;
}
