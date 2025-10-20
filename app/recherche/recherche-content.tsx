'use client';

import { useMemo, useState } from 'react';

import { SearchBar } from '@/components/forms/search-bar';
import { Container } from '@/components/layout/container';
import { ArticleCard } from '@/components/ui/article-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { articles } from '@/lib/mock-data';

export function RechercheContent() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articles;

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized) ||
        article.category.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Recherche"
        title="Trouver l’histoire qui vous inspire"
        description="Explorez nos articles, études de cas et retours d’expérience."
      />
      <div className="mt-8">
        <SearchBar onSearch={setQuery} />
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">Aucun résultat pour « {query} ».</p>
        ) : (
          filtered.map((article) => <ArticleCard key={article.slug} {...article} />)
        )}
      </div>
    </Container>
  );
}
