/* Chargement de Three.js : CDN public d'abord (GitHub Pages, tout hébergeur),
   puis CDN de secours. Les autres modules importent THREE depuis ce fichier. */
const SOURCES = [
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "https://unpkg.com/three@0.180.0/build/three.module.js",
  "https://artifactcdn.diabrowser.engineering/ajax/libs/three.js/three.module.js"
];

let THREE = null;
for (const url of SOURCES) {
  try { THREE = await import(url); break; } catch { /* source suivante */ }
}
if (!THREE) throw new Error("Three.js n’a pas pu être chargé.");

export default THREE;
