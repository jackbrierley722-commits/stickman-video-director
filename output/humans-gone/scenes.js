// What if humans disappeared: fixed street camera, then the city decays through the years.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
const AT = wt;
let renderer, scene, camera, out, octx, small, sctx, glc, ENV, EIMG, FEATH, STARS, GRAIN;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0 }, o));
const Bm = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d);
function RB(w, h, d, r = 0.05) { const s = new T3.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new T3.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.6, bevelSegments: 3, curveSegments: 6 }); g.translate(0, 0, -d / 2); return g; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g }; return t; }
let GLOW; function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function sun(g, x, y, z, tx, ty, tz, col = '#fff2dc', I = 3, size = 12) { const d = new T3.DirectionalLight(col, I); d.position.set(x, y, z); d.target.position.set(tx, ty, tz); d.castShadow = true; d.shadow.mapSize.set(1024, 1024); const c = d.shadow.camera; c.left = c.bottom = -size; c.right = c.top = size; c.near = 0.5; c.far = 200; d.shadow.bias = -0.0004; d.shadow.radius = 3; g.add(d); g.add(d.target); return d; }
// smooth people (PS4-ish proportions)
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#d8a888', { roughness: 0.6 }), top = SM(o.top || '#3a6aa8', { roughness: 0.8 }), bot = SM(o.bot || '#2a2e3a', { roughness: 0.8 });
  const body = new T3.Group(); g.add(body); add(body, new T3.CapsuleGeometry(0.19, 0.42, 6, 14), top, 0, 1.18, 0).scale.z = 0.75; add(body, new T3.SphereGeometry(0.13, 20, 16), skin, 0, 1.68, 0); add(body, new T3.SphereGeometry(0.135, 20, 12, 0, PI * 2, 0, PI * 0.55), SM(o.hair || '#2a1c14', { roughness: 0.9 }), 0, 1.7, -0.01);
  const limb = (x, y, r, l, m) => { const p = new T3.Group(); p.position.set(x, y, 0); body.add(p); add(p, new T3.CapsuleGeometry(r, l, 4, 10), m, 0, -l / 2 - r, 0); return p; };
  const armL = limb(-0.25, 1.48, 0.06, 0.48, top), armR = limb(0.25, 1.48, 0.06, 0.48, top), legL = limb(-0.1, 0.9, 0.08, 0.66, bot), legR = limb(0.1, 0.9, 0.08, 0.66, bot);
  for (const p of [armL, armR]) add(p, new T3.SphereGeometry(0.055, 14, 10), skin, 0, -0.62, 0.01); for (const p of [legL, legR]) { const sh = add(p, RB(0.13, 0.08, 0.26, 0.03), SM(o.shoe || '#1e1e22', { roughness: 0.5 }), 0, -0.84, 0.05); sh.rotation.x = PI / 2; }
  add(body, new T3.CylinderGeometry(0.05, 0.06, 0.1, 12), skin, 0, 1.55, 0); for (const sx of [-1, 1]) { add(body, new T3.SphereGeometry(0.017, 10, 8), SM('#16120f', { roughness: 0.2 }), sx * 0.045, 1.7, 0.118, false); add(body, Bx(0.05, 0.012, 0.01), SM(o.hair || '#2a1c14'), sx * 0.046, 1.735, 0.122, false); add(body, new T3.SphereGeometry(0.03, 10, 8), skin, sx * 0.13, 1.68, 0, false); }
  add(body, new T3.SphereGeometry(0.022, 10, 8), skin, 0, 1.665, 0.13, false); add(body, Bx(0.05, 0.008, 0.01), SM('#8a4a3a'), 0, 1.625, 0.122, false); add(body, new T3.TorusGeometry(0.075, 0.02, 8, 20), top, 0, 1.5, 0, false).rotation.x = PI / 2;
  g.userData = { body, armL, armR, legL, legR }; return g; }
function walkP(p, ph, a = 1) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.6 * a; u.legR.rotation.x = -s * 0.6 * a; u.armL.rotation.x = -s * 0.5 * a; u.armR.rotation.x = s * 0.5 * a; u.body.position.y = Math.abs(C(ph)) * 0.03 * a; }
function rest(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); u.body.position.y = 0; u.body.rotation.set(0, 0, 0); }

const G = {}; const R = {}; let SNAP; const TOTAL = 46;
// story time: video seconds -> days since humans vanished (log interpolated)
const KT = [0, 3, 7, 11, 16, 22, 28, 34, 40, 46], KD = [0, 1.2, 30, 365, 3650, 9125, 36500, 109500, 365000, 3650000];
function days(T) { let i = 0; while (i < KT.length - 2 && T > KT[i + 1]) i++; const k = prog(T, KT[i], KT[i + 1]); return Math.exp(lerp(Math.log(KD[i] + 1), Math.log(KD[i + 1] + 1), k)) - 1; }
function stamp(T) { const d = days(T); if (d < 1) return 'HOUR ' + Math.max(1, Math.floor(d * 24)); if (d < 30) return 'DAY ' + Math.floor(d); if (d < 365) return 'MONTH ' + Math.max(1, Math.floor(d / 30.4)); return 'YEAR ' + Math.floor(d / 365).toLocaleString('en-US'); }
const yrs = T => days(T) / 365;
// ---------- textures ----------
function winTex(seed, lit) { const r = rng(seed); return ctex(128, 256, (c, w, h) => { c.fillStyle = lit ? '#000' : '#8a8a90'; c.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 32) for (let x = 8; x < w; x += 30) { if (lit) { c.fillStyle = r() < 0.55 ? `rgb(255,${200 + r() * 40},${120 + r() * 60})` : '#000'; } else c.fillStyle = r() < 0.5 ? '#2a3a4a' : '#3a4a5a'; c.fillRect(x, y, 18, 22); } }); }
function asphalt() { const r = rng(2); const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#3a3a3e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},255,0.05)`; c.fillRect(r() * w, r() * h, 2, 2); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(2, 40); return t; }
function vineTex() { const r = rng(9); return ctex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 70; i++) { let x = r() * w, y = h; c.strokeStyle = `rgba(${40 + r() * 40},${100 + r() * 60},${30 + r() * 30},0.9)`; c.lineWidth = 3 + r() * 5; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 30; k++) { x += (r() - 0.5) * 20; y -= 8 + r() * 14; c.lineTo(x, y); } c.stroke(); for (let k = 0; k < 40; k++) { c.fillStyle = `rgba(${50 + r() * 50},${120 + r() * 70},${40 + r() * 30},0.85)`; c.beginPath(); c.arc(r() * w, h - r() * h * (0.3 + r() * 0.7), 4 + r() * 8, 0, 7); c.fill(); } } }); }
// ---------- city ----------
const BLD = [];
function buildCity() { const g = G.city = new T3.Group(); scene.add(g); const asp = SM('#ffffff', { map: asphalt(), roughness: 0.92 });
  R.road = add(g, Bx(14, 0.1, 420), asp, 0, -0.05, -180); for (const sx of [-1, 1]) add(g, Bx(4.5, 0.3, 420), SM('#9a968e', { roughness: 0.9 }), sx * 9.25, 0.1, -180);
  for (let z = 6; z > -380; z -= 9) add(g, Bx(0.25, 0.02, 4), SM('#e8e0c0', { roughness: 0.6 }), 0, 0.01, z);
  add(g, Bx(2000, 0.1, 2000), SM('#4a5a3a', { roughness: 1 }), 0, -0.2, -300);
  const r = rng(21); const winMat = []; let id = 0;
  for (const sx of [-1, 1]) { let z = 0; while (z > -330) { const w = 12 + r() * 10, d = 12 + r() * 6, h = 14 + r() * 50 * (1 - z / -600); const x = sx * (11.5 + d / 2); const col = ['#b8aa98', '#9a8e80', '#c8bca8', '#8a8a92', '#a89282'][Math.floor(r() * 5)];
      const lit = winTex(100 + id, true), day = winTex(200 + id, false); [lit, day].forEach(t => { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(w / 8, h / 9); });
      const m = new T3.MeshStandardMaterial({ color: col, map: day, emissiveMap: lit, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.75 });
      const b = new T3.Group(); b.position.set(x, 0, z - w / 2); g.add(b); const body = add(b, Bx(d, h, w), m, 0, h / 2, 0); add(b, Bx(d + 0.6, 0.6, w + 0.6), SM('#6a6660'), 0, h + 0.3, 0);
      const vine = new T3.MeshStandardMaterial({ map: vineTex(), transparent: true, opacity: 0, roughness: 0.9, depthWrite: false }); vine.map.wrapS = T3.RepeatWrapping; vine.map.repeat.set(w / 14, 1); const vm = add(b, Bx(d + 0.15, h * 1.0, w + 0.15), vine, 0, h / 2, 0, false);
      b.userData = { m, h, w, d, sx, vine, fall: null, col: new T3.Color(col), seed: r(), vineStart: 4 + r() * 20, vineReach: 0.3 + r() * 0.7 }; BLD.push(b); z -= w + 1 + r() * 3; id++; } }
  // landmark tower at the end of the street
  { const h = 190, w = 34, d = 34; const lit = winTex(999, true), day = winTex(998, false); [lit, day].forEach(t => { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(5, 22); }); const m = new T3.MeshStandardMaterial({ color: '#8aa0b8', map: day, emissiveMap: lit, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.3, metalness: 0.4 });
    const b = new T3.Group(); b.position.set(-8, 0, -360); g.add(b); add(b, Bx(d, h, w), m, 0, h / 2, 0); add(b, new T3.CylinderGeometry(0.4, 0.4, 30, 8), SM('#ccc', { metalness: 0.8 }), 0, h + 15, 0); R.tower = b; b.userData = { m, h, col: new T3.Color('#8aa0b8') }; }
  // street lamps + traffic lights
  R.lamps = []; for (let z = -4; z > -300; z -= 22) for (const sx of [-1, 1]) { add(g, new T3.CylinderGeometry(0.12, 0.16, 7, 8), SM('#3a3a40', { metalness: 0.6 }), sx * 7.6, 3.5, z); add(g, Bx(1.6, 0.15, 0.3), SM('#3a3a40'), sx * 6.9, 7, z); const bulb = add(g, Bx(0.6, 0.12, 0.35), new T3.MeshBasicMaterial({ color: '#ffd8a0', toneMapped: false }), sx * 6.4, 6.9, z, false); R.lamps.push([bulb, glow(g, '#ffc880', 4, sx * 6.4, 6.7, z, 0.6)]); }
  R.tl = []; for (const z of [-30, -110]) { add(g, new T3.CylinderGeometry(0.12, 0.12, 5, 8), SM('#2a2a2e'), 7.4, 2.5, z); add(g, Bx(0.5, 1.4, 0.5), SM('#1a1a1e'), 7.4, 5.4, z); const L = []; ['#ff3a2a', '#ffb02a', '#3aff6a'].forEach((c, k) => L.push(add(g, new T3.CircleGeometry(0.16, 16), new T3.MeshBasicMaterial({ color: c, toneMapped: false }), 7.4, 5.85 - k * 0.45, z + 0.26, false))); R.tl.push(L); }
  R.cityL = []; for (let z = -10; z > -300; z -= 40) { const pl = new T3.PointLight('#ffc890', 30, 40, 1.6); pl.position.set(0, 6, z); g.add(pl); R.cityL.push(pl); } }
// ---------- cars ----------
const CARS = [];
function car(x, z, col, ry) { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; G.city.add(g); const paint = SM(col, { roughness: 0.3, metalness: 0.5 });
  const body = add(g, RB(1.9, 0.75, 4.4, 0.25), paint, 0, 0.75, 0); const cab = add(g, RB(1.7, 0.65, 2.3, 0.25), paint, 0, 1.35, -0.2); add(g, RB(1.72, 0.5, 2.1, 0.2), SM('#1a2a3a', { roughness: 0.1, metalness: 0.6 }), 0, 1.38, -0.2);
  const wheels = []; for (const [wx, wz] of [[-0.9, 1.4], [0.9, 1.4], [-0.9, -1.4], [0.9, -1.4]]) { const wh = add(g, new T3.CylinderGeometry(0.36, 0.36, 0.25, 16), SM('#151515', { roughness: 0.9 }), wx, 0.36, wz); wh.rotation.z = PI / 2; wheels.push(wh); }
  const hz = [add(g, Bx(0.3, 0.12, 0.05), new T3.MeshBasicMaterial({ color: '#ffa020', toneMapped: false }), -0.7, 0.9, -2.21, false), add(g, Bx(0.3, 0.12, 0.05), new T3.MeshBasicMaterial({ color: '#ffa020', toneMapped: false }), 0.7, 0.9, -2.21, false)];
  g.userData = { paint, wheels, hz, col: new T3.Color(col), z0: z }; CARS.push(g); return g; }
// ---------- nature ----------
let GRASS, TREES = [], DEER = [];
function buildNature() { const N = 4200; const r = rng(31); GRASS = new T3.InstancedMesh(new T3.ConeGeometry(0.05, 0.55, 3), SM('#5a8a3a', { roughness: 0.9 }), N); GRASS.userData.d = []; for (let i = 0; i < N; i++) { let x = (r() - 0.5) * 22, z = -4 - r() * 330; if (z > -9 && x > 0 && x < 6) z -= 8; GRASS.userData.d.push([x, z, r(), 0.6 + r() * 1.4, r() * 6]); } G.city.add(GRASS);
  const trunk = SM('#5a4030', { roughness: 0.9 }), crowns = ['#3a7a2a', '#4a8a30', '#2f6a2a'].map(c => SM(c, { roughness: 0.85 }));
  for (let i = 0; i < 110; i++) { const x = (r() - 0.5) * 24, z = 2 - r() * 320; if (Math.abs(x) < 2 && z > -14) continue; const t = new T3.Group(); t.position.set(x, 0, z); G.city.add(t); const hgt = 6 + r() * 10; add(t, new T3.CylinderGeometry(0.15, 0.3, hgt, 8), trunk, 0, hgt / 2, 0); for (let k = 0; k < 3; k++) add(t, new T3.IcosahedronGeometry(2.2 + r() * 1.5, 1), crowns[k], (r() - 0.5) * 2, hgt + (r() - 0.3) * 2, (r() - 0.5) * 2);
    t.userData = { born: 0.5 + r() * 40, full: 15 + r() * 40 }; t.visible = false; TREES.push(t); }
  // forest beyond, revealed in the long run
  R.forest = new T3.Group(); G.city.add(R.forest); for (let i = 0; i < 260; i++) { const x = (r() - 0.5) * 500, z = 40 - r() * 520; if (Math.abs(x) < 14 && z > -330) continue; const s_ = 6 + r() * 6; add(R.forest, new T3.CylinderGeometry(s_ * 0.06, s_ * 0.1, s_ * 1.2, 6), trunk, x, s_ * 0.6, z); add(R.forest, new T3.IcosahedronGeometry(s_, 1), crowns[i % 3], x, s_ * 1.5, z).userData.s = s_; } R.forest.visible = false;
  for (let i = 0; i < 3; i++) { const d = new T3.Group(); G.city.add(d); const fur = SM('#8a5a34', { roughness: 0.9 }); add(d, new T3.CapsuleGeometry(0.32, 0.9, 6, 10), fur, 0, 1.05, 0).rotation.x = PI / 2; const nk = add(d, new T3.CapsuleGeometry(0.12, 0.5, 4, 8), fur, 0, 1.45, 0.6); nk.rotation.x = -0.6; add(d, new T3.CapsuleGeometry(0.11, 0.25, 4, 8), fur, 0, 1.75, 0.82).rotation.x = PI / 2.4;
    const legs = []; for (const [lx, lz] of [[-0.18, 0.45], [0.18, 0.45], [-0.18, -0.45], [0.18, -0.45]]) { const p = new T3.Group(); p.position.set(lx, 0.95, lz); d.add(p); add(p, new T3.CylinderGeometry(0.05, 0.04, 0.95, 6), fur, 0, -0.47, 0); legs.push(p); } if (i === 0) for (const sx of [-1, 1]) add(d, new T3.CylinderGeometry(0.02, 0.03, 0.5, 5), SM('#d8c8a8'), sx * 0.1, 2.05, 0.75).rotation.z = sx * 0.4;
    d.userData = { legs, off: i * 1.3 }; DEER.push(d); } }
// ---------- timeline ----------
const EV = { crash: 1.8, power: 4.0, crack: 7.5, deer: 11.4, camMove: 16, rust: 17, fall1: 23.8, sky: 30.5, forest: 34.5, end: 40.5 };
const FALLERS = [];
function decay(T) { const y = yrs(T), d = days(T);
  // power + lamps + windows
  const pow = T < EV.power ? 1 : (T < EV.power + 0.6 ? (S(T * 60) > 0 ? 0.6 : 0.05) * (1 - prog(T, EV.power, EV.power + 0.6)) : 0);
  BLD.forEach(b => b.userData.m.emissiveIntensity = pow * 1.2); R.tower.userData.m.emissiveIntensity = pow * 1.4; R.lamps.forEach(([bulb, gl]) => { bulb.visible = pow > 0.1; gl.material.opacity = 0.6 * pow; }); R.cityL.forEach(l => l.intensity = 30 * pow);
  R.tl.forEach(L => { const ph = Math.floor(T / 1.2) % 3; L.forEach((m, k) => m.visible = pow > 0.1 && k === ph); });
  // grass through cracks
  const gk = clamp(Math.log10(d + 1) / 2.6); const dummy = new T3.Object3D(); GRASS.userData.d.forEach(([x, z, r0, sc, rot], i) => { const on = r0 < gk; const s_ = on ? sc * clamp((gk - r0) * 4) * (0.6 + clamp(y / 30) * 0.9) : 0.0001; dummy.position.set(x, s_ * 0.33, z); dummy.rotation.set(0, rot, (r0 - 0.5) * 0.4); dummy.scale.setScalar(s_); dummy.updateMatrix(); GRASS.setMatrixAt(i, dummy.matrix); }); GRASS.instanceMatrix.needsUpdate = true;
  GRASS.material.color.set(y > 0.3 ? '#4a7a2e' : '#6a9a40');
  TREES.forEach(t => { const u = t.userData; const g_ = clamp((y - u.born) / u.full); t.visible = g_ > 0.01; t.scale.setScalar(0.08 + 0.92 * ease(g_)); });
  R.forest.visible = y > 120; R.forest.children.forEach((c, i) => c.scale.setScalar(clamp((y - 120 - (Math.floor(i / 2) % 9) * 20) / 300) + 0.001));
  // cars rust, sink, get covered
  const rust = clamp(Math.log10(y + 1) / 1.6), bury = clamp((y - 60) / 400); CARS.forEach((c, i) => { c.userData.paint.color.copy(c.userData.col).lerp(new T3.Color('#6a3a1e'), rust).lerp(new T3.Color('#3a5a2a'), clamp((y - 25) / 80)); c.position.y = -1.2 * bury - (y > 3 ? 0.18 : 0); c.visible = bury < 0.98; c.userData.hz.forEach(h => h.visible = T > EV.crash && T < 7 && Math.floor(T * 2.2) % 2 === 0); });
  // buildings: vines, dirt, collapse
  BLD.forEach(b => { const u = b.userData; u.vine.opacity = clamp((y - u.vineStart) / 40) * u.vineReach + clamp((y - 150) / 300) * 0.3; u.m.color.copy(u.col).lerp(new T3.Color('#5a554a'), clamp(y / 80)); });
  FALLERS.forEach(f => { const b = f.b, u = b.userData; const k = prog(T, f.t0, f.t0 + f.dur); if (T < f.t0) { b.rotation.set(0, 0, 0); b.position.y = 0; b.visible = true; f.rubble.visible = false; return; }
    b.rotation.z = -u.sx * ease(k) * 1.3 * f.dir; b.position.y = -ease(k) * u.h * 0.5; b.visible = k < 0.98; f.rubble.visible = k > 0.5; f.rubble.scale.set(1, clamp((k - 0.5) * 2) * (1 - clamp((y - 400) / 3000) * 0.6) + 0.01, 1);
    f.dust.forEach((p, i) => { const q = prog(T, f.t0 + 0.3, f.t0 + f.dur + 2.5); p.visible = q > 0 && q < 1; p.position.set(b.position.x + S(i * 2.1) * u.d * (0.4 + q), 1 + q * u.h * 0.35 * ((i % 5) / 5 + 0.3), b.position.z + C(i * 1.7) * u.w * (0.4 + q)); p.scale.setScalar(4 + q * 18); p.material.opacity = 0.5 * S(q * PI); }); });
  // generic slow ruin of the rest (shorter + rubble) after centuries
  const ruin = clamp((y - 150) / 700); BLD.forEach(b => { if (b.userData.fell) return; b.scale.y = 1 - ruin * (0.55 + b.userData.seed * 0.4); });
  // tower
  const tk = prog(T, EV.sky, EV.sky + 4.2); R.tower.rotation.x = ease(tk) * 0.9; R.tower.position.y = -ease(tk) * 60; R.tower.visible = tk < 0.99; R.towerRubble.visible = tk > 0.6; R.towerRubble.scale.y = clamp((tk - 0.6) * 2.5) * (1 - clamp((y - 600) / 6000) * 0.6) + 0.01;
  R.tdust.forEach((p, i) => { const q = prog(T, EV.sky + 0.8, EV.sky + 7); p.visible = q > 0 && q < 1; p.position.set(-8 + S(i * 2.1) * (20 + q * 60), 6 + q * 70 * ((i % 6) / 6 + 0.2), -360 + C(i * 1.3) * (20 + q * 60)); p.scale.setScalar(20 + q * 60); p.material.opacity = 0.5 * S(q * PI); });
  // the street itself disappears under soil after millennia
  R.road.material.color.set('#ffffff').lerp(new T3.Color('#4a5a3a'), clamp((y - 300) / 1500)); }
function setupFallers() { const cand = BLD.map((b, i) => [b.userData.h, i, b.position.z]).filter(c => c[2] < -25 && c[2] > -230).sort((a, b) => b[0] - a[0]); const pick = [cand[0][1], cand[1][1], cand[3][1], cand[2][1]]; const times = [EV.fall1, EV.fall1 + 2.2, 27.0, 33.2]; pick.forEach((bi, k) => { const b = BLD[bi]; if (!b) return; b.userData.fell = true; const rub = add(G.city, new T3.SphereGeometry(1, 16, 8, 0, PI * 2, 0, PI / 2), SM('#7a746a', { roughness: 1 }), b.position.x, 0, b.position.z); rub.scale.set(b.userData.d * 0.8, 1, b.userData.w * 0.7); rub.userData.base = [b.userData.d * 0.8, b.userData.h * 0.18, b.userData.w * 0.7]; rub.scale.set(...rub.userData.base); const dust = []; for (let i = 0; i < 14; i++) { const s_ = glow(G.city, '#c8bca8', 1, 0, -50, 0, 0); s_.material.blending = T3.NormalBlending; dust.push(s_); } FALLERS.push({ b, t0: times[k], dur: 2.4, dir: k % 2 ? -1 : 1, rubble: rub, dust }); });
  FALLERS.forEach(f => { const base = f.rubble.userData.base; const orig = f.rubble.scale; f.rubble.scale.set(base[0], base[1], base[2]); const sy = base[1]; Object.defineProperty(f, 'sy', { value: sy }); });
  R.towerRubble = add(G.city, new T3.SphereGeometry(1, 20, 10, 0, PI * 2, 0, PI / 2), SM('#6a7078', { roughness: 0.9 }), -8, 0, -350); R.towerRubble.scale.set(40, 30, 50); R.tdust = []; for (let i = 0; i < 24; i++) { const s_ = glow(G.city, '#c8c4bc', 1, 0, -50, 0, 0); s_.material.blending = T3.NormalBlending; R.tdust.push(s_); } }
// sky + sun by time
function skyAt(T) { const night = T < 5 ? 1 : 1 - prog(T, 5, 7.2); const dawn = S(prog(T, 4.5, 8) * PI); return { night, dawn }; }
function lightUp(T) { const { night, dawn } = skyAt(T); const top = new T3.Color('#4a8ad8').lerp(new T3.Color('#ff9a5a'), dawn * 0.6).lerp(new T3.Color('#060a1a'), night), bot = new T3.Color('#cfe4f4').lerp(new T3.Color('#ffc890'), dawn * 0.7).lerp(new T3.Color('#141a30'), night);
  const c = R.skyT.userData.g; const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + top.getHexString()); gr.addColorStop(1, '#' + bot.getHexString()); c.fillStyle = gr; c.fillRect(0, 0, 16, 256); R.skyT.needsUpdate = true; scene.fog.color.copy(bot);
  const ang = T < 7 ? lerp(-0.2, 0.5, prog(T, 4.5, 7)) : 0.5 + 0.35 * S((T - 7) * 0.18); R.sun.position.set(-60 * C(ang) + 30, 90 * Math.max(0.05, S(ang + 0.3)), 40); R.sun.intensity = 3.2 * (1 - night); R.hemi.intensity = 0.25 + 0.55 * (1 - night); R.moonL.intensity = 0.5 * night; renderer.toneMappingExposure = 1.0 + 0.3 * night; }
// camera: locked for the first 16 s, then it moves around
const CAMS = [
  [0, (k, T) => cam([3.2, 1.7, 9], [0, 4.5, -60])],
  [EV.camMove, (k, T) => camL([3.2, 1.7, 9], [1.5, 5.5, -22], k, [0, 4.5, -60], [-4, 6, -80])],
  [22, (k, T) => { const b = FALLERS[0].b; camL([-b.position.x * 0.6, b.userData.h * 0.9, b.position.z + b.userData.h * 1.4], [-b.position.x * 0.5, b.userData.h * 0.85, b.position.z + b.userData.h * 1.25], k, [b.position.x, b.userData.h * 0.45, b.position.z], [b.position.x, b.userData.h * 0.3, b.position.z]); }],
  [EV.fall1 + 1.9, (k, T) => { const b = FALLERS[1].b; camL([-b.position.x * 0.6, b.userData.h * 0.9, b.position.z + b.userData.h * 1.4], [-b.position.x * 0.5, b.userData.h * 0.85, b.position.z + b.userData.h * 1.3], k, [b.position.x, b.userData.h * 0.4, b.position.z], [b.position.x, b.userData.h * 0.25, b.position.z]); }],
  [27.6, (k, T) => camL([25, 40, -220], [22, 42, -240], k, [-8, 95, -360], [-8, 60, -360])],
  [EV.forest - 0.2, (k, T) => camL([0, 8, -40], [0, 70, -10], k, [0, 2, -150], [0, 0, -190])],
  [EV.end, (k, T) => { const a = lerp(0.2, -0.3, k); camL([S(a) * 160, 150, -180 + C(a) * 160], [S(a) * 160, 170, -180 + C(a) * 160], k, [0, 0, -190], [0, 0, -190]); }] ];
function camAt(T) { let i = 0; for (let k = 0; k < CAMS.length; k++) if (T >= CAMS[k][0]) i = k; const t0 = CAMS[i][0], t1 = i + 1 < CAMS.length ? CAMS[i + 1][0] : TOTAL; CAMS[i][1](prog(T, t0, t1), T); return { i, t0 }; }
function animate(T) { const c0 = CARS[0]; const ck = prog(T, 0, EV.crash); c0.position.z = lerp(c0.userData.z0, CARS[1].position.z + 4.6, ease(ck * 0.6 + ck * ck * 0.4)); c0.rotation.y = T > EV.crash ? -0.12 * ease(prog(T, EV.crash, EV.crash + 0.3)) : 0; c0.userData.wheels.forEach(w => w.rotation.x = -T * 8 * (1 - ck));
  if (T > EV.crash && T < EV.crash + 0.3) CARS[1].position.x = 1.8 + S((T - EV.crash) * 60) * 0.06;
  DEER.forEach((d, i) => { const k = prog(T, EV.deer - 0.4 + d.userData.off * 0.4, EV.deer + 5); d.visible = k > 0 && k < 1; d.position.set(lerp(-12, 10, k) + i * 1.5, 0, -18 - i * 3); d.rotation.y = PI / 2; d.userData.legs.forEach((l, j) => l.rotation.x = S(T * 9 + j * PI / 2 + i) * 0.5); }); }
// ---------- HUD ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(5,6,10,0.9)'; const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
const CAPT = [[0.15, 3.0, 'EVERY HUMAN', 'JUST DISAPPEARED'], [EV.power - 0.3, 6.6, 'THE POWER', 'GOES OUT'], [EV.crack, 10.6, 'PLANTS CRACK', 'THE ROADS'], [EV.deer, 15.4, 'ANIMALS TAKE', 'THE STREETS'], [EV.rust, 21.2, 'CARS RUST', 'AWAY'], [EV.fall1 - 0.4, 27.2, 'BUILDINGS', 'START TO FALL'], [EV.sky - 0.4, 34.0, 'THE TALLEST', 'TOWER FALLS'], [EV.forest + 0.4, 40.0, 'THE CITY BECOMES', 'A FOREST'], [EV.end + 0.4, 46.5, 'ALMOST NOTHING', 'IS LEFT']];
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(55, RW / RH, 0.1, 1500); R.skyT = ctex(16, 256, () => {}); scene.background = R.skyT; scene.fog = new T3.Fog('#cfe4f4', 120, 700);
  buildCity(); car(1.8, -14, '#c83a2a', 0); car(1.8, -14, '#2a5ac8', 0); CARS[0].position.z = 30; CARS[0].userData.z0 = 30; car(-3.5, -30, '#e8e8e8', PI); car(3.5, -45, '#2a2a2e', 0.05); car(-3.2, -62, '#d8b02a', PI + 0.1); car(3.3, -80, '#4a7a4a', -0.04); car(-3.4, -120, '#8a2a6a', PI); car(1.0, -150, '#c8c8c8', 0.3);
  buildNature(); setupFallers();
  R.sun = new T3.DirectionalLight('#fff0d8', 3); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -120; sc.right = sc.top = 120; sc.near = 1; sc.far = 400; R.sun.shadow.bias = -0.0005; R.sun.target.position.set(0, 0, -60); scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#cfe4ff', '#4a4a3a', 0.6); scene.add(R.hemi); R.moonL = new T3.DirectionalLight('#8aa8ff', 0.5); R.moonL.position.set(30, 60, 20); scene.add(R.moonL);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ac8f0'); gr.addColorStop(0.5, '#e0ecf4'); gr.addColorStop(1, '#5a5a4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); ENV = pm.fromScene(es, 0.02).texture; scene.environment = ENV; }
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TOTAL;
window.renderFrame = function (T) { camera.up.set(0, 1, 0); lightUp(T); decay(T); animate(T); const { i, t0 } = camAt(T); renderer.render(scene, camera); const y = yrs(T);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = `contrast(1.06) saturate(${1.05 + clamp(y / 50) * 0.15})`; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(3px)'; octx.globalAlpha = 0.14; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.18); if (i > 1 && tk < 1) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let j = 1; j <= 4; j++) { const sc = 1 + (1 - tk) * 0.04 * j; octx.globalAlpha = 0.2 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.6) contrast(2.4)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.35; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.06; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const vg = octx.createRadialGradient(360, 640, 400, 360, 640, 920); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // year counter (always on), occasional captions
  octx.save(); octx.fillStyle = 'rgba(6,8,12,0.75)'; octx.beginPath(); octx.roundRect(170, 48, 380, 96, 48); octx.fill(); octx.restore(); txt(stamp(T), 360, 98, 46, '#ffd25a', 'center', 'Russo'); txt('WITHOUT HUMANS', 360, 166, 18, 'rgba(255,255,255,0.8)', 'center', 'PressStart');
  CAPT.forEach(([a, b, l1, l2]) => { if (T > a && T < b) { const k = ease(prog(T, a, a + 0.3)) * (1 - ease(prog(T, b - 0.3, b))); big(l1, 1010, 56, '#fff', k); big(l2, 1080, 56, '#fff', k); } });
  const L0 = 18.2, L1 = 21.2; if (T > L0 && T < L1) { const k = ease(prog(T, L0, L0 + 0.3)) * (1 - ease(prog(T, L1 - 0.3, L1))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(6,8,12,0.85)'; octx.beginPath(); octx.roundRect(170, 860, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd25a'; octx.lineWidth = 3; octx.stroke(); octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 895); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 896, 24, '#fff'); const fo = T > L0 + 1.1; octx.fillStyle = fo ? '#5ad88a' : '#ffd25a'; octx.beginPath(); octx.roundRect(340, 873, 190, 44, 22); octx.fill(); txt(fo ? 'FOLLOWING' : '+ FOLLOW', 435, 896, 20, '#0a0a10'); octx.restore(); }
  if (T > 42.6) { const k = prog(T, 42.6, 43.0); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(6,8,12,0.85)'; octx.beginPath(); octx.roundRect(60, 560, 600, 170, 30); octx.fill(); octx.restore(); big('WHAT WOULD LAST LONGEST?', 615, 38, '#ffd25a', k); big('COMMENT . FOLLOW FOR MORE', 680, 30, '#fff', prog(T, 43.3, 43.7)); } };
})();
