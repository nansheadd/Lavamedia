export type MockContentVersion = {
  id: number;
  version_number: number;
  body: string;
  diff?: Record<string, unknown> | null;
};

export type MockContentItem = {
  id: number;
  title: string;
  slug: string;
  updated_at?: string;
  versions: MockContentVersion[];
};

const buildTimestamp = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString();
};

export const MOCK_CONTENT_ITEMS: MockContentItem[] = [
  {
    id: 101,
    title: 'Intelligence collective : guide pratique pour rédactions hybrides',
    slug: 'intelligence-collective-redactions',
    updated_at: buildTimestamp(2),
    versions: [
      {
        id: 1001,
        version_number: 3,
        body: `# Coordination fluide\n\nTravailler à distance exige une gouvernance éditoriale explicite.\n\n## Ritualiser les synchronisations\n\n- Sprints éditoriaux de 15 jours\n- Relectures croisées asynchrones\n- Débriefs vidéo 30 minutes`,
        diff: {
          chapeau: "Comment une rédaction distribuée conserve sa cohésion éditoriale sans sacrifier la créativité collective ?",
          lead: {
            imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70',
            caption: 'La fabrique éditoriale en pleine session miroir',
            credit: 'Lavamedia Studio'
          },
          footnotes: [
            'Inspiré des workflows produits SaaS.',
            'Prévoir une personne chargée de l’orchestration des versions.'
          ],
          callouts: [
            {
              title: 'Astuce pilotage',
              body: 'Visualisez chaque version dans un kanban afin de partager l’avancement avec les contributeurs externes.',
              tone: 'info'
            }
          ]
        }
      }
    ]
  },
  {
    id: 102,
    title: 'Observer les océans : carnet d’enquête data + terrain',
    slug: 'oceans-data-terrain',
    updated_at: buildTimestamp(5),
    versions: [
      {
        id: 1002,
        version_number: 2,
        body: `# Des senseurs à la plume\n\n> Croiser imagerie satellite et récits humains renforce la crédibilité des enquêtes climatiques.\n\n- Collecte open data Copernicus\n- Interviews croisées pêcheurs / climatologues\n- Publication en réalité augmentée`,
        diff: {
          chapeau: 'En mission sur la façade atlantique, notre cellule datajournalisme documente la lente acidification des eaux.',
          lead: null,
          footnotes: [
            'Sources : programme Copernicus 2024.',
            'Les interviews ont été enregistrées sur deux semaines.'
          ],
          callouts: [
            {
              title: 'Pro-tip audio',
              body: 'Préparez deux grilles d’entretien : une pour les témoins, une pour les scientifiques.',
              tone: 'warning'
            }
          ]
        }
      }
    ]
  },
  {
    id: 103,
    title: 'Culture & IA : feuille de route pour les institutions publiques',
    slug: 'culture-intelligence-artificielle',
    updated_at: buildTimestamp(9),
    versions: [
      {
        id: 1003,
        version_number: 1,
        body: `## Pourquoi une feuille de route ?\n\nLes régies culturelles testent la génération de contenus mais peinent à cadrer les usages.\n\n## Trois chantiers prioritaires\n\n- Former les équipes éditoriales\n- Définir les critères d’éligibilité IA\n- Auditer les impacts juridiques`,
        diff: {
          chapeau: 'Nous avons interrogé 12 DRAC pour construire un référentiel simple à déployer.',
          lead: {
            imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
            caption: 'Prototype IA dans un centre chorégraphique national'
          },
          footnotes: [],
          callouts: [
            {
              title: 'Checklist gouvernance',
              body: 'Documenter les prompts, tracer les validations et prévoir une clause de sortie IA dans chaque contrat.',
              tone: 'success'
            }
          ]
        }
      }
    ]
  }
];
