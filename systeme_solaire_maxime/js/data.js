/* =====================================================================
   DONNÉES CENTRALISÉES DE L'UNIVERS
   ---------------------------------------------------------------------
   Pour ajouter une planète : copiez un objet de `projects`, changez
   l'id, et ajustez `planet` (taille, orbite, type de surface, couleurs).
   Types de surface : terran, gas, lava, ice, desert.
   Les valeurs TODO s'affichent sur le site avec la mention « à compléter ».
   ===================================================================== */

export const TODO = (hint) => ({ todo: true, hint });

export const profile = {
  name: "Maxime Joppin",
  title: "Développeur web",
  tagline: "Étudiant en BUT Informatique (parcours Réalisation d’applications) avec une expérience concrète du développement web : conception et exploitation en autonomie d’une boutique e-commerce PrestaShop, développement de modules sur mesure, automatisation de processus avec n8n et évaluation de modèles d’IA.",
  short: "Je construis des boutiques PrestaShop, des modules et des plugins sur mesure, et j’explore l’IA.",
  status: "Recherche stage de 12 semaines · avril – juin 2027",
  school: "BUT Informatique · parcours Réalisation d’applications",
  location: "Arles, France",
  languages: ["Anglais (C1)", "Espagnol (lu et écrit)", "Italien (lu et écrit)"],
  interests: ["Développement logiciel", "Développement web", "Intelligence artificielle", "Création de projets techniques"],
  hobbies: ["Technologie", "Musique", "Boxe"],
  goals: "Rejoindre une équipe de développement pour un stage de 12 semaines (avril – juin 2027), apprendre et contribuer sur de vrais projets.",
  timeline: [
    { when: "Depuis 2023", title: "AI Trainer · DataAnnotation (freelance)", text: "Détection d’hallucinations et d’erreurs logiques dans des réponses de modèles d’IA, vérification factuelle, rédaction et résolution de prompts complexes en français." },
    { when: "2025", title: "Stage chez mid-digital", text: "Découverte de PrestaShop et de WordPress, premiers pas avec n8n." },
    { when: "En cours", title: "BUT Informatique, IUT", text: "Parcours Réalisation d’applications. Projets en JavaScript, webpack et API, en parallèle de mes propres projets PrestaShop et WordPress." },
    { when: "Avant", title: "Baccalauréat Général, mention Bien", text: "Spécialités NSI et Mathématiques, Les Chartreux, Lyon." },
    { when: "Emploi", title: "Employé rayon Fruits & Légumes · Leclerc", text: "Relation client, organisation du rayon, travail en équipe." },
    { when: "2027", title: "Prochain stage", text: "12 semaines, d’avril à juin 2027." }
  ],
  contact: {
    email: "maxime.joppin@gmail.com",
    phone: "06 02 15 22 85",
    phoneHref: "tel:+33602152285",
    linkedin: "https://www.linkedin.com/in/maxime-joppin",
    github: null // TODO : ajoutez l'URL de votre profil GitHub
  }
};

/* Certifications : affichées sur l'accueil et dans le profil. */
export const badges = [
  { name: "Claude 101", issuer: "Claude Academy", date: "15 novembre 2026", verify: "https://academy.claude.com/verify/e14d4684249121204f2a1fc172c44053" },
  { name: "Claude Code 101", issuer: "Claude Academy", date: null, verify: null } // TODO : ajoutez la date et le lien de vérification
];

/* Constellations de compétences : chaque groupe devient une constellation. */
export const skills = [
  { group: "Développement web", color: "#7fe7ff", items: ["PHP", "JavaScript", "HTML", "CSS", "JSON", "Twig"] },
  { group: "CMS et e-commerce", color: "#b59bff", items: ["PrestaShop", "Modules et hooks", "WordPress", "Divi"] },
  { group: "IA et automatisation", color: "#ff9fd0", items: ["n8n", "API OpenAI", "Évaluation de LLM", "Ollama", "Claude"] },
  { group: "Développement logiciel", color: "#8dffb8", items: ["Python", "C++", "C"] },
  { group: "Bases de données", color: "#ffd27f", items: ["SQL", "PostgreSQL"] },
  { group: "Outils", color: "#9fc4ff", items: ["VS Code", "webpack", "Arduino", "Revit", "Fusion 360"] }
];

/* Fiches technologies : affichées au clic sur un satellite. */
export const tech = {
  "PrestaShop": "CMS e-commerce open source. Thèmes, modules et hooks sur mesure pour les versions 1.7 et 8.",
  "PHP": "Langage serveur des modules PrestaShop et des plugins WordPress.",
  "Twig": "Moteur de templates utilisé dans l’administration PrestaShop.",
  "JavaScript": "Interactions côté navigateur : glisser-déposer, widgets, animations, appels d’API.",
  "WordPress": "CMS utilisé pour les sites vitrines et le développement de plugins.",
  "API OpenAI": "Modèles GPT-4o et GPT-4o mini, intégrés dans un plugin WordPress.",
  "webpack": "Bundler qui assemble et optimise une application front-end.",
  "API": "Requêtes HTTP vers des services externes, dont certaines dépendent les unes des autres.",
  "Divi": "Constructeur de pages visuel pour WordPress.",
  "HTML": "Structure des pages.",
  "CSS": "Mise en forme, thèmes et responsive.",
  "SQL": "Requêtes vers la base de données, y compris celles générées par l’ORM PrestaShop.",
  "n8n": "Outil d’automatisation de workflows, utilisé ici pour un agent qui traite des documents.",
  "IA": "Extraction d’informations à partir de documents scannés.",
  "Tableur": "Destination des données extraites automatiquement.",
  "C++": "Langage compilé, utilisé pour un générateur de site et pour un projet Arduino.",
  "JSON": "Format des instances et des solutions lues par le programme.",
  "SVG": "Dessin vectoriel animé dans le navigateur.",
  "C": "Programmation de la station météo sur Arduino.",
  "Arduino": "Microcontrôleur et capteurs pour les projets embarqués.",
  "Python": "Simulateur de cryptage sonore et traitement du signal."
};

export const projects = [
  {
    id: "hookbuilder",
    name: "HookBuilder",
    category: "Module PrestaShop",
    status: null,
    role: "Conception et développement du module",
    description: "Un module PrestaShop de constructeur visuel de hooks, dans l’esprit d’Elementor : pages personnalisées ou natives, réorganisation par glisser-déposer, import et export JSON, historique des modifications et conditions d’affichage. Objectif : étendre les fonctionnalités des sites sans dépendre de modules tiers.",
    features: ["Injection de contenu HTML dans les hooks PrestaShop", "Pages personnalisées ou natives", "Réorganisation par glisser-déposer", "Import et export JSON", "Historique des modifications", "Conditions d’affichage"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée.")],
    stack: ["PrestaShop", "PHP", "Twig", "JavaScript"],
    github: null, demo: null, image: null,
    planet: { type: "terran", radius: 2.4, orbit: 20, speed: 0.05, tilt: 0.2, colors: ["#0b3d6b", "#1f8fbf", "#7de0c8", "#e9f6ff"], rings: false, clouds: true }
  },
  {
    id: "customcssjs",
    name: "customcssjs",
    category: "Module PrestaShop",
    status: null,
    role: "Développement du module",
    description: "Un module PrestaShop d’injection de CSS et de JavaScript page par page, pour étendre un site sans dépendre de modules tiers.",
    features: ["Injection CSS par page", "Injection JavaScript par page"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée.")],
    stack: ["PrestaShop", "PHP", "CSS", "JavaScript"],
    github: null, demo: null, image: null,
    planet: { type: "ice", radius: 1.2, orbit: 28, speed: 0.042, tilt: 0.1, colors: ["#1b0f3a", "#6b4fd8", "#c7b8ff", "#ffffff"], rings: false }
  },
  {
    id: "mxc-chatbot",
    name: "MXC ChatBot",
    category: "Plugin WordPress · IA",
    status: null,
    role: "Conception et développement du plugin",
    description: "Un plugin WordPress qui ajoute un assistant IA au site, basé sur l’API OpenAI (GPT-4o et GPT-4o mini). Le rôle du bot, les connaissances du site et l’apparence du widget se règlent depuis l’administration.",
    features: ["Assistant IA intégré au site", "Choix entre GPT-4o et GPT-4o mini", "Rôle du bot réglable depuis l’administration", "Connaissances du site configurables", "Apparence du widget personnalisable"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée.")],
    stack: ["WordPress", "PHP", "JavaScript", "API OpenAI"],
    github: null, demo: null, image: null,
    planet: { type: "gas", radius: 3.4, orbit: 38, speed: 0.032, tilt: 0.45, colors: ["#2a0f4f", "#7b3fd1", "#ff8fd0", "#ffe3f4"], rings: true }
  },
  {
    id: "maxtcg",
    name: "MaxTCG",
    category: "Boutique e-commerce PrestaShop",
    status: "Boutique hors ligne, refonte prévue",
    role: "Conception, développement et exploitation en autonomie",
    description: "Ma boutique en ligne de cartes à collectionner : Pokémon, One Piece et Rift Bounds, avec boosters et displays. Thème, catalogue et modules gérés par mes soins.",
    features: ["Catalogue Pokémon, One Piece et Rift Bounds", "Refonte de la page d’accueil (thème sombre jaune et blanc)", "Bandeau héro, catégories, produits phares, avis clients", "Boosters et displays"],
    challenges: [{ problem: "Un bug côté PHP venant d’une requête SQL générée par l’ORM PrestaShop.", solution: "Diagnostic de la requête et correction côté PHP." }],
    stack: ["PrestaShop", "PHP", "JavaScript", "SQL", "Twig"],
    github: null,
    demo: "https://maxtcg.mid-digital.ch", demoLabel: "maxtcg.mid-digital.ch",
    image: null,
    planet: { type: "lava", radius: 2.1, orbit: 48, speed: 0.026, tilt: 0.1, colors: ["#1a0503", "#7a1a08", "#ff5a1f", "#ffd27f"], rings: false }
  },
  {
    id: "n8n-ordonnances",
    name: "Agent n8n",
    category: "Automatisation · IA",
    status: null,
    role: "Conception de l’agent",
    description: "Un agent n8n qui analyse des ordonnances scannées et range automatiquement les informations extraites dans un tableur.",
    features: ["Analyse d’ordonnances scannées", "Extraction automatique des informations", "Rangement dans un tableur"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée.")],
    stack: ["n8n", "IA", "Tableur"],
    github: null, demo: null, image: null,
    planet: { type: "gas", radius: 2.6, orbit: 61, speed: 0.02, tilt: 0.3, colors: ["#3a0d05", "#d1541f", "#ffb36b", "#fff0d8"], rings: false }
  },
  {
    id: "r301",
    name: "Application client-riche",
    category: "Projet IUT · R3.01",
    status: "En cours",
    role: "Projet de développement web à l’IUT",
    description: "Projet de développement web à l’IUT : une application front-end packagée avec webpack, qui enchaîne deux requêtes API dépendantes l’une de l’autre.",
    features: ["Application front-end packagée avec webpack", "Deux requêtes API enchaînées, la seconde dépend de la première"],
    challenges: [{ problem: "Enchaîner deux requêtes API dont la seconde dépend de la réponse de la première.", solution: TODO("Expliquez comment vous avez géré l’enchaînement (promesses, async/await, gestion d’erreurs…).") }],
    stack: ["JavaScript", "webpack", "API"],
    github: null, demo: null, image: null,
    planet: { type: "ice", radius: 1.6, orbit: 71, speed: 0.017, tilt: 0.3, colors: ["#0b2236", "#4aa3c9", "#bdf2ff", "#ffffff"], rings: false }
  },
  {
    id: "cgshop",
    name: "CG:SHOP 2027",
    category: "Projet universitaire · équipe de 5",
    status: null,
    role: "Membre d’une équipe de 5",
    description: "Robots de tonte de pelouse : un programme C++ en ligne de commande qui génère un site web interactif (SVG, animations JavaScript) à partir d’instances et de solutions JSON.",
    features: ["Programme C++ en ligne de commande", "Lecture d’instances et de solutions JSON", "Génération d’un site web interactif", "Visualisation SVG animée en JavaScript"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée, et votre part dans l’équipe.")],
    stack: ["C++", "JSON", "JavaScript", "SVG"],
    github: null, demo: null, image: null,
    planet: { type: "terran", radius: 2.9, orbit: 83, speed: 0.014, tilt: 0.25, colors: ["#0d2a1a", "#1f6b3a", "#9ad66b", "#f4ffe8"], rings: true, clouds: true }
  },
  {
    id: "embarque",
    name: "Projets embarqués",
    category: "Embarqué et algorithmique",
    status: null,
    role: "Projets personnels et de formation",
    description: "Une station météo connectée (C, Arduino, capteurs en temps réel), un coffre-fort électronique (C++, Arduino) et un simulateur de cryptage sonore (Python, traitement du signal).",
    features: ["Station météo connectée avec capteurs en temps réel", "Coffre-fort électronique", "Simulateur de cryptage sonore"],
    challenges: [TODO("Décrivez une difficulté technique rencontrée et la solution apportée.")],
    stack: ["C", "C++", "Arduino", "Python"],
    github: null, demo: null, image: null,
    planet: { type: "desert", radius: 1.9, orbit: 94, speed: 0.011, tilt: 0.5, colors: ["#2a0e0e", "#8c3a2a", "#e08a5a", "#ffe6d0"], rings: false }
  },
  {
    id: "max-site",
    name: "Max Site",
    category: "Site portfolio",
    status: "Hors ligne, refonte prévue",
    role: "Création du site et conversion en statique",
    description: "Mon site d’agence web, construit avec WordPress et Divi, puis converti en HTML statique pour ne plus dépendre des licences. Il présente aussi mes autres sites.",
    features: ["Site construit avec WordPress et Divi", "Conversion en HTML statique", "Section présentant mes autres sites"],
    challenges: [{ problem: "Ne plus dépendre des licences WordPress et Divi.", solution: "Conversion du site en HTML statique." }],
    stack: ["WordPress", "Divi", "HTML", "CSS"],
    github: null,
    demo: "https://maxsite.mid-digital.ch", demoLabel: "maxsite.mid-digital.ch",
    image: null,
    planet: { type: "desert", radius: 2.7, orbit: 106, speed: 0.009, tilt: 0.6, colors: ["#2b1a0e", "#9c6a3a", "#e8c38a", "#fff1d6"], rings: true }
  }
];
