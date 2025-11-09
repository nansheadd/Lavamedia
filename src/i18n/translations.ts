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
        { href: '/newsletter', label: 'Newsletter' }
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
      ]
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
        { href: '/newsletter', label: 'Nieuwsbrief' }
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
      ]
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
