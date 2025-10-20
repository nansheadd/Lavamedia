# Extraction du contenu WordPress historique

Ce dépôt contient un script Node.js qui permet de récupérer les articles publics de l'ancien site WordPress (`https://lavamedia.be/`) afin de mieux illustrer le futur site.

## Script de récupération

Le script `scripts/fetch-wordpress-posts.js` interroge l'API REST WordPress (`/wp-json/wp/v2/`) pour collecter :

- Les articles publiés (titre, slug, dates, extrait et contenu HTML).
- Les catégories et étiquettes associées à chaque article.
- Les métadonnées des images mises en avant (URL, dimensions, texte alternatif).

Le résultat est sauvegardé dans `content/wordpress/posts.json` sous la forme d'un instantané JSON facile à réutiliser dans des pages de démonstration ou des prototypes.

## Pré-requis

- Node.js 18+ (pour bénéficier de `fetch` côté serveur).
- Un accès réseau autorisé vers `https://lavamedia.be/`.

> **Remarque :** l'environnement de développement fourni pour ce projet utilise un proxy sortant restrictif ; il se peut donc que l'exécution du script échoue ici avec une erreur `403 Forbidden`. Dans ce cas, exécutez-le en local sur une machine ayant accès à Internet.

## Installation

```bash
pnpm install # ou npm install / yarn install selon votre outil
```

## Utilisation

```bash
# Récupère tous les articles, 20 par page, et les écrit dans content/wordpress/posts.json
npm run fetch:wordpress
```

Options disponibles :

- `--per-page <n>` : nombre d'articles par requête (max WordPress 100).
- `--pages <n>` : nombre de pages à récupérer. Utilisez `--pages all` (ou omettez l'option) pour tout télécharger.
- `--output <chemin>` : chemin du fichier de sortie si vous souhaitez sauvegarder ailleurs.

Exemple :

```bash
npm run fetch:wordpress -- --per-page 50 --pages all --output ./docs/exemples/posts.json
```

## Structure du fichier généré

Le fichier JSON produit a la structure suivante :

```json
{
  "generatedAt": "2024-05-01T12:34:56.000Z",
  "source": "https://lavamedia.be/wp-json/wp/v2",
  "total": 42,
  "posts": [
    {
      "id": 123,
      "slug": "exemple-d-article",
      "link": "https://lavamedia.be/exemple-d-article/",
      "date": "2023-09-10T08:00:00",
      "modified": "2023-09-12T09:15:00",
      "title": "Exemple d’article",
      "excerpt": "Résumé sans balises HTML…",
      "content": "<p>Contenu HTML complet…</p>",
      "categories": [
        { "id": 5, "name": "Actualités", "slug": "actualites" }
      ],
      "tags": [
        { "id": 21, "name": "Communication", "slug": "communication" }
      ],
      "featuredImage": {
        "id": 456,
        "alt": "Description de l’image",
        "url": "https://lavamedia.be/wp-content/uploads/2023/09/image.jpg",
        "mimeType": "image/jpeg",
        "title": "Nom du fichier",
        "sizes": {
          "medium": { "url": "…", "width": 300, "height": 200 }
        }
      }
    }
  ]
}
```

## Exploitation possible

- Préremplir des pages maquette du nouveau site avec du contenu réel.
- Alimenter des scripts de migration pour préparer un import dans la base de données du futur CMS.
- Générer un carrousel ou une page de blog statique pendant la phase de conception.

## Dépannage

Si vous obtenez une erreur `403 Forbidden` ou `ECONNREFUSED`, vérifiez :

1. Que la machine a bien accès à Internet sans proxy restrictif.
2. Que le domaine `lavamedia.be` est résolu correctement.
3. Que l'API REST WordPress est toujours accessible publiquement.

En cas de problème persistant, vous pouvez exporter manuellement les articles depuis le back-office WordPress (outil « Exporter ») et convertir le fichier XML en JSON grâce à des outils en ligne ou des bibliothèques comme `wordpress-export-to-json`.
