import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { articles } from '@/lib/mock-data';
import type { ArticleSummary } from '@/types/content';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { articleJsonLd } from '@/lib/structured-data';
import { ArticlePageContent } from '@/components/pages/ArticlePageContent';
import { translations, type Language } from '@/i18n/translations';

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

  type LocalizedArticle = Partial<ArticleSummary> & { slug?: string };

  const getLocalizedArticles = (locale: Language): LocalizedArticle[] => {
    const bucket = translations[locale];
    if (bucket && typeof bucket === 'object') {
      const maybeArticles = (bucket as { articles?: unknown }).articles;
      if (Array.isArray(maybeArticles)) {
        return maybeArticles as LocalizedArticle[];
      }
    }
    return [];
  };

  const buildArticleSummary = (locale: Language): ArticleSummary | undefined => {
    if (locale === 'fr') {
      return article;
    }
    const localized = getLocalizedArticles(locale).find((item) => item.slug === params.slug);
    if (!localized) {
      return undefined;
    }

    const pick = (value: unknown, fallback: string) =>
      typeof value === 'string' && value.trim().length > 0 ? value : fallback;

    return {
      slug: article.slug,
      title: pick(localized.title, article.title),
      category: pick(localized.category, article.category),
      categorySlug: pick(localized.categorySlug, article.categorySlug),
      excerpt: pick(localized.excerpt, article.excerpt),
      publishedAt: pick(localized.publishedAt, article.publishedAt),
      author: pick(localized.author, article.author),
      body: pick(localized.body, article.body),
      heroImage:
        typeof localized.heroImage === 'string' && localized.heroImage.trim().length > 0
          ? localized.heroImage
          : article.heroImage,
      updatedAt:
        typeof localized.updatedAt === 'string' && localized.updatedAt.trim().length > 0
          ? localized.updatedAt
          : article.updatedAt
    };
  };

  const articleByLanguage = {
    fr: buildArticleSummary('fr'),
    nl: buildArticleSummary('nl')
  };

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <ArticlePageContent articleByLanguage={articleByLanguage} />
    </>
  );
}
