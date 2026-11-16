/* Textures procédurales : aucune image à charger, tout est généré au démarrage. */

function hash(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function makeNoise(seed = 1) {
  const rnd = hash(seed);
  const p = new Uint8Array(512);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const vals = new Float32Array(256).map(() => rnd());
  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const v = (x, y, z) => vals[p[p[p[x & 255] + (y & 255)] + (z & 255)]];
  function noise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    const x0 = lerp(v(xi, yi, zi), v(xi + 1, yi, zi), xf), x1 = lerp(v(xi, yi + 1, zi), v(xi + 1, yi + 1, zi), xf);
    const x2 = lerp(v(xi, yi, zi + 1), v(xi + 1, yi, zi + 1), xf), x3 = lerp(v(xi, yi + 1, zi + 1), v(xi + 1, yi + 1, zi + 1), xf);
    return lerp(lerp(x0, x1, yf), lerp(x2, x3, yf), zf);
  }
  return function fbm(x, y, z, oct = 5) {
    let a = 0.5, f = 1, s = 0, n = 0;
    for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03; }
    return s / n;
  };
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function ramp(stops, t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i], k = (t - t0) / (t1 - t0 || 1);
      return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
    }
  }
  return stops[stops.length - 1][1];
}

/* Retourne { map, bump } : deux canvas équirectangulaires sans couture. */
export function planetTexture(type, colors, seed, W = 512) {
  const H = W / 2;
  const fbm = makeNoise(seed);
  const c = colors.map(hex);
  const map = document.createElement("canvas"), bump = document.createElement("canvas");
  map.width = bump.width = W; map.height = bump.height = H;
  const mc = map.getContext("2d"), bc = bump.getContext("2d");
  const md = mc.createImageData(W, H), bd = bc.createImageData(W, H);

  for (let y = 0; y < H; y++) {
    const lat = (y / H) * Math.PI, sl = Math.sin(lat), cl = Math.cos(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      const nx = sl * Math.cos(lon), ny = cl, nz = sl * Math.sin(lon);
      let col, h;
      if (type === "gas") {
        const warp = fbm(nx * 2, ny * 2, nz * 2, 4);
        const band = Math.sin(ny * 14 + warp * 6) * 0.5 + 0.5;
        const fine = fbm(nx * 6, ny * 30, nz * 6, 3);
        h = band * 0.7 + fine * 0.3;
        col = ramp([[0, c[0]], [0.35, c[1]], [0.7, c[2]], [1, c[3]]], h);
        const storm = Math.exp(-(((ny + 0.35) ** 2) * 220 + ((lon - 2.2) ** 2) * 18));
        col = col.map((v, i) => v + (c[3][i] - v) * storm * 0.7);
      } else if (type === "lava") {
        const n = fbm(nx * 3, ny * 3, nz * 3, 6);
        const cracks = 1 - Math.abs(fbm(nx * 5 + 9, ny * 5, nz * 5, 4) * 2 - 1);
        const hot = Math.pow(Math.max(0, cracks - 0.72) / 0.28, 1.6);
        h = n;
        col = ramp([[0, c[0]], [0.55, c[1]], [1, [60, 30, 25]]], n);
        col = col.map((v, i) => v + (ramp([[0, c[2]], [1, c[3]]], hot)[i] - v) * Math.min(1, hot * 1.4));
      } else if (type === "ice") {
        const n = fbm(nx * 3, ny * 3, nz * 3, 6);
        const vein = 1 - Math.abs(fbm(nx * 8, ny * 8, nz * 8, 3) * 2 - 1);
        h = n;
        col = ramp([[0, c[1]], [0.45, c[2]], [1, c[3]]], n + Math.abs(ny) * 0.4);
        if (vein > 0.9) col = col.map((v, i) => v * 0.6 + c[0][i] * 0.4);
      } else if (type === "desert") {
        const n = fbm(nx * 2.5, ny * 2.5, nz * 2.5, 6);
        const dunes = Math.sin((ny * 40) + fbm(nx * 4, ny * 4, nz * 4, 3) * 18) * 0.5 + 0.5;
        h = n * 0.8 + dunes * 0.2;
        col = ramp([[0, c[0]], [0.4, c[1]], [0.7, c[2]], [1, c[3]]], h);
        const cap = Math.max(0, Math.abs(ny) - 0.86) / 0.14;
        col = col.map((v, i) => v + (255 - v) * Math.min(1, cap * 2));
      } else { // terran
        const n = fbm(nx * 2.2, ny * 2.2, nz * 2.2, 6);
        h = n;
        const sea = 0.52;
        if (n < sea) col = ramp([[0, c[0]], [1, c[1]]], n / sea);
        else col = ramp([[0, c[2]], [0.6, [70, 120, 90]], [1, [230, 230, 220]]], (n - sea) / (1 - sea));
        const cloud = fbm(nx * 4 + 3, ny * 6, nz * 4, 5);
        const cl2 = Math.max(0, cloud - 0.55) * 2.6;
        col = col.map((v, i) => v + (c[3][i] - v) * Math.min(0.85, cl2));
        const cap = Math.max(0, Math.abs(ny) - 0.88) / 0.12;
        col = col.map((v) => v + (250 - v) * Math.min(1, cap * 2));
      }
      const o = (y * W + x) * 4;
      md.data[o] = col[0]; md.data[o + 1] = col[1]; md.data[o + 2] = col[2]; md.data[o + 3] = 255;
      const b = Math.round(h * 255);
      bd.data[o] = bd.data[o + 1] = bd.data[o + 2] = b; bd.data[o + 3] = 255;
    }
  }
  mc.putImageData(md, 0, 0); bc.putImageData(bd, 0, 0);
  return { map, bump };
}

export function moonTexture(seed, tint = [180, 180, 190], W = 128) {
  const H = W / 2, fbm = makeNoise(seed);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), d = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lat = (y / H) * Math.PI, lon = (x / W) * Math.PI * 2;
    const n = fbm(Math.sin(lat) * Math.cos(lon) * 4, Math.cos(lat) * 4, Math.sin(lat) * Math.sin(lon) * 4, 5);
    const k = 0.45 + n * 0.75, o = (y * W + x) * 4;
    d.data[o] = tint[0] * k; d.data[o + 1] = tint[1] * k; d.data[o + 2] = tint[2] * k; d.data[o + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);
  return cv;
}

export function ringTexture(colors, seed) {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 8;
  const ctx = cv.getContext("2d"), rnd = hash(seed), c = colors.map(hex);
  for (let x = 0; x < 512; x++) {
    const t = x / 512;
    const a = (0.25 + rnd() * 0.55) * Math.sin(t * Math.PI) * (Math.sin(t * 60) > -0.7 ? 1 : 0.15);
    const col = ramp([[0, c[1]], [0.5, c[2]], [1, c[3]]], t);
    ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a.toFixed(3)})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  return cv;
}

export function glowTexture(inner = "rgba(255,255,255,1)", mid = "rgba(255,180,80,.35)") {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const ctx = cv.getContext("2d"), g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.18, mid); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return cv;
}

/* Couche de nuages (alpha) pour les planètes telluriques */
export function cloudTexture(seed, W = 512) {
  const H = W / 2, fbm = makeNoise(seed + 991);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), d = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const lat = (y / H) * Math.PI, sl = Math.sin(lat), cl = Math.cos(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      const n = fbm(sl * Math.cos(lon) * 3 + 5, cl * 5, sl * Math.sin(lon) * 3, 5);
      const a = Math.max(0, n - 0.5) * 3.2, o = (y * W + x) * 4;
      d.data[o] = d.data[o + 1] = d.data[o + 2] = 255; d.data[o + 3] = Math.min(230, a * 255);
    }
  }
  ctx.putImageData(d, 0, 0);
  return cv;
}

/* Rayons lumineux pour la couronne du Soleil */
export function raysTexture(seed = 3) {
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const ctx = cv.getContext("2d"), rnd = hash(seed);
  ctx.translate(S / 2, S / 2); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, len = S * (0.22 + rnd() * 0.28), w = 0.6 + rnd() * 3.5;
    const g = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
    g.addColorStop(0, `rgba(255,${190 + rnd() * 60 | 0},${120 + rnd() * 80 | 0},${0.1 + rnd() * 0.18})`); g.addColorStop(1, "rgba(255,160,80,0)");
    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); ctx.stroke();
  }
  return cv;
}

/* Halo annulaire pour les reflets d'objectif */
export function flareTexture(kind = "ring", rgb = [127, 231, 255]) {
  const S = 128, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const ctx = cv.getContext("2d"), g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64), c = rgb.join(",");
  if (kind === "ring") { g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.72, `rgba(${c},0)`); g.addColorStop(0.86, `rgba(${c},.35)`); g.addColorStop(1, `rgba(${c},0)`); }
  else { g.addColorStop(0, `rgba(${c},.55)`); g.addColorStop(0.5, `rgba(${c},.12)`); g.addColorStop(1, `rgba(${c},0)`); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return cv;
}

export function nebulaTexture(seed, rgb) {
  const S = 256, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const ctx = cv.getContext("2d"), d = ctx.createImageData(S, S), fbm = makeNoise(seed);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x / S - 0.5, dy = y / S - 0.5, r = Math.sqrt(dx * dx + dy * dy) * 2;
    const n = fbm(x / 60, y / 60, seed, 5);
    const a = Math.max(0, n - 0.42) * 2.2 * Math.max(0, 1 - r) ** 1.5;
    const o = (y * S + x) * 4;
    d.data[o] = rgb[0]; d.data[o + 1] = rgb[1]; d.data[o + 2] = rgb[2]; d.data[o + 3] = Math.min(255, a * 255);
  }
  ctx.putImageData(d, 0, 0);
  return cv;
}
