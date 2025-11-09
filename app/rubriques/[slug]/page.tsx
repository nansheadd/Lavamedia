import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categories, articles } from '@/lib/mock-data';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { categoryJsonLd } from '@/lib/structured-data';
import { RubriqueDetailContent } from '@/components/pages/RubriqueDetailContent';
import { translations, type Language } from '@/i18n/translations';
import type { ArticleSummary, CategorySummary } from '@/types/content';

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

type LocalizedCategory = Partial<CategorySummary> & { slug?: string };
type LocalizedArticle = Partial<ArticleSummary> & { slug?: string; categorySlug?: string };

const getLocalizedEntries = <T extends LocalizedCategory | LocalizedArticle>(
  locale: Language,
  key: 'categories' | 'articles'
): T[] => {
  const bucket = translations[locale];
  if (bucket && typeof bucket === 'object') {
    const collection = (bucket as Record<string, unknown>)[key];
    if (Array.isArray(collection)) {
      return collection as T[];
    }
  }
  return [];
};

const mergeCategory = (base: CategorySummary, locale: Language, slug: string): CategorySummary | undefined => {
  if (locale === 'fr') {
    return base;
  }
  const localized = getLocalizedEntries<LocalizedCategory>(locale, 'categories').find((item) => item.slug === slug);
  if (!localized) {
    return undefined;
  }
  const pick = (value: unknown, fallback: string) =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  return {
    slug: base.slug,
    title: pick(localized.title, base.title),
    description: pick(localized.description, base.description)
  };
};

const mergeArticles = (base: ArticleSummary[], locale: Language, slug: string): ArticleSummary[] => {
  if (locale === 'fr') {
    return base;
  }
  const localizedArticles = getLocalizedEntries<LocalizedArticle>(locale, 'articles').filter(
    (item) => item.categorySlug === slug
  );
  if (localizedArticles.length === 0) {
    return base;
  }
  const pick = (value: unknown, fallback: string) =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  return base.map((article) => {
    const localized = localizedArticles.find((item) => item.slug === article.slug);
    if (!localized) {
      return article;
    }
    return {
      ...article,
      title: pick(localized.title, article.title),
      excerpt: pick(localized.excerpt, article.excerpt),
      body: pick(localized.body, article.body)
    };
  });
};

export default function RubriqueDetailPage({ params }: { params: { slug: string } }) {
  const category = categories.find((cat) => cat.slug === params.slug);
  if (!category) return notFound();
  const categoryArticles = articles.filter((article) => article.categorySlug === category.slug);
  const categoryByLanguage: Record<Language, CategorySummary | undefined> = {
    fr: mergeCategory(category, 'fr', params.slug),
    nl: mergeCategory(category, 'nl', params.slug)
  };
  const articlesByLanguage: Record<Language, ArticleSummary[]> = {
    fr: categoryArticles,
    nl: mergeArticles(categoryArticles, 'nl', params.slug)
  };

  return (
    <>
      <JsonLd data={categoryJsonLd(category)} />
      <RubriqueDetailContent categoryByLanguage={categoryByLanguage} articlesByLanguage={articlesByLanguage} />
    </>
  );
}
