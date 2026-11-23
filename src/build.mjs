// Génère index.html et projets/*.html à partir de src/projects.mjs et src/site.config.json.
// Usage : node src/build.mjs   (aucune dépendance)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, otherProjects, BUT } from './projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = JSON.parse(readFileSync(join(root, 'src/site.config.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const snippet = (f) => readFileSync(join(root, 'src/snippets', f), 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
const firstLines = (f, n) => snippet(f).split('\n').filter((l) => !l.startsWith('<?php')).slice(0, n).join('\n');

const favicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a0a09'/%3E%3Crect x='8' y='8' width='16' height='16' rx='3' fill='%23d1a00b'/%3E%3C/svg%3E`;

const head = (title, desc, base, extra = '') => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#0a0a09">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${base}assets/img/mm/hero.jpg">
  <link rel="icon" href="${favicon}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
  <link rel="stylesheet" href="${base}assets/style.css">${extra}
</head>
<body>
  <a class="skip" href="#contenu">Aller au contenu</a>
  <div class="bg" aria-hidden="true"><div class="grid"></div><i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i><i class="spot"></i></div>
`;

const header = (base) => `  <header class="site-header">
    <div class="wrap bar">
      <a class="logo" href="${base}index.html#top">Maxime Joppin</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="nav" id="nav" aria-label="Navigation principale">
        <ul>
          <li><a href="${base}index.html#projets">Projets</a></li>
          <li><a href="${base}index.html#competences">Compétences</a></li>
          <li><a href="${base}index.html#parcours">Parcours</a></li>
          <li><a href="${base}assets/CV_Maxime_Joppin.pdf" target="_blank" rel="noopener">CV</a></li>
          <li><a class="cta" href="${base}index.html#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
`;

const footer = (base, scripts = '') => `  <footer class="site-footer">
    <div class="wrap">
      <span>© 2026 Maxime Joppin · Site statique fait main, hébergé sur GitHub Pages</span>
      <span><a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>${SITE.github ? ` &nbsp;|&nbsp; <a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>` : ''} &nbsp;|&nbsp; <a href="#top">Retour en haut</a></span>
    </div>
  </footer>
  <script src="${base}assets/main.js"></script>${scripts}
</body>
</html>
`;

const stack = (items) => `<ul class="stack">${items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
const butChips = (codes) => `<ul class="but">${codes.map((c) => `<li><b>${c}</b> ${esc(BUT[c])}</li>`).join('')}</ul>`;

// Visuel d'une carte : image, ou « fenêtre de code » quand le projet n'a pas de capture
const codeCover = (p, n) => `<div class="win"><i></i><i></i><i></i><span>${esc(p.code[0][2])}</span></div><pre>${esc(firstLines(p.coverCode, n))}</pre>`;
const cardVisual = (p) => p.cover
  ? `<div class="card-media${p.coverContain ? ' contain' : ''}"><img src="${p.cover}" alt="" loading="lazy"></div>`
  : `<div class="card-media code-cover" aria-hidden="true">${codeCover(p, 14)}</div>`;

// ---------------------------------------------------------------- Accueil
function renderIndex() {
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  const featuredHtml = `
        <article class="feature">
          <a class="feature-media" href="projets/${featured.slug}.html" aria-label="Étude de cas ${esc(featured.title)}">
            <img src="${featured.cover}" alt="Les monstres de ${esc(featured.title)} dans la prairie" width="1600" height="900">
            <span class="badge">Projet phare</span>
          </a>
          <div class="feature-body">
            <p class="kicker">${esc(featured.category)}</p>
            <h3><a href="projets/${featured.slug}.html">${esc(featured.title)}</a></h3>
            <p>${esc(featured.tagline)}</p>
            <dl class="stats">${featured.stats.map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl>
            ${stack(featured.stack.slice(0, 6))}
            <a class="btn" href="projets/${featured.slug}.html">Voir l’étude de cas</a>
          </div>
        </article>`;

  const cards = rest.map((p) => `
          <article class="card">
            <a class="card-link" href="projets/${p.slug}.html">
              ${cardVisual(p)}
              <div class="card-body">
                <p class="kicker">${esc(p.category)}</p>
                <h3>${esc(p.title)}</h3>
                <p>${esc(p.tagline)}</p>
                ${stack(p.stack.slice(0, 4))}
                <span class="more">Étude de cas →</span>
              </div>
            </a>
          </article>`).join('');

  const others = otherProjects.map(([t, d, s]) => `
          <li><h4>${esc(t)}</h4><p>${esc(d)}</p>${stack(s)}</li>`).join('');

  // Compétences : chaque compétence renvoie aux projets qui la prouvent
  const proof = (slugs) => slugs.map((s) => `<a href="projets/${s}.html">${esc(projects.find((x) => x.slug === s).title)}</a>`).join(', ');
  const skills = [
    ['Développement web', [['PHP', ['hookbuilder', 'custom-css-js', 'chatbot-wordpress']], ['JavaScript ES6, POO', ['destiny-codex', 'chatbot-wordpress']], ['HTML / CSS', ['maxtcg', 'custom-css-js']], ['SQL, PostgreSQL', ['maxtcg', 'hookbuilder']], ['Webpack, API REST', ['destiny-codex']]]],
    ['CMS & e-commerce', [['PrestaShop : modules, hooks, ORM', ['maxtcg', 'hookbuilder', 'custom-css-js']], ['WordPress : plugins', ['chatbot-wordpress']], ['Twig, Smarty', ['hookbuilder', 'custom-css-js']]]],
    ['Logiciel & jeu', [['Luau typé, client / serveur', ['monster-museum']], ['C++17, Make, tests unitaires', ['cgshop']], ['Python (Blender, scripts)', ['monster-museum']], ['C, Arduino', []]]],
    ['IA & automatisation', [['API OpenAI, prompt système', ['chatbot-wordpress']], ['Claude Code, skills, MCP', ['monster-museum']], ['n8n', []], ['Évaluation de LLM (AI Trainer)', []]]],
    ['Méthodes & outils', [['Git, GitLab, merge requests', ['cgshop', 'monster-museum']], ['Scrum, RACI, risques', ['cgshop']], ['Tests et simulations', ['monster-museum', 'cgshop']], ['VS Code, Rojo, Blender', ['monster-museum']]]],
  ].map(([cat, items]) => `
          <div>
            <h3>${esc(cat)}</h3>
            <ul>${items.map(([s, sl]) => `<li><span>${esc(s)}</span>${sl.length ? `<small>${proof(sl)}</small>` : ''}</li>`).join('')}</ul>
          </div>`).join('');

  const html = head('Maxime Joppin – Développeur web & applications', 'Portfolio de Maxime Joppin, étudiant en BUT Informatique : jeu multijoueur Roblox, boutique et modules PrestaShop, outils C++, applications JavaScript. Recherche un stage d’avril à juin 2027.', '') + header('') + `
  <main id="contenu">
    <section class="hero" id="top">
      <div class="shapes" aria-hidden="true"><i class="ring"></i><i class="sq"></i><i class="dots"></i></div>
      <div class="wrap hero-grid">
        <div class="hero-text">
          <p class="eyebrow">Étudiant en BUT Informatique · Arles</p>
          <h1><span>Maxime</span><span>Joppin</span></h1>
          <p class="role">Développeur web &amp; applications</p>
          <p class="hero-lede">De la boutique PrestaShop au jeu multijoueur de 55 000 lignes, je conçois, je code et je mets en ligne, en autonomie comme en équipe.</p>
          <p class="status">Je cherche un stage de 12 semaines, d’avril à juin 2027</p>
          <div class="actions">
            <a class="btn" href="#projets">Voir mes projets</a>
            <a class="btn ghost" href="assets/CV_Maxime_Joppin.pdf" target="_blank" rel="noopener">Télécharger mon CV</a>
          </div>
          <ul class="pills" aria-label="Liens rapides">
            <li><a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>${SITE.github ? `
            <li><a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a></li>` : ''}
            <li><a href="mailto:${SITE.email}">E-mail</a></li>
            <li><a href="tel:${SITE.tel}">${SITE.phone}</a></li>
          </ul>
        </div>
        <figure class="portrait">
          <img src="assets/img/maxime.jpg" width="400" height="400" alt="Portrait de Maxime Joppin">
        </figure>
      </div>
      <div class="wrap">
        <dl class="numbers">
          <div><dt>7</dt><dd>projets détaillés, avec code et captures</dd></div>
          <div><dt>6</dt><dd>langages en projet : PHP, JS, Luau, C++, Python, SQL</dd></div>
          <div><dt>3</dt><dd>modules et plugins écrits sur mesure</dd></div>
          <div><dt>C1</dt><dd>en anglais, espagnol et italien lus et écrits</dd></div>
        </dl>
      </div>
    </section>

    <section class="section" id="projets">
      <div class="wrap">
        <div class="section-head">
          <h2>Projets</h2>
          <p>Chaque projet a sa page : contexte, ce que j’ai fait, compétences mobilisées, captures et extraits de code réels.</p>
        </div>
${featuredHtml}
        <div class="cards">${cards}
        </div>

        <h3 class="sub">Autres réalisations</h3>
        <ul class="others">${others}
        </ul>
      </div>
    </section>

    <section class="section" id="competences">
      <div class="wrap">
        <div class="section-head">
          <h2>Compétences</h2>
          <p>Chaque compétence renvoie aux projets qui la démontrent.</p>
        </div>
        <div class="skills">${skills}
        </div>
      </div>
    </section>

    <section class="section" id="parcours">
      <div class="wrap parcours-grid">
        <div>
          <div class="section-head"><h2>Parcours</h2></div>
          <ol class="timeline">
            <li class="next"><time>Avril – juin 2027</time><h3>Stage de 12 semaines</h3><p>Je cherche une équipe de développement où contribuer à de vrais projets, web ou applicatifs.</p></li>
            <li><time>En cours</time><h3>BUT Informatique, parcours Réalisation d’applications</h3><p>IUT d’Arles, Aix-Marseille Université. Projets en C++, JavaScript, bases de données et gestion de projet.</p></li>
            <li><time>Depuis 2023</time><h3>AI Trainer, DataAnnotation (freelance)</h3><p>Détection d’hallucinations et d’erreurs logiques dans des réponses de modèles d’IA, vérification factuelle, rédaction de prompts complexes en français.</p></li>
            <li><time>2025</time><h3>Stage chez mid-digital</h3><p>Découverte de PrestaShop et de WordPress en agence, premières automatisations avec n8n.</p></li>
            <li><time>Job étudiant</time><h3>Employé rayon fruits &amp; légumes, Leclerc</h3><p>Relation client, organisation du rayon, travail en équipe.</p></li>
            <li><time>Baccalauréat</time><h3>Bac général NSI &amp; Mathématiques, mention Bien</h3><p>Les Chartreux, Lyon.</p></li>
          </ol>
        </div>
        <aside class="certs">
          <h3>Certifications</h3>
          <ul>
            <li><span class="cert-mark" aria-hidden="true"></span><div><strong>Claude 101</strong><small>Anthropic Academy</small><a href="https://academy.claude.com/verify/e14d4684249121204f2a1fc172c44053" target="_blank" rel="noopener">Vérifier le badge →</a></div></li>
            <li><span class="cert-mark" aria-hidden="true"></span><div><strong>Claude Code 101</strong><small>Anthropic Academy</small><a href="https://academy.claude.com/verify/7b3ef1b1594f87de37dd5132a0dafc9d" target="_blank" rel="noopener">Vérifier le badge →</a></div></li>
          </ul>
          <h3>Langues</h3>
          <ul class="langs"><li>Français <small>langue maternelle</small></li><li>Anglais <small>C1</small></li><li>Espagnol <small>lu et écrit</small></li><li>Italien <small>lu et écrit</small></li></ul>
          <h3>En dehors du code</h3>
          <p class="mute">Technologie, musique, boxe.</p>
        </aside>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="wrap contact-grid">
        <div>
          <h2>Contact</h2>
          <p class="contact-lede">Une proposition de stage, une question sur un projet ? Écrivez-moi, je réponds rapidement.</p>
          <ul class="contact-list">
            <li><span>E-mail</span><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li><span>Téléphone</span><a href="tel:${SITE.tel}">${SITE.phone}</a></li>
            <li><span>LinkedIn</span><a href="${SITE.linkedin}" target="_blank" rel="noopener">linkedin.com/in/maxime-joppin</a></li>
          </ul>
        </div>
        <form class="form" data-mailto="${SITE.email}">
          <label>Nom<input name="Nom" type="text" autocomplete="name" required></label>
          <label>Adresse mail<input name="Adresse mail" type="email" autocomplete="email" required></label>
          <label>Message<textarea name="Message" required></textarea></label>
          <button class="btn" type="submit">Envoyer le message</button>
          <p class="form-status" role="status"></p>
        </form>
      </div>
    </section>
  </main>
` + footer('');
  writeFileSync(join(root, 'index.html'), html);
}

// ---------------------------------------------------------- Études de cas
const HLJS = `
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/tomorrow-night.min.css">`;
const HLJS_JS = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>window.hljs && hljs.highlightAll();</script>`;

function renderProject(p, i) {
  const b = '../';
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];

  const hero = p.cover
    ? `<figure class="cs-cover${p.coverContain ? ' contain' : ''}"><img src="${b}${p.cover}" alt="${esc(p.title)}"></figure>`
    : `<figure class="cs-cover code-cover" aria-hidden="true">${codeCover(p, 18)}</figure>`;

  const meta = Object.entries(p.meta).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const stats = p.stats ? `<dl class="stats big">${p.stats.map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl>` : '';
  const sections = p.sections.map(([h, body]) => `
        <section class="cs-block"><h2>${h}</h2>${body.trim().startsWith('<') ? body : `<p>${body}</p>`}</section>`).join('');

  const video = p.video ? `
        <section class="cs-block"><h2>En vidéo</h2>
          <figure class="video"><video src="${b}${p.video.src}" poster="${b}${p.video.poster}" controls muted playsinline preload="none"></video><figcaption>${esc(p.video.caption)}</figcaption></figure>
        </section>` : '';

  const gallery = p.gallery.length ? `
        <section class="cs-block"><h2>Captures et documents</h2>
          <div class="gallery">${p.gallery.map(([src, cap, fit]) => `
            <figure><button type="button" class="zoom${fit === 'contain' ? ' contain' : ''}" data-src="${b}${src}" data-caption="${esc(cap)}"><img src="${b}${src}" alt="${esc(cap)}" loading="lazy"></button><figcaption>${esc(cap)}</figcaption></figure>`).join('')}
          </div>
        </section>` : '';

  const code = p.code.length ? `
        <section class="cs-block"><h2>Extraits de code</h2>${p.code.map(([f, lang, path, note]) => `
          <figure class="code">
            <figcaption><span class="path">${esc(path)}</span><span class="note">${esc(note)}</span></figcaption>
            <pre><code class="language-${lang}">${esc(snippet(f).replace(/^<\?php\n/, ''))}</code></pre>
          </figure>`).join('')}
        </section>` : '';

  const links = p.links.length ? `<div class="cs-links">${p.links.map(([t, href]) => `<a class="btn" href="${href}" target="_blank" rel="noopener">${esc(t)}</a>`).join('')}</div>` : '';

  const html = head(`${p.title} – Maxime Joppin`, p.tagline, b, p.code.length ? HLJS : '') + header(b) + `
  <main id="contenu" class="case">
    <div class="wrap">
      <nav class="crumbs" aria-label="Fil d’Ariane"><a href="${b}index.html#projets">← Tous les projets</a></nav>
      <header class="cs-head" id="top">
        <p class="kicker">${esc(p.category)}</p>
        <h1>${esc(p.title)}</h1>
        <p class="cs-tagline">${esc(p.tagline)}</p>
        ${links}
      </header>
      ${hero}
      <div class="cs-grid">
        <aside class="cs-side">
          <dl class="meta">${meta}</dl>
          <h3>Technologies</h3>
          ${stack(p.stack)}
          <h3>Compétences BUT</h3>
          ${butChips(p.but)}
        </aside>
        <div class="cs-main">
          <section class="cs-block lead"><h2>En bref</h2><p>${p.summary}</p>${stats}</section>${sections}${video}${gallery}${code}
        </div>
      </div>
      <nav class="cs-nav" aria-label="Autres projets">
        <a href="${prev.slug}.html"><small>← Projet précédent</small>${esc(prev.title)}</a>
        <a href="${next.slug}.html"><small>Projet suivant →</small>${esc(next.title)}</a>
      </nav>
    </div>
  </main>
  <div class="lightbox" hidden><button type="button" class="lb-close" aria-label="Fermer">×</button><img alt=""><p></p></div>
` + footer(b, p.code.length ? HLJS_JS : '');
  writeFileSync(join(root, 'projets', `${p.slug}.html`), html);
}

mkdirSync(join(root, 'projets'), { recursive: true });
renderIndex();
projects.forEach(renderProject);
console.log(`OK : index.html + ${projects.length} études de cas`);
