import type { ArticleSummary } from '@/types/content';

const BASE_URL = 'https://www.lavamedia.example';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Lavamedia',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`
    },
    sameAs: [
      'https://twitter.com/lavamedia',
      'https://www.linkedin.com/company/lavamedia'
    ]
  } as const;
}

export function articleJsonLd(article: ArticleSummary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/article/${article.slug}`
    },
    image: article.heroImage ?? `${BASE_URL}/og-image.jpg`,
    publisher: {
      '@type': 'Organization',
      name: 'Lavamedia',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`
      }
    }
  } as const;
}

export function categoryJsonLd(category: { title: string; slug: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.title,
    description: category.description,
    url: `${BASE_URL}/rubriques/${category.slug}`
  } as const;
}

export function homepageJsonLd(featured: ArticleSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Lavamedia',
    description: 'Magazine numérique pour journalistes modernes et rédactions agiles.',
    url: BASE_URL,
    about: 'Magazine nouvelle génération',
    hasPart: featured.map((article) => ({
      '@type': 'NewsArticle',
      headline: article.title,
      url: `${BASE_URL}/article/${article.slug}`
    }))
  } as const;
}
