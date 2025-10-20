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

- `app/` : pages publiques, espace journaliste et administration (App Router).
- `src/components/` : design system accessible (boutons, cartes, formulaires, navigation).
- `src/contexts/` : contextes globaux (authentification, providers React Query).
- `src/lib/` : utilitaires (données fictives, SEO, authentification mockée).
- `tests/e2e/` : scénarios Playwright.
- `__tests__/` : tests unitaires.

## Authentification

Authentification mockée avec JWT en localStorage (email + mot de passe `password`). Les rôles disponibles : lecteur, journaliste, admin.
