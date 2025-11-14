export type Language = 'fr' | 'nl';

export const fallbackLanguage: Language = 'fr';

export const availableLanguages: Array<{ code: Language; label: string }> = [
  { code: 'fr', label: 'Français' },
  { code: 'nl', label: 'Nederlands' }
];

type TranslationRecord = Record<string, unknown>;

export const translations: Record<Language, TranslationRecord> = {
  fr: {
    common: {
      languageSwitcher: {
        label: 'Langue',
        browser: 'Détectée depuis votre navigateur'
      },
      actions: {
        close: 'Fermer',
        open: 'Ouvrir',
        loadMore: 'Charger plus'
      }
    },
    navigation: {
      brand: 'Lavamedia',
      greeting: 'Bonjour, {name}',
      loggedInAs: 'Connecté en tant que {name}',
      dashboard: 'Mon espace',
      logout: 'Se déconnecter',
      login: 'Se connecter',
      signup: 'Créer un compte',
      toggleMenu: 'Ouvrir le menu',
      goToSpace: 'Accéder à mon espace',
      navItems: [
        { href: '/', label: 'Accueil' },
        { href: '/rubriques', label: 'Rubriques' },
        { href: '/recherche', label: 'Recherche' },
        { href: '/newsletter', label: 'Newsletter' },
        { href: '/abonnement', label: 'Abonnements' }
      ],
      studioItems: [
        { href: '/journalist/editeur', label: 'Studio' },
        { href: '/journalist/brouillons', label: 'Brouillons' }
      ]
    },
    footer: {
      tagline: 'Médias responsables, storytelling innovant et outils pour accélérer votre rédaction.',
      sections: [
        {
          title: 'Lavamedia',
          links: [
            { label: 'À propos', href: '/a-propos' },
            { label: 'Contact', href: '/contact' },
            { label: 'Publicité', href: '/admin/publicite' }
          ]
        },
        {
          title: 'Ressources',
          links: [
            { label: 'Guide rédactionnel', href: '/journalist' },
            { label: 'Charte éthique', href: '/charte' },
            { label: 'Aide', href: '/support' }
          ]
        }
      ],
      copyright: '© {year} Lavamedia. Tous droits réservés.'
    },
    home: {
      hero: {
        eyebrow: 'Magazine nouvelle génération',
        title: 'Des outils, des récits et une communauté pour accélérer votre rédaction.',
        description:
          'Lavamedia est un hub éditorial pour journalistes, storytellers et responsables éditoriaux. Découvrez notre sélection d’articles, nos formations internes et nos ressources exclusives.',
        primaryCta: 'Explorer les rubriques',
        secondaryCta: 'Rejoindre la newsletter'
      },
      brief: {
        title: 'Brief quotidien',
        description: 'Chaque matin, l’équipe éditoriale partage les tendances qui façonnent la narration de demain.'
      },
      spotlight: {
        eyebrow: 'En une',
        title: 'Les récits qui transforment la presse',
        description: 'Notre rédaction expérimente de nouveaux formats pour décrypter les enjeux contemporains.'
      },
      subscriptions: {
        eyebrow: 'Abonnements',
        title: 'Passez au Print + Digital en quelques clics',
        description: 'Choisissez un paiement mensuel (engagement 3 mois) ou annuel selon votre rythme.'
      },
      community: {
        eyebrow: 'Community first',
        title: 'Des ressources pour grandir avec votre audience',
        description: 'Ateliers, kits éditoriaux, résidences journalistiques : accédez à nos outils exclusifs.',
        bullets: [
          '• Kits d’enquêtes collaboratives prêts à l’emploi',
          '• Indicateurs d’impact éditorial et dashboards temps réel',
          '• Médiathèque partagée avec métadonnées enrichies'
        ],
        newsletterTitle: 'Newsletter impact',
        newsletterDescription: 'Recevez nos meilleures analyses chaque semaine.'
      }
    },
    newsletter: {
      eyebrow: 'Newsletter',
      title: 'Restez connecté·e à l’avant-garde éditoriale',
      description: 'Une fois par semaine, un condensé de nos meilleurs articles et des opportunités réservées aux abonnés.'
    },
    newsletterForm: {
      emailLabel: 'Adresse e-mail',
      hint: 'Recevez chaque semaine notre sélection éditoriale et les coulisses de la rédaction.',
      submit: 'Je m’abonne',
      loading: 'Inscription…',
      success: 'Merci ! Vous êtes bien inscrit·e à notre newsletter.',
      error: 'Une erreur est survenue, veuillez réessayer.'
    },
    subscriptions: {
      eyebrow: 'Abonnements',
      title: 'Soutenez une presse indépendante',
      description: 'Choisissez Print + Digital ou 100% numérique, et basculez librement entre paiement mensuel (engagement 3 mois) ou facturation annuelle.',
      longDescription: 'Nos formules réunissent les 4 numéros imprimés de l’année, l’accès illimité aux archives et un accompagnement personnalisé. Chaque abonnement finance directement l’indépendance de la rédaction.',
      stickyTitle: 'Livraison, accès illimité et support premium',
      stickyDescription: 'La team abonnement suit vos paiements, gère les changements d’adresse et vous envoie une alerte en cas de problème de carte bancaire.',
      highlights: [
        {
          title: 'Expédition en Europe',
          description: 'Vos numéros papier sont expédiés depuis Bruxelles avec suivi et packaging recyclable.'
        },
        {
          title: 'Accès instantané au digital',
          description: 'Dès l’abonnement activé, vous débloquez toutes les archives et dossiers spéciaux.'
        },
        {
          title: 'Support humain',
          description: 'Un membre de l’équipe répond sous 24h aux questions de facturation ou problèmes Stripe.'
        }
      ],
      intervals: {
        monthly: { label: 'Mensuel', helper: 'Engagement 3 mois' },
        annual: { label: 'Annuel', helper: 'Facturation unique' }
      },
      periodSuffix: {
        monthly: '/mois',
        annual: '/an'
      },
      labels: {
        popular: 'Best-seller',
        support: 'Solidarité',
        forthcoming: 'Tarif à venir',
        monthlyFallback: 'Mensuel',
        annualFallback: 'Annuel',
        intervalHelperFallback: 'Choix libre',
        formTitleFallback: 'Créer votre compte',
        formDescriptionFallback: 'Validez vos informations pour accéder au paiement sécurisé.',
        existingAccountHintFallback: 'Vous avez déjà un compte ? Réutilisez vos identifiants.',
        submitFallback: 'Continuer vers Stripe',
        missingFieldsFallback: 'Merci de saisir votre e-mail et un mot de passe.',
        genericErrorFallback: 'Impossible de préparer la session Stripe.',
        fullNameFallback: 'Nom complet (optionnel)',
        emailFallback: 'Adresse e-mail',
        passwordFallback: 'Mot de passe'
      },
      form: {
        title: 'Créer ou réactiver votre compte',
        description: 'Nous créons votre compte lecteur avant de vous rediriger vers Stripe.',
        existingAccountHint: 'Si vous possédez déjà un compte, entrez le même e-mail et mot de passe : nous vous reconnecterons automatiquement.',
        fields: {
          fullName: 'Nom complet (optionnel)',
          email: 'Adresse e-mail',
          password: 'Mot de passe'
        },
        submit: 'Passer au paiement sécurisé',
        errors: {
          missingFields: 'Merci de renseigner votre e-mail et un mot de passe pour créer le compte.',
          generic: 'Impossible de créer la session Stripe pour le moment.'
        }
      },
      status: {
        alreadyActive: 'Vous disposez déjà d’un abonnement actif.',
        manage: 'Ouvrir mon espace'
      },
      errors: {
        planUnavailable: 'Selectionnez une formule pour continuer.'
      },
      connectedAs: 'Connecté en tant que {email}',
      loading: 'Préparation…',
      plans: [
        {
          slug: 'classic',
          badge: 'Print + Digital',
          name: 'Classique',
          tagline: 'La formule la plus plébiscitée, équilibrant papier et accès illimité.',
          description: 'Recevez 4 numéros par an chez vous et débloquez instantanément toutes les archives digitales.',
          bestFor: 'Pour les passionnés de print',
          highlight: 'popular',
          includesPrint: true,
          defaultInterval: 'monthly',
          features: [
            '4 numéros imprimés par an, livraison incluse',
            'Accès complet aux archives et dossiers long format',
            'Usage multi-écran (mobile, tablette et desktop)',
            'Support prioritaire en cas de problème de paiement'
          ],
          prices: {
            monthly: { amount: 4.5, currency: 'EUR', note: 'Engagement 3 mois minimum' },
            annual: { amount: 50, currency: 'EUR', note: 'Facturation en un versement' }
          }
        },
        {
          slug: 'digital',
          badge: 'Digital',
          name: 'Digital',
          tagline: 'Accès illimité à tous les articles, dossiers et archives audio.',
          description: 'Pensée pour les lecteurs nomades qui privilégient le numérique tout en soutenant la rédaction.',
          bestFor: 'Pour les lecteurs nomades',
          includesPrint: false,
          defaultInterval: 'annual',
          features: [
            'Accès illimité à tous les numéros numériques',
            'Lecture hors-ligne dans l’espace lecteur',
            'Newsletter privée avec briefs éditoriaux',
            'Alertes dès la publication des nouveaux numéros'
          ],
          prices: {
            monthly: { amount: 3, currency: 'EUR', note: 'Débit mensuel, engagement 3 mois' },
            annual: { amount: 30, currency: 'EUR', note: 'Économie de 20% vs mensuel' }
          }
        },
        {
          slug: 'supporter',
          badge: 'Hauts revenus',
          name: 'Hauts revenus',
          tagline: 'Pour celles et ceux qui souhaitent financer davantage de reportages.',
          description: 'Vous recevez le print + digital et contribuez au financement des enquêtes longues.',
          bestFor: 'Pour les alliés de la rédaction',
          highlight: 'support',
          includesPrint: true,
          defaultInterval: 'annual',
          features: [
            '4 numéros imprimés et accès digital illimité',
            'Invitation aux débriefs trimestriels avec la rédaction',
            'Badge soutien affiché dans votre espace lecteur',
            'Kit de bienvenue sérigraphié par nos illustrateurs'
          ],
          prices: {
            monthly: { amount: 7.5, currency: 'EUR', note: 'Paiement mensuel flexible' },
            annual: { amount: 85, currency: 'EUR', note: 'Contribution directe au fonds reportage' }
          }
        }
      ]
    },
    rubriques: {
      eyebrow: 'Rubriques',
      title: 'Nos univers éditoriaux',
      description: 'Chaque rubrique est pilotée par un collectif d’experts et de journalistes passionnés.',
      empty: 'Cette rubrique n’a pas encore d’article publié.'
    },
    about: {
      eyebrow: 'Manifeste',
      title: 'Notre mission',
      paragraphs: [
        'Lavamedia accompagne les rédactions qui souhaitent créer un journalisme d’impact, participatif et durable. Nous combinons savoir-faire éditorial, design systémique et technologies responsables.',
        'Notre équipe rassemble des journalistes, des product designers, des développeurs et des chercheurs en sciences sociales. Ensemble, nous expérimentons des formats qui mettent les communautés au centre.'
      ]
    },
    charter: {
      eyebrow: 'Éthique',
      title: 'Nos engagements',
      commitments: [
        'Indépendance éditoriale garantie par un comité composé de membres externes.',
        'Transparence financière totale sur les partenariats et campagnes sponsorisées.',
        'Protection renforcée des sources et dispositifs de chiffrement de bout en bout.'
      ]
    },
    search: {
      eyebrow: 'Recherche',
      title: 'Trouver l’histoire qui vous inspire',
      description: 'Explorez nos articles, études de cas et retours d’expérience.',
      label: 'Rechercher un article',
      placeholder: 'Climat, politique, innovation…',
      button: 'Chercher',
      empty: 'Aucun résultat pour « {query} ».'
    },
    support: {
      eyebrow: 'Support',
      title: 'Ressources et FAQ',
      faqs: [
        {
          question: 'Comment accéder à l’espace journaliste ? ',
          answer: 'Inscrivez-vous avec votre e-mail professionnel. L’équipe admin valide sous 24h.'
        },
        {
          question: 'Puis-je proposer une rubrique ?',
          answer: 'Oui. Envoyez votre pitch via le formulaire contact. Nous revenons vers vous rapidement.'
        }
      ]
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Écrivez-nous',
      description: 'Nous répondons sous 48h à toutes les sollicitations presse et partenariats.',
      name: 'Nom complet',
      email: 'Adresse e-mail',
      message: 'Message',
      submit: 'Envoyer'
    },
    admin: {
      eyebrow: 'Administration',
      title: 'Coordonnez l’écosystème Lavamedia',
      description: 'Gérez les accès, optimisez le référencement et pilotez les partenariats commerciaux.',
      insights: [
        { label: 'Abonnés actifs', value: '12 560', insight: 'Taux de conversion newsletter 7,2%' },
        { label: 'Campagnes publicitaires', value: '3 en cours', insight: 'CTR moyen 4,8%' },
        { label: 'Rôles attribués', value: '24 journalistes', insight: '6 administrateurs' }
      ],
      monitoring: {
        title: 'Monitoring du studio',
        description: 'Suivi en direct des actions critiques',
        liveLabel: 'Live monitoring',
        validate: 'Valider',
        invalidate: 'Invalider',
        status: {
          pending: 'En attente',
          approved: 'Validé',
          rejected: 'Invalidé',
          notified: 'Notifié'
        },
        events: [
          {
            id: '1',
            user: 'Alice Studio',
            role: 'Éditrice',
            action: 'a mis à jour la page d’accueil',
            asset: 'Studio impact climat',
            timestamp: 'Il y a 4 min',
            status: 'pending',
            canValidate: true
          },
          {
            id: '2',
            user: 'Marc Admin',
            role: 'Administrateur',
            action: 'a validé une campagne audio',
            asset: 'Brief partenaire Looping',
            timestamp: 'Il y a 26 min',
            status: 'approved'
          },
          {
            id: '3',
            user: 'Nora Auteur',
            role: 'Contributrice',
            action: 'demande une relecture',
            asset: 'Dossier « Voix locales »',
            timestamp: 'Il y a 1 h',
            status: 'notified'
          }
        ]
      },
      notifications: {
        title: 'Notifications',
        description: 'Alertes critiques, demandes de validation et rappels SLA.',
        severity: {
          info: 'Info',
          warning: 'Prioritaire',
          success: 'Résolu'
        },
        items: [
          {
            id: 'alert-1',
            title: 'Relire la mise à jour du Studio COP',
            detail: 'Le module vidéo a été modifié par Alice Studio. Vérifiez la conformité avant diffusion.',
            severity: 'warning',
            action: 'Ouvrir le journal'
          },
          {
            id: 'alert-2',
            title: 'Nouvelle notification partenaire',
            detail: 'Looping a ajouté un brief audio. Confirmez l’accès contributeur.',
            severity: 'info',
            action: 'Gérer les accès'
          },
          {
            id: 'alert-3',
            title: 'Abonnement corporate renouvelé',
            detail: 'Société Kaba active 120 accès clients premium pour 12 mois.',
            severity: 'success'
          }
        ]
      },
      permissions: {
        title: 'Contrôle des rôles',
        description: 'Ajustez finement qui peut publier, valider ou simplement consulter.',
        helper: 'Chaque badge indique le niveau d’autorisation actif.',
        capability: 'Fonctionnalité',
        states: {
          full: 'Accès total',
          approve: 'Valider',
          edit: 'Contribution',
          view: 'Lecture',
          blocked: 'Bloqué'
        },
        roles: [
          { id: 'admin', label: 'Admin' },
          { id: 'editor', label: 'Éditeur' },
          { id: 'author', label: 'Auteur' },
          { id: 'contributor', label: 'Contributeur' },
          { id: 'subscriber', label: 'Abonné' },
          { id: 'client', label: 'Client' }
        ],
        matrix: [
          {
            capability: 'Studio & monitoring',
            description: 'Création, publication et audit en temps réel.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'edit',
              contributor: 'edit',
              subscriber: 'view',
              client: 'view'
            }
          },
          {
            capability: 'Campagnes publicitaires',
            description: 'Validation des assets partenaires et budgets.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'view',
              contributor: 'blocked',
              subscriber: 'blocked',
              client: 'view'
            }
          },
          {
            capability: 'Gestion des abonnements',
            description: 'Upgrades, remboursements et affectation des accès.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'blocked',
              contributor: 'blocked',
              subscriber: 'view',
              client: 'view'
            }
          }
        ]
      },
      subscriptions: {
        title: 'Abonnements',
        description: 'Visualisez les statuts par segment et intervenez par rôle ou par utilisateur.',
        refresh: 'Actualiser les données Stripe',
        loading: 'Synchronisation…',
        error: 'Impossible de récupérer les abonnements live.',
        liveFeedTitle: 'Derniers abonnements et incidents',
        empty: 'Aucun abonnement enregistré pour l’instant.',
        nextCharge: 'Prochain prélèvement : {date}',
        metrics: {
          total: 'Comptes suivis',
          active: 'Actifs',
          pastDue: 'En retard',
          issues: 'Alertes'
        },
        planLabels: {
          classic: 'Classique',
          digital: 'Digital',
          supporter: 'Hauts revenus'
        },
        intervalLabels: {
          monthly: 'Mensuel',
          annual: 'Annuel'
        },
        statusLabels: {
          active: 'Actif',
          trialing: 'Période d’essai',
          past_due: 'Paiement en retard',
          canceled: 'Résilié',
          unpaid: 'Impayé',
          incomplete: 'Incomplet'
        },
        cta: 'Voir toutes les fiches abonnés',
        highlightsTitle: 'Actions récentes par rôle',
        segments: [
          {
            id: 'subscribers',
            label: 'Abonnés premium',
            total: '8 420',
            trend: '+4,2% / 30 j',
            roleFocus: 'Rôles : abonnés + lecteurs avancés',
            description: 'Renouvellement automatique pour 82% des comptes.',
            actions: ['Analyser la rétention', 'Relancer les expirations', 'Geler un accès sensible']
          },
          {
            id: 'contributors',
            label: 'Contributeurs studio',
            total: '1 260',
            trend: '+2,1% / 7 j',
            roleFocus: 'Rôles : contributeurs + auteurs externes',
            description: 'Workflow de validation accéléré (moins de 6 h).',
            actions: ['Assigner un tuteur', 'Limiter l’export', 'Auditer les permissions']
          },
          {
            id: 'clients',
            label: 'Clients corporate',
            total: '310 comptes',
            trend: 'Stable',
            roleFocus: 'Rôles : clients + partenaires',
            description: 'Contrats multi-utilisateurs avec reporting dédié.',
            actions: ['Vérifier les SLA', 'Exporter les factures', 'Ajouter un contributeur invité']
          }
        ],
        highlights: [
          {
            id: 'highlight-1',
            user: 'Nora Client',
            role: 'Client entreprise',
            action: 'a converti 12 comptes contributeurs en accès premium.'
          },
          {
            id: 'highlight-2',
            user: 'Yanis Reporter',
            role: 'Contributeur studio',
            action: 'a demandé un audit des droits suite à une notification critique.'
          },
          {
            id: 'highlight-3',
            user: 'Sara Insight',
            role: 'Admin',
            action: 'a suspendu un abonnement en doublon et notifié le support.'
          },
          {
            id: 'highlight-4',
            user: 'Lina Abonnée',
            role: 'Abonnée premium',
            action: 'a mis à jour ses rôles lecteurs/clients pour partager son accès.'
          }
        ]
      }
    },
    journalist: {
      eyebrow: 'Espace journaliste',
      title: 'Piloter vos contenus en un coup d’œil',
      description: 'Suivez la performance de vos articles, coordonnez l’équipe et publiez en toute sérénité.',
      openEditor: 'Ouvrir l’éditeur',
      createArticle: 'Créer un nouvel article',
      metrics: [
        { label: 'Lecteurs uniques', value: '38 420', change: '+12% vs. semaine dernière' },
        { label: 'Temps moyen de lecture', value: '4 min 32', change: '+9% sur 30 jours' },
        { label: 'Taux de complétion', value: '72%', change: '+5 pts sur les reportages longs' }
      ]
    },
    drafts: {
      eyebrow: 'Brouillons',
      title: 'Centralisez vos articles en préparation',
      description: 'Assignez des tâches, commentez les passages clés et suivez les validations.',
      open: 'Ouvrir',
      drafts: [
        {
          title: 'Climat : comment couvrir les COP différemment',
          updatedAt: '2024-04-17T11:32:00.000Z',
          status: 'En relecture',
          owner: 'Jeanne Journaliste'
        },
        {
          title: 'Podcast : la voix des quartiers populaires',
          updatedAt: '2024-04-15T09:12:00.000Z',
          status: 'À compléter',
          owner: 'Yanis Reporter'
        }
      ]
    },
    privateSpace: {
      loading: 'Chargement de votre espace…',
      eyebrow: 'Espace privé',
      greeting: 'Bonjour {name}',
      description: 'Retrouvez ici un aperçu rapide de votre profil et un accès direct à vos outils.',
      benefits: {
        accountStatus: 'Statut du compte',
        admin: 'Administrateur',
        author: 'Auteur confirmé',
        reader: 'Lecteur actif',
        email: 'E-mail',
        roles: 'Rôles associés',
        none: 'Aucun rôle spécifique'
      },
      studio: {
        title: 'Studio éditorial',
        description: 'Accédez à vos brouillons et à l’éditeur riche en un clic.',
        openEditor: 'Ouvrir l’éditeur',
        manageDrafts: 'Gérer mes brouillons'
      },
      next: {
        title: 'Prochaine étape',
        description: 'Continuez votre navigation ou accédez à vos outils dédiés.',
        admin: 'Accéder au back-office',
        author: 'Ouvrir le tableau de bord auteur',
        reader: 'Explorer les articles',
        manageNewsletters: 'Gérer mes newsletters'
      }
    },
    guard: {
      checking: 'Vérification des droits en cours…',
      requireLogin: 'Vous devez être connecté·e pour accéder à cette section.',
      forbidden: 'Votre rôle ne vous autorise pas à consulter cette page.',
      backToSpace: 'Retour à mon espace'
    },
    createArticle: {
      defaultBody:
        'Commencez votre article ici. Vous pourrez enrichir le texte, ajouter des médias et structurer vos parties dans le studio.',
      title: 'Titre de l’article',
      placeholder: 'Ex. : Comment réinventer la couverture locale ?',
      slugPreview: 'Slug provisoire : {slug}',
      format: 'Format',
      formats: {
        article: 'Article',
        reportage: 'Reportage',
        podcast: 'Podcast'
      },
      summary: 'Résumé (optionnel)',
      summaryPlaceholder: 'Un aperçu en 2 phrases. Le contenu détaillé sera rédigé dans l’éditeur.',
      errors: {
        title: 'Indiquez un titre pour votre article.',
        auth: 'Vous devez être connecté pour créer un article.'
      },
      submit: 'Créer et ouvrir dans l’éditeur',
      submitting: 'Création en cours…',
      note: 'L’article sera enregistré en brouillon et visible uniquement depuis votre espace.'
    },
    editor: {
      loading: 'Chargement du studio éditorial…',
      connectionHint:
        'Assurez-vous que l’API FastAPI est démarrée sur <code class="font-mono">http://localhost:8000</code> et que votre compte dispose des droits journaliste ou éditeur.',
      empty: 'Aucun contenu disponible pour l’instant. Créez un article dans le back-office pour activer le studio éditorial.',
      demo:
        'Mode démo activé : les contenus affichés proviennent d’un jeu de données local (<strong>aucune sauvegarde n’est envoyée au serveur</strong>). Lancez l’API FastAPI pour retrouver vos articles réels.',
      selectionEyebrow: 'Sélection du contenu',
      lastUpdate: 'Dernière mise à jour : {date}',
      tracking: 'Suivi actif — {count} modification(s) locale(s) en attente',
      chooseAnother: 'Choisir un autre article',
      fallbackError: 'Impossible de récupérer les contenus.',
      checkRights: 'Assurez-vous que vous disposez des droits nécessaires.'
    },
    editorPage: {
      eyebrow: 'Éditeur riche',
      title: 'Composez vos articles en toute sérénité',
      description: 'Prévisualisation en temps réel, gestion des métadonnées et validations intégrées.'
    },
    newsletterGuard: {
      manage: 'Gérer mes newsletters'
    },
    article: {
      breadcrumb: 'Fil d’ariane',
      home: 'Accueil',
      byAuthor: 'Par {author}',
      publishedOn: '{date}'
    },
    articleCard: {
      readMore: 'Lire l’article'
    },
    draftsList: {
      updated: 'Modifié le {date}'
    },
    searchBar: {
      aria: 'Rechercher un article'
    },
    categories: [
      {
        slug: 'planete',
        title: 'Planète',
        description: 'Climat, biodiversité et transitions écologiques.'
      },
      {
        slug: 'societe',
        title: 'Société',
        description: 'Enquêtes sur les dynamiques sociales et solidaires.'
      },
      {
        slug: 'culture',
        title: 'Culture',
        description: 'Création, arts vivants et tendances numériques.'
      }
    ],
    articles: [
      {
        slug: 'oceans-en-peril',
        title: 'Océans en péril : comment les rédactions couvrent l’urgence bleue',
        category: 'Planète',
        categorySlug: 'planete',
        excerpt: 'Rencontre avec des reporters spécialisés qui réinventent la narration environnementale.',
        publishedAt: '2024-04-03',
        author: 'Jeanne Journaliste',
        body: `<h3>Plongée dans les rédactions</h3><p>Nous avons interrogé sept rédactions européennes qui expérimentent de nouveaux formats immersifs pour expliquer les défis océaniques.</p>`
      },
      {
        slug: 'intelligence-collective',
        title: 'Intelligence collective : les rédactions qui co-produisent avec leurs lecteurs',
        category: 'Société',
        categorySlug: 'societe',
        excerpt: 'Des initiatives de co-création éditoriale, du fact-checking partagé aux enquêtes collaboratives.',
        publishedAt: '2024-03-22',
        author: 'Alex Admin',
        body: `<h3>Réinventer la relation lecteur</h3><p>Quand les lecteurs deviennent contributeurs, la dynamique éditoriale change profondément et ouvre de nouveaux horizons éditoriaux.</p>`
      },
      {
        slug: 'ai-dans-la-culture',
        title: 'Créateurs et IA : chroniques d’une collaboration inspirée',
        category: 'Culture',
        categorySlug: 'culture',
        excerpt: 'Comment les artistes intègrent les algorithmes à leur processus créatif sans perdre leur voix.',
        publishedAt: '2024-02-17',
        author: 'Jeanne Journaliste',
        body: `<h3>IA et art</h3><p>Du théâtre immersif aux résidences musicales augmentées, tour d’horizon des initiatives françaises qui marient création et intelligence artificielle.</p>`
      }
    ]
  },
  nl: {
    common: {
      languageSwitcher: {
        label: 'Taal',
        browser: 'Gedetecteerd via uw browser'
      },
      actions: {
        close: 'Sluiten',
        open: 'Openen',
        loadMore: 'Meer laden'
      }
    },
    navigation: {
      brand: 'Lavamedia',
      greeting: 'Hallo, {name}',
      loggedInAs: 'Aangemeld als {name}',
      dashboard: 'Mijn ruimte',
      logout: 'Afmelden',
      login: 'Aanmelden',
      signup: 'Account aanmaken',
      toggleMenu: 'Menu openen',
      goToSpace: 'Ga naar mijn ruimte',
      navItems: [
        { href: '/', label: 'Home' },
        { href: '/rubriques', label: 'Rubrieken' },
        { href: '/recherche', label: 'Zoeken' },
        { href: '/newsletter', label: 'Nieuwsbrief' },
        { href: '/abonnement', label: 'Abonnementen' }
      ],
      studioItems: [
        { href: '/journalist/editeur', label: 'Studio' },
        { href: '/journalist/brouillons', label: 'Kladversies' }
      ]
    },
    footer: {
      tagline: 'Verantwoorde media, innovatieve storytelling en tools die uw redactie versnellen.',
      sections: [
        {
          title: 'Lavamedia',
          links: [
            { label: 'Over ons', href: '/a-propos' },
            { label: 'Contact', href: '/contact' },
            { label: 'Advertentie', href: '/admin/publicite' }
          ]
        },
        {
          title: 'Resources',
          links: [
            { label: 'Redactionele gids', href: '/journalist' },
            { label: 'Ethische charter', href: '/charte' },
            { label: 'Hulp', href: '/support' }
          ]
        }
      ],
      copyright: '© {year} Lavamedia. Alle rechten voorbehouden.'
    },
    home: {
      hero: {
        eyebrow: 'Magazine nieuwe generatie',
        title: 'Tools, verhalen en een community om uw redactie te versnellen.',
        description:
          'Lavamedia is een redactioneel hub voor journalisten, storytellers en hoofdredacteurs. Ontdek onze artikelselectie, interne opleidingen en exclusieve resources.',
        primaryCta: 'Ontdek de rubrieken',
        secondaryCta: 'Schrijf u in op de nieuwsbrief'
      },
      brief: {
        title: 'Dagelijkse briefing',
        description: 'Elke ochtend deelt de redactie de trends die de verhalen van morgen vormgeven.'
      },
      spotlight: {
        eyebrow: 'In de kijker',
        title: 'Verhalen die de pers transformeren',
        description: 'Onze redactie experimenteert met nieuwe formats om actuele vraagstukken te duiden.'
      },
      subscriptions: {
        eyebrow: 'Abonnementen',
        title: 'Schakel in één klik tussen print en digitaal',
        description: 'Kies voor maandelijkse betalingen (met 3 maanden engagement) of een jaarlijkse factuur.'
      },
      community: {
        eyebrow: 'Community first',
        title: 'Resources om met uw publiek te groeien',
        description: 'Workshops, redactionele kits, journalistieke residenties: krijg toegang tot onze exclusieve tools.',
        bullets: [
          '• Kant-en-klare kits voor gezamenlijke onderzoeken',
          '• Indicatoren voor redactionele impact en realtime dashboards',
          '• Gedeelde mediatheek met verrijkte metadata'
        ],
        newsletterTitle: 'Impactnieuwsbrief',
        newsletterDescription: 'Ontvang elke week onze beste analyses.'
      }
    },
    newsletter: {
      eyebrow: 'Nieuwsbrief',
      title: 'Blijf verbonden met de redactietrendsetters',
      description: 'Elke week een selectie van onze beste artikels en voordelen voor abonnees.'
    },
    newsletterForm: {
      emailLabel: 'E-mailadres',
      hint: 'Ontvang wekelijks onze redactionele selectie en een blik achter de schermen.',
      submit: 'Ik schrijf me in',
      loading: 'Inschrijven…',
      success: 'Bedankt! U bent ingeschreven op onze nieuwsbrief.',
      error: 'Er is een fout opgetreden. Probeer het opnieuw.'
    },
    subscriptions: {
      eyebrow: 'Abonnementen',
      title: 'Steun een onafhankelijke redactie',
      description: 'Kies voor Print + Digitaal of 100% digitaal en wissel tussen maandelijkse betalingen (3 maanden engagement) of een jaarlijkse factuur.',
      longDescription: 'Onze formules combineren vier papieren nummers per jaar, onbeperkte toegang tot het digitale archief en toegewijde opvolging door het abonnements­t eam. Elke bijdrage financiert rechtstreeks ons onderzoekswerk.',
      stickyTitle: 'Levering, onbeperkt lezen en premium support',
      stickyDescription: 'Het abonnementsteam volgt uw betalingen op, beheert adreswijzigingen en contacteert u wanneer Stripe een kaart weigert.',
      highlights: [
        {
          title: 'Verzending vanuit Brussel',
          description: 'De papieren edities vertrekken vanuit Brussel met tracking en recycleerbare verpakking.'
        },
        {
          title: 'Onmiddellijke digitale toegang',
          description: 'Van zodra het abonnement actief is krijgt u toegang tot alle dossiers, podcasts en archieven.'
        },
        {
          title: 'Menselijke helpdesk',
          description: 'Binnen 24 uur antwoord op facturatievragen of problemen met uw betaalkaart.'
        }
      ],
      intervals: {
        monthly: { label: 'Maandelijks', helper: '3 maanden engagement' },
        annual: { label: 'Jaarlijks', helper: 'Eén factuur' }
      },
      periodSuffix: {
        monthly: '/maand',
        annual: '/jaar'
      },
      labels: {
        popular: 'Populairst',
        support: 'Solidariteit',
        forthcoming: 'Tarief binnenkort',
        monthlyFallback: 'Maandelijks',
        annualFallback: 'Jaarlijks',
        intervalHelperFallback: 'Vrij kiezen',
        formTitleFallback: 'Account aanmaken',
        formDescriptionFallback: 'Vul uw gegevens in om naar Stripe te gaan.',
        existingAccountHintFallback: 'Al klant? Gebruik uw bestaande inloggegevens.',
        submitFallback: 'Verder naar Stripe',
        missingFieldsFallback: 'Vul minstens e-mail en wachtwoord in.',
        genericErrorFallback: 'Stripe-sessie kon niet worden voorbereid.',
        fullNameFallback: 'Volledige naam (optioneel)',
        emailFallback: 'E-mailadres',
        passwordFallback: 'Wachtwoord'
      },
      form: {
        title: 'Maak of heractiveer uw account',
        description: 'We maken eerst uw lezersaccount aan vooraleer u naar Stripe gaat.',
        existingAccountHint: 'Gebruikt u al een account? Vul hetzelfde e-mailadres en wachtwoord in en we melden u automatisch aan.',
        fields: {
          fullName: 'Volledige naam (optioneel)',
          email: 'E-mailadres',
          password: 'Wachtwoord'
        },
        submit: 'Ga naar beveiligde betaling',
        errors: {
          missingFields: 'Vul minstens uw e-mail en een wachtwoord in om een account te maken.',
          generic: 'Het Stripe-betalingsvenster kon niet worden geopend.'
        }
      },
      status: {
        alreadyActive: 'U hebt al een actief abonnement.',
        manage: 'Open mijn ruimte'
      },
      errors: {
        planUnavailable: 'Kies een formule om verder te gaan.'
      },
      connectedAs: 'Aangemeld als {email}',
      loading: 'Voorbereiden…',
      plans: [
        {
          slug: 'classic',
          badge: 'Print + Digitaal',
          name: 'Klassiek',
          tagline: 'De favoriete formule die papier en digitaal combineert.',
          description: 'Ontvang vier papieren nummers per jaar en ontgrendel meteen alle digitale dossiers.',
          bestFor: 'Voor fans van print',
          highlight: 'popular',
          includesPrint: true,
          defaultInterval: 'monthly',
          features: [
            '4 gedrukte nummers per jaar, levering inbegrepen',
            'Volledige toegang tot alle digitale dossiers',
            'Lezen op smartphone, tablet en desktop',
            'Prioritaire support bij betalingsproblemen'
          ],
          prices: {
            monthly: { amount: 4.5, currency: 'EUR', note: 'Engagement van minstens 3 maanden' },
            annual: { amount: 50, currency: 'EUR', note: 'Eén jaarlijkse betaling' }
          }
        },
        {
          slug: 'digital',
          badge: 'Digitaal',
          name: 'Digitaal',
          tagline: 'Onbeperkte toegang tot alle artikels, podcasts en archieven.',
          description: 'Ideaal voor lezers die vooral mobiel lezen maar wel onze redactie willen steunen.',
          bestFor: 'Voor digitale lezers',
          includesPrint: false,
          defaultInterval: 'annual',
          features: [
            'Onbeperkt digitaal archief',
            'Offline lezen in de lezerszone',
            'Private nieuwsbrief met redactionele briefs',
            'Meldingen bij elk nieuw nummer'
          ],
          prices: {
            monthly: { amount: 3, currency: 'EUR', note: 'Maandelijkse betaling, 3 maanden engagement' },
            annual: { amount: 30, currency: 'EUR', note: '20% voordeel t.o.v. maandelijks' }
          }
        },
        {
          slug: 'supporter',
          badge: 'Hoge inkomens',
          name: 'Hoge inkomens',
          tagline: 'Voor wie extra wil bijdragen aan onderzoeksjournalistiek.',
          description: 'U ontvangt print + digitaal en financiert tegelijk nieuwe onderzoeksprojecten.',
          bestFor: 'Voor bondgenoten van de redactie',
          highlight: 'support',
          includesPrint: true,
          defaultInterval: 'annual',
          features: [
            '4 gedrukte nummers en volledige digitale toegang',
            'Uitnodiging op de kwartaal-debriefs met de redactie',
            'Soutien-badge in uw lezersruimte',
            'Welkomstpakket gezeefdrukt door onze illustratoren'
          ],
          prices: {
            monthly: { amount: 7.5, currency: 'EUR', note: 'Flexibele maandelijkse betaling' },
            annual: { amount: 85, currency: 'EUR', note: 'Rechtstreeks voor het onderzoeksfonds' }
          }
        }
      ]
    },
    rubriques: {
      eyebrow: 'Rubrieken',
      title: 'Onze redactionele werelden',
      description: 'Elke rubriek wordt gedragen door een collectief van experts en gepassioneerde journalisten.',
      empty: 'Deze rubriek bevat nog geen gepubliceerd artikel.'
    },
    about: {
      eyebrow: 'Manifest',
      title: 'Onze missie',
      paragraphs: [
        'Lavamedia ondersteunt redacties die impactvolle, participatieve en duurzame journalistiek willen brengen. We combineren redactionele expertise, systemisch design en verantwoorde technologieën.',
        'Ons team bundelt journalisten, product designers, ontwikkelaars en sociale wetenschappers. Samen experimenteren we met formats die communities centraal stellen.'
      ]
    },
    charter: {
      eyebrow: 'Ethiek',
      title: 'Onze engagementen',
      commitments: [
        'Redactionele onafhankelijkheid gegarandeerd door een comité van externe leden.',
        'Volledige financiële transparantie over partnerschappen en gesponsorde campagnes.',
        'Versterkte bescherming van bronnen en end-to-end encryptie.'
      ]
    },
    search: {
      eyebrow: 'Zoeken',
      title: 'Vind het verhaal dat u inspireert',
      description: 'Verken onze artikels, casestudy’s en ervaringen.',
      label: 'Zoek een artikel',
      placeholder: 'Klimaat, politiek, innovatie…',
      button: 'Zoeken',
      empty: 'Geen resultaat voor “{query}”.'
    },
    support: {
      eyebrow: 'Support',
      title: 'Resources en FAQ',
      faqs: [
        {
          question: 'Hoe krijg ik toegang tot de journalistenruimte?',
          answer: 'Meld u aan met uw professionele e-mail. Het adminteam valideert binnen 24 uur.'
        },
        {
          question: 'Kan ik een rubriek voorstellen?',
          answer: 'Ja. Stuur uw pitch via het contactformulier. We nemen snel contact met u op.'
        }
      ]
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Schrijf ons',
      description: 'We beantwoorden binnen 48 uur alle pers- en partneraanvragen.',
      name: 'Volledige naam',
      email: 'E-mailadres',
      message: 'Bericht',
      submit: 'Versturen'
    },
    admin: {
      eyebrow: 'Administratie',
      title: 'Coördineer het Lavamedia-ecosysteem',
      description: 'Beheer toegangen, optimaliseer SEO en stuur commerciële partnerschappen aan.',
      insights: [
        { label: 'Actieve abonnees', value: '12 560', insight: 'Conversie nieuwsbrief 7,2%' },
        { label: 'Advertentiecampagnes', value: '3 actief', insight: 'Gemiddelde CTR 4,8%' },
        { label: 'Toegekende rollen', value: '24 journalisten', insight: '6 beheerders' }
      ],
      monitoring: {
        title: 'Studiomonitoring',
        description: 'Volg kritieke acties live',
        liveLabel: 'Live monitoring',
        validate: 'Valideren',
        invalidate: 'Afkeuren',
        status: {
          pending: 'In afwachting',
          approved: 'Goedgekeurd',
          rejected: 'Afgewezen',
          notified: 'Gemeld'
        },
        events: [
          {
            id: '1',
            user: 'Alice Studio',
            role: 'Editor',
            action: 'paste de homepage aan',
            asset: 'Studio klimaatinvloeden',
            timestamp: '4 min geleden',
            status: 'pending',
            canValidate: true
          },
          {
            id: '2',
            user: 'Marc Admin',
            role: 'Beheerder',
            action: 'keurde een audiocampagne goed',
            asset: 'Partnerbrief Looping',
            timestamp: '26 min geleden',
            status: 'approved'
          },
          {
            id: '3',
            user: 'Nora Auteur',
            role: 'Contributor',
            action: 'vraagt een nalezing aan',
            asset: 'Dossier “Lokale stemmen”',
            timestamp: '1 u geleden',
            status: 'notified'
          }
        ]
      },
      notifications: {
        title: 'Notificaties',
        description: 'Kritieke alerts, validatieverzoeken en SLA-herinneringen.',
        severity: {
          info: 'Info',
          warning: 'Prioriteit',
          success: 'Opgelost'
        },
        items: [
          {
            id: 'alert-1',
            title: 'Controleer de update van Studio COP',
            detail: 'Het videomodule werd aangepast door Alice Studio. Verifieer de conformiteit voor publicatie.',
            severity: 'warning',
            action: 'Open het logboek'
          },
          {
            id: 'alert-2',
            title: 'Nieuwe partnernotificatie',
            detail: 'Looping voegde een audiobrief toe. Bevestig de contributor-toegang.',
            severity: 'info',
            action: 'Toegangen beheren'
          },
          {
            id: 'alert-3',
            title: 'Corporate abonnement verlengd',
            detail: 'Bedrijf Kaba activeert 120 premium klantenaccounts voor 12 maanden.',
            severity: 'success'
          }
        ]
      },
      permissions: {
        title: 'Rolcontrole',
        description: 'Bepaal wie publiceert, valideert of enkel consulteert.',
        helper: 'Elke badge geeft het actieve autorisatieniveau weer.',
        capability: 'Functionaliteit',
        states: {
          full: 'Volledige toegang',
          approve: 'Valideren',
          edit: 'Bijdrage',
          view: 'Lezen',
          blocked: 'Geblokkeerd'
        },
        roles: [
          { id: 'admin', label: 'Admin' },
          { id: 'editor', label: 'Editor' },
          { id: 'author', label: 'Auteur' },
          { id: 'contributor', label: 'Contributor' },
          { id: 'subscriber', label: 'Abonnee' },
          { id: 'client', label: 'Klant' }
        ],
        matrix: [
          {
            capability: 'Studio & monitoring',
            description: 'Creatie, publicatie en realtime-audit.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'edit',
              contributor: 'edit',
              subscriber: 'view',
              client: 'view'
            }
          },
          {
            capability: 'Advertentiecampagnes',
            description: 'Validatie van partnerassets en budgetten.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'view',
              contributor: 'blocked',
              subscriber: 'blocked',
              client: 'view'
            }
          },
          {
            capability: 'Abonnementsbeheer',
            description: 'Upgrades, refunds en toegangstoewijzingen.',
            rules: {
              admin: 'full',
              editor: 'approve',
              author: 'blocked',
              contributor: 'blocked',
              subscriber: 'view',
              client: 'view'
            }
          }
        ]
      },
      subscriptions: {
        title: 'Abonnementen',
        description: 'Bekijk de statussen per segment en stuur acties per rol of gebruiker.',
        refresh: 'Stripe-data vernieuwen',
        loading: 'Bezig met synchroniseren…',
        error: 'Livegegevens konden niet worden opgehaald.',
        liveFeedTitle: 'Laatste abonnementen en incidenten',
        empty: 'Nog geen geregistreerde abonnementen.',
        nextCharge: 'Volgende afschrijving: {date}',
        metrics: {
          total: 'Gevolgde accounts',
          active: 'Actief',
          pastDue: 'Achterstallig',
          issues: 'Problemen'
        },
        planLabels: {
          classic: 'Klassiek',
          digital: 'Digitaal',
          supporter: 'Hoge inkomens'
        },
        intervalLabels: {
          monthly: 'Maandelijks',
          annual: 'Jaarlijks'
        },
        statusLabels: {
          active: 'Actief',
          trialing: 'Proefperiode',
          past_due: 'Te laat',
          canceled: 'Beëindigd',
          unpaid: 'Onbetaald',
          incomplete: 'Onvolledig'
        },
        cta: 'Alle abonnementsfiches openen',
        highlightsTitle: 'Recente acties per rol',
        segments: [
          {
            id: 'subscribers',
            label: 'Premium abonnees',
            total: '8 420',
            trend: '+4,2% / 30 d',
            roleFocus: 'Rollen: abonnees + gevorderde lezers',
            description: 'Automatische verlenging voor 82% van de accounts.',
            actions: ['Retentie analyseren', 'Verlopen accounts heractiveren', 'Gevoelige toegang bevriezen']
          },
          {
            id: 'contributors',
            label: 'Studio-contributors',
            total: '1 260',
            trend: '+2,1% / 7 d',
            roleFocus: 'Rollen: contributors + externe auteurs',
            description: 'Versneld validatietraject (minder dan 6 u).',
            actions: ['Mentor toewijzen', 'Export beperken', 'Rechten auditten']
          },
          {
            id: 'clients',
            label: 'Corporate klanten',
            total: '310 accounts',
            trend: 'Stabiel',
            roleFocus: 'Rollen: klanten + partners',
            description: 'Multi-user contracten met dedicated reporting.',
            actions: ['SLA’s controleren', 'Facturen exporteren', 'Gastcontributor toevoegen']
          }
        ],
        highlights: [
          {
            id: 'highlight-1',
            user: 'Nora Client',
            role: 'Zakelijke klant',
            action: 'converteerde 12 contributor-accounts naar premium toegang.'
          },
          {
            id: 'highlight-2',
            user: 'Yanis Reporter',
            role: 'Studio-contributor',
            action: 'vroeg een rechtenaudit aan na een kritieke melding.'
          },
          {
            id: 'highlight-3',
            user: 'Sara Insight',
            role: 'Admin',
            action: 'schorste een dubbele abonnementslijn en verwittigde support.'
          },
          {
            id: 'highlight-4',
            user: 'Lina Abonnée',
            role: 'Premium abonnee',
            action: 'paste haar lezers-/klantrollen aan om toegang te delen.'
          }
        ]
      }
    },
    journalist: {
      eyebrow: 'Journalistenruimte',
      title: 'Beheer uw content in één oogopslag',
      description: 'Volg de prestaties van uw artikels, coördineer het team en publiceer met vertrouwen.',
      openEditor: 'Editor openen',
      createArticle: 'Nieuw artikel maken',
      metrics: [
        { label: 'Unieke lezers', value: '38 420', change: '+12% vs. vorige week' },
        { label: 'Gemiddelde leestijd', value: '4 min 32', change: '+9% over 30 dagen' },
        { label: 'Voltooiingsgraad', value: '72%', change: '+5 pt voor lange reportages' }
      ]
    },
    drafts: {
      eyebrow: 'Kladversies',
      title: 'Centraliseer uw voorbereide artikels',
      description: 'Wijs taken toe, geef feedback op kernpassages en volg de validaties.',
      open: 'Openen',
      drafts: [
        {
          title: 'Klimaat: hoe anders verslag doen van COP-toppen',
          updatedAt: '2024-04-17T11:32:00.000Z',
          status: 'In nalezing',
          owner: 'Jeanne Journalist'
        },
        {
          title: 'Podcast: de stem van de volkswijken',
          updatedAt: '2024-04-15T09:12:00.000Z',
          status: 'Aan te vullen',
          owner: 'Yanis Reporter'
        }
      ]
    },
    privateSpace: {
      loading: 'Uw ruimte wordt geladen…',
      eyebrow: 'Privéruimte',
      greeting: 'Hallo {name}',
      description: 'Hier vindt u een snel overzicht van uw profiel en directe toegang tot uw tools.',
      benefits: {
        accountStatus: 'Accountstatus',
        admin: 'Beheerder',
        author: 'Geverifieerde auteur',
        reader: 'Actieve lezer',
        email: 'E-mail',
        roles: 'Gekoppelde rollen',
        none: 'Geen specifieke rol'
      },
      studio: {
        title: 'Redactionele studio',
        description: 'Krijg met één klik toegang tot uw kladversies en de rijke editor.',
        openEditor: 'Editor openen',
        manageDrafts: 'Mijn kladversies beheren'
      },
      next: {
        title: 'Volgende stap',
        description: 'Ga verder met browsen of open uw specifieke tools.',
        admin: 'Ga naar de backoffice',
        author: 'Open het auteur-dashboard',
        reader: 'Verken de artikels',
        manageNewsletters: 'Mijn nieuwsbrieven beheren'
      }
    },
    guard: {
      checking: 'Rechten worden gecontroleerd…',
      requireLogin: 'U moet aangemeld zijn om deze sectie te bekijken.',
      forbidden: 'Uw rol geeft geen toegang tot deze pagina.',
      backToSpace: 'Terug naar mijn ruimte'
    },
    createArticle: {
      defaultBody:
        'Begin hier aan uw artikel. U kunt tekst verrijken, media toevoegen en onderdelen structureren in de studio.',
      title: 'Titel van het artikel',
      placeholder: 'Bijv.: Hoe heruitvinden we lokale verslaggeving?',
      slugPreview: 'Voorlopige slug: {slug}',
      format: 'Formaat',
      formats: {
        article: 'Artikel',
        reportage: 'Reportage',
        podcast: 'Podcast'
      },
      summary: 'Samenvatting (optioneel)',
      summaryPlaceholder: 'Een korte inleiding in twee zinnen. De details schrijft u in de editor.',
      errors: {
        title: 'Geef een titel op voor uw artikel.',
        auth: 'U moet aangemeld zijn om een artikel te maken.'
      },
      submit: 'Aanmaken en openen in de editor',
      submitting: 'Artikel wordt gemaakt…',
      note: 'Het artikel wordt als klad opgeslagen en is enkel zichtbaar in uw ruimte.'
    },
    editor: {
      loading: 'De redactionele studio wordt geladen…',
      connectionHint:
        'Controleer of de FastAPI-service draait op <code class="font-mono">http://localhost:8000</code> en of uw account de rol journalist of editor heeft.',
      empty: 'Er is nog geen content beschikbaar. Maak een artikel in de backoffice om de studio te activeren.',
      demo:
        'Demomodus geactiveerd: de getoonde content komt uit een lokale dataset (<strong>er worden geen wijzigingen naar de server gestuurd</strong>). Start de FastAPI om uw echte artikels te zien.',
      selectionEyebrow: 'Selectie van de content',
      lastUpdate: 'Laatste update: {date}',
      tracking: 'Actieve tracking — {count} lokale wijziging(en) in wacht',
      chooseAnother: 'Kies een ander artikel',
      fallbackError: 'Content ophalen is mislukt.',
      checkRights: 'Controleer of u over de juiste rechten beschikt.'
    },
    editorPage: {
      eyebrow: 'Rijke editor',
      title: 'Stel uw artikels in alle rust samen',
      description: 'Realtime preview, metadata en geïntegreerde validaties.'
    },
    newsletterGuard: {
      manage: 'Mijn nieuwsbrieven beheren'
    },
    article: {
      breadcrumb: 'Kruimelpad',
      home: 'Home',
      byAuthor: 'Door {author}',
      publishedOn: '{date}'
    },
    articleCard: {
      readMore: 'Lees het artikel'
    },
    draftsList: {
      updated: 'Bijgewerkt op {date}'
    },
    searchBar: {
      aria: 'Zoek een artikel'
    },
    categories: [
      {
        slug: 'planete',
        title: 'Planeet',
        description: 'Klimaat, biodiversiteit en ecologische transities.'
      },
      {
        slug: 'societe',
        title: 'Samenleving',
        description: 'Onderzoeken naar sociale en solidaire dynamieken.'
      },
      {
        slug: 'culture',
        title: 'Cultuur',
        description: 'Creatie, podiumkunsten en digitale trends.'
      }
    ],
    articles: [
      {
        slug: 'oceans-en-peril',
        title: 'Oceanen in gevaar: hoe redacties de blauwe urgentie coveren',
        category: 'Planeet',
        categorySlug: 'planete',
        excerpt: 'Ontmoet reporters die de milieunarratie opnieuw uitvinden.',
        publishedAt: '2024-04-03',
        author: 'Jeanne Journalist',
        body: `<h3>Duik in de redacties</h3><p>We spraken met zeven Europese redacties die nieuwe immersieve formats testen om de oceaanuitdagingen uit te leggen.</p>`
      },
      {
        slug: 'intelligence-collective',
        title: 'Collectieve intelligentie: redacties die samen creëren met lezers',
        category: 'Samenleving',
        categorySlug: 'societe',
        excerpt: 'Initiatieven voor gedeelde redactie, van factchecking tot gezamenlijke onderzoeken.',
        publishedAt: '2024-03-22',
        author: 'Alex Admin',
        body: `<h3>De lezerrelatie heruitvinden</h3><p>Wanneer lezers bijdragers worden, verandert de redactionele dynamiek en ontstaan nieuwe horizonten.</p>`
      },
      {
        slug: 'ai-dans-la-culture',
        title: 'Makers en AI: kronieken van een inspirerende samenwerking',
        category: 'Cultuur',
        categorySlug: 'culture',
        excerpt: 'Hoe artiesten algoritmes integreren zonder hun stem te verliezen.',
        publishedAt: '2024-02-17',
        author: 'Jeanne Journalist',
        body: `<h3>AI en kunst</h3><p>Van immersief theater tot augmented muziekresidenties: een overzicht van Franse initiatieven die creatie met AI verbinden.</p>`
      }
    ]
  }
};

export function getTranslation(language: Language, key: string, replacements?: Record<string, string | number>): string {
  const source = translations[language] ?? translations[fallbackLanguage];
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  const fallback =
    typeof value === 'string'
      ? value
      : key.split('.').reduce<unknown>((acc, part) => {
          if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
          }
          return undefined;
        }, translations[fallbackLanguage]);

  const result = typeof value === 'string' ? value : typeof fallback === 'string' ? fallback : key;

  if (!replacements) {
    return result;
  }

  return Object.entries(replacements).reduce(
    (current, [token, replacement]) => current.replaceAll(`{${token}}`, String(replacement)),
    result
  );
}

export function getList<T>(language: Language, key: string): T {
  const source = translations[language] ?? translations[fallbackLanguage];
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  if (Array.isArray(value)) {
    return value as T;
  }

  const fallback = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, translations[fallbackLanguage]);

  if (Array.isArray(fallback)) {
    return fallback as T;
  }

  return [] as unknown as T;
}
