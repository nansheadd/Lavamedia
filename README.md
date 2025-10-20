# Lavamedia

Plateforme Next.js pour la rédaction numérique Lavamedia. Ce monorepo contient le site public, l’espace journaliste et l’interface d’administration.

## Prérequis

- Node.js 18+
- pnpm, npm ou yarn

## Installation

```bash
pnpm install
```

## Développement

```bash
pnpm dev
```

Le site est disponible sur http://localhost:3000.

## Tests

- Tests unitaires (Jest + React Testing Library)

  ```bash
  pnpm test
  ```

- Tests end-to-end (Playwright)

  ```bash
  pnpm test:e2e
  ```

## Structure

- `app/` : pages publiques, espace journaliste et administration (App Router).
- `src/components/` : design system accessible (boutons, cartes, formulaires, navigation).
- `src/contexts/` : contextes globaux (authentification, providers React Query).
- `src/lib/` : utilitaires (données fictives, SEO, authentification mockée).
- `tests/e2e/` : scénarios Playwright.
- `__tests__/` : tests unitaires.

## Authentification

Authentification mockée avec JWT en localStorage (email + mot de passe `password`). Les rôles disponibles : lecteur, journaliste, admin.
