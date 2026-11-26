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
function faceTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.skin, 18, 3); noisy(c, 16, 5, o.cap || o.hair, 20, 4); if (!o.cap) noisy(c, 2, 9, o.hair, 20, 5); if (o.hood) { noisy(c, 2, 16, o.top, 20, 6); noisy(c, 2, 16, o.top, 20, 6, 14); }
  c.fillStyle = '#f0ece4'; c.fillRect(4, 8, 3, 1); c.fillRect(9, 8, 3, 1); c.fillStyle = '#4a5a7a'; c.fillRect(5, 8, 1, 1); c.fillRect(10, 8, 1, 1); c.fillStyle = 'rgba(40,20,10,0.6)'; c.fillRect(4, 7, 3, 1); c.fillRect(9, 7, 3, 1); c.fillStyle = 'rgba(80,40,30,0.5)'; c.fillRect(6, 12, 4, 1); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(7, 9, 2, 2); }); }
function torsoTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.top, 24, 7); if (o.open) { noisy(c, 6, 16, o.open, 14, 8, 5); } if (o.tie) noisy(c, 2, 13, o.tie, 10, 9, 7); if (o.vest) { c.fillStyle = '#d8d8c8'; c.fillRect(0, 9, 16, 2); c.fillRect(4, 0, 2, 16); c.fillRect(10, 0, 2, 16); } if (o.cop) { c.fillStyle = '#c8a040'; c.fillRect(3, 4, 2, 2); c.fillStyle = '#111'; c.fillRect(0, 14, 16, 2); } if (o.hood) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(4, 9, 8, 4); } }); }
function person(o) { const g = new T3.Group(); const skin = PM(o.skin, 16, 8, 2), top = PM(o.top, 24, 8, 3), bot = PM(o.bot, 26, 8, 4), hair = PM(o.cap || o.hair, 20, 8, 5), shoe = PM('#2a2420', 16, 8, 6), sleeve = PM(o.sleeve || o.top, 22, 8, 7);
  const up = new T3.Group(); up.position.y = 0.95; g.add(up); boxM(up, 0.5, 0.62, 0.28, [top, top, top, top, LM({ map: torsoTex(o) }), top], 0, 0.31, 0);
  const head = new T3.Group(); head.position.y = 0.66; up.add(head); boxM(head, 0.32, 0.34, 0.32, [skin, skin, hair, skin, LM({ map: faceTex(o) }), hair], 0, 0.17, 0); if (o.cap) boxM(head, 0.34, 0.08, 0.36, hair, 0, 0.32, 0.03);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.33, 0.58, 0); up.add(s); boxM(s, 0.16, 0.34, 0.18, sleeve, 0, -0.17, 0); const e = new T3.Group(); e.position.y = -0.34; s.add(e); boxM(e, 0.15, 0.3, 0.17, o.sleeve ? sleeve : top, 0, -0.13, 0); boxM(e, 0.14, 0.1, 0.15, skin, 0, -0.32, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.13, 0.95, 0); g.add(h); boxM(h, 0.22, 0.46, 0.24, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.21, 0.42, 0.23, bot, 0, -0.21, 0); boxM(k, 0.22, 0.08, 0.32, shoe, 0, -0.45, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
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

function dinoTex(base, stripe, seed) { return PT(16, 16, (c) => { noisy(c, 16, 16, base, 28, seed); const r = rng(seed + 9); c.fillStyle = stripe; for (let i = 0; i < 10; i++) c.fillRect((r() * 16) | 0, (r() * 16) | 0, 1 + (r() * 3 | 0), 1); for (let y = 2; y < 16; y += 5) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, y, 16, 1); } }); }
function chain(parent, n, len0, w0, h0, taper, mat, dir, bend) { const segs = []; let p = parent; for (let i = 0; i < n; i++) { const k = 1 - taper * i / n; const g = new T3.Group(); g.position.set(0, 0, i === 0 ? 0 : dir * len0 * (1 - taper * (i - 1) / n)); p.add(g); boxM(g, w0 * k, h0 * k, len0 * k, mat, 0, 0, dir * len0 * k / 2); g.rotation.x = bend; segs.push(g); p = g; } return segs; }
function brachio() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a7258', '#4a523e', 41) }), belly = LM({ map: dinoTex('#8a8a6a', '#6a6a52', 42) });
  boxM(g, 6, 5.5, 12, [sk, sk, sk, belly, sk, sk], 0, 10.5, 0); const legs = []; for (const [x, z] of [[-2.2, 4], [2.2, 4], [-2.2, -4], [2.2, -4]]) { const l = new T3.Group(); l.position.set(x, 9, z); g.add(l); boxM(l, 1.9, 9, 1.9, sk, 0, -4.5, 0); boxM(l, 2.2, 0.6, 2.4, belly, 0, -8.8, 0.2); legs.push(l); }
  const nb = new T3.Group(); nb.position.set(0, 12, 5.5); g.add(nb); const neck = []; let p = nb; for (let i = 0; i < 9; i++) { const k = 1 - i * 0.06; const s = new T3.Group(); s.position.set(0, i ? 2.0 : 0, i ? 0.25 : 0); p.add(s); boxM(s, 1.9 * k, 2.2, 1.9 * k, sk, 0, 1.1, 0); s.rotation.x = i ? 0.03 : 0.55; neck.push(s); p = s; }
  const head = new T3.Group(); head.position.set(0, 2.2, 0.4); p.add(head); boxM(head, 1.5, 1.3, 2.6, sk, 0, 0.3, 0.7); boxM(head, 1.3, 0.4, 1.6, belly, 0, -0.4, 1.2); for (const sx of [-1, 1]) boxM(head, 0.1, 0.25, 0.25, LM({ color: '#111' }), sx * 0.76, 0.5, 1.2, false);
  const tb = new T3.Group(); tb.position.set(0, 11, -6); g.add(tb); const tail = chain(tb, 9, 2.4, 3.2, 2.6, 0.85, sk, -1, 0.05); tb.rotation.x = 0.25;
  g.userData = { legs, neck, head, tail }; return g; }
function trex() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#5a4a34', '#3a2e20', 51) }), belly = LM({ map: dinoTex('#8a7a5a', '#6a5a40', 52) }), teeth = PM('#e8e0c8', 10, 8, 53), mouth = PM('#5a1a1a', 14, 8, 54);
  const body = new T3.Group(); body.position.y = 6.2; g.add(body); boxM(body, 3.4, 3.6, 6.2, [sk, sk, sk, belly, sk, sk], 0, 0, 0);
  const neck = new T3.Group(); neck.position.set(0, 1.2, 3.0); body.add(neck); boxM(neck, 2.2, 2.4, 2.4, sk, 0, 0.4, 0.8); neck.rotation.x = -0.25;
  const head = new T3.Group(); head.position.set(0, 1.0, 2.0); neck.add(head); boxM(head, 2.2, 1.6, 3.8, sk, 0, 0.3, 1.5); boxM(head, 2.0, 0.2, 3.2, teeth, 0, -0.55, 1.7); for (const sx of [-1, 1]) { boxM(head, 0.12, 0.3, 0.4, LM({ color: '#e8b020', emissive: '#6a4a00', emissiveIntensity: 0.6 }), sx * 1.11, 0.7, 1.0, false); boxM(head, 0.3, 0.3, 0.6, sk, sx * 0.85, 1.15, 0.9); }
  const jaw = new T3.Group(); jaw.position.set(0, -0.5, 0.2); head.add(jaw); boxM(jaw, 1.9, 0.7, 3.4, [sk, sk, mouth, belly, sk, sk], 0, -0.3, 1.5); boxM(jaw, 1.8, 0.18, 3.0, teeth, 0, 0.1, 1.6);
  for (const sx of [-1, 1]) { const a = new T3.Group(); a.position.set(sx * 1.5, -0.6, 2.4); body.add(a); boxM(a, 0.3, 1.1, 0.35, sk, 0, -0.5, 0.2).rotation.x = -0.6; }
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 1.6, -0.6, -0.4); body.add(hip); boxM(hip, 1.4, 3.4, 2.0, sk, 0, -1.5, 0.2); const kn = new T3.Group(); kn.position.set(0, -3.0, 0.5); hip.add(kn); boxM(kn, 0.9, 2.8, 1.0, sk, 0, -1.3, -0.4).rotation.x = 0.3; boxM(kn, 1.2, 0.5, 1.8, belly, 0, -2.7, 0.0); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.6, -3.0); body.add(tb); const tail = chain(tb, 7, 1.9, 2.6, 2.4, 0.85, sk, -1, 0.04); tb.rotation.x = -0.1;
  g.userData = { body, neck, head, jaw, legs, tail }; return g; }
function raptor(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex(['#7a6a48', '#6a5a3a', '#5a6a48'][seed % 3], '#3a2e1e', 60 + seed) }), mouth = PM('#5a1a1a', 14, 8, 64);
  const body = new T3.Group(); body.position.y = 1.35; g.add(body); boxM(body, 0.7, 0.8, 1.6, sk, 0, 0, 0); const neck = new T3.Group(); neck.position.set(0, 0.35, 0.75); body.add(neck); boxM(neck, 0.4, 0.8, 0.4, sk, 0, 0.35, 0.1).rotation.x = 0.4;
  const head = new T3.Group(); head.position.set(0, 0.8, 0.35); neck.add(head); boxM(head, 0.45, 0.4, 0.9, sk, 0, 0, 0.3); const jaw = new T3.Group(); jaw.position.set(0, -0.15, 0); head.add(jaw); boxM(jaw, 0.4, 0.15, 0.8, [sk, sk, mouth, sk, sk, sk], 0, -0.08, 0.3); for (const sx of [-1, 1]) boxM(head, 0.05, 0.08, 0.08, LM({ color: '#e8c020', emissive: '#e8a000', emissiveIntensity: 1 }), sx * 0.23, 0.08, 0.35, false);
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 0.3, -0.2, 0); body.add(hip); boxM(hip, 0.3, 0.7, 0.45, sk, 0, -0.3, 0.1); const kn = new T3.Group(); kn.position.set(0, -0.6, 0.1); hip.add(kn); boxM(kn, 0.2, 0.6, 0.22, sk, 0, -0.3, -0.15).rotation.x = 0.4; boxM(kn, 0.3, 0.12, 0.45, sk, 0, -0.58, 0.05); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.1, -0.8); body.add(tb); const tail = chain(tb, 6, 0.42, 0.45, 0.4, 0.8, sk, -1, 0.02); g.userData = { body, head, jaw, legs, tail }; return g; }
function ptero(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a5040', '#4a3828', 70 + seed) }), mem = LM({ map: dinoTex('#8a6048', '#6a4030', 75 + seed), side: T3.DoubleSide });
  boxM(g, 0.5, 0.45, 1.6, sk, 0, 0, 0); boxM(g, 0.3, 0.3, 1.4, sk, 0, 0.15, 1.3); boxM(g, 0.12, 0.5, 0.9, sk, 0, 0.4, 0.5).rotation.x = 0.5; const wings = []; for (const sx of [-1, 1]) { const w = new T3.Group(); w.position.set(sx * 0.25, 0.1, 0.2); g.add(w); boxM(w, 2.6, 0.08, 1.1, mem, sx * 1.3, 0, 0); const w2 = new T3.Group(); w2.position.set(sx * 2.6, 0, 0); w.add(w2); boxM(w2, 2.2, 0.06, 0.8, mem, sx * 1.1, 0, -0.1); w.userData.t = w2; wings.push(w); }
  g.userData = { wings }; return g; }
function walkDino(d, ph, a, kind) { const u = d.userData; if (kind === 'b') { u.legs.forEach((l, i) => l.rotation.x = S(ph + (i === 0 || i === 3 ? 0 : PI)) * 0.22 * a); u.neck.forEach((s, i) => { if (i) s.rotation.z = 0.02 * S(ph * 0.5 + i * 0.3); }); u.tail.forEach((s, i) => s.rotation.y = 0.06 * S(ph * 0.5 - i * 0.4)); }
  else { u.legs.forEach((l, i) => { const s = S(ph + i * PI); l.rotation.x = s * 0.5 * a; l.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; }); u.body.position.y = (kind === 't' ? 6.2 : 1.35) + Math.abs(C(ph)) * (kind === 't' ? 0.25 : 0.08) * a; u.tail.forEach((s, i) => s.rotation.y = 0.08 * S(ph - i * 0.5)); } }

// ---------- timing ----------
const E = { out: AT(0, 'the'), hours: AT(0, 'four'), c1: CL[1].start, c2: CL[2].start, pumps: AT(2, 'the'), fill: AT(2, 'fill'), c3: CL[3].start, month: AT(3, "that's"), c4: CL[4].start, keep: AT(4, 'keep'), closed: AT(4, 'closed'), freezer: AT(4, 'a', 1),
  c5: CL[5].start, tins: AT(5, 'save'), c6: CL[6].start, low: AT(6, 'low'), torch: AT(6, 'torch'), c7: CL[7].start, slam: AT(7, 'slams'), peep: AT(7, 'through'), c8: CL[8].start, optB: AT(8, 'option', 1), comment: AT(8, 'comment') };
E.loop = TM.total - 0.4;
const AY = 18; // apartment floor height above the street
// ---------- build ----------
function build() {
  R.moon = new T3.DirectionalLight('#8aa0e8', 1.6); R.moon.position.set(-20, 60, -80); scene.add(R.moon); scene.add(R.moon.target); R.moon.target.position.set(0, AY, 0);
  R.hemi = new T3.HemisphereLight('#6a7ab0', '#3a3440', 1.8); scene.add(R.hemi);
  const sky = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0e1e'); g.addColorStop(0.46, '#1e2440'); g.addColorStop(0.52, '#4a2a2a'); g.addColorStop(0.56, '#2a2028'); g.addColorStop(1, '#0a0a10'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  add(scene, Sp(1500, 24, 12), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  // ---- city outside (dark, a few generators, fires) ----
  const C_ = R.C = new T3.Group(); scene.add(C_); boxM(C_, 600, 0.1, 600, PM('#1a1a1e', 10, 16, 1), 0, 0, -200, false); const rs = rng(23);
  for (let i = 0; i < 46; i++) { const x = -160 + rs() * 320, z = -40 - rs() * 260, w = 12 + rs() * 16, h = 15 + rs() * 80; if (Math.abs(x) < 8 && z > -50) continue; tower(C_, x, z, w, h, w, ['#3a3a42', '#34363e', '#40403e'][(rs() * 3) | 0], 0.05, 500 + i); }
  for (let i = 0; i < 18; i++) { const x = -100 + rs() * 200, z = -50 - rs() * 200; const l = spr(C_, GLOW, '#ff7a2a', 18 + rs() * 22, x, 4, z, 0.9); l.material.fog = false; R.fires = R.fires || []; R.fires.push(l); }
  R.fireL = new T3.PointLight('#ff6a2a', 0, 200, 1); R.fireL.position.set(-30, 20, -90); scene.add(R.fireL);
  R.brach = brachio(); R.brach.position.set(-40, 0, -150); R.brach.rotation.y = PI / 2; C_.add(R.brach); R.pteros = []; for (let i = 0; i < 5; i++) { const p = ptero(i); p.scale.setScalar(2.4); C_.add(p); R.pteros.push(p); }
  // ---- apartment ----
  const A = R.A = new T3.Group(); A.position.y = AY; scene.add(A); const wall = PM('#8a8478', 14, 16, 30), wood = PM('#6a4a32', 22, 16, 31), tile = PM('#c8c8c0', 14, 16, 32), dark = PM('#2a2a2e', 12, 8, 33);
  boxM(A, 8.2, 0.12, 8.2, wood, 0, -0.06, 0); boxM(A, 8.2, 0.1, 8.2, PM('#9a948a', 12, 16, 34), 0, 2.85, 0, false);
  boxM(A, 0.12, 2.9, 8.2, wall, -4.1, 1.45, 0); boxM(A, 8.2, 2.9, 0.12, wall, 0, 1.45, 4.1);
  // back wall with a big window (z = -4.1)
  boxM(A, 1.6, 2.9, 0.12, wall, -3.3, 1.45, -4.1); boxM(A, 1.6, 2.9, 0.12, wall, 3.3, 1.45, -4.1); boxM(A, 5, 0.8, 0.12, wall, 0, 0.4, -4.1); boxM(A, 5, 0.4, 0.12, wall, 0, 2.7, -4.1);
  for (const x of [-2.5, 0, 2.5]) boxM(A, 0.12, 1.7, 0.16, dark, x, 1.65, -4.1); boxM(A, 5, 0.12, 0.16, dark, 0, 0.8, -4.1); boxM(A, 5, 0.12, 0.16, dark, 0, 2.5, -4.1);
  // fire escape outside the window
  const iron = PM('#2a2a2c', 12, 8, 35); boxM(A, 5.2, 0.08, 1.2, iron, 0, 0.0, -4.8, false); for (let i = 0; i < 9; i++) boxM(A, 0.05, 1.0, 0.05, iron, -2.5 + i * 0.62, 0.5, -5.38, false); boxM(A, 5.2, 0.06, 0.06, iron, 0, 1.0, -5.38, false); for (let k = 0; k < 8; k++) boxM(A, 0.9, 0.05, 0.05, iron, 2.2, 0.35 + k * 0.4, -5.3, false); for (const x of [1.78, 2.62]) boxM(A, 0.06, 3.4, 0.06, iron, x, 1.6, -5.3, false);
  // right wall with bathroom doorway (x = 4.1, gap z -0.6..0.6) and the front door on the near wall
  boxM(A, 0.12, 2.9, 3.4, wall, 4.1, 1.45, -2.4); boxM(A, 0.12, 2.9, 3.4, wall, 4.1, 1.45, 2.4); boxM(A, 0.12, 0.7, 1.2, wall, 4.1, 2.55, 0);
  // bathroom
  boxM(A, 3.4, 0.12, 4.2, tile, 5.8, -0.05, -0.4); boxM(A, 0.12, 2.9, 4.2, PM('#b8b8b0', 10, 16, 36), 7.5, 1.45, -0.4); boxM(A, 3.4, 2.9, 0.12, PM('#b8b8b0', 10, 16, 36), 5.8, 1.45, -2.5); boxM(A, 3.4, 2.9, 0.12, PM('#b8b8b0', 10, 16, 36), 5.8, 1.45, 1.7);
  const bathM = PM('#e8e8e0', 8, 16, 37); boxM(A, 1.9, 0.08, 0.9, bathM, 6.4, 0.04, -2.0); for (const sz of [-1, 1]) boxM(A, 1.9, 0.62, 0.1, bathM, 6.4, 0.31, -2.0 + sz * 0.4); for (const sx of [-1, 1]) boxM(A, 0.1, 0.62, 0.9, bathM, 6.4 + sx * 0.9, 0.31, -2.0); R.water = boxM(A, 1.7, 0.02, 0.7, LM({ color: '#4a7ab8', transparent: true, opacity: 0.75, emissive: '#1a2a40', emissiveIntensity: 0.4 }), 6.4, 0.1, -2.0, false);
  boxM(A, 0.12, 0.3, 0.12, PM('#c8ccd2', 8, 8, 38), 7.25, 0.85, -2.0); R.spout = boxM(A, 0.3, 0.06, 0.08, PM('#c8ccd2', 8, 8, 38), 7.1, 0.95, -2.0); R.tapH = boxM(A, 0.14, 0.05, 0.05, PM('#c83a2a', 8, 8, 39), 7.25, 1.05, -1.85);
  R.stream = boxM(A, 0.05, 1, 0.05, LM({ color: '#8ab8e8', transparent: true, opacity: 0.8, emissive: '#3a5a8a', emissiveIntensity: 0.5 }), 6.98, 0.5, -2.0, false);
  const tankT = PT(16, 32, (c) => { noisy(c, 16, 32, '#e0dcd2', 10, 40); c.fillStyle = '#c82a2a'; c.fillRect(2, 12, 12, 7); c.fillStyle = '#fff'; c.font = '6px monospace'; c.fillText('150L', 2, 18); }); const tk = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.4, 1.7, 10), LM({ map: tankT })); tk.position.set(7.0, 0.85, 1.1); tk.rotation.y = -PI / 2; A.add(tk); boxM(A, 0.16, 0.08, 0.16, PM('#c8a040', 8, 8, 41), 6.6, 0.15, 1.1);
  // kitchen (left wall): counter, fridge, fresh food, tins on a shelf
  boxM(A, 0.75, 0.92, 3.2, PM('#5a4a3a', 18, 16, 42), -3.65, 0.46, 0.2); boxM(A, 0.8, 0.06, 3.3, PM('#b8b0a0', 12, 16, 43), -3.62, 0.95, 0.2);
  const frT = PT(16, 32, (c) => { noisy(c, 16, 32, '#d8d8d4', 8, 44); c.fillStyle = '#7a7a78'; c.fillRect(0, 11, 16, 1); c.fillRect(13, 3, 1, 6); c.fillRect(13, 15, 1, 12); }); const frM = LM({ map: frT }); R.fridge = boxM(A, 0.85, 2.0, 0.85, [frM, frM, frM, frM, frM, frM], -3.62, 1.0, 2.35);
  R.fresh = []; const apple = PM('#b8302a', 18, 8, 45), bread = PM('#c8904a', 18, 8, 46), milk = PM('#e8e8e4', 10, 8, 47); for (const [m, x, z, w, h, d] of [[bread, -3.6, -0.6, 0.35, 0.18, 0.5], [milk, -3.65, 0.0, 0.18, 0.4, 0.18], [apple, -3.55, 0.35, 0.12, 0.12, 0.12], [apple, -3.7, 0.5, 0.12, 0.12, 0.12], [apple, -3.5, 0.6, 0.12, 0.12, 0.12]]) R.fresh.push(boxM(A, w, h, d, m, x, 0.98 + h / 2, z));
  const shelf = PM('#6a5240', 18, 8, 48); for (const y of [1.3, 1.75]) boxM(A, 0.4, 0.05, 1.6, shelf, -3.85, y, -2.4); R.tins = []; const tinT = PT(16, 8, (c) => { noisy(c, 16, 8, '#a8a8a0', 12, 49); noisy(c, 16, 4, '#c8402a', 18, 50, 0, 2); }); for (let i = 0; i < 10; i++) { const tn = new T3.Mesh(new T3.CylinderGeometry(0.08, 0.08, 0.2, 8), LM({ map: tinT })); tn.position.set(-3.85, (i < 5 ? 1.43 : 1.88), -3.0 + (i % 5) * 0.3); A.add(tn); R.tins.push(tn); }
  // living room: sofa, table, front door
  const sofa = PM('#4a5a6a', 20, 16, 51); R.sofa = new T3.Group(); R.sofa.position.set(1.0, 0, 2.6); A.add(R.sofa); boxM(R.sofa, 2.4, 0.45, 0.9, sofa, 0, 0.32, 0); boxM(R.sofa, 2.4, 0.6, 0.25, sofa, 0, 0.75, 0.35); for (const sx of [-1, 1]) boxM(R.sofa, 0.25, 0.55, 0.9, sofa, sx * 1.2, 0.5, 0);
  R.door = new T3.Group(); R.door.position.set(3.2, 0, 4.04); A.add(R.door); boxM(R.door, 1.0, 2.1, 0.08, PM('#5a3a28', 20, 16, 52), -0.5, 1.05, 0); boxM(R.door, 0.05, 0.05, 0.1, PM('#c8a040'), -0.5, 1.6, -0.02); boxM(R.door, 0.06, 0.12, 0.1, PM('#c8a040'), -0.88, 1.0, -0.06);
  boxM(A, 1.0, 0.7, 0.6, PM('#3a2a20', 18, 8, 53), -1.0, 0.35, -1.0);
  // corridor outside the front door (seen through the peephole), red emergency light
  const H = R.H = new T3.Group(); H.position.set(2.7, AY, 4.2); scene.add(H); boxM(H, 3, 0.1, 10, PM('#4a3a34', 18, 16, 54), 0, -0.05, 5); boxM(H, 0.1, 2.9, 10, PM('#7a6a5a', 14, 16, 55), -1.5, 1.45, 5); boxM(H, 0.1, 2.9, 10, PM('#7a6a5a', 14, 16, 55), 1.5, 1.45, 5); boxM(H, 3, 0.1, 10, PM('#5a5048', 10, 16, 56), 0, 2.9, 5);
  R.emer = new T3.PointLight('#ff3a2a', 30, 12, 1.0); const hl_ = new T3.PointLight('#ffe0b0', 12, 8, 1.2); hl_.position.set(0, 2.4, 1.0); H.add(hl_); R.emer.position.set(0, 2.6, 4); H.add(R.emer); R.rap = raptor(1); R.rap.position.set(0.1, 0, 2.4); R.rap.rotation.y = PI; H.add(R.rap);
  // first-person hands (blocky, pixel hoodie sleeves) + phone with torch
  R.vm = new T3.Group(); camera.add(R.vm); const slv = PM('#4a5a4a', 22, 8, 60), skin = PM('#d8a07c', 14, 8, 61);
  const vmArm = () => { const a = new T3.Group(); R.vm.add(a); boxM(a, 0.11, 0.11, 0.42, slv, 0, 0, 0.16, false); const h = new T3.Group(); h.position.z = -0.08; a.add(h); boxM(h, 0.1, 0.05, 0.12, skin, 0, 0, -0.03, false); boxM(h, 0.1, 0.04, 0.07, skin, 0, -0.005, -0.12, false); boxM(h, 0.035, 0.035, 0.06, skin, -0.06, 0.01, -0.06, false); a.userData.h = h; return a; };
  R.hR = vmArm(); R.hL = vmArm(); R.hR.scale.setScalar(0.62); R.hL.scale.set(-0.62, 0.62, 0.62);
  R.phTex = ctex(64, 128, () => {}); R.phTex.magFilter = T3.NearestFilter; R.phone = new T3.Group(); camera.add(R.phone); R.phone.position.set(0.02, -0.075, -0.3); R.phone.rotation.x = PI / 2 - 0.25; boxM(R.phone, 0.08, 0.008, 0.15, PM('#1a1a1e'), 0, 0, 0, false); R.phScr = boxM(R.phone, 0.07, 0.002, 0.135, BM('#ffffff', { map: R.phTex }), 0, 0.005, 0, false);
  R.torch = new T3.SpotLight('#fff4e0', 0, 14, 0.5, 0.7, 1.6); R.torch.position.set(0.15, -0.15, 0); camera.add(R.torch); R.torchT = new T3.Object3D(); R.torchT.position.set(0.05, -0.2, -5); camera.add(R.torchT); R.torch.target = R.torchT;
  R.fridgeLED = boxM(A, 0.04, 0.04, 0.02, BM('#5aff8a'), -3.18, 1.85, 2.35, false);
}
function drawPhone(pct, low) { const c = R.phTex.userData.g; c.fillStyle = '#0a0a10'; c.fillRect(0, 0, 64, 128); c.fillStyle = low ? '#e8c020' : '#e83a2a'; c.fillRect(14, 30, Math.round(36 * pct / 100) + 2, 16); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(12, 28, 40, 20); c.fillStyle = '#fff'; c.font = 'bold 16px monospace'; c.textAlign = 'center'; c.fillText(pct + '%', 32, 70); c.font = '9px monospace'; c.fillText(low ? 'LOW POWER' : '', 32, 92); c.fillText(low ? 'ON' : '', 32, 104); R.phTex.needsUpdate = true; }

// ---------- shots (first person, eye height 1.65) ----------
const P = (x, y, z) => [x, AY + y, z];
function fp(p, l, T, bob = 0) { const br = S(T * 1.6) * 0.006, b = bob ? Math.abs(S(T * 8)) * 0.04 * bob : 0, bx = bob ? S(T * 4) * 0.025 * bob : 0; look([p[0] + bx, p[1] + br + b, p[2]], [l[0], l[1] + br * 3 + b * 0.5, l[2]]); }
const L3_ = (a, b, k) => L3(a, b, ease(k));
const SH = [
  [0, (k, T) => fp(P(-1.6, 1.65, 1.6), L3_(P(-3.2, 1.4, 2.35), P(-3.4, 1.3, 2.35), k), T)],
  [E.c1, (k, T) => fp(L3_(P(-0.4, 1.65, 0.8), P(0.1, 1.65, -3.0), prog(k, 0, 0.6)), P(-10, 12, -80), T, k < 0.6 ? 1 : 0)],
  [E.c2, (k, T) => fp(L3_(P(3.0, 1.65, 0.2), P(5.0, 1.75, -0.2), prog(k, 0, 0.35)), L3_(P(6.0, 1.2, -1.2), P(6.6, 0.45, -2.0), prog(k, 0.3, 0.7)), T, k < 0.35 ? 1 : 0)],
  [E.c3, (k, T) => fp(L3_(P(5.0, 1.65, -0.6), P(5.2, 1.6, -0.3), k), L3_(P(6.9, 1.0, 1.0), P(7.0, 1.0, 1.1), k), T)],
  [E.c4, (k, T) => fp(L3_(P(-1.0, 1.65, 1.0), P(-2.4, 1.6, 2.0), prog(k, 0, 0.3)), P(-3.4, 1.25, 2.35), T, k < 0.3 ? 1 : 0)],
  [E.c5, (k, T) => fp(P(-2.5, 1.6, 0.2), T < E.tins - 0.1 ? P(-3.6, 1.0, 0.1) : P(-3.85, 1.6, -2.4), T)],
  [E.c6, (k, T) => fp(P(-1.0, 1.65, 0.6), P(-0.6, 0.9, -1.6), T)],
  [E.c7, (k, T) => { const k2 = ease(prog(T, E.slam, E.slam + 0.4)); fp(P(-1.0, 1.65, 0.6), T < E.slam ? P(-0.6, 0.9, -1.6) : L3(P(1.5, 1.5, 0), P(2.7, 1.4, 4.1), k2), T); }],
  [E.peep - 0.05, (k, T) => { const h = R.H.position; camera.fov = 98; look([h.x, h.y + 1.6, h.z + 0.02], [h.x + 0.1, h.y + 1.0, h.z + 3]); }],
  [E.c8, (k, T) => fp(P(1.8, 1.65, 1.6), P(2.6, 1.2, 4.1), T)],
  [E.optB - 0.1, (k, T) => fp(P(0.4, 1.65, -1.6), P(0.6, 1.4, -6), T)],
  [E.comment - 0.1, (k, T) => fp(P(0.0, 1.65, 1.0), P(0.0, 1.5, -6), T)],
  [E.loop, (k, T) => fp(P(-1.6, 1.65, 1.6), P(-3.2, 1.4, 2.35), T)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
let PHK = '';
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  // outside: fires flicker, pterosaurs circle, the long neck walks
  R.fires.forEach((f, i) => f.material.opacity = 0.6 + 0.3 * S(T * 7 + i * 3)); R.fireL.intensity = 4 + 1.5 * S(T * 5);
  R.brach.position.x = -40 + T * 1.6; walkDino(R.brach, T * 1.6, 1, 'b'); R.pteros.forEach((p, i) => { const a = T * 0.3 + i * 1.3; p.position.set(S(a) * 40 - 10, 60 + i * 6, -110 + C(a) * 30); p.rotation.set(0, a + PI / 2, -0.3); p.userData.wings.forEach((w, j) => w.rotation.z = (j ? -1 : 1) * S(T * 4 + i) * 0.5); });
  // water: tap runs from "fill", bath rises
  const run = !loop && (ci === 2 && T > E.fill - 0.1 || ci === 3); R.stream.visible = run; R.tapH.rotation.y = run ? 1.2 : 0; const lvl = ci === 2 ? prog(T, E.fill, E.c3) * 0.35 : ci > 2 && !loop ? 0.35 + (ci === 3 ? prog(T, E.c3, E.c4) * 0.12 : 0.12) : 0; R.water.position.y = 0.1 + lvl; R.stream.scale.y = 0.85 - lvl; R.stream.position.y = 0.95 - (0.85 - lvl) / 2;
  // fridge LED off (power out); fresh food gets eaten
  R.fridgeLED.visible = false; R.fresh.forEach((f, i) => f.visible = !(ci === 5 && i === 2 && T > AT(5, 'eat') + 0.6 || ci > 5 && i === 2 && !loop));
  // front door slams
  const sl = ci === 7 && T > E.slam ? Math.max(0, 1 - (T - E.slam) / 0.5) : 0; R.door.rotation.y = -0.03 * sl * S(T * 60); R.door.position.z = 4.04 - 0.03 * sl;
  // raptor in the corridor
  R.rap.visible = ci === 7 && T >= E.peep - 0.05; if (R.rap.visible) { walkDino(R.rap, T * 2, 0.2, 'r'); R.rap.userData.jaw.rotation.x = 0.4 + 0.2 * S(T * 9); R.rap.userData.head.rotation.y = 0.3 * S(T * 2.2); } R.emer.intensity = 4 + 3 * (Math.floor(T * 3) % 2);
  // torch: on until "torch off", back on at the slam
  const torchOn = !loop && !(ci === 6 && T > E.torch + 0.1) && !(ci === 7 && T < E.slam + 0.2) && ci !== 8 || loop; R.torch.intensity = torchOn && !(ci === 7 && T >= E.peep - 0.05) ? 7 : 0;
  // hands
  const hr = R.hR, hl = R.hL; hr.visible = hl.visible = false; R.phone.visible = false; if (loop) { hr.visible = true; hr.position.set(0.1, -0.2, -0.4); hr.rotation.set(0.25, 0, 0); return; }
  if (ci <= 1 || ci === 4 || ci === 7 && T < E.peep - 0.05) { hr.visible = true; const s = S(T * 8) * (ci === 1 ? 1 : 0.2); hr.position.set(0.1, -0.2 + s * 0.02, -0.4); hr.rotation.set(0.25, 0, 0); }
  if (ci === 2 && T > E.fill - 0.4) { hl.visible = true; const r_ = ease(prog(T, E.fill - 0.4, E.fill)); hl.position.set(-0.06 + 0.06 * r_, -0.17 + 0.03 * r_, -0.34 - 0.1 * r_); hl.rotation.set(0.6 - 0.5 * r_, -0.3, 0.5 * r_); }
  if (ci === 4) { hl.visible = true; const reach = ease(prog(T, E.c4 + 0.6, E.keep)) * (1 - ease(prog(T, E.keep, E.keep + 0.4))); hl.position.set(-0.07, -0.16 + 0.05 * reach, -0.34 - 0.18 * reach); hl.rotation.set(0.3 - 0.2 * reach, -0.4, 0.2); }
  if (ci === 5 && T < E.tins - 0.1) { hl.visible = true; const g_ = ease(prog(T, AT(5, 'eat'), AT(5, 'eat') + 0.6)); hl.position.set(-0.06, -0.17 + 0.04 * g_, -0.34 - 0.12 * g_); hl.rotation.set(0.4, -0.3, 0.1); }
  if (ci === 6) { R.phone.visible = true; hr.visible = false; hl.visible = true; const tap = T > E.low - 0.15 && T < E.low + 0.15 || T > E.torch - 0.1 && T < E.torch + 0.2; hl.position.set(-0.075 + (tap ? 0.02 : 0), -0.15 + (tap ? 0.02 : 0), -0.3); hl.rotation.set(0.7, -0.5, 0); }
  const pct = 12, low = !loop && (ci === 6 && T > E.low || ci > 6); const k_ = pct + (low ? 'L' : ''); if (k_ !== PHK) { drawPhone(pct, low); PHK = k_; } }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 66; anim(T); sh[1](prog(T, t0, t1), T); camera.updateProjectionMatrix();
  const ci = T >= E.loop ? 0 : CLI(T); if (ci === 7 && T > E.slam && T < E.slam + 0.4) { const k = 1 - (T - E.slam) / 0.4; camera.position.x += 0.04 * k * S(T * 80); camera.rotation.z += 0.02 * k * S(T * 70); } return { si, t0 }; }
// ---------- captions ----------
const NUMW = { four: '4', twelve: '12' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; c.t = c.t.replace(/hundred and fifty/i, '150'); });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1080); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 1080); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.92)'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function fact(T, t0, l1, l2, col = '#5ad8ff') { const a = ease(prog(T, t0 - 0.1, t0 + 0.15)); if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(8,10,18,0.86)'; octx.beginPath(); octx.roundRect(110, 400, 500, l2 ? 150 : 100, 18); octx.fill(); octx.strokeStyle = col; octx.lineWidth = 3; octx.stroke(); octx.fillStyle = col; octx.beginPath(); octx.roundRect(130, 384, 110, 34, 17); octx.fill(); txt('FACT', 185, 402, 22, '#0a0a10'); txt(l1, 360, 452, 40, '#fff'); if (l2) txt(l2, 360, 505, 30, col, 'CapFont'); octx.restore(); }
function hud(T, ci) { const loop = T >= E.loop; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.82)'; octx.beginPath(); octx.roundRect(24, 36, 270, 62, 31); octx.fill(); octx.strokeStyle = '#6ad85a'; octx.lineWidth = 3; octx.stroke(); txt('SURVIVE . PART 1', 159, 68, 26, '#9af08a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.82)'; octx.beginPath(); octx.roundRect(486, 36, 210, 62, 31); octx.fill(); txt('DAY 4 . 9:42 PM', 591, 68, 22, '#ffd27a'); octx.restore();
  const items = [['WATER', loop || ci >= 3 ? 1 : 0], ['FOOD', loop || ci >= 5 && !(ci === 5 && T < E.tins) ? 1 : 0], ['POWER', loop || ci >= 6 && (ci > 6 || T > E.low) ? 1 : 0]]; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 112, 180, 168, 16); octx.fill(); txt('SUPPLIES', 114, 136, 20, '#9a9aa8', 'CapFont');
  items.forEach(([s_, d], i) => { txt(d ? '✓' : '□', 50, 176 + i * 40, 26, d ? '#5ad88a' : '#9a9aa8'); txt(s_, 76, 177 + i * 40, 24, d ? '#fff' : '#9a9aa8', 'Russo', 'left'); }); octx.restore();
  if (ci === 0 || loop) { const left = loop ? 4 * 3600 : Math.max(0, 4 * 3600 - Math.floor(T * 37)); const hh = Math.floor(left / 3600), mm = Math.floor(left / 60) % 60, ss = left % 60; octx.save(); octx.fillStyle = 'rgba(120,0,0,0.88)'; octx.beginPath(); octx.roundRect(470, 112, 226, 70, 18); octx.fill(); txt('FRIDGE', 583, 132, 18, '#ffb0a0', 'CapFont'); txt(`${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 583, 160, 32, '#fff'); octx.restore(); } }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#141a2a', 40, 330); camera = new T3.PerspectiveCamera(66, 360 / 640, 0.03, 3000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.9)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const peep = ci === 7 && T >= E.peep - 0.05; if (peep) { octx.save(); octx.fillStyle = '#000'; octx.beginPath(); octx.rect(0, 0, W, H); octx.arc(360, 600, 330, 0, PI * 2, true); octx.fill('evenodd'); const g = octx.createRadialGradient(360, 600, 200, 360, 600, 335); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); octx.fillStyle = g; octx.beginPath(); octx.arc(360, 600, 335, 0, PI * 2); octx.fill(); octx.restore(); }
  else { const vg = octx.createRadialGradient(360, 640, 380, 360, 640, 880); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  if (ci === 7 && T > E.slam && T < E.slam + 0.12) { octx.fillStyle = 'rgba(255,255,255,0.25)'; octx.fillRect(0, 0, W, H); }
  hud(T, ci);
  if (ci === 0 || loop) { big("DON'T OPEN", 420, 74, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15)); big('YOUR FRIDGE', 500, 56, '#fff', loop ? 1 : prog(T, 0.3, 0.5)); }
  if (ci === 1) big('THE CITY IS DARK', 420, 50, '#ffd27a', prog(T, AT(1, 'the') - 0.1, AT(1, 'the') + 0.1));
  if (ci === 2) fact(T, E.pumps, 'TAPS NEED PUMPS', 'no power = no water pressure');
  if (ci === 3) { fact(T, AT(3, 'hundred'), 'TANK = 150 L', T > E.month - 0.1 ? '4 L a day = 37 days' : ''); }
  if (ci === 4) fact(T, E.closed, T < E.freezer - 0.1 ? 'FRIDGE: 4 HOURS' : 'FREEZER: 48 HOURS', 'if you keep it shut', '#ffd27a');
  if (ci === 5) fact(T, AT(5, 'eat'), T < E.tins - 0.1 ? 'FRESH FOOD FIRST' : 'TINS LAST FOR YEARS', '', '#6ad85a');
  if (ci === 6) fact(T, E.low, 'LOW POWER MODE', T > E.torch - 0.1 ? 'torch only when needed' : 'stretch every %', '#ffd27a');
  if (ci === 7 && !peep && T > E.slam - 0.05) big('BANG', 430, 96, '#ff4a3a', prog(T, E.slam - 0.05, E.slam + 0.1));
  if (ci === 8 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. BARRICADE' : 'B. THE ROOF', 400, 64, A ? '#ff9a5a' : '#5ad8ff', 1); big(A ? 'GUARD YOUR SUPPLIES' : 'OUT THE WINDOW', 470, 36, '#fff', 1); } else big('COMMENT A OR B', 430, 62, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
