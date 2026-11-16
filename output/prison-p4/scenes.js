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
const E = { mistake: AT(0, 'big'), recap: CL[1].start, keysR: AT(1, 'grabbed'), ran: AT(1, 'ran'), gate: CL[2].start, five: AT(2, 'five'), k1: AT(2, 'first'), no1: AT(2, 'no'), k2: AT(2, 'second'), no2: AT(2, 'no', 1),
  dex: CL[3].start, scream: CL[4].start, guards: AT(4, 'every'), k3: CL[5].start, click: AT(5, 'click'), open: AT(5, 'the'), light: CL[6].start, yard: AT(6, 'thirty'), truck: AT(6, 'a'),
  optA: CL[7].start, optB: AT(7, 'option', 1), comment: AT(7, 'comment'), follow: AT(7, 'follow') };
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
  R.vm = new T3.Group(); camera.add(R.vm); const sleeve = SM('#e0601c'), hand = SM('#d8a07c');
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

// ---------- shots (all first person) ----------
const LX = 40;
const Y = (x, y, z) => [YX + x, y, z];
// where the searchlight points: sweeping the yard, then locked onto you
function slAim(T) { if (T >= E.loop || CLI(T) === 0 || T > E.light) { const k = CLI(T) === 0 || T >= E.loop ? 1 : ease(prog(T, E.light, E.light + 0.9)); const sw = Y(-6 + 12 * (0.5 + 0.5 * S(T * 0.5)), 0, -8); const you = camera.position; return [lerp(sw[0], you.x, k), lerp(0, you.y - 0.4, k), lerp(sw[2], you.z, k)]; } return Y(-6 + 12 * (0.5 + 0.5 * S(T * 0.5)), 0, -9 + 3 * S(T * 0.3)); }
const SH = [
  [0, (k, T) => fp(Y(0.2, 1.62, -4.5), Y(8.2, 7.4, -14), T, 0, 0.6)],
  [E.recap, (k, T) => fp(Y(0.3, 1.62, lerp(5.2, 2.0, k)), Y(0.6, 1.3, -2), T, 1, 0.6)],
  [E.gate, (k, T) => fp(Y(0.5, 1.5, 0.75), Y(0.9, 1.15, 0.05), T, 0, 0.4)],
  [E.dex - 0.05, (k, T) => fp(Y(0.6, 1.6, 0.9), Y(2, 3.3, 6), T, 0, 0.3)],
  [E.scream, (k, T) => fp(Y(0.2, 1.6, 1.0), Y(0, 5.2, 6), T, 0, 0.5)],
  [E.k3 - 0.05, (k, T) => fp(Y(0.5, 1.5, 0.75), Y(0.9, 1.15, 0.05), T, 0, 0.4)],
  [E.open + 0.3, (k, T) => fp(Y(0.4, 1.62, lerp(0.8, -1.2, k)), Y(0.4, 1.4, -8), T, 1, 0.6)],
  [E.light - 0.05, (k, T) => fp(Y(0.3, 1.62, -1.6), Y(8.6, 7.6, -14.2), T, 0, 0.8)],
  [E.yard - 0.1, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(0, 2.5, -18), Y(-5.4, 1.8, -15), ease(k)), T, 0, 0.6)],
  [E.optA, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(1, 2, -18), Y(1, 5.6, -18), ease(prog(k, 0, 0.5))), T, 0, 0.5)],
  [E.optB - 0.1, (k, T) => fp(Y(0.3, 1.62, -1.6), Y(-5.6, 1.6, -16.5), T, 0, 0.5)],
  [E.loop, (k, T) => fp(Y(0.2, 1.62, -4.5), Y(8.2, 7.4, -14), T, 0, 0.6)],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { if (!R.hk) { R.hk = new T3.Group(); R.handR.userData.h.add(R.hk); R.hk.position.set(0, 0.0, -0.1); add(R.hk, new T3.TorusGeometry(0.035, 0.006, 6, 16), SM('#c8c0a0', { metalness: 1, roughness: 0.3 }), 0, 0, 0); R.hkKeys = []; for (let k = 0; k < 5; k++) { const kk = add(R.hk, Bx(0.014, 0.005, 0.08), SM(k === 2 ? '#e8c040' : '#d8d8d0', { metalness: 1, roughness: 0.3 }), 0, -0.01, -0.06, false); kk.rotation.y = (k - 2) * 0.35; R.hkKeys.push(kk); } }
  const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = false; R.hk.visible = false; const ci = CLI(T); if (T >= E.loop) return;
  if (ci === 1) { hr.visible = true; R.hk.visible = true; const s = S(T * 9); hr.position.set(0.18, -0.24 + s * 0.04, -0.38); hr.rotation.set(0.4 + s * 0.2, 0.2, -0.2); hl.visible = true; hl.position.set(-0.2, -0.28 - s * 0.05, -0.4); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); }
  if (ci === 2 || ci === 5) { hr.visible = true; R.hk.visible = true; const tryK = ci === 5 ? 1 : (T > E.k2 - 0.1 ? 1 : T > E.k1 - 0.1 ? 1 : 0); const jig = (ci === 2 && ((T > E.no1 - 0.15 && T < E.no1 + 0.4) || (T > E.no2 - 0.15 && T < E.no2 + 0.4))) ? 0.012 * S(T * 60) : 0; const turn = ci === 5 && T > E.click - 0.15 ? -0.9 : 0;
    hr.position.set(0.1 + jig, -0.2 + 0.03 * (1 - tryK), -0.42 + 0.06 * tryK); hr.rotation.set(0.15, 0.4, -0.3 + turn); R.hkKeys.forEach((kk, i) => kk.scale.setScalar(i === (ci === 5 ? 2 : T > E.k2 - 0.1 ? 1 : 0) ? 1.3 : 1)); }
  if (ci === 6 || ci === 7) { hl.visible = true; const up = ci === 6 && T < E.yard - 0.1; hl.position.set(-0.12, up ? -0.06 : -0.3, -0.36); hl.rotation.set(up ? 1.2 : 0.4, -0.3, 0.3); hr.visible = true; R.hk.visible = true; hr.position.set(0.2, -0.3, -0.4); hr.rotation.set(0.4, 0.2, -0.2); } }
function anim(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T);
  // searchlight sweep / lock-on
  const aim = slAim(T); R.slT.position.copy(new T3.Vector3(...aim)).sub(R.yardG.position).add(R.yardG.position); R.slT.position.set(aim[0], aim[1], aim[2]); R.slHead.lookAt(aim[0], aim[1], aim[2]);
  const from = new T3.Vector3(); R.slHead.getWorldPosition(from); const to = new T3.Vector3(...aim); const mid = from.clone().lerp(to, 0.5); const len = from.distanceTo(to); R.slBeam.position.copy(mid).sub(R.yardG.position); R.slBeam.scale.set(1, len / 22, 1); R.slBeam.quaternion.setFromUnitVectors(new T3.Vector3(0, -1, 0), to.clone().sub(from).normalize());
  R.slBeam.material.opacity = 0.07 + (ci === 0 || T > E.light ? 0.05 : 0);
  // gate: padlock pops, gate swings open
  const opened = ci >= 6 || loop || (ci === 5 && T > E.click); R.shackle.position.y = opened ? 0.12 : 0.07; R.gate.rotation.y = opened ? -1.5 * ease(prog(T, E.open - 0.2, E.open + 0.8) + (ci >= 6 || loop ? 1 : 0)) : 0;
  // Dex at his window (screams when you leave him)
  const dexOn = ci === 3 || ci === 4; R.dex.visible = dexOn; R.dexWin.intensity = dexOn ? 8 : 0; if (dexOn) { const u = R.dex.userData; pose(R.dex); R.dex.rotation.y = 0; u.armL.rotation.set(-2.7, 0, 0.3); u.armR.rotation.set(-2.7, 0, -0.3); if (u.mouth) u.mouth.scale.y = ci === 3 ? 4 + 2 * Math.abs(S(T * 22)) : 2; R.dex.position.y = 1.75 + 0.03 * S(T * 30); u.armL.rotation.set(-2.2, 0, 0.5); u.armR.rotation.set(-2.2, 0, -0.5); }
  // the block wakes up: windows light up one by one, alarm beacons spin
  const wake = ci >= 4 || loop ? (loop ? 1 : prog(T, E.guards - 0.2, E.guards + 2.5)) : 0; R.wins.forEach((m, i) => m.material.color.set((i * 7 % R.wins.length) / R.wins.length < wake ? '#f4d890' : '#141820'));
  R.alarm.forEach((a_, i) => { const on = (ci >= 4 || loop) && Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; });
  // truck idles: smoke puffs, back door ajar
  R.smoke.forEach((m, i) => { const ph = (T * 0.8 + i / 8) % 1; m.position.set(0.8 + ph * 0.3, 0.3 + ph * 1.2, -3 - ph * 0.6); m.scale.setScalar(0.4 + ph * 1.2); m.material.opacity = 0.35 * (1 - ph); }); R.tDoorL.rotation.y = ci === 7 && T > E.optB - 0.1 ? -1.2 * ease(prog(T, E.optB, E.optB + 0.8)) : -0.15; R.tdl.intensity = ci === 7 && T > E.optB ? 6 : 0;
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function hud(T) { const loop = T >= E.loop; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#e8641e'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . PART 4', 149, 69, 26, '#ff9a5a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.17 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  const alert = !loop && T > E.scream; if (alert || loop) { octx.save(); octx.fillStyle = 'rgba(120,0,0,0.9)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt('GUARDS ALERTED', 583, 156, 22, Math.floor(T * 4) % 2 ? '#fff' : '#ff8a7a'); octx.restore(); }
  const items = [['KEY', 1], ['DEX', -1], ['CHUTE', 1], ['KEYS', 1], ['GATE', loop || (CLI(T) >= 5 && T > E.click) ? 1 : 0]]; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 116, 170, 260, 18); octx.fill();
  items.forEach(([s_, d], i) => { txt(d > 0 ? '✓' : d < 0 ? '✗' : '□', 50, 151 + i * 46, 26, d > 0 ? '#5ad88a' : d < 0 ? '#ff4a4a' : '#9a9aa8'); txt(s_, 78, 152 + i * 46, 24, d > 0 ? '#fff' : d < 0 ? '#ff8a8a' : '#9a9aa8', 'left'); if (d < 0) { octx.fillStyle = '#ff4a4a'; octx.fillRect(74, 151 + i * 46, 62, 3); } }); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ff9a5a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['thirty', 'seconds'], '30 seconds'], [['thirty', 'metres'], '30 metres']];
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const VCOL = { bm_george: '#ffad6a', am_onyx: '#8ac8ff' }, VWHO = { bm_george: 'DEX', am_onyx: 'REYES' };
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|Dex|Officer|Reyes|C|A\.?|B\.?)$/.test(w.w); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
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
  scene = new T3.Scene(); scene.background = new T3.Color('#05060a'); scene.fog = new T3.Fog('#05060e', 8, 22); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 100); scene.add(camera); build(); build2(); scene.fog.near = 14; scene.fog.far = 70;
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0 } = shot(T); const loop = T >= E.loop; renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.1) saturate(1.05)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(2px)'; octx.globalAlpha = 0.12; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.16); if (si > 0 && tk < 1 && !loop && ![2, 9, 12, 13].includes(si)) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.04 * i; octx.globalAlpha = 0.2 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.65) contrast(2.3)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.35; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.07; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const fl = flashAt(T); if (fl > 0) { octx.fillStyle = `rgba(210,225,255,${0.3 * fl})`; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 360, 360, 640, 860); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.65)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0 || loop || (ci === 6 && T > E.light && T < E.yard)) { const g_ = loop || ci === 0 ? 0.14 + 0.05 * S(T * 9) : 0.2 * ease(prog(T, E.light + 0.4, E.light + 1.0)); octx.fillStyle = `rgba(255,248,225,${g_})`; octx.fillRect(0, 0, W, H); }
  if ((ci >= 4 && ci <= 5) && !loop) { octx.fillStyle = `rgba(160,0,0,${0.06 + 0.06 * Math.max(0, S(T * 8))})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big('YOU LEFT DEX BEHIND', 430, 50, '#ff4a4a', 1); if (!loop && T > E.mistake - 0.1) big('BIG MISTAKE', 505, 44, '#fff', prog(T, E.mistake - 0.1, E.mistake + 0.1)); }
  if (ci === 1) big('30 SECONDS AGO', 430, 54, '#ffd27a', prog(T, E.recap, E.recap + 0.2));
  if (ci === 2) { if (T > E.five - 0.1 && T < E.k1 - 0.1) big('5 KEYS', 430, 70, '#ffd27a', prog(T, E.five - 0.1, E.five + 0.1)); if (T > E.no1 - 0.1 && T < E.k2 - 0.1) big('KEY 1 . NO', 430, 60, '#ff4a4a', 1); if (T > E.no2 - 0.1) big('KEY 2 . NO', 430, 60, '#ff4a4a', 1); }
  if (ci === 3) big('"YOU LEFT ME!"', 430, 66, '#ffad6a', prog(T, E.dex, E.dex + 0.12));
  if (ci === 4 && T > E.guards - 0.1) big('EVERY GUARD HEARD IT', 430, 46, '#ff4a4a', prog(T, E.guards - 0.1, E.guards + 0.1));
  if (ci === 5) { if (T > E.click - 0.1) big('CLICK', 430, 80, '#5ad88a', prog(T, E.click - 0.1, E.click + 0.1)); else big('KEY 3', 430, 60, '#ffd27a', 1); }
  if (ci === 6) { if (T > E.truck - 0.1) big('LAUNDRY TRUCK . IDLING', 430, 42, '#9ad0ff', prog(T, E.truck - 0.1, E.truck + 0.1)); else if (T > E.yard - 0.1) big('30 METRES OF OPEN YARD', 430, 40, '#fff', prog(T, E.yard - 0.1, E.yard + 0.1)); else if (T > E.light + 0.3) big('SPOTTED', 430, 80, '#ff4a4a', prog(T, E.light + 0.3, E.light + 0.5)); }
  if (ci === 7 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. CLIMB THE FENCE' : 'B. HIDE IN THE TRUCK', 430, 52, A ? '#ff9a5a' : '#7ad0ff', 1); big(A ? 'THROUGH THE RAZOR WIRE' : 'AND HOPE IT LEAVES', 500, 36, '#fff', 1); } else big('COMMENT A OR B', 430, 64, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
