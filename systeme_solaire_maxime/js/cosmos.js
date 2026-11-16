import THREE from "./three.js";
import { glowTexture, nebulaTexture } from "./textures.js";

/* Arrière-plan profond : galaxies, Voie lactée, comète, pulsar et étoiles
   filantes. Tout est procédural, aucune image à charger. */

const pointsMaterial = (pr) => new THREE.ShaderMaterial({
  uniforms: { uPR: { value: pr } },
  vertexShader: `attribute float size;attribute vec3 tint;uniform float uPR;varying vec3 vC;
    void main(){vC=tint;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*uPR;gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,r);gl_FragColor=vec4(vC,a*a);}`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
});

function makePoints(n, fill, mat) {
  const pos = new Float32Array(n * 3), size = new Float32Array(n), tint = new Float32Array(n * 3);
  const p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { const s = fill(i, p, c); pos.set([p.x, p.y, p.z], i * 3); tint.set([c.r, c.g, c.b], i * 3); size[i] = s; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("size", new THREE.BufferAttribute(size, 1));
  g.setAttribute("tint", new THREE.BufferAttribute(tint, 3));
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
  return pts;
}

/* Disque de galaxie dessiné sur un canvas : bras spiraux, poussière, bulbe. */
function galaxyCanvas({ arms, spin, inner, outer, elliptical }, S = 512) {
  const cv = document.createElement("canvas"); cv.width = cv.height = S;
  const ctx = cv.getContext("2d"), c = S / 2;
  const ci = new THREE.Color(inner), co = new THREE.Color(outer);
  ctx.globalCompositeOperation = "lighter";
  if (elliptical) {
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, "rgba(255,245,230,.9)"); g.addColorStop(0.15, `rgba(${ci.r * 255 | 0},${ci.g * 255 | 0},${ci.b * 255 | 0},.45)`);
    g.addColorStop(0.5, `rgba(${co.r * 255 | 0},${co.g * 255 | 0},${co.b * 255 | 0},.12)`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    return cv;
  }
  const col = new THREE.Color();
  for (let i = 0; i < 14000; i++) {
    const r = Math.pow(Math.random(), 1.4) * c * 0.95;
    const branch = ((i % arms) / arms) * Math.PI * 2, sp = r * spin;
    const jitter = Math.pow(Math.random(), 2.5) * (Math.random() < 0.5 ? 1 : -1) * c * 0.22 * (0.4 + r / c);
    const a = branch + sp + jitter / (r + 30);
    const x = c + Math.cos(a) * r + (Math.random() - 0.5) * 6, y = c + Math.sin(a) * r + (Math.random() - 0.5) * 6;
    col.copy(ci).lerp(co, Math.min(1, r / c * 1.3));
    const s = Math.random() < 0.02 ? 2.2 : 1 + Math.random();
    ctx.fillStyle = `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},${0.12 + Math.random() * 0.18})`;
    ctx.fillRect(x, y, s, s);
  }
  // halo diffus et bulbe lumineux
  let g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, `rgba(${co.r * 255 | 0},${co.g * 255 | 0},${co.b * 255 | 0},.16)`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.28);
  g.addColorStop(0, "rgba(255,248,235,.95)"); g.addColorStop(0.35, `rgba(${ci.r * 255 | 0},${ci.g * 255 | 0},${ci.b * 255 | 0},.5)`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return cv;
}

const PALETTES = [
  ["#ffe6c4", "#6fd8ff"], ["#ffd0f0", "#9a6bff"], ["#fff3d6", "#ff8fb8"], ["#e8f4ff", "#5f8bff"],
  ["#fff0c8", "#ffb36b"], ["#e0ffff", "#5fe0c0"], ["#ffe0ff", "#c06bff"], ["#ffffff", "#7fb0ff"],
  ["#ffe8d8", "#ff6b9a"], ["#f0e8ff", "#8a7bff"]
];

export function createCosmos(scene, { quality, pixelRatio }) {
  const mat = pointsMaterial(pixelRatio);
  const k = [0.35, 0.6, 1][quality];
  const texSize = quality === 2 ? 512 : 256;

  /* --- Galaxies : un anneau autour du système, visible depuis la vue globale --- */
  const galaxies = [];
  const nGal = quality === 0 ? 6 : 10;
  for (let i = 0; i < nGal; i++) {
    const [inner, outer] = PALETTES[i % PALETTES.length];
    const elliptical = i % 4 === 3;
    const arms = 2 + (i % 3), spin = (0.012 + (i % 4) * 0.004) * (512 / texSize);
    const size = 380 + ((i * 97) % 5) * 70;
    const tex = new THREE.CanvasTexture(galaxyCanvas({ arms, spin: 0.018 + (i % 4) * 0.006, inner, outer, elliptical }, texSize));
    tex.colorSpace = THREE.SRGBColorSpace;
    const group = new THREE.Group();
    const disk = new THREE.Mesh(new THREE.PlaneGeometry(size, elliptical ? size * 0.6 : size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: elliptical ? 0.55 : 0.85 }));
    group.add(disk);
    // étoiles scintillantes par-dessus le disque
    if (!elliptical) {
      const ci = new THREE.Color(inner), co = new THREE.Color(outer);
      group.add(makePoints(Math.round(900 * k), (j, p, c) => {
        const r = Math.pow(Math.random(), 1.3) * size * 0.45, a = ((j % arms) / arms) * Math.PI * 2 + r * (0.018 + (i % 4) * 0.006) * (512 / size) * 1.0 + (Math.random() - 0.5) * 0.5;
        p.set(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 6);
        c.copy(ci).lerp(co, r / (size * 0.45));
        return 1 + Math.random() * 1.8;
      }, mat));
    }
    const ang = (i / nGal) * Math.PI * 2 + 0.3, R = 1150 + ((i * 53) % 4) * 140;
    group.position.set(Math.cos(ang) * R, -120 - ((i * 211) % 7) * 120, Math.sin(ang) * R);
    group.lookAt(0, 200, 0);
    group.rotateX(-0.6 - (i % 3) * 0.25);
    group.rotateY((i % 2 ? 1 : -1) * 0.4);
    disk.userData.speed = (i % 2 ? 1 : -1) * (0.01 + (i % 3) * 0.004);
    group.userData.disk = disk;
    scene.add(group); galaxies.push(group);
  }

  /* --- Voie lactée --- */
  const band = new THREE.Group(); band.rotation.set(0.5, 0, 0.35); scene.add(band);
  const warm = new THREE.Color("#ffe8d0"), cool = new THREE.Color("#a9c8ff"), vio = new THREE.Color("#c3a6ff");
  band.add(makePoints(Math.round(14000 * k), (i, p, c) => {
    const a = Math.random() * Math.PI * 2, R = 2800;
    const lat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.16 * (1 + Math.sin(a * 2) * 0.35);
    p.set(Math.cos(a) * Math.cos(lat) * R, Math.sin(lat) * R, Math.sin(a) * Math.cos(lat) * R);
    const t = Math.random(); c.copy(t < 0.5 ? warm : t < 0.85 ? cool : vio).multiplyScalar(0.55 + Math.random() * 0.45);
    return 0.8 + Math.random() * 1.4;
  }, mat));
  const nebCols = [[110, 70, 220], [40, 140, 210], [190, 70, 160], [80, 110, 230], [230, 130, 90]];
  for (let i = 0; i < (quality ? 12 : 6); i++) {
    const a = (i / 12) * Math.PI * 2 + Math.random() * 0.3, R = 2600;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nebulaTexture(40 + i * 7, nebCols[i % nebCols.length])), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(Math.cos(a) * R, (Math.random() - 0.5) * 220, Math.sin(a) * R);
    sp.scale.set(1500 + Math.random() * 900, 750 + Math.random() * 400, 1);
    band.add(sp);
  }

  /* --- Comète sur une orbite très elliptique --- */
  const cometPlane = new THREE.Group(); cometPlane.rotation.set(0.28, 0.9, 0.12); scene.add(cometPlane);
  const comet = { a: 112, e: 0.7, th: 2.6 };
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowTexture("rgba(255,255,255,1)", "rgba(127,231,255,.45)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  head.scale.setScalar(9); cometPlane.add(head);
  const TAIL = 220;
  const tail = makePoints(TAIL, (i, p, c) => { p.set(0, 0, 0); c.set(0, 0, 0); return 0; }, mat);
  scene.add(tail);
  const cometWorld = new THREE.Vector3(), away = new THREE.Vector3(), side = new THREE.Vector3();
  const tailJitter = Array.from({ length: TAIL }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]);

  /* --- Pulsar : deux faisceaux qui balaient l'espace --- */
  const pulsar = new THREE.Group(); pulsar.position.set(-620, 160, 820); scene.add(pulsar);
  const pCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowTexture("rgba(230,250,255,1)", "rgba(140,170,255,.5)")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pCore.scale.setScalar(50); pulsar.add(pCore);
  const spinner = new THREE.Group(); spinner.rotation.z = 0.5; pulsar.add(spinner);
  const beamMat = new THREE.MeshBasicMaterial({ color: "#9fd8ff", transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  [1, -1].forEach((s) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(70, 700, 24, 1, true), beamMat);
    cone.position.y = s * 350; cone.rotation.x = s > 0 ? Math.PI : 0;
    spinner.add(cone);
  });

  /* --- Étoiles filantes : lancées dans le champ de la caméra --- */
  const shooters = Array.from({ length: 4 }, () => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array([1, 1, 1, 0, 0, 0]), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    l.frustumCulled = false; l.userData = { life: 0, max: 1, head: new THREE.Vector3(), vel: new THREE.Vector3() }; scene.add(l); return l;
  });
  let nextShot = 1.5;
  const v = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();

  function update(dt, t, camera) {
    galaxies.forEach((g) => { g.userData.disk.rotation.z += g.userData.disk.userData.speed * dt; });
    band.rotation.y += dt * 0.0012;

    // Comète : vitesse plus grande près du Soleil (loi des aires)
    const r = comet.a * (1 - comet.e * comet.e) / (1 + comet.e * Math.cos(comet.th));
    comet.th += (1100 / (r * r)) * dt;
    head.position.set(Math.cos(comet.th) * r, 0, Math.sin(comet.th) * r);
    head.getWorldPosition(cometWorld);
    away.copy(cometWorld).normalize();
    side.set(-Math.sin(comet.th), 0, Math.cos(comet.th)).applyEuler(cometPlane.rotation);
    const L = THREE.MathUtils.clamp(2600 / r, 14, 95);
    head.scale.setScalar(THREE.MathUtils.clamp(260 / r, 4, 11));
    const pa = tail.geometry.attributes.position.array, ta = tail.geometry.attributes.tint.array, sa = tail.geometry.attributes.size.array;
    for (let i = 0; i < TAIL; i++) {
      const f = i / TAIL, j = tailJitter[i];
      v.copy(cometWorld).addScaledVector(away, L * f).addScaledVector(side, -L * 0.25 * f * f);
      v.x += j[0] * f * 6; v.y += j[1] * f * 6; v.z += j[2] * f * 6;
      pa[i * 3] = v.x; pa[i * 3 + 1] = v.y; pa[i * 3 + 2] = v.z;
      const fade = (1 - f) ** 1.6 * (0.6 + 0.4 * Math.sin(t * 6 + i));
      ta[i * 3] = 0.6 * fade; ta[i * 3 + 1] = 0.9 * fade; ta[i * 3 + 2] = 1 * fade;
      sa[i] = 1.5 + (1 - f) * 3.5;
    }
    tail.geometry.attributes.position.needsUpdate = tail.geometry.attributes.tint.needsUpdate = tail.geometry.attributes.size.needsUpdate = true;

    // Pulsar
    spinner.rotation.y += dt * 2.2;
    const pulse = 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(t * 4.4)), 8);
    pCore.scale.setScalar(40 + pulse * 40); beamMat.opacity = 0.04 + pulse * 0.06;

    // Étoiles filantes
    nextShot -= dt;
    if (nextShot <= 0) {
      nextShot = 1.8 + Math.random() * 3.5;
      const s = shooters.find((x) => x.userData.life <= 0);
      if (s) {
        camera.getWorldDirection(fwd);
        right.crossVectors(fwd, camera.up).normalize(); up.crossVectors(right, fwd).normalize();
        const dist = 500 + Math.random() * 600;
        s.userData.head.copy(camera.position).addScaledVector(fwd, dist)
          .addScaledVector(right, (Math.random() - 0.5) * dist * 0.9)
          .addScaledVector(up, (0.1 + Math.random() * 0.35) * dist);
        const dir = Math.random() < 0.5 ? 1 : -1;
        s.userData.vel.copy(right).multiplyScalar(dir).addScaledVector(up, -0.45 - Math.random() * 0.3).normalize().multiplyScalar(dist * (0.9 + Math.random() * 0.6));
        s.userData.life = s.userData.max = 0.7 + Math.random() * 0.6;
      }
    }
    shooters.forEach((s) => {
      const u = s.userData;
      if (u.life <= 0) { s.material.opacity = 0; return; }
      u.life -= dt; u.head.addScaledVector(u.vel, dt);
      const tl = v.copy(u.head).addScaledVector(u.vel, -0.16);
      const a = s.geometry.attributes.position.array;
      a[0] = u.head.x; a[1] = u.head.y; a[2] = u.head.z; a[3] = tl.x; a[4] = tl.y; a[5] = tl.z;
      s.geometry.attributes.position.needsUpdate = true;
      s.material.opacity = Math.sin((1 - u.life / u.max) * Math.PI);
    });
  }

  return { update, setPixelRatio: (pr) => (mat.uniforms.uPR.value = pr) };
}
