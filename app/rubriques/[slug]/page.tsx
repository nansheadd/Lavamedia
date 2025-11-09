import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categories, articles } from '@/lib/mock-data';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { categoryJsonLd } from '@/lib/structured-data';
import { RubriqueDetailContent } from '@/components/pages/RubriqueDetailContent';
import { translations } from '@/i18n/translations';

export const dynamicParams = false;
export const revalidate = 1800;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = categories.find((cat) => cat.slug === params.slug);
  if (!category) return {};
  return buildMetadata({
    title: `${category.title}`,
    description: category.description,
    path: `/rubriques/${category.slug}`,
    type: 'website'
  });
}

export default function RubriqueDetailPage({ params }: { params: { slug: string } }) {
  const category = categories.find((cat) => cat.slug === params.slug);
  if (!category) return notFound();
  const categoryArticles = articles.filter((article) => article.categorySlug === category.slug);
  const categoryByLanguage = {
    fr: translations.fr.categories.find((cat) => cat.slug === params.slug),
    nl: translations.nl.categories.find((cat) => cat.slug === params.slug)
  };
  const articlesByLanguage = {
    fr: categoryArticles,
    nl: translations.nl.articles.filter((article) => article.categorySlug === params.slug)
  };

  return (
    <>
      <JsonLd data={categoryJsonLd(category)} />
      <RubriqueDetailContent categoryByLanguage={categoryByLanguage} articlesByLanguage={articlesByLanguage} />
    </>
  );
}
