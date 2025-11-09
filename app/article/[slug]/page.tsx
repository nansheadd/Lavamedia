import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { articles } from '@/lib/mock-data';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { articleJsonLd } from '@/lib/structured-data';
import { ArticlePageContent } from '@/components/pages/ArticlePageContent';
import { translations } from '@/i18n/translations';

export const dynamicParams = false;
export const revalidate = 1800;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.publishedAt
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return notFound();

  const articleByLanguage = {
    fr: translations.fr.articles.find((item) => item.slug === params.slug),
    nl: translations.nl.articles.find((item) => item.slug === params.slug)
  };

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <ArticlePageContent articleByLanguage={articleByLanguage} />
    </>
  );
}
