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
const E = { c1: CL[1].start, photo: AT(1, 'your') + 0.05, c2: CL[2].start, betrayed: AT(2, 'betrayed'), walked: AT(2, 'walked'), c3: CL[3].start, saw: AT(3, 'saw'), lead: AT(3, 'off'), c4: CL[4].start, barking: AT(4, 'barking'), closer2: AT(4, 'and'), c5: CL[5].start, jump: AT(5, 'jump'), c6: CL[6].start, scent: AT(6, 'scent'), c7: CL[7].start,
  c8: CL[8].start, knock: AT(8, 'knock'), three: AT(8, 'three'), c9: CL[9].start, opens: AT(9, 'opens'), behind: AT(9, 'behind'), girl: AT(9, 'girl'), eyes: AT(9, 'your', 1) + 0.35,
  past: 999, sunrise: 999, note: 999, welcome: 999, seven: 999, one: 999, every: 999, comment: 999, nobody: 999, rb: 999, drove: 999,
  gotin: 999, coffee: 999, says: 999, brother: 999, smiles: 999, waves: 999, photo2: 999, atYou: 999, atDex: 999, train: 999, dexR: 999,
  recap: CL[1].start, id: 999, lifted: 999, swap: 999, ditch: 999, sirens: 999, window: 999, dex: 999, optA: 999, optB: 999,
  threw: 999, lightF: 999, climbed: 999, found: 999, engine: 999, guard: 999, think: 999, leaves: 999, cap: 999, driver: 999, wants: 999, steps: 999, torch: 999, c4_: 0 };
E.loop = 999;
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
const DITCH = [-150, 0, -17.6];
function build4() { const g = R.yardG; const asph = SM('#2a2a2e', { roughness: 0.9 }), line = SM('#d8d4c0'), grass = SM('#26341f', { roughness: 1 });
  add(g, Bx(260, 0.1, 90), grass, -150, -0.07, -10); add(g, Bx(240, 0.06, 6.5), asph, -150, -0.02, -12, false); for (let x = -30; x > -270; x -= 5) add(g, Bx(2.4, 0.07, 0.14), line, x, 0.0, -12, false);
  const trunk = SM('#3a2a1e'), leaf = SM('#1e3a22'), leaf2 = SM('#244a28'); const r = rng(61); for (let i = 0; i < 70; i++) { const x = -40 - r() * 200, side = r() < 0.5 ? -1 : 1, z = side < 0 ? -16 - r() * 9 : -7.5 + r() * 6; if (Math.abs(x - DITCH[0]) < 3 && side < 0) continue; const h = 2 + r() * 2.5; add(g, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(g, new T3.ConeGeometry(1.1 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  for (const dx of [-3, -1.5, 1.5, 3, 0, -2.2, 2.2]) { const h = 3 + r(); add(g, Cy(0.15, 0.2, 1.2, 6), trunk, DITCH[0] + dx, 0.6, DITCH[2] - 2.2 - r() * 1.5); add(g, new T3.ConeGeometry(1.4, h, 7), leaf, DITCH[0] + dx, 1.2 + h / 2, DITCH[2] - 2.2 - r() * 1.5); }
  for (let x = -45; x > -240; x -= 28) { add(g, Cy(0.08, 0.1, 5.5, 8), SM('#3a3e44'), x, 2.75, -8.3); add(g, Bx(0.8, 0.15, 0.4), new T3.MeshBasicMaterial({ color: '#ffe0a8', toneMapped: false }), x, 5.5, -8.8, false); const pl = new T3.PointLight('#ffd8a0', 18, 18, 1.4); pl.position.set(YX + x, 5.2, -9); scene.add(pl); }
  // city skyline glowing ahead
  R.city = []; for (let i = 0; i < 40; i++) { const x = -420 - r() * 40, z = -12 + (r() - 0.5) * 150, w = 8 + r() * 10, h = 14 + r() * 50; const t = ctex(64, 128, (c) => { c.fillStyle = '#14161e'; c.fillRect(0, 0, 64, 128); for (let y = 4; y < 128; y += 8) for (let xx = 4; xx < 64; xx += 8) if (Math.random() < 0.45) { c.fillStyle = Math.random() < 0.5 ? '#ffd890' : '#cfe0ff'; c.fillRect(xx, y, 4, 4); } }); add(g, Bx(w, h, w), new T3.MeshBasicMaterial({ map: t, fog: false }), x, h / 2, z, false); }
  for (let i = 0; i < 6; i++) { const s_ = glow(g, '#ffb070', 70, -440, 6, -60 + i * 24, 0.25); s_.material.fog = false; }
  // police lights far behind (near the prison)
  R.cops = [glow(g, '#ff2020', 8, -45, 1.5, -11, 0), glow(g, '#2050ff', 8, -46, 1.5, -12.5, 0)]; R.cops.forEach(c => c.material.fog = false);
  // the car Dex drives
  const car = R.car = new T3.Group(); g.add(car); const paint = SM('#a8323a', { metalness: 0.15, roughness: 0.45 }), glass = new T3.MeshStandardMaterial({ color: '#141820', roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.35 });
  add(car, Bx(4.3, 0.7, 1.8), paint, 0, 0.6, 0); add(car, Bx(2.3, 0.08, 1.66), paint, 0.25, 1.56, 0); for (const px of [-0.85, 0.25, 1.35]) for (const pz of [-0.8, 0.8]) add(car, Bx(0.08, 0.5, 0.08), paint, px, 1.27, pz); R.carSeat = add(car, Bx(0.15, 0.55, 1.4), SM('#2a2a30'), 0.6, 1.2, 0);
  for (const [x, z] of [[-1.35, 0.85], [1.35, 0.85], [-1.35, -0.85], [1.35, -0.85]]) add(car, Cy(0.36, 0.36, 0.25, 12), SM('#111'), x, 0.36, z).rotation.x = PI / 2;
  R.carWin = add(car, Bx(0.95, 0.46, 0.04), glass, -0.25, 1.27, 0.86, false); R.carHL = [glow(car, '#fff4d0', 2.4, -2.2, 0.7, 0.6, 1), glow(car, '#fff4d0', 2.4, -2.2, 0.7, -0.6, 1)]; glow(car, '#ff2020', 0.8, 2.2, 0.75, 0.6, 0.9); glow(car, '#ff2020', 0.8, 2.2, 0.75, -0.6, 0.9);
  R.carL = new T3.SpotLight('#fff0d0', 0, 40, 0.5, 0.5, 1.2); R.carL.position.set(-2.2, 0.8, 0); car.add(R.carL); R.carLT = new T3.Object3D(); R.carLT.position.set(-20, 0, 0); car.add(R.carLT); R.carL.target = R.carLT;
  R.inCar = new T3.PointLight('#ffd8a8', 6, 5, 1.2); R.inCar.position.set(-0.2, 1.4, 0); car.add(R.inCar);
  R.tLamp = new T3.PointLight('#ffe2b0', 0, 6, 1.2); R.tLamp.position.set(0, 2.6, -0.8); R.truck.add(R.tLamp); R.hood = add(R.handR.userData.h, Bx(0.2, 0.14, 0.12), SM('#7a7a82', { roughness: 0.9 }), 0, 0.03, -0.1, false); }
const RB = -205, STOPC = -202, TRN = [-600, 0, 800];
function attach(o, p, x, y, z) { if (o.parent !== p) p.add(o); o.position.set(x, y, z); }
function build5() { const g = R.yardG;
  // Dex changed too: hoodie instead of the orange top
  R.dex.traverse(m => { if (m.material && m.material.color && m.material.color.getHexString() === SM('#d8581a').color.getHexString()) { m.material = m.material.clone(); m.material.color.set('#2e3a2e'); } if (m.isSprite && m !== R.dexEyes[0] && m !== R.dexEyes[1]) m.visible = false; });
  // car interior: dash, windscreen, wheel
  const car = R.car; add(car, Bx(0.45, 0.32, 1.62), SM('#1c1c22'), -0.95, 1.0, 0); add(car, Bx(0.04, 0.5, 1.6), new T3.MeshStandardMaterial({ color: '#203040', transparent: true, opacity: 0.18, roughness: 0.05 }), -1.15, 1.3, 0, false).rotation.z = -0.5;
  R.wheel = add(car, new T3.TorusGeometry(0.17, 0.02, 6, 16), SM('#111'), -0.72, 1.15, 0.4); R.wheel.rotation.y = PI / 2; R.wheel.rotation.x = 0.4;
  R.cup = new T3.Group(); car.add(R.cup); add(R.cup, Cy(0.04, 0.032, 0.12, 10), SM('#f2efe6'), 0, 0, 0); add(R.cup, Cy(0.043, 0.043, 0.035, 10), SM('#8a5a32'), 0, 0.01, 0);
  // the roadblock: police car, cones, flashing bar
  const pc = R.pcar = new T3.Group(); pc.position.set(RB - 4, 0, -15.2); pc.rotation.y = 0.5; g.add(pc); const wht = SM('#e8e8ea', { roughness: 0.4 }), blk = SM('#14161c', { roughness: 0.4 });
  add(pc, Bx(4.3, 0.7, 1.8), wht, 0, 0.6, 0); add(pc, Bx(4.32, 0.25, 1.82), SM('#1a3aa8'), 0, 0.55, 0); add(pc, Bx(2.3, 0.6, 1.66), blk, 0.25, 1.25, 0); add(pc, Bx(0.9, 0.12, 1.2), blk, 0.25, 1.62, 0);
  for (const [x, z] of [[-1.35, 0.85], [1.35, 0.85], [-1.35, -0.85], [1.35, -0.85]]) add(pc, Cy(0.36, 0.36, 0.25, 12), SM('#111'), x, 0.36, z).rotation.x = PI / 2;
  R.pbar = [glow(pc, '#ff2020', 1.6, 0.25, 1.75, 0.4, 1), glow(pc, '#2050ff', 1.6, 0.25, 1.75, -0.4, 1)]; R.pbarL = [new T3.PointLight('#ff2020', 0, 18, 1.2), new T3.PointLight('#2050ff', 0, 18, 1.2)]; R.pbarL.forEach((l, i) => { l.position.set(0.25, 2.2, i ? -0.4 : 0.4); pc.add(l); });
  const cone = SM('#ff6a10', { roughness: 0.6 }); for (const z of [-14.6, -13.4, -9.8]) { add(g, new T3.ConeGeometry(0.18, 0.55, 8), cone, RB, 0.28, z); add(g, Bx(0.4, 0.04, 0.4), cone, RB, 0.02, z); }
  add(g, Bx(0.12, 0.9, 0.12), SM('#c8c8c8'), RB - 0.5, 0.45, -8.9); R.sign = add(g, Bx(1.4, 0.5, 0.05), new T3.MeshBasicMaterial({ map: ctex(140, 50, c => { c.fillStyle = '#f0d020'; c.fillRect(0, 0, 140, 50); c.fillStyle = '#111'; c.font = '22px Russo'; c.textAlign = 'center'; c.fillText('POLICE CHECK', 70, 33); }) }), RB - 0.5, 1.15, -8.9, false); R.sign.rotation.y = PI / 2;
  const fl = new T3.PointLight('#fff0d0', 14, 14, 1.2); fl.position.set(RB - 1, 4, -9.5); g.add(fl);
  // the mugshot the cop is holding
  R.mug = new T3.Sprite(new T3.SpriteMaterial({ map: ctex(120, 156, c => { c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, 120, 156); c.fillStyle = '#c81e1e'; c.fillRect(0, 0, 120, 26); c.fillStyle = '#fff'; c.font = '17px Russo'; c.textAlign = 'center'; c.fillText('ESCAPED', 60, 19); c.fillStyle = '#9aa0aa'; c.fillRect(10, 32, 100, 92); c.fillStyle = '#e0601c'; c.beginPath(); c.ellipse(60, 128, 42, 26, 0, PI, 0); c.fill(); c.fillStyle = '#d8b088'; c.fillRect(42, 52, 36, 46); c.fillStyle = '#222'; c.fillRect(48, 68, 6, 6); c.fillRect(66, 68, 6, 6); c.fillRect(52, 86, 16, 3); c.fillStyle = '#111'; c.font = '15px Russo'; c.fillText('INMATE 2291', 60, 148); }) }));
  R.mug.scale.set(0.24, 0.31, 1); g.add(R.mug);
  R.note = add(R.vm, new T3.PlaneGeometry(0.28, 0.196), new T3.MeshBasicMaterial({ map: ctex(200, 140, c => { c.fillStyle = '#f4efe0'; c.fillRect(0, 0, 200, 140); c.strokeStyle = '#c8c0a8'; for (let y = 30; y < 140; y += 22) { c.beginPath(); c.moveTo(8, y); c.lineTo(192, y); c.stroke(); } c.fillStyle = '#1a2a6a'; c.font = 'italic 24px Russo'; c.textAlign = 'center'; c.fillText("You're welcome.", 100, 72); c.font = 'italic 26px Russo'; c.fillText('- D', 150, 115); }), toneMapped: false }), 0, -0.16, -0.42, false);
  // ---- the sunrise train ----
  const tr = R.train = new T3.Group(); tr.position.set(...TRN); scene.add(tr); const wall = SM('#d8d2c4', { roughness: 0.8 }), seatM = SM('#2a4a8a', { roughness: 0.9 }), fr = SM('#5a5e66', { metalness: 0.5, roughness: 0.4 });
  add(tr, Bx(12, 0.1, 3), SM('#4a4a50'), 0, 0, 0); add(tr, Bx(12, 0.1, 3), wall, 0, 2.5, 0); add(tr, Bx(12, 2.5, 0.1), wall, 0, 1.25, -1.5); add(tr, Bx(12, 0.85, 0.1), wall, 0, 0.42, 1.5); add(tr, Bx(12, 0.5, 0.1), wall, 0, 2.25, 1.5);
  for (let x = -6; x <= 6; x += 1.8) add(tr, Bx(0.18, 1.2, 0.12), fr, x, 1.45, 1.5); add(tr, Bx(12, 0.06, 0.18), fr, 0, 0.86, 1.48);
  for (const x of [-1.6, 1.6, -4.8, 4.8]) { const sx = x > 0 ? 1 : -1; add(tr, Bx(0.5, 0.45, 1.2), seatM, x, 0.45, 0.6); add(tr, Bx(0.15, 0.85, 1.2), seatM, x + sx * 0.25, 1.0, 0.6); }
  add(tr, Bx(0.8, 0.05, 0.6), SM('#8a8e94'), 0, 0.75, 1.15); add(tr, Cy(0.04, 0.04, 0.75, 8), SM('#8a8e94'), 0, 0.37, 1.15);
  R.tLight = new T3.DirectionalLight('#ffb070', 0); R.tLight.position.set(TRN[0] + 2, 6, TRN[2] + 10); R.tLight.target.position.set(TRN[0], 0, TRN[2]); scene.add(R.tLight); scene.add(R.tLight.target); R.tFill = new T3.PointLight('#ffe8d0', 0, 10, 1.2); R.tFill.position.set(0, 2.2, 0); tr.add(R.tFill);
  const skyT = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a7a'); gr.addColorStop(0.42, '#d87a6a'); gr.addColorStop(0.52, '#ffc070'); gr.addColorStop(1, '#ffd8a0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  R.tSky = add(tr, Sp(260, 24, 16), new T3.MeshBasicMaterial({ map: skyT, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); R.tSun = glow(tr, '#fff0b0', 40, -30, 6, 160, 1); R.tSun.material.fog = false;
  add(tr, Bx(600, 0.1, 400), SM('#5a6a3a', { roughness: 1 }), 0, -0.6, 200, false);
  R.land = []; const r = rng(91); for (let i = 0; i < 40; i++) { const z = 5 + r() * 60, h = 2 + r() * 3; const o = new T3.Group(); tr.add(o); add(o, new T3.ConeGeometry(1 + r(), h, 7), SM(r() < 0.5 ? '#2a4a2a' : '#3a5a30'), 0, h / 2 - 0.5, 0); o.userData = { x0: r() * 200, z }; R.land.push(o); }
  for (let i = 0; i < 8; i++) { const o = new T3.Group(); tr.add(o); add(o, Cy(0.06, 0.06, 5, 6), SM('#3a2a1e'), 0, 2, 0); o.userData = { x0: i * 25, z: 3.5 }; R.land.push(o); }
  R.tCity = new T3.Group(); tr.add(R.tCity); for (let i = 0; i < 14; i++) { const h = 6 + r() * 20, w = 4 + r() * 5; add(R.tCity, Bx(w, h, w), new T3.MeshBasicMaterial({ color: '#4a3a5a', fog: false }), -20 + i * 4 + r() * 2, h / 2 - 0.5, 0, false); }
  tr.visible = false; }
const BM = (c) => new T3.MeshBasicMaterial({ color: c, toneMapped: false });
const RIVW = [-600, 0, -400], HOMEW = [600, 0, 800];
const RV = (x, y, z) => [RIVW[0] + x, RIVW[1] + y, RIVW[2] + z], HM = (x, y, z) => [HOMEW[0] + x, HOMEW[1] + y, HOMEW[2] + z];
function dogM() { const g = new T3.Group(); const fur = SM('#5a4430', { roughness: 0.9 }), tan = SM('#9a7040', { roughness: 0.9 }), blk = SM('#0a0a0a');
  add(g, Bx(0.3, 0.3, 0.85), fur, 0, 0.62, 0); add(g, Bx(0.28, 0.2, 0.5), tan, 0, 0.5, 0.15);
  const head = new T3.Group(); head.position.set(0, 0.82, 0.46); g.add(head); add(head, Bx(0.24, 0.24, 0.26), fur, 0, 0, 0); add(head, Bx(0.14, 0.12, 0.2), tan, 0, -0.05, 0.2); add(head, Bx(0.06, 0.05, 0.04), blk, 0, -0.01, 0.31);
  for (const sx of [-1, 1]) { const e = add(head, new T3.ConeGeometry(0.05, 0.16, 4), fur, sx * 0.08, 0.18, -0.04); e.rotation.z = -sx * 0.15; add(head, Bx(0.03, 0.03, 0.02), SM('#e8c040'), sx * 0.07, 0.04, 0.13, false); }
  const legs = []; for (const [x, z] of [[-0.1, 0.32], [0.1, 0.32], [-0.1, -0.32], [0.1, -0.32]]) { const l = new T3.Group(); l.position.set(x, 0.5, z); g.add(l); add(l, Bx(0.08, 0.5, 0.08), fur, 0, -0.25, 0); legs.push(l); }
  const tail = new T3.Group(); tail.position.set(0, 0.7, -0.42); g.add(tail); add(tail, Cy(0.025, 0.04, 0.4, 6), fur, 0, 0.18, -0.06).rotation.x = -0.5;
  g.userData = { head, legs, tail }; return g; }
function dogRun(d, T, a = 1) { const u = d.userData; u.legs.forEach((l, i) => l.rotation.x = (i % 2 === (i < 2 ? 0 : 1) ? 1 : -1) * 0.9 * a * S(T * 16)); d.children[0].position.y = 0.62 + 0.04 * a * Math.abs(S(T * 16)); u.head.rotation.x = 0; u.tail.rotation.x = 0.3 * S(T * 12); }
function dogStill(d, T, sniff) { const u = d.userData; u.legs.forEach(l => l.rotation.x = 0); u.head.rotation.x = sniff ? 0.5 + 0.12 * S(T * 9) : 0; u.tail.rotation.x = 0.2 * S(T * 5); }
function build6() {
  // more woods behind the roadside trees, for the sprint
  const r = rng(77), trunk = SM('#3a2a1e'), leaf = SM('#1e3a22'), leaf2 = SM('#244a28'); for (let i = 0; i < 90; i++) { const x = -165 - r() * 45, z = -1 + r() * 32; if (Math.abs(x + 187) < 1.6) continue; const h = 3 + r() * 3; add(R.yardG, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(R.yardG, new T3.ConeGeometry(1.0 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  R.dog = dogM(); R.dog.scale.setScalar(1.25); R.yardG.add(R.dog);
  // ---- the river ----
  const rv = R.riv = new T3.Group(); rv.position.set(...RIVW); scene.add(rv); const grass = SM('#1e2a1a', { roughness: 1 }), mud = SM('#2a221a', { roughness: 1 });
  add(rv, Bx(90, 3.5, 30), grass, 0, -1.75, -18); add(rv, Bx(90, 3.5, 30), grass, 0, -1.75, 18); add(rv, Bx(90, 0.2, 6), mud, 0, -3.1, 0); add(rv, Bx(90, 0.05, 0.2), mud, 0, -0.02, -3.0);
  const wt = new T3.MeshStandardMaterial({ color: '#1a4050', transparent: true, opacity: 0.62, roughness: 0.15, metalness: 0.3, side: T3.DoubleSide }); R.water = add(rv, new T3.PlaneGeometry(90, 6), wt, 0, -0.5, 0, false); R.water.rotation.x = -PI / 2;
  for (let i = 0; i < 60; i++) { const x = -40 + r() * 80, side = r() < 0.5 ? -1 : 1, z = side * (4.5 + r() * 14); if (Math.abs(x) < 2.5 && side < 0 && z > -9) continue; const h = 3 + r() * 3; add(rv, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(rv, new T3.ConeGeometry(1.1 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  // bridge downstream, city beyond
  const conc = SM('#6a6a70', { roughness: 0.9 }); add(rv, Bx(3.2, 0.5, 16), conc, 18, 2.8, 0); for (const z of [-3.3, 3.3]) add(rv, Bx(0.8, 6.5, 0.8), conc, 18, -0.4, z); for (const z of [-7.8, 7.8]) add(rv, Bx(3.2, 0.9, 0.15), conc, 18, 3.4, z);
  for (const z of [-7, 7]) { glow(rv, '#ffd8a0', 2.5, 18, 5.2, z, 0.9); const pl = new T3.PointLight('#ffd8a0', 20, 16, 1.3); pl.position.set(18, 5, z); rv.add(pl); }
  for (let i = 0; i < 24; i++) { const x = 55 + r() * 60, z = -40 + r() * 80, w = 6 + r() * 8, h = 12 + r() * 40; const t = ctex(64, 128, (c) => { c.fillStyle = '#14161e'; c.fillRect(0, 0, 64, 128); for (let y = 4; y < 128; y += 8) for (let xx = 4; xx < 64; xx += 8) if (Math.random() < 0.45) { c.fillStyle = Math.random() < 0.5 ? '#ffd890' : '#cfe0ff'; c.fillRect(xx, y, 4, 4); } }); add(rv, Bx(w, h, w), new T3.MeshBasicMaterial({ map: t, fog: false }), x, h / 2 - 1, z, false); }
  R.moon = new T3.DirectionalLight('#9ab8ff', 0); R.moon.position.set(RIVW[0] - 10, 20, RIVW[2] - 10); R.moon.target.position.set(...RIVW); scene.add(R.moon); scene.add(R.moon.target);
  R.bankL = new T3.PointLight('#d8e4ff', 0, 10, 1.2); R.bankL.position.set(1.0, 2.5, -5.5); rv.add(R.bankL); R.rdog = dogM(); R.rdog.scale.setScalar(1.25); rv.add(R.rdog); R.rcop = guardP(); rv.add(R.rcop); R.torch = new T3.SpotLight('#fff4d8', 0, 25, 0.35, 0.5, 1.2); rv.add(R.torch); R.torchT = new T3.Object3D(); rv.add(R.torchT); R.torch.target = R.torchT;
  R.bubbles = []; for (let i = 0; i < 16; i++) R.bubbles.push({ x: Math.random(), ph: Math.random(), s: 6 + Math.random() * 10 });
  // ---- home at sunrise ----
  const hm = R.home = new T3.Group(); hm.position.set(...HOMEW); scene.add(hm);
  const sky = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a7ac0'); gr.addColorStop(0.4, '#f0a890'); gr.addColorStop(0.5, '#ffd090'); gr.addColorStop(1, '#ffe8c0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  add(hm, Sp(220, 24, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); const sun = glow(hm, '#fff0c0', 40, 60, 8, -150, 1); sun.material.fog = false;
  add(hm, Bx(120, 0.2, 120), SM('#6a8a4a', { roughness: 1 }), 0, -0.1, 0); add(hm, Bx(1.3, 0.05, 8), SM('#b8b0a0'), 0, 0.01, 4.6); add(hm, Bx(120, 0.06, 2.2), SM('#a8a49c'), 0, 0.02, 9.5); add(hm, Bx(120, 0.05, 6), SM('#3a3a40'), 0, 0.0, 13.5);
  const wall = SM('#ece2cc', { roughness: 0.9 }); for (const sx of [-1, 1]) add(hm, Bx(3.95, 3.4, 0.25), wall, sx * 2.525, 1.7, -0.12); add(hm, Bx(1.1, 1.2, 0.25), wall, 0, 2.8, -0.12); add(hm, Bx(0.25, 3.4, 6), wall, -4.5, 1.7, -3); add(hm, Bx(0.25, 3.4, 6), wall, 4.5, 1.7, -3);
  const roof = add(hm, new T3.ConeGeometry(6.6, 2.4, 4), SM('#8a3a2a'), 0, 4.6, -3); roof.rotation.y = PI / 4; roof.scale.z = 0.7;
  for (const sx of [-1, 1]) add(hm, Bx(0.1, 2.3, 0.12), SM('#f4f0e6'), sx * 0.6, 1.15, 0.02); add(hm, Bx(1.3, 0.1, 0.12), SM('#f4f0e6'), 0, 2.25, 0.02); add(hm, Bx(1.8, 0.15, 1.1), SM('#c8c0b0'), 0, 0.075, 0.6); glow(hm, '#ffe0a0', 0.8, 0.85, 2.3, 0.15, 0.9);
  for (const x of [-2.6, 2.6]) { add(hm, Bx(1.4, 1.1, 0.06), BM('#ffd890'), x, 1.8, 0.02, false); add(hm, Bx(1.5, 0.08, 0.1), SM('#f4f0e6'), x, 1.22, 0.05); }
  R.hdoor = new T3.Group(); R.hdoor.position.set(-0.5, 0, 0.0); hm.add(R.hdoor); add(R.hdoor, Bx(1.0, 2.15, 0.07), SM('#2a4a7a'), 0.5, 1.08, 0); add(R.hdoor, Sp(0.04, 8, 6), SM('#d8b84a', { metalness: 0.7 }), 0.88, 1.05, 0.06);
  add(hm, Bx(1.1, 2.3, 0.05), BM('#e8b878'), 0, 1.1, -2.6, false); add(hm, Bx(1.2, 0.05, 2.6), SM('#8a6a4a'), 0, 0.0, -1.3); for (const x of [-0.6, 0.6]) add(hm, Bx(0.05, 2.3, 2.6), SM('#e8d8b8'), x, 1.15, -1.3);
  R.hall = new T3.PointLight('#ffd8a0', 0, 6, 1.2); R.hall.position.set(0, 2.0, -1.2); hm.add(R.hall);
  for (let i = 0; i < 12; i++) add(hm, Bx(0.08, 0.9, 0.08), SM('#f4f0e6'), -5 + i * 0.4 - (i > 5 ? -1.6 : 0), 0.45, 8.3); add(hm, Bx(4.5, 0.08, 0.06), SM('#f4f0e6'), -3.3, 0.8, 8.3); add(hm, Bx(4.5, 0.08, 0.06), SM('#f4f0e6'), 3.3, 0.8, 8.3);
  add(hm, Cy(0.2, 0.25, 2.5, 8), SM('#5a3a24'), 4.0, 1.25, 4); add(hm, Sp(1.6, 10, 8), SM('#3a6a2a'), 4.0, 3.4, 4);
  for (const x of [-14, 14]) { add(hm, Bx(8, 3.4, 6), SM(x < 0 ? '#d8c8b0' : '#c8d0d8'), x, 1.7, -3); const rf = add(hm, new T3.ConeGeometry(6.4, 2.2, 4), SM('#5a4a4a'), x, 4.5, -3); rf.rotation.y = PI / 4; rf.scale.z = 0.7; }
  R.hSun = new T3.DirectionalLight('#ffd8b0', 0); R.hSun.position.set(HOMEW[0] + 30, 20, HOMEW[2] + 40); R.hSun.target.position.set(...HOMEW); scene.add(R.hSun); scene.add(R.hSun.target); R.hHemi = new T3.HemisphereLight('#ffe8d0', '#6a5a4a', 0); scene.add(R.hHemi);
  R.photo = add(R.vm, new T3.PlaneGeometry(0.2, 0.24), new T3.MeshBasicMaterial({ map: ctex(150, 180, c => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, 150, 180); c.fillStyle = '#e8b890'; c.fillRect(10, 10, 130, 130); c.fillStyle = '#ffe0a8'; c.fillRect(10, 10, 130, 60); c.fillStyle = '#4a2a18'; c.beginPath(); c.ellipse(75, 66, 34, 40, 0, 0, PI * 2); c.fill(); c.fillRect(41, 66, 68, 60); c.fillStyle = '#d8a882'; c.beginPath(); c.ellipse(75, 72, 24, 30, 0, 0, PI * 2); c.fill(); c.fillStyle = '#c86a7a'; c.fillRect(38, 112, 74, 28); c.fillStyle = '#222'; c.fillRect(64, 66, 5, 5); c.fillRect(81, 66, 5, 5); c.fillStyle = '#a04a4a'; c.fillRect(68, 86, 14, 3); c.fillStyle = '#3a3a5a'; c.font = 'italic 17px Russo'; c.textAlign = 'center'; c.fillText('come home', 75, 166); }), toneMapped: false }), 0, -0.06, -0.6, false);
  R.wife = person({ skin: '#d8a882', top: '#c86a7a', bot: '#3a3a4a', hair: '#4a2a18', w: 0.92 }); add(R.wife.userData.head, Bx(0.24, 0.34, 0.1), SM('#4a2a18', { roughness: 0.95 }), 0, -0.1, -0.08); hm.add(R.wife);
  R.girl = person({ skin: '#d8a882', top: '#f0c040', bot: '#e88aa8', hair: '#4a2a18', w: 0.95 }); for (const sx of [-1, 1]) add(R.girl.userData.head, Sp(0.05, 8, 6), SM('#4a2a18'), sx * 0.12, 0.02, -0.04); R.girl.scale.setScalar(0.55); hm.add(R.girl);
}
// ---------- where you are ----------
// clips: 0 hook underwater . 1 prison behind you + photo of your wife . 2 Dex pulls up, you walk away . 3 roadblock, cop sees you, dog released
//        4 sprint . 5 river jump . 6 underwater, scent lost . 7 drift under bridge . 8 sunrise walk + knock . 9 the door
const WALK = T => { const ci = CLI(T); if (ci === 1) return [lerp(-60, -62, prog(T, E.c1, E.c2)), -8.4]; if (ci === 2) return [lerp(-161, -163.5, prog(T, E.c2, E.c3)), -8.4]; if (ci === 3) return [lerp(-184, -186, prog(T, E.c3, E.saw)), -8.4]; return [-186, -8.4]; };
const RUN = T => { const k = prog(T, E.c4, E.c5); return [lerp(-186, -188, k), lerp(-6, 18, k)]; };
const DEXOUT = T => CLI(T) >= 3;
const carX = T => { const ci = CLI(T); if (ci === 2) { const w = WALK(T)[0]; return T < E.walked ? w + 0.25 : w + 0.25 - 30 * prog(T, E.walked, E.c3) ** 1.6; } return STOPC; };
function jumpCam(T) { const j = prog(T, E.jump - 0.05, E.jump + 0.65); if (T < E.jump - 0.05) { const k = prog(T, E.c5, E.jump - 0.05); return RV(0, 1.6, lerp(-12, -3.6, k)); } return RV(0, j < 0.4 ? lerp(1.6, 2.1, j / 0.4) : lerp(2.1, -1.5, (j - 0.4) / 0.6), lerp(-3.6, -0.2, j)); }
const SH = [
  [0, (k, T) => fp(RV(0, -1.5, 0.3), RV(0.2, 1.4, -3.6), T, 0, 1.0)],
  [E.c1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(-5, 4, -12), T, 0.5, 0.5); }],
  [E.photo - 0.15, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(w[0] - 1.2, 0.6, w[1] - 0.2), T, 0, 0.3); }],
  [E.c2, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.walked - 0.1 ? Y(carX(T) - 0.3, 1.2, -11.0) : Y(w[0] - 20, 1.6, -9.5), T, 0.6, 0.5); }],
  [E.c3, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(STOPC - 0.2, 1.3, -10.0), T, 0.6, 0.5); }],
  [E.saw - 0.1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.lead - 0.1 ? Y(STOPC - 1.3, 1.5, -9.3) : Y(R.dog.position.x, 0.6, R.dog.position.z), T, 0, 0.4); }],
  [E.c4, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] - 0.5, 1.3, p[1] + 10), T, 2.2, 1.5); }],
  [E.barking - 0.1, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] + 0.4, 0.5, p[1] - 6), T, 2.2, 1.5); }],
  [E.closer2 - 0.15, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] - 0.5, 1.3, p[1] + 10), T, 2.5, 1.6); }],
  [E.c5, (k, T) => { const c = jumpCam(T); const under = c[1] < RIVW[1] - 0.5; fp(c, under ? RV(0, 0.6, -3.0) : RV(0, 0.2, 2.5), T, T < E.jump ? 2.2 : 0, 1.4); }],
  [E.c6, (k, T) => fp(RV(0, -1.5, 0.3), RV(0.2, 1.4, -3.6), T, 0, 1.0)],
  [E.c7, (k, T) => { const x = lerp(0, 22, k); fp(RV(x, -0.22, 0.3), RV(x + 12, 0.9, 0.3), T, 0, 1.2); }],
  [E.c8, (k, T) => { const z = T < E.knock - 0.1 ? lerp(7, 1.3, prog(T, E.c8, E.knock - 0.1)) : 1.3; fp(HM(0, 1.62, z), HM(0, 1.45, -0.2), T, T < E.knock - 0.1 ? 0.8 : 0, 0.4); }],
  [E.c9, (k, T) => { const z = lerp(1.7, 1.3, ease(k)); fp(HM(0, 1.6, z), HM(0.08, 1.15, -0.7), T, 0, 0.3); }],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
const SECTION = T => { const ci = CLI(T); if (ci === 0 || (ci >= 5 && ci <= 7)) return 'riv'; if (ci >= 8) return 'home'; return 'yard'; };
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = R.brim.visible = R.idc.visible = R.jkH.visible = R.hood.visible = false; R.note.visible = false; R.photo.visible = false; R.sleeveM.color.set('#7a7a82'); const ci = CLI(T);
  const swing = (sp, a) => { const s = S(T * sp); hr.visible = hl.visible = true; hr.position.set(0.18, -0.3 + s * 0.06 * a, -0.38 + s * 0.05 * a); hr.rotation.set(0.4 + s * 0.4 * a, 0.2, -0.2); hl.position.set(-0.2, -0.3 - s * 0.06 * a, -0.4 - s * 0.05 * a); hl.rotation.set(0.4 - s * 0.4 * a, -0.2, 0.2); };
  if (ci === 1 && T < E.photo - 0.15) swing(8, 0.5);
  if (ci === 1 && T >= E.photo - 0.15) { const a = ease(prog(T, E.photo - 0.15, E.photo + 0.3)); hr.visible = hl.visible = R.photo.visible = true; R.photo.position.set(0, lerp(-0.42, -0.06, a), -0.6); hr.position.set(0.16, lerp(-0.43, -0.1, a), -0.45); hr.rotation.set(1.3, 0, -0.5); hl.position.set(-0.16, lerp(-0.43, -0.1, a), -0.45); hl.rotation.set(1.3, 0, 0.5); }
  if (ci === 2 || ci === 3) swing(9, 0.6);
  if (ci === 4 || (ci === 5 && T < E.jump)) swing(16, 1.6);
  const float = () => { hr.visible = hl.visible = true; const s = S(T * 2); hr.position.set(0.26, -0.18 + 0.03 * s, -0.42); hr.rotation.set(0.2, 0.5, -0.9 + 0.15 * s); hl.position.set(-0.26, -0.18 - 0.03 * s, -0.42); hl.rotation.set(0.2, -0.5, 0.9 - 0.15 * s); };
  if (ci === 0 || ci === 6 || (ci === 5 && T > E.jump + 0.5)) float();
  if (ci === 8) { if (T < E.knock - 0.1) swing(8, 0.5); else { hr.visible = true; const kn = [0, 0.28, 0.56].some(d => T > E.knock + d && T < E.knock + d + 0.12); hr.position.set(0.06, -0.12, kn ? -0.5 : -0.4); hr.rotation.set(1.5, 0, 0); } } }
function anim(T) { const ci = CLI(T), sec = SECTION(T); R.yardG.visible = sec === 'yard'; R.riv.visible = sec === 'riv'; R.home.visible = sec === 'home'; R.train.visible = false;
  R.truck.position.set(DITCH[0], 0, DITCH[2]); R.smoke.forEach(m => m.material.opacity = 0); R.tLamp.intensity = 0; R.slBeam.material.opacity = ci === 1 ? 0.12 : 0.05; R.dexWin.intensity = 0; R.jk.visible = false; R.guards.forEach(p => p.visible = false); R.driver.visible = false; R.cabCap.visible = false; R.gL.intensity = 0; R.mug.visible = false; R.cup.visible = false;
  R.alarm.forEach((a_, i) => { const on = ci === 1 && Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; }); R.cops.forEach((c, i) => { c.material.opacity = ci === 1 ? (Math.floor(T * 5 + i) % 2 ? 0.95 : 0.15) : 0; });
  R.tLight.intensity = 0; R.tFill.intensity = 0; R.moon.intensity = sec === 'riv' ? 2.2 : 0; R.bankL.intensity = sec === 'riv' ? 18 : 0; R.hSun.intensity = sec === 'home' ? 1.5 : 0; R.hHemi.intensity = sec === 'home' ? 0.7 : 0;
  const fogs = { yard: ['#05060e', 30, 180, '#05060a'], riv: ['#16284a', 6, 60, '#22365e'], home: ['#f4c8a0', 40, 220, '#f4c49a'] }[sec]; scene.fog.color.set(fogs[0]); scene.fog.near = fogs[1]; scene.fog.far = fogs[2]; scene.background.set(fogs[3]);
  const ph = Math.floor(T * 5) % 2; R.pbar[0].material.opacity = ph ? 1 : 0.15; R.pbar[1].material.opacity = ph ? 0.15 : 1; R.pbarL[0].intensity = ph ? 20 : 2; R.pbarL[1].intensity = ph ? 2 : 20;
  // Dex: beside you in his car (clip 2), then pinned at the roadblock
  R.car.position.set(carX(T), 0, -11.2); R.carL.intensity = 40; R.carWin.scale.y = 0.02; R.carWin.position.y = 1.05;
  const dx = R.dex, u = dx.userData; pose(dx); dx.visible = sec === 'yard' && ci >= 2; R.dexEyes.forEach(e => e.material.opacity = 0.5);
  if (!DEXOUT(T)) { sit(dx); dx.scale.setScalar(0.85); dx.rotation.set(0, -PI / 2, 0); attach(dx, R.car, -0.25, -0.12, 0.4); u.armL.rotation.set(-1.1, 0, 0); u.armR.rotation.set(-1.1, 0, 0); u.armL.userData.e.rotation.x = -0.3; u.armR.userData.e.rotation.x = -0.3; u.head.rotation.y = T < E.walked ? 1.2 : 0; }
  else { attach(dx, R.yardG, STOPC - 0.3, 0, -9.8); dx.rotation.set(0, PI, 0); dx.scale.setScalar(1); u.armL.rotation.set(-2.2, 0, 0); u.armR.rotation.set(-2.2, 0, 0); u.head.rotation.y = 0.4; }
  const c = R.gg, g_ = c.userData, g1 = R.guards[0], g2 = R.guards[1]; [c, g1, g2].forEach(p => { pose(p); p.visible = ci >= 3; });
  c.position.set(STOPC + 0.5, 0, -9.6); c.rotation.set(0, -PI / 2, 0); g_.armR.rotation.set(-1.4, 0, 0.2); g2.position.set(STOPC - 0.3, 0, -8.5); g2.rotation.set(0, PI, 0);
  g1.position.set(STOPC - 1.3, 0, -9.3); g1.rotation.set(0, PI / 2, 0); g1.userData.armR.rotation.set(-1.5, 0, 0);
  const seen = ci > 3 || (ci === 3 && T > E.saw - 0.1); if (seen) { g1.rotation.y = Math.atan2(WALK(T)[0] - g1.position.x, WALK(T)[1] - g1.position.z); g1.userData.armR.rotation.set(-1.6, 0, 0); }
  if (ci === 3 && T > E.lead - 0.3) g1.userData.up.rotation.x = 0.5 * (1 - prog(T, E.lead, E.lead + 0.4));
  R.ggL.position.set(g1.position.x + 0.3, 1.4, g1.position.z); if (seen) { const w = WALK(T); R.ggLT.position.set(w[0], 1.5, w[1]); } else R.ggLT.position.set(STOPC - 0.3, 1.4, -9.8); R.ggL.intensity = sec === 'yard' && ci >= 3 ? 16 : 0;
  // the dog: at the cop's side, released, chasing you through the trees
  const d = R.dog; d.visible = sec === 'yard' && ci >= 3; dogStill(d, T, false); d.position.set(STOPC - 0.9, 0, -8.8); d.rotation.y = PI / 2;
  if (ci === 3 && T > E.lead) { const k = prog(T, E.lead, E.c4); const w = WALK(T); d.position.set(lerp(STOPC - 0.9, w[0] - 3, k), 0, lerp(-8.8, w[1] - 0.6, k)); d.rotation.y = Math.atan2(w[0] - d.position.x, w[1] - d.position.z); dogRun(d, T); }
  if (ci === 4) { const p = RUN(T), k = prog(T, E.c4, E.c5); d.position.set(p[0] + 0.4, 0, p[1] - lerp(8, 2.6, k)); d.rotation.y = 0; dogRun(d, T); }
  // river: dog sniffing the bank, cop's torch on the water; then the dog gives up
  const rd = R.rdog; rd.visible = ci === 0 || ci === 6; R.rcop.visible = rd.visible; R.torch.intensity = rd.visible ? 30 : 0;
  rd.position.set(0.3, 0, -3.5); rd.rotation.y = 0; dogStill(rd, T, true); pose(R.rcop); R.rcop.position.set(-1.6, 0, -5.4); R.rcop.rotation.y = 0.3; R.rcop.userData.armR.rotation.set(-1.3, 0, 0);
  R.torch.position.set(-1.4, 1.5, -5.0); R.torchT.position.set(0.3 + 1.5 * S(T * 1.3), -0.5, 0.5);
  if (ci === 6) { const arrive = prog(T, E.c6, E.c6 + 0.8); if (arrive < 1) { rd.position.z = lerp(-9, -3.5, arrive); dogRun(rd, T); } if (T > E.scent) { const a = prog(T, E.scent, E.c7); rd.rotation.y = PI * Math.min(1, a * 3); rd.position.z = -3.5 - 3 * Math.max(0, a - 0.3); dogStill(rd, T, false); if (a > 0.3) dogRun(rd, T, 0.6); } }
  // home: door opens, wife, then the girl peeks out
  R.hall.intensity = sec === 'home' ? 8 : 0; R.hdoor.rotation.y = ci === 9 ? 1.6 * ease(prog(T, E.c9, E.opens + 0.5)) : 0;
  const wf = R.wife, wu = wf.userData, gl = R.girl, gu = gl.userData; pose(wf); pose(gl); wf.visible = gl.visible = ci === 9; wf.position.set(0.05, 0, -0.55); wf.rotation.y = 0;
  if (ci === 9) { const h = ease(prog(T, E.opens + 0.3, E.opens + 0.8)) * (1 - ease(prog(T, E.girl, E.girl + 0.6))); wu.armR.rotation.set(-0.7 * h, 0, 0.35 * h); wu.armR.userData.e.rotation.x = -2.4 * h; wu.armL.rotation.set(-0.7 * h, 0, -0.35 * h); wu.armL.userData.e.rotation.x = -2.4 * h; wu.head.rotation.x = -0.05;
    const reach = ease(prog(T, E.girl + 0.4, E.girl + 1.4)); if (reach > 0) { wu.armR.rotation.set(-1.2 * reach, 0, 0); wu.armL.rotation.set(-1.2 * reach, 0, 0); wf.position.z = -0.55 + 0.25 * reach; } wu.mouth.scale.y = T > E.girl ? 0.5 : 2.2 * h + 1;
    const pk = ease(prog(T, E.behind, E.behind + 0.6)); gl.position.set(lerp(0.0, 0.42, pk), 0, -0.95); gl.rotation.y = -0.3 * pk; gu.up.rotation.z = 0.25 * pk; gu.armL.rotation.set(-0.4, 0, 0); gu.head.rotation.z = 0.2 * pk; }
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function hud(T) { const ci = CLI(T); if (ci >= 7) return; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 270, 64, 32); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . FINALE', 159, 69, 26, '#ffd27a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.47 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  if ((ci === 3 && T > E.lead) || ci === 4 || ci === 5 || ci === 0) { const dist = ci === 0 ? 2 : ci === 3 ? 20 : ci === 4 ? Math.round(lerp(14, 3, prog(T, E.c4, E.c5))) : 3; octx.save(); octx.fillStyle = Math.floor(T * 4) % 2 ? 'rgba(150,0,0,0.92)' : 'rgba(100,0,0,0.92)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt('K9 UNIT', 583, 142, 20, '#ffb0a0'); txt(ci === 5 && T > E.jump ? 'LOST YOU?' : 'DOG ' + dist + ' M', 583, 174, 28, '#fff'); octx.restore(); } }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ff9a5a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['ten', 'minutes'], '10 minutes']];
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
  scene = new T3.Scene(); scene.background = new T3.Color('#05060a'); scene.fog = new T3.Fog('#05060e', 8, 22); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 100); scene.add(camera); build(); build2(); build3(); build4(); build5(); build6();  scene.fog.near = 30; scene.fog.far = 180; camera.far = 500; camera.updateProjectionMatrix();
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0 } = shot(T); const loop = T >= E.loop; renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.1) saturate(1.05)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(2px)'; octx.globalAlpha = 0.12; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.16); if (si > 0 && tk < 1 && !loop && ![2, 5, 7, 8].includes(si)) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.04 * i; octx.globalAlpha = 0.2 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.65) contrast(2.3)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.35; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.07; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const fl = flashAt(T); if (fl > 0) { octx.fillStyle = `rgba(210,225,255,${0.3 * fl})`; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 360, 360, 640, 860); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.65)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const under = SECTION(T) === 'riv' && camera.position.y < RIVW[1] - 0.5;
  if (under) { octx.fillStyle = 'rgba(20,80,120,0.3)'; octx.fillRect(0, 0, W, H); octx.save(); octx.globalAlpha = 0.07; for (let i = 0; i < 5; i++) { const x = 120 + i * 130 + 30 * S(T + i); octx.fillStyle = '#9ad8ff'; octx.beginPath(); octx.moveTo(x - 30, 0); octx.lineTo(x + 30, 0); octx.lineTo(x + 90, H); octx.lineTo(x - 10, H); octx.fill(); } octx.restore();
    octx.save(); octx.strokeStyle = 'rgba(220,240,255,0.7)'; octx.lineWidth = 2; R.bubbles.forEach(b => { const ph = (T * 0.25 + b.ph) % 1; octx.beginPath(); octx.arc(b.x * W + 20 * S(T * 3 + b.ph * 9), H - ph * H * 1.1, b.s, 0, PI * 2); octx.stroke(); }); octx.restore(); }
  if (((ci === 3 && T > E.saw - 0.1) || ci === 4 || ci === 5) && !under) { const hb = Math.max(0, S(T * 9)) ** 4; const vg = octx.createRadialGradient(360, 640, 300, 360, 640, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(150,0,0,${0.25 + 0.3 * hb})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  if (ci === 4) { const r_ = rng(Math.floor(T * 3)); if (r_() < 0.45) { octx.save(); octx.strokeStyle = 'rgba(12,24,14,0.85)'; octx.lineCap = 'round'; octx.lineWidth = 26 + r_() * 30; const x0 = r_() * W; octx.beginPath(); octx.moveTo(x0, -20); octx.lineTo(x0 + (r_() - 0.5) * 500, H * (0.4 + r_() * 0.5)); octx.stroke(); octx.restore(); } }
  if (ci === 5 && T > E.jump + 0.42 && T < E.jump + 0.75) { octx.fillStyle = `rgba(235,250,255,${1 - prog(T, E.jump + 0.42, E.jump + 0.75)})`; octx.fillRect(0, 0, W, H); }
  if (ci === 7) { const a = 1 - prog(T, E.c7, E.c7 + 0.4); octx.fillStyle = `rgba(8,50,80,${0.6 * a})`; octx.fillRect(0, 0, W, H); }
  if (ci === 8) { const a = 1 - prog(T, E.c8, E.c8 + 0.8); octx.fillStyle = `rgba(255,236,200,${a})`; octx.fillRect(0, 0, W, H); }
  if (ci === 9) { const a = prog(T, E.eyes, E.eyes + 2.2); const vg = octx.createRadialGradient(360, 640, 200, 360, 640, 820); vg.addColorStop(0, 'rgba(255,220,170,0)'); vg.addColorStop(1, `rgba(255,220,170,${0.35 * a})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  hud(T);
  const tag = (s1, s2, col, a) => { octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(6,6,10,0.85)'; octx.beginPath(); octx.roundRect(150, 560, 420, 96, 24); octx.fill(); octx.strokeStyle = col; octx.lineWidth = 3; octx.stroke(); txt(s1, 360, 592, 30, col); txt(s2, 360, 630, 22, '#fff'); octx.restore(); };
  if (ci === 0) big("DON'T BREATHE", 480, 64, '#ff4a4a', 1);
  if (ci === 1) { big('INNOCENT', 480, 70, '#5ad88a', prog(T, AT(1, 'innocent') - 0.1, AT(1, 'innocent') + 0.1)); }
  if (ci === 2) { if (T < E.betrayed - 0.1) tag('DEX', 'YOUR CELLMATE', '#ffad6a', prog(T, AT(2, 'dex') - 0.1, AT(2, 'dex') + 0.1)); else if (T < E.walked - 0.1) big('HE BETRAYED YOU', 480, 50, '#ff4a4a', prog(T, E.betrayed - 0.1, E.betrayed + 0.1)); else big('YOU WALK AWAY', 480, 54, '#fff', prog(T, E.walked - 0.1, E.walked + 0.1)); }
  if (ci === 3 && T < E.saw - 0.1) big('ROADBLOCK', 480, 64, '#ff4a4a', prog(T, AT(3, 'roadblock') - 0.1, AT(3, 'roadblock') + 0.1));
  if (ci === 3 && T > E.saw - 0.1 && T < E.lead - 0.1) big('HE SAW YOU', 480, 64, '#ff4a4a', prog(T, E.saw - 0.1, E.saw + 0.1));
  if (ci === 3 && T > E.lead - 0.1) big('K9 RELEASED', 480, 64, '#ff4a4a', prog(T, E.lead - 0.1, E.lead + 0.1));
  if (ci === 5 && T > E.jump - 0.1 && T < E.jump + 0.45) big('JUMP', 480, 110, '#fff', prog(T, E.jump - 0.1, E.jump + 0.05));
  if (ci === 6 && T > E.scent - 0.1) big('SCENT LOST', 480, 66, '#5ad88a', prog(T, E.scent - 0.1, E.scent + 0.1));
  if (ci === 8 && T > E.three - 0.1) big('3 YEARS', 480, 70, '#ffd27a', prog(T, E.three - 0.1, E.three + 0.1));
  if (ci === 9 && T > E.eyes + 0.6) big('HOME', 150, 80, '#ffd27a', prog(T, E.eyes + 0.6, E.eyes + 1.2));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
