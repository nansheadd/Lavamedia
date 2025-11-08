# Studio éditorial & workflow de publication

Ce document décrit l'architecture du nouvel éditeur enrichi, les conventions de styles, ainsi que le cycle de validation mis en place entre le front-office Next.js et l'API FastAPI.

## 1. Architecture générale

- **Front-end (Next.js / React)** :
  - Le composant principal `RichTextEditor` est exposé dans `src/components/editor/` et orchestre les modules spécialisés : notes de bas de page, encadrés, gestion du chapeau visuel et panneau de suivi.
  - L'état métier est centralisé via `useEditorState` (`src/components/editor/state.ts`). Les actions enregistrent automatiquement des traces lorsqu'un utilisateur modifie le contenu avec le mode "track changes" activé.
  - Les interactions réseau (`fetch`, export, décisions) sont regroupées dans `src/components/editor/api.ts`.
  - Les styles Tailwind spécifiques à l'éditeur sont fournis dans `src/styles/editor.css` et activés globalement par `app/layout.tsx`.

- **Back-end (FastAPI)** :
  - Nouvelles routes sous `/api/editorial/*` (`app/api/routes/editorial.py`) pour gérer la soumission, la décision et l'export Word.
- Service dédié `EditorialWorkflowService` (`app/services/editorial.py`) orchestrant création de versions, workflow de validation et génération d'archives `.docx` sans dépendance externe.
  - Modélisation SQLAlchemy enrichie (`app/models/content.py`) avec la table `content_change_requests` pour le suivi des propositions.

## 2. Modules du Studio

| Module | Emplacement | Description |
| --- | --- | --- |
| Notes de bas de page | `FootnoteModule.tsx` | Ajout, édition et suppression des notes avec numérotation automatique. |
| Encadrés (callouts) | `CalloutModule.tsx` | Gestion de blocs d'accentuation (info / attention / succès). |
| Image & chapô | `ImageLeadModule.tsx` | Synchronisation entre image d'ouverture, légende et crédit. |
| Aperçu live | `LivePreview.tsx` | Rendu instantané du contenu structuré (titre, chapô, corps, encadrés, notes). |
| Suivi | `TrackChangesPanel.tsx` | Historique local + demandes serveur, résolution et actions (valider/rejeter). |

## 3. Style & design system

- Palette dédiée (`editor.*`) ajoutée dans `tailwind.config.ts` pour différencier les surfaces, fonds, accents et statuts (succès / danger).
- Nouvelles polices : `font-editorial` pour les titres (IBM Plex Serif), `font-sans` mise à jour avec Inter pour la cohérence dans l'éditeur.
- Composants utilitaires (`.editor-card`, `.editor-toolbar`, etc.) disponibles via un plugin Tailwind interne pour faciliter la réutilisation.
- Les classes applicatives sont regroupées sous `@layer components` et `@layer utilities` dans `src/styles/editor.css`.

## 4. Workflow de validation

1. **Rédaction** : l'auteur active le suivi et rédige. Chaque action ajoute une entrée dans le panneau (non synchronisé tant que la proposition n'est pas soumise).
2. **Soumission** : clic sur "Soumettre au comité" -> POST `/api/editorial/content/{id}/changes` avec le diff complet (chapô, callouts, notes…).
3. **Décision** : un éditeur valide/rejette via `/api/editorial/content/{id}/changes/{changeId}/decision`. En cas d'approbation, `EditorialWorkflowService` applique automatiquement la modification en créant une nouvelle version (`ContentVersion`).
4. **Export** : à tout moment, l'équipe peut demander l'export Word (`/api/editorial/content/{id}/export/docx`) pour partager un état figé.

Les objets `ContentChangeRequest` stockent : version de base, auteur de la proposition, commentaire, payload JSON (corps, callouts, footnotes…), statut et métadonnées de résolution.

## 5. Tests & documentation

- Les tests unitaires ciblent `EditorialWorkflowService` (voir `tests/test_editorial_workflow.py`). Ils couvrent : création de contenu, proposition, approbation et export `.docx`.
- Ce fichier tient lieu de guide interne pour l'équipe produit (flux complet de publication).
