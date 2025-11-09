# Studio éditorial modulaire

## Cartographie de l’éditeur

- **Point d’entrée** : `app/journalist/editeur/page.tsx` charge `EditorScreen` qui prépare l’état initial depuis l’API contenus.
- **Gestion d’état** : `src/components/editor/state.ts` centralise toutes les mutations (titre, chapô, blocs, encadrés, notes, suivi de versions) avec suivi des modifications.
- **Modules UI** :
  - `modules/BlockComposer.tsx` pour la composition du corps par blocs (texte, listes, médias, audio/vidéo).
  - `modules/ImageLeadModule.tsx` pour l’image à la une / chapô visuel.
  - `modules/CalloutModule.tsx`, `modules/FootnoteModule.tsx`, `modules/SpellcheckPanel.tsx`, `modules/WorkflowPanel.tsx` pour les extensions métiers.
  - `LivePreview.tsx` et `TrackChangesPanel.tsx` assurent l’aperçu et le suivi collaboratif.
- **Intégrations API** : `api.ts` expose les opérations de workflow (changements, décisions, exports Docx/PDF).

## Architecture modulaire

- **Blocs structurés** : chaque bloc (`EditorBlock`) possède son identifiant et son type (`text`, `list`, `image`, `gallery`, `video`, `audio`).
- **Synchronisation** : le corps textuel historique (`state.body`) est dérivé automatiquement des blocs pour l’export et la rétrocompatibilité.
- **Actions Redux-like** : `addBlock`, `updateBlock`, `moveBlock`, `duplicateBlock`, `removeBlock`, `replaceBlocks` permettent une orchestration fine.
- **Prévisualisation responsive** : `LivePreview` accepte un `viewport` (`desktop`/`mobile`) et rend chaque bloc selon sa nature (titres, citations, galeries, players audio/vidéo).
- **Correcteur local** : `modules/spellcheck` exploite un dictionnaire embarqué + distance de Levenshtein pour suggérer des corrections sans dépendance externe.
- **Workflow & historique** : `WorkflowPanel` synthétise les propositions (en attente, validées, refusées) en complément du `TrackChangesPanel`.

## Fonctions clés

- Barre d’outils contextuelle dans `BlockComposer` pour ajouter/dupliquer/supprimer/déplacer des blocs et associer des notes.
- Gestion d’images : choix d’alignement, formats (`inline`, `wide`, `full`), légendes, crédits ; galeries `grid` / `carousel`.
- Notes de bas de page numérotées automatiquement et réutilisables dans les blocs.
- Aperçu live avec bascule desktop/mobile et rendu des blocs média.
- Export Docx & PDF (`exportDocx`, `exportPdf`) depuis `RichTextEditor`.
- Track changes, workflow de validation, historique fusionnant modifications locales et demandes serveur.
- Correcteur orthographique local relançable à la demande.

## Tests utilisateurs & bonnes pratiques

1. **Scénarios de test** (journalistes & éditeurs) :
   - Création d’un article complet avec titres, citations, médias, notes.
   - Parcours d’une proposition de modification (soumission -> approbation -> export PDF).
   - Validation de l’accessibilité mobile (prévisualisation mobile, lecture audio/vidéo).
   - Vérification du correcteur (introduction volontaire d’erreurs, application des suggestions).
2. **Organisation** : sessions de 30 min, binôme journaliste/éditeur, grille de feedback sur la fluidité des blocs, la pertinence des alertes workflow/correcteur.
3. **Bonnes pratiques** :
   - Utiliser le chapô pour contextualiser (éviter la duplication du premier paragraphe).
   - Privilégier des blocs courts (3-4 phrases) pour faciliter la lecture mobile.
   - Associer systématiquement les médias à une légende et un crédit.
   - Vérifier le correcteur avant soumission, relire les notes après réordonnancement de blocs.
   - Exporter en PDF pour validation maquette, Docx pour corrections externes.
4. **Suivi** : consigner les retours dans Notion / Confluence, ajuster le dictionnaire et les presets de blocs selon besoins rédactionnels.
