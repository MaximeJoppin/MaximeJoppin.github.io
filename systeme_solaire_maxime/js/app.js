import { projects, skills, badges } from "./data.js";
import { createUniverse } from "./scene.js";
import { projectPanel, paintPreview, profilePanel, skillsPanel, contactPanel, techPanel, bindContactForm, badgeCards } from "./panels.js";

const $ = (s) => document.querySelector(s);
const mq = matchMedia("(max-width: 720px)");
const isMobile = mq.matches || matchMedia("(pointer: coarse)").matches && innerWidth < 1024;
const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Son (désactivé par défaut) ---------------- */
const sound = (() => {
  let ctx = null, master = null, on = localStorage.getItem("mj-sound") === "1";
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420; lp.connect(master);
    [55, 82.4, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i === 2 ? "triangle" : "sine"; o.frequency.value = f; o.detune.value = i * 4;
      g.gain.value = [0.05, 0.03, 0.012][i];
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.05 + i * 0.03; lg.gain.value = g.gain.value * 0.6;
      lfo.connect(lg); lg.connect(g.gain); lfo.start(); o.connect(g); g.connect(lp); o.start();
    });
  }
  function set(v) {
    on = v; localStorage.setItem("mj-sound", v ? "1" : "0");
    if (v) { init(); ctx.resume(); master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8); }
    else if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    const b = $("#sound-btn"); b.setAttribute("aria-pressed", String(v)); b.setAttribute("aria-label", v ? "Couper le son" : "Activer le son");
  }
  function blip(freq = 880, dur = 0.12, vol = 0.04) {
    if (!on || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = "sine"; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function whoosh() {
    if (!on || !ctx) return;
    const t = ctx.currentTime, len = 1.6, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = "bandpass"; f.Q.value = 2; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(1400, t + len * 0.6);
    g.gain.value = 0.05; src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t);
  }
  return { set, blip, whoosh, get on() { return on; } };
})();

/* ---------------- WebGL indisponible ---------------- */
function hasWebGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }
if (!hasWebGL()) {
  $("#hint-text").textContent = "La 3D n’est pas disponible sur cet appareil : utilisez la liste des projets.";
}

/* ---------------- Univers ---------------- */
const panel = $("#panel"), panelBody = $("#panel-body"), live = $("#live");
const hoverLabel = $("#hover-label");
let current = null; // { type, id }
let lastFocus = null;

const universe = hasWebGL() ? createUniverse($("#scene"), {
  projects, isMobile, lowPower,
  onHover(b) {
    if (!b) { hoverLabel.classList.remove("on"); return; }
    hoverLabel.querySelector("b").textContent = b.name;
    hoverLabel.querySelector("small").textContent = b.kind === "planet" ? `${b.sub} · cliquez pour explorer` : b.kind === "moon" ? `${b.sub} · cliquez pour la fiche` : b.sub;
    hoverLabel.style.setProperty("--accent", b.color);
    hoverLabel.classList.add("on");
    sound.blip(b.kind === "moon" ? 1320 : 990, 0.08, 0.025);
  },
  onHoverMove(x, y) { hoverLabel.style.left = x + "px"; hoverLabel.style.top = y + "px"; },
  onPick(b) {
    if (!b) return;
    if (b.kind === "sun") open("profile");
    else if (b.kind === "planet") open("project", b.id);
    else if (b.kind === "moon") open("tech", b.tech, b.parent.id);
  },
  onInteract() { dismissHintSoon(); },
  onArrive() { sound.blip(660, 0.25, 0.03); },
  onFrame: throttleCoords()
}) : null;

function throttleCoords() {
  const el = $("#hud-coords"); let t = 0;
  return (cam, follow) => {
    if (++t % 10) return;
    el.textContent = `${follow ? follow.name.split(" ")[0].slice(0, 8).toUpperCase() : "SOL"} · ${cam.radius.toFixed(0).padStart(3, "0")} UA`;
  };
}

/* ---------------- HUD ---------------- */
const order = [{ id: "sun", name: "Maxime Joppin", color: "#ffb347", orbit: "★" }, ...projects.map((p) => ({ id: p.id, name: p.name, color: p.planet.colors[2], orbit: p.planet.orbit + " UA" }))];
$("#hud-list").innerHTML = order.map((o) => `<li><button data-body="${o.id}" aria-label="${o.id === "sun" ? "Profil : " : "Projet : "}${o.name}"><span class="hud-dot" style="background:${o.color};color:${o.color}"></span><span class="hud-name">${o.name}</span><span class="hud-orbit">${o.orbit}</span></button></li>`).join("");

function markCurrent(id) {
  document.querySelectorAll("#hud-list button").forEach((b) => b.setAttribute("aria-current", String(b.dataset.body === id)));
  document.querySelectorAll(".menu [data-open]").forEach((b) => b.setAttribute("aria-current", String(current && b.dataset.open === current.type && current.type !== "project")));
}

/* ---------------- Panneau ---------------- */
function render(content) {
  $("#panel-kicker").textContent = content.kicker;
  panel.style.setProperty("--accent", content.accent);
  panelBody.innerHTML = content.html;
  panelBody.scrollTop = 0;
}

function showPanel() {
  if (panel.hidden) { lastFocus = document.activeElement; panel.hidden = false; requestAnimationFrame(() => panel.classList.add("open")); }
  document.body.classList.add("focused");
  requestAnimationFrame(updateInset);
  setTimeout(() => panelBody.focus({ preventScroll: true }), 60);
}

function updateInset() {
  if (!universe) return;
  if (onLanding) return landingInset();
  if (panel.hidden) return universe.setInset(0, 0);
  const r = panel.getBoundingClientRect();
  if (mq.matches) universe.setInset(0, r.height / 2 - 10);
  else universe.setInset((innerWidth - r.left) / 2, 0);
}

function open(type, id, parentId) {
  dismissHint();
  const prevFollow = universe?.follow?.id;
  current = { type, id, parentId };
  let content;
  if (type === "project") {
    const p = projects.find((x) => x.id === id); if (!p) return;
    content = projectPanel(p);
    if (prevFollow !== id) { universe?.focus(id); sound.whoosh(); }
    markCurrent(id);
    render(content); showPanel();
    requestAnimationFrame(() => paintPreview(panelBody, p));
    live.textContent = `Projet ${p.name} ouvert`;
    return;
  }
  if (type === "tech") {
    const parent = projects.find((x) => x.id === parentId);
    if (parent && prevFollow !== parentId) universe?.focus(parentId);
    content = techPanel(id, parent); markCurrent(parentId);
    sound.blip(1200, 0.15, 0.03);
  } else if (type === "profile") {
    content = profilePanel();
    if (prevFollow !== "sun") { universe?.focus("sun"); sound.whoosh(); }
    markCurrent("sun");
  } else {
    content = type === "skills" ? skillsPanel() : contactPanel();
    if (universe?.follow) universe.overview(1.8);
    markCurrent(null);
  }
  render(content); showPanel();
  if (type === "contact") bindContactForm(panelBody);
  live.textContent = `${$("#panel-kicker").textContent} ouvert`;
}

function close() {
  if (panel.hidden && !universe?.follow) return;
  panel.classList.remove("open");
  document.body.classList.remove("focused");
  current = null; markCurrent(null);
  setTimeout(() => { if (!current) { panel.hidden = true; updateInset(); } }, 450);
  universe?.setInset(0, 0);
  universe?.overview();
  sound.whoosh();
  live.textContent = "Retour à la vue globale du système";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}

function step(dir) {
  const ids = order.map((o) => o.id);
  const cur = current?.type === "project" ? current.id : current?.type === "tech" ? current.parentId : current?.type === "profile" ? "sun" : universe?.follow?.id;
  let i = ids.indexOf(cur); i = (i + dir + ids.length) % ids.length;
  ids[i] === "sun" ? open("profile") : open("project", ids[i]);
}

/* ---------------- Événements ---------------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-open],[data-body],[data-focus],[data-tech]");
  if (!t) return;
  if (t.dataset.open) open(t.dataset.open);
  else if (t.dataset.body) t.dataset.body === "sun" ? open("profile") : open("project", t.dataset.body);
  else if (t.dataset.focus) open("project", t.dataset.focus);
  else if (t.dataset.tech) open("tech", t.dataset.tech, t.dataset.parent);
});
$("#panel-close").addEventListener("click", close);
$("#prev-body").addEventListener("click", () => step(-1));
$("#next-body").addEventListener("click", () => step(1));
function resetView() { if (!panel.hidden || universe?.follow) close(); else universe?.overview(1.4); }
$("#reset-cam").addEventListener("click", resetView);
$("#zoom-in").addEventListener("click", () => universe?.zoom(0.75));
$("#zoom-out").addEventListener("click", () => universe?.zoom(1.33));
$("#sound-btn").addEventListener("click", () => sound.set(!sound.on));
if (sound.on) { $("#sound-btn").setAttribute("aria-pressed", "true"); $("#sound-btn").setAttribute("aria-label", "Couper le son"); }

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) { if (e.key === "Escape") e.target.blur(); return; }
  if (onLanding) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  else if (e.key === "+" || e.key === "=") universe?.zoom(0.8);
  else if (e.key === "-" || e.key === "_") universe?.zoom(1.25);
  else if (e.key.toLowerCase() === "r") resetView();
});

addEventListener("resize", () => requestAnimationFrame(updateInset));

/* ---------------- Aide contextuelle ---------------- */
const hint = $("#hint");
$("#hint-text").textContent = isMobile
  ? "Touchez une planète pour ouvrir un projet · un doigt pour pivoter, deux pour zoomer"
  : "Cliquez sur une planète pour ouvrir un projet · glisser pour pivoter · molette pour zoomer · ← → pour parcourir";
let hintTimer = null;
function dismissHint() { hint.classList.add("gone"); }
function dismissHintSoon() { clearTimeout(hintTimer); hintTimer = setTimeout(dismissHint, 6000); }
$("#hint-close").addEventListener("click", dismissHint);

/* ---------------- Page d'accueil ---------------- */
const landingEl = $("#intro"), enterBtn = $("#enter-btn");
let onLanding = true;

$("#planet-count").textContent = String(projects.length).padStart(2, "0");
$("#badge-count").textContent = String(badges.length).padStart(2, "0");
$("#landing-badges").innerHTML = badgeCards();
$("#landing-list").innerHTML = projects.map((p) => `<li><button data-enter="project:${p.id}"><span class="hud-dot" style="background:${p.planet.colors[2]};color:${p.planet.colors[2]}"></span><span><b>${p.name}</b><small>${p.category}</small></span><span class="arrow" aria-hidden="true">→</span></button></li>`).join("");

// Bandeau défilant des compétences (dupliqué pour une boucle sans couture)
const words = [...new Set(skills.flatMap((g) => g.items))];
const run = words.map((w) => `<span>${w}</span><i>✦</i>`).join("");
$("#marquee").innerHTML = run + run;

// Nom en grand : les lettres se décodent comme un signal reçu
function scramble(el, delay) {
  const final = el.textContent, glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";
  if (reduceMotion) return;
  let frame = 0;
  setTimeout(() => {
    const id = setInterval(() => {
      frame++;
      el.innerHTML = final.split("").map((ch, i) => i < frame / 3 ? ch : `<span class="sc">${glyphs[Math.random() * glyphs.length | 0]}</span>`).join("");
      if (frame / 3 >= final.length) { clearInterval(id); el.textContent = final; }
    }, 40);
  }, delay);
}
document.querySelectorAll("[data-scramble]").forEach((el, i) => scramble(el, 200 + i * 260));

// Lumière et parallaxe qui suivent le curseur
landingEl.addEventListener("pointermove", (e) => {
  landingEl.style.setProperty("--mx", e.clientX + "px");
  landingEl.style.setProperty("--my", e.clientY + "px");
  const g = $(".giant");
  g.style.setProperty("--px", ((e.clientX / innerWidth - 0.5) * -18).toFixed(1) + "px");
  g.style.setProperty("--py", ((e.clientY / innerHeight - 0.5) * -10).toFixed(1) + "px");
});

function landingInset() {
  if (!universe) return;
  universe.setInset(mq.matches || innerWidth <= 860 ? 0 : -innerWidth * 0.2, 0);
}

function enter(next) {
  if (!onLanding) return;
  onLanding = false;
  landingEl.classList.add("done");
  landingEl.setAttribute("aria-hidden", "true");
  landingEl.inert = true;
  document.body.classList.add("ready");
  hint.classList.remove("gone");
  universe?.setInset(0, 0);
  sound.whoosh();
  const [type, id] = (next || "").split(":");
  if (type === "project") open("project", id);
  else if (type === "contact") open("contact");
  else { universe?.intro(); dismissHintSoon(); }
  setTimeout(() => $("#hud-list button")?.focus({ preventScroll: true }), 900);
}

function goHome() {
  if (onLanding) return;
  onLanding = true;
  panel.classList.remove("open");
  document.body.classList.remove("focused", "ready");
  current = null; markCurrent(null);
  setTimeout(() => { if (!current) panel.hidden = true; }, 450);
  hoverLabel.classList.remove("on");
  landingEl.inert = false;
  landingEl.removeAttribute("aria-hidden");
  landingEl.classList.remove("done");
  landingEl.scrollTop = 0;
  universe?.landing();
  landingInset();
  setTimeout(() => enterBtn.focus({ preventScroll: true }), 300);
  live.textContent = "Retour à la page d’accueil";
}

enterBtn.addEventListener("click", () => enter());
$("#home-btn").addEventListener("click", goHome);
landingEl.addEventListener("click", (e) => { const t = e.target.closest("[data-enter]"); if (t) { e.stopPropagation(); enter(t.dataset.enter); } });
document.addEventListener("keydown", (e) => { if (onLanding && e.key === "Enter" && !e.target.closest("button, a")) enter(); }, true);
addEventListener("resize", () => { if (onLanding) landingInset(); });

// Démarrage : le système tourne au loin derrière la page d'accueil
universe?.landing(true);
landingInset();
setTimeout(() => {
  $("#boot-state").textContent = universe ? "système prêt" : "mode liste";
  enterBtn.disabled = false;
  if (!universe) enterBtn.querySelector("span:nth-child(2)").textContent = "Voir mes projets";
}, reduceMotion ? 100 : 900);

if (sound.on) { /* le son reprend au premier geste, les navigateurs bloquant l'audio automatique */
  addEventListener("pointerdown", (e) => { if (!e.target.closest("#sound-btn")) sound.set(true); }, { once: true });
}
