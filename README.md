# Lavamedia

Plateforme Next.js pour la rédaction numérique Lavamedia. Ce monorepo contient le site public, l’espace journaliste et l’interface d’administration.

## Prérequis

### Frontend

- Node.js 18+
- Un gestionnaire de paquets JavaScript (`pnpm` recommandé, `npm` ou `yarn` possibles)

### Backend

- Python 3.10+
- `pip`
- (Optionnel) [Meilisearch](https://www.meilisearch.com/) si vous activez l'extra `search`

## Installation

### Configuration locale

Dupliquez (ou laissez en place) les fichiers d'environnement générés pour le développement :

- `.env` pour l'API FastAPI (SQLite locale + CORS sur http://localhost:3000 et http://127.0.0.1:3000).
- `.env.local` pour le frontend Next.js (`NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` et `NEXT_PUBLIC_ENABLE_MOCK_AUTH=false`).

Assurez-vous ensuite de démarrer les deux services avec ces fichiers chargés.

### Frontend

```bash
pnpm install
```

### Backend

Créez un environnement virtuel puis installez le projet :

```bash
python -m venv .venv
source .venv/bin/activate  # Windows : .\.venv\Scripts\activate
pip install -e .
```

Installez l'extra `search` uniquement si vous avez besoin de Meilisearch :

```bash
pip install ".[search]"
```

Exécutez ensuite les migrations et démarrez l'API :

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Les paramètres d'environnement peuvent être surchargés via un fichier `.env` à la racine.

## Développement

### Frontend

```bash
pnpm dev
```

Le site est disponible sur http://localhost:3000.

### Backend

L'API FastAPI tourne par défaut sur http://localhost:8000 et expose la documentation OpenAPI sur http://localhost:8000/docs.

Pour arrêter les serveurs, utilisez `Ctrl+C` dans les terminaux concernés.

## Tests

- Tests unitaires (Jest + React Testing Library)

  ```bash
  pnpm test
  ```

- Tests end-to-end (Playwright)

  ```bash
  pnpm test:e2e
  ```

- Tests backend (pytest)

  ```bash
  pytest
  ```

## Git : repartir d'une base saine

Si votre branche locale a divergé de `origin/main`, vous pouvez la réaligner ainsi :

```bash
git fetch origin
git switch main
git reset --hard origin/main
```

Créez ensuite une branche de travail propre :

```bash
git switch -c ma-fonctionnalite
```

## Structure

- `app/` : pages publiques, espace auteur et administration (App Router).
- `src/components/` : design system accessible (boutons, cartes, formulaires, navigation).
- `src/contexts/` : contextes globaux (authentification, providers React Query).
- `src/lib/` : utilitaires (données fictives, SEO, authentification mockée).
- `tests/e2e/` : scénarios Playwright.
- `__tests__/` : tests unitaires.

## Authentification

Le frontend tente d'abord d'appeler l'URL définie par `NEXT_PUBLIC_API_URL`. En développement, si cette URL est inaccessible, il retombe automatiquement sur `http://127.0.0.1:8000/api` (puis `http://localhost:8000/api`) pour joindre votre API locale. Si aucune API n'est atteignable, un mode démo se déclenche : utilisez `admin@lava.com` / `password` et un profil administrateur est injecté côté client. Définissez `NEXT_PUBLIC_ENABLE_MOCK_AUTH=false` pour forcer l'appel systématique de l'API. Les rôles disponibles : lecteur, auteur, éditeur, contributeur, abonné, client et admin.

Les identifiants suivants sont seedés automatiquement côté backend :

- `admin@lava.com` / `password` → rôle administrateur
- `editeur@lava.com` / `password` → rôle éditeur
- `auteur@lava.com` / `password` → rôle auteur
- `contributeur@lava.com` / `password` → rôle contributeur
- `abonne@lava.com` / `password` → rôle abonné
- `client@lava.com` / `password` → rôle client

## Abonnements Stripe

Le site propose désormais une page dédiée (`/abonnement`) ainsi qu’un module sur la page d’accueil pour choisir une formule (Print + Digital, Digital ou Hauts revenus) avec passage instantané sur Stripe Checkout. Le backend expose `/api/billing/checkout` pour créer les sessions, `/api/billing/me` pour récupérer l’état de l’abonnement côté lecteur, un webhook `/api/billing/webhook` ainsi qu’un tableau de bord live dans `/admin`.

### Variables d’environnement à renseigner

Ajoutez les clés suivantes côté backend (`.env`, Render, etc.) :

- `STRIPE_API_KEY` – clé secrète Stripe (test ou production).
- `STRIPE_WEBHOOK_SECRET` – secret de signature pour le webhook lié à `/api/billing/webhook`.
- `STRIPE_PRICE_CLASSIC_MONTHLY` / `STRIPE_PRICE_CLASSIC_ANNUAL` – IDs de prix pour la formule Classique.
- `STRIPE_PRICE_DIGITAL_MONTHLY` / `STRIPE_PRICE_DIGITAL_ANNUAL` – IDs de prix pour la formule Digital (le mensuel peut rester vide si non utilisé).
- `STRIPE_PRICE_SUPPORTER_MONTHLY` / `STRIPE_PRICE_SUPPORTER_ANNUAL` – IDs de prix pour la formule « Hauts revenus `.

Le webhook vérifie la signature Stripe si `STRIPE_WEBHOOK_SECRET` est défini. Pensez à configurer Stripe CLI (`stripe listen --forward-to localhost:8000/api/billing/webhook`) en local pour tester la synchro. En production, exposez l’URL `/api/billing/webhook` dans le dashboard Stripe.

Lorsque Stripe confirme un abonnement, l’utilisateur reçoit automatiquement le rôle `subscriber`. Si aucun abonnement actif n’est présent, le rôle est retiré afin de limiter l’accès aux contenus réservés.
