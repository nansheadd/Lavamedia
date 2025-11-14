'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { useLanguage, useTranslations } from '@/contexts/language-context';
import { PayWhatYouWantGate } from '@/components/paywall/PayWhatYouWantGate';
import type { ArticleSummary } from '@/types/content';

export type ArticlePageContentProps = {
  articleByLanguage: Record<'fr' | 'nl', ArticleSummary | undefined>;
};

export function ArticlePageContent({ articleByLanguage }: ArticlePageContentProps) {
  const { language } = useLanguage();
  const t = useTranslations();
  const article = articleByLanguage[language] ?? articleByLanguage.fr;

  if (!article) {
    return null;
  }

  const locale = language === 'nl' ? 'nl-NL' : 'fr-FR';
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <article className="bg-white py-16 dark:bg-slate-950">
      <Container className="prose prose-slate max-w-3xl dark:prose-invert">
        <nav aria-label={t('article.breadcrumb')} className="not-prose mb-6 text-sm text-slate-500">
          <Link className="hover:text-primary-600" href="/">
            {t('article.home')}
          </Link>{' '}/{' '}
          <Link className="hover:text-primary-600" href={`/rubriques/${article.categorySlug}`}>
            {article.category}
          </Link>
        </nav>
        <Badge tone="info">{article.category}</Badge>
        <h1>{article.title}</h1>
        <p className="text-sm text-slate-500">
          {t('article.byAuthor', { author: article.author })} —{' '}
          <time dateTime={article.publishedAt}>{t('article.publishedOn', { date: formattedDate })}</time>
        </p>
        <PayWhatYouWantGate slug={article.slug}>
          <div dangerouslySetInnerHTML={{ __html: article.body }} />
        </PayWhatYouWantGate>
      </Container>
    </article>
  );
}
