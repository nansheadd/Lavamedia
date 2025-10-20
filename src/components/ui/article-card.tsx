import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';

type ArticleCardProps = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
};

export function ArticleCard({ slug, title, category, excerpt, publishedAt }: ArticleCardProps) {
  return (
    <Card>
      <Badge>{category}</Badge>
      <CardTitle className="mt-4 text-2xl">
        <Link
          href={{ pathname: '/article/[slug]', query: { slug } }}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {title}
        </Link>
      </CardTitle>
      <CardDescription>{excerpt}</CardDescription>
      <CardFooter>
        <time dateTime={publishedAt}>{format(new Date(publishedAt), 'd MMMM yyyy', { locale: fr })}</time>
        <Link className="text-primary-600 hover:underline" href={{ pathname: '/article/[slug]', query: { slug } }}>
          Lire l’article
        </Link>
      </CardFooter>
    </Card>
  );
}
