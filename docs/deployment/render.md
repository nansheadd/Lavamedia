Déploiement sur Render

Ce guide explique comment déployer l'application Lavamedia sur Render
 en conservant le dépôt monorepo tout en séparant le frontend Next.js et le backend FastAPI dans deux services distincts.

1. Aperçu de l'architecture Render

Le fichier render.yaml
 définit une Render Blueprint composée de trois ressources :

Base de données : un PostgreSQL managé (lavamedia-db).

Backend FastAPI : service Web Python qui exécute le script deploy/render/backend/start.sh
 afin d'appliquer les migrations Alembic puis de lancer Uvicorn.

Frontend Next.js : service Web Node.js qui construit et sert l'interface (npm run build puis npm run start).

Les exemples de variables d'environnement sont regroupés dans deploy/render/backend/env.example
 et deploy/render/frontend/env.example
.

2. Pré-requis

Un compte Render avec accès aux services Web et à PostgreSQL.

Un fork ou accès en écriture au dépôt GitHub contenant ce code.

Un domaine personnalisé (optionnel) pour app.example.com (frontend) et api.example.com (backend).

Secrets applicatifs :

SECRET_KEY pour FastAPI (32 caractères alphanumériques recommandés).

URL d'API publique (NEXT_PUBLIC_API_URL) pointant vers le backend.

3. Option A – Déploiement automatique via Render Blueprint

Poussez vos modifications sur la branche principale du dépôt.

Dans le dashboard Render, cliquez sur New ➜ Blueprint et sélectionnez votre dépôt.

Choisissez le fichier render.yaml à la racine du dépôt, puis lancez le déploiement initial.

Render crée automatiquement :

Une base PostgreSQL lavamedia-db.

Un service lavamedia-backend (Python 3.11) et un service lavamedia-frontend (Node 20).

4. Option B – Création manuelle depuis le tableau de bord Render

Si vous préférez configurer Render pas à pas (par exemple pour mieux comprendre chaque service), suivez la procédure ci-dessous à partir du bouton New ➜ Create a new service de la page d'accueil.

4.1 Créer la base PostgreSQL

Cliquez sur New ➜ Postgres.

Donnez un nom à votre instance, par exemple lavamedia-db.

Choisissez la région la plus proche de vos utilisateurs (par exemple Frankfurt (EU Central) si votre audience est européenne).

Laissez le plan Starter pour commencer, puis validez avec Create Database.

Une fois la base créée, ouvrez l'onglet Connection et copiez la valeur Internal Database URL : elle sera injectée automatiquement dans le backend lors des étapes suivantes.

4.2 Créer le backend FastAPI

Retournez à l'accueil Render et cliquez sur New ➜ Web Service.

Connectez votre dépôt GitHub si ce n'est pas déjà fait, puis sélectionnez le dépôt contenant Lavamedia.

Dans la section Configure Web Service :

Name : lavamedia-backend.

Region : identique à celle de la base de données.

Branch : main (ou la branche de production).

Root Directory : laissez . (la racine du dépôt) car le backend vit dans app/ mais la configuration se trouve à la racine.

Runtime : Python 3.

Build Command : pip install --upgrade pip && pip install ..

Start Command : ./deploy/render/backend/start.sh.

Dans Advanced :

Activez Auto-Deploy si vous souhaitez que chaque push déclenche un déploiement.

Dans Environment Variables, ajoutez ENVIRONMENT=production et DEBUG=false dès maintenant (les autres seront ajoutées après la création).

Cliquez sur Create Web Service. Le premier build démarre automatiquement.

Une fois le service créé, ouvrez l'onglet Environment et ajoutez les variables sensibles :

SECRET_KEY (voir table ci-dessous).

ALLOWED_ORIGINS (liste des domaines frontend autorisés).

Associez la base Render en cliquant sur Add from database et sélectionnez lavamedia-db pour renseigner DATABASE_URL.

4.3 Créer le frontend Next.js

Cliquez sur New ➜ Web Service (Next.js SSR nécessite un service web plutôt qu'un site statique, car l'app contient une API côté serveur).

Sélectionnez à nouveau le dépôt GitHub.

Dans Configure Web Service :

Name : lavamedia-frontend.

Region : identique aux autres services.

Branch : main.

Root Directory : . (le frontend est à la racine du dépôt).

Runtime : Node.

Build Command : npm install && npm run build (ou pnpm install && pnpm build si vous utilisez pnpm).

Start Command : npm run start.

Dans Advanced :

Ajoutez l'environnement NODE_VERSION=20.

Activez l'auto-déploiement si souhaité.

Cliquez sur Create Web Service, puis renseignez NEXT_PUBLIC_API_URL=https://<domaine-backend> dans l'onglet Environment une fois le service créé.

💡 Astuce : si vous préférez servir le frontend comme site statique (sans SSR), changez simplement de type lors de l'étape 1 et suivez les instructions Render pour un Static Site. Utilisez npm run build comme commande de build et /out comme répertoire publié après un next export.

5. Configurer les variables d'environnement

Après la création des services, ouvrez chacun d'eux et ajustez les variables :

Backend FastAPI (lavamedia-backend)
Clé	Valeur suggérée
SECRET_KEY	Générez un secret fort (openssl rand -hex 32).
ALLOWED_ORIGINS	URLs autorisées (ex : https://app.example.com).
ENVIRONMENT	production (déjà renseigné).
DEBUG	false (déjà renseigné).
DATABASE_URL	Définie automatiquement depuis lavamedia-db.
Le script de démarrage convertit la valeur postgres:// en postgresql+asyncpg://.
ALEMBIC_DATABASE_URL	Optionnel : laissez vide pour réutiliser DATABASE_URL.

Le script start.sh
 applique alembic upgrade head avant de lancer Uvicorn et échoue explicitement si DATABASE_URL est absent.

Frontend Next.js (lavamedia-frontend)
Clé	Valeur suggérée
NEXT_PUBLIC_API_URL	URL publique du backend (ex : https://api.example.com).
NODE_VERSION	20 (déjà renseigné).

Si vous utilisez un domaine personnalisé, ajoutez-le dans l'onglet Custom Domains du service Render correspondant.

6. Déploiements continus

Chaque service surveille la branche principale : Render reconstruit le backend lorsqu'un fichier Python/Alembic change, et le frontend lorsqu'un fichier Next.js change.

Pour éviter des déploiements inutiles, vous pouvez activer Auto-Deploy: No et déclencher manuellement depuis Render ou configurer des règles via GitHub Actions.

7. Tests post-déploiement

API : consultez https://<backend-domain>/health pour vérifier le statut HTTP 200, puis https://<backend-domain>/metrics pour la télémétrie Prometheus.

Frontend : vérifiez que next start sert correctement l'interface et que les appels XHR ciblent NEXT_PUBLIC_API_URL.

Base de données : confirmez dans Render que les migrations Alembic ont créé les tables attendues (onglet Logs du backend).

8. Maintenance & bonnes pratiques

Surveillez les journaux Render pour détecter les migrations échouées ou les erreurs de connexion.

Utilisez les sauvegardes automatiques de la base PostgreSQL (incluses dans l'offre Render) et testez périodiquement la restauration.

Gardez render.yaml synchronisé avec votre infrastructure réelle et versionnez tout changement d'environnement dans ce fichier.

En suivant ces étapes, vous obtenez un déploiement Render cohérent pour le frontend Next.js et le backend FastAPI tout en conservant une organisation monorepo adaptée au développement local.