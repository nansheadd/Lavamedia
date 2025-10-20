import type { ArticleSummary, CategorySummary } from '@/types/content';

export const categories: CategorySummary[] = [
  {
    slug: 'planete',
    title: 'Planète',
    description: 'Climat, biodiversité et transitions écologiques.'
  },
  {
    slug: 'societe',
    title: 'Société',
    description: 'Enquêtes sur les dynamiques sociales et solidaires.'
  },
  {
    slug: 'culture',
    title: 'Culture',
    description: 'Création, arts vivants et tendances numériques.'
  }
];

export const articles: ArticleSummary[] = [
  {
    slug: 'oceans-en-peril',
    title: 'Océans en péril : comment les rédactions couvrent l’urgence bleue',
    category: 'Planète',
    categorySlug: 'planete',
    excerpt: 'Rencontre avec des reporters spécialisés qui réinventent la narration environnementale.',
    publishedAt: '2024-04-03',
    author: 'Jeanne Journaliste',
    body: `<h3>Plongée dans les rédactions</h3>
<p>Nous avons interrogé sept rédactions européennes qui expérimentent de nouveaux formats immersifs pour expliquer les défis océaniques.</p>`
  },
  {
    slug: 'intelligence-collective',
    title: 'Intelligence collective : les rédactions qui co-produisent avec leurs lecteurs',
    category: 'Société',
    categorySlug: 'societe',
    excerpt: 'Des initiatives de co-création éditoriale, du fact-checking partagé aux enquêtes collaboratives.',
    publishedAt: '2024-03-22',
    author: 'Alex Admin',
    body: `<h3>Réinventer la relation lecteur</h3>
<p>Quand les lecteurs deviennent contributeurs, la dynamique éditoriale change profondément et ouvre de nouveaux horizons éditoriaux.</p>`
  },
  {
    slug: 'ai-dans-la-culture',
    title: 'Créateurs et IA : chroniques d’une collaboration inspirée',
    category: 'Culture',
    categorySlug: 'culture',
    excerpt: 'Comment les artistes intègrent les algorithmes à leur processus créatif sans perdre leur voix.',
    publishedAt: '2024-02-17',
    author: 'Jeanne Journaliste',
    body: `<h3>IA et art</h3>
<p>Du théâtre immersif aux résidences musicales augmentées, tour d’horizon des initiatives françaises qui marient création et intelligence artificielle.</p>`
  }
];
