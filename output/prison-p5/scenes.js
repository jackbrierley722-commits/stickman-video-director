// Prison escape. Part 1. First person, PS3-style low-poly (flat shaded, moderate poly counts, antialiased).
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
let renderer, scene, camera, out, octx, small, sctx, glc, GRAIN, GLOW, SNAP;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0, flatShading: true }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new T3.CylinderGeometry(a, b, h, n), Sp = (r, a = 10, b = 8) => new T3.SphereGeometry(r, a, b);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g }; return t; }
function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function look(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// first-person camera: position + look target, with breathing and walk bob
function fp(p, l, T, bob = 0, sway = 1) { const br = S(T * 1.7) * 0.006 * sway, sw = S(T * 0.9) * 0.01 * sway; const b = bob ? Math.abs(S(T * 9)) * 0.045 * bob : 0, bx = bob ? S(T * 4.5) * 0.03 * bob : 0;
  look([p[0] + bx, p[1] + br + b, p[2]], [l[0] + sw, l[1] + br * 3 + b * 0.5, l[2]]); }

// ---------- timing ----------
const E = { think: AT(0, 'the'), recap: CL[1].start, found: AT(1, 'found'), c2: CL[2].start, threw: AT(2, 'threw'), lightF: AT(2, 'the', 1), c3: CL[3].start, climbed: AT(3, 'climbed'),
  c4: CL[4].start, dogs: AT(4, 'get'), c5: CL[5].start, leaves: AT(5, 'he'), cap: AT(5, 'cap'), c6: CL[6].start, driver: AT(6, 'driver'), engine: AT(6, 'engine'), front: AT(6, 'front'),
  c7: CL[7].start, guard: AT(7, 'guard'), steps: AT(7, 'steps'), torch: AT(7, 'torch'), wants: AT(7, 'he'), optA: CL[8].start, optB: AT(8, 'option', 1), comment: AT(8, 'comment'), follow: AT(8, 'follow') };
E.loop = TM.total - 0.4;
const FL = [];
function flashAt(T) { let v = 0; FL.forEach(f => { const d = T - f; if (d >= 0 && d < 0.35) v = Math.max(v, (d < 0.08 ? 1 : d < 0.15 ? 0.3 : d < 0.22 ? 0.8 : 0) * (1 - d * 2)); }); return v; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
function talking(ci, T) { if (CLI(T) !== ci) return 0; for (const w of CL[ci].words) if (T >= w.a - 0.02 && T <= w.b) return 0.45 + 0.55 * Math.abs(S(T * 26)); return 0; }

// ---------- low-poly people ----------
function person(o) { const g = new T3.Group(); const w = o.w || 1; const skin = SM(o.skin), top = SM(o.top), bot = SM(o.bot || o.top), dark = SM('#141010', { roughness: 0.4 });
  const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  add(up, Cy(0.2 * w, 0.16 * w, 0.58, 9), top, 0, 0.3, 0).scale.z = 0.62; add(g, Cy(0.165 * w, 0.17 * w, 0.18, 9), bot, 0, 0.93, 0).scale.z = 0.7; add(up, Cy(0.055, 0.065, 0.12, 7), skin, 0, 0.64, 0);
  const head = new T3.Group(); head.position.set(0, 0.78, 0); up.add(head); add(head, Sp(0.118, 10, 8), skin).scale.set(0.9, 1.12, 1);
  add(head, Bx(0.15, 0.07, 0.12), skin, 0, -0.07, 0.025).scale.set(1, 1, 1);
  for (const sx of [-1, 1]) { add(head, Sp(0.021, 7, 5), SM('#f0ece4', { roughness: 0.3 }), sx * 0.042, 0.018, 0.093, false); const pu = add(head, Sp(0.012, 6, 5), dark, sx * 0.042, 0.018, 0.111, false); pu.userData.eye = 1;
    add(head, Bx(0.05, 0.014, 0.014), SM(o.brow || '#1a120c'), sx * 0.043, 0.05, 0.103, false).rotation.z = sx * (o.angry ? 0.25 : 0.08); add(head, Sp(0.028, 6, 5), skin, sx * 0.108, 0.0, 0, false).scale.set(0.5, 1, 0.8); }
  const nose = add(head, new T3.ConeGeometry(0.022, 0.055, 4), skin, 0, -0.012, 0.118, false); nose.rotation.x = PI / 2;
  const mouth = add(head, Bx(0.05, 0.012, 0.012), SM('#2a0c08', { roughness: 0.5 }), 0, -0.07, 0.093, false);
  if (o.hair) add(head, new T3.SphereGeometry(0.123, 10, 6, 0, PI * 2, 0, PI * 0.48), SM(o.hair, { roughness: 0.95 }), 0, 0.012, -0.005).scale.set(0.92, 1.1, 1.02);
  if (o.beard) { add(head, Bx(0.165, 0.06, 0.1), SM(o.beard, { roughness: 1 }), 0, -0.095, 0.035); add(head, Bx(0.06, 0.016, 0.02), SM(o.beard), 0, -0.052, 0.108, false); }
  if (o.stache) add(head, Bx(0.07, 0.018, 0.02), SM(o.stache), 0, -0.052, 0.108, false);
  if (o.cap) { add(head, Cy(0.125, 0.125, 0.08, 10), SM(o.cap), 0, 0.09, 0); add(head, Bx(0.2, 0.015, 0.1), SM(o.cap), 0, 0.055, 0.1); add(head, Bx(0.05, 0.03, 0.01), SM('#d8b84a', { metalness: 0.7, roughness: 0.3 }), 0, 0.1, 0.126, false); }
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.25 * w, 0.55, 0); up.add(s); add(s, Cy(0.058 * w, 0.05 * w, 0.32, 7), top, 0, -0.16, 0); const e = new T3.Group(); e.position.y = -0.31; s.add(e); add(e, Cy(0.048 * w, 0.04, 0.28, 7), o.sleeve ? top : skin, 0, -0.14, 0); add(e, Bx(0.07, 0.1, 0.04), skin, 0, -0.32, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.09 * w, 0.9, 0); g.add(h); add(h, Cy(0.08 * w, 0.065, 0.45, 7), bot, 0, -0.225, 0); const k = new T3.Group(); k.position.y = -0.45; h.add(k); add(k, Cy(0.062, 0.05, 0.42, 7), bot, 0, -0.21, 0); add(k, Bx(0.1, 0.07, 0.24), SM(o.shoe || '#1c1c20'), 0, -0.44, 0.05); h.userData.k = k; return h; };
  if (o.tag) { const t = ctex(128, 48, (c) => { c.fillStyle = '#f0ece0'; c.fillRect(0, 0, 128, 48); c.fillStyle = '#111'; c.font = '30px Russo'; c.textAlign = 'center'; c.fillText(o.tag, 64, 36); }); add(up, new T3.PlaneGeometry(0.13, 0.05), new T3.MeshStandardMaterial({ map: t }), 0.08, 0.42, 0.125, false); }
  g.userData = { up, head, mouth, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
function pose(p, f = {}) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) { u[k].rotation.set(0, 0, 0); (u[k].userData.e || u[k].userData.k).rotation.set(0, 0, 0); } u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); u.mouth.scale.y = 1; Object.assign(u, {}); p.position.y = 0; }
function sit(p) { const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2; l.userData.k.rotation.x = PI / 2; } }
function run(p, ph, a = 1) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.8 * a; u.legR.rotation.x = -s * 0.8 * a; u.legL.userData.k.rotation.x = Math.max(0, -s) * 1.1; u.legR.userData.k.rotation.x = Math.max(0, s) * 1.1; u.armL.rotation.x = -s * 0.7 * a; u.armR.rotation.x = s * 0.7 * a; u.armL.userData.e.rotation.x = -0.9; u.armR.userData.e.rotation.x = -0.9; u.up.rotation.x = 0.18; p.position.y = Math.abs(C(ph)) * 0.05; }

// ---------- set ----------
const R = {};
function concreteT(c1, rep) { const r = rng(4); const t = ctex(256, 256, (c, w, h) => { c.fillStyle = c1; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.1})`; c.fillRect(r() * w, r() * h, 3, 3); } c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 3; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 64) % 2 * 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 64); c.stroke(); } } for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(70,55,30,0.13)'; c.beginPath(); c.ellipse(r() * w, r() * h, 30, 70, 0, 0, 7); c.fill(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function build() { const g = new T3.Group(); scene.add(g); const wall = SM('#ffffff', { map: concreteT('#9a978e', [6, 2]), roughness: 0.95 }), wallS = SM('#ffffff', { map: concreteT('#9a978e', [2, 2]), roughness: 0.95 }), steel = SM('#5a5e66', { metalness: 0.75, roughness: 0.4 }), paint = SM('#3a4a5a', { metalness: 0.5, roughness: 0.5 });
  const floor = SM('#ffffff', { map: concreteT('#5e5d58', [7, 2]), roughness: 0.85 });
  add(g, Bx(16, 0.1, 4.4), floor, 0, -0.05, 0); add(g, Bx(16, 3, 0.2), wall, 0, 1.5, -2.2); add(g, Bx(16, 0.1, 4.4), wallS, 0, 3.0, 0);
  for (const x of [-4.8, -1.6, 1.6, 4.8]) add(g, Bx(0.2, 3, 4.4), wallS, x, 1.5, 0);
  R.win = add(g, new T3.PlaneGeometry(0.8, 0.5), new T3.MeshBasicMaterial({ color: '#1a2438', toneMapped: false }), 0.3, 2.4, -2.09, false); for (let i = 0; i < 4; i++) add(g, Cy(0.02, 0.02, 0.5, 6), steel, i * 0.2, 2.4, -2.07);
  // bunks (ours + neighbours)
  for (const ox of [-3.2, 0, 3.2]) { for (const y of [0.45, 1.65]) { add(g, Bx(0.9, 0.08, 2.0), paint, ox - 1.05, y, -1.0); add(g, Bx(0.85, 0.15, 1.95), SM('#5a6a7a', { roughness: 0.95 }), ox - 1.05, y + 0.1, -1.0); add(g, Bx(0.6, 0.12, 0.35), SM('#d8d4c8'), ox - 1.05, y + 0.24, -1.8); } for (const z of [-1.95, -0.05]) add(g, Cy(0.04, 0.04, 2.0, 6), paint, ox - 0.62, 1.0, z); }
  R.blanket = add(g, Bx(0.8, 0.12, 1.4), SM('#3a4a6a', { roughness: 1 }), -1.05, 1.9, -0.7);
  add(g, Cy(0.22, 0.18, 0.42, 9), SM('#c8ccd0', { metalness: 0.6, roughness: 0.25 }), 1.2, 0.21, -1.7); add(g, Bx(0.5, 0.3, 0.3), SM('#c8ccd0', { metalness: 0.6, roughness: 0.25 }), 1.25, 0.9, -2.0);
  // photo + tally marks on our wall (six months)
  const tally = ctex(256, 128, (c) => { c.clearRect(0, 0, 256, 128); c.strokeStyle = 'rgba(30,26,22,0.8)'; c.lineWidth = 3; for (let i = 0; i < 26; i++) { const gx = 14 + Math.floor(i / 5) * 46, x = gx + (i % 5) * 8; if (i % 5 === 4) { c.beginPath(); c.moveTo(gx - 4, 40); c.lineTo(gx + 36, 80); c.stroke(); } else { c.beginPath(); c.moveTo(x, 36); c.lineTo(x + 2, 84); c.stroke(); } } });
  add(g, new T3.PlaneGeometry(0.9, 0.45), new T3.MeshStandardMaterial({ map: tally, transparent: true }), 1.49, 1.5, -0.6, false).rotation.y = -PI / 2;
  // bars along the whole cell row, our door is the gap
  for (let x = -7.9; x <= 7.9; x += 0.16) if (x < -0.05 || x > 1.05) add(g, Cy(0.025, 0.025, 3, 6), steel, x, 1.5, 2.2, false);
  for (const y of [0.12, 2.9]) add(g, Bx(16, 0.08, 0.08), steel, 0, y, 2.2, false);
  R.door = new T3.Group(); R.door.position.set(-0.02, 0, 2.2); g.add(R.door); for (let x = 0.06; x < 1.0; x += 0.16) add(R.door, Cy(0.025, 0.025, 2.4, 6), steel, x, 1.2, 0, false); for (const y of [0.1, 1.2, 2.35]) add(R.door, Bx(1.05, 0.06, 0.06), steel, 0.52, y, 0, false); add(R.door, Bx(0.2, 0.3, 0.12), steel, 0.9, 1.15, 0.02);
  add(R.door, new T3.CircleGeometry(0.018, 8), SM('#050505'), 0.9, 1.17, -0.045, false).rotation.y = PI;
  const plate = ctex(128, 48, (c) => { c.fillStyle = '#c8b84a'; c.fillRect(0, 0, 128, 48); c.fillStyle = '#111'; c.font = '34px Russo'; c.textAlign = 'center'; c.fillText('C . 14', 64, 37); }); add(g, new T3.PlaneGeometry(0.36, 0.13), new T3.MeshStandardMaterial({ map: plate }), 0.5, 2.7, 2.27, false);
  // corridor
  add(g, Bx(16, 0.1, 4.2), floor, 0, -0.05, 4.3); add(g, Bx(16, 3.4, 0.2), wall, 0, 1.7, 6.4); add(g, Bx(16, 0.1, 4.2), wall, 0, 3.4, 4.3);
  for (let x = -7.9; x <= 7.9; x += 0.16) add(g, Cy(0.02, 0.02, 3, 6), steel, x, 1.5, 6.2, false);
  add(g, Bx(0.2, 3.4, 4.2), wall, -8, 1.7, 4.3); add(g, Bx(0.2, 3.4, 4.2), wall, 8, 1.7, 4.3);
  const gate = new T3.Group(); gate.position.set(-7.85, 0, 4.3); g.add(gate); for (let z = -1.6; z <= 1.6; z += 0.15) add(gate, Cy(0.03, 0.03, 3.2, 6), steel, 0.1, 1.6, z, false);
  const sign = ctex(256, 64, (c) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#e8d84a'; c.font = '40px Russo'; c.textAlign = 'center'; c.fillText('C BLOCK', 128, 47); }); add(g, new T3.PlaneGeometry(0.9, 0.22), new T3.MeshBasicMaterial({ map: sign }), -7.75, 2.9, 4.3, false).rotation.y = PI / 2;
  R.lights = []; for (const x of [-5, -1.5, 2, 5.5]) { const m = add(g, Bx(1.4, 0.06, 0.25), new T3.MeshBasicMaterial({ color: '#f0f6ff', toneMapped: false }), x, 3.33, 4.2, false); const l = new T3.PointLight('#e0ecff', 7, 9, 1.5); l.position.set(x, 3.0, 4.0); g.add(l); R.lights.push([m, l]); }
  R.cellL = new T3.PointLight('#d8e4ff', 3, 6, 1.6); R.cellL.position.set(0, 2.7, 0); g.add(R.cellL);
  R.beacons = []; for (const x of [-3.2, 3.2]) { const m = add(g, Cy(0.08, 0.1, 0.14, 8), new T3.MeshBasicMaterial({ color: '#3a0606', toneMapped: false }), x, 3.27, 6.2, false); const l = new T3.PointLight('#ff2a1a', 0, 9, 1.4); l.position.set(x, 2.9, 5.6); g.add(l); const s_ = glow(g, '#ff3a2a', 0.6, x, 3.25, 6.15, 0); R.beacons.push([m, l, s_]); }
  R.hemi = new T3.HemisphereLight('#5a6a98', '#141418', 0.3); R.face = new T3.SpotLight('#a8b8ff', 9, 5, 0.35, 0.6, 1.2); R.face.position.set(0.7, 2.9, 1.0); g.add(R.face); g.add(R.face.target); R.face.target.position.set(-0.75, 2.5, -0.95); R.gateL = new T3.PointLight('#ffd8a0', 6, 6, 1.4); R.gateL.position.set(-7.2, 2.7, 4.3); g.add(R.gateL); add(g, Bx(0.3, 0.12, 0.2), new T3.MeshBasicMaterial({ color: '#ffe8c0', toneMapped: false }), -7.75, 3.0, 4.3, false); R.corr = new T3.PointLight('#5a78d8', 0, 10, 1.3); R.corr.position.set(0, 2.6, 4.2); g.add(R.corr); g.add(R.hemi);
  R.moon = new T3.DirectionalLight('#6a88d8', 1.1); R.moon.position.set(0.3, 4, -5); R.moon.target.position.set(-0.6, 1.5, 1); g.add(R.moon); g.add(R.moon.target);
  R.flash = new T3.DirectionalLight('#c8d8ff', 0); R.flash.position.set(0.5, 4, -6); R.flash.target.position.set(0, 0, 1); g.add(R.flash); g.add(R.flash.target);
  R.fill = new T3.PointLight('#8aa0e8', 1.6, 4, 1.5); R.fill.position.set(0.3, 2.3, 0.2); g.add(R.fill);
  // people
  R.dex = person({ skin: '#8a5c3c', top: '#d8581a', hair: null, beard: '#1a1210', angry: true, w: 1.15, tag: '4471', brow: '#120c08' }); g.add(R.dex);
  R.dexEyes = [-1, 1].map(sx => glow(R.dex.userData.head, '#ffffff', 0.035, sx * 0.042, 0.018, 0.12, 0));
  R.reyes = person({ skin: '#b88660', top: '#26324a', bot: '#1c2232', cap: '#1a2236', stache: '#2a1a10', hair: '#2a1a10', sleeve: true, shoe: '#0a0a0a' }); g.add(R.reyes);
  const fl = add(R.reyes.userData.armR.userData.e, Cy(0.025, 0.03, 0.18, 8), SM('#222', { metalness: 0.6 }), 0, -0.36, 0.05); fl.rotation.x = PI / 2;
  R.spot = new T3.SpotLight('#fff6dc', 40, 14, 0.32, 0.5, 1.2); R.spot.castShadow = true; g.add(R.spot); g.add(R.spot.target);
  R.beam = add(g, new T3.ConeGeometry(0.9, 6, 16, 1, true), new T3.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0.07, depthWrite: false, side: T3.DoubleSide, toneMapped: false, blending: T3.AdditiveBlending }), 0, 0, 0, false);
  R.wkey = new T3.Group(); R.wkey.position.set(0.88, 1.17, 2.13); g.add(R.wkey); const wk = SM('#f2f2f2', { roughness: 0.35 }); add(R.wkey, Bx(0.018, 0.014, 0.12), wk, 0, 0, -0.04, false); add(R.wkey, Bx(0.024, 0.02, 0.1), SM('#2a7ad8', { roughness: 0.4 }), 0, 0, -0.14, false);
  const wh = new T3.Group(); wh.position.set(0, 0, -0.17); R.wkey.add(wh); const hs = SM('#d8a07c'); add(wh, Bx(0.08, 0.045, 0.09), hs, 0.02, -0.01, -0.02, false); add(wh, Bx(0.03, 0.025, 0.05), hs, -0.025, 0.02, 0.01, false);
  { const A = new T3.Vector3(0.9, 1.15, 1.9), B = new T3.Vector3(1.05, 0.82, 1.4), d = B.clone().sub(A); R.warm = add(g, Cy(0.045, 0.055, d.length(), 8), SM('#e0601c'), (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2, false); R.warm.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), d.normalize()); }
  R.lockL = new T3.PointLight('#9ab0ff', 0, 2.5, 1.5); R.lockL.position.set(0.55, 1.7, 1.6); g.add(R.lockL);
  R.reyesL = new T3.PointLight('#ffe0b0', 0, 3, 1.5); R.reyesL.position.set(-4.7, 1.9, 4.4); g.add(R.reyesL);
  // ---- corridor laundry hatch (end of C block) ----
  R.hatch = new T3.Group(); R.hatch.position.set(7.88, 1.45, 4.3); R.hatch.rotation.y = -PI / 2; g.add(R.hatch); add(g, Bx(0.06, 0.95, 0.95), SM('#0a0a0c'), 7.9, 1.0, 4.3, false); const hp = add(R.hatch, Bx(0.9, 0.9, 0.05), SM('#7a8088', { metalness: 0.7, roughness: 0.35 }), 0, -0.45, 0.03); add(R.hatch, Bx(0.3, 0.05, 0.06), SM('#2a2a2e', { metalness: 0.8 }), 0, -0.75, 0.07);
  { const t = ctex(256, 64, (c) => { c.fillStyle = '#e8c83a'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#111'; c.font = '40px Russo'; c.textAlign = 'center'; c.fillText('LAUNDRY', 128, 46); }); add(g, new T3.PlaneGeometry(0.8, 0.2), new T3.MeshBasicMaterial({ map: t }), 7.88, 1.75, 4.3, false).rotation.y = -PI / 2; }
  R.hatchL = new T3.PointLight('#ffd27a', 0, 4, 1.5); R.hatchL.position.set(6.8, 2.2, 4.3); g.add(R.hatchL);
  // ---- the chute (for the slide) at x=70 ----
  const tube = new T3.Group(); tube.position.set(70, 0, 0); g.add(tube); add(tube, new T3.CylinderGeometry(0.5, 0.5, 14, 10, 1, true), SM('#6a7078', { metalness: 0.6, roughness: 0.4, side: T3.BackSide }), 0, 7, 0, false); for (let y = 0.5; y < 14; y += 0.9) add(tube, new T3.TorusGeometry(0.48, 0.03, 4, 10), SM('#3a3e44', { metalness: 0.8 }), 0, y, 0, false).rotation.x = PI / 2;
  add(tube, new T3.CircleGeometry(0.5, 10), new T3.MeshBasicMaterial({ color: '#e8f0ff', toneMapped: false }), 0, 0.02, 0, false).rotation.x = -PI / 2; R.tubeL = new T3.PointLight('#9ab0d8', 3, 4, 1.4); g.add(R.tubeL);
  // ---- laundry room (x=40) ----
  const LX = 40, lw = SM('#ffffff', { map: concreteT('#8a8a84', [3, 2]), roughness: 0.95 }); add(g, Bx(8, 0.1, 8), SM('#ffffff', { map: concreteT('#5a5a56', [3, 3]) }), LX, -0.05, 0); add(g, Bx(8, 3.2, 0.2), lw, LX, 1.6, -4); add(g, Bx(0.2, 3.2, 8), lw, LX - 4, 1.6, 0); add(g, Bx(0.2, 3.2, 8), lw, LX + 4, 1.6, 0); add(g, Bx(8, 3.2, 0.2), lw, LX, 1.6, 4);
  for (const [cx, cz, w, d] of [[LX, -2.7, 8, 2.6], [LX, 2.25, 8, 5.7], [LX - 2.25, -1, 3.5, 0.8], [LX + 2.25, -1, 3.5, 0.8]]) add(g, Bx(w, 0.1, d), lw, cx, 3.2, cz);
  const duct = SM('#6a7078', { metalness: 0.6, roughness: 0.4 }); for (const [dx, dz, w, d] of [[0, -0.42, 0.9, 0.06], [0, 0.42, 0.9, 0.06], [-0.42, 0, 0.06, 0.9], [0.42, 0, 0.06, 0.9]]) add(g, Bx(w, 1.4, d), duct, LX + dx, 3.85, -1 + dz);
  R.cart = new T3.Group(); R.cart.position.set(LX, 0, -1); g.add(R.cart); const cv_ = SM('#4a5a72', { roughness: 0.95 }); add(R.cart, Bx(1.3, 0.75, 0.05), cv_, 0, 0.55, 0.47); add(R.cart, Bx(1.3, 0.75, 0.05), cv_, 0, 0.55, -0.47); add(R.cart, Bx(0.05, 0.75, 0.95), cv_, 0.65, 0.55, 0); add(R.cart, Bx(0.05, 0.75, 0.95), cv_, -0.65, 0.55, 0); add(R.cart, Bx(1.3, 0.05, 0.95), cv_, 0, 0.2, 0);
  for (const [wx, wz] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) add(R.cart, Cy(0.08, 0.08, 0.05, 8), SM('#1a1a1a'), wx, 0.08, wz).rotation.z = PI / 2;
  const sheet = SM('#e8e6de', { roughness: 1 }); const rs = rng(9); for (let i = 0; i < 16; i++) { const m = add(R.cart, Sp(0.28, 7, 5), sheet, (rs() - 0.5) * 1.0, 0.82 + rs() * 0.12, (rs() - 0.5) * 0.7); m.scale.set(1.2, 0.45, 1); m.rotation.y = rs() * 3; } add(R.cart, Bx(0.5, 0.4, 0.04), sheet, 0.4, 0.75, 0.5).rotation.x = 0.3;
  for (let i = 0; i < 4; i++) { const wx = LX - 3.2 + i * 1.15; add(g, Bx(1.0, 1.05, 0.8), SM('#d8dcd8', { roughness: 0.5 }), wx, 0.53, -3.5); add(g, new T3.TorusGeometry(0.26, 0.04, 6, 14), SM('#8a9098', { metalness: 0.8 }), wx, 0.55, -3.08, false); add(g, new T3.CircleGeometry(0.24, 14), SM('#1a2430', { metalness: 0.4, roughness: 0.15 }), wx, 0.55, -3.09, false); }
  R.yard = new T3.Group(); R.yard.position.set(LX + 2.5, 0, 3.88); g.add(R.yard); add(R.yard, Bx(1.1, 2.2, 0.1), SM('#3a5a4a', { metalness: 0.5, roughness: 0.5 }), 0, 1.1, 0); add(R.yard, Bx(0.9, 0.07, 0.08), SM('#c8c8c8', { metalness: 0.8 }), 0, 1.05, -0.08);
  { const t = ctex(256, 96, (c) => { c.fillStyle = '#0a3a1a'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#5aff8a'; c.font = '56px Russo'; c.textAlign = 'center'; c.fillText('EXIT', 128, 68); }); add(g, new T3.PlaneGeometry(0.6, 0.22), new T3.MeshBasicMaterial({ map: t, toneMapped: false }), LX + 2.5, 2.5, 3.88, false).rotation.y = PI; } add(g, new T3.PlaneGeometry(0.3, 0.4), new T3.MeshBasicMaterial({ color: '#3a5a8a', toneMapped: false }), LX + 2.5, 1.7, 3.82, false).rotation.y = PI;
  const ex = new T3.PointLight('#5aff8a', 3, 6, 1.5); ex.position.set(LX + 2.5, 2.3, 3.4); g.add(ex);
  R.inner = new T3.Group(); R.inner.position.set(LX + 3.88, 0, 1.2); g.add(R.inner); add(R.inner, Bx(0.1, 2.2, 1.0), SM('#5a6068', { metalness: 0.6 }), 0, 1.1, 0); R.under = add(g, new T3.PlaneGeometry(0.9, 0.6), new T3.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }), LX + 3.6, 0.012, 1.2, false); R.under.rotation.x = -PI / 2;
  R.lFill = new T3.PointLight('#8aa0d8', 5, 9, 1.3); R.lFill.position.set(LX + 0.5, 2.7, 0.8); g.add(R.lFill); add(g, new T3.PlaneGeometry(0.8, 0.8), new T3.MeshBasicMaterial({ color: '#2a3448', toneMapped: false }), LX, 4.5, -1, false).rotation.x = PI / 2; R.lHemi = new T3.HemisphereLight('#5a6a98', '#1a1a20', 0.9); R.lHemi.position.set(LX, 3, 0); g.add(R.lHemi); R.lRed = new T3.PointLight('#ff2a1a', 0, 8, 1.4); R.lRed.position.set(LX - 2, 2.9, 1); g.add(R.lRed);
  R.chuteSpot = new T3.SpotLight('#fff6dc', 0, 9, 0.22, 0.5, 1.2); R.chuteSpot.position.set(LX, 5.5, -1); R.chuteSpot.target.position.set(LX, 0, -1); g.add(R.chuteSpot); g.add(R.chuteSpot.target);
  R.chuteBeam = add(g, new T3.ConeGeometry(0.55, 3.2, 12, 1, true), new T3.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0, depthWrite: false, side: T3.DoubleSide, toneMapped: false, blending: T3.AdditiveBlending }), LX, 2.4, -1, false);
  R.rkeys = new T3.Group(); R.rkeys.position.set(LX - 0.9, 1.08, -3.35); g.add(R.rkeys); add(R.rkeys, new T3.TorusGeometry(0.05, 0.008, 6, 16), SM('#c8c0a0', { metalness: 1, roughness: 0.3 }), 0, 0, 0).rotation.x = PI / 2; for (let k = 0; k < 3; k++) { const kk = add(R.rkeys, Bx(0.02, 0.006, 0.11), SM('#d8c070', { metalness: 1, roughness: 0.3 }), Math.cos(k * 2) * 0.06, 0, Math.sin(k * 2) * 0.06 + 0.05); kk.rotation.y = k * 0.8; } R.rkeysG = glow(R.rkeys, '#fff4c8', 0.35, 0, 0.04, 0, 0);
  R.lBright = []; for (const [x, z] of [[LX - 2, -1.5], [LX + 1.5, 1.5]]) { const pl = new T3.PointLight('#f4f8ff', 0, 10, 1.3); pl.position.set(x, 2.9, z); g.add(pl); const m = add(g, Bx(1.4, 0.05, 0.3), new T3.MeshBasicMaterial({ color: '#2a2e36', toneMapped: false }), x, 3.12, z, false); R.lBright.push([pl, m]); }
  R.cover = []; for (let i = 0; i < 3; i++) { const c_ = add(g, new T3.PlaneGeometry(0.9, 0.55), SM('#d8d4c8', { roughness: 1, side: T3.DoubleSide, emissive: '#2a2a2a' }), 0, 0, 0, false); R.cover.push(c_); }
  // first-person hands (children of the camera)
  R.vm = new T3.Group(); camera.add(R.vm); const sleeve = R.sleeveM = SM('#e0601c'), hand = SM('#d8a07c');
  const vmArm = () => { const a = new T3.Group(); R.vm.add(a); const f = add(a, Cy(0.038, 0.05, 0.36, 8), sleeve, 0, 0, 0.12, false); f.rotation.x = PI / 2; add(a, Cy(0.04, 0.04, 0.03, 8), SM('#c84c10'), 0, 0, -0.06, false).rotation.x = PI / 2; const h = new T3.Group(); h.position.z = -0.1; a.add(h); add(h, Bx(0.075, 0.035, 0.09), hand, 0, 0, -0.02, false); for (let i = 0; i < 4; i++) add(h, Bx(0.015, 0.02, 0.05), hand, -0.027 + i * 0.018, -0.008, -0.085, false); add(h, Bx(0.018, 0.02, 0.05), hand, -0.045, 0.004, -0.04, false).rotation.y = 0.5; a.userData.h = h; return a; };
  R.handR = vmArm(); R.handL = vmArm(); R.handL.scale.x = -1;
  R.key = new T3.Group(); R.handR.userData.h.add(R.key); R.key.position.set(0.0, 0.0, -0.08); R.key.scale.setScalar(0.6); add(R.key, Bx(0.016, 0.012, 0.15), SM('#f2f2f2', { roughness: 0.35 }), 0, 0.012, -0.05, false); add(R.key, Bx(0.02, 0.016, 0.06), SM('#2a7ad8', { roughness: 0.4 }), 0, 0.012, 0.03, false); for (let i = 0; i < 3; i++) add(R.key, Bx(0.016, 0.012 + (i % 2) * 0.012, 0.014), SM('#f2f2f2'), 0, 0.0, -0.1 - i * 0.022, false);
}

const YX = 100;
function chainTex() { const t = ctex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); c.strokeStyle = 'rgba(190,196,204,0.95)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 32); c.lineTo(32, 0); c.lineTo(64, 32); c.lineTo(32, 64); c.closePath(); c.stroke(); }); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
function fenceRun(g, x0, x1, z, h, wire) { const L = x1 - x0; const ct = chainTex(); ct.repeat.set(L * 3, h * 3); add(g, new T3.PlaneGeometry(L, h), new T3.MeshStandardMaterial({ map: ct, transparent: true, alphaTest: 0.3, side: T3.DoubleSide, metalness: 0.6, roughness: 0.5 }), (x0 + x1) / 2, h / 2, z, false);
  const pm = SM('#8a9098', { metalness: 0.7, roughness: 0.4 }); for (let x = x0; x <= x1 + 0.01; x += 3) add(g, Cy(0.05, 0.05, h + 0.3, 8), pm, x, (h + 0.3) / 2, z); add(g, Cy(0.03, 0.03, L, 8), pm, (x0 + x1) / 2, h, z).rotation.z = PI / 2;
  if (wire) { const wm = SM('#c8ccd2', { metalness: 0.9, roughness: 0.3 }); for (let x = x0; x < x1; x += 0.5) { const c_ = add(g, new T3.TorusGeometry(0.3, 0.012, 4, 14), wm, x, h + 0.32, z, false); c_.rotation.y = PI / 2 + 0.3; } } }
function build2() { const g = R.yardG = new T3.Group(); g.position.set(YX, 0, 0); scene.add(g);
  add(g, Bx(60, 0.1, 50), SM('#ffffff', { map: concreteT('#4a4a46', [14, 12]), roughness: 0.95 }), 0, -0.05, -8);
  // the block behind you, with Dex's barred window
  add(g, Bx(30, 9, 1), SM('#ffffff', { map: concreteT('#8a877e', [8, 3]), roughness: 0.95 }), 0, 4.5, 6.5); add(g, Bx(1.6, 2.4, 0.2), SM('#3a3a3e'), 0, 1.2, 6.0);
  R.wins = []; for (let i = 0; i < 9; i++) { const x = -8 + i * 2; for (const y of [3.4, 6.2]) { const m = add(g, Bx(0.9, 0.7, 0.1), new T3.MeshBasicMaterial({ color: '#141820', toneMapped: false }), x, y, 5.98, false); R.wins.push(m); for (let k = 0; k < 4; k++) add(g, Bx(0.03, 0.7, 0.05), SM('#2a2a2e'), x - 0.33 + k * 0.22, y, 5.92); } }
  R.dexWin = new T3.PointLight('#ffd8a0', 0, 5, 1.5); R.dexWin.position.set(2, 3.4, 5.2); g.add(R.dexWin);
  // inner fence with the yard gate (z = 0) and the perimeter fence with razor wire (z = -18)
  fenceRun(g, -14, -1, 0, 3.4, false); fenceRun(g, 1, 14, 0, 3.4, false); fenceRun(g, -20, 20, -18, 5, true);
  R.gate = new T3.Group(); R.gate.position.set(-1, 0, 0); g.add(R.gate); const gt = chainTex(); gt.repeat.set(6, 9); add(R.gate, new T3.PlaneGeometry(2, 3.2), new T3.MeshStandardMaterial({ map: gt, transparent: true, alphaTest: 0.3, side: T3.DoubleSide, metalness: 0.6 }), 1, 1.6, 0, false);
  const pm = SM('#8a9098', { metalness: 0.7, roughness: 0.4 }); for (const [a_, b_] of [[[0, 0, 0], [2, 0, 0]], [[0, 3.2, 0], [2, 3.2, 0]], [[2, 0, 0], [2, 3.2, 0]], [[0, 0, 0], [0, 3.2, 0]]]) { const A = new T3.Vector3(...a_), B = new T3.Vector3(...b_); const m = add(R.gate, Cy(0.035, 0.035, A.distanceTo(B), 8), pm, 0, 0, 0); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), B.clone().sub(A).normalize()); }
  R.lock = new T3.Group(); R.lock.position.set(1.95, 1.15, 0.08); R.gate.add(R.lock); add(R.lock, Bx(0.12, 0.14, 0.06), SM('#b89a3a', { metalness: 0.9, roughness: 0.3 }), 0, 0, 0); R.shackle = add(R.lock, new T3.TorusGeometry(0.04, 0.012, 6, 16, PI), SM('#c8ccd2', { metalness: 1, roughness: 0.25 }), 0, 0.07, 0); add(R.lock, Bx(0.02, 0.04, 0.005), SM('#111'), 0, -0.02, 0.032);
  // guard tower + searchlight
  const tw = new T3.Group(); tw.position.set(9, 0, -16); g.add(tw); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(tw, Bx(0.2, 7, 0.2), SM('#4a4e54'), x, 3.5, z); add(tw, Bx(3, 0.2, 3), SM('#3a3e44'), 0, 7, 0); add(tw, Bx(3, 1.4, 3), SM('#2e3238'), 0, 7.9, 0); add(tw, Bx(3.4, 0.2, 3.4), SM('#22262a'), 0, 8.7, 0);
  R.slHead = new T3.Group(); R.slHead.position.set(9, 8.0, -14.4); g.add(R.slHead); add(R.slHead, Cy(0.25, 0.3, 0.5, 12), SM('#2a2a2e', { metalness: 0.6 }), 0, 0, 0).rotation.x = PI / 2; R.slLens = add(R.slHead, Cy(0.24, 0.24, 0.02, 16), new T3.MeshBasicMaterial({ color: '#fffbe8', toneMapped: false }), 0, 0, 0.26, false); R.slLens.rotation.x = PI / 2;
  R.slGlow = glow(R.slHead, '#fff4d0', 3.5, 0, 0, 0.4, 0.9);
  R.sl = new T3.SpotLight('#fff6dc', 120, 60, 0.12, 0.4, 1.0); R.sl.castShadow = true; R.slHead.add(R.sl); R.sl.position.set(0, 0, 0.3); R.slT = new T3.Object3D(); g.add(R.slT); R.sl.target = R.slT;
  R.slBeam = add(g, new T3.ConeGeometry(1.6, 22, 20, 1, true), new T3.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0.08, side: T3.DoubleSide, depthWrite: false, blending: T3.AdditiveBlending }), 0, 0, 0, false);
  // laundry truck idling by the perimeter fence
  const tr = R.truck = new T3.Group(); tr.position.set(-6, 0, -15); tr.rotation.y = 0.5; g.add(tr); add(tr, Bx(2.3, 2.6, 4.6), SM('#e8e8e4', { roughness: 0.6 }), 0, 1.7, -0.6); add(tr, Bx(2.3, 1.8, 1.8), SM('#2a5a8a', { roughness: 0.5 }), 0, 1.3, 2.4); add(tr, Bx(2.2, 0.7, 0.05), SM('#1a2430', { roughness: 0.1 }), 0, 1.75, 3.31);
  add(tr, new T3.PlaneGeometry(3.4, 0.7), new T3.MeshBasicMaterial({ map: ctex(256, 52, c => { c.fillStyle = '#e8e8e4'; c.fillRect(0, 0, 256, 52); c.fillStyle = '#2a5a8a'; c.font = '34px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LAUNDRY', 128, 28); }), toneMapped: false }), 1.16, 2.2, -0.6, false).rotation.y = PI / 2;
  for (const [x, z] of [[-1.05, 2.4], [1.05, 2.4], [-1.05, -2], [1.05, -2]]) add(tr, Cy(0.45, 0.45, 0.3, 14), SM('#151515'), x, 0.45, z).rotation.z = PI / 2;
  R.tDoorL = add(tr, Bx(1.12, 2.4, 0.05), SM('#d8d8d4'), -0.56, 1.7, -2.93); R.tDoorL.geometry.translate(0.56, 0, 0); R.tDoorL.position.x = -1.12;
  R.hl = []; for (const x of [-0.8, 0.8]) R.hl.push(glow(tr, '#fff4c8', 0.9, x, 0.9, 3.35, 0.9)); R.smoke = []; for (let i = 0; i < 8; i++) R.smoke.push(glow(tr, '#9a9aa2', 0.6, 0.8, 0.3, -3, 0));
  R.tdl = new T3.PointLight('#ffd8a0', 0, 5, 1.5); R.tdl.position.set(0, 2, -3.6); tr.add(R.tdl);
  // flood lamps and alarm beacons on the block
  R.alarm = []; for (const x of [-6, 6]) { const m = add(g, Cy(0.12, 0.12, 0.2, 10), new T3.MeshBasicMaterial({ color: '#ff2020', toneMapped: false }), x, 7.5, 5.9, false); R.alarm.push({ m, l: (() => { const l = new T3.PointLight('#ff2020', 0, 12, 1.5); l.position.set(x, 7, 5); g.add(l); return l; })() }); }
  R.yMoon = new T3.DirectionalLight('#7a98e8', 1.6); R.yMoon.position.set(YX - 10, 20, -10); R.yMoon.target.position.set(YX, 0, -5); scene.add(R.yMoon); scene.add(R.yMoon.target);
  R.yFill = new T3.PointLight('#8aa0e8', 10, 16, 1.4); R.yFill.position.set(YX + 1, 4, 3); scene.add(R.yFill); R.lockL2 = new T3.PointLight('#ffe0b0', 3, 2.5, 1.6); R.lockL2.position.set(YX + 1.2, 1.6, 0.9); scene.add(R.lockL2); for (const [x, z] of [[-10, -17], [10, -17], [0, -17], [-12, -5]]) { const pl = new T3.PointLight('#ffd8a0', 8, 14, 1.5); pl.position.set(YX + x, 5.5, z + 1); scene.add(pl); add(R.yardG, Cy(0.08, 0.1, 5.5, 8), SM('#3a3e44'), x, 2.75, z); add(R.yardG, Bx(0.6, 0.2, 0.4), new T3.MeshBasicMaterial({ color: '#fff0c8', toneMapped: false }), x, 5.6, z + 0.3, false); }
  R.dex.position.set(YX + 2, 1.75, 5.86); R.dex.rotation.y = PI; scene.add(R.dex); { const wm = SM('#ffffff', { map: concreteT('#8a877e', [1, 2]), roughness: 0.95 }); add(R.yardG, Bx(1.3, 3.0, 0.3), wm, 2, 1.5, 5.6); add(R.yardG, Bx(1.3, 1.4, 0.3), wm, 2, 4.5, 5.6); add(R.yardG, Bx(0.25, 0.8, 0.3), wm, 1.4, 3.4, 5.6); add(R.yardG, Bx(0.25, 0.8, 0.3), wm, 2.6, 3.4, 5.6); } for (let k = 0; k < 4; k++) add(R.yardG, Bx(0.035, 0.75, 0.05), SM('#2a2a2e', { metalness: 0.5 }), 2 - 0.33 + k * 0.22, 3.4, 5.66); add(R.yardG, Bx(1.0, 0.8, 0.02), new T3.MeshBasicMaterial({ color: '#3a2a18', toneMapped: false }), 2, 3.4, 6.02, false);
}

// ---------- part 5 set: walk-in laundry truck, jacket decoy, guards at the wire, front gate ----------
const TRK = [-7, 0, -12], STOPX = -21.6, BARX = -27, JK = [-1, 5.25, -18];
function guardP() { const p = person({ skin: '#b88660', top: '#26324a', bot: '#1c2232', cap: '#1a2236', hair: '#2a1a10', sleeve: true, shoe: '#0a0a0a' }); const fl = add(p.userData.armR.userData.e, Cy(0.025, 0.03, 0.18, 8), SM('#222', { metalness: 0.6 }), 0, -0.36, 0.05); fl.rotation.x = PI / 2; p.userData.torch = glow(p.userData.armR.userData.e, '#fff2c8', 0.5, 0, -0.36, 0.16, 0.9); return p; }
function build3() { const g = R.yardG; g.remove(R.truck);
  add(g, Bx(30, 0.1, 50), SM('#ffffff', { map: concreteT('#4a4a46', [7, 12]), roughness: 0.95 }), -45, -0.05, -8);
  const tr = R.truck = new T3.Group(); tr.position.set(...TRK); tr.rotation.y = -PI / 2; g.add(tr);
  const bodyM = SM('#e4e4e0', { roughness: 0.6, side: T3.DoubleSide }), inM = SM('#9a9a96', { roughness: 0.9, side: T3.DoubleSide }), blue = SM('#2a5a8a', { roughness: 0.5, side: T3.DoubleSide }), dark = SM('#1a1c20', { roughness: 0.7 });
  for (const sx of [-1, 1]) add(tr, Bx(0.05, 2.6, 4.6), bodyM, sx * 1.15, 1.72, -0.6); add(tr, Bx(2.35, 0.05, 4.6), bodyM, 0, 3.0, -0.6); add(tr, Bx(2.3, 0.06, 4.6), inM, 0, 0.44, -0.6); add(tr, Bx(2.3, 2.6, 0.05), inM, 0, 1.72, 1.67);
  for (let i = 0; i < 6; i++) add(tr, Bx(2.25, 0.03, 0.06), inM, 0, 2.95, -2.6 + i * 0.85);
  const sackM = [SM('#e8e6e0', { roughness: 1 }), SM('#c8ccd4', { roughness: 1 }), SM('#d8d0c0', { roughness: 1 })]; const r = rng(31); for (let i = 0; i < 14; i++) { const b = add(tr, Sp(0.38, 9, 7), sackM[i % 3], (r() - 0.5) * 1.6, 0.8 + (i > 9 ? 0.55 : 0), 1.3 - r() * 2.6); b.scale.set(1, 0.85 + r() * 0.3, 1.1); b.rotation.y = r() * 3; }
  R.dL = new T3.Group(); R.dL.position.set(-1.15, 0, -2.92); tr.add(R.dL); add(R.dL, Bx(1.12, 2.5, 0.05), bodyM, 0.56, 1.72, 0); R.dR = new T3.Group(); R.dR.position.set(1.15, 0, -2.92); tr.add(R.dR); add(R.dR, Bx(1.12, 2.5, 0.05), bodyM, -0.56, 1.72, 0);
  for (const d of [R.dL, R.dR]) add(d, Bx(0.04, 0.3, 0.04), SM('#8a8e94', { metalness: 0.8 }), d === R.dL ? 1.0 : -1.0, 1.5, -0.05);
  add(tr, new T3.PlaneGeometry(3.4, 0.7), new T3.MeshBasicMaterial({ map: ctex(256, 52, c => { c.fillStyle = '#e4e4e0'; c.fillRect(0, 0, 256, 52); c.fillStyle = '#2a5a8a'; c.font = '34px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LAUNDRY', 128, 28); }), toneMapped: false }), 1.18, 2.2, -0.6, false).rotation.y = PI / 2;
  // cab with a real interior (open windows, glass, dash, wheel, seats)
  add(tr, Bx(2.3, 0.06, 1.7), blue, 0, 0.5, 2.5); add(tr, Bx(2.3, 0.06, 1.75), blue, 0, 2.32, 2.45); add(tr, Bx(2.3, 0.9, 0.05), blue, 0, 0.95, 3.3); for (const sx of [-1, 1]) { add(tr, Bx(0.05, 0.9, 1.65), blue, sx * 1.15, 0.95, 2.5); add(tr, Bx(0.07, 0.95, 0.07), blue, sx * 1.12, 1.85, 3.28); add(tr, Bx(0.07, 0.95, 0.07), blue, sx * 1.12, 1.85, 1.72); }
  add(tr, Bx(2.2, 0.85, 0.02), new T3.MeshStandardMaterial({ color: '#8ab0d0', transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.5 }), 0, 1.85, 3.3, false);
  add(tr, Bx(2.25, 0.9, 1.0), blue, 0, 0.95, 3.8); add(tr, Bx(2.1, 0.28, 0.45), dark, 0, 1.35, 3.05); R.hl = []; for (const x of [-0.8, 0.8]) R.hl.push(glow(tr, '#fff4c8', 0.9, x, 0.95, 4.33, 0.9));
  R.wheelG = new T3.Group(); R.wheelG.position.set(0.5, 1.55, 2.78); R.wheelG.rotation.x = -0.45; tr.add(R.wheelG); add(R.wheelG, new T3.TorusGeometry(0.2, 0.022, 6, 18), dark, 0, 0, 0); add(R.wheelG, Bx(0.38, 0.03, 0.03), dark, 0, 0, 0); add(R.wheelG, Cy(0.03, 0.03, 0.4, 6), dark, 0, -0.03, 0.2).rotation.x = PI / 2;
  for (const sx of [-1, 1]) { add(tr, Bx(0.62, 0.16, 0.6), SM('#3a3a40'), sx * 0.5, 0.95, 2.15); add(tr, Bx(0.62, 0.8, 0.12), SM('#3a3a40'), sx * 0.5, 1.42, 1.85); }
  R.cabCap = new T3.Group(); R.cabCap.position.set(-0.5, 1.07, 2.25); tr.add(R.cabCap); add(R.cabCap, Bx(0.5, 0.06, 0.42), SM('#2a5a8a'), 0, 0, 0).rotation.y = 0.2; add(R.cabCap, Bx(0.12, 0.05, 0.5), SM('#2a5a8a'), 0.22, 0.01, 0.05).rotation.y = 0.5; add(R.cabCap, Cy(0.11, 0.12, 0.08, 10), SM('#1a2236'), -0.05, 0.08, 0.05); add(R.cabCap, Bx(0.18, 0.015, 0.1), SM('#1a2236'), -0.05, 0.05, 0.16);
  for (const [x, z] of [[-1.05, 2.6], [1.05, 2.6], [-1.05, -2], [1.05, -2]]) add(tr, Cy(0.45, 0.45, 0.3, 14), SM('#151515'), x, 0.45, z).rotation.z = PI / 2;
  R.tIn = new T3.PointLight('#c8d0e8', 1.2, 4, 1.5); R.tIn.position.set(0, 2.5, -1.5); tr.add(R.tIn); R.tCab = new T3.PointLight('#ffe8c8', 4, 3, 1.5); R.tCab.position.set(0, 2.1, 2.4); tr.add(R.tCab);
  R.smoke = []; for (let i = 0; i < 8; i++) R.smoke.push(glow(tr, '#9a9aa2', 0.6, 0.8, 0.3, -3, 0));
  // the jacket on the razor wire
  R.jk = new T3.Group(); g.add(R.jk); R.jk.scale.setScalar(1.4); const jm = SM('#e0601c', { roughness: 0.9 }); add(R.jk, Bx(0.55, 0.6, 0.09), jm, 0, 0, 0); for (const sx of [-1, 1]) add(R.jk, Bx(0.14, 0.5, 0.09), jm, sx * 0.34, -0.06, 0).rotation.z = sx * 0.5; add(R.jk, Bx(0.2, 0.06, 0.1), SM('#c84c10'), 0, 0.3, 0);
  // guards at the fence
  R.guards = [0, 1, 2].map(() => { const p = guardP(); g.add(p); return p; }); R.driver = person({ skin: '#d8a07c', top: '#2a5a8a', bot: '#2a2e3a', cap: '#1a2236', hair: '#3a2416', sleeve: true }); g.add(R.driver);
  R.gL = new T3.SpotLight('#fff2d0', 40, 18, 0.35, 0.5, 1.2); g.add(R.gL); R.gL.position.set(-0.6, 2, -16); R.gLT = new T3.Object3D(); g.add(R.gLT); R.gL.target = R.gLT; R.gLT.position.set(...JK);
  // front gate: wall, barrier, booth, lamp, gate guard
  const wm = SM('#ffffff', { map: concreteT('#7a776e', [6, 1]), roughness: 0.95 }); add(g, Bx(0.6, 4, 19), wm, BARX - 1.5, 2, -23.5); add(g, Bx(0.6, 4, 20), wm, BARX - 1.5, 2, 0); add(g, Bx(0.8, 0.5, 5), SM('#d8b830'), BARX - 1.5, 4.25, -12);
  add(g, new T3.PlaneGeometry(3.2, 0.42), new T3.MeshBasicMaterial({ map: ctex(256, 34, c => { c.fillStyle = '#d8b830'; c.fillRect(0, 0, 256, 34); c.fillStyle = '#111'; c.font = '24px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FRONT GATE', 128, 18); }), toneMapped: false }), BARX - 1.08, 4.25, -12, false).rotation.y = PI / 2;
  R.bar = new T3.Group(); R.bar.position.set(BARX, 1.55, -9.9); g.add(R.bar); add(R.bar, Bx(0.13, 0.13, 4.3), new T3.MeshStandardMaterial({ map: ctex(128, 8, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#e8e8e8' : '#d81e1e'; c.fillRect(i * 16, 0, 16, 8); } }), roughness: 0.5 }), 0, 0, -2.15); add(g, Bx(0.3, 1.6, 0.3), SM('#3a3e44'), BARX, 0.8, -9.7);
  const bo = new T3.Group(); bo.position.set(BARX + 1, 0, -8.3); g.add(bo); add(bo, Bx(1.8, 2.6, 1.8), SM('#c8c4b8'), 0, 1.3, 0); add(bo, Bx(2.1, 0.2, 2.1), SM('#3a3e44'), 0, 2.7, 0); add(bo, Bx(1.2, 0.7, 0.05), new T3.MeshBasicMaterial({ color: '#ffd890', toneMapped: false }), 0, 1.7, -0.92, false); add(bo, Bx(0.05, 0.7, 1.2), new T3.MeshBasicMaterial({ color: '#ffd890', toneMapped: false }), 0.92, 1.7, 0, false);
  const gl = new T3.PointLight('#ffd8a0', 30, 18, 1.4); gl.position.set(BARX + 1.5, 4.5, -12); g.add(gl); add(g, Cy(0.08, 0.1, 5.5, 8), SM('#3a3e44'), BARX + 2.5, 2.75, -14.5); add(g, Bx(0.6, 0.2, 0.4), new T3.MeshBasicMaterial({ color: '#fff0c8', toneMapped: false }), BARX + 2.5, 5.6, -14.2, false);
  R.gg = guardP(); g.add(R.gg); R.ggL = new T3.SpotLight('#fff2d0', 0, 12, 0.3, 0.5, 1.2); g.add(R.ggL); R.ggLT = new T3.Object3D(); g.add(R.ggLT); R.ggL.target = R.ggLT;
  // first-person extras: driver cap brim at the top of view, ID card in hand, the jacket in hand
  R.brim = add(R.vm, Bx(0.6, 0.02, 0.22), SM('#1a2236'), 0, 0.17, -0.2, false); R.brim.rotation.x = 0.2;
  R.idc = add(R.handR.userData.h, Bx(0.09, 0.004, 0.06), new T3.MeshBasicMaterial({ map: ctex(96, 64, c => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, 96, 64); c.fillStyle = '#2a5a8a'; c.fillRect(0, 0, 96, 14); c.fillStyle = '#fff'; c.font = '10px Russo'; c.fillText('LAUNDRY CO', 6, 11); c.fillStyle = '#c8a888'; c.fillRect(6, 20, 28, 36); c.fillStyle = '#333'; c.fillRect(40, 24, 46, 5); c.fillRect(40, 34, 36, 5); c.fillRect(40, 44, 42, 5); }) }), 0, 0.03, -0.09, false);
  R.jkH = add(R.handR.userData.h, Bx(0.16, 0.12, 0.1), SM('#e0601c', { roughness: 0.9 }), 0, 0.03, -0.1, false);
}
const Y = (x, y, z) => [YX + x, y, z];
function TW(lx, ly, lz) { R.truck.updateMatrixWorld(true); const v = R.truck.localToWorld(new T3.Vector3(lx, ly, lz)); return [v.x - YX, v.y, v.z]; }
function jacketPos(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci === 1) return null; if (ci === 2 && T < E.threw + 0.05) return null;
  const k = ci === 2 ? prog(T, E.threw + 0.05, E.threw + 0.7) : 1; const a = [0.4, 1.9, -2.4]; return [lerp(a[0], JK[0], k), lerp(a[1], JK[1], k) + 3.2 * S(PI * k) * (1 - k * 0.3), lerp(a[2], JK[2], k)]; }
// searchlight: on you in the recap, then it follows the jacket to the wire and stays there
function slAim(T) { const ci = T >= E.loop ? 0 : CLI(T); const j = jacketPos(T); if (ci === 1 || (ci === 2 && !j)) { const you = camera.position; const k = ci === 1 ? ease(prog(T, E.recap, E.found + 0.3)) : 1; const sw = Y(-4, 0, -8); return [lerp(sw[0], you.x, k), lerp(0, you.y - 0.4, k), lerp(sw[2], you.z, k)]; }
  const p = j || JK; return [YX + p[0] + 0.15 * S(T * 1.3), p[1] - 0.5, p[2]]; }
const tx = T => T >= E.loop ? TRK[0] : lerp(TRK[0], STOPX, ease(prog(T, E.engine - 0.2, E.guard + 0.3)));
const SH = [
  [0, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.6, 4.3, -17), T, 0, 0.5)],
  [E.recap, (k, T) => fp(Y(0.3, 1.62, -1.6), Y(8.6, 7.6, -14.2), T, 0, 0.8)],
  [E.c2, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(-0.6, 3.2, -18), Y(-0.9, 4.6, -18), ease(k)), T, 0, 0.5)],
  [E.lightF - 0.05, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(-0.9, 4.6, -18), Y(3, 6.5, -16), ease(prog(k, 0, 0.7))), T, 0, 0.5)],
  [E.c3, (k, T) => { const kk = ease(prog(T, E.c3, E.climbed + 0.2)); fp(L3(Y(0.3, 1.62, -1.6), Y(...TW(0, 1.62, -3.6)), kk), Y(...TW(0, 1.2, -1)), T, 1, 0.6); }],
  [E.climbed + 0.2, (k, T) => fp(Y(...TW(0, lerp(1.1, 1.5, ease(k)), lerp(-3.2, -2.3, ease(k)))), Y(...TW(0, 1.0, 1)), T, 0, 0.5)],
  [E.c4, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.4, 2.6, -16.5), T, 0, 0.6)],
  [E.c5, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), L3(Y(-2.6, 1.4, -15.2), Y(-1.4, 2.2, -16.5), ease(k)), T, 0, 0.5)],
  [E.leaves - 0.05, (k, T) => fp(Y(...TW(0.2, 1.75, 1.85)), L3(Y(...TW(-0.9, 1.25, 2.7)), Y(...TW(-0.55, 1.0, 2.3)), ease(k)), T, 0, 0.3)],
  [E.c6, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(0.45, 1.5, 8)), T, 0, 0.3)],
  [E.wants - 0.1, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), L3(Y(...TW(0.45, 1.5, 8)), Y(...TW(4, 1.65, 2.6)), ease(prog(k, 0, 0.4))), T, 0, 0.3)],
  [E.optA, (k, T) => fp(Y(...TW(0.5, 1.85, 2.15)), Y(BARX, 1.6, -12.2), T, 0, 0.3)],
  [E.optB - 0.1, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(4, 1.6, 2.5)), T, 0, 0.3)],
  [E.loop, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.6, 4.3, -17), T, 0, 0.5)],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = false; R.brim.visible = false; R.idc.visible = false; R.jkH.visible = false; const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  R.sleeveM.color.set(ci >= 6 && !loop ? '#2a5a8a' : '#e0601c'); if (loop) return;
  if (ci === 1) { hl.visible = true; hl.position.set(-0.12, -0.06, -0.36); hl.rotation.set(1.2, -0.3, 0.3); }
  if (ci === 2 && T < E.threw + 0.15) { hr.visible = true; R.jkH.visible = true; const w = prog(T, E.c2, E.threw - 0.05), f = prog(T, E.threw - 0.05, E.threw + 0.12); hr.position.set(0.2 + 0.05 * w - 0.1 * f, -0.25 + 0.2 * w - 0.1 * f, -0.3 + 0.12 * w - 0.25 * f); hr.rotation.set(0.4 + 1.2 * w - 1.6 * f, 0.2, -0.2); }
  if (ci === 3) { const s = S(T * 9); hr.visible = hl.visible = true; if (T < E.climbed) { hr.position.set(0.18, -0.24 + s * 0.04, -0.38); hr.rotation.set(0.4 + s * 0.2, 0.2, -0.2); hl.position.set(-0.2, -0.28 - s * 0.05, -0.4); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); } else { hr.position.set(0.16, -0.22, -0.4); hr.rotation.set(-0.3, 0, 0); hl.position.set(-0.16, -0.22, -0.4); hl.rotation.set(-0.3, 0, 0); } }
  if (ci === 4 || (ci === 5 && T < E.leaves - 0.05)) { hl.visible = true; hl.position.set(-0.2, -0.12, -0.42); hl.rotation.set(0.2, 0.3, 1.2); }
  if (ci >= 6) { R.brim.visible = true; hr.visible = hl.visible = true; const steer = ci === 6 ? 0.06 * S(T * 1.3) : 0; hr.position.set(0.15, -0.25 + steer, -0.42); hr.rotation.set(0.5, 0.2, -0.5); hl.position.set(-0.15, -0.25 - steer, -0.42); hl.rotation.set(0.5, -0.2, 0.5);
    if (ci === 8 && T > E.optB - 0.1 && T < E.comment) { const k = ease(prog(T, E.optB + 0.3, E.optB + 0.7)); R.idc.visible = k > 0; hr.position.set(0.15 + 0.08 * k, -0.25 + 0.1 * k, -0.42 - 0.05 * k); hr.rotation.set(0.5 + 0.5 * k, 0.2, -0.5 + 0.3 * k); } } }
function anim(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T);
  R.truck.position.x = tx(T); const moving = ci === 6 || (ci === 7 && T < E.guard + 0.3);
  R.dL.visible = true; R.dL.rotation.y = ci === 5 && T < E.leaves ? -1.3 : ci === 3 || ci === 4 || ci === 0 || loop ? -1.3 : -0.05; R.dR.rotation.y = ci <= 5 || loop ? 0.35 : 0.05;
  // searchlight
  const aim = slAim(T); R.slT.position.set(aim[0] - YX, aim[1], aim[2]); R.slHead.lookAt(aim[0], aim[1], aim[2]);
  const from = new T3.Vector3(); R.slHead.getWorldPosition(from); const to = new T3.Vector3(...aim); const mid = from.clone().lerp(to, 0.5); const len = from.distanceTo(to); R.slBeam.position.copy(mid).sub(R.yardG.position); R.slBeam.scale.set(1, len / 22, 1); R.slBeam.quaternion.setFromUnitVectors(new T3.Vector3(0, -1, 0), to.clone().sub(from).normalize()); R.slBeam.material.opacity = 0.11;
  R.shackle.position.y = 0.12; R.gate.rotation.y = -1.5; R.dex.visible = false; R.dexWin.intensity = 0;
  R.wins.forEach((m, i) => m.material.color.set('#f4d890')); R.alarm.forEach((a_, i) => { const on = Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; });
  R.smoke.forEach((m, i) => { const ph = (T * (moving ? 2 : 0.8) + i / 8) % 1; m.position.set(0.8 + ph * 0.3, 0.3 + ph * 1.2, -3 - ph * (moving ? 2 : 0.6)); m.scale.setScalar(0.4 + ph * 1.2); m.material.opacity = 0.35 * (1 - ph); });
  // jacket: in hand, flying, then snagged on the wire (guards pull it in the flash-forward)
  const j = jacketPos(T); R.jk.visible = !!j; if (j) { R.jk.position.set(...j); const k = ci === 2 ? prog(T, E.threw + 0.05, E.threw + 0.7) : 1; R.jk.rotation.set(k * 6 * (1 - k) + 0.2, 0.3, (1 - k) * 4 + 0.15); if (k >= 1) R.jk.rotation.set(0.25, 0.15, 0.2 + 0.05 * S(T * 3)); if (ci === 0 || loop) R.jk.position.y = JK[1] - 0.15 + 0.08 * Math.abs(S(T * 5)); }
  // guards run out of the block and swarm the fence
  const GF = [[-1.8, -16.6], [-0.6, -16.9], [0.6, -16.5]]; const run0 = ci === 0 || loop ? 1 : ci < 3 ? -1 : prog(T, E.c3 + 0.3, E.c4 + 1.0);
  R.guards.forEach((p, i) => { pose(p); p.visible = run0 >= 0; if (!p.visible) return; const st = [-2 + i * 2, 4]; const k = ease(run0); p.position.set(lerp(st[0], GF[i][0], k), 0, lerp(st[1], GF[i][1], k)); p.rotation.y = PI + 0.15 * (i - 1); const u = p.userData;
    if (k < 1) run(p, T * 11 + i, 1.1); else { u.armR.rotation.set(-2.0 - 0.3 * i, 0, 0.1); u.armR.userData.e.rotation.x = -0.4; if (i === 1) { u.armL.rotation.set(-2.9, 0, 0.2); u.armR.rotation.set(-2.9, 0, -0.2); u.armL.userData.e.rotation.x = -0.2 + 0.2 * S(T * 8); } }
    if (i === 0) u.mouth.scale.y = (ci === 4 && !loop) ? 3 + 2 * Math.abs(S(T * 20)) : 1; });
  R.gL.intensity = (ci === 0 || loop || ci >= 4) ? 80 : 0; R.gL.position.set(-0.6, 2.2, -16.2);
  // the driver: in the cab, then jumps out and runs to the fence
  pose(R.driver); const dk = ci < 5 && !loop ? -1 : ci === 5 ? prog(T, E.c5 + 0.1, E.leaves + 0.6) : 1; R.driver.visible = dk >= 0 && ci <= 5 && !loop;
  if (R.driver.visible) { const a = [-4.3, -13.5], b = [-3.6, -14.6], c = [-2.4, -16.4]; const k = dk; const p = k < 0.35 ? L3([...a, 0], [...b, 0], k / 0.35) : L3([...b, 0], [...c, 0], (k - 0.35) / 0.65); R.driver.position.set(p[0], 0, p[1]); R.driver.rotation.y = k < 0.35 ? PI - 0.6 : PI - 0.6; run(R.driver, T * 11, 1.2); }
  R.cabCap.visible = ci === 5 && T > E.leaves - 0.1;
  // gate guard steps out with a torch and comes to the window
  pose(R.gg); const gk = ci < 7 ? -1 : ci === 7 ? prog(T, E.steps - 0.1, E.torch + 0.6) : 1; R.gg.visible = gk >= 0 && !loop; R.ggL.intensity = 0;
  if (R.gg.visible) { const a = [BARX + 1, -7.3], b = [tx(T) - 2.4, -10.1]; R.gg.position.set(lerp(a[0], b[0], ease(gk)), 0, lerp(a[1], b[1], ease(gk))); R.gg.rotation.y = gk < 1 ? -2.2 : PI; if (gk < 1) run(R.gg, T * 7, 0.5); const u = R.gg.userData; if (gk >= 1) { u.armR.rotation.set(-1.4, 0, 0.3); u.armR.userData.e.rotation.x = -0.3; if (ci === 8 || T > E.wants) { u.armL.rotation.set(-1.2, 0, -0.2); } }
    const cp = camera.position; R.ggL.position.copy(R.gg.position).add(new T3.Vector3(0.25, 1.4, -0.3)); R.ggLT.position.set(cp.x - YX, cp.y, cp.z); R.ggL.intensity = gk > 0.5 ? 20 : 0; }
  R.bar.rotation.y = 0;
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); R.truck.position.x = tx(T); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function hud(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#e8641e'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . PART 5', 149, 69, 26, '#ff9a5a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.18 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  const fooled = !loop && ((ci === 2 && T > E.lightF) || (ci >= 3 && ci <= 6)) || loop || ci === 0; const atGate = ci >= 7 && !loop; const lbl = atGate ? 'GUARD AT GATE' : fooled ? 'GUARDS FOOLED' : 'GUARDS ALERTED';
  octx.save(); octx.fillStyle = fooled && !atGate ? 'rgba(10,80,30,0.9)' : 'rgba(120,0,0,0.9)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt(lbl, 583, 156, 22, Math.floor(T * 4) % 2 ? '#fff' : (fooled && !atGate ? '#9af0b0' : '#ff8a7a')); octx.restore();
  const items = [['KEYS', 1], ['GATE', 1], ['DEX', -1], ['DECOY', loop || ci === 0 || ci >= 3 || (ci === 2 && T > E.lightF) ? 1 : 0], ['TRUCK', loop || ci === 0 || ci >= 4 || (ci === 3 && T > E.climbed) ? 1 : 0], ['UNIFORM', !loop && ci >= 6 ? 1 : 0]];
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 116, 196, 306, 18); octx.fill();
  items.forEach(([s_, d], i) => { txt(d > 0 ? '✓' : d < 0 ? '✗' : '□', 50, 151 + i * 46, 26, d > 0 ? '#5ad88a' : d < 0 ? '#ff4a4a' : '#9a9aa8'); txt(s_, 78, 152 + i * 46, 24, d > 0 ? '#fff' : d < 0 ? '#ff8a8a' : '#9a9aa8', 'left'); if (d < 0) { octx.fillStyle = '#ff4a4a'; octx.fillRect(74, 151 + i * 46, 62, 3); } }); octx.restore();
  if (ci >= 6 && ci <= 7 && !loop) { const m = Math.max(0, Math.round(50 * (1 - prog(T, E.engine - 0.2, E.guard + 0.3)))); octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(470, 212, 226, 64, 22); octx.fill(); txt('GATE ' + m + ' M', 583, 245, 26, '#ffd27a'); octx.restore(); } }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ff9a5a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['sixty', 'seconds'], '60 seconds'], [['fifty', 'metres'], '50 metres']];
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const VCOL = { bm_george: '#ffad6a', am_onyx: '#8ac8ff' }, VWHO = { bm_george: 'DEX', am_onyx: 'GUARD' };
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|Dex|Officer|Reyes|ID|C|A\.?|B\.?)$/.test(w.w); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function caption(c) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = c.txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur); const y0 = 1100 - (lines.length - 1) * 31;
  if (c.who) { octx.font = '24px Russo'; octx.lineWidth = 8; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(c.who, 360, y0 - 46); octx.fillStyle = c.col; octx.fillText(c.who, 360, y0 - 46); octx.font = '50px Russo'; }
  lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = c.col; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }
function rewindFx(T) { const k = prog(T, E.rew, E.rew + 0.7); if (k <= 0 || k >= 1) return; const r = rng(Math.floor(T * 60)); SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 0; i < 14; i++) { const y = r() * H, h = 10 + r() * 50, dx = (r() - 0.5) * 120 * (1 - k); octx.drawImage(SNAP, 0, y, W, h, dx, y, W, h); } octx.fillStyle = `rgba(255,255,255,${0.12 * (1 - k)})`; for (let y = 0; y < H; y += 6) octx.fillRect(0, y, W, 2); }
window.initFootball = async function () {
  await Promise.all(['30px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#05060a'); scene.fog = new T3.Fog('#05060e', 8, 22); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 100); scene.add(camera); build(); build2(); build3(); scene.fog.near = 14; scene.fog.far = 70;
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0 } = shot(T); const loop = T >= E.loop; renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.1) saturate(1.05)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(2px)'; octx.globalAlpha = 0.12; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.16); if (si > 0 && tk < 1 && !loop && ![3, 5, 10, 12].includes(si)) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.04 * i; octx.globalAlpha = 0.2 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.65) contrast(2.3)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.35; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.07; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const fl = flashAt(T); if (fl > 0) { octx.fillStyle = `rgba(210,225,255,${0.3 * fl})`; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 360, 360, 640, 860); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.65)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 1 && !loop) { const g_ = 0.22 * ease(prog(T, E.found - 0.2, E.found + 0.4)); octx.fillStyle = `rgba(255,248,225,${g_})`; octx.fillRect(0, 0, W, H); }
  if (ci >= 7 && !loop && R.gg.visible) { const g_ = 0.1 * ease(prog(T, E.torch, E.torch + 0.6)); octx.fillStyle = `rgba(255,244,215,${g_})`; octx.fillRect(0, 0, W, H); }
  if (ci === 4 && !loop) { octx.fillStyle = `rgba(160,0,0,${0.05 + 0.05 * Math.max(0, S(T * 8))})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big("YOU'RE NOT ON THAT FENCE", 470, 44, '#ff4a4a', 1); if (!loop && T > E.think - 0.1) big('THE GUARDS THINK YOU ARE', 540, 36, '#fff', prog(T, E.think - 0.1, E.think + 0.1)); }
  if (ci === 1) big('60 SECONDS AGO', 470, 54, '#ffd27a', prog(T, E.recap, E.recap + 0.2));
  if (ci === 2 && T > E.threw) { big('THE JACKET TRICK', 470, 52, '#ff9a5a', prog(T, E.threw, E.threw + 0.15)); if (T > E.lightF - 0.1) { const a = ease(prog(T, E.lightF - 0.1, E.lightF + 0.2)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(6,6,10,0.85)'; octx.beginPath(); octx.roundRect(170, 520, 380, 54, 27); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 2; octx.stroke(); txt('IDEA FROM THE COMMENTS', 360, 548, 22, '#ffd27a'); octx.restore(); } }
  if (ci === 3 && T > E.climbed - 0.1) big('LAUNDRY TRUCK', 470, 56, '#9ad0ff', prog(T, E.climbed - 0.1, E.climbed + 0.1));
  if (ci === 5 && T > E.cap - 0.1) big('CAP + JACKET', 470, 56, '#9ad0ff', prog(T, E.cap - 0.1, E.cap + 0.1));
  if (ci === 6 && T > E.driver - 0.15) big("YOU'RE THE DRIVER", 470, 50, '#5ad88a', prog(T, E.driver - 0.15, E.driver + 0.05));
  if (ci === 7 && T > E.wants - 0.1) big('ID, PLEASE', 470, 60, '#ff4a4a', prog(T, E.wants - 0.1, E.wants + 0.1));
  if (ci === 8 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. FLOOR IT' : 'B. HAND OVER THE ID', 470, 52, A ? '#ff9a5a' : '#7ad0ff', 1); big(A ? 'THROUGH THE BARRIER' : 'AND KEEP YOUR HEAD DOWN', 540, 36, '#fff', 1); } else big('COMMENT A OR B', 470, 64, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
