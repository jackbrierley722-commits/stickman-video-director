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
const E = { take: AT(0, 'take'), or0: AT(0, 'or'), dex1: AT(1, 'dex'), youre: AT(1, "you're"), and1: AT(1, 'and'), rew: CL[2].start, storm: AT(2, 'storm'), power: AT(2, 'power'), gen: AT(2, 'generator'),
  key: CL[3].start, tb: AT(3, 'toothbrush'), six: AT(3, 'six'), turns: AT(3, 'turns'), like: CL[4].start, follow4: AT(4, 'follow'), clock4: AT(4, 'the'), guard: CL[5].start, head: AT(5, 'head'),
  reyes: CL[6].start, counts: AT(6, 'if'), over: AT(6, "it's"), then: CL[7].start, top: AT(7, 'from'), dex2: CL[8].start, take2: AT(8, 'take'), or2: AT(8, 'or'), optA: CL[9].start, optB: AT(9, 'option', 1), comment: AT(9, 'comment'), follow: AT(9, 'and', 2) };
E.loop = TM.total - 0.4;
const FL = [0.0, E.or0 + 0.05, E.storm + 0.05, E.over + 0.05, E.top + 0.3, E.or2 + 0.05, E.optB + 0.5, E.comment + 0.7];
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
  // first-person hands (children of the camera)
  R.vm = new T3.Group(); camera.add(R.vm); const sleeve = SM('#e0601c'), hand = SM('#d8a07c');
  const vmArm = () => { const a = new T3.Group(); R.vm.add(a); const f = add(a, Cy(0.038, 0.05, 0.36, 8), sleeve, 0, 0, 0.12, false); f.rotation.x = PI / 2; add(a, Cy(0.04, 0.04, 0.03, 8), SM('#c84c10'), 0, 0, -0.06, false).rotation.x = PI / 2; const h = new T3.Group(); h.position.z = -0.1; a.add(h); add(h, Bx(0.075, 0.035, 0.09), hand, 0, 0, -0.02, false); for (let i = 0; i < 4; i++) add(h, Bx(0.015, 0.02, 0.05), hand, -0.027 + i * 0.018, -0.008, -0.085, false); add(h, Bx(0.018, 0.02, 0.05), hand, -0.045, 0.004, -0.04, false).rotation.y = 0.5; a.userData.h = h; return a; };
  R.handR = vmArm(); R.handL = vmArm(); R.handL.scale.x = -1;
  R.key = new T3.Group(); R.handR.userData.h.add(R.key); R.key.position.set(0.0, 0.0, -0.08); R.key.scale.setScalar(0.6); add(R.key, Bx(0.016, 0.012, 0.15), SM('#f2f2f2', { roughness: 0.35 }), 0, 0.012, -0.05, false); add(R.key, Bx(0.02, 0.016, 0.06), SM('#2a7ad8', { roughness: 0.4 }), 0, 0.012, 0.03, false); for (let i = 0; i < 3; i++) add(R.key, Bx(0.016, 0.012 + (i % 2) * 0.012, 0.014), SM('#f2f2f2'), 0, 0.0, -0.1 - i * 0.022, false);
}

// ---------- shots (all first person) ----------
const DEXL = [-0.72, 2.3, -0.95], DEXP0 = [0.95, 1.7, 1.65], DEXP1 = [0.8, 1.7, 1.45];
const dexShot = (k, T) => fp(L3(DEXP0, DEXP1, ease(k)), DEXL, T);
const SH = [
  [0, (k, T) => dexShot(k, T)],
  [E.dex1 - 0.6, (k, T) => fp(L3(DEXP1, [0.3, 1.64, 0.95], ease(k)), DEXL, T)],
  [E.youre - 0.12, (k, T) => { const kk = ease(prog(T, E.youre - 0.12, E.youre + 0.5)); fp([0.5, 1.62, 1.55], L3(DEXL, [0.5, 1.2, 6.0], kk), T); }],
  [E.and1 - 0.08, (k, T) => fp(L3([0.0, 1.95, 0.25], [-0.1, 2.0, 0.1], k), [-0.72, 2.52, -0.95], T, 0, 0.5)],
  [E.rew, (k, T) => fp([-1.0, 0.8, -1.65], L3([0.6, 1.0, 2.6], [0.7, 1.1, 2.4], k), T, 0, 0.6)],
  [E.storm - 0.15, (k, T) => fp([-1.0, 0.8, -1.65], L3([0.7, 1.1, 2.4], [0.6, 1.0, 2.6], k), T, 0, 0.6)],
  [E.power - 0.1, (k, T) => fp([-1.0, 0.8, -1.65], [0.6, 1.0, 2.6], T, 0, 0.6)],
  [E.gen - 0.1, (k, T) => fp(L3([-0.95, 0.85, -1.55], [-0.5, 1.15, -0.9], ease(k)), L3([0.6, 1.0, 2.6], [0.7, 1.2, 2.6], k), T, 0, 0.8)],
  [E.key, (k, T) => fp(L3([0.55, 1.55, 1.3], [0.62, 1.5, 1.45], ease(k)), [0.86, 1.13, 2.15], T, 0, 0.4)],
  [E.like - 0.15, (k, T) => fp(L3([0.5, 1.62, 1.6], [0.45, 1.62, 3.6], ease(prog(T, E.like - 0.15, E.clock4))), L3([0.5, 1.4, 6], [-2, 1.5, 4.6], ease(prog(T, E.clock4, E.guard))), T, T < E.clock4 ? 0.8 : 0.2)],
  [E.guard, (k, T) => fp([0.45, 1.62, 3.6], L3([-2, 1.5, 4.6], [-5.4, 1.65, 4.5], ease(prog(T, E.guard, E.guard + 0.5))), T)],
  [E.reyes, (k, T) => { camera.fov = lerp(58, 26, ease(prog(T, E.reyes, E.reyes + 0.8))); camera.updateProjectionMatrix(); fp([0.45, 1.62, 3.6], [-5.4, 1.62, 4.5], T, 0, 0.5); }],
  [E.counts - 0.05, (k, T) => { const kk = ease(prog(T, E.counts + 0.4, E.counts + 0.9)); fp(L3([0.45, 1.62, 3.6], [0.6, 1.5, 1.9], kk), L3([-5.4, 1.62, 4.5], [-4, 1.4, 4.0], kk), T); }],
  [E.then, (k, T) => fp(L3([0.6, 1.6, 1.9], DEXP0, ease(k)), L3([-4, 1.4, 4.0], DEXL, ease(prog(T, E.then + 0.3, E.dex2 - 0.1))), T)],
  [E.dex2, (k, T) => dexShot(k, T)],
  [E.optA, (k, T) => fp([lerp(0.5, 3.6, k), 1.62, 3.9], [lerp(5, 9, k), 1.4, 4.4], T, 1)],
  [E.optB - 0.1, (k, T) => fp(L3([1.8, 1.62, 4.0], [2.2, 1.62, 4.2], ease(k)), [0.45, 1.65, 2.0], T)],
  [E.comment - 0.1, (k, T) => dexShot(k * 0.4, T)],
  [E.loop, (k, T) => dexShot(0, T)] ];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = false; const ci = CLI(T); const loop = T >= E.loop;
  const dexView = ci === 0 || (ci === 1 && T < E.youre - 0.12) || ci === 8 || (ci === 9 && T > E.comment - 0.1) || loop || (ci === 7 && T > E.then + 1.2);
  if (dexView) { hr.visible = true; R.key.visible = true; hr.position.set(0.24, -0.33 + S(T * 1.7) * 0.004, -0.5); hr.rotation.set(0.5, 0.35, -0.3); return; }
  if (ci === 3 && false) { hr.visible = hl.visible = true; R.key.visible = true; const ins = ease(prog(T, E.key + 0.1, E.tb)); hr.position.set(0.05, lerp(-0.3, -0.14, ins), lerp(-0.3, -0.42, ins)); hr.rotation.set(-0.15, 0.1, -ease(prog(T, E.turns, E.turns + 0.35)) * 1.4); hl.position.set(-0.17, -0.06, -0.45); hl.rotation.set(0.1, -0.1, 0.4); return; }
  if (ci === 4 && T < E.clock4) { hr.visible = true; hr.position.set(0.18, -0.27 + Math.abs(S(T * 9)) * 0.02, -0.4); hr.rotation.set(0.3, 0.2, -0.1); return; }
  if (ci === 9 && T < E.optB - 0.1) { hr.visible = hl.visible = true; const s = S(T * 9); hr.position.set(0.2, -0.28 + s * 0.05, -0.4 - s * 0.05); hr.rotation.set(0.4 + s * 0.3, 0.2, -0.2); hl.position.set(-0.2, -0.28 - s * 0.05, -0.4 + s * 0.05); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); } }
function anim(T) { const loop = T >= E.loop; const ci = CLI(T); const dark = !(T >= E.rew && T < E.power) || loop; const fl = flashAt(T);
  R.lights.forEach(([m, l]) => { m.material.color.set(dark ? '#1c2026' : '#f0f6ff'); l.intensity = dark ? 0 : 7; }); R.cellL.intensity = dark ? 0 : 3; R.fill.intensity = dark ? 2.5 : 0.3; R.hemi.intensity = dark ? 0.9 : 0.4; R.corr.intensity = dark ? 5 : 0; R.face.intensity = dark ? 9 : 2;
  R.beacons.forEach(([m, l, s_], i) => { const p = dark ? Math.max(0, S(T * 5.5 + i * 2)) : 0; l.intensity = p * 7; s_.material.opacity = p * 0.9; m.material.color.set(p > 0.2 ? '#ff3a2a' : '#3a0606'); });
  R.flash.intensity = fl * 7; R.win.material.color.set(fl > 0.2 ? '#e8f0ff' : '#1a2438');
  // door
  const open = T < E.rew || (T > E.turns + 0.35 && T < E.optB - 0.1) || T > E.comment - 0.1; R.door.rotation.y = open ? (T > E.turns && T < E.turns + 1.6 ? -1.25 * ease(prog(T, E.turns + 0.35, E.turns + 1.3)) : -1.25) : 0;
  // Dex
  const d = R.dex, u = d.userData; pose(d); R.blanket.visible = false; R.dexEyes.forEach(e => e.material.opacity = 0);
  if (ci >= 2 && ci <= 6) { d.position.set(-1.05, 1.97, 0.05); d.rotation.set(-PI / 2, 0, 0); R.blanket.visible = true; }
  else if (ci === 9 && T < E.optB - 0.1 && !loop) { d.position.set(lerp(2.8, 6.4, prog(T, E.optA, E.optB)), 0, 4.6); d.rotation.set(0, PI / 2, 0); run(d, T * 9 + 1); }
  else if (ci === 9 && T < E.comment - 0.1 && !loop) { d.position.set(0.45, 0, 1.75); d.rotation.set(0, 0, 0); u.armL.rotation.set(-2.2, 0, 0.25); u.armR.rotation.set(-2.2, 0, -0.25); u.armL.userData.e.rotation.x = -0.4; u.armR.userData.e.rotation.x = -0.4; u.head.rotation.x = 0.05; }
  else { d.position.set(-0.9, 0.92, -1.0); d.rotation.set(0, PI / 2, 0); sit(d); u.up.rotation.x = 0.32; u.head.rotation.x = -0.28; u.head.rotation.y = -0.15; u.armL.rotation.set(-0.5, 0, 0.1); u.armL.userData.e.rotation.x = -0.9;
    const reach = ci === 0 || ci === 8 ? ease(prog(T, (ci ? E.take2 : E.take) - 0.1, (ci ? E.take2 : E.take) + 0.5)) : ci === 1 ? 1 : 0.4; u.armR.rotation.set(-0.5 - reach * 0.8, 0, -0.1); u.armR.userData.e.rotation.x = -0.6 + reach * 0.4;
    R.dexEyes.forEach(e => e.material.opacity = 0.75); }
  u.mouth.scale.y = 1 + 4 * Math.max(talking(0, T), talking(8, T));
  // Reyes
  const r = R.reyes, ru = r.userData; pose(r); r.position.set(-5.6, 0, 4.55); r.rotation.set(0, PI / 2, 0); ru.armR.rotation.set(-1.35, 0, 0); ru.mouth.scale.y = 1 + 4 * talking(5, T); ru.armL.rotation.x = talking(5, T) > 0 ? -0.6 : 0;
  const guardOn = ci >= 5 && ci <= 7; r.visible = guardOn || (ci === 4 && T > E.clock4);
  let ty, tz, tx; if (T > E.counts + 0.3 && T < E.then) { const k = ease(prog(T, E.counts + 0.3, E.counts + 0.8)); tx = lerp(-1, 0.4, k); ty = lerp(0.4, 1.4, k); tz = lerp(3.4, 3.7, k); } else { tx = -1.8 + S(T * 0.9) * 1.2; ty = 0.1; tz = 4.3 + S(T * 1.3) * 1.3; }
  R.spot.position.set(-5.25, 1.3, 4.55); R.spot.target.position.set(tx, ty, tz); R.spot.intensity = r.visible ? 40 : 0; R.beam.visible = r.visible;
  { const a = new T3.Vector3(-5.25, 1.3, 4.55), b = new T3.Vector3(tx, ty, tz), dir = b.clone().sub(a).normalize(); R.beam.position.copy(a.clone().add(dir.clone().multiplyScalar(3))); R.beam.quaternion.setFromUnitVectors(new T3.Vector3(0, -1, 0), dir); }
  const kv = ci === 3; R.wkey.visible = R.warm.visible = kv; R.lockL.intensity = kv ? 4 : 0; if (kv) { const ins = ease(prog(T, E.key + 0.1, E.tb + 0.2)); R.wkey.position.z = lerp(1.95, 2.13, ins); R.warm.position.z = lerp(1.47, 1.65, ins); R.wkey.rotation.z = -ease(prog(T, E.turns, E.turns + 0.35)) * 1.5; }
  R.reyesL.intensity = r.visible ? 5 : 0;
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function genLeft(T) { if (T < E.rew) return 90 - (E.dex2 + T - E.power); if (T >= E.loop) return 90 - (E.dex2 - E.power); if (T < E.power) return null; return 90 - (T - E.power); }
function hud(T) { octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#e8641e'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . PART 1', 149, 69, 26, '#ff9a5a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt(T >= E.rew && T < E.power ? '2.12 AM' : '2.13 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  const g = genLeft(T); if (g !== null) { const left = Math.max(0, Math.ceil(g)); octx.save(); octx.fillStyle = 'rgba(30,4,4,0.85)'; octx.beginPath(); octx.roundRect(470, 116, 226, 120, 22); octx.fill(); octx.strokeStyle = '#ff3a2a'; octx.lineWidth = 3; octx.stroke(); txt('POWER BACK IN', 583, 146, 18, '#ff8a7a'); txt(left + 's', 583, 196, 60, '#ff3a2a'); octx.restore(); }
  if (T > CL[1].start && T < E.optA && T < E.loop) { octx.save(); octx.fillStyle = 'rgba(6,6,10,0.7)'; octx.beginPath(); octx.roundRect(24, 116, 250, 46, 23); octx.fill(); txt('YOU DECIDE . A OR B', 149, 140, 20, '#ffd27a'); octx.restore(); } }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ff9a5a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['thirty', 'seconds'], '30 seconds'], [['ninety', 'seconds'], '90 seconds'], [['six', 'months'], '6 months'], [['sixty'], '60']];
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
  scene = new T3.Scene(); scene.background = new T3.Color('#05060a'); scene.fog = new T3.Fog('#05060e', 8, 22); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 100); scene.add(camera); build();
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
  { const gk = ci === 6 ? prog(T, E.counts + 0.5, E.counts + 0.8) * (1 - prog(T, E.over + 0.6, E.then)) : 0; if (gk > 0) { const gg = octx.createRadialGradient(150, 640, 0, 150, 640, 700); gg.addColorStop(0, `rgba(255,248,220,${0.85 * gk})`); gg.addColorStop(1, 'rgba(255,248,220,0)'); octx.fillStyle = gg; octx.fillRect(0, 0, W, H); } }
  rewindFx(T); hud(T);
  const dexLine = (t_, o_) => { big('"TAKE ME WITH YOU"', 330, 52, '#fff', t_ === 0 ? 1 : prog(T, t_ - 0.1, t_ + 0.1)); if (T > o_ - 0.1) big('"OR I SCREAM"', 410, 70, '#ff3a2a', prog(T, o_ - 0.1, o_ + 0.1)); };
  if (ci === 0 && !loop) dexLine(0, E.or0);
  if (loop) big('"TAKE ME WITH YOU"', 330, 52, '#fff', 1);
  if (ci === 8) dexLine(E.take2, E.or2);
  if (ci === 1) { nameTag('DEX', 'CELLMATE . 4471', '#ffad6a', prog(T, E.dex1 - 0.15, E.dex1 + 0.1) * (1 - prog(T, E.youre - 0.2, E.youre))); if (T > E.youre - 0.1 && T < E.and1 - 0.1) big('MAXIMUM SECURITY', 330, 56, '#ff9a5a', prog(T, E.youre - 0.1, E.youre + 0.15)); if (T > E.and1 - 0.1) big('HE JUST FOUND OUT', 330, 60, '#ff3a2a', prog(T, E.and1 - 0.1, E.and1 + 0.1)); }
  if (ci === 2) { if (T < E.storm - 0.15) big('◀◀ 30 SECONDS EARLIER', 330, 44, '#fff', 1); else if (T > E.power - 0.05 && T < E.gen - 0.1) big('POWER OUT', 330, 80, '#fff', prog(T, E.power - 0.05, E.power + 0.1)); else if (T > E.gen - 0.1) big('BACKUP . 90 SEC', 330, 56, '#ff3a2a', prog(T, E.gen - 0.1, E.gen + 0.1)); }
  if (ci === 3) { if (T > E.tb - 0.1 && T < E.six - 0.1) big('TOOTHBRUSH KEY', 330, 60, '#fff', prog(T, E.tb - 0.1, E.tb + 0.1)); if (T > E.six - 0.1) big('6 MONTHS OF CARVING', 330, 48, '#ffd27a', prog(T, E.six - 0.1, E.six + 0.1)); }
  if (ci === 5) { nameTag('OFFICER REYES', 'C BLOCK GUARD', '#8ac8ff', prog(T, E.guard + 0.2, E.guard + 0.4)); if (T > E.head - 0.1) big('HEAD COUNT IN 60', 330, 56, '#8ac8ff', prog(T, E.head - 0.1, E.head + 0.1)); }
  if (ci === 6 && T > E.over - 0.1) big("IT'S OVER", 330, 84, '#ff3a2a', prog(T, E.over - 0.1, E.over + 0.1));
  if (ci === 9 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. TAKE DEX' : 'B. LEAVE DEX', 330, 66, A ? '#ff9a5a' : '#7ad0ff', 1); big(A ? 'RISK . TOO SLOW' : 'RISK . HE SCREAMS', 405, 40, '#fff', 1); } else { big('COMMENT A OR B', 330, 66, '#fff', prog(T, E.comment - 0.1, E.comment + 0.15)); big('FOLLOW FOR PART 2', 405, 40, '#ff9a5a', prog(T, E.follow - 0.1, E.follow + 0.15)); } }
  likePill(T, E.like, E.guard - 0.2, E.follow4);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
