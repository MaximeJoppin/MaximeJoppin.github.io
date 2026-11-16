import { profile, skills, tech, projects, badges } from "./data.js";
import { planetTexture } from "./textures.js";

export function badgeCards() {
  return `<div class="badge-cards">${badges.map((b) => `
    <div class="cert">
      <span class="cert-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.4 6.4 19.5l2.1-6.7L3 8.8h6.8z" fill="currentColor"/></svg></span>
      <span class="cert-text"><b>${esc(b.name)}</b><small>${esc(b.issuer)}${b.date ? " · " + esc(b.date) : ""}</small></span>
      ${b.verify ? `<a class="cert-link" href="${esc(b.verify)}" target="_blank" rel="noopener">Vérifier ↗</a>` : `<span class="todo cert-todo">Lien de vérification</span>`}
    </div>`).join("")}</div>`;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const val = (v) => (v && v.todo ? `<span class="todo">${esc(v.hint)}</span>` : esc(v));
const sec = (title, inner, idx) => `<section class="p-sec"><h3>${idx ? `<i>${idx}</i>` : ""}${title}</h3>${inner}</section>`;
const splitTitle = (name) => { const w = name.split(" "); return w.length > 1 ? `${esc(w.slice(0, -1).join(" "))} <b>${esc(w.at(-1))}</b>` : `<b>${esc(name)}</b>`; };

export function projectPanel(p) {
  const idx = projects.indexOf(p) + 1;
  const challenges = p.challenges.map((c) => c.todo
    ? `<span class="todo">${esc(c.hint)}</span>`
    : `<dl class="challenge"><dt>Difficulté</dt><dd>${val(c.problem)}</dd><dt>Solution</dt><dd>${val(c.solution)}</dd></dl>`).join("");
  const links = [
    p.github ? `<a class="btn" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : "",
    p.demo ? `<a class="btn" href="${esc(p.demo)}" target="_blank" rel="noopener">${esc(p.demoLabel || "Voir la démo")} ↗</a>` : ""
  ].join("");
  const linkNote = [
    !p.github ? "Dépôt GitHub non renseigné." : "",
    !p.demo && p.demoNote ? p.demoNote : !p.demo ? "Pas de démo en ligne pour le moment." : ""
  ].filter(Boolean).join(" ");

  return {
    kicker: `Planète ${String(idx).padStart(2, "0")} · orbite ${p.planet.orbit} UA`,
    accent: p.planet.colors[2],
    html: `
      <h2 class="p-title" id="panel-title">${splitTitle(p.name)}</h2>
      <div class="p-meta">
        <span>Catégorie · <b>${esc(p.category)}</b></span>
        <span>Rôle · <b>${val(p.role)}</b></span>
        ${p.status ? `<span class="p-status">● ${esc(p.status)}</span>` : ""}
      </div>
      <p class="p-lead">${esc(p.description)}</p>
      <figure class="preview" data-preview="${esc(p.id)}">
        ${p.image ? `<img src="${esc(p.image)}" alt="Aperçu de ${esc(p.name)}">` : `<canvas aria-hidden="true"></canvas>`}
        <figcaption>${p.image ? `Aperçu · ${esc(p.name)}` : "Relevé de surface généré · ajoutez une capture via le champ image de data.js"}</figcaption>
      </figure>
      ${sec("Technologies", `<div class="badges">${p.stack.map((t) => `<button class="badge" data-tech="${esc(t)}" data-parent="${esc(p.id)}">${esc(t)}</button>`).join("")}</div><p class="muted" style="margin-top:8px">Chaque technologie est aussi un satellite de la planète : cliquez dessus dans la scène.</p>`, "01")}
      ${sec("Fonctionnalités", `<ul class="p-list">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`, "02")}
      ${sec("Difficultés et solutions", challenges, "03")}
      ${sec("Liens", `${links ? `<div class="links">${links}</div>` : ""}<p class="muted" style="margin-top:${links ? 8 : 0}px">${esc(linkNote)}</p>`, "04")}`
  };
}

export function paintPreview(root, p) {
  const cv = root.querySelector(`[data-preview="${p.id}"] canvas`);
  if (!cv) return;
  const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const ctx = cv.getContext("2d");
  const { map } = planetTexture(p.planet.type, p.planet.colors, 101 + projects.indexOf(p) * 37, 256);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(map, 0, 0, map.width, map.height, 0, 0, cv.width, cv.height);
  const g = ctx.createLinearGradient(0, 0, 0, cv.height);
  g.addColorStop(0, "rgba(2,3,10,.1)"); g.addColorStop(1, "rgba(2,3,10,.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = "rgba(127,231,255,.25)"; ctx.lineWidth = 1;
  for (let x = 0; x < cv.width; x += 24 * dpr) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
  for (let y = 0; y < cv.height; y += 24 * dpr) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
}

function constellationSVG() {
  const W = 460, H = 360, cx = W / 2, cy = H / 2;
  let out = `<circle cx="${cx}" cy="${cy}" r="16" fill="url(#sg)"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" style="font:600 10px var(--display);fill:#1a0a00">MJ</text>`;
  skills.forEach((g, gi) => {
    const a = -Math.PI / 2 + (gi / skills.length) * Math.PI * 2;
    const gx = cx + Math.cos(a) * 150, gy = cy + Math.sin(a) * 112;
    out += `<line x1="${cx}" y1="${cy}" x2="${gx}" y2="${gy}" stroke="${g.color}" stroke-opacity=".12" stroke-dasharray="2 4"/>`;
    const n = Math.max(g.items.length, 1);
    const pts = g.items.map((_, i) => { const b = a + (i - (n - 1) / 2) * 0.62; const d = 30 + (i % 2) * 14; return [gx + Math.cos(b + Math.PI / 2) * d * 0.9, gy + Math.sin(b + Math.PI / 2) * d * 0.7]; });
    if (pts.length > 1) out += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${g.color}" stroke-opacity=".45"/>`;
    pts.forEach((p) => (out += `<line x1="${gx}" y1="${gy}" x2="${p[0]}" y2="${p[1]}" stroke="${g.color}" stroke-opacity=".2"/>`));
    out += `<circle cx="${gx}" cy="${gy}" r="3.2" fill="${g.color}"><animate attributeName="r" values="3.2;4.2;3.2" dur="${3 + gi * 0.4}s" repeatCount="indefinite"/></circle>`;
    out += `<text class="gname" x="${gx}" y="${gy - 10}" text-anchor="middle" fill="${g.color}" style="fill:${g.color}">${esc(g.group)}</text>`;
    g.items.forEach((it, i) => {
      const [x, y] = pts[i];
      out += `<g class="star"><circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/><circle cx="${x}" cy="${y}" r="6" fill="${g.color}" opacity=".18"/><text x="${x}" y="${y + 14}" text-anchor="middle">${esc(it)}</text><title>${esc(g.group)} · ${esc(it)}</title></g>`;
    });
    if (!g.items.length) out += `<text x="${gx}" y="${gy + 16}" text-anchor="middle" style="fill:#ffdca0">à compléter</text>`;
  });
  return `<div class="constellation"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Constellation des compétences"><defs><radialGradient id="sg"><stop offset="0" stop-color="#fff6d8"/><stop offset=".6" stop-color="#ffb347"/><stop offset="1" stop-color="#ff6a1a"/></radialGradient></defs>${out}</svg></div>`;
}

function skillsList() {
  return skills.map((g) => `<div style="margin-top:14px"><div class="legend" style="margin:0 0 6px"><span><i style="background:${g.color}"></i>${esc(g.group)}</span></div>${g.items.length ? `<div class="badges">${g.items.map((i) => `<span class="badge">${esc(i)}</span>`).join("")}</div>` : `<span class="todo">${esc(g.todo)}</span>`}</div>`).join("");
}

export function profilePanel() {
  return {
    kicker: "Étoile centrale · profil",
    accent: "#ffb347",
    html: `
      <h2 class="p-title" id="panel-title">Maxime <b>Joppin</b></h2>
      <div class="p-meta"><span><b>${esc(profile.title)}</b></span><span>${esc(profile.school)}</span><span>${esc(profile.location)}</span><span class="p-status">● ${esc(profile.status)}</span></div>
      <p class="p-lead">${esc(profile.tagline)}</p>
      ${sec("Parcours", `<ol class="timeline">${profile.timeline.map((t) => `<li><time>${esc(t.when)}</time><b>${esc(t.title)}</b><p>${esc(t.text)}</p></li>`).join("")}</ol>`, "01")}
      ${sec("Constellation de compétences", constellationSVG(), "02")}
      ${sec("Certifications", badgeCards(), "03")}
      ${sec("Centres d’intérêt", `<div class="interests">${profile.interests.map((i) => `<span>${esc(i)}</span>`).join("")}</div><p class="muted" style="margin-top:10px">Langues : ${profile.languages.map(esc).join(" · ")}<br>En dehors du code : ${profile.hobbies.map(esc).join(", ")}</p>`, "04")}
      ${sec("Objectif", `<p class="p-lead">${esc(profile.goals)}</p><div class="links" style="margin-top:12px"><button class="btn" data-open="contact">Me contacter</button><button class="btn ghost" data-open="skills">Toutes les compétences</button></div>`, "05")}`
  };
}

export function skillsPanel() {
  return {
    kicker: "Carte stellaire · compétences",
    accent: "#a98bff",
    html: `
      <h2 class="p-title" id="panel-title">Compé<b>tences</b></h2>
      <p class="p-lead" style="margin-top:12px">Chaque groupe forme une constellation autour de l’étoile centrale. Les satellites des planètes reprennent ces technologies, projet par projet.</p>
      ${sec("Constellations", constellationSVG(), "01")}
      ${sec("Détail", skillsList(), "02")}
      ${sec("Certifications", badgeCards(), "03")}
      ${sec("Où les retrouver", `<ul class="p-list">${projects.map((p) => `<li><button class="badge" data-focus="${esc(p.id)}">${esc(p.name)}</button> <span class="muted">${p.stack.map(esc).join(" · ")}</span></li>`).join("")}</ul>`, "04")}`
  };
}

export function contactPanel() {
  const c = profile.contact;
  return {
    kicker: "Canal de transmission · ouvert",
    accent: "#7fe7ff",
    html: `
      <h2 class="p-title" id="panel-title">Établir le <b>contact</b></h2>
      <p class="p-lead" style="margin-top:12px">Une question, une proposition de stage ou un projet à discuter ? Écrivez-moi ou appelez-moi.</p>
      ${sec("Fréquences", `<div class="channels">
        <a class="channel" href="mailto:${esc(c.email)}"><span>E-mail</span>${esc(c.email)}</a>
        <a class="channel" href="${esc(c.phoneHref)}"><span>Téléphone</span>${esc(c.phone)}</a>
        <a class="channel" href="${esc(c.linkedin)}" target="_blank" rel="noopener"><span>LinkedIn</span>linkedin.com/in/maxime-joppin ↗</a>
        ${c.github ? `<a class="channel" href="${esc(c.github)}" target="_blank" rel="noopener"><span>GitHub</span>${esc(c.github.replace(/^https?:\/\//, ""))} ↗</a>` : `<div class="channel"><span>GitHub</span><span class="todo" style="text-transform:none;letter-spacing:0">Ajoutez l’URL dans data.js (contact.github)</span></div>`}
      </div>`, "01")}
      ${sec("Message", `<form class="form" id="contact-form" novalidate>
        <label>Nom<input name="name" autocomplete="name" required></label>
        <label>Adresse mail<input name="email" type="email" autocomplete="email" required></label>
        <label>Message<textarea name="message" rows="5" required></textarea></label>
        <button class="btn" type="submit">Envoyer la transmission</button>
        <p class="signal" id="form-signal" role="status"></p>
        <p class="muted">Le formulaire ouvre votre messagerie avec le message prérempli, adressé à ${esc(c.email)}.</p>
      </form>`, "02")}`
  };
}

export function techPanel(name, parent) {
  const users = projects.filter((p) => p.stack.includes(name));
  return {
    kicker: `Satellite · ${parent ? parent.name : "technologie"}`,
    accent: "#cfe9ff",
    html: `
      <h2 class="p-title" id="panel-title"><b>${esc(name)}</b></h2>
      <p class="p-lead" style="margin-top:14px">${tech[name] ? esc(tech[name]) : `<span class="todo">Ajoutez une description dans data.js (tech)</span>`}</p>
      ${sec("Utilisé dans", `<div class="badges">${users.map((p) => `<button class="badge" data-focus="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>`, "01")}
      ${parent ? `<div class="links" style="margin-top:22px"><button class="btn" data-focus="${esc(parent.id)}">← Retour à ${esc(parent.name)}</button></div>` : ""}`
  };
}

export function bindContactForm(root) {
  const f = root.querySelector("#contact-form");
  if (!f) return;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const sig = root.querySelector("#form-signal");
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message.trim()) { sig.textContent = "Signal incomplet : renseignez le nom, une adresse valide et le message."; return; }
    const body = `${d.message}\n\n${d.name} · ${d.email}`;
    location.href = `mailto:${profile.contact.email}?subject=${encodeURIComponent("Contact depuis le portfolio · " + d.name)}&body=${encodeURIComponent(body)}`;
    sig.textContent = "Transmission prête : votre messagerie s’ouvre.";
  });
}
