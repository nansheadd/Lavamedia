'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArticleCard } from '@/components/ui/article-card';
import { NewsletterForm } from '@/components/forms/newsletter-form';
import { JsonLd } from '@/components/seo/json-ld';
import { homepageJsonLd } from '@/lib/structured-data';
import { useTranslationList, useTranslations } from '@/contexts/language-context';
import type { ArticleSummary } from '@/types/content';

export function HomePageContent() {
  const t = useTranslations();
  const articles = useTranslationList<ArticleSummary[]>('articles');
  const featured = articles.slice(0, 3);
  const communityBullets = useTranslationList<string[]>('home.community.bullets');

  return (
    <div>
      <JsonLd data={homepageJsonLd(featured)} />
      <section className="relative overflow-hidden">
        <Container className="grid gap-12 py-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/rubriques"
                className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                {t('home.hero.primaryCta')}
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                {t('home.hero.secondaryCta')}
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-primary-100 via-white to-primary-50 p-10 shadow-xl dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{t('home.brief.title')}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('home.brief.description')}</p>
            <div className="mt-6 grid gap-4">
              {featured.map((article) => (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary-200 hover:shadow dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="text-xs font-semibold uppercase text-primary-600">{article.category}</span>
                  <span className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{article.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
        <Container>
          <SectionHeading
            eyebrow={t('home.spotlight.eyebrow')}
            title={t('home.spotlight.title')}
            description={t('home.spotlight.description')}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </Container>
      </section>
      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow={t('home.community.eyebrow')}
              title={t('home.community.title')}
              description={t('home.community.description')}
            />
            <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              {communityBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {t('home.community.newsletterTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t('home.community.newsletterDescription')}
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
