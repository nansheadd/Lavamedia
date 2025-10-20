import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { articles } from '@/lib/mock-data';
import { buildMetadata } from '@/lib/seo';
import { Badge } from '@/components/ui/badge';

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.slug}`
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return notFound();

  return (
    <article className="bg-white py-16 dark:bg-slate-950">
      <Container className="prose prose-slate max-w-3xl dark:prose-invert">
        <nav aria-label="Fil d’ariane" className="not-prose mb-6 text-sm text-slate-500">
          <Link className="hover:text-primary-600" href="/">
            Accueil
          </Link>{' '}
          /{' '}
          <Link className="hover:text-primary-600" href={`/rubriques/${article.categorySlug}`}>
            {article.category}
          </Link>
        </nav>
        <Badge tone="info">{article.category}</Badge>
        <h1>{article.title}</h1>
        <p className="text-sm text-slate-500">
          Par {article.author} —{' '}
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
        </p>
        <div dangerouslySetInnerHTML={{ __html: article.body }} />
      </Container>
    </article>
  );
}
