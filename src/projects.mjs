// Contenu des projets : une entrée = une carte sur l'accueil + une page d'étude de cas.
// Modifier ce fichier puis lancer `node src/build.mjs` pour régénérer le site.

// Les six compétences du BUT Informatique
export const BUT = {
  C1: 'Réaliser un développement d’application',
  C2: 'Optimiser des applications',
  C3: 'Administrer des systèmes communicants',
  C4: 'Gérer des données',
  C5: 'Conduire un projet',
  C6: 'Collaborer au sein d’une équipe',
};

export const projects = [
  {
    slug: 'monster-museum',
    title: 'Monster Museum',
    tagline: 'Jeu multijoueur Roblox : 55 000 lignes de Luau typé, architecture serveur autoritaire et tests automatisés.',
    category: 'Jeu vidéo · Projet personnel',
    featured: true,
    cover: 'assets/img/mm/hero.jpg',
    year: '2026',
    meta: { Rôle: 'Seul développeur (code, game design, 3D, audio)', Durée: 'Depuis novembre 2026', Équipe: 'Solo', Statut: 'En développement, publié en privé sur Roblox' },
    stack: ['Luau (strict)', 'Roblox Studio', 'Rojo', 'Lune (tests)', 'Blender + Python', 'Git', 'Claude Code'],
    but: ['C1', 'C2', 'C4', 'C5'],
    stats: [['216', 'fichiers Luau'], ['55 k', 'lignes de code'], ['95', 'commits'], ['34', 'services serveur']],
    summary: `Un jeu Roblox multijoueur où l’on explore des zones, met des monstres KO, les ramène dans son musée et les expose pour gagner de l’argent. Les autres joueurs peuvent voler un monstre pendant son transport : c’est le cœur de l’interaction.`,
    sections: [
      ['Le défi', `Un jeu multijoueur se fait tricher dès que le client décide de quelque chose. Il fallait aussi que les règles du jeu (combat, économie, progression) puissent être testées et équilibrées <em>sans</em> lancer Roblox Studio à chaque fois.`],
      ['Ce que j’ai construit', `<ul>
        <li><strong>Serveur autoritaire</strong> : génération, captures, transport, vol, revenus et sauvegarde sont décidés par le serveur. Chaque RemoteEvent est validé et limité par un seau à jetons par joueur.</li>
        <li><strong>Domaine pur testable</strong> : 22 modules de règles sans API Roblox (machine à états des monstres, économie, musée…), testés hors Studio avec Lune.</li>
        <li><strong>Simulations d’équilibrage</strong> : scripts qui jouent des carrières complètes, des combats et des vols par agents pour calibrer les valeurs de <code>Config/</code>.</li>
        <li><strong>Pipeline de contenu</strong> : modèles low poly générés en Python dans Blender puis importés par des outils d’édition ; 11 espèces modélisées et animées, 5 zones.</li>
        <li><strong>Qualité</strong> : typage strict, vérification de types en CI locale, linter (selene), formatage (stylua), localisation complète (aucun texte en dur).</li>
      </ul>`],
      ['Méthode', `Documentation de conception versionnée (règles ✅ validées / 🟡 proposées / ❓ ouvertes), audits réguliers, et un flux de travail assisté par IA avec Claude Code : skills et serveurs MCP sur mesure (Roblox Studio, Blender), toujours relu et vérifié par les tests.`],
    ],
    video: { src: 'assets/video/mm-trailer.mp4', poster: 'assets/video/mm-trailer-poster.jpg', caption: 'Bande-annonce verticale générée par mon pipeline marketing (montage, voix, sous-titres).' },
    gallery: [
      ['assets/img/mm/lobby.jpg', 'Le lobby : zone sécurisée circulaire autour des six musées'],
      ['assets/img/mm/jungle.jpg', 'Zone 3, la jungle : décor low poly généré dans Blender'],
      ['assets/img/mm/thornfang.jpg', 'Thornfang, une des espèces de la zone 1'],
      ['assets/img/mm/primordrax.jpg', 'Primordrax : capture d’une attaque animée'],
      ['assets/img/mm/zone4-echelle.jpg', 'Planche d’échelle des espèces de la zone 4'],
      ['assets/img/mm/ui-boutique.jpg', 'Interface de la boutique'],
      ['assets/img/mm/vitrine.jpg', 'Vitrine centrale du musée'],
      ['assets/img/mm/foret.jpg', 'Zone 2, la forêt'],
    ],
    code: [
      ['mm-statemachine.lua', 'lua', 'src/shared/Domain/MonsterStateMachine.luau', 'Les transitions d’état d’un monstre sont une simple table de données : impossible de passer de « Sauvage » à « Capturé » sans passer par le KO.'],
      ['mm-net.lua', 'lua', 'src/server/Services/Net.luau', 'Anti-spam côté serveur : un seau à jetons par joueur et par remote.'],
    ],
    links: [],
  },
  {
    slug: 'maxtcg',
    title: 'MaxTCG',
    tagline: 'Ma boutique e-commerce de cartes à collectionner sous PrestaShop, conçue et exploitée en autonomie.',
    category: 'E-commerce · Projet personnel',
    cover: 'demos/maxtcg/images/hero-cards.png',
    year: '2025 – 2026',
    meta: { Rôle: 'Conception, développement et exploitation', Équipe: 'Solo', Statut: 'Boutique hors ligne, démo disponible' },
    stack: ['PrestaShop', 'PHP', 'SQL', 'HTML / CSS', 'JavaScript'],
    but: ['C1', 'C3', 'C4', 'C5'],
    summary: `Boutique en ligne de cartes Pokémon, One Piece et Riftbound (boosters, displays, accessoires). J’ai géré le thème, le catalogue, les modules et la mise en production.`,
    sections: [
      ['Ce que j’ai fait', `<ul>
        <li>Refonte complète de la page d’accueil (thème sombre jaune/blanc) : bandeau héro, catégories, produits phares, avis clients.</li>
        <li>Construction des blocs de la page d’accueil avec mes propres modules <a href="hookbuilder.html">HookBuilder</a> et <a href="custom-css-js.html">Custom CSS &amp; JS</a>, exportés en JSON pour être réimportés.</li>
        <li>Diagnostic et correction d’un bug PHP provenant d’une requête SQL générée par l’ORM de PrestaShop.</li>
        <li>Rédaction d’un guide de reconstruction complet (catégories par import CSV avec ID forcés, hooks, CSS) pour pouvoir remonter la boutique à l’identique.</li>
      </ul>`],
      ['Ce que ça m’a appris', `Faire tourner un vrai site, c’est autant de l’exploitation que du code : sauvegardes, reproductibilité, documentation. Le guide de reconstruction est né d’une vraie panne.`],
    ],
    gallery: [
      ['demos/maxtcg/images/hero-cards.png', 'Visuel du bandeau d’accueil'],
      ['demos/maxtcg/images/cat-pokemon.png', 'Carte de catégorie Pokémon'],
      ['demos/maxtcg/images/cat-onepiece.png', 'Carte de catégorie One Piece'],
      ['demos/maxtcg/images/cat-riftbounds.png', 'Carte de catégorie Riftbound'],
    ],
    code: [],
    links: [['Tester la boutique', '#essayer', false], ['Ouvrir en plein écran', '../demos/maxtcg/', true]],
    embed: { src: 'demos/maxtcg/', url: 'MaxTCG · version démo',title: 'Essayez la boutique', note: 'Reconstitution fidèle de la boutique, en version autonome : catalogue d’exemple, filtres, fiche produit, panier, code promo MAXTCG10 et commande fictive. Aucun paiement réel.' },
  },
  {
    slug: 'hookbuilder',
    title: 'HookBuilder',
    tagline: 'Module PrestaShop : un constructeur visuel de hooks, dans l’esprit d’Elementor.',
    category: 'Module PrestaShop',
    cover: null,
    coverCode: 'hb-conditions.php',
    year: '2026',
    meta: { Rôle: 'Conception et développement', Cible: 'PrestaShop 1.7+', Statut: 'Utilisé sur la boutique MaxTCG' },
    stack: ['PHP', 'PrestaShop', 'Twig', 'JavaScript', 'SQL', 'JSON'],
    but: ['C1', 'C4'],
    summary: `Un module qui permet d’injecter du contenu HTML dans n’importe quel hook PrestaShop depuis le back-office, sans toucher au thème ni dépendre de modules payants.`,
    sections: [
      ['Fonctionnalités', `<ul>
        <li>Pages personnalisées ou natives, réorganisation des blocs par glisser-déposer.</li>
        <li>Import / export JSON des hooks (un bloc ou une page entière) : la page d’accueil de MaxTCG tient en 5 fichiers JSON.</li>
        <li>Historique des modifications et conditions d’affichage (client connecté, groupe, appareil…) combinables en ET / OU.</li>
        <li>Architecture en services (<code>HookBuilderService</code>, <code>HistoryService</code>, DTO, <code>ThemeCompatibilityService</code>) et conditions extensibles par interface.</li>
      </ul>`],
    ],
    gallery: [],
    code: [['hb-conditions.php', 'php', 'ConditionResolver.php', 'Les conditions d’affichage sont des classes enregistrées dans un registre : un autre module peut ajouter ses propres types.']],
    links: [],
  },
  {
    slug: 'custom-css-js',
    title: 'Custom CSS & JS',
    tagline: 'Module PrestaShop pour éditer le CSS et le JavaScript de chaque page depuis le back-office.',
    category: 'Module PrestaShop',
    cover: null,
    coverCode: 'ccj-header.php',
    year: '2026',
    meta: { Rôle: 'Conception et développement', Cible: 'PrestaShop 1.7 / 8', Statut: 'Utilisé sur la boutique MaxTCG' },
    stack: ['PHP', 'PrestaShop', 'Smarty', 'SQL', 'CSS'],
    but: ['C1', 'C4'],
    summary: `Un éditeur intégré au back-office : un CSS et un JS « global » plus un par type de page (accueil, produit, panier…), injectés automatiquement dans l’en-tête.`,
    sections: [
      ['Fonctionnement', `<ul>
        <li>24 types de pages front-office reconnus, chacun avec son entrée CSS et JS activable.</li>
        <li>Au rendu, le module lit le contrôleur courant et injecte d’abord le code global puis celui de la page, dans cet ordre.</li>
        <li>Requêtes protégées (<code>pSQL</code>), onglet ajouté dans le menu Design.</li>
      </ul>`],
    ],
    gallery: [],
    code: [['ccj-header.php', 'php', 'customcssjs.php', 'Le hook displayHeader assemble le CSS et le JS de la page courante.']],
    links: [],
  },
  {
    slug: 'cgshop',
    title: 'CG:SHOP 2027 Visualizer',
    tagline: 'Outil C++ en ligne de commande qui transforme des données JSON de compétition en SVG et en site web.',
    category: 'Projet universitaire · Équipe de 5',
    cover: 'demos/cgshop/instance.svg',
    coverContain: true,
    year: '2026',
    meta: { Rôle: 'Développeur (parsing, calcul de couverture, tests)', Équipe: '5 étudiants, méthode Scrum', Durée: '121 h d’équipe sur 2 sprints' },
    stack: ['C++17', 'Make', 'JSON (nlohmann)', 'SVG', 'HTML', 'Git / GitLab'],
    but: ['C1', 'C2', 'C5', 'C6'],
    summary: `<a href="https://cgshop.ibr.cs.tu-bs.de/competition/cg-shop-2027/" target="_blank" rel="noopener">CG:SHOP</a> est une compétition internationale d’optimisation géométrique. L’édition 2027 porte sur la tonte d’une pelouse par plusieurs robots. Notre outil ne résout pas le problème : il lit les instances et les solutions et les rend explorables.`,
    sections: [
      ['Mes contributions', `<ul>
        <li>Lecture des fichiers d’instances avec parcours de dossiers, puis lecture des solutions et calcul du score.</li>
        <li>Calcul des cellules non tondues d’une solution, puis <strong>optimisation</strong> pour les grands robots : le robot est découpé en segments, ce qui rend le calcul bien plus rapide.</li>
        <li>Détection des solutions invalides (<code>--check</code>) avec les raisons affichées.</li>
        <li>Un mini-framework de tests unitaires C++ et la cible <code>make tests</code>.</li>
      </ul>`],
      ['Travail en équipe', `Sprints, backlog, matrice RACI, analyse des risques et feuille de temps générée par script. Branches par user story et merge requests sur le GitLab de l’université.`],
    ],
    gallery: [
      ['assets/img/cgshop/RACI.jpg', 'Matrice RACI du projet'],
      ['assets/img/cgshop/risques.jpg', 'Analyse des risques'],
    ],
    code: [],
    links: [['Page d’instance générée par l’outil', '../demos/cgshop/instance.html', true], ['Page de solution générée', '../demos/cgshop/solution.html', true]],
  },
  {
    slug: 'destiny-codex',
    title: 'Destiny 2 Codex',
    tagline: 'Application web client riche qui explore l’équipement de Destiny 2 via l’API officielle de Bungie.',
    category: 'Projet universitaire · R3.01',
    cover: 'assets/img/destiny/armes.jpg',
    year: '2026',
    meta: { Rôle: 'Développement complet', Module: 'R3.01 Développement web', Statut: 'Terminé' },
    stack: ['JavaScript ES6', 'POO', 'Webpack 5', 'API REST', 'HTML / CSS'],
    but: ['C1', 'C4'],
    summary: `Trois écrans : les emplacements d’équipement, la liste des objets d’un emplacement avec recherche par nom et filtre par classe (Titan, Chasseur, Arcaniste), puis la fiche détaillée avec ses statistiques. Tout est construit à partir du manifeste du jeu, en français.`,
    sections: [
      ['Points techniques', `<ul>
        <li>Quatre requêtes dépendantes : manifeste → table des emplacements → table des objets (téléchargée une seule fois et gardée en mémoire) → une requête par statistique.</li>
        <li>Code organisé en classes (<code>Codex</code>, <code>ApiBungie</code>, <code>Affichage</code>…), documenté par un diagramme de classes.</li>
        <li>Affichage limité à 300 cartes pour rester fluide, icône par défaut si l’API n’en fournit pas, clé d’API hors du dépôt.</li>
      </ul>`],
    ],
    gallery: [
      ['assets/img/destiny/menu.jpg', 'Menu des emplacements, construit à partir d’une table de l’API'],
      ['assets/img/destiny/armes.jpg', 'Armes cinétiques : 459 résultats, 300 affichés pour rester fluide'],
      ['assets/img/destiny/casques-filtre.jpg', 'Casques avec recherche par nom et filtre par classe'],
      ['assets/img/destiny/fiche-arme.jpg', 'Fiche d’une arme exotique : statistiques nommées par une requête par statistique', 'contain'],
      ['assets/img/destiny/diagramme_classe_codex.png', 'Diagramme de classes'],
    ],
    code: [['destiny-codex.js', 'javascript', 'src/Codex.js', 'La classe principale enchaîne les requêtes dépendantes.'], ['destiny-api.js', 'javascript', 'src/ApiBungie.js', 'Toutes les requêtes vers l’API passent par une seule classe.']],
    links: [],
  },
  {
    slug: 'chatbot-wordpress',
    title: 'Chatbot IA WordPress',
    tagline: 'Plugin WordPress qui ajoute un assistant IA connecté à OpenAI et qui connaît le contenu du site.',
    category: 'Plugin WordPress · IA',
    cover: null,
    coverCode: 'chatbot.php',
    year: '2025',
    meta: { Rôle: 'Conception et développement', Cible: 'WordPress', Statut: 'Prototype fonctionnel' },
    stack: ['PHP', 'WordPress', 'JavaScript', 'AJAX', 'API OpenAI'],
    but: ['C1', 'C3'],
    summary: `Un widget de chat ajouté en pied de page. Le rôle du bot, le contexte et le lien de contact se règlent dans l’administration ; le bot reçoit les pages du site pour proposer des liens pertinents sous forme de boutons.`,
    sections: [
      ['Fonctionnement', `<ul>
        <li>Échanges en AJAX (<code>admin-ajax.php</code>) entre le widget et PHP.</li>
        <li>Prompt système construit à partir des réglages et des pages WordPress, avec mémoire de la conversation.</li>
        <li>Format de réponse <code>[BUTTON:texte|URL]</code> converti en boutons cliquables côté client.</li>
      </ul>`],
    ],
    gallery: [],
    code: [['chatbot.php', 'php', 'chatbot_plugin.php (extrait)', 'Construction des messages envoyés au modèle.']],
    links: [],
  },
];

// Projets plus courts, sans page dédiée
export const otherProjects = [
  ['Automatisation n8n d’ordonnances', 'Agent n8n qui lit des ordonnances scannées et range les informations extraites dans un tableur.', ['n8n', 'IA', 'Automatisation']],
  ['Station météo connectée', 'Capteurs lus en temps réel sur Arduino.', ['C', 'Arduino']],
  ['Coffre-fort électronique', 'Saisie de code et verrouillage sur Arduino.', ['C++', 'Arduino']],
  ['Simulateur de cryptage sonore', 'Chiffrement d’un signal audio et traitement du signal.', ['Python']],
];
