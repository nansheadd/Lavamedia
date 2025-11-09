'use client';

import { useMemo, useState } from 'react';

import { SearchBar } from '@/components/forms/search-bar';
import { Container } from '@/components/layout/container';
import { ArticleCard } from '@/components/ui/article-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTranslationList, useTranslations } from '@/contexts/language-context';
import type { ArticleSummary } from '@/types/content';

export function RechercheContent() {
  const [query, setQuery] = useState('');
  const t = useTranslations();
  const articles = useTranslationList<ArticleSummary[]>('articles');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articles;

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized) ||
        article.category.toLowerCase().includes(normalized)
    );
  }, [articles, query]);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={t('search.eyebrow')}
        title={t('search.title')}
        description={t('search.description')}
      />
      <div className="mt-8">
        <SearchBar onSearch={setQuery} />
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">{t('search.empty', { query })}</p>
        ) : (
          filtered.map((article) => <ArticleCard key={article.slug} {...article} />)
        )}
      </div>
    </Container>
  );
}
