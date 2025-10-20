import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArticleCard } from '@/components/ui/article-card';
import { categories, articles } from '@/lib/mock-data';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { categoryJsonLd } from '@/lib/structured-data';

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

export default function RubriqueDetailPage({ params }: { params: { slug: string } }) {
  const category = categories.find((cat) => cat.slug === params.slug);
  if (!category) return notFound();
  const categoryArticles = articles.filter((article) => article.categorySlug === category.slug);

  return (
    <Container className="py-16">
      <JsonLd data={categoryJsonLd(category)} />
      <SectionHeading
        eyebrow="Rubrique"
        title={category.title}
        description={category.description}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoryArticles.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">Cette rubrique n’a pas encore d’article publié.</p>
        ) : (
          categoryArticles.map((article) => <ArticleCard key={article.slug} {...article} />)
        )}
      </div>
    </Container>
  );
}
