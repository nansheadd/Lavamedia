import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { categories, articles } from '@/lib/mock-data';

export const metadata = {
  title: 'Rubriques',
  description: 'Naviguez dans nos univers éditoriaux : planète, société, culture et innovation.'
};

export default function RubriquesPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Rubriques"
        title="Nos univers éditoriaux"
        description="Chaque rubrique est pilotée par un collectif d’experts et de journalistes passionnés."
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
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
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
