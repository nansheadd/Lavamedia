import Link from 'next/link';
import type { Route } from 'next';
import { Container } from '@/components/layout/container';

const footerLinks = [
  {
    title: 'Lavamedia',
    links: [
      { label: 'À propos', href: '/a-propos' },
      { label: 'Contact', href: '/contact' },
      { label: 'Publicité', href: '/admin/publicite' }
    ]
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Guide rédactionnel', href: '/journalist' },
      { label: 'Charte éthique', href: '/charte' },
      { label: 'Aide', href: '/support' }
    ]
  }
] satisfies Array<{
  title: string;
  links: Array<{ label: string; href: Route }>;
}>;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
      <Container className="flex flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <p className="text-lg font-semibold text-primary-600">Lavamedia</p>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Médias responsables, storytelling innovant et outils pour accélérer votre rédaction.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {section.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link className="hover:text-primary-600" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <Container className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} Lavamedia. Tous droits réservés.
      </Container>
    </footer>
  );
}
