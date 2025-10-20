# Déploiement sur Render

Ce guide explique comment déployer l'application Lavamedia sur [Render](https://render.com) en conservant le dépôt monorepo tout en séparant le frontend Next.js et le backend FastAPI dans deux services distincts.

## 1. Aperçu de l'architecture Render

Le fichier [`render.yaml`](../../render.yaml) définit une *Render Blueprint* composée de trois ressources :

- **Base de données** : un PostgreSQL managé (`lavamedia-db`).
- **Backend FastAPI** : service Web Python qui exécute le script [`deploy/render/backend/start.sh`](../../deploy/render/backend/start.sh) afin d'appliquer les migrations Alembic puis de lancer Uvicorn.
- **Frontend Next.js** : service Web Node.js qui construit et sert l'interface (`npm run build` puis `npm run start`).

Les exemples de variables d'environnement sont regroupés dans [`deploy/render/backend/env.example`](../../deploy/render/backend/env.example) et [`deploy/render/frontend/env.example`](../../deploy/render/frontend/env.example).

## 2. Pré-requis

1. Un compte Render avec accès aux services Web et à PostgreSQL.
2. Un fork ou accès en écriture au dépôt GitHub contenant ce code.
3. Un domaine personnalisé (optionnel) pour `app.example.com` (frontend) et `api.example.com` (backend).
4. Secrets applicatifs :
   - `SECRET_KEY` pour FastAPI (32 caractères alphanumériques recommandés).
   - URL d'API publique (`NEXT_PUBLIC_API_URL`) pointant vers le backend.

## 3. Lancer l'infrastructure via Render Blueprint

1. Poussez vos modifications sur la branche principale du dépôt.
2. Dans le dashboard Render, cliquez sur **New ➜ Blueprint** et sélectionnez votre dépôt.
3. Choisissez le fichier `render.yaml` à la racine du dépôt, puis lancez le déploiement initial.
4. Render crée automatiquement :
   - Une base PostgreSQL `lavamedia-db`.
   - Un service **lavamedia-backend** (Python 3.11) et un service **lavamedia-frontend** (Node 20).

## 4. Configurer les variables d'environnement

Après la création des services, ouvrez chacun d'eux et ajustez les variables :

### Backend FastAPI (`lavamedia-backend`)

| Clé | Valeur suggérée |
|-----|-----------------|
| `SECRET_KEY` | Générez un secret fort (`openssl rand -hex 32`). |
| `ALLOWED_ORIGINS` | URLs autorisées (ex : `https://app.example.com`). |
| `ENVIRONMENT` | `production` (déjà renseigné). |
| `DEBUG` | `false` (déjà renseigné). |
| `DATABASE_URL` | Définie automatiquement depuis `lavamedia-db`.<br>Le script de démarrage convertit la valeur `postgres://` en `postgresql+asyncpg://`. |
| `ALEMBIC_DATABASE_URL` | Optionnel : laissez vide pour réutiliser `DATABASE_URL`. |

Le script [`start.sh`](../../deploy/render/backend/start.sh) applique `alembic upgrade head` avant de lancer Uvicorn et échoue explicitement si `DATABASE_URL` est absent.

### Frontend Next.js (`lavamedia-frontend`)

| Clé | Valeur suggérée |
|-----|-----------------|
| `NEXT_PUBLIC_API_URL` | URL publique du backend (ex : `https://api.example.com`). |
| `NODE_VERSION` | `20` (déjà renseigné). |

Si vous utilisez un domaine personnalisé, ajoutez-le dans l'onglet **Custom Domains** du service Render correspondant.

## 5. Déploiements continus

- Chaque service surveille la branche principale : Render reconstruit le backend lorsqu'un fichier Python/Alembic change, et le frontend lorsqu'un fichier Next.js change.
- Pour éviter des déploiements inutiles, vous pouvez activer **Auto-Deploy: No** et déclencher manuellement depuis Render ou configurer des règles via GitHub Actions.

## 6. Tests post-déploiement

1. **API** : consultez `https://<backend-domain>/health` pour vérifier le statut HTTP 200, puis `https://<backend-domain>/metrics` pour la télémétrie Prometheus.
2. **Frontend** : vérifiez que `next start` sert correctement l'interface et que les appels XHR ciblent `NEXT_PUBLIC_API_URL`.
3. **Base de données** : confirmez dans Render que les migrations Alembic ont créé les tables attendues (onglet *Logs* du backend).

## 7. Maintenance & bonnes pratiques

- Surveillez les journaux Render pour détecter les migrations échouées ou les erreurs de connexion.
- Utilisez les sauvegardes automatiques de la base PostgreSQL (incluses dans l'offre Render) et testez périodiquement la restauration.
- Gardez `render.yaml` synchronisé avec votre infrastructure réelle et versionnez tout changement d'environnement dans ce fichier.

En suivant ces étapes, vous obtenez un déploiement Render cohérent pour le frontend Next.js et le backend FastAPI tout en conservant une organisation monorepo adaptée au développement local.
