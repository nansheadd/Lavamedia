# Rapport de cadrage pour la réécriture de Lavamedia

## 1. Inventaire des contenus et taxonomies

| Type | Volume estimé | Taxonomies associées | Observations |
| --- | --- | --- | --- |
| Articles | Données non fournies | Catégories, Tags | Export à réaliser via l'outil CMS (ex. WordPress Exporter) pour obtenir la liste complète.
| Pages | Données non fournies | Aucun/Hiérarchie | Vérifier les pages institutionnelles et statiques.
| Médias | Données non fournies | Bibliothèque média | Nécessite un inventaire pour identifier les assets critiques.

**Actions recommandées**
- Utiliser les fonctions d'export natif du CMS pour récupérer un fichier XML/CSV des contenus.
- Cartographier les catégories et tags existants et repérer les doublons ou taxonomies obsolètes.
- Croiser avec les analytics pour prioriser les contenus à migrer.

## 2. Plugins et extensions en place

### 2.1 Critiques / Bloquants (à garder en production)

| Plugin | Rôle | Priorité | Plan | Notes clés |
| --- | --- | --- | --- | --- |
| WPML Multilingual CMS, String Translation, Media | Internationalisation du contenu, gestion des slugs et médias multilingues | Critique | Garder pour la phase vitrine ; viser une i18n propriétaire plus tard | Assurer la cohérence des slugs/hreflang pour éviter les risques SEO |
| WooCommerce | Base e-commerce et abonnements | Critique | Garder pour lecture des droits d'accès durant la phase vitrine | Mise à jour nécessaire ; templates du thème LAVA obsolètes |
| WooCommerce Subscriptions | Abonnements récurrents | Critique si abonnements actifs | Garder ; cible long terme : Stripe Billing | Vérifier l'état des renouvellements avant migration |
| WooCommerce Memberships | Gestion des droits d'accès/paiement | Critique si paywall | Garder ; viser des entitlements maison ensuite | Veiller à la cohérence avec les autres briques « membres » |
| WooCommerce Stripe Gateway / Mollie Payments | Passerelles de paiement | Critique | Garder (choisir une passerelle principale à court terme) | Double passerelle = complexité ; privilégier Stripe + Stripe Tax |
| WooCommerce Multilingual & Multicurrency | i18n WooCommerce et multidevise | Critique si multidevise | Garder ; migrer vers solution propriétaire plus tard | Synchroniser langues/devises avec WPML |
| AIOSEO (All in One SEO) | SEO (titres, metas, sitemaps) | Critique | Garder pour parité SEO ; penser SEO maison ensuite | Vérifier la parité des métadonnées lors de la refonte |
| CookieYes (GDPR) | Consentement cookies | Critique | Garder en attendant une solution unifiée | Garant de la conformité RGPD |
| WP Mail SMTP (+ WP Mail Logging en support) | Envoi SMTP fiable | Critique | Garder | Couplé au logging pour sécuriser les migrations |
| Wordfence Security | Sécurité applicative | Haute | Garder ; viser un offload vers WAF/CDN ensuite | Surveiller l'impact perf ; définir une stratégie WAF future |
| LiteSpeed Cache | Cache et optimisation performance | Haute | Garder tant que WordPress sert le front | À remplacer par le cache CDN/SSR du nouveau front |

### 2.2 Importants (parité éditoriale & UX)

| Plugin | Rôle | Priorité | Plan | Notes clés |
| --- | --- | --- | --- | --- |
| Advanced Custom Fields (+ ACF Gallery Field) | Champs éditoriaux avancés | Importante | Garder ; exposer via API avant migration | Cibler une modélisation Postgres/blocs ensuite |
| Search & Filter | Filtres de recherche front | Importante | Garder côté WP ; Phase vitrine → Meilisearch + facettes | Prévoir la reprise de logique de filtrage côté front |
| Table of Contents Plus | Génération de tables des matières | Importante | Remplacer par génération côté vitrine | Garantir compatibilité avec contenus existants |
| Easy Footnotes | Notes de bas de page | Importante | Reprendre le rendu côté vitrine (shortcodes) | Tester le rendu multi-langue |
| WP Table Builder | Création de tableaux | Importante | Rendre via HTML/React côté vitrine ; viser une alternative plus légère | Inventorier les usages complexes |
| Html5 Audio Player | Lecteur audio | Importante si contenus audio | Remplacer par un lecteur natif/React accessible | Vérifier les flux audio hébergés |
| Public Post Preview | Prévisualisation des brouillons | Importante | Refaire via liens signés côté vitrine | S'assurer de la sécurité des URLs de preview |
| Menus / Navigation (core WP) | Structures de navigation | Importante | Reprendre via API + gabarits vitrine | Documenter la hiérarchie actuelle |

### 2.3 Utiles mais remplaçables / à moyen terme

| Plugin | Rôle | Priorité | Plan | Notes clés |
| --- | --- | --- | --- | --- |
| ProfilePress | Gestion membres/login | Moyenne | Vérifier chevauchements avec Woo Memberships/Social Login | Rationaliser la stack membres |
| WooCommerce Social Login | Connexion sociale | Moyenne | Garder à court terme ; cible : NextAuth/OAuth côté vitrine | Cartographier les providers actifs |
| AutomateWoo | Automatisations WooCommerce | Moyenne | Garder si scénarios actifs ; sinon basculer vers backend/ESP | Faire l'inventaire des workflows |
| MailerLite – Signup forms / Woo integration | Newsletter & marketing | Moyenne | Garder si intégré ; sinon remplacer par intégration API dédiée | Confirmer le mapping des segments |
| Site Kit by Google | Analytics/Search Console | Moyenne | Optionnel ; peut vivre via GTM/GA4 | À retirer si doublon avec scripts front |
| Broken Link Checker | Détection liens cassés | Moyenne | Éviter en prod ; utiliser scans externes/CI | À réserver aux environnements de staging |
| User Switching | Support/QA admin | Moyenne | Garder (utile pour support) | Restreindre aux administrateurs |
| WordPress Hide Posts | Masquage de contenus | Moyenne | Reprendre la logique côté vitrine puis retirer | Identifier les cas d'usage précis |

### 2.4 Outils d'administration / ponctuels

| Plugin | Rôle | Priorité | Plan | Notes clés |
| --- | --- | --- | --- | --- |
| Better Search Replace | Recherches/remplacements DB | Outil | Garder désactivé, n'activer qu'en besoin | Procéder avec sauvegardes |
| Import Export Suite for WooCommerce | Import/export catalogue | Outil | Garder pour opérations ponctuelles | Documenter les formats utilisés |
| WP Mail Logging | Journalisation des emails | Outil | Garder (utile pendant la migration) | À purger régulièrement |
| Classic Editor / Advanced Editor Tools | Éditeur classique | Outil d'usage | Garder si la rédaction l'utilise | Prévoir accompagnement vers Gutenberg |
| Featured Image in RSS Feed (MailerLite) | Image dans flux RSS | Outil | Garder si flux consommés | Vérifier compat MailerLite |
| Ad Widget for WordPress (Broadstreet) | Gestion des emplacements pubs | Outil | Garder si inventaire pub actif | Clarifier la feuille de route publicitaire |

### 2.5 Rationalisation à prévoir

| Sujet | Priorité | Plan | Notes clés |
| --- | --- | --- | --- |
| Stripe Gateway vs Mollie Payments | Rationaliser | Choisir une passerelle principale (recommandation : Stripe) | Réduire la complexité des webhooks et reporting |
| ProfilePress vs Woo Memberships | Rationaliser | Converger vers une seule source « membres/accès » | Audit des fonctionnalités utilisées |

### 2.6 Remplacements cibles une fois la vitrine en place

| Plugin actuel | Remplacement cible | Notes |
| --- | --- | --- |
| AIOSEO | SEO intégré côté vitrine (métas, sitemaps, schema) | Garantir la parité SEO avant bascule |
| Search & Filter | Recherche Meilisearch + facettes front | Prévoir la reprise des filtres existants |
| LiteSpeed Cache | Cache CDN/WAF + SSR front | Anticiper la stratégie d'invalidation |
| Woo Memberships / Subscriptions | Stripe Billing + entitlements maison | Déporter la logique d'accès dans le backend custom |
| Woo Multilingual & Multicurrency / WPML | i18n propriétaire | Nécessite une gouvernance langue stricte |
| Html5 Audio Player / TOC / Footnotes / Hide Posts / WP Table Builder | Composants front dédiés | Maintenir la compatibilité des contenus existants |

### 2.7 Plugins à faible valeur / legacy

| Plugin | Statut | Plan | Notes |
| --- | --- | --- | --- |
| WooCommerce Legacy REST API | Legacy | Désactiver si aucune intégration ne l'utilise | Vérifier les appels externes |
| WooCommerce.com Update Manager | Faible valeur runtime | Garder seulement si nécessaire pour licences | À retirer sinon |
| Potent Donations for WooCommerce | À vérifier | Désactiver si dons inactifs | Prévoir migration si dons maintenus |
| WooCommerce Gift Coupon | À vérifier | Désactiver si inutilisé | Valider les campagnes cadeaux |
| Surver | Inconnu | Vérifier usage ; désactiver en staging pour test | Documenter la finalité |
| SiteStream | Inconnu | Vérifier usage ; désactiver en staging pour test | Comprendre l'intégration |

### 2.8 Rappels de version / santé

- LiteSpeed Cache : installé 7.3.0.1 (dernière 7.5.0.1) → mise à jour à planifier avec prudence.
- WooCommerce : 10.0.4 (dernière 10.2.2) → attention aux templates du thème LAVA obsolètes.
- Stripe Gateway : 9.5.1 (dernière 9.9.2) → revalider les webhooks après mise à jour.
- Aelia VAT Assistant/Foundation : versions en retard → surveiller la conformité TVA.
- WPML Media : version en retard → vérifier la compatibilité multilingue.

## 3. Parcours utilisateurs

### Lecteurs
1. **Consultation** : Arrivée via page d'accueil ou réseaux sociaux → Navigation par rubriques → Lecture d'article → Suggestions de contenus connexes.
2. **Recherche** : Saisie via barre de recherche → Filtrage par catégorie/date → Affichage des résultats → Consultation de contenu.
3. **Abonnement** : Appel à l'action dans les articles/menus → Page d'abonnement → Formulaire → Confirmation par e-mail.

### Journalistes
1. **Création** : Connexion au CMS → Création d'un brouillon → Ajout de médias → Sauvegarde.
2. **Révision** : Notification aux relecteurs → Commentaires/annotations → Validation.
3. **Publication** : Passage en statut « prêt » → Vérification SEO/métadonnées → Mise en ligne programmée ou immédiate.

**Opportunités d'amélioration**
- Standardiser les modèles d'article pour accélérer la production.
- Mettre en place un workflow de validation multi-étapes avec notifications.
- Optimiser la visibilité des CTA d'abonnement sur mobile.

## 4. Intégrations externes

| Intégration | Usage | Statut | Notes |
| --- | --- | --- | --- |
| Analytics (ex. GA4) | Suivi d'audience | À confirmer | Vérifier la configuration des événements clés.
| Réseaux sociaux | Partage automatique | À confirmer | Identifier les connecteurs utilisés (Facebook, Twitter, LinkedIn).
| CRM / Newsletter | Gestion abonnés | À confirmer | Documenter les connecteurs (Mailchimp, Sendinblue, etc.).

**Actions recommandées**
- Extraire la configuration actuelle depuis le CMS et les scripts front.
- Valider les clés API et procédures d'authentification.
- Cartographier les points de données échangés et les dépendances légales (RGPD).

## 5. Synthèse et backlog initial

| Priorité | Élément | Description | Responsable | Échéance cible |
| --- | --- | --- | --- | --- |
| Haute | Export complet des contenus | Générer l'export XML/CSV des contenus et taxonomies. | Équipe éditoriale | Semaine 1 |
| Haute | Audit des plugins | Recenser tous les plugins actifs/inactifs avec leur rôle. | Tech | Semaine 1 |
| Moyenne | Cartographie des parcours | Ateliers UX pour confirmer les parcours lecteur/journaliste. | Produit/UX | Semaine 2 |
| Moyenne | Inventaire des intégrations | Documenter les intégrations analytics, réseaux sociaux, CRM. | Tech | Semaine 2 |
| Basse | Définition des KPIs de migration | Sélectionner les indicateurs de réussite. | Produit | Semaine 3 |

**Risques identifiés**
- Données sources incomplètes ou inaccessibles.
- Plugins obsolètes bloquant la migration.
- Manque de documentation sur les intégrations externes.

**Prochaines étapes**
1. Planifier les exports et audits techniques.
2. Organiser des ateliers avec l'équipe éditoriale et marketing.
3. Consolider les résultats dans un document de référence pour la réécriture.

