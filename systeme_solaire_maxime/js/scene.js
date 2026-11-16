import THREE from "./three.js";
import { planetTexture, moonTexture, ringTexture, glowTexture, nebulaTexture, cloudTexture } from "./textures.js";
import { createCosmos } from "./cosmos.js";

const SUN_RADIUS = 7;
const MOON_TINTS = [[190, 220, 255], [210, 190, 255], [255, 210, 190], [200, 255, 220], [230, 230, 230]];
const ease = (k) => (k < 0.5 ? 16 * k ** 5 : 1 - (-2 * k + 2) ** 5 / 2);
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));

/* ---------------- Shaders ---------------- */
const NOISE = `
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}`;

const sunMaterial = () => new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uBoost: { value: 1 } },
  vertexShader: `varying vec3 vPos;varying vec3 vN;varying vec3 vV;
    void main(){vPos=position;vN=normalMatrix*normal;vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `uniform float uTime;uniform float uBoost;varying vec3 vPos;varying vec3 vN;varying vec3 vV;${NOISE}
    void main(){vec3 p=normalize(vPos)*3.2;
      float n=fbm(p+vec3(uTime*.04,0.,uTime*.03));
      float n2=fbm(p*2.2-vec3(0.,uTime*.07,0.)+n*1.6);
      float t=n*.55+n2*.45;
      vec3 col=mix(vec3(.75,.16,.02),vec3(1.,.62,.16),smoothstep(.32,.62,t));
      col=mix(col,vec3(1.,.96,.82),smoothstep(.6,.82,t));
      float fres=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),2.2);
      col+=vec3(1.,.55,.18)*fres*.9;
      gl_FragColor=vec4(col*uBoost,1.);}`
});

const atmosphereMaterial = (color, power = 1) => new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color(color) }, uPower: { value: power } },
  vertexShader: `varying vec3 vWN;varying vec3 vWP;
    void main(){vWN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
  fragmentShader: `uniform vec3 uColor;uniform float uPower;varying vec3 vWN;varying vec3 vWP;
    void main(){vec3 v=normalize(cameraPosition-vWP);vec3 s=normalize(-vWP);
      float f=pow(1.-max(dot(vWN,v),0.),3.);float lit=clamp(dot(vWN,s)*.6+.55,0.,1.);
      gl_FragColor=vec4(uColor*f*lit*uPower*1.6,f*lit);}`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
});

const starMaterial = (pr) => new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uPR: { value: pr } },
  vertexShader: `attribute float size;attribute float phase;attribute vec3 tint;uniform float uTime;uniform float uPR;varying vec3 vC;varying float vA;
    void main(){vC=tint;vA=.55+.45*sin(uTime*(.6+phase*.8)+phase*40.);vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*uPR;gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `varying vec3 vC;varying float vA;
    void main(){vec2 d=gl_PointCoord-.5;float r=length(d);float a=smoothstep(.5,0.,r);a=a*a;gl_FragColor=vec4(vC,a*vA);}`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
});

/* ---------------- Univers ---------------- */
export function createUniverse(container, opts) {
  const { projects, isMobile, lowPower } = opts;
  const quality = lowPower ? 0 : isMobile ? 1 : 2;

  const renderer = new THREE.WebGLRenderer({ antialias: quality > 0, powerPreference: "high-performance" });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, quality === 2 ? 2 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#02030a");
  const camera = new THREE.PerspectiveCamera(isMobile ? 55 : 45, 1, 0.1, 6000);
  const baseFov = camera.fov;

  scene.add(new THREE.AmbientLight(0x3a4a7a, 0.35));
  const sunLight = new THREE.PointLight(0xfff0d8, 3.2, 0, 0);
  scene.add(sunLight);

  const bodies = [];      // tout ce qui est sélectionnable
  const pickables = [];   // sphères de détection (plus larges que les objets)
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  const addHit = (parent, r, body) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), hitMat);
    m.userData.body = body; parent.add(m); pickables.push(m); return m;
  };

  /* --- Soleil --- */
  const sunGroup = new THREE.Group(); scene.add(sunGroup);
  const sunMat = sunMaterial();
  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 64, 48), sunMat);
  sunGroup.add(sun);
  // Couronne : un plan face caméra, rayons en bruit animé (stable, sans sprites qui sautent)
  const coronaMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 1 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime;uniform float uBoost;varying vec2 vUv;${NOISE}
      void main(){vec2 p=vUv*2.-1.;float r=length(p);float a=atan(p.y,p.x);
        float d=max(r-.175,0.);
        float n=fbm(vec3(cos(a)*3.,sin(a)*3.,uTime*.12));
        float n2=fbm(vec3(cos(a)*9.,sin(a)*9.,uTime*.25+4.));
        float streak=pow(smoothstep(.35,.85,n*.7+n2*.3),1.5)*exp(-d*4.2);
        float glow=exp(-d*9.)*.9+exp(-d*2.6)*.18;
        float edge=smoothstep(1.,.7,r);
        vec3 col=vec3(1.,.55,.2)*glow+vec3(1.,.78,.45)*streak*.8;
        gl_FragColor=vec4(col*edge*uBoost,1.);}`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const corona = new THREE.Mesh(new THREE.PlaneGeometry(SUN_RADIUS / 0.175 * 2, SUN_RADIUS / 0.175 * 2), coronaMat);
  sunGroup.add(corona);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowTexture("rgba(255,170,90,.5)", "rgba(140,90,255,.08)")), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
  halo.scale.setScalar(SUN_RADIUS * 18); sunGroup.add(halo);
  const sunBody = { id: "sun", kind: "sun", name: "Maxime Joppin", sub: "Profil · cliquez pour ouvrir", color: "#ffb347", radius: SUN_RADIUS, object: sunGroup, hover: 0 };
  addHit(sunGroup, SUN_RADIUS * 1.15, sunBody);
  bodies.push(sunBody);

  /* --- Planètes --- */
  const texSize = quality === 2 ? 512 : 256;
  const planetBodies = [];
  projects.forEach((p, idx) => {
    const cfg = p.planet;
    const seed = 101 + idx * 37;
    const { map, bump } = planetTexture(cfg.type, cfg.colors, seed, texSize);
    const mapTex = new THREE.CanvasTexture(map); mapTex.colorSpace = THREE.SRGBColorSpace; mapTex.anisotropy = 4;
    const bumpTex = new THREE.CanvasTexture(bump);
    const mat = new THREE.MeshStandardMaterial({
      map: mapTex, bumpMap: bumpTex, bumpScale: cfg.type === "gas" ? 0.6 : 2.2,
      roughness: cfg.type === "ice" ? 0.55 : 0.92, metalness: 0,
      emissive: new THREE.Color(cfg.type === "lava" ? "#ff4a10" : "#000000"),
      emissiveMap: cfg.type === "lava" ? mapTex : null, emissiveIntensity: cfg.type === "lava" ? 0.55 : 0
    });
    const group = new THREE.Group();
    const tiltGroup = new THREE.Group(); tiltGroup.rotation.z = cfg.tilt; group.add(tiltGroup);
    const seg = quality === 2 ? 64 : 40;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, seg, seg * 0.75), mat);
    tiltGroup.add(mesh);
    let clouds = null;
    if (cfg.clouds && quality > 0) {
      const ct = new THREE.CanvasTexture(cloudTexture(seed, texSize)); ct.colorSpace = THREE.SRGBColorSpace;
      clouds = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 1.025, seg, seg * 0.75), new THREE.MeshStandardMaterial({ map: ct, transparent: true, depthWrite: false, roughness: 1 }));
      tiltGroup.add(clouds);
    }
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 1.12, 40, 30), atmosphereMaterial(cfg.colors[2], 0.9));
    group.add(atmo);

    if (cfg.rings) {
      const inner = cfg.radius * 1.45, outer = cfg.radius * 2.35;
      const rg = new THREE.RingGeometry(inner, outer, 128, 1);
      const pos = rg.attributes.position, uv = rg.attributes.uv, v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5); }
      const rt = new THREE.CanvasTexture(ringTexture(cfg.colors, seed)); rt.colorSpace = THREE.SRGBColorSpace;
      const ring = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: rt, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 1 }));
      ring.rotation.x = -Math.PI / 2 + 0.12;
      tiltGroup.add(ring);
    }

    const body = {
      id: p.id, kind: "planet", name: p.name, sub: p.category, color: cfg.colors[2], data: p,
      radius: cfg.radius, orbit: cfg.orbit, speed: cfg.speed, angle: idx * 1.7 + 0.6, incl: 0.03 + (idx % 3) * 0.018,
      object: group, mesh, clouds, atmo, moons: [], hover: 0, spin: 0.12 + (idx % 3) * 0.06
    };
    addHit(group, Math.max(cfg.radius * 1.5, 2.2), body);

    // Satellites : une lune par technologie
    p.stack.forEach((t, i) => {
      const mr = 0.22 + (i % 3) * 0.07;
      const moonTex = new THREE.CanvasTexture(moonTexture(seed + i * 13, MOON_TINTS[i % MOON_TINTS.length]));
      moonTex.colorSpace = THREE.SRGBColorSpace;
      const pivot = new THREE.Group();
      pivot.rotation.x = 0.25 + i * 0.35; pivot.rotation.z = i * 0.6;
      const moon = new THREE.Mesh(new THREE.SphereGeometry(mr, 20, 14), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 1 }));
      const dist = cfg.radius * (cfg.rings ? 2.7 : 1.75) + i * 0.75;
      moon.position.x = dist; pivot.add(moon); group.add(pivot);
      const mb = { id: `${p.id}:${t}`, kind: "moon", name: t, sub: `Satellite de ${p.name}`, color: "#cfe9ff", radius: mr, object: moon, parent: body, tech: t, pivot, speed: 0.5 - i * 0.07, hover: 0 };
      addHit(moon, 0.9, mb);
      body.moons.push(mb); bodies.push(mb);
    });

    scene.add(group);
    bodies.push(body); planetBodies.push(body);
  });

  const orbitPos = (b, a, out = new THREE.Vector3()) => out.set(Math.cos(a) * b.orbit, Math.sin(a) * b.orbit * b.incl, Math.sin(a) * b.orbit);

  /* --- Orbites --- */
  planetBodies.forEach((b) => {
    const pts = []; for (let i = 0; i <= 256; i++) pts.push(orbitPos(b, (i / 256) * Math.PI * 2));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color("#7fa8ff"), transparent: true, opacity: 0.16, depthWrite: false });
    b.orbitLine = new THREE.Line(geo, mat); scene.add(b.orbitLine);
    // Marqueurs de graduation, façon carte de navigation
    const ticks = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; const p = orbitPos(b, a); const n = p.clone().setY(0).normalize().multiplyScalar(0.5); ticks.push(p.clone().sub(n), p.clone().add(n)); }
    const tk = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks), new THREE.LineBasicMaterial({ color: "#7fa8ff", transparent: true, opacity: 0.1, depthWrite: false }));
    b.orbitTicks = tk; scene.add(tk);
    // Traînée lumineuse derrière la planète
    const tn = 48, tg = new THREE.BufferGeometry(), tc = new Float32Array(tn * 3), col = new THREE.Color(b.color);
    for (let i = 0; i < tn; i++) { const f = (i / (tn - 1)) ** 2 * 0.9; tc.set([col.r * f, col.g * f, col.b * f], i * 3); }
    tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tn * 3), 3));
    tg.setAttribute("color", new THREE.BufferAttribute(tc, 3));
    b.trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    b.trail.frustumCulled = false; scene.add(b.trail);
  });

  /* --- Étoiles (3 profondeurs) --- */
  const starLayers = [];
  const starMat = starMaterial(pixelRatio);
  [[quality === 2 ? 2600 : 1200, 900, 1.2], [quality === 2 ? 1200 : 600, 1500, 2.0], [quality === 2 ? 260 : 140, 2200, 3.4]].forEach(([n, R, s], li) => {
    const pos = new Float32Array(n * 3), size = new Float32Array(n), phase = new Float32Array(n), tint = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = R * (0.85 + Math.random() * 0.3), q = Math.sqrt(1 - u * u);
      pos.set([q * Math.cos(th) * r, u * r, q * Math.sin(th) * r], i * 3);
      size[i] = s * (0.5 + Math.random() * 0.9); phase[i] = Math.random();
      const k = Math.random(); tint.set(k < 0.15 ? [0.7, 0.8, 1] : k < 0.25 ? [0.85, 0.75, 1] : k < 0.3 ? [1, 0.85, 0.7] : [1, 1, 1], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("size", new THREE.BufferAttribute(size, 1));
    g.setAttribute("phase", new THREE.BufferAttribute(phase, 1)); g.setAttribute("tint", new THREE.BufferAttribute(tint, 3));
    const pts = new THREE.Points(g, starMat); pts.userData.depth = li; scene.add(pts); starLayers.push(pts);
  });

  /* --- Nébuleuses --- */
  const nebulae = new THREE.Group(); scene.add(nebulae);
  [[[90, 60, 200], [-900, 260, -1200], 1500, 7], [[30, 150, 200], [1200, -300, -500], 1300, 19], [[160, 50, 170], [200, 500, 1400], 1400, 31]].forEach(([rgb, p, s, seed]) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nebulaTexture(seed, rgb)), transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(...p); sp.scale.setScalar(s); nebulae.add(sp);
  });

  /* --- Galaxies, Voie lactée, rayons, reflets, étoiles filantes --- */
  const cosmos = createCosmos(scene, { quality, pixelRatio, sunGroup, sunRadius: SUN_RADIUS });

  /* --- Ceinture d'astéroïdes --- */
  const belt = new THREE.Group(); scene.add(belt);
  const nAst = [260, 600, 1100][quality];
  const ast = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 0), new THREE.MeshStandardMaterial({ color: "#8c8aa0", roughness: 1, flatShading: true }), nAst);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3();
  for (let i = 0; i < nAst; i++) {
    const a = Math.random() * Math.PI * 2, r = 53 + (Math.random() + Math.random()) * 2.2;
    p4.set(Math.cos(a) * r, (Math.random() - 0.5) * 1.4, Math.sin(a) * r);
    e4.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); q4.setFromEuler(e4);
    const sc = 0.4 + Math.random() ** 3 * 2.4; s4.set(sc, sc * (0.6 + Math.random() * 0.6), sc);
    ast.setMatrixAt(i, m4.compose(p4, q4, s4));
  }
  belt.add(ast);

  /* --- Poussière flottante --- */
  const nDust = [300, 700, 1400][quality];
  const dPos = new Float32Array(nDust * 3), dSize = new Float32Array(nDust), dPh = new Float32Array(nDust), dTint = new Float32Array(nDust * 3);
  for (let i = 0; i < nDust; i++) {
    const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 115;
    dPos.set([Math.cos(a) * r, (Math.random() - 0.5) * 14 * (r / 60), Math.sin(a) * r], i * 3);
    dSize[i] = 0.8 + Math.random() * 1.4; dPh[i] = Math.random();
    dTint.set(Math.random() < 0.5 ? [0.5, 0.9, 1] : [0.7, 0.6, 1], i * 3);
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3)); dGeo.setAttribute("size", new THREE.BufferAttribute(dSize, 1));
  dGeo.setAttribute("phase", new THREE.BufferAttribute(dPh, 1)); dGeo.setAttribute("tint", new THREE.BufferAttribute(dTint, 3));
  const dust = new THREE.Points(dGeo, starMat); scene.add(dust);

  /* --- Réticule de ciblage --- */
  const reticle = new THREE.Group();
  const retMat = new THREE.LineBasicMaterial({ color: "#7fe7ff", transparent: true, opacity: 0, depthTest: false });
  const arcs = [];
  for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i <= 16; i++) { const a = k * Math.PI / 2 + 0.25 + (i / 16) * (Math.PI / 2 - 0.5); pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0)); } arcs.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), retMat)); }
  arcs.forEach((a) => reticle.add(a));
  reticle.renderOrder = 10; scene.add(reticle);

  /* ---------------- Caméra ---------------- */
  const cam = { target: new THREE.Vector3(), radius: 600, phi: 0.35, theta: -1.2 };
  const goal = { target: new THREE.Vector3(), radius: 600, phi: 0.35, theta: -1.2 };
  let follow = null, flight = null, timeScale = 1, timeGoal = 1, autoRotate = false;
  const inset = { x: 0, y: 0, gx: 0, gy: 0 };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  const worldPos = (b, out = new THREE.Vector3()) => b.object.getWorldPosition(out);
  const overviewRadius = () => {
    const aspect = Math.max(0.45, Math.min(1.8, renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight)));
    const fit = (Math.max(...projects.map((p) => p.planet.orbit)) + 6) / Math.tan(THREE.MathUtils.degToRad(baseFov / 2));
    return Math.min(640, fit / Math.min(aspect, 1.15) * 0.95);
  };
  const focusRadius = (b) => b.kind === "sun" ? SUN_RADIUS * (isMobile ? 5.2 : 4.4) : b.radius * (b.data.planet.rings ? 7.2 : 6) * (isMobile ? 1.25 : 1);
  const limits = () => ({ min: follow ? follow.radius * 2.2 : 14, max: 800 });

  function flyTo(targetFn, radius, phi = goal.phi, theta = goal.theta, dur = 1.9) {
    const dist = tmp.copy(cam.target).distanceTo(targetFn());
    flight = { t0: performance.now(), dur: dur * 1000, from: { target: cam.target.clone(), radius: cam.radius, phi: cam.phi, theta: cam.theta }, to: { targetFn, radius, phi, theta }, arc: Math.min(0.9, dist / 70) };
    let d = theta - cam.theta; d = Math.atan2(Math.sin(d), Math.cos(d)); flight.to.theta = cam.theta + d;
  }

  function focus(id) {
    const b = bodies.find((x) => x.id === id && x.kind !== "moon");
    if (!b) return;
    follow = b; timeGoal = 0.06; autoRotate = false;
    // On arrive légèrement de côté et au-dessus, côté éclairé
    const p = worldPos(b, tmp2);
    flyTo(() => worldPos(b, new THREE.Vector3()), focusRadius(b), b.kind === "sun" ? 1.2 : 1.25, b.kind === "sun" ? cam.theta : sunFacingTheta(p), 2.1);
  }
  // Caméra placée entre le Soleil et la planète, décalée : la face visible est éclairée
  function sunFacingTheta(p) { return Math.atan2(-p.x, -p.z) + 0.55; }

  function overview(dur = 2.0) {
    follow = null; timeGoal = 1; autoRotate = false;
    flyTo(() => new THREE.Vector3(), overviewRadius(), 1.08, cam.theta + 0.4, dur);
  }

  function intro() {
    autoRotate = false; follow = null; timeGoal = 1;
    flyTo(() => new THREE.Vector3(), overviewRadius(), 1.08, cam.theta + 0.9, 2.8);
  }

  // Plan large et rasant, en rotation lente, derrière la page d'accueil
  function landing(first = false) {
    follow = null; timeGoal = 1; autoRotate = true;
    if (first) { cam.radius = goal.radius = 1100; cam.phi = goal.phi = 0.3; cam.theta = goal.theta = -2.2; }
    flyTo(() => new THREE.Vector3(), overviewRadius() * 1.25, 1.3, cam.theta + 0.6, first ? 4.2 : 2.4);
  }

  function zoom(f) { flight = null; goal.radius = THREE.MathUtils.clamp(goal.radius * f, limits().min, limits().max); }
  function rotate(dx, dy) { flight = null; goal.theta -= dx; goal.phi = THREE.MathUtils.clamp(goal.phi - dy, 0.12, Math.PI - 0.5); }
  function pan(dx, dy) {
    if (follow) return;
    flight = null;
    const s = cam.radius * 0.0016;
    const right = tmp.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    const fwd = tmp2.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    goal.target.addScaledVector(right, -dx * s).addScaledVector(fwd, dy * s);
    goal.target.clampLength(0, 120);
  }

  /* ---------------- Entrées ---------------- */
  const el = renderer.domElement;
  const pointers = new Map();
  let downInfo = null, pinchDist = 0, pinchMid = null, hovered = null;
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function pick(clientX, clientY) {
    const r = el.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const visible = pickables.filter((m) => { const b = m.userData.body; return b.kind !== "moon" || (follow && b.parent === follow); });
    const hits = raycaster.intersectObjects(visible, false);
    if (!hits.length) return null;
    // Priorité aux satellites quand la planète est ciblée
    const moonHit = hits.find((h) => h.object.userData.body.kind === "moon");
    return (moonHit || hits[0]).object.userData.body;
  }

  function setHover(b, x, y) {
    if (b !== hovered) { hovered = b; opts.onHover?.(b); container.classList.toggle("pointing", !!b); }
    if (b) opts.onHoverMove?.(x, y);
  }

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button });
    if (pointers.size === 1) downInfo = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, button: e.button, shift: e.shiftKey };
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchDist = Math.hypot(a.x - b.x, a.y - b.y); pinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; downInfo && (downInfo.moved = 99); }
    opts.onInteract?.();
  });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    const p = pointers.get(e.pointerId);
    if (!p) { if (e.pointerType === "mouse") setHover(pick(e.clientX, e.clientY), e.clientX, e.clientY); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (downInfo) downInfo.moved += Math.abs(dx) + Math.abs(dy);
    if (pointers.size === 1) {
      if (downInfo && downInfo.moved > 5) container.classList.add("dragging");
      if (p.button === 2 || downInfo?.shift) pan(dx, dy); else rotate(dx * 0.005, dy * 0.004);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (pinchDist) zoom(pinchDist / d);
      if (pinchMid) pan(mid.x - pinchMid.x, mid.y - pinchMid.y);
      pinchDist = d; pinchMid = mid;
    }
  });
  const end = (e) => {
    const wasSingle = pointers.size === 1;
    pointers.delete(e.pointerId);
    container.classList.remove("dragging");
    if (pointers.size < 2) { pinchDist = 0; pinchMid = null; }
    if (wasSingle && downInfo && downInfo.moved < 7 && performance.now() - downInfo.t < 600 && downInfo.button === 0) {
      const b = pick(e.clientX, e.clientY);
      opts.onPick?.(b);
    }
    if (pointers.size === 0) downInfo = null;
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", (e) => { pointers.delete(e.pointerId); downInfo = null; container.classList.remove("dragging"); });
  el.addEventListener("pointerleave", () => { if (!pointers.size) setHover(null); });
  el.addEventListener("contextmenu", (e) => e.preventDefault());
  el.addEventListener("wheel", (e) => { e.preventDefault(); zoom(Math.exp(e.deltaY * 0.0012)); opts.onInteract?.(); }, { passive: false });

  /* ---------------- Étiquettes ---------------- */
  const labelsEl = document.getElementById("labels");
  bodies.forEach((b) => {
    if (b.kind === "sun") return;
    const t = document.createElement("div"); t.className = "tag"; t.textContent = b.name;
    if (b.kind === "planet") t.style.color = b.color;
    labelsEl.appendChild(t); b.tag = t;
  });

  /* ---------------- Boucle ---------------- */
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px";
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!follow && !flight) goal.radius = Math.min(goal.radius, limits().max);
  }
  new ResizeObserver(resize).observe(container); resize();

  const clock = new THREE.Clock();
  let elapsed = 0, fpsAcc = 0, fpsN = 0, adapted = false;
  const proj = new THREE.Vector3(), trailV = new THREE.Vector3();

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    timeScale = damp(timeScale, timeGoal, 2.2, dt);

    // Adaptation automatique : si la machine peine, on réduit la résolution
    if (!adapted && elapsed > 2 && elapsed < 6) { fpsAcc += dt; fpsN++; if (fpsN > 90) { adapted = true; if (fpsN / fpsAcc < 40 && pixelRatio > 1) { pixelRatio = 1; renderer.setPixelRatio(1); starMat.uniforms.uPR.value = 1; cosmos.setPixelRatio(1); resize(); } } }

    sunMat.uniforms.uTime.value = elapsed; starMat.uniforms.uTime.value = elapsed;
    sun.rotation.y += dt * 0.03;
    const sunHover = sunBody.hover = damp(sunBody.hover, hovered === sunBody ? 1 : 0, 8, dt);
    sunMat.uniforms.uBoost.value = 1 + sunHover * 0.18 + Math.sin(elapsed * 1.3) * 0.03;
    coronaMat.uniforms.uTime.value = elapsed;
    coronaMat.uniforms.uBoost.value = 1 + sunHover * 0.35;
    corona.quaternion.copy(camera.quaternion);

    planetBodies.forEach((b) => {
      b.angle += b.speed * dt * timeScale;
      orbitPos(b, b.angle, b.object.position);
      const ta = b.trail.geometry.attributes.position.array, span = 20 / b.orbit, tn = ta.length / 3;
      for (let i = 0; i < tn; i++) { orbitPos(b, b.angle - span * (1 - i / (tn - 1)), trailV); ta[i * 3] = trailV.x; ta[i * 3 + 1] = trailV.y; ta[i * 3 + 2] = trailV.z; }
      b.trail.geometry.attributes.position.needsUpdate = true;
      b.mesh.rotation.y += dt * b.spin;
      if (b.clouds) b.clouds.rotation.y += dt * b.spin * 1.35;
      const active = hovered === b || hovered?.parent === b || follow === b;
      b.hover = damp(b.hover, active ? 1 : 0, 7, dt);
      b.atmo.material.uniforms.uPower.value = 0.9 + b.hover * 1.4;
      b.object.scale.setScalar(1 + (hovered === b && follow !== b ? 0.06 : 0) * b.hover);
      b.orbitLine.material.opacity = 0.16 + b.hover * 0.5 * (follow && follow !== b ? 0 : 1);
      b.orbitLine.material.color.set(b.hover > 0.05 ? b.color : "#7fa8ff");
      b.moons.forEach((m) => {
        m.pivot.rotation.y += dt * m.speed * (follow === b ? 0.5 : 1);
        m.object.rotation.y += dt * 0.4;
        m.hover = damp(m.hover, hovered === m ? 1 : 0, 10, dt);
        m.object.scale.setScalar(1 + m.hover * 0.5);
      });
    });
    belt.rotation.y += dt * 0.006 * timeScale;
    dust.rotation.y += dt * 0.004;

    // Caméra
    if (autoRotate && !flight) goal.theta += dt * 0.035;
    if (follow && !flight) goal.target.copy(worldPos(follow, tmp));
    let fovKick = 0;
    if (flight) {
      const k = Math.min(1, (performance.now() - flight.t0) / flight.dur), e = ease(k);
      cam.target.lerpVectors(flight.from.target, flight.to.targetFn(), e);
      const lr = Math.log(flight.from.radius) + (Math.log(flight.to.radius) - Math.log(flight.from.radius)) * e;
      cam.radius = Math.exp(lr) * (1 + Math.sin(k * Math.PI) * flight.arc);
      cam.phi = flight.from.phi + (flight.to.phi - flight.from.phi) * e;
      cam.theta = flight.from.theta + (flight.to.theta - flight.from.theta) * e;
      fovKick = Math.sin(k * Math.PI) * 7 * Math.min(1, flight.arc + 0.3);
      if (k >= 1) { goal.target.copy(cam.target); goal.radius = flight.to.radius; goal.phi = cam.phi; goal.theta = cam.theta; flight = null; opts.onArrive?.(follow); }
    } else {
      const lim = limits(); goal.radius = THREE.MathUtils.clamp(goal.radius, lim.min, lim.max);
      cam.target.x = damp(cam.target.x, goal.target.x, follow ? 14 : 6, dt);
      cam.target.y = damp(cam.target.y, goal.target.y, follow ? 14 : 6, dt);
      cam.target.z = damp(cam.target.z, goal.target.z, follow ? 14 : 6, dt);
      cam.radius = damp(cam.radius, goal.radius, 6, dt);
      cam.phi = damp(cam.phi, goal.phi, 7, dt);
      cam.theta = damp(cam.theta, goal.theta, 7, dt);
    }
    // Parallaxe souris : légère dérive de la caméra et des couches d'étoiles
    mouse.sx = damp(mouse.sx, mouse.x, 2.5, dt); mouse.sy = damp(mouse.sy, mouse.y, 2.5, dt);
    const ph = cam.phi + mouse.sy * 0.025, th = cam.theta - mouse.sx * 0.04;
    camera.position.set(Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)).multiplyScalar(cam.radius).add(cam.target);
    camera.lookAt(cam.target);
    starLayers.forEach((s) => { const d = s.userData.depth + 1; s.rotation.y = mouse.sx * 0.012 * d + elapsed * 0.0015 * d; s.rotation.x = mouse.sy * 0.008 * d; });
    nebulae.rotation.y = mouse.sx * 0.01;
    const fov = baseFov + fovKick;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // Décalage de cadrage pour laisser la place au panneau
    inset.x = damp(inset.x, inset.gx, 5, dt); inset.y = damp(inset.y, inset.gy, 5, dt);
    const w = el.clientWidth, h = el.clientHeight;
    if (Math.abs(inset.x) > 0.5 || Math.abs(inset.y) > 0.5) camera.setViewOffset(w, h, inset.x, inset.y, w, h); else camera.clearViewOffset();

    // Réticule
    const rt = hovered && hovered.kind !== "moon" ? hovered : follow;
    retMat.opacity = damp(retMat.opacity, rt ? 0.85 : 0, 8, dt);
    if (rt) {
      worldPos(rt, reticle.position);
      const s = rt.radius * (rt.kind === "sun" ? 1.35 : rt.data?.planet.rings ? 2.6 : 1.6) * (1 + Math.sin(elapsed * 2.4) * 0.03);
      reticle.scale.setScalar(s); reticle.quaternion.copy(camera.quaternion); reticle.rotateZ(elapsed * 0.35);
    }

    cosmos.update(dt, elapsed, camera, follow && follow.kind !== "sun");
    renderer.render(scene, camera);

    // Étiquettes HTML
    bodies.forEach((b) => {
      if (!b.tag) return;
      const show = b.kind === "planet" ? !follow : follow === b.parent;
      worldPos(b, proj); const off = b.radius * (b.kind === "moon" ? 1.8 : 1.3);
      proj.y += off; proj.project(camera);
      const vis = show && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1;
      b.tag.style.display = vis ? "block" : "none";
      if (vis) b.tag.style.transform = `translate(${((proj.x + 1) / 2) * w + 6}px, ${((1 - proj.y) / 2) * h - 6}px)`;
      b.tag.style.opacity = b.kind === "moon" ? (hovered === b ? 1 : 0.8) : hovered === b ? 0 : isMobile ? 0.85 : 0.55;
    });

    opts.onFrame?.(cam, follow);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    bodies, planetBodies, sunBody,
    focus, overview, intro, landing, zoom,
    rotateBy: (dx, dy) => rotate(dx, dy),
    setInset: (x, y) => { inset.gx = x; inset.gy = y; },
    screenOf(b) { worldPos(b, proj).project(camera); return { x: ((proj.x + 1) / 2) * el.clientWidth, y: ((1 - proj.y) / 2) * el.clientHeight }; },
    get follow() { return follow; }
  };
}
