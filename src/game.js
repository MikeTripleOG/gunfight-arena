(function () {
'use strict';
const V3 = THREE.Vector3;
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// ---------------------------------------------------------------- weapons
const WDEF = {
  pistol: { name: 'Pistol', dmg: 26, rate: 0.16, auto: false, mag: 12, reload: 1.1, spread: 0.010, pellets: 1, range: 90, recoil: 0.018, fov: 60, pref: 12, snd: [1800, 0.12],
    m: { body: [0.09, 0.14, 0.30], barrel: 0.06, color: 0x3a3f47, accent: 0x7a828c, grip: true } },
  smg: { name: 'SMG', dmg: 15, rate: 0.065, auto: true, mag: 30, reload: 1.6, spread: 0.032, pellets: 1, range: 70, recoil: 0.010, fov: 60, pref: 9, snd: [2600, 0.08],
    m: { body: [0.10, 0.15, 0.42], barrel: 0.12, color: 0x2d3640, accent: 0x5c6b7a, mag: 0.20, grip: true } },
  rifle: { name: 'Assault Rifle', dmg: 23, rate: 0.095, auto: true, mag: 30, reload: 1.9, spread: 0.016, pellets: 1, range: 110, recoil: 0.014, fov: 55, pref: 15, snd: [1500, 0.12],
    m: { body: [0.10, 0.16, 0.62], barrel: 0.22, color: 0x4b5a3a, accent: 0x2a2f25, mag: 0.24, stock: true, grip: true } },
  shotgun: { name: 'Shotgun', dmg: 13, rate: 0.8, auto: false, mag: 6, reload: 2.2, spread: 0.075, pellets: 9, range: 35, recoil: 0.06, fov: 62, pref: 5, snd: [900, 0.25],
    m: { body: [0.12, 0.15, 0.70], barrel: 0.25, color: 0x6b4a2b, accent: 0x2b2b2b, pump: true, stock: true } },
  lmg: { name: 'LMG', dmg: 19, rate: 0.085, auto: true, mag: 60, reload: 3.0, spread: 0.038, pellets: 1, range: 100, recoil: 0.011, fov: 58, pref: 14, snd: [1200, 0.12],
    m: { body: [0.14, 0.20, 0.72], barrel: 0.28, color: 0x2e2e2e, accent: 0x6d6d50, box: true, stock: true, grip: true } },
  sniper: { name: 'Sniper', dmg: 105, rate: 1.25, auto: false, mag: 5, reload: 2.6, spread: 0.035, adsSpread: 0.0005, pellets: 1, range: 200, recoil: 0.07, fov: 22, scope: true, pref: 26, snd: [700, 0.35],
    m: { body: [0.10, 0.15, 0.85], barrel: 0.40, color: 0x2f3b2f, accent: 0x111111, scope: true, stock: true } },
  revolver: { name: 'Revolver', dmg: 60, rate: 0.5, auto: false, mag: 6, reload: 2.0, spread: 0.008, pellets: 1, range: 90, recoil: 0.05, fov: 58, pref: 12, snd: [1000, 0.22],
    m: { body: [0.10, 0.16, 0.34], barrel: 0.14, color: 0x9aa3ad, accent: 0x5a3a22, grip: true, cyl: true } },
  golden: { name: 'Golden Gun', dmg: 45, rate: 0.3, auto: false, mag: 7, reload: 1.4, spread: 0.008, pellets: 1, range: 120, recoil: 0.03, fov: 58, pref: 12, snd: [1300, 0.2],
    m: { body: [0.10, 0.16, 0.36], barrel: 0.10, color: 0xffc83d, accent: 0xb8860b, grip: true, gold: true } },
  // ---- Arsenal additions
  dual: { name: 'Dual Pistols', dmg: 19, rate: 0.1, auto: false, mag: 24, reload: 1.8, spread: 0.022, pellets: 1, range: 80, recoil: 0.014, fov: 64, pref: 9, snd: [2100, 0.1],
    m: { body: [0.09, 0.14, 0.30], barrel: 0.06, color: 0x2b2b2b, accent: 0xc0c0c0, grip: true, dual: true } },
  burst: { name: 'Burst Rifle', dmg: 25, rate: 0.36, burst: 3, burstGap: 0.065, auto: false, mag: 30, reload: 1.9, spread: 0.011, pellets: 1, range: 110, recoil: 0.011, fov: 50, pref: 16, snd: [1700, 0.1],
    m: { body: [0.10, 0.17, 0.60], barrel: 0.20, color: 0xd9d4c7, accent: 0x333333, mag: 0.20, stock: true, grip: true, rail: true } },
  crossbow: { name: 'Crossbow', dmg: 95, rate: 0.6, auto: false, mag: 1, reload: 1.2, spread: 0.004, pellets: 1, range: 150, recoil: 0.03, fov: 42, pref: 18, snd: [500, 0.15],
    proj: { speed: 55, gravity: 9, size: 0.06, color: 0x8b5a2b }, m: { body: [0.10, 0.12, 0.62], barrel: 0.02, color: 0x6b4423, accent: 0x333333, stock: true, bow: true } },
  rocket: { name: 'Rocket Launcher', dmg: 120, splash: 5, rate: 0.8, auto: false, mag: 1, reload: 1.7, spread: 0.004, pellets: 1, range: 200, recoil: 0.08, fov: 60, pref: 16, snd: [300, 0.5],
    proj: { speed: 32, gravity: 0, size: 0.16, color: 0x556b2f, rocket: true }, m: { body: [0.19, 0.19, 1.0], barrel: 0.02, color: 0x4d5d3a, accent: 0x222222, grip: true, tube: true } },
  knife: { name: 'Golden Knife', dmg: 55, rate: 0.42, auto: true, mag: Infinity, reload: 0, spread: 0, pellets: 1, range: 2.6, melee: true, recoil: 0, fov: 75, pref: 0, snd: [5000, 0.12],
    m: { knife: true, body: [0.05, 0.05, 0.16], barrel: 0, color: 0xffc83d, accent: 0x3a2a1a, gold: true } },
};
const SETS = {
  classic: { name: 'Classic', desc: 'Pistol → Golden Gun', list: ['pistol', 'smg', 'rifle', 'shotgun', 'lmg', 'sniper', 'revolver', 'golden'] },
  arsenal: { name: 'Arsenal', desc: 'Dual Pistols → Rockets → Golden Knife', list: ['dual', 'smg', 'burst', 'shotgun', 'crossbow', 'rocket', 'sniper', 'knife'] },
};
let WEAPONS = SETS.classic.list.map((k) => WDEF[k]);
let LAST = WEAPONS.length - 1;
const DIFFS = {
  easy:   { name: 'Easy',   dmg: 0.32, react: 1.7, err: 1.9, turn: 0.6, pause: 1.8, focus: 1.3 },
  normal: { name: 'Normal', dmg: 0.5,  react: 1.0, err: 1.1, turn: 1.0, pause: 1.0, focus: 0.95 },
  hard:   { name: 'Hard',   dmg: 0.8,  react: 0.65, err: 0.6, turn: 1.4, pause: 0.6, focus: 0.8 },
};
let DIFF = DIFFS.easy;

// ---------------------------------------------------------------- renderer / scene
const container = $('game');
const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
const COARSE_AUTO = mq('(pointer:coarse)') || (('ontouchstart' in window || navigator.maxTouchPoints > 0) && !mq('(pointer:fine)'));
const LOWGFX = COARSE_AUTO || Math.min(window.innerWidth, window.innerHeight) < 500;
const renderer = new THREE.WebGLRenderer({ antialias: !LOWGFX, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOWGFX ? 1.25 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = LOWGFX ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.autoClear = false;
container.appendChild(renderer.domElement);

const SKY = 0x8fd0ff;
const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 55, 130);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 400);
camera.rotation.order = 'YXZ';
scene.add(camera);

const hemi = new THREE.HemisphereLight(0xdff2ff, 0x6a6a55, 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.9);
sun.position.set(30, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(LOWGFX ? 1024 : 2048, LOWGFX ? 1024 : 2048);
const sc = sun.shadow.camera; sc.left = -50; sc.right = 50; sc.top = 50; sc.bottom = -50; sc.near = 1; sc.far = 150;
sun.shadow.bias = -0.0008;
scene.add(sun);
const flashLight = new THREE.PointLight(0xffcc66, 0, 9);
scene.add(flashLight);

// viewmodel scene (rendered on top so the gun never clips into walls)
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 10);
vmScene.add(new THREE.HemisphereLight(0xffffff, 0x666655, 1.4));
const vmSun = new THREE.DirectionalLight(0xffffff, 1.2); vmSun.position.set(1, 2, 1); vmScene.add(vmSun);

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  vmCam.aspect = w / h; vmCam.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// ---------------------------------------------------------------- textures / materials
function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
const floorTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(Math.random() * s, Math.random() * s, 3, 3); }
  g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 3; g.strokeRect(0, 0, s, s);
});
floorTex.repeat.set(40, 40);
const blockTex = canvasTex(64, (g, s) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
});
const crateTex = canvasTex(64, (g, s) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(60,30,0,0.45)'; g.lineWidth = 5; g.strokeRect(3, 3, s - 6, s - 6);
  g.beginPath(); g.moveTo(5, 5); g.lineTo(s - 5, s - 5); g.moveTo(s - 5, 5); g.lineTo(5, s - 5); g.stroke();
});
const matCache = {};
function blockMat(color, tex) {
  const k = color + (tex === crateTex ? 'c' : 'b');
  if (!matCache[k]) matCache[k] = new THREE.MeshLambertMaterial({ color, map: tex || blockTex });
  return matCache[k];
}
const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });

// ---------------------------------------------------------------- world
const C = { wall: 0xa3a2a5, wallDark: 0x6e6f73, stone: 0x8a8d91, red: 0xc4281c, blue: 0x0d69ac, green: 0x4b974b, yellow: 0xf5cd30, crate: 0xc49a6c, orange: 0xda8541, white: 0xe5e4df };
const boxes = []; // static AABB colliders
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxEdges = new THREE.EdgesGeometry(boxGeo);
const worldGroup = new THREE.Group(); scene.add(worldGroup);
function addBox(cx, y0, cz, sx, sy, sz, color, tex) {
  const mesh = new THREE.Mesh(boxGeo, blockMat(color, tex));
  mesh.scale.set(sx, sy, sz);
  mesh.position.set(cx, y0 + sy / 2, cz);
  mesh.castShadow = true; mesh.receiveShadow = true;
  const e = new THREE.LineSegments(boxEdges, edgeMat); mesh.add(e);
  worldGroup.add(mesh);
  const b = { min: new V3(cx - sx / 2, y0, cz - sz / 2), max: new V3(cx + sx / 2, y0 + sy, cz + sz / 2), color };
  boxes.push(b);
  return b;
}
// non-colliding decoration
function deco(cx, y0, cz, sx, sy, sz, color, shadow) {
  const m = new THREE.Mesh(boxGeo, blockMat(color)); m.scale.set(sx, sy, sz); m.position.set(cx, y0 + sy / 2, cz);
  m.castShadow = !!shadow; worldGroup.add(m); return m;
}
// stairs: start at (x0,z0) at the platform edge, run outward along (dx,dz)
function stairs(x0, z0, dx, dz, n, h, depth, width, color) {
  for (let i = 0; i < n; i++) {
    const hh = (n - i) * h, off = (i + 0.5) * depth;
    addBox(x0 + dx * off, 0, z0 + dz * off, dx ? depth : width, hh, dz ? depth : width, i % 2 ? color : shade(color, 0.9));
  }
}
function shade(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return c.getHex(); }
function crate(x, z, n, color, size) {
  const s = size || 1.6, c = color || C.crate;
  addBox(x, 0, z, s, 1.2, s, c, crateTex);
  if (n > 1) addBox(x + 0.1, 1.2, z - 0.1, s - 0.2, 1.2, s - 0.2, shade(c, 0.85), crateTex);
}
function perimeter(color, h) {
  addBox(0, 0, -A - 0.5, A * 2 + 2, h, 1, color); addBox(0, 0, A + 0.5, A * 2 + 2, h, 1, color);
  addBox(-A - 0.5, 0, 0, 1, h, A * 2, color); addBox(A + 0.5, 0, 0, 1, h, A * 2, color);
}
function parapets(x, z, sx, sz, y, color, skip) { // low walls round a roof; skip = 'n'|'s'|'e'|'w'
  const t = 0.5, h = 0.9;
  if (skip !== 'n') addBox(x, y, z - sz / 2 + t / 2, sx, h, t, color);
  if (skip !== 's') addBox(x, y, z + sz / 2 - t / 2, sx, h, t, color);
  if (skip !== 'w') addBox(x - sx / 2 + t / 2, y, z, t, h, sz - 2 * t, color);
  if (skip !== 'e') addBox(x + sx / 2 - t / 2, y, z, t, h, sz - 2 * t, color);
}

const A = 40; // arena half-size (all maps)
const MAPS = {
  arena: {
    name: 'Classic Arena', desc: 'Grassy blocks, central tower',
    theme: { sky: 0x8fd0ff, fogNear: 55, fogFar: 130, floor: 0x5fa35f, outer: 0x4a8a4a, hemiSky: 0xdff2ff, hemiGround: 0x6a6a55, hemi: 1.1, sun: 1.9, sunColor: 0xffffff, skyline: [C.wall, C.stone, C.white, C.wallDark] },
    spawns: [[0, -34], [0, 34], [-36, 0], [36, 0], [-35, -35], [35, 35], [-35, 35], [35, -35], [-20, 0], [20, 0], [-10, -28], [10, 28], [-28, -15], [28, 15], [0, 10], [0, -10]],
    build() {
      perimeter(C.wall, 6);
      addBox(0, 0, 0, 8, 3, 8, C.stone);
      stairs(0, 4, 0, 1, 6, 0.5, 1, 3, C.red);
      stairs(0, -4, 0, -1, 6, 0.5, 1, 3, C.blue);
      for (const [x, z] of [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]]) addBox(x, 3, z, 1.2, 1.1, 1.2, C.white);
      addBox(-3.4, 3, 0, 1.2, 1.1, 3, C.white); addBox(3.4, 3, 0, 1.2, 1.1, 3, C.white);
      addBox(28, 0, 0, 6, 2.5, 14, C.wallDark);
      stairs(25, 0, -1, 0, 5, 0.5, 1, 3, C.orange);
      addBox(30.4, 2.5, -4, 1.2, 1.2, 4, C.white); addBox(30.4, 2.5, 4, 1.2, 1.2, 4, C.white);
      addBox(-28, 0, 0, 6, 2.5, 14, C.wallDark);
      stairs(-25, 0, 1, 0, 5, 0.5, 1, 3, C.green);
      addBox(-30.4, 2.5, -4, 1.2, 1.2, 4, C.white); addBox(-30.4, 2.5, 4, 1.2, 1.2, 4, C.white);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        addBox(sx * 27, 0, sz * 29, 9, 2.6, 1, sz > 0 ? C.red : C.blue);
        addBox(sx * 31, 0, sz * 25, 1, 2.6, 7, sz > 0 ? C.red : C.blue);
      }
      addBox(0, 0, 18, 14, 3, 1, C.wall); addBox(0, 0, -18, 14, 3, 1, C.wall);
      addBox(-15, 0, -10, 1, 3, 8, C.wall); addBox(15, 0, 10, 1, 3, 8, C.wall);
      addBox(-15, 0, 12, 6, 2, 1, C.yellow); addBox(15, 0, -12, 6, 2, 1, C.yellow);
      const crates = [[-8, -10, 1], [9, 11, 1], [-9, 10, 2], [8, -11, 2], [-20, -20, 2], [20, 20, 2], [5, -26, 1], [-5, 26, 1],
        [-34, 12, 1], [34, -12, 1], [14, -32, 2], [-14, 32, 2], [22, -4, 1], [-22, 4, 1], [3, 22, 1], [-3, -22, 1], [-24, -32, 1], [24, 32, 1], [33, 33, 1], [-33, -33, 1]];
      for (const [x, z, n] of crates) crate(x, z, n);
    },
  },
  desert: {
    name: 'Desert Town', desc: 'Adobe rooftops, market, sniper tower',
    theme: { sky: 0xf6dcae, fogNear: 50, fogFar: 125, floor: 0xe3c58c, outer: 0xd6b67a, hemiSky: 0xfff2d6, hemiGround: 0xa07850, hemi: 1.15, sun: 2.1, sunColor: 0xfff0d0, skyline: [0xd4a373, 0xc8915e, 0xe2bf8c, 0xb98457] },
    spawns: [[0, -36], [0, 36], [-36, 0], [36, 0], [-27, -32], [27, 32], [-30, 27], [30, -27], [0, 9], [0, -8], [-10, 0], [10, 0], [-24, 4], [24, -4]],
    build() {
      const S = { adobe: 0xd4a373, adobe2: 0xc8915e, adobe3: 0xe2bf8c, dark: 0x9a6a46, teal: 0x2f8c8c, red: 0xb33a3a, white: 0xefe6d2, wood: 0x8f6239, green: 0x5f8f3a };
      perimeter(S.adobe2, 6);
      // town well in the plaza
      addBox(0, 0, -1.5, 4, 0.9, 0.6, S.white); addBox(0, 0, 1.5, 4, 0.9, 0.6, S.white);
      addBox(-1.7, 0, 0, 0.6, 0.9, 2.4, S.white); addBox(1.7, 0, 0, 0.6, 0.9, 2.4, S.white);
      deco(0, 0, 0, 2.8, 0.1, 2.4, 0x3d6f8f);
      // two houses with rooftop access
      addBox(-18, 0, -16, 10, 4, 8, S.adobe); parapets(-18, -16, 10, 8, 4, S.adobe3, 'e');
      stairs(-13, -16, 1, 0, 8, 0.5, 1, 2.5, S.dark);
      addBox(18, 0, 16, 10, 4, 8, S.adobe); parapets(18, 16, 10, 8, 4, S.adobe3, 'w');
      stairs(13, 16, -1, 0, 8, 0.5, 1, 2.5, S.dark);
      // two-storey blocks (cover)
      addBox(18, 0, -18, 8, 5, 8, S.adobe3); addBox(19, 5, -19, 4, 2.5, 4, S.adobe);
      addBox(-18, 0, 18, 8, 5, 8, S.adobe3); addBox(-19, 5, 19, 4, 2.5, 4, S.adobe);
      for (const [x, z] of [[14, -14.1], [-14, 14.1]]) deco(x, 1.2, z, 1.4, 2.2, 0.15, S.teal); // doors
      // sniper tower
      addBox(0, 0, -28, 5, 7, 5, S.dark); parapets(0, -28, 5, 5, 7, S.adobe2, 's');
      stairs(0, -25.5, 0, 1, 14, 0.5, 1, 2.4, S.adobe2);
      // houses round the edge
      addBox(-34, 0, -8, 6, 4.5, 8, S.adobe2); addBox(-34, 0, 10, 6, 3.5, 7, S.adobe);
      addBox(34, 0, 8, 6, 4.5, 8, S.adobe2); addBox(34, 0, -10, 6, 3.5, 7, S.adobe);
      addBox(-10, 0, 34, 8, 4, 6, S.adobe3); addBox(12, 0, 34, 10, 5, 6, S.adobe);
      addBox(-22, 0, -35, 9, 3.5, 5, S.adobe); addBox(22, 0, -34, 7, 4, 6, S.adobe3);
      // market stalls
      const stall = (x, z, col) => {
        addBox(x, 0, z, 3, 1.1, 1, S.wood);
        for (const [px, pz] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) addBox(x + px, 0, z + pz, 0.18, 2.5, 0.18, S.wood);
        addBox(x, 2.5, z, 3.4, 0.15, 2.4, col);
      };
      stall(-7, 6, S.red); stall(7, -6, S.teal); stall(-7, -7, S.teal); stall(8, 7, S.red);
      // low walls & barrels
      addBox(-8, 0, 24, 10, 1.1, 0.8, S.adobe3); addBox(8, 0, -20, 10, 1.1, 0.8, S.adobe3);
      addBox(-26, 0, -4, 0.8, 1.1, 8, S.adobe3); addBox(26, 0, 4, 0.8, 1.1, 8, S.adobe3);
      for (const [x, z, n] of [[-4, 14, 1], [5, -14, 1], [25, 22, 2], [-25, -22, 2], [-30, 32, 1], [30, -31, 1], [14, 26, 1], [-14, -26, 1]]) crate(x, z, n, S.wood, 1.3);
      // blocky palms
      for (const [x, z] of [[24, 0], [-24, -10], [10, 22], [-12, -20], [30, 26], [-30, 24]]) {
        if (anyOverlapBox(x, z, 0.6)) continue;
        addBox(x, 0, z, 0.6, 5, 0.6, 0x8a6a42);
        deco(x, 5, z, 3.4, 0.35, 1, S.green, true); deco(x, 5, z, 1, 0.35, 3.4, S.green, true); deco(x, 5.3, z, 1.2, 0.5, 1.2, shade(S.green, 0.8), true);
      }
    },
  },
  warehouse: {
    name: 'Warehouse', desc: 'Containers, catwalk, loading dock',
    theme: { sky: 0x6f7f8f, fogNear: 32, fogFar: 100, floor: 0x8e9092, outer: 0x55595d, hemiSky: 0xc8d6e6, hemiGround: 0x4a4a48, hemi: 1.05, sun: 1.5, sunColor: 0xe8f0ff, skyline: [0x505a64, 0x3c4248, 0x6a737c, 0x2f353b] },
    spawns: [[0, -36], [0, 36], [-36, 0], [36, 0], [-36, -36], [36, 36], [-36, 36], [36, -36], [0, -8], [0, 8], [-20, 0], [20, 0], [-28, 14], [28, -14]],
    build() {
      const K = [0xb5452f, 0x2f6fa8, 0x3f8f4a, 0xd9a227, 0x7a4fa0, 0xc06a2b], steel = 0x3c4248, hazard = 0xf2c12e;
      perimeter(0x505a64, 8);
      const cont = (x, z, alongX, y0, col) => addBox(x, y0 || 0, z, alongX ? 6 : 2.5, 2.6, alongX ? 2.5 : 6, col);
      // two double-stacked containers joined by a catwalk
      cont(-12, 0, false, 0, K[0]); cont(-12, 0, false, 2.6, K[1]);
      cont(12, 0, false, 0, K[2]); cont(12, 0, false, 2.6, K[3]);
      stairs(-12, 3, 0, 1, 10, 0.52, 1, 2.5, steel);
      stairs(12, -3, 0, -1, 10, 0.52, 1, 2.5, steel);
      addBox(0, 4.9, 0, 21.5, 0.3, 2, steel);
      deco(0, 5.2, -0.95, 21.5, 0.08, 0.08, hazard); deco(0, 5.2, 0.95, 21.5, 0.08, 0.08, hazard);
      for (let x = -9; x <= 9; x += 3) { deco(x, 5.2, -0.95, 0.08, 0.9, 0.08, hazard); deco(x, 5.2, 0.95, 0.08, 0.9, 0.08, hazard); deco(x, 6.05, -0.95, 0.08, 0.08, 0.08, hazard); }
      deco(0, 6.05, -0.95, 21.5, 0.08, 0.08, hazard); deco(0, 6.05, 0.95, 21.5, 0.08, 0.08, hazard);
      // container rows
      cont(-26, 22, true, 0, K[4]); cont(-18, 22, true, 0, K[0]); cont(-18, 22, true, 2.6, K[2]);
      cont(-4, 24, true, 0, K[3]); cont(7, 21, true, 0, K[1]); cont(20, 23, true, 0, K[5]); cont(28, 18, false, 0, K[0]);
      cont(26, -22, true, 0, K[2]); cont(18, -22, true, 0, K[5]); cont(18, -22, true, 2.6, K[4]);
      cont(4, -24, true, 0, K[0]); cont(-7, -21, true, 0, K[3]); cont(-20, -23, true, 0, K[1]); cont(-28, -18, false, 0, K[2]);
      cont(30, 4, false, 0, K[1]); cont(-30, -4, false, 0, K[5]);
      // pillars + roof beams (decorative)
      for (const [x, z] of [[-20, -10], [20, -10], [-20, 10], [20, 10], [0, -14], [0, 14]]) addBox(x, 0, z, 1, 9, 1, steel);
      for (let z = -30; z <= 30; z += 15) deco(0, 9, z, A * 2, 0.6, 0.6, steel);
      deco(-20, 9, 0, 0.6, 0.6, A * 2, steel); deco(20, 9, 0, 0.6, 0.6, A * 2, steel);
      // loading dock
      addBox(-20, 0, -37, 12, 1.2, 6, 0x6a737c); deco(-20, 1.2, -34.1, 12, 0.05, 0.3, hazard);
      // pallets / crates
      for (const [x, z, n] of [[-6, 6, 1], [6, -6, 1], [-4, -5, 2], [5, 6, 2], [-30, 10, 1], [30, -10, 1], [-10, 32, 2], [10, -32, 2], [24, 30, 1], [-24, -30, 1], [34, 30, 1], [-34, -30, 1]]) crate(x, z, n);
      // hazard stripes on the floor
      deco(0, 0, -14, 12, 0.03, 0.4, hazard); deco(0, 0, 14, 12, 0.03, 0.4, hazard);
    },
  },
};
const MAP_IDS = Object.keys(MAPS);
let SPAWNS = [], currentMap = null;
const floorMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: floorTex });
const outerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
function anyOverlapBox(x, z, r) { for (const b of boxes) if (x + r > b.min.x && x - r < b.max.x && z + r > b.min.z && z - r < b.max.z) return true; return false; }
function buildMap(id) {
  while (worldGroup.children.length) worldGroup.remove(worldGroup.children[0]);
  boxes.length = 0;
  const M = MAPS[id], T = M.theme; currentMap = id;
  scene.background.setHex(T.sky); scene.fog.color.setHex(T.sky); scene.fog.near = T.fogNear; scene.fog.far = T.fogFar;
  hemi.color.setHex(T.hemiSky); hemi.groundColor.setHex(T.hemiGround); hemi.intensity = T.hemi;
  sun.color.setHex(T.sunColor); sun.intensity = T.sun;
  floorMat.color.setHex(T.floor); outerMat.color.setHex(T.outer);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(A * 2, A * 2), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldGroup.add(floor);
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), outerMat);
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02; worldGroup.add(outer);
  M.build();
  for (let i = 0; i < 30; i++) {
    const ang = i / 30 * Math.PI * 2, r = 60 + ((i * 37) % 30), h = 4 + ((i * 53) % 14);
    deco(Math.cos(ang) * r, 0, Math.sin(ang) * r, 5 + (i * 7) % 7, h, 5 + (i * 11) % 7, T.skyline[i % T.skyline.length]);
  }
  SPAWNS = M.spawns.filter(([x, z]) => !anyOverlapBox(x, z, 0.5));
}
// ---------------------------------------------------------------- collision / raycast
const R = 0.4, H = 2.0, EYE = 1.75, STEP = 0.55, GRAV = 24, JUMP = 8.2;
const EPS = 0.001;
function overlapsAt(x, y, z, b) {
  return x + R > b.min.x + EPS && x - R < b.max.x - EPS && z + R > b.min.z + EPS && z - R < b.max.z - EPS && y + H > b.min.y + EPS && y < b.max.y - EPS;
}
function anyOverlap(x, y, z) { for (const b of boxes) if (overlapsAt(x, y, z, b)) return b; return null; }
function moveAxis(e, axis, d) {
  if (!d) return false;
  const p = e.pos; p[axis] += d;
  let blocked = false;
  for (const b of boxes) {
    if (!overlapsAt(p.x, p.y, p.z, b)) continue;
    // try step up
    if (e.onGround && b.max.y - p.y <= STEP && !anyOverlap(p.x, b.max.y, p.z)) { p.y = b.max.y; continue; }
    if (d > 0) p[axis] = b.min[axis] - R - EPS * 2; else p[axis] = b.max[axis] + R + EPS * 2;
    blocked = true;
  }
  return blocked;
}
function physics(e, dt) {
  e.vel.y -= GRAV * dt;
  const bx = moveAxis(e, 'x', e.vel.x * dt);
  const bz = moveAxis(e, 'z', e.vel.z * dt);
  e.blocked = bx || bz;
  const p = e.pos;
  p.y += e.vel.y * dt;
  const wasGround = e.onGround; e.onGround = false;
  for (const b of boxes) {
    if (!overlapsAt(p.x, p.y, p.z, b)) continue;
    if (e.vel.y <= 0 && p.y > b.max.y - 0.6) { p.y = b.max.y; e.vel.y = 0; e.onGround = true; }
    else if (e.vel.y > 0) { p.y = b.min.y - H - EPS; e.vel.y = 0; }
  }
  if (p.y <= 0) { p.y = 0; e.vel.y = 0; e.onGround = true; }
  // stick to ground when walking down steps
  if (!e.onGround && wasGround && e.vel.y <= 0) {
    for (const b of boxes) if (overlapsAt(p.x, p.y - 0.6, p.z, b) && b.max.y <= p.y + EPS) { p.y = b.max.y; e.vel.y = 0; e.onGround = true; break; }
    if (!e.onGround && p.y < 0.6) { p.y = 0; e.onGround = true; }
  }
  p.x = clamp(p.x, -A + R, A - R); p.z = clamp(p.z, -A + R, A - R);
}
function rayAABB(o, d, mn, mx) {
  let tmin = 0, tmax = Infinity;
  for (const k of ['x', 'y', 'z']) {
    if (Math.abs(d[k]) < 1e-9) { if (o[k] < mn[k] || o[k] > mx[k]) return Infinity; continue; }
    let t1 = (mn[k] - o[k]) / d[k], t2 = (mx[k] - o[k]) / d[k];
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return Infinity;
  }
  return tmin;
}
function castWorld(o, d, maxT) {
  let best = maxT, box = null;
  if (d.y < -1e-6) { const t = -o.y / d.y; if (t < best) { best = t; box = 'floor'; } }
  for (const b of boxes) { const t = rayAABB(o, d, b.min, b.max); if (t < best) { best = t; box = b; } }
  return { t: best, box };
}
const _mn = new V3(), _mx = new V3();
function castAll(o, d, maxT, ignore) {
  const w = castWorld(o, d, maxT);
  const hit = { t: w.t, box: w.box, ent: null, head: false };
  for (const e of ents) {
    if (e === ignore || !e.alive) continue;
    const p = e.pos;
    _mn.set(p.x - 0.32, p.y + 1.55, p.z - 0.32); _mx.set(p.x + 0.32, p.y + 2.08, p.z + 0.32);
    let t = rayAABB(o, d, _mn, _mx);
    if (t < hit.t) { hit.t = t; hit.ent = e; hit.head = true; hit.box = null; }
    _mn.set(p.x - 0.5, p.y, p.z - 0.5); _mx.set(p.x + 0.5, p.y + 1.55, p.z + 0.5);
    t = rayAABB(o, d, _mn, _mx);
    if (t < hit.t) { hit.t = t; hit.ent = e; hit.head = false; hit.box = null; }
  }
  hit.point = o.clone().addScaledVector(d, hit.t);
  return hit;
}
const _o = new V3(), _d = new V3();
function canSee(from, to, toY) {
  _o.set(from.pos.x, from.pos.y + EYE, from.pos.z);
  _d.set(to.pos.x, to.pos.y + (toY == null ? 1.3 : toY), to.pos.z).sub(_o);
  const dist = _d.length(); _d.divideScalar(dist);
  return castWorld(_o, _d, dist).t >= dist - 0.05;
}

// ---------------------------------------------------------------- effects
const particles = [];
const partGeo = new THREE.BoxGeometry(1, 1, 1);
const partMats = {};
function partMat(color) { return partMats[color] || (partMats[color] = new THREE.MeshBasicMaterial({ color })); }
function burst(pos, color, n, speed, size) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(partGeo, partMat(color));
    const s = size * rand(0.6, 1.2); m.scale.set(s, s, s);
    m.position.copy(pos);
    scene.add(m);
    particles.push({ m, v: new V3(rand(-1, 1), rand(0.2, 1.5), rand(-1, 1)).multiplyScalar(speed), life: rand(0.3, 0.6), s });
  }
}
const debris = [];
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt;
    if (p.life <= 0) { scene.remove(p.m); particles.splice(i, 1); continue; }
    p.v.y -= 18 * dt; p.m.position.addScaledVector(p.v, dt);
    if (p.m.position.y < 0.02) { p.m.position.y = 0.02; p.v.multiplyScalar(0.5); }
    const k = Math.min(1, p.life * 4) * p.s; p.m.scale.set(k, k, k);
  }
  for (let i = debris.length - 1; i >= 0; i--) {
    const p = debris[i]; p.life -= dt;
    if (p.life <= 0) { scene.remove(p.m); debris.splice(i, 1); continue; }
    p.v.y -= GRAV * dt; p.m.position.addScaledVector(p.v, dt);
    p.m.rotation.x += p.av.x * dt; p.m.rotation.z += p.av.z * dt;
    if (p.m.position.y < 0.2) { p.m.position.y = 0.2; p.v.y *= -0.3; p.v.x *= 0.7; p.v.z *= 0.7; p.av.multiplyScalar(0.7); }
    if (p.life < 0.5) p.m.scale.multiplyScalar(0.92);
  }
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt;
    if (t.life <= 0) { scene.remove(t.l); t.l.geometry.dispose(); tracers.splice(i, 1); continue; }
    t.l.material.opacity = t.life / t.max * 0.9;
  }
}
const tracers = [];
function tracer(a, b, color) {
  const g = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  scene.add(l);
  tracers.push({ l, life: 0.07, max: 0.07 });
}

// ---------------------------------------------------------------- audio
let actx = null, noiseBuf = null, master = null;
function initAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0.35; master.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.5, actx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { actx = null; }
}
function playShot(w, vol) {
  if (!actx || vol < 0.02) return;
  const t = actx.currentTime;
  const src = actx.createBufferSource(); src.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(w.snd[0] * 2, t); f.frequency.exponentialRampToValueAtTime(w.snd[0] * 0.3, t + w.snd[1]);
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + w.snd[1]);
  src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + w.snd[1] + 0.02);
  const o = actx.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  const og = actx.createGain(); og.gain.setValueAtTime(vol * 0.8, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.13);
}
function beep(freq, dur, vol, type) {
  if (!actx) return;
  const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'square'; o.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.01);
}

// ---------------------------------------------------------------- gun models
const handMat = new THREE.MeshLambertMaterial({ color: 0xf5cd30 });
function buildGunSingle(m, withHand) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: m.color, emissive: m.gold ? 0x443300 : 0x000000 });
  const acc = new THREE.MeshLambertMaterial({ color: m.accent });
  const add = (sx, sy, sz, x, y, z, mt) => { const b = new THREE.Mesh(boxGeo, mt); b.scale.set(sx, sy, sz); b.position.set(x, y, z); g.add(b); return b; };
  const muzzle = new THREE.Object3D();
  if (m.knife) {
    add(0.06, 0.07, 0.16, 0, 0, 0.05, acc);                 // handle
    add(0.14, 0.03, 0.03, 0, 0, -0.04, acc);                // guard
    add(0.02, 0.07, 0.36, 0, 0.005, -0.23, mat);            // blade
    add(0.02, 0.035, 0.06, 0, 0.022, -0.43, mat);           // tip
    muzzle.position.set(0, 0, -0.45);
    if (withHand) add(0.11, 0.11, 0.13, 0, -0.01, 0.06, handMat);
  } else {
    const [bw, bh, bl] = m.body;
    add(bw, bh, bl, 0, 0, 0, mat);
    if (m.barrel > 0.03) add(bw * 0.5, bw * 0.5, m.barrel, 0, bh * 0.15, -bl / 2 - m.barrel / 2, acc);
    if (m.grip) add(bw * 0.9, bh * 1.4, bw * 1.2, 0, -bh * 0.9, bl * 0.25, acc);
    if (m.mag) add(bw * 0.8, m.mag, bw * 1.3, 0, -bh / 2 - m.mag / 2, -bl * 0.1, acc);
    if (m.stock) add(bw * 0.8, bh * 1.1, 0.22, 0, -0.02, bl / 2 + 0.11, acc);
    if (m.pump) add(bw * 1.2, bh * 0.7, 0.2, 0, -bh * 0.55, -bl * 0.3, acc);
    if (m.box) add(bw * 1.4, bh * 0.9, bw * 1.8, 0, -bh * 0.8, -bl * 0.05, new THREE.MeshLambertMaterial({ color: 0x55603a }));
    if (m.scope) { add(0.07, 0.07, 0.34, 0, bh / 2 + 0.06, -0.05, acc); add(0.1, 0.1, 0.05, 0, bh / 2 + 0.06, -0.22, acc); }
    if (m.rail) add(0.05, 0.05, bl * 0.5, 0, bh / 2 + 0.03, -bl * 0.05, acc);
    if (m.cyl) add(bw * 1.3, bh * 0.9, 0.12, 0, 0, -bl * 0.1, acc);
    if (m.bow) { add(0.62, 0.04, 0.05, 0, 0.02, -bl / 2 + 0.03, acc); add(0.025, 0.025, bl * 0.9, 0, bh / 2 + 0.015, -0.05, new THREE.MeshLambertMaterial({ color: 0xb0b0b0 })); }
    if (m.tube) { add(bw * 1.25, bh * 1.25, 0.08, 0, 0, -bl / 2, acc); add(bw * 1.15, bh * 1.15, 0.08, 0, 0, bl / 2, acc); add(0.05, 0.1, 0.05, -bw / 2 - 0.02, bh / 2 + 0.04, -0.1, acc); }
    muzzle.position.set(0, m.barrel > 0.03 ? bh * 0.15 : 0, -bl / 2 - m.barrel - 0.02);
    if (withHand) add(0.12, 0.12, 0.14, 0.01, -bh * 0.85, bl * 0.22, handMat);
  }
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}
function buildGun(w, scale, isVm) {
  let g;
  if (w.m.dual && isVm) {
    g = new THREE.Group();
    const a = buildGunSingle(w.m, true), b = buildGunSingle(w.m, true);
    b.position.x = -0.5; g.add(a); g.add(b);
    g.userData.muzzles = [a.userData.muzzle, b.userData.muzzle];
  } else {
    g = buildGunSingle(w.m, isVm);
    g.userData.muzzles = [g.userData.muzzle];
  }
  g.userData.muzzle = g.userData.muzzles[0];
  g.scale.setScalar(scale);
  return g;
}
const flashMat = new THREE.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.95 });
function makeFlash(size) {
  const f = new THREE.Group();
  const a = new THREE.Mesh(boxGeo, flashMat); a.scale.set(size, size, size * 1.8); f.add(a);
  const b = new THREE.Mesh(boxGeo, flashMat); b.scale.set(size * 1.6, size * 0.35, size * 0.35); b.rotation.z = 0.8; f.add(b);
  const c = b.clone(); c.rotation.z = -0.8; f.add(c);
  f.visible = false;
  return f;
}

// viewmodel
const vm = { group: new THREE.Group(), gun: null, flash: makeFlash(0.09), kick: 0, bob: 0, swap: 0, flashT: 0, adsK: 0 };
vmScene.add(vm.group);
function setViewmodel(idx) {
  if (vm.gun) vm.group.remove(vm.gun);
  vm.gun = buildGun(WEAPONS[idx], 0.85, true);
  vm.group.add(vm.gun);
  vm.gun.userData.muzzle.add(vm.flash);
  vm.swap = 1;
}

// ---------------------------------------------------------------- characters
const BOT_DEFS = [
  ['Noob_Slayer', 0xc4281c], ['BuilderBob', 0x0d69ac], ['xX_Sn1per_Xx', 0x4b974b],
  ['Guest_1337', 0xda8541], ['OofMaster', 0x8c5bb5], ['PizzaPlacer', 0xe8bac8],
];
const BOT_COUNT = 5;
function nameTag(text, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d'); g.font = 'bold 30px Segoe UI, Arial'; g.textAlign = 'center';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(text, 128, 42);
  g.fillStyle = color; g.fillText(text, 128, 42);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  s.scale.set(2.2, 0.55, 1);
  return s;
}
function buildBot(color, name) {
  const g = new THREE.Group();
  const mats = [];
  const M = (c) => { const m = new THREE.MeshLambertMaterial({ color: c, map: blockTex }); mats.push(m); return m; };
  const skin = M(0xf5cd30), shirt = M(color), pants = M(shade(color, 0.45)), dark = M(0x222222);
  const box = (sx, sy, sz, x, y, z, mat, parent) => { const b = new THREE.Mesh(boxGeo, mat); b.scale.set(sx, sy, sz); b.position.set(x, y, z); b.castShadow = true; (parent || g).add(b); return b; };
  const pivot = (x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); return p; };
  const legL = pivot(-0.25, 0.75, 0), legR = pivot(0.25, 0.75, 0);
  box(0.46, 0.75, 0.46, 0, -0.375, 0, pants, legL); box(0.46, 0.75, 0.46, 0, -0.375, 0, pants, legR);
  box(1.0, 0.8, 0.5, 0, 1.15, 0, shirt);
  const head = box(0.56, 0.5, 0.56, 0, 1.81, 0, skin);
  box(0.09, 0.12, 0.02, -0.12, 1.85, -0.285, dark); box(0.09, 0.12, 0.02, 0.12, 1.85, -0.285, dark);
  box(0.22, 0.05, 0.02, 0, 1.70, -0.285, dark);
  const armL = pivot(-0.73, 1.52, 0), armR = pivot(0.73, 1.52, 0);
  box(0.44, 0.8, 0.44, 0, -0.38, 0, skin, armL); box(0.44, 0.8, 0.44, 0, -0.38, 0, shirt, armR);
  const tag = nameTag(name, '#ffffff'); tag.position.y = 2.45; g.add(tag);
  scene.add(g);
  return { g, mats, legL, legR, armL, armR, head, gun: null, flash: makeFlash(0.12), tag };
}
function setBotGun(b) {
  const md = b.model;
  if (md.gun) md.armR.remove(md.gun);
  md.gun = buildGun(WEAPONS[b.weaponIdx], 1.25, false);
  md.gun.position.set(0, -0.78, -0.05);
  md.gun.rotation.x = -Math.PI / 2;
  md.gun.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  md.armR.add(md.gun);
  md.gun.userData.muzzle.add(md.flash);
}
function explodeModel(b) {
  const md = b.model;
  md.g.updateMatrixWorld(true);
  const list = [];
  md.g.traverse((o) => { if (o.isMesh && o.geometry === boxGeo) list.push(o); });
  for (const o of list) {
    const m = new THREE.Mesh(boxGeo, o.material);
    o.getWorldPosition(m.position); o.getWorldQuaternion(m.quaternion); o.getWorldScale(m.scale);
    m.castShadow = true; scene.add(m);
    const v = m.position.clone().sub(b.pos).setY(0).normalize().multiplyScalar(rand(2, 6)); v.y = rand(3, 8);
    debris.push({ m, v, av: new V3(rand(-8, 8), 0, rand(-8, 8)), life: 2.6 });
  }
  md.g.visible = false;
}

let ents = [], player = null, bots = [];
function makeEnt(name, isPlayer, color) {
  return { name, isPlayer, color, pos: new V3(), vel: new V3(), yaw: 0, pitch: 0, hp: 100, alive: false, respawnT: 0, weaponIdx: 0, ammo: 0, reloadT: 0, cd: 0,
    kills: 0, deaths: 0, burstLeft: 0, shotN: 0, lastHurt: -99, onGround: false, flashT: 0, blocked: false, model: null, ai: null, trigger: false };
}

// ---------------------------------------------------------------- spawning
function pickSpawn(e) {
  let best = null, bestScore = -1;
  for (const [x, z] of SPAWNS) {
    let minD = 999;
    for (const o of ents) if (o !== e && o.alive) minD = Math.min(minD, Math.hypot(o.pos.x - x, o.pos.z - z));
    const s = minD + rand(0, 6);
    if (s > bestScore) { bestScore = s; best = [x, z]; }
  }
  return best;
}
function spawn(e) {
  const [x, z] = pickSpawn(e);
  e.pos.set(x, 0, z); e.vel.set(0, 0, 0);
  e.yaw = Math.atan2(x, z); // face centre
  e.pitch = 0; e.hp = 100; e.alive = true; e.burstLeft = 0; e.lastHurt = -99; e.onGround = true;
  giveWeapon(e);
  if (e.model && !e.isPlayer) { e.model.g.visible = true; }
  if (e.ai) { e.ai.target = null; e.ai.mode = 'roam'; e.ai.goal = null; e.ai.lastSeen = null; e.ai.stuckN = 0; e.ai.escapeT = 0; e.ai.lastPos.copy(e.pos); }
  if (e.isPlayer) { recoilOff = 0; }
}
function giveWeapon(e) {
  const w = WEAPONS[e.weaponIdx];
  e.ammo = w.mag; e.reloadT = 0; e.cd = 0.3;
  if (e.isPlayer) setViewmodel(e.weaponIdx);
  else if (e.model) setBotGun(e);
}

// ---------------------------------------------------------------- combat
let now = 0, matchTime = 0;
function spreadDir(dir, s) {
  const d = dir.clone();
  d.x += (Math.random() * 2 - 1) * s; d.y += (Math.random() * 2 - 1) * s; d.z += (Math.random() * 2 - 1) * s;
  return d.normalize();
}
const _mz = new V3();
function muzzleObj(e) {
  const gun = e.isPlayer ? vm.gun : e.model.gun;
  const ms = gun.userData.muzzles;
  return ms[(e.shotN || 0) % ms.length];
}
function muzzlePos(e) {
  const mo = muzzleObj(e);
  if (e.isPlayer) {
    mo.getWorldPosition(_mz); // camera space (vmCam sits at the origin)
    camera.updateMatrixWorld(); return camera.localToWorld(_mz.clone());
  }
  e.model.g.updateMatrixWorld(true);
  return mo.getWorldPosition(new V3());
}
function startReload(e) {
  const w = WEAPONS[e.weaponIdx];
  if (w.melee || e.reloadT > 0 || e.ammo >= w.mag) return;
  e.reloadT = w.reload; e.burstLeft = 0;
  if (e.isPlayer) beep(320, 0.06, 0.15);
}
function fire(e, dir, origin, spread) {
  const w = WEAPONS[e.weaponIdx];
  if (e.cd > 0 || e.reloadT > 0 || !e.alive) return false;
  if (e.ammo <= 0) { e.burstLeft = 0; startReload(e); return false; }
  e.ammo--; e.shotN = (e.shotN || 0) + 1;
  if (w.burst) { if (!(e.burstLeft > 0)) e.burstLeft = w.burst; e.burstLeft--; e.cd = e.burstLeft > 0 ? w.burstGap : w.rate; }
  else e.cd = w.rate;
  if (w.melee) {
    const hit = castAll(origin, dir, w.range, e);
    if (hit.ent) { burst(hit.point, 0xff3b30, 6, 3, 0.09); damage(hit.ent, w.dmg * (hit.head ? 1.5 : 1) * (!e.isPlayer && hit.ent.isPlayer ? DIFF.dmg : 1), e, hit.head); }
    else if (hit.t < w.range) burst(hit.point, 0xdddddd, 3, 2, 0.05);
    if (e.isPlayer) { vm.kick = 1; playSwoosh(0.5); if (hit.ent) shake = Math.max(shake, 0.05); }
    else { e.model.swingT = 0.25; playSwoosh(0.4 / (1 + e.pos.distanceTo(player.pos) * 0.2)); }
    return true;
  }
  const mz = muzzlePos(e);
  if (w.proj) {
    spawnProjectile(e, origin, spreadDir(dir, spread), w, mz);
  } else {
    for (let i = 0; i < w.pellets; i++) {
      const d = spreadDir(dir, spread);
      const hit = castAll(origin, d, w.range, e);
      if (hit.ent) {
        let dmg = w.dmg * (hit.head ? 1.5 : 1);
        if (w.pellets > 1) dmg *= clamp(1.3 - hit.t / w.range, 0.3, 1);
        if (!e.isPlayer && hit.ent.isPlayer) dmg *= DIFF.dmg;
        burst(hit.point, hit.head ? 0xffffff : 0xff3b30, hit.head ? 7 : 4, 4, 0.09);
        damage(hit.ent, dmg, e, hit.head);
      } else if (hit.t < w.range) {
        const col = hit.box && hit.box !== 'floor' ? hit.box.color : floorMat.color.getHex();
        burst(hit.point, col, 4, 3, 0.07);
        burst(hit.point, 0xfff1b0, 1, 1, 0.06);
      }
      if (i < 3) tracer(mz, hit.point, e.isPlayer ? 0xfff2a0 : 0xffb070);
    }
  }
  // effects
  const mo = muzzleObj(e);
  if (e.isPlayer) {
    mo.add(vm.flash);
    vm.kick = 1; vm.flashT = 0.05; recoilOff += w.recoil * rand(0.8, 1.2); yawKick += rand(-1, 1) * w.recoil * 0.3; shake = Math.max(shake, w.recoil * 2.2);
    flashLight.position.copy(mz); flashLight.intensity = 3; flashLight.distance = 9;
    playShot(w, 0.9);
  } else {
    mo.add(e.model.flash);
    e.model.flashT = 0.06;
    playShot(w, 0.6 / (1 + e.pos.distanceTo(player.pos) * 0.12));
  }
  if (e.ammo === 0) startReload(e);
  return true;
}
function playSwoosh(vol) {
  if (!actx || vol < 0.02) return;
  const t = actx.currentTime, src = actx.createBufferSource(); src.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(1200, t); f.frequency.exponentialRampToValueAtTime(4000, t + 0.15);
  const g = actx.createGain(); g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(vol, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + 0.2);
}

// projectiles (crossbow bolts, rockets)
const projectiles = [], stuck = [];
const projMats = {};
function spawnProjectile(e, origin, dir, w, mz) {
  const P = w.proj;
  const mat = projMats[P.color] || (projMats[P.color] = new THREE.MeshLambertMaterial({ color: P.color, emissive: P.rocket ? 0x331100 : 0 }));
  const mesh = new THREE.Mesh(boxGeo, mat);
  mesh.scale.set(P.size, P.size, P.rocket ? 0.55 : 0.7);
  mesh.castShadow = true;
  scene.add(mesh);
  const pos = origin.clone();
  projectiles.push({ pos, vel: dir.clone().multiplyScalar(P.speed), owner: e, w, mesh, off: mz.clone().sub(origin), life: 6, trailT: 0 });
  placeProj(projectiles[projectiles.length - 1]);
}
function placeProj(p) {
  p.mesh.position.copy(p.pos).add(p.off);
  p.mesh.lookAt(p.mesh.position.clone().add(p.vel));
}
const _step = new V3();
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i], P = p.w.proj;
    p.life -= dt;
    p.vel.y -= P.gravity * dt;
    _step.copy(p.vel).multiplyScalar(dt);
    const len = _step.length(), d = _step.clone().divideScalar(len);
    const hit = castAll(p.pos, d, len, p.owner);
    p.off.multiplyScalar(Math.pow(0.0005, dt));
    if (hit.t < len || p.life <= 0) {
      if (P.rocket) explode(hit.t < len ? hit.point : p.pos, p.owner, p.w);
      else if (hit.ent) {
        let dmg = p.w.dmg * (hit.head ? 1.5 : 1);
        if (!p.owner.isPlayer && hit.ent.isPlayer) dmg *= DIFF.dmg;
        burst(hit.point, 0xff3b30, 7, 4, 0.09);
        damage(hit.ent, dmg, p.owner, hit.head);
      } else if (hit.t < len) {
        p.pos.copy(hit.point).addScaledVector(d, -0.25); p.off.set(0, 0, 0); placeProj(p);
        burst(hit.point, 0xc8a070, 3, 2, 0.05);
        stuck.push({ m: p.mesh, life: 5 }); projectiles.splice(i, 1); continue;
      }
      scene.remove(p.mesh); projectiles.splice(i, 1); continue;
    }
    p.pos.add(_step);
    placeProj(p);
    if (P.rocket) { p.trailT -= dt; if (p.trailT <= 0) { p.trailT = 0.025; burst(p.mesh.position, Math.random() < 0.4 ? 0xffa53a : 0x9a9a9a, 1, 0.6, 0.14); } }
  }
  for (let i = stuck.length - 1; i >= 0; i--) { stuck[i].life -= dt; if (stuck[i].life <= 0) { scene.remove(stuck[i].m); stuck.splice(i, 1); } }
}
function explode(pt, owner, w) {
  burst(pt, 0xffd23f, 14, 9, 0.22); burst(pt, 0xff6a1a, 14, 7, 0.28); burst(pt, 0x555555, 10, 4, 0.35);
  flashLight.position.copy(pt); flashLight.intensity = 9; flashLight.distance = 18;
  const dp = pt.distanceTo(player.pos);
  shake = Math.max(shake, 0.25 / (1 + dp * 0.15));
  boom(0.9 / (1 + dp * 0.08));
  for (const e of ents) {
    if (!e.alive) continue;
    const c = new V3(e.pos.x, e.pos.y + 1, e.pos.z);
    const d = c.distanceTo(pt);
    if (d > w.splash) continue;
    _d.copy(c).sub(pt); const dl = _d.length() || 1; _d.divideScalar(dl);
    if (castWorld(pt.clone().addScaledVector(_d, -0.1), _d, dl).t < dl - 0.3) continue; // behind cover
    let dmg = w.dmg * (1 - (d / w.splash) * 0.75);
    if (e === owner) dmg *= 0.4;
    else if (!owner.isPlayer && e.isPlayer) dmg *= DIFF.dmg;
    e.vel.addScaledVector(_d, 9 * (1 - d / w.splash)); e.vel.y += 4 * (1 - d / w.splash);
    damage(e, dmg, owner, false);
    if (state !== 'playing') return;
  }
}
function boom(vol) {
  if (!actx || vol < 0.02) return;
  const t = actx.currentTime, src = actx.createBufferSource(); src.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(80, t + 0.5);
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + 0.5);
}
function damage(v, amount, attacker, head) {
  if (!v.alive || state !== 'playing') return;
  v.hp -= amount; v.lastHurt = now; v.flashT = 0.12;
  if (v.isPlayer) { hurtFlash = Math.min(1, hurtFlash + amount / 45); shake = Math.max(shake, 0.04); beep(110, 0.08, 0.2, 'sawtooth'); }
  if (attacker && attacker.isPlayer && attacker !== v) { hitMarker(head, false); beep(head ? 1700 : 1200, 0.04, 0.12); }
  if (v.ai && attacker && attacker !== v) { v.ai.threat = attacker; v.ai.threatT = 3; }
  if (v.hp <= 0) kill(v, attacker, head);
}
function kill(v, a, head) {
  v.alive = false; v.hp = 0; v.deaths++; v.respawnT = 3; v.burstLeft = 0;
  const wi = a ? a.weaponIdx : 0;
  addFeed(a, v, WEAPONS[wi].name, head);
  if (v.model && v.model.g.visible) explodeModel(v);
  if (v.isPlayer) {
    $('deathmsg').classList.remove('hidden');
    $('deathby').textContent = a && a !== v ? `Eliminated by ${a.name} (${WEAPONS[a.weaponIdx].name})` : 'You blew yourself up';
    deathCam = 0;
    adsHeld = false;
  }
  if (a && a !== v) {
    a.kills++;
    if (a.isPlayer) hitMarker(head, true);
    if (a.weaponIdx === LAST) { endMatch(a); return; }
    a.weaponIdx++;
    giveWeapon(a);
    const fin = WEAPONS[LAST].name.toUpperCase();
    if (a.isPlayer) {
      announce(a.weaponIdx === LAST ? `FINAL WEAPON: ${fin}` : `UPGRADED: ${WEAPONS[a.weaponIdx].name}`, a.weaponIdx === LAST ? 'One more kill to win!' : `${LAST + 1 - a.weaponIdx} kills to win`);
      beep(660, 0.08, 0.15, 'triangle'); setTimeout(() => beep(990, 0.12, 0.15, 'triangle'), 80);
    } else if (a.weaponIdx === LAST) {
      announce(`${a.name} HAS THE ${fin}!`, 'Stop them before they get one more kill');
    }
  }
}

// ---------------------------------------------------------------- bot AI
function pathClear(b, x, z) {
  _d.set(x - b.pos.x, 0, z - b.pos.z); const dist = _d.length(); if (dist < 0.01) return true; _d.divideScalar(dist);
  return probeClear(b, _d.clone(), dist, 0.7);
}
function randomGoal(b) {
  let fallback = null;
  for (let i = 0; i < 30; i++) {
    const x = rand(-A + 2, A - 2), z = rand(-A + 2, A - 2);
    if (anyOverlap(x, 0, z)) continue;
    if (!b || pathClear(b, x, z)) return new V3(x, 0, z); // prefer goals reachable in a straight line
    if (!fallback) fallback = new V3(x, 0, z);
  }
  return fallback || new V3(0, 0, 0);
}
function findCover(b, threat) {
  let best = null, bestD = 1e9;
  for (let i = 0; i < 18; i++) {
    const a = rand(0, Math.PI * 2), r = rand(3, 13);
    const x = b.pos.x + Math.cos(a) * r, z = b.pos.z + Math.sin(a) * r;
    if (Math.abs(x) > A - 1 || Math.abs(z) > A - 1 || anyOverlap(x, 0, z)) continue;
    _o.set(threat.pos.x, threat.pos.y + EYE, threat.pos.z); _d.set(x, 1.0, z).sub(_o);
    const dist = _d.length(); _d.divideScalar(dist);
    if (castWorld(_o, _d, dist).t < dist - 0.3 && r < bestD) { bestD = r; best = new V3(x, 0, z); }
  }
  return best;
}
function findTarget(b) {
  let best = null, bestS = 1e9;
  for (const e of ents) {
    if (e === b || !e.alive) continue;
    const d = b.pos.distanceTo(e.pos);
    if (d > 75) continue;
    if (!canSee(b, e)) continue;
    let s = d * (e.isPlayer ? DIFF.focus : 1);
    if (b.ai.threat === e) s *= 0.5;
    if (s < bestS) { bestS = s; best = e; }
  }
  return best;
}
// probe from the centre and both shoulders so bots don't snag corners
function probeClear(b, dir, dist, h) {
  for (const s of [-0.38, 0, 0.38]) {
    _o.set(b.pos.x - dir.z * s, b.pos.y + h, b.pos.z + dir.x * s);
    if (castWorld(_o, dir, dist).t < dist) return false;
  }
  return true;
}
function pickEscape(b) {
  let best = null, bestL = -1;
  const off = rand(0, Math.PI * 2);
  for (let i = 0; i < 12; i++) {
    const a = off + i / 12 * Math.PI * 2, d = new V3(Math.sin(a), 0, Math.cos(a));
    _o.set(b.pos.x, b.pos.y + 0.7, b.pos.z);
    const L = Math.min(castWorld(_o, d, 8).t, 8) + rand(0, 1.5);
    if (L > bestL) { bestL = L; best = d; }
  }
  return best;
}
const _dir = new V3();
function updateBot(b, dt) {
  const ai = b.ai, w = WEAPONS[b.weaponIdx];
  ai.threatT -= dt; if (ai.threatT <= 0) ai.threat = null;
  ai.scanT -= dt;
  if (ai.scanT <= 0) {
    ai.scanT = rand(0.2, 0.35);
    const t = findTarget(b);
    if (t !== ai.target) {
      if (t) {
        const facing = Math.abs(angDiff(b.yaw, Math.atan2(-(t.pos.x - b.pos.x), -(t.pos.z - b.pos.z))));
        ai.react = (rand(0.45, 0.8) / ai.skill + (facing > 1.6 ? 0.35 : 0)) * DIFF.react;
        ai.seeT = 0;
      }
      if (ai.target && !t) ai.lastSeen = ai.target.pos.clone();
      ai.target = t; b.burstLeft = 0;
    }
  }
  const tgt = ai.target && ai.target.alive ? ai.target : null;
  if (!tgt) ai.target = null;

  let want = null; // desired horizontal direction
  let speed = 5.4 * (w.melee ? 1.2 : 1);
  if (tgt && b.hp < 45 && ai.mode !== 'cover' && ai.coverCd <= 0 && !w.melee) {
    const c = findCover(b, tgt);
    ai.coverCd = 4;
    if (c) { ai.mode = 'cover'; ai.goal = c; ai.coverT = rand(2.5, 4); }
  }
  ai.coverCd -= dt;
  if (ai.mode === 'cover') {
    ai.coverT -= dt;
    const d = _dir.copy(ai.goal).sub(b.pos).setY(0);
    if (d.length() > 0.8) want = d.normalize().clone(); else speed = 0;
    if (ai.coverT <= 0 && (b.hp > 70 || ai.coverT < -3)) { ai.mode = 'roam'; ai.goal = null; }
  } else if (tgt) {
    const to = _dir.copy(tgt.pos).sub(b.pos).setY(0); const dist = to.length(); to.normalize();
    ai.strafeT -= dt; if (ai.strafeT <= 0) { ai.strafeT = rand(0.5, 1.5); ai.strafe = Math.random() < 0.5 ? -1 : 1; if (Math.random() < 0.15 && b.onGround) b.vel.y = JUMP; }
    const fwd = w.melee ? 1 : dist > w.pref + 3 ? 1 : dist < w.pref - 3 ? -0.7 : 0;
    const st = w.melee ? 0.3 : 1;
    want = new V3(to.x * fwd - to.z * ai.strafe * st, 0, to.z * fwd + to.x * ai.strafe * st).normalize();
    speed *= w.melee ? 1 : 0.85;
    ai.mode = 'fight';
  } else {
    if (ai.mode === 'fight') { ai.mode = 'roam'; ai.goal = ai.lastSeen || null; }
    if (!ai.goal) ai.goal = ai.lastSeen || randomGoal(b);
    const d = _dir.copy(ai.goal).sub(b.pos).setY(0);
    if (d.length() < 1.5) { ai.goal = null; ai.lastSeen = null; } else want = d.normalize().clone();
  }
  // obstacle avoidance
  if (want && want.lengthSq() > 0) {
    if (!probeClear(b, want, 1.3, 0.7)) {
      if (probeClear(b, want, 1.3, 1.7) && b.onGround && (ai.mode !== 'fight' || w.melee)) b.vel.y = JUMP; // hop low obstacles
      else {
        let found = false;
        for (const a of [0.6, -0.6, 1.2, -1.2, 1.9, -1.9, 2.6, -2.6]) {
          const dd = want.clone().applyAxisAngle(_up, a * ai.turnBias);
          if (probeClear(b, dd, 1.3, 0.7)) { want = dd; found = true; break; }
        }
        if (!found) { want.negate(); ai.goal = null; }
      }
    }
  }
  // stuck detection -> escape manoeuvre -> (last resort) quiet relocation
  ai.stuckT -= dt;
  if (ai.stuckT <= 0) {
    ai.stuckT = 1.0;
    const moved = b.pos.distanceTo(ai.lastPos);
    ai.lastPos.copy(b.pos);
    if (want && speed > 0 && moved < 0.9 && ai.escapeT <= 0) {
      ai.stuckN++;
      ai.escapeDir = pickEscape(b); ai.escapeT = 0.9; ai.goal = null; ai.turnBias *= -1;
      if (b.onGround) b.vel.y = JUMP;
      if (ai.mode === 'cover') ai.mode = 'roam';
      if (ai.stuckN >= 4 && !(player.alive && canSee(player, b))) {
        const [x, z] = pickSpawn(b); b.pos.set(x, 0, z); b.vel.set(0, 0, 0); ai.stuckN = 0; ai.lastPos.copy(b.pos);
      }
    } else if (moved >= 0.9) ai.stuckN = 0;
  }
  if (ai.escapeT > 0) { ai.escapeT -= dt; want = ai.escapeDir; speed = 5.4; }
  const tx = want ? want.x * speed : 0, tz = want ? want.z * speed : 0;
  const k = Math.min(1, dt * (b.onGround ? 10 : 2));
  b.vel.x = lerp(b.vel.x, tx, k); b.vel.z = lerp(b.vel.z, tz, k);

  // aiming / shooting
  if (tgt) {
    const eye = new V3(b.pos.x, b.pos.y + EYE, b.pos.z);
    const aimAt = new V3(tgt.pos.x, tgt.pos.y + (w.splash ? 0.3 : Math.random() < 0.15 ? 1.8 : 1.15), tgt.pos.z);
    let d = aimAt.clone().sub(eye);
    const dist = d.length();
    if (w.proj && w.proj.gravity) { const tt = dist / w.proj.speed; aimAt.y += 0.5 * w.proj.gravity * tt * tt; d = aimAt.clone().sub(eye); }
    const dYaw = Math.atan2(-d.x, -d.z), dPitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    const turn = 7 * ai.skill * DIFF.turn * dt;
    b.yaw += clamp(angDiff(b.yaw, dYaw), -turn, turn);
    b.pitch = lerp(b.pitch, dPitch, Math.min(1, dt * 8));
    ai.seeT += dt;
    const aligned = Math.abs(angDiff(b.yaw, dYaw)) < 0.2;
    if (b.burstLeft > 0) { fire(b, aimDir(ai, d), eye, w.spread); }
    else if (b.reloadT <= 0 && ai.seeT > ai.react && aligned && dist < w.range + (w.melee ? 0.3 : 0)) {
      ai.burstT -= dt;
      if (ai.burstT > 0) {
        if (fire(b, aimDir(ai, d), eye, w.spread * (w.scope ? 0.05 : 0.7))) { if (!w.auto) ai.burstT -= rand(0.1, 0.4) * DIFF.pause; }
      } else if (ai.burstT < -rand(0.25, 0.6) * DIFF.pause) ai.burstT = w.auto ? rand(0.4, 1.0) : rand(0.3, 1.2);
    }
  } else {
    if (want) { const dYaw = Math.atan2(-want.x, -want.z); b.yaw += clamp(angDiff(b.yaw, dYaw), -5 * dt, 5 * dt); }
    b.pitch = lerp(b.pitch, 0, dt * 4);
    if (b.ammo < WEAPONS[b.weaponIdx].mag * 0.5) startReload(b);
  }
}
const _up = new V3(0, 1, 0);
function aimDir(ai, d) {
  const err = Math.max(0.018, 0.1 - ai.seeT * 0.025) / ai.skill * DIFF.err;
  const dir = d.clone().normalize();
  dir.x += rand(-err, err); dir.y += rand(-err, err) * 0.6; dir.z += rand(-err, err);
  return dir.normalize();
}
function animateBot(b, dt) {
  const md = b.model;
  md.g.position.copy(b.pos); md.g.rotation.y = b.yaw;
  const sp = Math.hypot(b.vel.x, b.vel.z);
  b.walkPh = (b.walkPh || 0) + sp * dt * 2.2;
  const sw = Math.sin(b.walkPh) * Math.min(1, sp / 4) * 0.8;
  md.legL.rotation.x = sw; md.legR.rotation.x = -sw;
  const k = Math.min(1, dt * 12);
  if (b.ai && b.ai.target) {
    md.armR.rotation.x = lerp(md.armR.rotation.x, Math.PI / 2 + b.pitch, k);
    md.armL.rotation.x = lerp(md.armL.rotation.x, Math.PI / 2 + b.pitch - 0.1, k); md.armL.rotation.y = -0.5;
  } else {
    md.armR.rotation.x = lerp(md.armR.rotation.x, 0.6, Math.min(1, dt * 6));
    md.armL.rotation.x = lerp(md.armL.rotation.x, -sw, Math.min(1, dt * 6)); md.armL.rotation.y = 0;
  }
  md.swingT = (md.swingT || 0) - dt;
  if (md.swingT > 0) md.armR.rotation.x = Math.PI / 2 + 1.2 * Math.sin((md.swingT / 0.25) * Math.PI);
  if (b.reloadT > 0) md.armR.rotation.x = 0.3 + Math.sin(now * 12) * 0.1;
  const f = b.flashT > 0 ? 1 : 0;
  for (const m of md.mats) m.emissive.setRGB(f * 0.9, f * 0.1, f * 0.1);
  md.flashT = (md.flashT || 0) - dt; md.flash.visible = md.flashT > 0;
  if (md.flash.visible) md.flash.rotation.z = Math.random() * 3;
}

// ---------------------------------------------------------------- input
const keys = {};
let mouseDown = false, adsHeld = false, locked = false, tabHeld = false;
const SENS = 0.0022;
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Tab') { e.preventDefault(); tabHeld = true; }
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  if (e.code === 'KeyR' && state === 'playing' && player.alive) startReload(player);
  if ((e.code === 'Escape' || e.code === 'KeyP') && !locked) { if (state === 'playing') pause(); else if (state === 'paused' && e.code === 'KeyP') resume(); }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; if (e.code === 'Tab') tabHeld = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseDown = false; adsHeld = false; if (touchActive) resetTouch(); });
document.addEventListener('mousedown', (e) => {
  if (state !== 'playing') return;
  if (e.button === 0) { mouseDown = true; player.trigger = true; }
  if (e.button === 2) adsHeld = true;
});
document.addEventListener('mouseup', (e) => { if (e.button === 0) mouseDown = false; if (e.button === 2) adsHeld = false; });
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('mousemove', (e) => {
  if (state !== 'playing' || !player || !player.alive) return;
  if (!locked && !(dragLook && e.buttons)) return;
  const z = adsHeld ? WEAPONS[player.weaponIdx].fov / 75 : 1;
  player.yaw -= e.movementX * SENS * z;
  player.pitch = clamp(player.pitch - e.movementY * SENS * z, -1.5, 1.5);
});
// Desktop: pointer lock, with a drag-to-look fallback when the browser/iframe refuses it.
let dragLook = false;
function enableDragLook() {
  if (dragLook || touchActive) return;
  dragLook = true;
  if (state === 'playing') announce('MOUSE LOCK UNAVAILABLE', 'Hold a mouse button and drag to look · Esc / P to pause');
}
function requestLock() {
  if (touchActive) return;
  const el = renderer.domElement;
  if (!el.requestPointerLock) { enableDragLook(); return; }
  try { const p = el.requestPointerLock(); if (p && p.catch) p.catch(() => enableDragLook()); } catch (err) { enableDragLook(); }
}
document.addEventListener('pointerlockerror', enableDragLook);
document.addEventListener('pointerlockchange', () => {
  const was = locked;
  locked = document.pointerLockElement === renderer.domElement;
  if (was && !locked && state === 'playing') pause();
});

// ---------------------------------------------------------------- touch controls (multi-touch)
let touchActive = false;
const joy = { id: null, x: 0, y: 0, ox: 0, oy: 0 };
const touches = new Map(); // identifier -> { x, y, a, el, fire, btn }
const TSENS = 0.0055, JOY_R = 56;
let jumpQ = 0;
const tui = $('touchui'), joyBase = $('tjoy'), joyKnob = $('tjoyknob');
function computeTouch() {
  touchActive = settings.ctrl === 'touch' || (settings.ctrl !== 'mouse' && COARSE_AUTO);
  document.body.classList.toggle('touch', touchActive);
  if (touchActive && document.pointerLockElement) document.exitPointerLock();
}
function resetJoy() { joy.id = null; joy.x = joy.y = 0; joyBase.classList.remove('active'); joyBase.style.left = ''; joyBase.style.top = ''; joyKnob.style.transform = ''; }
function resetTouch() {
  resetJoy(); touches.clear();
  keys.Space = false; mouseDown = false;
  tui.querySelectorAll('.tb.on').forEach((b) => b.classList.remove('on'));
}
function lookBy(dx, dy) {
  if (!player || !player.alive || state !== 'playing') return;
  const z = adsHeld ? WEAPONS[player.weaponIdx].fov / 75 : 1;
  player.yaw -= dx * TSENS * z;
  player.pitch = clamp(player.pitch - dy * TSENS * z, -1.5, 1.5);
}
function tryLandscape() {
  const d = document.documentElement;
  try {
    if (d.requestFullscreen && !document.fullscreenElement) {
      const p = d.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) p.then(() => { try { const q = screen.orientation.lock('landscape'); if (q && q.catch) q.catch(() => {}); } catch (e) { /* ignore */ } }).catch(() => {});
    }
  } catch (e) { /* fullscreen unsupported (e.g. iPhone Safari) */ }
}
tui.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (state !== 'playing' || !player) return;
  initAudio();
  for (const t of e.changedTouches) {
    const b = t.target && t.target.closest ? t.target.closest('[data-tb]') : null;
    if (b) {
      const a = b.dataset.tb;
      touches.set(t.identifier, { x: t.clientX, y: t.clientY, a, el: b, fire: a === 'fire', btn: a !== 'fire' });
      if (a === 'fire') { b.classList.add('on'); mouseDown = true; player.trigger = true; }
      else if (a === 'jump') { b.classList.add('on'); keys.Space = true; jumpQ = 0.2; }
      else if (a === 'reload') { b.classList.add('on'); if (player.alive) startReload(player); }
      else if (a === 'aim') adsHeld = !adsHeld && !WEAPONS[player.weaponIdx].melee;
      else if (a === 'board') tabHeld = !tabHeld;
      else if (a === 'pause') pause();
      continue;
    }
    if (t.clientX < window.innerWidth * 0.42 && joy.id === null) {
      joy.id = t.identifier; joy.ox = t.clientX; joy.oy = t.clientY; joy.x = joy.y = 0;
      joyBase.classList.add('active'); joyBase.style.left = t.clientX + 'px'; joyBase.style.top = t.clientY + 'px'; joyKnob.style.transform = '';
    } else touches.set(t.identifier, { x: t.clientX, y: t.clientY });
  }
}, { passive: false });
tui.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) {
      let dx = t.clientX - joy.ox, dy = t.clientY - joy.oy;
      const l = Math.hypot(dx, dy);
      if (l > JOY_R) { dx *= JOY_R / l; dy *= JOY_R / l; }
      joy.x = dx / JOY_R; joy.y = dy / JOY_R;
      joyKnob.style.transform = `translate(${dx}px,${dy}px)`;
      continue;
    }
    const r = touches.get(t.identifier);
    if (r && !r.btn) { lookBy(t.clientX - r.x, t.clientY - r.y); r.x = t.clientX; r.y = t.clientY; } // look pad, and the fire button drags to aim too
  }
}, { passive: false });
function touchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) { resetJoy(); continue; }
    const r = touches.get(t.identifier);
    if (!r) continue;
    touches.delete(t.identifier);
    if (r.a === 'fire') { if (![...touches.values()].some((o) => o.fire)) { mouseDown = false; r.el.classList.remove('on'); } }
    else if (r.a === 'jump') { keys.Space = false; r.el.classList.remove('on'); }
    else if (r.a === 'reload') r.el.classList.remove('on');
  }
}
tui.addEventListener('touchend', touchEnd, { passive: false });
tui.addEventListener('touchcancel', touchEnd, { passive: false });
// no page scroll / pinch-zoom while playing
document.addEventListener('touchmove', (e) => { if (state === 'playing') e.preventDefault(); }, { passive: false });
['gesturestart', 'gesturechange'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('dblclick', (e) => e.preventDefault());
function syncTouchUI() {
  document.body.classList.toggle('playing', state === 'playing');
  if (!touchActive) return;
  $('tb-aim').classList.toggle('on', adsHeld);
  $('tb-board').classList.toggle('on', tabHeld);
}


// ---------------------------------------------------------------- HUD
const hud = {
  root: $('hudroot'), hpfill: $('hpfill'), hptext: $('hptext'), ammo: $('ammo'), wname: $('wname'), reload: $('reloadmsg'),
  ladder: $('ladder'), killsleft: $('killsleft'), leader: $('leader'), feed: $('feed'), announce: $('announce'),
  vignette: $('vignette'), hit: $('hitmarker'), scope: $('scope'), cross: $('crosshair'), board: $('board'),
  cht: $('ch-t'), chb: $('ch-b'), chl: $('ch-l'), chr: $('ch-r'),
};
let hitT = 0, announceT = 0, hurtFlash = 0, lastLadder = -1;
function hitMarker(head, killed) {
  hitT = killed ? 0.35 : 0.15;
  hud.hit.style.color = killed ? '#ff3b30' : head ? '#ffd23f' : '#ffffff';
}
function announce(text, sub) {
  hud.announce.innerHTML = `${text}<small>${sub || ''}</small>`;
  announceT = 2.6;
}
function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function addFeed(a, v, wname, head) {
  const d = document.createElement('div');
  const nm = (e) => e ? `<span class="${e.isPlayer ? 'me' : ''}">${esc(e.name)}</span>` : '';
  d.innerHTML = a && a !== v ? `${nm(a)}<span class="w">[${esc(wname)}${head ? ' ✸' : ''}]</span>${nm(v)}` : `${nm(v)}<span class="w">[oof]</span>`;
  const wrap = document.createElement('div'); wrap.style.cssText = 'background:none;padding:0;margin:0;display:block'; wrap.appendChild(d);
  hud.feed.prepend(wrap);
  while (hud.feed.children.length > 6) hud.feed.lastChild.remove();
  setTimeout(() => { d.style.opacity = '0'; setTimeout(() => wrap.remove(), 600); }, 5000);
}
function currentSpread() {
  const w = WEAPONS[player.weaponIdx];
  const moving = Math.hypot(player.vel.x, player.vel.z) > 1;
  let s = w.spread;
  if (adsHeld) s = w.adsSpread != null ? w.adsSpread : s * 0.45;
  if (moving) s *= w.scope && adsHeld ? 8 : 1.5;
  if (!player.onGround) s *= 2;
  return s + recoilOff * 0.15;
}
function updateHUD(dt) {
  const p = player, w = WEAPONS[p.weaponIdx];
  const hp = Math.max(0, Math.round(p.hp));
  hud.hpfill.style.width = hp + '%';
  hud.hpfill.style.background = hp > 50 ? 'linear-gradient(#5be36b,#2bb34a)' : hp > 25 ? 'linear-gradient(#ffd84a,#e0a800)' : 'linear-gradient(#ff6a5a,#d42a1a)';
  hud.hptext.textContent = hp;
  hud.wname.textContent = w.name;
  hud.ammo.innerHTML = w.melee ? 'MELEE' : `${p.ammo}<small> / ${w.mag}</small>`;
  hud.reload.textContent = w.melee ? '' : p.reloadT > 0 ? 'RELOADING…' : p.ammo === 0 ? 'PRESS R' : p.ammo <= Math.ceil(w.mag * 0.25) ? 'LOW AMMO' : '';
  if (lastLadder !== p.weaponIdx) {
    lastLadder = p.weaponIdx;
    [...hud.ladder.children].forEach((el, i) => { el.classList.toggle('cur', i === p.weaponIdx); el.classList.toggle('done', i < p.weaponIdx); });
  }
  const left = LAST + 1 - p.weaponIdx;
  hud.killsleft.textContent = left === 1 ? `${WEAPONS[LAST].name.toUpperCase()} — 1 KILL TO WIN` : `${left} KILLS TO WIN`;
  let lead = ents[0]; for (const e of ents) if (e.weaponIdx > lead.weaponIdx || (e.weaponIdx === lead.weaponIdx && e.kills > lead.kills)) lead = e;
  hud.leader.textContent = `Leader: ${lead.name} (${WEAPONS[lead.weaponIdx].name})`;
  // crosshair
  const scoped = w.scope && adsHeld && p.alive;
  hud.scope.style.display = scoped ? 'block' : 'none';
  hud.cross.style.display = scoped ? 'none' : 'block';
  const gap = 4 + currentSpread() * 420;
  hud.cht.style.top = (-gap - 9) + 'px'; hud.chb.style.top = gap + 'px';
  hud.chl.style.left = (-gap - 9) + 'px'; hud.chr.style.left = gap + 'px';
  hitT -= dt; hud.hit.style.opacity = hitT > 0 ? 1 : 0;
  announceT -= dt; hud.announce.style.opacity = announceT > 0 ? Math.min(1, announceT * 2) : 0;
  const lowHp = p.alive && p.hp < 30 ? 0.35 + Math.sin(now * 6) * 0.1 : 0;
  hurtFlash = Math.max(0, hurtFlash - dt * 1.5);
  hud.vignette.style.opacity = Math.max(hurtFlash, lowHp);
  hud.board.style.display = tabHeld ? 'block' : 'none';
  if (tabHeld) {
    const rows = [...ents].sort((a, b) => b.weaponIdx - a.weaponIdx || b.kills - a.kills);
    hud.board.innerHTML = `<table><tr><th>PLAYER</th><th>WEAPON</th><th>LEVEL</th><th>K</th><th>D</th></tr>${rows.map((e) =>
      `<tr class="${e.isPlayer ? 'me' : ''}"><td>${esc(e.name)}</td><td>${WEAPONS[e.weaponIdx].name}</td><td>${e.weaponIdx + 1}/${LAST + 1}</td><td>${e.kills}</td><td>${e.deaths}</td></tr>`).join('')}</table>`;
  }
}

// ---------------------------------------------------------------- game flow
let state = 'menu';
let shake = 0, recoilOff = 0, yawKick = 0, deathCam = 0, matchWinner = null;
const BEST_KEY = 'gunfightArena3d.best2';
const SETTINGS_KEY = 'gunfightArena3d.settings';
function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch (e) { return {}; } }
function saveBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { /* ignore */ } }
function fmtTime(s) { s = Math.round(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function bestText() {
  const b = loadBest();
  return Object.keys(DIFFS).map((k) => { const r = b[k] || { wins: 0, fastest: null }; return `${DIFFS[k].name}: ${r.wins} win${r.wins === 1 ? '' : 's'}${r.fastest != null ? ` (best ${fmtTime(r.fastest)})` : ''}`; }).join('  ·  ');
}
let settings = { map: 'random', set: 'classic', diff: 'easy', ctrl: 'auto' };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}); } catch (e) { /* ignore */ }
if (!(settings.map in MAPS) && settings.map !== 'random') settings.map = 'random';
if (!(settings.set in SETS)) settings.set = 'classic';
if (!(settings.diff in DIFFS)) settings.diff = 'easy';
if (!['auto', 'touch', 'mouse'].includes(settings.ctrl)) settings.ctrl = 'auto';
const PICKERS = {
  map: [...MAP_IDS.map((id) => [id, MAPS[id].name, MAPS[id].desc]), ['random', 'Random', 'Surprise me']],
  set: Object.keys(SETS).map((id) => [id, SETS[id].name, SETS[id].desc]),
  diff: Object.keys(DIFFS).map((id) => [id, DIFFS[id].name, { easy: 'Slow, forgiving bots', normal: 'A fair fight', hard: 'Sharp, fast bots' }[id]]),
  ctrl: [['auto', 'Auto', COARSE_AUTO ? 'Touch screen found' : 'Mouse found'], ['touch', 'Touch', 'On-screen controls'], ['mouse', 'Mouse + Keys', 'Desktop controls']],
};
function renderPickers() {
  for (const key of Object.keys(PICKERS)) {
    const el = document.querySelector(`.opts[data-key="${key}"]`);
    el.innerHTML = PICKERS[key].map(([id, name, desc]) => `<button class="opt${settings[key] === id ? ' sel' : ''}" data-id="${id}" title="${esc(desc)}">${esc(name)}<small>${esc(desc)}</small></button>`).join('');
  }
}
document.querySelectorAll('.opts').forEach((el) => el.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.opt'); if (!btn) return;
  const key = el.dataset.key; settings[key] = btn.dataset.id;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  renderPickers();
  if (key === 'ctrl') computeTouch();
  if (key === 'map') buildMap(settings.map === 'random' ? MAP_IDS[Math.floor(Math.random() * MAP_IDS.length)] : settings.map);
}));
function buildLadder() {
    lastLadder = -1;
}
function clearActors() {
  for (const e of ents) if (e.model) scene.remove(e.model.g);
  for (const p of debris) scene.remove(p.m); debris.length = 0;
  for (const p of projectiles) scene.remove(p.mesh); projectiles.length = 0;
  for (const p of stuck) scene.remove(p.m); stuck.length = 0;
  for (const p of particles) scene.remove(p.m); particles.length = 0;
  ents = []; bots = [];
}
function setupMatch() {
  clearActors();
  const mapId = settings.map === 'random' ? MAP_IDS[Math.floor(Math.random() * MAP_IDS.length)] : settings.map;
  buildMap(mapId);
  WEAPONS = SETS[settings.set].list.map((k) => WDEF[k]); LAST = WEAPONS.length - 1;
  DIFF = DIFFS[settings.diff];
  buildLadder();
  hud.feed.innerHTML = '';
  player = makeEnt('You', true, 0x2fb5e0);
  player.model = buildBot(0x2fb5e0, 'You'); player.model.g.visible = false; // only shown on the end screen
  const defs = BOT_DEFS.slice().sort(() => Math.random() - 0.5).slice(0, BOT_COUNT);
  for (const [name, color] of defs) {
    const b = makeEnt(name, false, color);
    b.model = buildBot(color, name);
    b.ai = { target: null, mode: 'roam', goal: null, scanT: rand(0, 0.3), react: 0.5, seeT: 0, strafeT: 0, strafe: 1, burstT: 0.5, coverCd: 0, coverT: 0,
      stuckT: 1, stuckN: 0, escapeT: 0, escapeDir: null, lastPos: new V3(), turnBias: Math.random() < 0.5 ? 1 : -1, skill: rand(0.8, 1.15), threat: null, threatT: 0, lastSeen: null };
    bots.push(b);
  }
  ents = [player, ...bots];
  for (const e of ents) spawn(e);
  player.model.g.visible = false;
  matchTime = 0; recoilOff = 0; shake = 0; matchWinner = null;
}
function startGame() {
  initAudio(); resetTouch();
  if (touchActive) tryLandscape();
  setupMatch();
  state = 'playing';
  ['startscreen', 'winscreen', 'pausescreen', 'deathmsg'].forEach((id) => $(id).classList.add('hidden'));
  hud.root.classList.remove('hidden');
  announce(`${MAPS[currentMap].name.toUpperCase()} — FIGHT!`, `${SETS[settings.set].name} weapons · ${DIFF.name} bots · ${LAST + 1} kills to win`);
  requestLock();
}
function toMenu() {
  state = 'menu'; mouseDown = false; adsHeld = false; tabHeld = false; resetTouch();
  if (document.pointerLockElement) document.exitPointerLock();
  clearActors(); player = null;
  ['winscreen', 'pausescreen', 'deathmsg'].forEach((id) => $(id).classList.add('hidden'));
  hud.root.classList.add('hidden');
  $('startscreen').classList.remove('hidden');
  $('beststart').textContent = bestText();
  camera.fov = 75; camera.updateProjectionMatrix();
}
function pause() {
  if (state !== 'playing') return;
  state = 'paused'; mouseDown = false; adsHeld = false; resetTouch();
  $('pausescreen').classList.remove('hidden');
}
function resume() {
  if (state !== 'paused') return;
  state = 'playing'; $('pausescreen').classList.add('hidden');
  initAudio(); requestLock();
}
function endMatch(winner) {
  state = 'over'; mouseDown = false; adsHeld = false; tabHeld = false; resetTouch(); matchWinner = winner;
  if (document.pointerLockElement) document.exitPointerLock();
  const won = winner.isPlayer;
  const best = loadBest(); const r = best[settings.diff] || { wins: 0, fastest: null };
  if (won) { r.wins++; if (r.fastest == null || matchTime < r.fastest) r.fastest = matchTime; best[settings.diff] = r; saveBest(best); }
  // victory pose for the winner (also shows the player's own avatar)
  const md = winner.model;
  if (winner.isPlayer) { setBotGun(winner); md.g.position.copy(winner.pos); md.g.rotation.y = winner.yaw; }
  md.g.visible = true;
  md.legL.rotation.x = md.legR.rotation.x = 0;
  md.armR.rotation.set(Math.PI * 0.95, 0, -0.25); md.armL.rotation.set(Math.PI * 0.95, 0, 0.25);
  for (const m of md.mats) m.emissive.setRGB(0, 0, 0);
  const fin = WEAPONS[LAST].name;
  $('wintitle').textContent = won ? 'VICTORY!' : 'DEFEAT';
  $('wintitle').style.color = won ? '#ffd23f' : '#ff5a5a';
  $('winsub').textContent = won ? `You got the final kill with the ${fin}!` : `${winner.name} got the final kill with the ${fin}.`;
  $('winstats').innerHTML = `${esc(MAPS[currentMap].name)} · ${SETS[settings.set].name} weapons · ${DIFF.name} bots<br>Your kills: <b>${player.kills}</b> · Deaths: <b>${player.deaths}</b><br>Weapon reached: <b>${WEAPONS[player.weaponIdx].name}</b> (${player.weaponIdx + 1}/${LAST + 1})<br>Match time: <b>${fmtTime(matchTime)}</b>`;
  $('bestwin').textContent = bestText();
  $('deathmsg').classList.add('hidden');
  hud.root.classList.add('hidden');
  setTimeout(() => { if (state === 'over') $('winscreen').classList.remove('hidden'); }, 900);
  beep(won ? 523 : 220, 0.2, 0.2, 'triangle'); setTimeout(() => beep(won ? 784 : 165, 0.35, 0.2, 'triangle'), 180);
}
// end-of-match camera: orbit the winner (no inherited death-cam roll)
function overCamera(t, dt) {
  const wp = matchWinner.pos, a = t / 3500;
  const head = new V3(wp.x, wp.y + 1.6, wp.z);
  const dir = new V3(Math.cos(a), 0.45, Math.sin(a)).normalize();
  const dist = Math.min(7, castWorld(head, dir, 7).t - 0.4);
  camera.position.copy(head).addScaledVector(dir, Math.max(1.5, dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(head);
  camera.fov = lerp(camera.fov, 60, Math.min(1, dt * 4)); camera.updateProjectionMatrix();
}
$('playbtn').addEventListener('click', startGame);
$('againbtn').addEventListener('click', startGame);
$('menubtn').addEventListener('click', toMenu);
$('pmenubtn').addEventListener('click', (e) => { e.stopPropagation(); toMenu(); });
$('resumebtn').addEventListener('click', (e) => { e.stopPropagation(); resume(); });
$('pausescreen').addEventListener('click', resume);
renderer.domElement.addEventListener('click', () => { if (state === 'playing' && !locked && !dragLook && !touchActive) requestLock(); });
computeTouch();
renderPickers();
$('beststart').textContent = bestText();
buildMap(settings.map === 'random' ? 'arena' : settings.map);

// ---------------------------------------------------------------- player update
function updatePlayer(dt) {
  const p = player, w = WEAPONS[p.weaponIdx];
  if (!p.alive) {
    p.vel.x *= 0.9; p.vel.z *= 0.9; p.trigger = false;
    return;
  }
  let fx = 0, fz = 0;
  if (keys.KeyW || keys.ArrowUp) fz += 1;
  if (keys.KeyS || keys.ArrowDown) fz -= 1;
  if (keys.KeyD || keys.ArrowRight) fx += 1;
  if (keys.KeyA || keys.ArrowLeft) fx -= 1;
  if (joy.id !== null && Math.hypot(joy.x, joy.y) > 0.12) { fx += joy.x; fz -= joy.y; }
  const amt = Math.min(1, Math.hypot(fx, fz));
  const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
  let mx = -sy * fz + cy * fx, mz = -cy * fz - sy * fx;
  const len = Math.hypot(mx, mz) || 1; mx /= len; mz /= len;
  const speed = (adsHeld ? 4.2 : 7.2) * (w.melee ? 1.15 : 1);
  const k = Math.min(1, dt * (p.onGround ? 14 : 3));
  p.vel.x = lerp(p.vel.x, mx * speed * amt, k);
  p.vel.z = lerp(p.vel.z, mz * speed * amt, k);
  if ((keys.Space || jumpQ > 0) && p.onGround) { p.vel.y = JUMP; p.onGround = false; jumpQ = 0; }
  jumpQ -= dt;
  // shooting
  if (p.trigger && !mouseDown && p.reloadT > 0) p.trigger = false;
  // p.trigger latches quick taps/clicks that end before the next frame
  if ((mouseDown && (w.auto || p.trigger)) || p.burstLeft > 0 || (p.trigger && !mouseDown)) {
    const dir = new V3(0, 0, -1).applyEuler(camera.rotation);
    const origin = camera.position.clone();
    if (fire(p, dir, origin, currentSpread())) p.trigger = false;
    else if (p.ammo <= 0) p.trigger = false;
  }
}
function updateTimers(e, dt) {
  e.cd -= dt; e.flashT -= dt;
  if (e.reloadT > 0) { e.reloadT -= dt; if (e.reloadT <= 0) { e.reloadT = 0; e.ammo = WEAPONS[e.weaponIdx].mag; if (e.isPlayer) beep(520, 0.05, 0.15); } }
  if (e.alive && now - e.lastHurt > 4 && e.hp < 100) e.hp = Math.min(100, e.hp + 22 * dt);
  if (!e.alive) {
    e.respawnT -= dt;
    if (e.respawnT <= 0) { spawn(e); if (e.isPlayer) $('deathmsg').classList.add('hidden'); }
    else if (e.isPlayer) $('deathby').dataset.t = Math.ceil(e.respawnT);
  }
}

// ---------------------------------------------------------------- camera & viewmodel
function updateCamera(dt) {
  const p = player, w = WEAPONS[p.weaponIdx];
  recoilOff = lerp(recoilOff, 0, Math.min(1, dt * 7));
  yawKick = lerp(yawKick, 0, Math.min(1, dt * 9));
  shake = Math.max(0, shake - dt * 0.25); shake *= Math.pow(0.02, dt);
  if (p.alive) {
    camera.position.set(p.pos.x, p.pos.y + EYE, p.pos.z);
    camera.rotation.set(p.pitch + recoilOff, p.yaw + yawKick, 0);
  } else {
    deathCam = Math.min(1, deathCam + dt * 2);
    camera.position.set(p.pos.x, lerp(p.pos.y + EYE, p.pos.y + 0.4, deathCam), p.pos.z);
    camera.rotation.set(p.pitch, p.yaw, deathCam * 0.6);
  }
  if (shake > 0.0005) { camera.position.x += rand(-1, 1) * shake; camera.position.y += rand(-1, 1) * shake; camera.position.z += rand(-1, 1) * shake; }
  const scoped = w.scope && adsHeld && p.alive;
  if (w.melee && adsHeld) adsHeld = false;
  const targetFov = adsHeld && p.alive ? w.fov : 75;
  camera.fov = lerp(camera.fov, targetFov, Math.min(1, dt * 14)); camera.updateProjectionMatrix();
  // viewmodel
  const moving = Math.hypot(p.vel.x, p.vel.z);
  vm.bob += dt * moving * 1.4;
  vm.kick = Math.max(0, vm.kick - dt * 9);
  vm.swap = Math.max(0, vm.swap - dt * 3.5);
  const ads = adsHeld && p.alive ? 1 : 0;
  vm.adsK = lerp(vm.adsK || 0, ads, Math.min(1, dt * 14));
  const bobA = (p.onGround ? Math.min(1, moving / 7) : 0) * (1 - vm.adsK * 0.8);
  vm.group.position.set(
    lerp(0.21, 0, vm.adsK) + Math.sin(vm.bob) * 0.012 * bobA,
    lerp(-0.2, -0.085, vm.adsK) - Math.abs(Math.cos(vm.bob)) * 0.014 * bobA - vm.swap * 0.3 + (p.onGround ? 0 : 0.02),
    lerp(-0.6, -0.5, vm.adsK) + vm.kick * 0.06);
  vm.group.rotation.set(vm.kick * 0.12 + vm.swap * 0.8, 0, 0);
  if (vm.gun) vm.gun.rotation.y = 0.07 * (1 - vm.adsK);
  if (w.melee) { const sw = Math.sin(vm.kick * Math.PI); vm.group.rotation.set(-0.35 - sw * 0.9, sw * 0.9, -0.3 + sw * 0.5); vm.group.position.x -= sw * 0.18; vm.group.position.z = -0.5 - sw * 0.15; }
  if (p.reloadT > 0 && !w.melee) { const r = Math.sin(Math.min(1, (w.reload - p.reloadT) / w.reload) * Math.PI); vm.group.rotation.x -= r * 0.6; vm.group.position.y -= r * 0.08; vm.group.rotation.z = r * 0.3; }
  else if (!w.melee) vm.group.rotation.z = 0;
  vm.group.visible = p.alive && !scoped;
  vm.flashT -= dt; vm.flash.visible = vm.flashT > 0;
  if (vm.flash.visible) vm.flash.rotation.z = Math.random() * 3;
  flashLight.intensity = Math.max(0, flashLight.intensity - dt * 40);
  vmCam.fov = lerp(60, 50, vm.adsK); vmCam.updateProjectionMatrix();
}

// ---------------------------------------------------------------- main loop
let last = performance.now();
function frame(t) {
  requestAnimationFrame(frame);
  syncTouchUI();
  let dt = (t - last) / 1000; last = t;
  dt = Math.min(dt, 0.05);
  if (state === 'playing') {
    now += dt; matchTime += dt;
    updatePlayer(dt);
    for (const b of bots) if (b.alive) updateBot(b, dt);
    for (const e of ents) {
      updateTimers(e, dt);
      if (state !== 'playing') break;
      if (e.alive) physics(e, dt);
    }
    for (const b of bots) if (b.alive) animateBot(b, dt);
    if (state === 'playing') updateProjectiles(dt);
    if (player && !player.alive) $('deathby').textContent = $('deathby').textContent.replace(/ — respawning.*$/, '') + ` — respawning in ${Math.max(1, Math.ceil(player.respawnT))}`;
    updateHUD(dt);
  }
  if (state === 'playing' || state === 'over') updateParticles(dt);
  if (state === 'menu') {
    // slow orbit over the arena behind the start screen
    const a = t / 9000;
    camera.position.set(Math.cos(a) * 34, 20, Math.sin(a) * 34);
    camera.lookAt(0, 2, 0);
    vm.group.visible = false;
  } else if (state === 'over' && matchWinner) overCamera(t, dt);
  else if (player) updateCamera(dt);
  renderer.clear();
  renderer.render(scene, camera);
  if (state === 'playing' || state === 'paused') { renderer.clearDepth(); renderer.render(vmScene, vmCam); }
}
requestAnimationFrame(frame);

// debug/test hook
window.__gfa = { get touchActive() { return touchActive; }, get joy() { return joy; }, get dragLook() { return dragLook; }, get adsHeld() { return adsHeld; }, get state() { return state; }, get player() { return player; }, get bots() { return bots; }, get WEAPONS() { return WEAPONS; }, get map() { return currentMap; }, settings, startGame, toMenu, kill, castAll, buildMap, renderPickers };
})();
