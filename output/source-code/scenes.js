// Prison escape. Part 1. First person, PS3-style low-poly (flat shaded, moderate poly counts, antialiased).
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
let renderer, scene, camera, out, octx, small, sctx, glc, GRAIN, GLOW, SNAP;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.65, metalness: 0, flatShading: false }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new T3.CylinderGeometry(a, b, h, Math.max(n, 18)), Sp = (r, a = 10, b = 8) => new T3.SphereGeometry(r, Math.max(a, 24), Math.max(b, 18));
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g }; return t; }
function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function look(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// first-person camera: position + look target, with breathing and walk bob
function fp(p, l, T, bob = 0, sway = 1) { const br = S(T * 1.7) * 0.006 * sway, sw = S(T * 0.9) * 0.01 * sway; const b = bob ? Math.abs(S(T * 9)) * 0.045 * bob : 0, bx = bob ? S(T * 4.5) * 0.03 * bob : 0;
  look([p[0] + bx, p[1] + br + b, p[2]], [l[0] + sw, l[1] + br * 3 + b * 0.5, l[2]]); }

// ---------- timing ----------
const E = { again: AT(0, 'again'), title: CL[1].start, spoil: AT(1, 'and'), wakes: CL[2].start, stranger: AT(2, 'in'), sean: AT(2, 'a', 2), coffee: CL[3].start, woman: AT(3, 'same', 1), then: AT(3, 'then'), boom: AT(3, 'explodes'),
  pod: CL[4].start, strapped: AT(4, 'strapped'), voice: CL[5].start, relive: AT(5, 'source'), over: AT(5, 'over'), mission: CL[6].start, find: AT(6, 'find'), dirty: AT(6, 'because'), like: CL[7].start, follow7: AT(7, 'follow'), strange: AT(7, 'this'),
  learn: CL[8].start, vent: AT(8, 'the'), wrong: AT(8, 'he', 1), dies: AT(8, 'and'), notime: CL[9].start, pastc: AT(9, 'the'), asks: AT(9, 'so'), truth: CL[10].start, died: AT(10, 'colter'), machines: AT(10, "what's"), head: AT(10, 'the', 1),
  wallet: CL[11].start, finds: AT(11, 'next'), frost: AT(11, 'derek'), gotoff: AT(11, 'the'), stopped: CL[12].start, real: AT(12, 'the'), complete: AT(12, 'mission'), wipe: CL[13].start, last: CL[14].start, switchOff: AT(14, 'and'),
  final: CL[15].start, dad: AT(15, 'he', 1), kiss: AT(15, 'he', 2), freeze: CL[16].start, gw: AT(16, 'goodwin'), froze: AT(16, 'everything'), goes: CL[17].start, keeps: AT(17, 'it'), newworld: CL[18].start, everyl: AT(18, 'every'), alive: AT(18, 'and'), seanlife: AT(18, 'living'),
  msg: CL[19].start, never: AT(19, 'but'), yet: AT(19, 'yet'), end: CL[20].start, deal: AT(20, 'a'), cmt: AT(20, 'comment') };
E.loop = TM.total - 0.4;
const BOOMS = [E.again + 0.25, E.boom + 0.1, AT(5, 'over') + 0.05, AT(5, 'over', 1) + 0.05, E.dies + 0.05];
const FL = [];
function flashAt(T) { return 0; }
const FROZEN = (T) => (T > E.froze && T < E.keeps) ? E.froze : T;
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
const R = {}; const BM = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
function landT() { return ctex(512, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ab8e0'); g.addColorStop(0.6, '#d8e4ec'); g.addColorStop(0.61, '#6a8a4a'); g.addColorStop(1, '#4a6a3a'); c.fillStyle = g; c.fillRect(0, 0, w, h); const r = rng(3);
  for (let x = 0; x < w; x += 6 + r() * 20) { const bh = 10 + r() * 40; c.fillStyle = ['#7a8aa0', '#8a96a8', '#6a7a90'][Math.floor(r() * 3)]; c.fillRect(x, 78 - bh, 8 + r() * 14, bh); } for (let x = 0; x < w; x += 18 + r() * 30) { c.fillStyle = '#3a5a2a'; c.beginPath(); c.arc(x, 80, 6 + r() * 8, 0, 7); c.fill(); } for (let x = 0; x < w; x += 64) { c.fillStyle = '#2a2a2a'; c.fillRect(x, 20, 3, 70); } }); }
function build() { const g = new T3.Group(); scene.add(g);
  // ---- train carriage (z -8..8) ----
  const tr = R.train = new T3.Group(); g.add(tr); const wallM = SM('#c8ccd0', { roughness: 0.6 }), seatM = SM('#2a4a8a', { roughness: 0.9 }), metal = SM('#8a9098', { metalness: 0.6, roughness: 0.4 });
  add(tr, Bx(3.2, 0.1, 16), SM('#4a4e58', { roughness: 0.8 }), 0, -0.05, 0); add(tr, Bx(3.2, 0.1, 16), SM('#e8ece8'), 0, 2.45, 0); add(tr, Bx(0.6, 0.04, 15), BM('#f4f8ff'), 0, 2.39, 0);
  R.landT = landT(); R.landT.wrapS = T3.RepeatWrapping; R.landT.repeat.set(3, 1);
  for (const sx of [-1, 1]) { add(tr, Bx(0.1, 0.9, 16), wallM, sx * 1.6, 0.45, 0); add(tr, Bx(0.1, 0.65, 16), wallM, sx * 1.6, 2.13, 0); const win = add(tr, new T3.PlaneGeometry(16, 0.9), new T3.MeshBasicMaterial({ map: R.landT, toneMapped: false }), sx * 1.64, 1.35, 0); win.rotation.y = -sx * PI / 2; for (let z = -7; z <= 7; z += 1.8) add(tr, Bx(0.12, 0.92, 0.12), wallM, sx * 1.58, 1.35, z); add(tr, Bx(0.4, 0.04, 16), metal, sx * 1.35, 2.05, 0); }
  R.pass = []; const pr = rng(9); const tops = ['#5a3a2a', '#3a6a5a', '#8a3a4a', '#4a4a6a', '#c8a03a', '#2a2a2a', '#6a8ab8', '#a85a3a'];
  for (let z = -6.3; z <= 6.3; z += 1.8) for (const sx of [-1, 1]) { const face = Math.round((z + 6.3) / 1.8) % 2 ? -1 : 1; add(tr, Bx(1.1, 0.45, 0.5), seatM, sx * 0.95, 0.22, z); add(tr, Bx(1.1, 0.75, 0.12), seatM, sx * 0.95, 0.75, z - face * 0.25); if (face < 0) add(tr, Bx(0.8, 0.05, 0.6), SM('#d8d0c0'), sx * 1.05, 0.72, z + 0.9);
    if (pr() > 0.35 && !(sx === -1 && Math.abs(z - 0.3) < 0.1) && !(sx === -1 && Math.abs(z - 2.1) < 0.1)) { const p = person({ skin: ['#e0b090', '#a87050', '#d8a078', '#f0c8a8'][Math.floor(pr() * 4)], top: tops[Math.floor(pr() * tops.length)], bot: '#2a2a32', hair: ['#1a1010', '#5a3a1a', '#c8a060', '#2a1a10'][Math.floor(pr() * 4)] }); sit(p); p.position.set(sx * (0.95 + (pr() - 0.5) * 0.3), -0.42, z + face * 0.02); p.rotation.y = face > 0 ? PI : 0; tr.add(p); R.pass.push(p); } }
  // Colter + Christina + the coffee passer
  R.colt = person({ skin: '#e0b090', top: '#3a4a6a', bot: '#2a2a32', hair: '#3a2a1a' }); sit(R.colt); R.colt.position.set(-0.95, -0.42, 0.3); R.colt.rotation.y = 0; tr.add(R.colt);
  R.chris = person({ skin: '#e8c0a0', top: '#8a3a4a', bot: '#2a2a32', hair: '#2a1a10', }); sit(R.chris); R.chris.position.set(-0.95, -0.42, 2.1); R.chris.rotation.y = PI; tr.add(R.chris); add(R.chris.userData.head, Cy(0.13, 0.11, 0.25, 10), SM('#2a1a10'), 0, -0.05, -0.06);
  R.cup = new T3.Group(); tr.add(R.cup); add(R.cup, Cy(0.05, 0.04, 0.13, 10), SM('#f4f0e8'), 0, 0, 0); add(R.cup, Cy(0.052, 0.052, 0.03, 10), SM('#6a4a2a'), 0, 0.05, 0); R.spill = add(tr, new T3.CircleGeometry(0.16, 16), SM('#5a3a1a', { roughness: 0.2 }), -0.82, 0.005, 0.95); R.spill.rotation.x = -PI / 2;
  // WC door + vent with the bomb at the far end
  add(tr, Bx(3.2, 2.5, 0.1), wallM, 0, 1.25, -8); add(tr, Bx(0.9, 2.0, 0.06), SM('#9aa0a8'), 0, 1.0, -7.93); { const t = ctex(128, 64, (c) => { c.fillStyle = '#2a4a8a'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#fff'; c.font = '40px Russo'; c.textAlign = 'center'; c.fillText('WC', 64, 46); }); add(tr, new T3.PlaneGeometry(0.4, 0.2), new T3.MeshBasicMaterial({ map: t }), 0, 1.7, -7.89); }
  R.vent = new T3.Group(); R.vent.position.set(0, 2.3, -7.9); tr.add(R.vent); const vp = add(R.vent, Bx(0.8, 0.25, 0.04), SM('#7a8088', { metalness: 0.5 }), 0, -0.12, 0.04); for (let k = 0; k < 5; k++) add(R.vent, Bx(0.7, 0.02, 0.05), SM('#4a4e54'), 0, -0.04 - k * 0.04, 0.07); R.ventPanel = vp;
  R.bomb = new T3.Group(); R.bomb.position.set(0, 2.18, -7.86); tr.add(R.bomb); add(R.bomb, Bx(0.4, 0.14, 0.12), SM('#3a3a2a'), 0, 0, 0); for (const [dx, col] of [[-0.12, '#d83a2a'], [-0.06, '#3a8ad8'], [0, '#e8c83a']]) add(R.bomb, Cy(0.008, 0.008, 0.2, 5), SM(col), dx, 0.06, 0.06).rotation.z = 1.2; R.led = add(R.bomb, Sp(0.02, 8, 6), BM('#ff2a1a'), 0.14, 0.03, 0.07); R.ledG = glow(R.bomb, '#ff2a1a', 0.2, 0.14, 0.03, 0.09, 0.8);
  R.trL = []; for (const z of [-5, 0, 5]) { const l = new T3.PointLight('#f0f4ff', 5, 7, 1.5); l.position.set(0, 2.2, z); tr.add(l); R.trL.push(l); } tr.add(new T3.HemisphereLight('#d8e4f4', '#4a4a50', 0.9)); const sunT = new T3.DirectionalLight('#fff0d8', 1.0); sunT.position.set(4, 3, 1); tr.add(sunT);
  R.fire = []; for (let i = 0; i < 18; i++) { const f = glow(tr, i % 3 ? '#ff8a2a' : '#ffd86a', 1, 0, 1.4, -7, 0); f.userData = { a: i * 2.39, r: 0.3 + (i % 5) * 0.25 }; R.fire.push(f); } R.fireL = new T3.PointLight('#ff8a3a', 0, 20, 1.2); R.fireL.position.set(0, 1.4, -6); tr.add(R.fireL);
  R.wallet = new T3.Group(); R.wallet.position.set(0.95, 0.47, -2.6); tr.add(R.wallet); add(R.wallet, Bx(0.18, 0.03, 0.12), SM('#3a2414'), 0, 0, 0); add(R.wallet, Bx(0.1, 0.005, 0.07), SM('#e8e0c8'), 0.02, 0.018, 0);
  R.pass.forEach(p => { if (Math.hypot(p.position.x - 0.95, p.position.z + 2.6) < 1.0) p.visible = false; });
  R.phone = add(R.colt.userData.armR.userData.e, Bx(0.06, 0.12, 0.015), SM('#111'), 0, -0.36, 0.05);
  // ---- lab: what is left of Colter (x=140) ----
  const lb = R.lab = new T3.Group(); lb.position.set(140, 0, 0); g.add(lb); add(lb, Bx(8, 0.1, 8), SM('#2a2e34'), 0, -0.05, 0); add(lb, Bx(8, 3.2, 0.2), SM('#3a4048'), 0, 1.6, -3); add(lb, Bx(0.2, 3.2, 8), SM('#3a4048'), -3, 1.6, 0); add(lb, Bx(0.2, 3.2, 8), SM('#3a4048'), 3, 1.6, 0);
  add(lb, Cy(0.9, 0.9, 2.2, 24), new T3.MeshStandardMaterial({ color: '#9ad0e8', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.3, depthWrite: false }), 0, 1.2, -1.2); add(lb, Cy(0.95, 0.95, 0.15, 24), SM('#5a6068', { metalness: 0.7 }), 0, 0.08, -1.2); add(lb, Cy(0.95, 0.95, 0.15, 24), SM('#5a6068', { metalness: 0.7 }), 0, 2.35, -1.2);
  add(lb, new T3.CapsuleGeometry(0.25, 0.6, 8, 16), SM('#c8b0a0', { roughness: 0.9 }), 0, 1.1, -1.2); add(lb, Sp(0.15), SM('#e0b090'), 0, 1.65, -1.2); for (let k = 0; k < 8; k++) { const a = k / 8 * PI * 2; const cb = add(lb, Cy(0.015, 0.015, 1.4, 6), SM('#1a1a1a'), Math.cos(a) * 0.4, 1.9, -1.2 + Math.sin(a) * 0.4); cb.rotation.z = Math.cos(a) * 0.4; }
  R.monT = ctex(256, 160, () => {}); for (const [x, ry] of [[-1.6, 0.6], [1.6, -0.6]]) { const mn = add(lb, new T3.PlaneGeometry(1.0, 0.62), new T3.MeshBasicMaterial({ map: R.monT, toneMapped: false }), x, 1.7, -1.6); mn.rotation.y = ry; add(lb, Bx(1.1, 0.72, 0.06), SM('#1a1a1a'), x, 1.7, -1.64).rotation.y = ry; }
  lb.add(new T3.HemisphereLight('#6a8ac8', '#0a0a10', 0.9)); const tl = new T3.PointLight('#9ad8ff', 6, 6, 1.4); tl.position.set(0, 2.8, -0.4); lb.add(tl); R.labRed = new T3.PointLight('#ff3a2a', 2, 6, 1.4); R.labRed.position.set(2, 2.6, 1); lb.add(R.labRed);
  // ---- exterior: train racing toward Chicago (x=-60) ----
  const ex = R.ext = new T3.Group(); ex.position.set(-60, 0, 0); g.add(ex); { const st = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7ab8'); gr.addColorStop(0.7, '#c8d8e8'); gr.addColorStop(1, '#e8e0d0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); add(ex, Sp(120, 24, 16), new T3.MeshBasicMaterial({ map: st, side: T3.BackSide, fog: false })); }
  add(ex, Bx(400, 0.1, 400), SM('#5a7a4a'), 0, -0.05, 0); add(ex, Bx(3, 0.12, 400), SM('#6a6258'), 0, 0.01, 0); for (const sx of [-0.7, 0.7]) add(ex, Bx(0.1, 0.1, 400), metal, sx, 0.12, 0); for (let z = -200; z < 200; z += 0.8) add(ex, Bx(2.2, 0.05, 0.25), SM('#4a3a2a'), 0, 0.06, z, false);
  for (let k = 0; k < 26; k++) { const x = -50 + k * 4 + (k % 3) * 1.5, h = 8 + ((k * 7) % 9) * 4; add(ex, Bx(3, h, 3), SM(['#6a7a90', '#8a96a8', '#5a6a80'][k % 3]), x, h / 2, 120); } add(ex, Bx(2, 70, 2), SM('#3a3a44'), 6, 35, 122); add(ex, Cy(0.2, 0.2, 12, 6), SM('#3a3a44'), 6, 76, 122);
  R.ctrain = new T3.Group(); ex.add(R.ctrain); for (let k = 0; k < 3; k++) { const car = new T3.Group(); car.position.z = k * 17; R.ctrain.add(car); add(car, Bx(3, 3, 16), SM('#c8ccd4', { metalness: 0.5, roughness: 0.35 }), 0, 1.9, 0); add(car, Bx(3.02, 0.25, 16), SM('#2a4a8a'), 0, 1.0, 0); for (const sx of [-1, 1]) for (let z = -7; z < 7; z += 1.6) add(car, Bx(0.02, 0.8, 1.2), BM('#f4e8c8'), sx * 1.51, 2.2, z); }
  add(ex, Bx(4, 1.0, 40), SM('#8a8a88'), 4, 0.5, 10); add(ex, Bx(4, 0.05, 40), SM('#e8d84a'), 2.2, 1.02, 10); for (let z = -8; z < 30; z += 6) { add(ex, Cy(0.08, 0.08, 3, 8), SM('#3a3a44'), 5.5, 2.5, z); } { const t = ctex(256, 64, (c) => { c.fillStyle = '#1a3a6a'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#fff'; c.font = '34px Russo'; c.textAlign = 'center'; c.fillText('BLUE ISLAND', 128, 44); }); add(ex, new T3.PlaneGeometry(2.4, 0.6), new T3.MeshBasicMaterial({ map: t }), 5.5, 3.6, 4).rotation.y = -PI / 2; }
  R.frost = person({ skin: '#e0b090', top: '#4a4a3a', bot: '#2a2a32', hair: '#c8a060', cap: '#2a2a2a' }); R.frost.position.set(4, 1.0, 6); R.frost.rotation.y = 0; ex.add(R.frost); add(R.frost.userData.up, Bx(0.3, 0.4, 0.18), SM('#3a3a2a'), 0, 0.3, -0.18);
  R.van = new T3.Group(); R.van.position.set(30, 0, 70); ex.add(R.van); add(R.van, Bx(2.2, 2.2, 5), SM('#f0f0ee'), 0, 1.4, 0); add(R.van, Bx(2.0, 0.9, 0.05), SM('#3a4a5a'), 0, 2.0, 2.52); for (const [wx, wz] of [[-1.05, 1.6], [1.05, 1.6], [-1.05, -1.6], [1.05, -1.6]]) add(R.van, Cy(0.4, 0.4, 0.3, 16), SM('#1a1a1a'), wx, 0.4, wz).rotation.z = PI / 2;
  R.cops = []; for (let k = 0; k < 3; k++) { const cc = new T3.Group(); cc.position.set(24 + k * 3.5, 0, 64 + k * 4); cc.rotation.y = 0.6; ex.add(cc); add(cc, Bx(1.9, 1.2, 4.4), SM('#1a1a2a'), 0, 0.8, 0); add(cc, Bx(1.92, 0.4, 2), SM('#f4f4f4'), 0, 0.8, 0); const rL = glow(cc, '#ff2a2a', 1.6, -0.4, 1.6, 0, 0.9), bL = glow(cc, '#2a6aff', 1.6, 0.4, 1.6, 0, 0.9); R.cops.push([rL, bL]); }
  R.efire = []; for (let i = 0; i < 24; i++) { const f = glow(ex, i % 3 ? '#ff7a2a' : '#ffe08a', 4, 0, 2, 0, 0); f.userData = { a: i * 2.39, r: 1 + (i % 6) }; R.efire.push(f); }
  ex.add(new T3.HemisphereLight('#c8dcff', '#5a6a4a', 1.2)); const sunE = new T3.DirectionalLight('#fff0d8', 2); sunE.position.set(20, 30, 10); ex.add(sunE);
  // ---- the capsule (x=60) ----
  const cp = R.cap = new T3.Group(); cp.position.set(60, 0, 0); g.add(cp); add(cp, new T3.CylinderGeometry(1.6, 1.6, 3.2, 14, 1, true), SM('#3a4048', { metalness: 0.6, roughness: 0.5, side: T3.BackSide }), 0, 1.6, 0); add(cp, new T3.CircleGeometry(1.6, 14), SM('#2a2e34'), 0, 0.01, 0).rotation.x = -PI / 2; add(cp, new T3.CircleGeometry(1.6, 14), SM('#2a2e34'), 0, 3.19, 0).rotation.x = PI / 2;
  for (let k = 0; k < 7; k++) add(cp, new T3.TorusGeometry(1.58, 0.03, 4, 14), SM('#5a6068', { metalness: 0.8 }), 0, 0.3 + k * 0.45, 0).rotation.x = PI / 2;
  add(cp, Bx(0.8, 0.5, 0.7), SM('#1a1a1e'), 0, 0.25, 0.3); add(cp, Bx(0.8, 1.2, 0.15), SM('#1a1a1e'), 0, 0.9, 0.7);
  R.pilot = person({ skin: '#e0b090', top: '#4a5a3a', bot: '#3a4a2a', hair: '#3a2a1a' }); sit(R.pilot); R.pilot.position.set(0, -0.42, 0.45); R.pilot.rotation.y = PI; cp.add(R.pilot); for (const dx of [-0.1, 0.1]) add(R.pilot.userData.up, Bx(0.05, 0.6, 0.02), SM('#1a1a1a'), dx, 0.3, -0.13);
  R.scrT = ctex(320, 200, () => {}); R.scr = add(cp, new T3.PlaneGeometry(1.3, 0.81), new T3.MeshBasicMaterial({ map: R.scrT, toneMapped: false }), 0, 1.75, -1.45); R.scrL = new T3.PointLight('#8ac8ff', 3, 4, 1.5); R.scrL.position.set(0, 1.7, -1.0); cp.add(R.scrL);
  R.capRed = new T3.PointLight('#ff2a1a', 0, 5, 1.5); R.capRed.position.set(0, 2.8, 0); cp.add(R.capRed); cp.add(new T3.HemisphereLight('#6a8ac8', '#1a1a24', 1.4)); const capKey = new T3.PointLight('#bfe0ff', 4, 5, 1.4); capKey.position.set(0.8, 2.6, -0.6); cp.add(capKey); for (const a of [0.8, -0.8, 2.4]) { const l = add(cp, Bx(0.05, 0.6, 0.05), BM('#8ac8ff'), Math.sin(a) * 1.5, 2.6, Math.cos(a) * 1.5); }
}
function drawMon(T, dead) { const c = R.monT.userData.g; c.fillStyle = '#04100a'; c.fillRect(0, 0, 256, 160); c.strokeStyle = dead ? '#ff3a2a' : '#3aff8a'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x < 256; x++) { const ph = (x / 256 * 4 + T * 1.2) % 1; const y = dead ? 80 : 80 - (ph > 0.45 && ph < 0.5 ? 50 : ph > 0.5 && ph < 0.55 ? -30 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = dead ? '#ff3a2a' : '#3aff8a'; c.font = '20px Russo'; c.fillText(dead ? 'FLATLINE' : 'VITALS . MINIMAL', 10, 150); R.monT.needsUpdate = true; }
function drawScreen(T, mode) { const c = R.scrT.userData.g, w = 320, h = 200; c.fillStyle = '#06121c'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(120,200,255,0.06)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 2);
  if (mode === 'face' || mode === 'cold') { c.fillStyle = mode === 'cold' ? '#3a5a7a' : '#4a6a8a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8c0a0'; c.beginPath(); c.ellipse(160, 95, 42, 52, 0, 0, 7); c.fill(); c.fillStyle = '#5a3a1a'; c.beginPath(); c.ellipse(160, 62, 46, 32, 0, PI, 0); c.fill(); c.fillRect(114, 62, 14, 60); c.fillRect(192, 62, 14, 60); c.fillStyle = '#2a3a4a'; c.fillRect(110, 150, 100, 60);
    c.fillStyle = '#1a1010'; for (const x of [145, 175]) c.fillRect(x - 6, 90, 12, mode === 'cold' ? 4 : 7); c.fillStyle = '#9a4a4a'; const talk = Math.abs(Math.sin(T * 14)) * 5; c.fillRect(150, 118, 20, mode === 'cold' ? 2 : 2 + talk); c.fillStyle = '#8ac8ff'; c.font = '14px Russo'; c.fillText('CAPT. GOODWIN', 10, 190); }
  if (mode === 'mission') { c.fillStyle = '#ff5a4a'; c.font = '26px Russo'; c.textAlign = 'center'; c.fillText('FIND THE BOMBER', 160, 40); c.fillStyle = '#8ac8ff'; for (let k = 0; k < 18; k++) { const bh = 20 + ((k * 13) % 7) * 10; c.fillRect(20 + k * 16, 170 - bh, 12, bh); } c.fillRect(150, 70, 6, 100); c.fillStyle = '#fff'; c.font = '18px Russo'; c.fillText('CHICAGO', 160, 195); c.textAlign = 'left';
    if (Math.floor(T * 3) % 2) { c.strokeStyle = '#ff3a2a'; c.lineWidth = 3; c.beginPath(); c.arc(160, 120, 40, 0, 7); c.stroke(); } }
  if (mode === 'wipe') { c.fillStyle = '#1a0606'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3a2a'; c.font = '28px Russo'; c.textAlign = 'center'; c.fillText('MEMORY RESET', 160, 90); c.fillStyle = '#ffffff'; c.fillRect(40, 120, 240, 16); c.fillStyle = '#ff3a2a'; c.fillRect(42, 122, 236 * ((T * 0.4) % 1), 12); c.textAlign = 'left'; }
  if (mode === 'glitch') { drawScreen.r = rng(Math.floor(T * 20)); const r = drawScreen.r; for (let k = 0; k < 30; k++) { c.fillStyle = ['#ff3a6a', '#3affea', '#ffffff', '#06121c'][Math.floor(r() * 4)]; c.fillRect(r() * w, r() * h, r() * 120, 2 + r() * 10); } c.fillStyle = '#fff'; c.font = '22px Russo'; c.textAlign = 'center'; c.fillText('SOURCE CODE . ACTIVE', 160, 105); c.textAlign = 'left'; }
  R.scrT.needsUpdate = true; }

// ---------- shots ----------
const TR = (k, a, b, la, lb) => look(L3(a, b, ease(k)), L3(la, lb, ease(k)));
const HOOKC = (k) => TR(k, [0.2, 1.9, 7.6], [0.15, 1.85, 6.8], [0, 1.4, -8], [0, 1.45, -8]);
const COLTC = (k) => TR(k, [0.8, 2.35, 3.0], [0.7, 2.3, 2.7], [-0.95, 1.1, 0.3], [-0.95, 1.15, 0.3]);
const WIDEC = (k) => TR(k, [0.8, 2.2, 4.8], [0.7, 2.1, 4.3], [-0.95, 1.0, 0.3], [-0.95, 1.0, 0.3]);
const CHRISC = (k) => TR(k, [0.6, 1.8, -0.9], [0.55, 1.8, -0.6], [-0.95, 1.2, 2.1], [-0.95, 1.2, 2.1]);
const VENTC = (k) => TR(k, [0.4, 1.7, -4.3], [0.3, 1.8, -4.8], [0, 2.1, -7.9], [0, 2.1, -7.9]);
const PODC = (k) => TR(k, [61.05, 2.3, -1.1], [61.0, 2.25, -1.0], [60, 1.3, 0.45], [60, 1.35, 0.45]);
const SCRC = (k) => TR(k, [60.7, 2.0, 1.1], [60.6, 2.0, 0.95], [60, 1.6, -1.45], [60, 1.65, -1.45]);
const AISLE = (k) => TR(k, [1.0, 1.9, 2.4], [0.9, 1.85, 2.2], [0, 1.45, 1.0], [0, 1.45, 1.0]);
const SH = [
  [0, 'train', (k, T) => HOOKC(k)],
  [E.title, 'ext', (k, T) => look([-60 + 13, 5, lerp(-18, -14, k)], [-60, 2.2, 14])],
  [E.wakes, 'train', (k, T) => COLTC(k)],
  [E.stranger - 0.1, 'train', (k, T) => TR(k, [0.4, 1.8, 1.9], [0.3, 1.8, 1.7], [-1.6, 1.3, 0.1], [-1.6, 1.3, 0.1])],
  [E.coffee, 'train', (k, T) => TR(k, [0.5, 1.4, 2.8], [0.45, 1.35, 2.6], [-0.8, 0.3, 0.9], [-0.8, 0.3, 0.9])],
  [E.woman - 0.1, 'train', (k, T) => CHRISC(k)],
  [E.then - 0.1, 'train', (k, T) => TR(k, [0.2, 1.9, 7.4], [0.15, 1.9, 7.0], [0, 1.5, -8], [0, 1.5, -8])],
  [E.boom - 0.15, 'ext', (k, T) => look([-60 + 26 + S(T * 50) * 0.4 * (T > E.boom + 0.1 ? 1 : 0), 10, 44], [-60, 2, 12])],
  [E.pod, 'cap', (k, T) => PODC(k)],
  [E.voice, 'cap', (k, T) => SCRC(k)],
  [E.over - 0.15, 'train', (k, T) => WIDEC(k)],
  [AT(5, 'over', 1) - 0.1, 'train', (k, T) => CHRISC(k)],
  [E.mission, 'cap', (k, T) => SCRC(k)],
  [E.like - 0.1, 'ext', (k, T) => look([-60 - 12, 3.5, lerp(40, 32, k)], [-60, 2, lerp(10, 6, k)])],
  [E.learn, 'train', (k, T) => TR(k, [0.1, 2.3, 7.7], [0.1, 2.25, 7.2], [0, 0.8, -3], [0, 0.8, -3.5])],
  [E.vent - 0.1, 'train', (k, T) => VENTC(k)],
  [E.wrong - 0.1, 'train', (k, T) => TR(k, [-0.3, 1.9, -0.6], [-0.3, 1.85, -0.9], [0.95, 1.1, -2.7], [0.95, 1.1, -2.7])],
  [E.notime, 'cap', (k, T) => SCRC(k)],
  [E.asks - 0.1, 'cap', (k, T) => PODC(k)],
  [E.truth, 'lab', (k, T) => look(L3([140 + 2.4, 2.4, 3.0], [140 + 1.6, 2.1, 1.6], ease(k)), [140, 1.3, -1.2])],
  [E.head - 0.1, 'cap', (k, T) => TR(k, [61.05, 2.3, -1.1], [61.2, 2.6, -1.3], [60, 1.3, 0.45], [60, 1.3, 0.45])],
  [E.wallet, 'train', (k, T) => TR(k, [0.4, 1.4, -1.6], [0.5, 1.2, -2.0], [0.95, 0.5, -2.6], [0.95, 0.47, -2.6])],
  [E.gotoff - 0.1, 'ext', (k, T) => { const fz = lerp(6, 14, prog(T, E.gotoff, E.stopped)); look([-60 + 6.8, 2.6, fz - 3.6], [-60 + 4, 1.7, fz]); }],
  [E.stopped, 'ext', (k, T) => look([-60 + 22, 6, lerp(52, 56, k)], [-60 + 30, 1.5, 70])],
  [E.wipe, 'cap', (k, T) => SCRC(k)],
  [E.last, 'cap', (k, T) => PODC(k)],
  [E.final, 'train', (k, T) => VENTC(k)],
  [E.dad - 0.1, 'train', (k, T) => COLTC(k)],
  [E.kiss - 0.1, 'train', (k, T) => AISLE(k)],
  [E.freeze, 'train', (k, T) => AISLE(1)],
  [E.goes, 'ext', (k, T) => look([-60 - 12, 3.5, lerp(36, 24, k)], [-60, 2, lerp(8, 0, k)])],
  [E.newworld, 'ext', (k, T) => look([-60 + 13, 5, lerp(-18, -10, k)], [-60, 2.2, 14])],
  [E.alive - 0.1, 'train', (k, T) => AISLE(k)],
  [E.msg, 'cap', (k, T) => SCRC(k)],
  [E.end, 'train', (k, T) => HOOKC(k * 0.5)],
  [E.loop, 'train', (k, T) => HOOKC(0)] ];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
const boomK = (T) => { let v = 0; for (const b of BOOMS) { const d = T - b; if (d >= 0 && d < 1.2) v = Math.max(v, d); } return v; };
function anim(T0) { const T = FROZEN(T0); const ci = CLI(T0); const loop = T0 >= E.loop; const finalLoop = ci >= 15 && ci <= 18;
  R.landT.offset.x = -T * 0.35; R.ctrain.position.z = 0;
  // explosion inside the carriage (hook preview + the real one + loop flashes)
  const bk = boomK(T); R.fire.forEach((f) => { const on = bk > 0; const q = bk; f.material.opacity = on ? Math.max(0, 1 - q * 0.9) : 0; f.position.set(C(f.userData.a) * f.userData.r * (1 + q * 3), 1.4 + S(f.userData.a) * f.userData.r * (1 + q * 2), -7.6 + q * 9 * (0.5 + f.userData.r)); f.scale.setScalar(1 + q * 4); }); R.fireL.intensity = bk > 0 ? 40 * (1 - bk / 1.2) : 0;
  // exterior explosion
  const ek = T > E.boom + 0.1 && T < E.pod ? T - E.boom - 0.1 : 0; R.efire.forEach(f => { f.material.opacity = ek > 0 ? Math.max(0, 1 - ek * 0.5) : 0; f.position.set(C(f.userData.a) * f.userData.r * (1 + ek * 2), 2 + S(f.userData.a) * f.userData.r * (1 + ek * 1.5) * 0.7, 17 + C(f.userData.a * 2) * 3); f.scale.setScalar(4 + ek * 12); });
  // coffee: cup tipping onto his shoe each loop
  const cp_ = prog(T, E.coffee + 0.1, E.coffee + 0.7); R.cup.visible = ci === 3 && T < E.woman - 0.1 || ci === 5 && T > AT(5, 'over') - 0.15 && T < AT(5, 'over', 1) - 0.1; R.cup.position.set(-0.75, lerp(0.9, 0.35, cp_), 0.95); R.cup.rotation.z = cp_ * 2.2; R.spill.visible = cp_ > 0.6 && (ci === 3 || ci === 5); R.spill.scale.setScalar(ease(prog(T, E.coffee + 0.5, E.coffee + 1.0)) || 1);
  // Colter: waking (head up), Christina talking
  { pose(R.colt); pose(R.chris); const kissing = (ci === 15 && T > E.kiss - 0.1) || ci === 16 || (ci === 18 && T > E.alive - 0.1);
    if (kissing) { const lean = ease(prog(T, E.kiss, E.kiss + 0.8)) || 1; R.colt.position.set(0.05, 0, 0.85); R.colt.rotation.set(0, 0, 0); R.chris.position.set(0.05, 0, 1.25); R.chris.rotation.set(0, PI, 0); R.colt.userData.up.rotation.x = 0.12 * (ci === 15 ? lean : 1); R.chris.userData.up.rotation.x = 0.1 * (ci === 15 ? lean : 1); R.colt.userData.armR.rotation.set(-0.6, 0, -0.3); R.chris.userData.armL.rotation.set(-0.6, 0, 0.3); if (ci === 18) { R.colt.userData.up.rotation.x = 0; R.chris.userData.up.rotation.x = 0; R.colt.userData.head.rotation.y = 0.4; R.chris.userData.mouth.scale.y = 3; } }
    else { sit(R.colt); R.colt.position.set(-0.95, -0.42, 0.3); R.colt.rotation.set(0, 0, 0); sit(R.chris); R.chris.position.set(-0.95, -0.42, 2.1); R.chris.rotation.set(0, PI, 0); const u = R.colt.userData; u.head.rotation.x = ci === 2 && T < E.stranger ? lerp(0.6, 0, ease(prog(T, E.wakes, E.wakes + 1.0))) : 0; u.head.rotation.y = ci === 2 && T > E.stranger - 0.1 ? -0.9 : 0; if (ci === 15 && T > E.dad - 0.1) { u.armR.rotation.set(-2.6, 0, -0.3); u.armR.userData.e.rotation.x = -2.2; } }
    R.phone.visible = ci === 15 && T > E.dad - 0.1 && T < E.kiss - 0.1; }
  R.wallet.visible = ci === 11 || ci === 8; R.frost.visible = ci === 11; if (ci === 11) { R.frost.position.set(4, 1.0, lerp(6, 14, prog(T, E.gotoff, E.stopped))); run(R.frost, T * 6, 0.4); R.frost.rotation.y = 0; }
  R.cops.forEach(([rl, bl], i) => { const f = Math.floor(T * 6 + i) % 2; rl.material.opacity = f ? 1 : 0.1; bl.material.opacity = f ? 0.1 : 1; }); R.van.visible = R.cops[0][0].visible = true;
  R.landT.offset.x = -T * 0.35;
  { const u = R.chris.userData; u.mouth.scale.y = (ci === 3 && T > E.woman) || ci === 5 ? 1 + 3 * Math.abs(S(T * 12)) : 1; u.head.rotation.y = S(T * 0.8) * 0.1; }
  // suspects ringed in the learn beat; vent opens to show the bomb
  const sus = false; R.pass.forEach((p, i) => { p.userData.up.rotation.y = sus ? S(T * 2 + i) * 0.3 : 0; });
  const vo = (ci === 8 && T > E.vent) || ci === 15 ? 1 : 0; R.ventPanel.rotation.x = -vo * 1.3; R.ventPanel.position.y = -0.12 - vo * 0.08; R.bomb.visible = vo > 0.2; R.led.visible = ci === 15 && T > E.final + 1.2 ? false : Math.floor(T * 4) % 2 === 0; R.ledG.material.opacity = R.led.visible ? 0.9 : 0.1;
  // capsule: screen modes + red alarm in the trust beat
  drawScreen(T, ci === 6 ? 'mission' : ci === 9 ? 'glitch' : ci === 13 ? 'wipe' : ci === 19 ? 'face' : 'face'); drawMon(T, false); R.capRed.intensity = ci === 13 || ci === 14 ? 3 + S(T * 4) * 2 : 0; R.scrL.color.set(ci === 6 || ci === 13 ? '#ff6a5a' : '#8ac8ff');
  { const u = R.pilot.userData; u.head.rotation.x = ci === 4 && T < E.strapped ? lerp(0.5, 0, ease(prog(T, E.pod, E.pod + 0.9))) : 0; u.armL.rotation.x = u.armR.rotation.x = -0.5; u.armL.userData.e.rotation.x = u.armR.userData.e.rotation.x = -0.4; }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 72; camera.updateProjectionMatrix(); anim(T); R.train.visible = sh[1] === 'train'; R.ext.visible = sh[1] === 'ext'; R.cap.visible = sh[1] === 'cap'; R.lab.visible = sh[1] === 'lab'; scene.background = new T3.Color(sh[1] === 'cap' ? '#05070a' : '#0a0a0e'); sh[2](prog(T, t0, t1), T); return { si, t0, place: sh[1] }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function loopN(T) { if (T < E.title) return 9; if (T < E.voice) return 1; if (T < E.over) return 2; if (T < AT(5, 'over', 1)) return 3; if (T < E.learn) return 4; if (T < E.wallet) return 6; if (T < E.final) return 8; return 9; }
function timer(T) { const ci = CLI(T); if (![0, 2, 3, 8, 11, 15, 16, 20].includes(ci)) return null; if (T > E.froze && T < E.goes) return '0.00'; const st = [0, E.wakes, E.learn, E.wallet, E.final, E.end].filter(x => x <= T).pop() || 0; const sp = ci === 16 ? 40 : ci === 0 || ci === 20 ? 1 : 6; const left = Math.max(0, 480 - (T - st) * sp); const m = Math.floor(left / 60), sec = Math.floor(left % 60); return m + '.' + String(sec).padStart(2, '0'); }
function hud(T) { const loop = T >= E.loop; octx.save(); octx.fillStyle = 'rgba(6,10,16,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#3affea'; octx.lineWidth = 3; octx.stroke(); txt(T > E.goes && T < E.end ? 'NEW WORLD' : 'LOOP ' + loopN(T), 149, 69, T > E.goes && T < E.end ? 26 : 30, '#3affea'); octx.restore();
  const tm = timer(T); if (tm) { octx.save(); octx.fillStyle = 'rgba(30,4,4,0.85)'; octx.beginPath(); octx.roundRect(470, 36, 226, 110, 22); octx.fill(); octx.strokeStyle = '#ff3a2a'; octx.lineWidth = 3; octx.stroke(); txt('UNTIL IMPACT', 583, 64, 18, '#ff8a7a'); txt(tm, 583, 110, 52, '#ff3a2a'); octx.restore(); } }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ff9a5a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['eight', 'minutes'], '8 minutes'], [['twenty', 'eleven'], '2011'], [['two', 'months'], '2 months']];
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
  scene = new T3.Scene(); scene.background = new T3.Color('#05060a'); scene.fog = new T3.Fog('#8a9ab0', 60, 200); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 400); scene.add(camera); build();
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0, place } = shot(T); const loop = T >= E.loop; renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.1) saturate(1.05)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(2px)'; octx.globalAlpha = 0.12; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.16); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.04 * i; octx.globalAlpha = 0.2 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.65) contrast(2.3)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.35; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.07; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  // explosion white-out + loop glitch
  { const bk = boomK(T); if (bk > 0 && place === 'train') { octx.fillStyle = `rgba(255,${200 - bk * 100},${120 - bk * 80},${Math.max(0, 0.9 - bk)})`; octx.fillRect(0, 0, W, H); } if (T > E.boom + 0.1 && T < E.pod) { octx.fillStyle = `rgba(255,240,200,${Math.max(0, 0.8 - (T - E.boom - 0.1) * 1.5)})`; octx.fillRect(0, 0, W, H); } }
  if (si > 0 && T - t0 < 0.12 && place !== SH[si - 1][1]) { const r = rng(Math.floor(T * 60)); SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 0; i < 10; i++) { const y = r() * H, h = 10 + r() * 50; octx.drawImage(SNAP, 0, y, W, h, (r() - 0.5) * 80, y, W, h); } octx.fillStyle = 'rgba(58,255,234,0.12)'; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 360, 360, 640, 860); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.65)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 13) { octx.fillStyle = `rgba(160,0,0,${0.12 + 0.06 * S(T * 4)})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  const card = (title, lines, col, a) => { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.fillStyle = 'rgba(8,12,18,0.92)'; octx.beginPath(); octx.roundRect(90, 470, 540, 120 + lines.length * 52, 22); octx.fill(); octx.fillStyle = col; octx.fillRect(90, 470, 540, 64); txt(title, 360, 503, 30, '#0a0a10'); lines.forEach((l, i) => txt(l, 360, 575 + i * 52, 30, '#e8f0f8')); octx.restore(); };
  if (ci === 0 || loop) { big('8 MINUTES', 330, 80, '#ff3a2a', 1); if (!loop && T > E.again - 0.1) big('AGAIN.', 420, 70, '#fff', prog(T, E.again - 0.1, E.again + 0.1)); }
  if (ci === 1) { octx.save(); octx.fillStyle = 'rgba(0,0,0,0.45)'; octx.fillRect(0, 380, W, 300); octx.restore(); const gl = Math.floor(T * 12) % 7 === 0 ? 6 : 0; big('SOURCE CODE', 480 + gl, 84, '#3affea', prog(T, E.title, E.title + 0.2), 360 + gl); big('2011', 570, 48, '#fff', prog(T, E.title + 0.6, E.title + 0.8)); if (T > E.spoil - 0.1) big('FULL STORY . SPOILERS', 650, 36, '#ffd27a', prog(T, E.spoil - 0.1, E.spoil + 0.1)); }
  if (ci === 2) { nameTag('COLTER STEVENS', 'US ARMY CAPTAIN', '#3affea', prog(T, E.wakes + 0.3, E.wakes + 0.5) * (1 - prog(T, E.stranger - 0.2, E.stranger))); if (T > E.stranger - 0.1) big("A STRANGER'S BODY", 400, 50, '#fff', prog(T, E.stranger - 0.1, E.stranger + 0.1)); if (T > E.sean - 0.1) nameTag('SEAN', 'SCHOOL TEACHER', '#ffd27a', prog(T, E.sean - 0.1, E.sean + 0.1)); }
  if (ci === 3) { if (T < E.woman - 0.1) big('SAME COFFEE SPILL', 400, 52, '#ffd27a', prog(T, E.coffee, E.coffee + 0.15)); else if (T < E.then - 0.1) nameTag('CHRISTINA', 'SAME WOMAN . EVERY TIME', '#ff9aaa', 1); else if (T < E.boom - 0.15) big('THEN.', 400, 80, '#ff3a2a', 1); }
  if (ci === 4 && T > E.strapped - 0.1) big('STRAPPED IN', 400, 64, '#3affea', prog(T, E.strapped - 0.1, E.strapped + 0.1));
  if (ci === 5) { nameTag('CAPTAIN GOODWIN', 'SOURCE CODE OPERATOR', '#3affea', prog(T, E.voice + 0.2, E.voice + 0.4) * (1 - prog(T, E.relive - 0.3, E.relive - 0.1))); if (T > E.relive - 0.1) big("SEAN'S LAST 8 MINUTES", 400, 48, '#fff', 1); if (T > E.over - 0.15) big('OVER AND OVER', 480, 50, '#ff3a2a', 1); }
  if (ci === 6 && T > E.find - 0.1) { big('FIND THE BOMBER', 400, 60, '#ff3a2a', prog(T, E.find - 0.1, E.find + 0.1)); if (T > E.dirty - 0.1) big('NEXT . A DIRTY BOMB', 480, 44, '#fff', prog(T, E.dirty - 0.1, E.dirty + 0.1)); }
  if (ci === 7 && T > E.strange - 0.1) big('THIS GETS STRANGE', 400, 56, '#3affea', prog(T, E.strange - 0.1, E.strange + 0.1));
  if (ci === 8) { if (T > E.vent - 0.1 && T < E.wrong - 0.1) big('BOMB . IN THE VENT', 400, 54, '#ff3a2a', 1); if (T > E.wrong - 0.1 && T < E.dies) big('WRONG MAN', 400, 70, '#ffd27a', 1); }
  if (ci === 9) { big('NOT TIME TRAVEL', 400, 62, '#3affea', prog(T, E.notime, E.notime + 0.15)); if (T > E.pastc - 0.1 && T < E.asks - 0.1) big("PAST CAN'T CHANGE", 480, 44, '#fff', 1); if (T > E.asks - 0.1) big('WHAT HAPPENED TO ME?', 480, 44, '#ffd27a', 1); }
  if (ci === 10) { if (T > E.died - 0.1) card('SERVICE FILE', ['CAPT. COLTER STEVENS', 'KILLED IN ACTION', 'AFGHANISTAN . 2 MONTHS AGO'], '#ff5a4a', prog(T, E.died - 0.1, E.died + 0.2) * (1 - prog(T, E.machines - 0.2, E.machines))); if (T > E.machines - 0.1 && T < E.head - 0.1) big('KEPT ALIVE ON MACHINES', 300, 44, '#fff', 1); if (T > E.head - 0.1) big('THE CAPSULE IS IN HIS HEAD', 300, 40, '#3affea', 1); }
  if (ci === 11) { if (T > E.frost - 0.1 && T < E.gotoff - 0.1) card('DRIVER LICENCE', ['DEREK FROST', 'THE BOMBER'], '#ffd27a', prog(T, E.frost - 0.1, E.frost + 0.1)); if (T > E.gotoff - 0.1) big('HE GOT OFF BEFORE IT BLEW', 330, 40, '#ff3a2a', prog(T, E.gotoff - 0.1, E.gotoff + 0.1)); }
  if (ci === 12) { big('ATTACK STOPPED', 330, 64, '#5ad88a', prog(T, E.real - 0.1, E.real + 0.1)); if (T > E.complete - 0.1) big('MISSION COMPLETE', 410, 46, '#fff', prog(T, E.complete - 0.1, E.complete + 0.1)); }
  if (ci === 13) big('WIPE HIS MEMORY', 330, 62, '#ff3a2a', prog(T, E.wipe, E.wipe + 0.15));
  if (ci === 14) { big('ONE LAST TRIP', 330, 64, '#3affea', prog(T, E.last, E.last + 0.15)); if (T > E.switchOff - 0.1) big('THEN SWITCH ME OFF', 410, 46, '#fff', prog(T, E.switchOff - 0.1, E.switchOff + 0.1)); }
  if (ci === 15) { if (T < E.dad - 0.1) big('BOMB STOPPED', 330, 64, '#5ad88a', prog(T, E.final + 0.8, E.final + 1.0)); else if (T < E.kiss - 0.1) big('CALLS HIS DAD', 330, 60, '#fff', 1); else big('KISSES CHRISTINA', 330, 56, '#ff9aaa', 1); }
  if (ci === 16) { if (T > E.gw - 0.1) big('SWITCHED OFF', 330, 64, '#ff3a2a', prog(T, E.gw - 0.1, E.gw + 0.1)); if (T > E.froze - 0.1) big('FROZEN', 410, 70, '#cfe8ff', prog(T, E.froze - 0.1, E.froze + 0.1)); }
  if (ci === 17 && T > E.keeps - 0.1) big('IT KEEPS GOING', 330, 70, '#5ad88a', prog(T, E.keeps - 0.1, E.keeps + 0.1));
  if (ci === 18) { if (T < E.everyl - 0.1) big('NEVER A SIMULATION', 330, 56, '#3affea', 1); else if (T < E.alive - 0.1) big('A REAL NEW WORLD', 330, 60, '#fff', 1); else big('HE LIVES', 330, 74, '#5ad88a', 1); if (T > E.seanlife - 0.1) big("AS SEAN", 410, 50, '#ffd27a', 1); }
  if (ci === 19) { card('NEW MESSAGE . TO GOODWIN', ['SOURCE CODE WORKS.', "TELL COLTER IT'S GOING", 'TO BE OKAY.'], '#3affea', prog(T, E.msg + 0.2, E.msg + 0.4) * (1 - prog(T, E.never - 0.2, E.never))); if (T > E.never - 0.1) big('SHE HAS NEVER MET HIM', 330, 44, '#fff', 1); if (T > E.yet - 0.1) big('YET.', 410, 80, '#ff3a2a', prog(T, E.yet - 0.1, E.yet + 0.1)); }
  if (ci === 20 && !loop) { if (T < E.cmt - 0.1) { big('WOULD YOU TAKE IT?', 330, 56, '#fff', prog(T, E.end, E.end + 0.15)); if (T > E.deal - 0.1) big("A REAL LIFE . SOMEONE ELSE'S BODY", 410, 32, '#ffd27a', 1); } else { big('COMMENT', 330, 60, '#fff', 1); big('YES OR NO', 410, 70, '#3affea', prog(T, E.cmt, E.cmt + 0.15)); } }
  likePill(T, E.like, E.learn - 0.2, E.follow7);
  if (T > E.froze && T < E.goes) { const id = octx.getImageData(0, 0, W, H); const d = id.data; for (let i = 0; i < d.length; i += 4) { const v = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = d[i + 1] = v * 0.95; d[i + 2] = Math.min(255, v * 1.1); } octx.putImageData(id, 0, 0); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
