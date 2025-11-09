'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { JsonLd } from '@/components/seo/json-ld';
import { categoryJsonLd } from '@/lib/structured-data';
import { useLanguage, useTranslationList, useTranslations } from '@/contexts/language-context';
import type { ArticleSummary, CategorySummary } from '@/types/content';

export function RubriquesPageContent() {
  const t = useTranslations();
  const { language } = useLanguage();
  const categories = useTranslationList<CategorySummary[]>('categories');
  const articles = useTranslationList<ArticleSummary[]>('articles');
  const locale = language === 'nl' ? 'nl-NL' : 'fr-FR';

  const jsonLd = useMemo(() => categories.map(categoryJsonLd), [categories]);

  return (
    <Container className="py-16">
      <JsonLd data={jsonLd} />
      <SectionHeading
        eyebrow={t('rubriques.eyebrow')}
        title={t('rubriques.title')}
        description={t('rubriques.description')}
        align="center"
      />
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.slug}>
            <CardTitle>{category.title}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              {articles
                .filter((article) => article.categorySlug === category.slug)
                .map((article) => (
                  <div key={article.slug} className="flex items-center justify-between">
                    <Link className="hover:text-primary-600" href={`/article/${article.slug}`}>
                      {article.title}
                    </Link>
                    <time className="text-xs" dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(locale)}
                    </time>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
