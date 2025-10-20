# Architecture cible Lavamedia

## 1. Découpage en micro-modules backend

### Services applicatifs
- **AuthN/AuthZ Service** : gestion des identités, rôles, permissions, SSO/OAuth.
- **Content Management Service** : CRUD contenus (articles, pages, catégories), workflow d'édition, versioning.
- **Media Service** : upload/transcodage d'images/vidéos, CDN, métadonnées média.
- **SEO & Metadata Service** : génération balises, sitemaps, suivi score SEO.
- **Analytics Service** : collecte events, dashboards KPI, intégrations externes.
- **Notification Service** : emails, push, webhooks.
- **Search Service** : indexation full-text, auto-complétion.

### Modules transverses
- **Gateway/API Layer** : agrégation des services (FastAPI), auth centralisée.
- **Shared Services** : logs, monitoring, feature flags, configuration.

## 2. Schéma de base de données (PostgreSQL)

### Entités principales
- `users` (id, email, password_hash, status, last_login_at).
- `roles` (id, name, description).
- `permissions` (id, code, description).
- `role_permissions` (role_id, permission_id).
- `user_roles` (user_id, role_id).
- `content_items` (id, type, title, slug, status, published_at, created_by, updated_by, workflow_state).
- `content_versions` (id, content_id, version_number, body, diff, created_at).
- `content_categories` (id, name, slug, parent_id).
- `content_category_links` (content_id, category_id).
- `seo_metadata` (id, content_id, meta_title, meta_description, canonical_url, og_tags jsonb, schema_markup jsonb).
- `media_assets` (id, type, filename, storage_url, checksum, width, height, duration, metadata jsonb, uploaded_by).
- `media_variants` (id, media_id, format, url, width, height, bitrate).
- `content_media` (content_id, media_id, role).
- `analytics_events` (id, user_id nullable, session_id, event_type, payload jsonb, occurred_at).
- `dashboards` (id, name, definition jsonb, owner_id).
- `webhooks` (id, name, target_url, secret, status).

### Index & contraintes
- Index unique sur `users.email`, `content_items.slug`.
- Foreign keys pour tous les `*_id`.
- Index GIN sur colonnes `jsonb`.
- Contraintes de workflow (trigger sur `content_items.status`).

### Extensions recommandées
- `pgcrypto` pour UUID, `postgis` si géolocalisation requise, `timescaledb` pour analytics.

## 3. Couche API (FastAPI)

### Principes généraux
- Versioning : `/api/v1/...` avec header `Accept-Version` optionnel.
- Documentation automatique via `FastAPI` + `APIRouter` + `tags`, exposition Swagger/Redoc.
- Authentification par OAuth2 (password, client credentials) + JWT, refresh tokens.

### Routes clés
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- `GET /users`, `POST /users`, `PATCH /users/{id}`, `DELETE /users/{id}`.
- `GET /roles`, `POST /roles`, `PATCH /roles/{id}`, `GET /permissions`.
- `GET /content`, `POST /content`, `GET /content/{slug}`, `PATCH /content/{id}`, `POST /content/{id}/publish`.
- `GET /media`, `POST /media/upload`, `GET /media/{id}`, `DELETE /media/{id}`.
- `GET /analytics/events`, `POST /analytics/events`, `GET /analytics/dashboards`.
- `GET /seo/sitemaps`, `POST /seo/recalculate`, `GET /seo/{content_id}`.

### Conventions
- Utilisation de schémas Pydantic pour request/response.
- Pagination standard (`page`, `page_size`), filtres via query params.
- Codes d'erreur normalisés (`detail`, `code`).
- Logging structuré via middleware, tracing OpenTelemetry.

## 4. Structure front-end React

### Organisation
- Monorepo (Nx ou Turborepo) avec packages : `apps/admin`, `apps/portal`, `packages/ui`, `packages/utils`, `packages/api` (RTK Query services).
- Partage du design system et des hooks via packages communs.

### Routing
- `apps/admin` : React Router v6, routes protégées (dashboard, contenus, médias, analytics).
- `apps/portal` : Next.js ou Remix pour SEO (SSR), routes dynamiques `/articles/[slug]`.

### State Management
- Redux Toolkit + RTK Query pour données serveurs (auth, contenus, médias).
- React Query possible pour analytics temps réel.
- Context API pour préférences utilisateur.

### Design System
- Storybook partagé, tokens de design (Tailwind CSS ou Styled System), composants atomiques (Button, Card, Modal), respect AA contrast.

## 5. Stratégie CI/CD

### Pipelines
- **CI** : lint (`ruff`, `black`, `eslint`, `stylelint`), tests unitaires (pytest, vitest), tests e2e (Playwright).
- Analyse statique (mypy, type-check TS).
- Build conteneurs (Docker multi-stage) pour backend et front.
- Scans sécurité (Trivy, Snyk).

### CD
- Orchestration via GitHub Actions -> ArgoCD ou GitLab CI -> Kubernetes.
- Environnements : dev, staging, prod avec promotion progressive.
- Déploiement bleu/vert ou canary pour services critiques.
- Migration DB automatisée (Alembic) avant déploiement backend.
- Monitoring post-déploiement (Prometheus/Grafana, Sentry).

### Infrastructure as Code
- Terraform/Helm charts pour provisionnement.
- Secrets gérés via Vault ou Secret Manager.

