import type { MetadataRoute } from 'next';

import { articles, categories } from '@/lib/mock-data';

const BASE_URL = 'https://www.lavamedia.example';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/rubriques',
    '/contact',
    '/newsletter',
    '/a-propos'
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date().toISOString()
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt).toISOString()
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${BASE_URL}/rubriques/${category.slug}`,
    lastModified: new Date().toISOString()
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
