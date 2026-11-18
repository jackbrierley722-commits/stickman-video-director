// Beat your bro to school (the bike). Stylised-realistic 3D: PBR, soft shadows, env lighting, real proportions.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
let renderer, scene, camera, out, octx, small, sctx, glc, GRAIN, GLOW, FIRE, SMOKE, SNAP, cubeRT, cubeCam;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0 }, o));
const BM = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 20) => new T3.CylinderGeometry(a, b, h, n), Sp = (r, a = 24, b = 18) => new T3.SphereGeometry(r, a, b), Cap = (r, l, s = 12) => new T3.CapsuleGeometry(r, l, 6, s);
function RB(w, h, d, r = 0.04) { const s = new T3.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); const g = new T3.ExtrudeGeometry(s, { depth: d - r * 1.2, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.6, bevelSegments: 4, curveSegments: 6 }); g.translate(0, 0, -(d - r * 1.2) / 2); return g; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 8; t.userData = { g, c }; return t; }
function spr(p, tex, col, size, x, y, z, op, blend = T3.AdditiveBlending) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: tex, color: col, transparent: true, opacity: op, blending: blend, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function look(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const TR = (k, a, b, la, lb) => look(L3(a, b, ease(k)), L3(la, lb, ease(k)));
function noiseTex(w, h, base, spots, seed, rep) { const t = ctex(w, h, (c) => { c.fillStyle = base; c.fillRect(0, 0, w, h); const r = rng(seed); for (const [col, n, sz] of spots) { c.fillStyle = col; for (let i = 0; i < n; i++) c.fillRect(r() * w, r() * h, sz * (0.5 + r()), sz * (0.5 + r())); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return t; }
function brickTex(col, seed) { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#8a8070'; c.fillRect(0, 0, w, h); const r = rng(seed); for (let y = 0; y < h; y += 16) for (let x = ((y / 16) % 2) * 16 - 16; x < w; x += 32) { const v = (r() - 0.5) * 30; c.fillStyle = `rgb(${parseInt(col.slice(1, 3), 16) + v},${parseInt(col.slice(3, 5), 16) + v * 0.6},${parseInt(col.slice(5, 7), 16) + v * 0.5})`; c.fillRect(x + 1, y + 1, 30, 14); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
function buildSky() { const st = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a6aa8'); g.addColorStop(0.42, '#9ac0e0'); g.addColorStop(0.5, '#dfe8ec'); g.addColorStop(0.53, '#c8c8c0'); g.addColorStop(1, '#8a8a80'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  R.sky = add(scene, Sp(2500, 32, 16), new T3.MeshBasicMaterial({ map: st, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = R.sky.receiveShadow = false;
  const clouds = ctex(1024, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(40); for (let i = 0; i < 60; i++) { const x = r() * w, y = 60 + r() * 120, rr = 20 + r() * 50; const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); } });
  const cl = add(scene, new T3.CylinderGeometry(2200, 2200, 900, 32, 1, true), new T3.MeshBasicMaterial({ map: clouds, transparent: true, side: T3.BackSide, fog: false, depthWrite: false, toneMapped: false }), 0, 380, 0, false); cl.castShadow = false;
  R.sun = new T3.DirectionalLight('#fff0d8', 2.6); R.sun.position.set(60, 90, 40); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -30; sc.right = sc.top = 30; sc.near = 1; sc.far = 300; R.sun.shadow.bias = -0.0004; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#bcd4f0', '#5a5a50', 0.9); scene.add(R.hemi); }
function sunAt(x, y, z) { R.sun.target.position.set(x, y, z); R.sun.position.set(x + 60, y + 90, z + 40); }
const R = {};

// ---------- people (stylised realistic) ----------
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#d8a888', { roughness: 0.55 }), top = SM(o.top || '#3a4a6a', { roughness: 0.8 }), bot = SM(o.bot || '#2a2e3a', { roughness: 0.85 }), hairM = SM(o.hair || '#2a1a10', { roughness: 0.75 }), lip = SM(o.lip || '#b06a5a', { roughness: 0.5 });
  const fem = !!o.fem; const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  const prof = (fem ? [[0.13, -0.08], [0.155, 0.0], [0.14, 0.14], [0.13, 0.24], [0.155, 0.36], [0.16, 0.45], [0.14, 0.53], [0.06, 0.58]] : [[0.14, -0.08], [0.16, 0.0], [0.15, 0.14], [0.16, 0.26], [0.185, 0.38], [0.195, 0.47], [0.165, 0.55], [0.06, 0.6]]).map(([r_, y]) => new T3.Vector2(r_, y));
  const torso = add(up, new T3.LatheGeometry(prof, 28), top, 0, 0, 0); torso.scale.z = 0.66; add(up, Sp(0.155), bot, 0, -0.05, 0).scale.set(1, 0.7, 0.72);
  if (o.shirt) add(up, Bx(0.07, 0.42, 0.01), SM(o.shirt), 0, 0.33, 0.118, false); if (o.collar !== false) add(up, new T3.TorusGeometry(0.065, 0.022, 8, 20), top, 0, 0.6, 0.0).rotation.x = PI / 2;
  add(up, Cy(0.048, 0.055, 0.12), skin, 0, 0.63, 0.0);
  const head = new T3.Group(); head.position.set(0, 0.76, 0.0); up.add(head); add(head, Sp(0.1, 32, 24), skin, 0, 0.02, -0.005).scale.set(0.9, 1.1, 1.0); add(head, Sp(0.083, 28, 20), skin, 0, -0.042, 0.016).scale.set(0.86, 0.82, 0.92);
  const nose = add(head, Cap(0.013, 0.028, 10), skin, 0, -0.004, 0.094); nose.rotation.x = 0.35;
  for (const sx of [-1, 1]) { add(head, Sp(0.017, 16, 12), SM('#f4f0ea', { roughness: 0.15 }), sx * 0.034, 0.017, 0.074).scale.set(1, 0.75, 0.6); add(head, new T3.CircleGeometry(0.0085, 16), SM(o.eye || '#4a3020', { roughness: 0.1 }), sx * 0.034, 0.017, 0.0848, false); add(head, new T3.CircleGeometry(0.0042, 12), SM('#0a0a0a', { roughness: 0.05 }), sx * 0.034, 0.017, 0.0852, false);
    const br = add(head, Cap(0.0045, 0.026, 6), hairM, sx * 0.035, 0.04, 0.083, false); br.rotation.z = PI / 2 + sx * 0.12; br.userData.sx = sx; (g.userData.brows = g.userData.brows || []).push(br); add(head, Sp(0.022, 12, 10), skin, sx * 0.093, 0.004, -0.004).scale.set(0.4, 1, 0.65); }
  const mouth = new T3.Group(); mouth.position.set(0, -0.046, 0.083); head.add(mouth); add(mouth, Cap(0.0062, 0.022, 8), lip, 0, 0.004, 0, false).rotation.z = PI / 2; const ll = add(mouth, Cap(0.0068, 0.018, 8), lip, 0, -0.008, -0.001, false); ll.rotation.z = PI / 2;
  if (o.beard) add(head, Sp(0.084, 24, 16, 0, PI * 2, PI * 0.45, PI * 0.55), SM(o.beard, { roughness: 1 }), 0, -0.035, 0.016).scale.set(0.9, 0.95, 0.95);
  // hair
  const hc = add(head, new T3.SphereGeometry(0.107, 32, 18, 0, PI * 2, 0, PI * (fem ? 0.6 : 0.5)), hairM, 0, 0.026, -0.012); hc.scale.set(0.95, 1.08, 1.06); hc.rotation.x = -0.18;
  if (fem) { add(head, Cap(0.095, 0.2, 16), hairM, 0, -0.1, -0.05).scale.set(1.1, 1, 0.55); for (const sx of [-1, 1]) add(head, Cap(0.03, 0.17, 10), hairM, sx * 0.088, -0.07, 0.02); }
  else { for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3; add(head, Sp(0.032, 12, 10), hairM, Math.sin(a) * 0.085, 0.085 + Math.cos(a) * 0.01, 0.055 + Math.cos(a) * 0.01).scale.set(1, 0.7, 0.8); } for (const sx of [-1, 1]) add(head, Cap(0.014, 0.045, 6), hairM, sx * 0.093, 0.01, 0.025); }
  if (o.cap) { add(head, Sp(0.112, 24, 12, 0, PI * 2, 0, PI * 0.5), SM(o.cap), 0, 0.035, -0.006).scale.set(0.98, 0.9, 1.05); add(head, Cy(0.08, 0.09, 0.012), SM(o.cap), 0, 0.045, 0.1).scale.z = 0.7; }
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.185, 0.5, 0); up.add(s_); add(s_, Sp(0.055), top, 0, 0, 0); add(s_, Cap(0.048, 0.22), top, 0, -0.14, 0); const e = new T3.Group(); e.position.y = -0.29; s_.add(e); add(e, Sp(0.043), top, 0, 0, 0); add(e, Cap(0.04, 0.2), o.short ? skin : top, 0, -0.12, 0); const hnd = new T3.Group(); hnd.position.y = -0.26; e.add(hnd); add(hnd, Cap(0.03, 0.045, 10), skin, 0, -0.03, 0).scale.set(1.15, 1, 0.55); add(hnd, Cap(0.012, 0.03, 6), skin, sx * -0.022, -0.02, 0.012).rotation.z = sx * 0.6; s_.userData.e = e; s_.userData.h = hnd; return s_; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.085, 0.92, 0); g.add(h); add(h, Cap(0.068, 0.34), bot, 0, -0.22, 0); const k = new T3.Group(); k.position.y = -0.45; h.add(k); add(k, Sp(0.058), bot, 0, 0, 0); add(k, Cap(0.053, 0.34), bot, 0, -0.21, 0); const sh = add(k, Cap(0.048, 0.15), SM(o.shoe || '#1a1a1e', { roughness: 0.45 }), 0, -0.43, 0.05); sh.rotation.x = PI / 2; sh.scale.set(1.05, 1, 0.65); h.userData.k = k; return h; };
  g.userData = { brows: g.userData.brows, up, head, mouth, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
function rest(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) { u[k].rotation.set(0, 0, 0); (u[k].userData.e || u[k].userData.k).rotation.set(0, 0, 0); } u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); u.mouth.scale.set(1, 1, 1); u.armL.rotation.z = 0.08; u.armR.rotation.z = -0.08; }
function seatPose(p, seatTop) { rest(p); const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.05; l.userData.k.rotation.x = PI / 2 - 0.05; } u.up.rotation.x = -0.08; p.position.y = seatTop + 0.06 - 0.92; u.armL.rotation.x = -0.55; u.armR.rotation.x = -0.55; u.armL.userData.e.rotation.x = -0.5; u.armR.userData.e.rotation.x = -0.5; }
function walkPose(p, ph, a = 1) { rest(p); const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.5 * a; u.legR.rotation.x = -s * 0.5 * a; u.legL.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; u.legR.userData.k.rotation.x = Math.max(0, s) * 0.7 * a; u.armL.rotation.x = -s * 0.4 * a; u.armR.rotation.x = s * 0.4 * a; u.armL.userData.e.rotation.x = -0.25; u.armR.userData.e.rotation.x = -0.25; }
const talk = (p, T, on) => { p.userData.mouth.scale.y = on ? 1 + Math.abs(S(T * 14)) * 1.8 : 1; };


// ===================== PS3 STYLE TOOLKIT: chunky pixel textures, blocky people/cars/dinos, hazy dusk =====================
function PT(w, h, fn) { const t = ctex(w, h, fn); t.magFilter = T3.NearestFilter; t.minFilter = T3.NearestFilter; t.generateMipmaps = false; t.anisotropy = 1; return t; }
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function noisy(c, w, h, col, amt, seed, x0 = 0, y0 = 0) { const r = rng(seed); const [R_, G_, B_] = hex(col); for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const v = (r() - 0.5) * amt; c.fillStyle = `rgb(${clamp(R_ + v, 0, 255) | 0},${clamp(G_ + v, 0, 255) | 0},${clamp(B_ + v, 0, 255) | 0})`; c.fillRect(x, y, 1, 1); } }
const LM = (o) => new T3.MeshLambertMaterial(o);
const TXC = new Map(); function nT(col, amt = 26, size = 16, seed = 1) { const k = col + amt + size + seed; if (!TXC.has(k)) TXC.set(k, PT(size, size, (c) => noisy(c, size, size, col, amt, seed))); return TXC.get(k); }
const PM = (col, amt = 26, size = 16, seed = 1) => LM({ map: nT(col, amt, size, seed) });
function boxM(p, w, h, d, mats, x, y, z, sh = true) { const m = new T3.Mesh(Bx(w, h, d), mats); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
// ---------- blocky people ----------
const OUTFITS = [
  { top: '#3a2c24', open: '#e8e2d6', bot: '#5a6a8a', hair: '#3a2416', skin: '#d8a07c' }, { top: '#2a2a2e', open: '#d8d4cc', bot: '#4a5a72', hair: '#141010', skin: '#6a4430', cap: '#1e2436' },
  { top: '#8a2a24', bot: '#4a5a72', hair: '#3a2416', skin: '#e0ac88', sleeve: '#d8d4cc' }, { top: '#b89a6a', open: '#2a2a2e', bot: '#7a6248', hair: '#4a3020', skin: '#d8a07c', cap: '#b8a070' },
  { top: '#1c1c20', open: '#e8e8e8', bot: '#1c1c20', hair: '#2a1a10', skin: '#e0ac88', tie: '#1c1c20' }, { top: '#e86a1e', bot: '#8a8a82', hair: '#3a2416', skin: '#d8a07c', cap: '#e8c020', vest: 1 },
  { top: '#1e2640', bot: '#1e2640', hair: '#2a1a10', skin: '#e0ac88', cap: '#1a1e30', cop: 1 }, { top: '#9a948c', bot: '#3a3a3e', hair: '#8a847c', skin: '#7a5038', hood: 1 }];
function faceTex(o, ex = 'n') { return PT(16, 16, (c) => { noisy(c, 16, 16, o.skin, 18, 3); noisy(c, 16, 5, o.cap || o.hair, 20, 4); if (!o.cap) noisy(c, 2, 9, o.hair, 20, 5); if (o.hood) { noisy(c, 2, 16, o.top, 20, 6); noisy(c, 2, 16, o.top, 20, 6, 14); }
  c.fillStyle = '#f0ece4'; c.fillRect(4, 8, 3, ex === 'o' ? 2 : 1); c.fillRect(9, 8, 3, ex === 'o' ? 2 : 1); c.fillStyle = '#4a5a7a'; const px = ex === 's' ? 1 : ex === 'S' ? -1 : 0; c.fillRect(5 + px, 8, 1, 1); c.fillRect(10 + px, 8, 1, 1);
  c.fillStyle = 'rgba(40,20,10,0.75)'; if (ex === 'a' || ex === 'o') { c.fillRect(4, 6, 1, 1); c.fillRect(5, 7, 2, 1); c.fillRect(11, 6, 1, 1); c.fillRect(9, 7, 2, 1); } else if (ex === 's' || ex === 'S') { c.fillRect(4, 6, 3, 1); c.fillRect(9, 7, 3, 1); } else { c.fillRect(4, 7, 3, 1); c.fillRect(9, 7, 3, 1); }
  if (ex === 'o') { c.fillStyle = '#3a1010'; c.fillRect(5, 11, 6, 3); c.fillStyle = '#e8e0d8'; c.fillRect(5, 11, 6, 1); } else if (ex === 's' || ex === 'S') { c.fillStyle = 'rgba(80,40,30,0.7)'; c.fillRect(6, 12, 4, 1); c.fillRect(10, 11, 1, 1); } else if (ex === 'd') { c.fillStyle = 'rgba(80,40,30,0.7)'; c.fillRect(6, 12, 5, 1); } else { c.fillStyle = 'rgba(80,40,30,0.5)'; c.fillRect(6, 12, 4, 1); } c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(7, 9, 2, 2); }); }
function torsoTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.top, 24, 7); if (o.open) { noisy(c, 6, 16, o.open, 14, 8, 5); } if (o.tie) noisy(c, 2, 13, o.tie, 10, 9, 7); if (o.vest) { c.fillStyle = '#d8d8c8'; c.fillRect(0, 9, 16, 2); c.fillRect(4, 0, 2, 16); c.fillRect(10, 0, 2, 16); } if (o.cop) { c.fillStyle = '#c8a040'; c.fillRect(3, 4, 2, 2); c.fillStyle = '#111'; c.fillRect(0, 14, 16, 2); } if (o.hood) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(4, 9, 8, 4); } }); }
function person(o) { const g = new T3.Group(); const skin = PM(o.skin, 16, 8, 2), top = PM(o.top, 24, 8, 3), bot = PM(o.bot, 26, 8, 4), hair = PM(o.cap || o.hair, 20, 8, 5), shoe = PM('#2a2420', 16, 8, 6), sleeve = PM(o.sleeve || o.top, 22, 8, 7);
  const up = new T3.Group(); up.position.y = 0.95; g.add(up); boxM(up, 0.5, 0.62, 0.28, [top, top, top, top, LM({ map: torsoTex(o) }), top], 0, 0.31, 0);
  const head = new T3.Group(); head.position.y = 0.66; up.add(head); const FX = {}; for (const ex of ['n', 'o', 'a', 's', 'S', 'd']) FX[ex] = LM({ map: faceTex(o, ex) }); const hm = boxM(head, 0.32, 0.34, 0.32, [skin, skin, hair, skin, FX.n, hair], 0, 0.17, 0); g.userData_fx = { hm, FX }; if (o.cap) boxM(head, 0.34, 0.08, 0.36, hair, 0, 0.32, 0.03); if (o.capBack) boxM(head, 0.2, 0.04, 0.14, hair, 0, 0.31, -0.2);
  if (o.long) { const lh = PM(o.hair, 20, 8, 12); boxM(head, 0.34, 0.42, 0.1, lh, 0, 0.05, -0.15); for (const sx of [-1, 1]) boxM(head, 0.05, 0.3, 0.2, lh, sx * 0.17, 0.1, -0.06); }
  if (o.pony) boxM(head, 0.1, 0.28, 0.1, PM(o.hair, 20, 8, 13), 0, 0.12, -0.21);
  if (o.beanie) { const bn = PM(o.beanie, 22, 8, 14); boxM(head, 0.35, 0.14, 0.35, bn, 0, 0.36, 0); boxM(head, 0.36, 0.05, 0.36, PM(o.beanie, 12, 8, 15), 0, 0.29, 0); }
  if (o.glasses) { const gm = PM('#1a1a1a', 6, 8, 16); for (const sx of [-1, 1]) { const cx = sx * 0.075; boxM(head, 0.11, 0.014, 0.02, gm, cx, 0.205, 0.166, false); boxM(head, 0.11, 0.014, 0.02, gm, cx, 0.135, 0.166, false); boxM(head, 0.014, 0.07, 0.02, gm, cx - 0.048, 0.17, 0.166, false); boxM(head, 0.014, 0.07, 0.02, gm, cx + 0.048, 0.17, 0.166, false); } boxM(head, 0.05, 0.012, 0.02, gm, 0, 0.19, 0.166, false); }
  if (o.phones) { const hp = PM(o.phones, 10, 8, 17); boxM(head, 0.38, 0.04, 0.06, hp, 0, 0.36, 0); for (const sx of [-1, 1]) boxM(head, 0.06, 0.12, 0.12, hp, sx * 0.19, 0.17, 0); }
  if (o.chain) boxM(up, 0.3, 0.04, 0.02, LM({ color: '#e8c040', emissive: '#6a5000', emissiveIntensity: 0.4 }), 0, 0.5, 0.15, false);
  if (o.build) up.scale.set(o.build, 1, o.build);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.33, 0.58, 0); up.add(s); boxM(s, 0.16, 0.34, 0.18, sleeve, 0, -0.17, 0); const e = new T3.Group(); e.position.y = -0.34; s.add(e); boxM(e, 0.15, 0.3, 0.17, o.sleeve ? sleeve : top, 0, -0.13, 0); boxM(e, 0.14, 0.1, 0.15, skin, 0, -0.32, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.13, 0.95, 0); g.add(h); boxM(h, 0.22, 0.46, 0.24, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.21, 0.42, 0.23, bot, 0, -0.21, 0); boxM(k, 0.22, 0.08, 0.32, shoe, 0, -0.45, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), hm, FX }; return g; }
function faceP(p, ex) { const u = p.userData; if (u.hm.material[4] !== u.FX[ex]) { u.hm.material[4] = u.FX[ex]; } }
function seatP(p, y) { stillP(p); const u = p.userData; u.legL.rotation.x = u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = u.legR.userData.k.rotation.x = PI / 2; p.position.y = y - 0.95 + 0.06; }
function walkP(p, ph, a = 1, run = 0) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.55 * a; u.legR.rotation.x = -s * 0.55 * a; u.legL.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; u.legR.userData.k.rotation.x = Math.max(0, s) * 0.7 * a; u.armL.rotation.x = -s * 0.45 * a; u.armR.rotation.x = s * 0.45 * a; u.armL.userData.e.rotation.x = run ? -1.2 : -0.15; u.armR.userData.e.rotation.x = run ? -1.2 : -0.15; u.up.rotation.x = run ? 0.25 : 0; }
function stillP(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) { u[k].rotation.set(0, 0, 0); (u[k].userData.e || u[k].userData.k).rotation.set(0, 0, 0); } u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); }
// ---------- blocky cars ----------
function carTex(col, kind) { return PT(32, 16, (c) => { noisy(c, 32, 16, col, 18, 11); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(13, 2, 1, 12); c.fillRect(22, 2, 1, 12); c.fillRect(0, 13, 32, 3); if (kind === 'police') { noisy(c, 32, 8, '#e8e8e8', 10, 12, 0, 3); c.fillStyle = '#111'; c.font = '7px monospace'; c.fillText('POLICE', 4, 10); } if (kind === 'taxi') { for (let x = 0; x < 32; x += 2) { c.fillStyle = (x / 2) % 2 ? '#111' : '#e8c020'; c.fillRect(x, 7, 2, 1); c.fillStyle = (x / 2) % 2 ? '#e8c020' : '#111'; c.fillRect(x, 8, 2, 1); } } }); }
function glassTex() { return PT(16, 8, (c) => { noisy(c, 16, 8, '#2a2e36', 14, 13); c.fillStyle = 'rgba(160,170,190,0.25)'; c.fillRect(2, 1, 3, 2); c.fillStyle = '#3a3e46'; c.fillRect(7, 0, 1, 8); }); }
const CARS = [['#8a8a88', ''], ['#7a2a22', ''], ['#d8b020', 'taxi'], ['#e8e8e8', 'police'], ['#3a4a8a', ''], ['#5a5a3a', ''], ['#c8c8c4', ''], ['#6a2a22', '']];
function car(ci) { const [col, kind] = CARS[ci % CARS.length]; const g = new T3.Group(); const body = PM(col, 18, 16, 20 + ci), side = LM({ map: carTex(col, kind) }), gl = LM({ map: glassTex() }), dark = PM('#1a1a1c', 10, 8, 21), lightM = LM({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 1.2 }), tail = LM({ color: '#a01010', emissive: '#ff3020', emissiveIntensity: 1.2 });
  boxM(g, 1.9, 0.62, 4.3, [side, side, body, dark, body, body], 0, 0.62, 0); boxM(g, 1.7, 0.6, 2.2, [gl, gl, body, dark, gl, gl], 0, 1.22, -0.2); boxM(g, 1.92, 0.2, 4.35, dark, 0, 0.36, 0);
  for (const [x, z] of [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]]) boxM(g, 0.3, 0.62, 0.62, dark, x, 0.31, z);
  for (const x of [-0.65, 0.65]) { boxM(g, 0.4, 0.16, 0.06, lightM, x, 0.74, 2.16, false); boxM(g, 0.4, 0.16, 0.06, tail, x, 0.74, -2.16, false); }
  if (kind === 'taxi') boxM(g, 0.6, 0.22, 0.3, PM('#e8c020', 10, 8, 22), 0, 1.62, -0.2); if (kind === 'police') { g.userData.lb = [boxM(g, 0.4, 0.14, 0.3, LM({ color: '#2040ff', emissive: '#2040ff', emissiveIntensity: 1 }), -0.25, 1.6, -0.2, false), boxM(g, 0.4, 0.14, 0.3, LM({ color: '#ff2020', emissive: '#ff2020', emissiveIntensity: 1 }), 0.25, 1.6, -0.2, false)]; }
  return g; }
// ---------- city pieces ----------
function winTexP(base, lit, seed, cols = 8, rows = 16) { return PT(cols * 4, rows * 4, (c, w, h) => { noisy(c, w, h, base, 22, seed); const r = rng(seed + 1); for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const on = r() < lit; c.fillStyle = on ? (r() < 0.5 ? '#e8c890' : '#d8b070') : (r() < 0.5 ? '#2a2e3a' : '#3a3e4a'); c.fillRect(x * 4 + 1, y * 4 + 1, 2, 2); } }); }
function tower(p, x, z, w, h, d, base, lit, seed) { const t = winTexP(base, lit, seed); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(Math.max(1, w / 8), Math.max(1, h / 16)); const m = LM({ map: t }); const top = PM(base, 20, 16, seed + 3); boxM(p, w, h, d, [m, m, top, top, m, m], x, h / 2, z, false); return h; }
function palm(p, x, z, h, seed) { const r = rng(seed); const tr = PM('#5a4432', 26, 8, seed); let y = 0; for (let i = 0; i < Math.round(h / 0.9); i++) { boxM(p, 0.36, 0.92, 0.36, tr, x + S(i * 0.4) * 0.12 * i * 0.2, y + 0.45, z, false); y += 0.9; } const lf = PM('#4a5a2a', 30, 8, seed + 1);
  for (let k = 0; k < 7; k++) { const a = k / 7 * PI * 2 + r(); const f = new T3.Group(); f.position.set(x, y, z); f.rotation.y = a; p.add(f); boxM(f, 0.5, 0.12, 2.2, lf, 0, -0.2, 1.0, false).rotation.x = 0.45; boxM(f, 0.45, 0.1, 1.2, lf, 0, -0.85, 2.3, false).rotation.x = 0.9; } }
function lampP(p, x, z, side) { const m = PM('#2a2a2e', 12, 8, 30); boxM(p, 0.18, 6, 0.18, m, x, 3, z, false); boxM(p, 1.4, 0.14, 0.18, m, x + side * 0.65, 6, z, false); boxM(p, 0.45, 0.14, 0.3, LM({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 0.6 }), x + side * 1.25, 5.9, z, false); }

// ---------- timing ----------
const E = { screams: AT(0, 'screams'), soul: AT(4, 'i'), hand: AT(6, 'his'), circles: AT(6, 'doing'), out: AT(11, 'you'), waves: AT(11, 'he'), sits: AT(13, 'he', 1), cut: AT(14, 'me') + 0.08 };
for (let i = 0; i < CL.length; i++) E['c' + i] = CL[i].start;
E.loop = 1e9; const END = E.cut;
const ROWZ = [-2.8, -1.0, 0.8, 2.6], COLX = [-3.2, 0, 3.2], ME = [-0.4, 0.8], BRO = [0.4, 0.8];
function build() {
  R.sun = new T3.DirectionalLight('#fff4e0', 1.6); R.sun.position.set(-12, 10, 2); R.sun.target.position.set(0, 0, 0); R.sun.castShadow = true; R.sun.shadow.mapSize.set(1024, 1024); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -9; sc.right = sc.top = 9; sc.near = 1; sc.far = 40; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#e8ecf8', '#8a8070', 1.9); scene.add(R.hemi);
  const G = R.G = new T3.Group(); scene.add(G); const wall = PM('#c8c0a8', 12, 16, 1), floor = PM('#8a7a62', 18, 16, 2);
  boxM(G, 12.4, 0.1, 12.4, floor, 0, -0.05, 0, false); for (let i = 0; i < 12; i++) boxM(G, 12.4, 0.004, 0.02, PM('#6a5a46'), 0, 0.002, -6 + i, false); boxM(G, 12.4, 0.1, 12.4, PM('#d8d4c8', 8, 16, 3), 0, 3.25, 0, false);
  boxM(G, 12.4, 3.3, 0.1, wall, 0, 1.65, -6.2, false); boxM(G, 12.4, 3.3, 0.1, wall, 0, 1.65, 6.2, false); boxM(G, 0.1, 3.3, 12.4, wall, 6.2, 1.65, 0, false); boxM(G, 0.1, 1.0, 12.4, wall, -6.2, 0.5, 0, false); boxM(G, 0.1, 0.5, 12.4, wall, -6.2, 3.05, 0, false);
  const skyW = PT(16, 16, (c) => { const g = c.createLinearGradient(0, 0, 0, 16); g.addColorStop(0, '#8ab8e8'); g.addColorStop(0.7, '#c8e0f0'); g.addColorStop(0.71, '#5a8a4a'); g.addColorStop(1, '#4a7a3a'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); }); for (let i = 0; i < 5; i++) { const z = -4.8 + i * 2.4; boxM(G, 0.05, 1.8, 2.0, LM({ map: skyW, emissive: '#ffffff', emissiveMap: skyW, emissiveIntensity: 0.8 }), -6.22, 1.9, z, false); boxM(G, 0.14, 1.9, 0.14, PM('#e8e4dc'), -6.15, 1.9, z + 1.1, false); }
  for (const [x, z] of [[-2.5, -3], [2.5, -3], [-2.5, 2], [2.5, 2]]) boxM(G, 1.8, 0.04, 0.5, LM({ color: '#fffbf0', emissive: '#fffbf0', emissiveIntensity: 1 }), x, 3.19, z, false);
  // chalkboard
  const cb = PT(64, 24, (c) => { noisy(c, 64, 24, '#2a4a36', 14, 5); c.fillStyle = 'rgba(240,240,230,0.85)'; c.font = '7px monospace'; c.fillText('MATHS', 3, 7); c.fillText('2x + 5 = 17', 3, 15); c.fillText('x = 6', 40, 15); c.fillRect(3, 19, 26, 1); }); boxM(G, 5, 1.8, 0.06, [PM('#5a4030'), PM('#5a4030'), PM('#5a4030'), PM('#5a4030'), LM({ map: cb }), PM('#5a4030')], 0, 1.75, -6.12, false); boxM(G, 5.2, 0.08, 0.16, PM('#6a5040'), 0, 0.82, -6.06, false);
  boxM(G, 1.4, 0.8, 0.7, PM('#7a5a3a', 18, 16, 6), -2.2, 0.4, -4.6); boxM(G, 0.1, 2.1, 1.0, PM('#6a4a30', 18, 16, 7), 6.14, 1.05, 3.0, false); boxM(G, 0.04, 0.5, 0.35, LM({ map: skyW }), 6.1, 1.6, 3.0, false);
  const clock = PT(16, 16, (c) => { c.fillStyle = '#f0ece0'; c.beginPath(); c.arc(8, 8, 7.5, 0, 7); c.fill(); c.fillStyle = '#111'; c.fillRect(8, 3, 1, 5); c.fillRect(8, 8, 4, 1); }); boxM(G, 0.6, 0.6, 0.04, [PM('#111'), PM('#111'), PM('#111'), PM('#111'), LM({ map: clock, transparent: true }), PM('#111')], 3.2, 2.8, -6.12, false);
  // desks + chairs
  const wood = PM('#b8905a', 16, 16, 8), metal = PM('#4a4e56', 10, 8, 9), chair = PM('#3a5a8a', 14, 8, 10);
  for (const z of ROWZ) for (const x of COLX) { const top_ = boxM(G, 1.6, 0.06, 0.6, wood, x, 0.75, z - 0.35); if (x === 0 && z === ME[1]) R.myDesk = top_; for (const [dx, dz] of [[-0.74, -0.27], [0.74, -0.27], [-0.74, 0.25], [0.74, 0.25]]) boxM(G, 0.05, 0.74, 0.05, metal, x + dx, 0.37, z - 0.35 + dz, false);
    for (const sx of [-0.4, 0.4]) { boxM(G, 0.44, 0.05, 0.42, chair, x + sx, 0.46, z + 0.15); boxM(G, 0.44, 0.45, 0.05, chair, x + sx, 0.72, z + 0.38); for (const [dx, dz] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) boxM(G, 0.04, 0.46, 0.04, metal, x + sx + dx, 0.23, z + 0.15 + dz, false); } }
  // books / pencil cases on desks
  R.myBooks = []; for (const z of ROWZ) for (const x of COLX) for (const sx of [-0.4, 0.4]) { const bk = boxM(G, 0.32, 0.03, 0.24, PM(['#e8e4dc', '#c8d8e8', '#f0e0c0'][(Math.abs(x + z * 3 + sx * 7) | 0) % 3], 8, 8, 11), x + sx, 0.795, z - 0.4); if (x === 0 && z === ME[1]) R.myBooks.push(bk); }
  // students
  R.kids = []; let oi = 0; for (const z of ROWZ) for (const x of COLX) for (const sx of [-0.4, 0.4]) { if (z === ME[1] && x === 0) continue; if ((oi * 7) % 9 === 0) { oi++; continue; } const KIDS = [{ top: '#d84a7a', bot: '#3a4a62', hair: '#e8c870', skin: '#f0c8a0', long: 1 }, { top: '#e8a030', bot: '#4a4a52', hair: '#2a1a10', skin: '#8a5a3a', beanie: '#2a2a3a' }, { top: '#8a8a92', bot: '#2a3a5a', hair: '#c84a1a', skin: '#f0c8a8', phones: '#e83a3a' }, { top: '#4ab8c8', bot: '#5a4a3a', hair: '#141010', skin: '#c8906a', pony: 1 }, { top: '#6a3a8a', bot: '#2a2a30', hair: '#4a3020', skin: '#e0a880', glasses: 1 }, { top: '#e8e4dc', bot: '#3a5a8a', hair: '#141010', skin: '#5a3a28', long: 1 }, { top: '#c83a2a', bot: '#3a3a40', hair: '#d8c8a0', skin: '#f0d0b0', beanie: '#3a8a5a' }, { top: '#3a3a40', bot: '#6a6050', hair: '#6a4a2a', skin: '#d8a07c', phones: '#f0f0f0' }]; const o = Object.assign({}, KIDS[oi % KIDS.length]); const p = person(o); p.position.set(x + sx, 0, z + 0.15); p.rotation.y = PI; seatP(p, 0.48); p.userData.armL.rotation.x = -0.9; p.userData.armR.rotation.x = -0.9; G.add(p); R.kids.push(p); oi++; }
  R.you = person({ top: '#3a5aa8', bot: '#3a4a62', hair: '#c88a3a', skin: '#e8b890', glasses: 1 }); G.add(R.you); R.bro = person({ top: '#2a8a3a', bot: '#2a2a30', hair: '#141010', skin: '#7a4a30', cap: '#c82a2a', capBack: 1, chain: 1, build: 1.15 }); G.add(R.bro);
  R.teacher = person({ top: '#6a5a8a', open: '#e8e0d0', bot: '#3a3a3e', hair: '#b8b4ac', skin: '#e0b090', glasses: 1, tie: '#8a2a2a', build: 1.1 }); G.add(R.teacher);
  const Cr = R.Cr = new T3.Group(); scene.add(Cr); boxM(Cr, 4.2, 0.1, 10, PM('#9a8a72', 16, 16, 40), 8.4, -0.05, 2, false); boxM(Cr, 4.2, 0.1, 10, PM('#d8d4c8', 8, 16, 41), 8.4, 3.25, 2, false); boxM(Cr, 0.1, 3.3, 10, PM('#b8c8b0', 12, 16, 42), 10.5, 1.65, 2, false); boxM(Cr, 0.1, 3.3, 10, PM('#b8c8b0', 12, 16, 42), 6.3, 1.65, 2, false);
  boxM(Cr, 0.08, 2.1, 1.0, PM('#6a4a30', 18, 16, 7), 6.36, 1.05, 3.0, false); for (let i = 0; i < 9; i++) { const lk = PT(8, 32, (c) => { noisy(c, 8, 32, ['#3a6aa8', '#a83a3a', '#3a8a5a'][i % 3], 16, 50 + i); c.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 3; y < 9; y += 2) c.fillRect(2, y, 4, 1); c.fillRect(6, 14, 1, 3); }); boxM(Cr, 0.5, 2.0, 0.6, LM({ map: lk }), 10.2, 1.0, -1.6 + i * 0.62, false); }
  boxM(Cr, 0.45, 0.06, 1.7, PM('#8a6a48', 18, 8, 43), 6.75, 0.45, 1.3); for (const z of [0.6, 2.0]) boxM(Cr, 0.4, 0.44, 0.06, PM('#4a4e56', 10, 8, 44), 6.75, 0.22, z, false);
  for (const z of [-0.5, 3.6]) boxM(Cr, 1.6, 0.04, 0.5, LM({ color: '#fffbf0', emissive: '#fffbf0', emissiveIntensity: 1 }), 8.4, 3.19, z, false); const cl_ = new T3.PointLight('#fff4e0', 14, 10, 1.3); cl_.position.set(8.4, 2.8, 1.5); scene.add(cl_);
}

const SZ = 0.95; // seat z for you and bro
const head = p => { const v = new T3.Vector3(); p.userData.head.getWorldPosition(v); return [v.x, v.y + 0.12, v.z]; };
// camera plan per clip (fixed framings, gentle push-ins)
function camAt(T) { const ci = CLI(T), k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur);
  if (ci === 0) return T < E.screams - 0.05 ? [L3([2.2, 2.3, -4.6], [1.8, 2.1, -4.0], ease(k)), [0, 0.9, 1.0]] : [[-0.4, 1.28, -0.45], [0.4, 1.15, SZ]];
  if (ci === 1) return [[-0.35, 1.25, -0.3], [0.4, 1.15, SZ]];
  if (ci === 2) return [L3([-5.2, 2.4, -1.6], [-5.0, 2.3, -1.2], ease(k)), [0, 0.9, 0.6]];
  if (ci === 3 || ci === 7) { const h = head(R.you); return [[h[0] - 0.35, h[1] - 0.02, h[2] - 1.0 + 0.08 * k], h]; }
  if (ci === 4 || ci === 8) { const h = head(R.bro); return [[h[0] + 0.35, h[1] - 0.02, h[2] - 1.0 + 0.08 * k], h]; }
  if (ci === 5) return [[0.0, 1.2, -0.75 + 0.15 * k], [0, 1.05, SZ]];
  if (ci === 6 || ci === 9) return [[-0.12, 2.0 - 0.1 * k, SZ - 0.9], [-0.12, 0.5, SZ - 0.2]];
  if (ci === 10) { const h = head(R.teacher); return [[h[0] + 0.45, h[1] - 0.05, h[2] + 1.1 - 0.1 * k], h]; }
  if (ci === 11) return T < E.waves - 0.1 ? [L3([4.4, 2.3, -1.4], [4.2, 2.2, -1.0], ease(k)), [2.2, 0.9, 2.2]] : [[-0.9, 1.45, -0.6], [0.6, 1.2, SZ]];
  if (ci >= 13) return [[9.3, 1.3, 1.33], [6.75, 0.95, 1.33]];
  return [[9.3, 1.3, 1.33], [6.75, 0.95, 1.33]]; }
function anim(T) { const ci = CLI(T); const under = ci === 6 || ci === 9; R.myDesk.visible = !under; R.myBooks.forEach(b_ => b_.visible = !under); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData;
  seatP(you, 0.48); seatP(bro, 0.48); you.position.x = -0.4; you.position.z = SZ; bro.position.x = 0.4; bro.position.z = SZ; you.rotation.y = bro.rotation.y = PI; faceP(you, 'n'); faceP(bro, 'n'); you.visible = bro.visible = true;
  for (const p of [you, bro]) { p.userData.armL.rotation.x = -0.9; p.userData.armR.rotation.x = -0.9; }
  // the scream
  if (ci === 1 || (ci === 0 && T > E.screams - 0.05)) { faceP(bro, 'o'); bro.rotation.y = PI + 0.7; b.up.rotation.z = -0.25; b.armL.rotation.set(-1.2, 0, 1.3); b.armR.rotation.set(-1.2, 0, -1.3); b.armL.userData.e.rotation.x = -0.6; b.armR.userData.e.rotation.x = -0.6; faceP(you, 'S'); u.head.rotation.y = -0.5; }
  // the class turns round and stays turned for the argument
  R.kids.forEach((p, i) => { const tu = ci >= 2 && ci <= 11; const front = p.position.z < SZ - 0.1; p.userData.head.rotation.y = 0; p.rotation.y = PI; if (tu) { if (front) { p.rotation.y = PI - (p.position.x < 0 ? 1 : -1) * 1.0; p.userData.head.rotation.y = (p.position.x < 0 ? 1 : -1) * 0.9; } else p.userData.head.rotation.y = (p.position.x < 0 ? -1 : 1) * 0.6; faceP(p, i % 3 ? 'd' : 'o'); } else faceP(p, 'n'); p.userData.head.rotation.x = 0.06 * S(T * 0.7 + i); });
  if (ci >= 2 && ci <= 9) { faceP(bro, 'a'); bro.rotation.y = PI + 0.35; you.rotation.y = PI - 0.35; }
  if (ci === 3) { faceP(you, 'd'); u.head.rotation.y = -0.4; u.armL.rotation.set(-1.3, 0, 0.6); u.armL.userData.e.rotation.x = -0.5; }
  if (ci === 4) { faceP(bro, 'a'); if (T > E.soul - 0.1) { b.armR.rotation.set(-1.2, 0, 0.9); b.armR.userData.e.rotation.x = -1.6; b.head.rotation.x = -0.25; faceP(bro, 'o'); } }
  if (ci === 5) { faceP(bro, 's'); b.head.rotation.y = 0.5; b.head.rotation.x = -0.15; faceP(you, 'S'); u.head.rotation.y = -0.5; }
  // his hand on your thigh (desk top hidden for the lap shots)
  if (under) { for (const p of [you, bro]) { p.userData.armL.rotation.set(0.1, 0, 0); p.userData.armR.rotation.set(0.1, 0, 0); p.userData.armL.userData.e.rotation.set(0, 0, 0); p.userData.armR.userData.e.rotation.set(0, 0, 0); } u.armL.rotation.z = 0.15; b.armL.rotation.z = -0.15; you.rotation.y = bro.rotation.y = PI; }
  const handOn = (ci === 6 && T > E.hand - 0.2) || (ci >= 7 && ci <= 9); if (handOn) { const k = ci === 6 ? ease(prog(T, E.hand - 0.2, E.hand + 0.3)) : 1; const circ = (ci === 6 && T > E.circles - 0.1) || ci >= 7; if (under) { b.armR.rotation.set(-0.85 * k, 0, 0.7 * k); b.armR.userData.e.rotation.x = -0.2 * k; b.armR.userData.e.rotation.z = -0.2 * k; const hnd = b.armR.userData.e; hnd.rotation.y = circ ? 0.15 * S(T * 5) : 0; hnd.rotation.x += circ ? 0.08 * C(T * 5) : 0; } }
  if (ci === 7) { faceP(you, 'd'); u.head.rotation.x = 0.35; u.head.rotation.y = -0.2; }
  if (ci === 8) { faceP(bro, 's'); b.head.rotation.z = 0.15; b.head.rotation.y = 0.3; }
  // teacher
  const t_ = R.teacher; stillP(t_); t_.position.set(-1.8, 0, -5.3); t_.rotation.y = ci >= 2 ? 0.1 : PI; faceP(t_, ci >= 2 ? 'a' : 'n'); if (ci < 2) t_.userData.armR.rotation.set(-2.2 + 0.1 * S(T * 6), 0, 0);
  if (ci === 10) { t_.rotation.y = 0.15; t_.userData.armR.rotation.set(-1.6, 0, 0); if (T > AT(10, 'out') - 0.1) t_.userData.armR.rotation.set(-1.6, 0, -1.2); }
  if (ci === 11) { t_.rotation.y = 0.5; t_.userData.armR.rotation.set(-1.6, 0, -1.1); const w = prog(T, E.out, E.c12); stillP(you); you.position.set(lerp(-0.4, 5.6, w), 0, lerp(SZ + 0.4, 3.0, w)); you.rotation.y = PI / 2 + 0.25; walkP(you, T * 6, w > 0 && w < 1 ? 1 : 0); faceP(you, 'd');
    faceP(bro, 's'); bro.rotation.y = PI - 0.35; if (T > E.waves - 0.1) b.armL.rotation.set(-2.7 + 0.25 * S(T * 9), 0, 0.2); }
  // the corridor: you on the bench, then he gets sent out too and sits right next to you
  if (ci >= 12) { seatP(you, 0.48); you.position.x = 6.75; you.position.z = 1.0; you.rotation.y = PI / 2; faceP(you, 'd'); u.armL.rotation.x = -0.3; u.armR.rotation.x = -0.3;
    if (ci === 13 && T < E.sits) { const w = prog(T, E.c13 + 0.2, E.sits); stillP(bro); bro.position.set(lerp(6.6, 6.75, w), 0, lerp(3.0, 1.75, w)); bro.rotation.y = PI; walkP(bro, T * 6, 1); faceP(bro, 'n'); }
    else if (ci >= 13) { seatP(bro, 0.48); bro.position.x = 6.75; bro.position.z = 1.65; bro.rotation.y = PI / 2; faceP(bro, ci === 14 ? 'o' : 's'); b.armR.rotation.set(-1.0, 0, 0.3); b.armR.userData.e.rotation.x = 0.45; b.armR.userData.e.rotation.y = 0.15 * S(T * 5); if (ci === 14) faceP(you, 'S'); }
    else bro.visible = false; }
}
function shot(T) { camera.fov = 60; camera.updateProjectionMatrix(); anim(T); const c = camAt(T); look(c[0], c[1]);
  const ci = CLI(T); if (ci === 1 || ci === 14) { const k = ci === 1 ? 1 - prog(T, E.c1, E.c2) : 1; camera.position.x += 0.02 * k * S(T * 70); camera.rotation.z += 0.015 * k * S(T * 60); } return { si: 0, t0: 0 }; }
// ---------- captions only: small white, 2-3 words, mid-frame (house style) ----------
const TAGS = { 3: ['YOU', '#9ac8ff'], 4: ['BRO', '#8af0a0'], 7: ['YOU', '#9ac8ff'], 8: ['BRO', '#8af0a0'], 10: ['TEACHER', '#ffb07a'], 14: ['BRO', '#8af0a0'] };
const CAPS = []; CL.forEach((c0, ci) => { if (ci === 1) return; const who = TAGS[ci]; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' '), who }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: /^fucking$/i.test(w0.w) ? 'f***ing' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.9)'; if (c.who) { octx.font = '600 24px CapFont'; octx.strokeText(c.who[0], 360, 856); octx.fillStyle = c.who[1]; octx.fillText(c.who[0], 360, 856); octx.font = '600 46px CapFont'; } octx.strokeText(c.t, 360, 900); octx.fillStyle = c.who ? c.who[1] : '#ffffff'; octx.fillText(c.t, 360, 900); octx.restore(); }
function rules(T) { const k = ease(prog(T, E.c9 + 0.2, E.c9 + 0.45)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(250,246,236,0.97)'; octx.beginPath(); octx.roundRect(120, 190, 480, 230, 20); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); octx.fillStyle = '#111'; octx.font = '40px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('THE RULES', 360, 235);
  octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.fillStyle = '#c82a2a'; octx.fillText('✗  your leg touches his', 160, 300); if (T > AT(9, 'your') - 0.1) { octx.fillStyle = '#2a9a4a'; octx.fillText('✓  his hand on your thigh', 160, 360); } octx.restore(); }
function big(s_, y, size, col, a = 1, shake = 0) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.4 : 1; octx.translate(360 + shake * (Math.random() - 0.5) * 10, y + shake * (Math.random() - 0.5) * 10); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function ring(T, wp) { const v = wp.clone().project(camera); const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; const r = 70 + 8 * S(T * 8); octx.save(); octx.strokeStyle = '#ff3a3a'; octx.lineWidth = 7; octx.beginPath(); octx.arc(x, y, r, 0, PI * 2); octx.stroke(); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#c8c0a8'); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.03, 200); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = END;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.92)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 1) { big('STOP', 330, 120, '#ff3a2a', prog(T, E.c1, E.c1 + 0.08), 1); if (T > AT(1, 'touching') - 0.05) big('TOUCHING', 450, 92, '#ff3a2a', prog(T, AT(1, 'touching') - 0.05, AT(1, 'touching') + 0.05), 1); if (T > AT(1, 'me') - 0.05) big('ME!', 560, 120, '#ff3a2a', prog(T, AT(1, 'me') - 0.05, AT(1, 'me') + 0.05), 1); }
  if ((ci === 6 && T > E.hand + 0.2) || ci === 9) { const e = R.bro.userData.armR.userData.e; const v = new T3.Vector3(0, -0.3, 0); e.localToWorld(v); ring(T, v); }
  if (ci === 9) rules(T);
  if (ci === 12) { octx.fillStyle = '#0a0a10'; octx.fillRect(0, 0, W, H); big('5 MINUTES', 600, 72, '#ffd27a', 1); big('LATER', 680, 50, '#fff', 1); }
  if (ci === 14 && T > AT(14, 'stop') - 0.05) big('STOP TOUCHING M-', 330, 56, '#ff3a2a', prog(T, AT(14, 'stop') - 0.05, AT(14, 'stop') + 0.1), 1);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 1 && ci !== 12) caption(cap); };
})();
