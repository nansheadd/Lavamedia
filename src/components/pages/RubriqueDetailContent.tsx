'use client';

import { useLanguage, useTranslations } from '@/contexts/language-context';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArticleCard } from '@/components/ui/article-card';
import type { ArticleSummary, CategorySummary } from '@/types/content';

export type RubriqueDetailContentProps = {
  categoryByLanguage: Record<'fr' | 'nl', CategorySummary | undefined>;
  articlesByLanguage: Record<'fr' | 'nl', ArticleSummary[]>;
};

export function RubriqueDetailContent({ categoryByLanguage, articlesByLanguage }: RubriqueDetailContentProps) {
  const { language } = useLanguage();
  const t = useTranslations();
  const category = categoryByLanguage[language] ?? categoryByLanguage.fr;
  const articles = articlesByLanguage[language] ?? articlesByLanguage.fr ?? [];

  if (!category) {
    return null;
  }

  return (
    <Container className="py-16">
      <SectionHeading eyebrow={t('rubriques.eyebrow')} title={category.title} description={category.description} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">{t('rubriques.empty')}</p>
        ) : (
          articles.map((article) => <ArticleCard key={article.slug} {...article} />)
        )}
      </div>
    </Container>
  );
}
