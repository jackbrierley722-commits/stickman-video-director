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


// ===================== ROBLOX-STYLE BLOCKY CHARACTERS + PLASTIC WORLD =====================
const PL = (c, r = 0.38) => new T3.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
function faceDecal(ex) { return ctex(128, 112, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#141414'; const eye = (x, y, sx = 1, sy = 1) => { c.beginPath(); c.ellipse(x, y, 7 * sx, 10 * sy, 0, 0, 7); c.fill(); };
  if (ex === 'side') { eye(44, 42); eye(84, 42); c.fillStyle = '#fff'; c.beginPath(); c.arc(40, 39, 3, 0, 7); c.arc(80, 39, 3, 0, 7); c.fill(); } else if (ex === 'shock') { eye(44, 40, 1.2, 1.3); eye(84, 40, 1.2, 1.3); } else { eye(44, 42); eye(84, 42); }
  c.strokeStyle = '#141414'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath();
  if (ex === 'smile') { c.arc(64, 62, 26, 0.2 * PI, 0.8 * PI); } else if (ex === 'sad') { c.arc(64, 96, 22, 1.2 * PI, 1.8 * PI); } else if (ex === 'shock') { c.stroke(); c.beginPath(); c.fillStyle = '#141414'; c.ellipse(64, 82, 12, 15, 0, 0, 7); c.fill(); return; } else if (ex === 'smug' || ex === 'side') { c.moveTo(46, 82); c.quadraticCurveTo(70, 88, 86, 74); } else { c.moveTo(48, 82); c.lineTo(80, 82); }
  c.stroke(); if (ex === 'sad') { c.beginPath(); c.moveTo(30, 30); c.lineTo(52, 22); c.moveTo(98, 30); c.lineTo(76, 22); c.stroke(); } }); }
const DECALS = {}; function decal(ex) { if (!DECALS[ex]) DECALS[ex] = new T3.MeshBasicMaterial({ map: faceDecal(ex), transparent: true }); return DECALS[ex]; }
function rbx(o) { const g = new T3.Group(); const skin = PL(o.skin || '#f2c89a'), shirt = PL(o.shirt), pants = PL(o.pants), hairM = PL(o.hair || '#3a2416', 0.6);
  const up = new T3.Group(); up.position.y = 0.72; g.add(up); add(up, Bx(0.72, 0.72, 0.36), shirt, 0, 0.36, 0); if (o.logo) add(up, new T3.PlaneGeometry(0.36, 0.3), new T3.MeshBasicMaterial({ map: o.logo, transparent: true }), 0, 0.4, 0.182, false);
  const head = new T3.Group(); head.position.y = 0.95; up.add(head); add(head, Cy(0.23, 0.23, 0.36, 24), skin, 0, 0, 0); add(head, Sp(0.23, 24, 12), skin, 0, 0.18, 0).scale.y = 0.28; add(head, Sp(0.23, 24, 12), skin, 0, -0.18, 0).scale.y = 0.28;
  const fm = add(head, new T3.PlaneGeometry(0.34, 0.3), decal('smile'), 0, -0.01, 0.232, false);
  if (o.hairStyle === 'cap') { add(head, new T3.SphereGeometry(0.25, 20, 10, 0, PI * 2, 0, PI * 0.5), PL(o.hair), 0, 0.13, 0); add(head, Bx(0.3, 0.03, 0.18), PL(o.hair), 0, 0.15, 0.24); }
  else if (o.hairStyle === 'long') { add(head, new T3.SphereGeometry(0.26, 20, 10, 0, PI * 2, 0, PI * 0.55), hairM, 0, 0.12, -0.01); add(head, Bx(0.5, 0.5, 0.16), hairM, 0, -0.08, -0.18); }
  else if (o.hairStyle !== 'bald') { add(head, new T3.SphereGeometry(0.26, 20, 10, 0, PI * 2, 0, PI * 0.48), hairM, 0, 0.12, -0.02).rotation.x = -0.2; for (let i = 0; i < 5; i++) add(head, Bx(0.1, 0.07, 0.12), hairM, -0.16 + i * 0.08, 0.3, 0.12).rotation.x = 0.4; }
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.54, 0.66, 0); up.add(s); add(s, Bx(0.34, 0.72, 0.34), o.sleeve ? shirt : skin, 0, -0.3, 0); if (o.sleeve) add(s, Bx(0.345, 0.2, 0.345), skin, 0, -0.58, 0); const e = new T3.Group(); s.add(e); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.18, 0.72, 0); g.add(h); add(h, Bx(0.35, 0.72, 0.35), pants, 0, -0.36, 0); const k = new T3.Group(); h.add(k); h.userData.k = k; return h; };
  g.userData = { up, head, fm, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
function rface(p, ex) { const m = decal(ex); if (p.userData.fm.material !== m) p.userData.fm.material = m; }
function rrest(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); }
function rwalk(p, ph, a = 1) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.6 * a; u.legR.rotation.x = -s * 0.6 * a; u.armL.rotation.x = -s * 0.6 * a; u.armR.rotation.x = s * 0.6 * a; }
function studTex(col) { const t = ctex(64, 64, (c) => { c.fillStyle = col; c.fillRect(0, 0, 64, 64); for (const [x, y] of [[16, 16], [48, 16], [16, 48], [48, 48]]) { const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, 9); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
function cat() { const g = new T3.Group(); const o = PL('#e8902a'), w = PL('#f8f0e0'); add(g, Bx(0.5, 0.26, 0.24), o, 0, 0.28, 0); add(g, Bx(0.24, 0.22, 0.22), o, 0.3, 0.42, 0); for (const z of [-0.07, 0.07]) add(g, new T3.ConeGeometry(0.04, 0.08, 4), o, 0.32, 0.56, z); for (const [x, z] of [[-0.18, -0.08], [-0.18, 0.08], [0.18, -0.08], [0.18, 0.08]]) add(g, Bx(0.07, 0.18, 0.07), w, x, 0.09, z);
  const tail = add(g, Bx(0.05, 0.32, 0.05), o, -0.27, 0.45, 0); tail.rotation.z = 0.4; add(g, new T3.PlaneGeometry(0.2, 0.16), decal('side'), 0.413, 0.42, 0, false).rotation.y = PI / 2; g.userData.tail = tail; return g; }

// ---------- timing ----------
const E = { c: i => CL[i].start, vase: AT(3, 'then'), asked: AT(3, 'she'), cat: AT(3, 'i', 1), shrank: AT(4, 'i'), q1: AT(5, 'homework'), q2: AT(5, 'teeth'), q3: AT(5, 'room'), lie1: AT(8, "we're"), lie2: AT(8, "i'm"), lie3: AT(8, 'i'), proud: AT(9, 'then'), grew: AT(9, 'and') };
for (let i = 0; i < CL.length; i++) E['c' + i] = CL[i].start; E.loop = TM.total - 0.4;
const TOWN = [0, 0, 0], HOME = [80, 0, 0], FB = [160, 0, 0];
function build() {
  R.sun = new T3.DirectionalLight('#fff4e4', 2.4); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -14; sc.right = sc.top = 14; sc.near = 1; sc.far = 60; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#d8ecff', '#7a8a5a', 1.3); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa8f0'); g.addColorStop(0.55, '#bfe2fa'); g.addColorStop(1, '#e8f4e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(900, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- town ----
  const T = R.T = new T3.Group(); T.position.set(...TOWN); scene.add(T); const gt = studTex('#5ab84a'); gt.repeat.set(60, 60); add(T, Bx(120, 0.2, 120), PL('#ffffff').clone(), 0, -0.1, 0, false).material.map = gt;
  add(T, Bx(8, 0.22, 120), PL('#5a5a62', 0.7), 0, -0.08, 0, false); for (let z = -50; z < 50; z += 4) add(T, Bx(0.2, 0.23, 2), PL('#f0f0e8'), 0, -0.07, z, false);
  const hc = ['#e85a4a', '#4a8ad8', '#f0c040', '#9a5ad8', '#4ab88a', '#e89a4a']; for (let i = 0; i < 8; i++) { const sx = i % 2 ? 1 : -1, z = -28 + Math.floor(i / 2) * 9; const h = new T3.Group(); h.position.set(sx * 10, 0, z); T.add(h); add(h, Bx(6, 4, 6), PL('#f4ecd8'), 0, 2, 0); const rf = add(h, Cy(0.01, 5, 2.4, 4), PL(hc[i % 6]), 0, 5.2, 0); rf.rotation.y = PI / 4; add(h, Bx(1.1, 2, 0.1), PL('#7a4a2a'), 0, 1, sx < 0 ? 3.02 : -3.02).position.x = 0; add(h, Bx(1.2, 1.0, 0.1), PL('#8ac8f0', 0.1), -1.8, 2.5, sx < 0 ? 3.02 : -3.02); add(h, Bx(1.2, 1.0, 0.1), PL('#8ac8f0', 0.1), 1.8, 2.5, sx < 0 ? 3.02 : -3.02); h.rotation.y = sx < 0 ? PI / 2 : PI / 2; }
  for (let i = 0; i < 10; i++) { const x = (i % 2 ? 1 : -1) * 5.5, z = -40 + i * 8; add(T, Cy(0.2, 0.25, 1.4, 8), PL('#7a5a3a'), x, 0.7, z); add(T, Sp(1.0, 10, 8), PL('#3a9a3a'), x, 2.1, z).scale.y = 1.1; }
  // stage with a tiny mayor
  const st = new T3.Group(); st.position.set(0, 0, -14); T.add(st); add(st, Bx(4, 0.6, 2.4), PL('#c8a070'), 0, 0.3, 0); add(st, Bx(4.4, 0.8, 0.05), new T3.MeshBasicMaterial({ map: ctex(256, 48, (c) => { c.fillStyle = '#d83a3a'; c.fillRect(0, 0, 256, 48); c.fillStyle = '#fff'; c.font = '30px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VOTE FOR ME', 128, 26); }) }), 0, 2.6, -1.1, false); for (const x of [-2, 2]) add(st, Cy(0.05, 0.05, 2.4, 8), PL('#555'), x, 1.6, -1.1);
  add(st, Bx(0.5, 0.9, 0.4), PL('#6a4a30'), 0, 1.05, 0.5); R.mayor = rbx({ shirt: '#2a2a3a', pants: '#1a1a22', hair: '#888', sleeve: true }); R.mayor.scale.setScalar(0.28); R.mayor.position.set(0, 1.5, 0.5); st.add(R.mayor);
  R.crowd = []; const cs = [['#e85a4a', '#2a3a6a', 1.0], ['#f0c040', '#3a3a3a', 0.55], ['#4ab88a', '#5a3a2a', 0.9], ['#9a5ad8', '#2a2a3a', 0.35], ['#4a8ad8', '#4a4a52', 1.05], ['#e89a4a', '#2a3a2a', 0.7], ['#d84a8a', '#3a3a5a', 0.95], ['#5ac8e8', '#2a2a2a', 0.45]];
  cs.forEach(([s_, p_, sc_], i) => { const p = rbx({ shirt: s_, pants: p_, hair: ['#3a2416', '#e8c870', '#141010', '#c84a1a'][i % 4], hairStyle: i % 3 === 0 ? 'long' : i % 3 === 1 ? 'cap' : 'short' }); p.scale.setScalar(sc_); p.userData.mv = { x: (i % 2 ? 1 : -1) * (1.4 + (i % 3) * 0.9), z0: -30 + i * 7, sp: (i % 2 ? 1 : -1) * (1.1 + (i % 4) * 0.2) }; T.add(p); R.crowd.push(p); });
  // ---- home: exterior + living/dining room ----
  const H = R.H = new T3.Group(); H.position.set(...HOME); scene.add(H); const gt2 = studTex('#5ab84a'); gt2.repeat.set(30, 30); add(H, Bx(60, 0.2, 60), PL('#ffffff'), 0, -0.1, 8, false).material.map = gt2;
  const fl = studTex('#c8965a'); fl.repeat.set(8, 6); add(H, Bx(10, 0.21, 8), PL('#ffffff'), 0, -0.095, 0, false).material.map = fl;
  add(H, Bx(10, 4, 0.2), PL('#f0e6d0'), 0, 2, -4); add(H, Bx(0.2, 4, 8), PL('#e8dcc4'), -5, 2, 0); add(H, Bx(0.2, 4, 8), PL('#e8dcc4'), 5, 2, 0);
  add(H, Bx(10, 0.6, 0.25), PL('#e85a4a'), 0, 4.3, 4.1); add(H, Bx(4.4, 4, 0.2), PL('#f4ecd8'), -2.8, 2, 4.0); add(H, Bx(4.4, 4, 0.2), PL('#f4ecd8'), 2.8, 2, 4.0); add(H, Bx(1.2, 1.9, 0.05), PL('#7a4a2a'), 0, 0.95, 4.12).visible = true;
  R.frontWall = H.children.slice(-4);
  add(H, Bx(1.6, 1.0, 0.1), PL('#8ac8f0', 0.1), -2.6, 2.4, 4.12); add(H, Bx(1.6, 1.0, 0.1), PL('#8ac8f0', 0.1), 2.6, 2.4, 4.12); add(H, Bx(0.12, 0.12, 0.08), PL('#c8a040'), 0.4, 0.95, 4.18);
  R.stool = add(H, Bx(0.5, 0.35, 0.5), PL('#a87a4a'), 0.75, 0.18, 4.7);
  // living room furniture: sofa, side table with vase, dining table, shoe rack
  add(H, Bx(2.6, 0.5, 0.9), PL('#4a6aa8'), -2.8, 0.25, -3.1); add(H, Bx(2.6, 0.8, 0.25), PL('#4a6aa8'), -2.8, 0.65, -3.5);
  add(H, Bx(0.8, 0.8, 0.8), PL('#8a5a3a'), 1.8, 0.4, -3.2); R.vase = new T3.Group(); R.vase.position.set(1.8, 0.8, -3.2); H.add(R.vase); add(R.vase, Cy(0.12, 0.18, 0.5, 12), PL('#4a8ad8', 0.2), 0, 0.25, 0); add(R.vase, Cy(0.08, 0.12, 0.12, 12), PL('#4a8ad8', 0.2), 0, 0.56, 0); add(R.vase, Sp(0.08, 8, 6), PL('#e85a8a'), 0, 0.7, 0);
  R.shards = []; for (let i = 0; i < 10; i++) { const s = add(H, Bx(0.12, 0.04, 0.1), PL('#4a8ad8', 0.2), 0, -5, 0); s.userData.a = i * 0.63; R.shards.push(s); }
  add(H, Bx(2.4, 0.1, 1.3), PL('#a8784a'), 2.5, 0.8, -0.6); for (const [x, z] of [[1.4, -1.1], [3.6, -1.1], [1.4, -0.1], [3.6, -0.1]]) add(H, Bx(0.1, 0.8, 0.1), PL('#7a5030'), x, 0.4, z);
  for (const [x, z] of [[1.6, -0.6], [2.5, -1.5], [3.4, -0.6]]) add(H, Bx(0.18, 0.04, 0.18), PL('#ffffff'), x, 0.87, z);
  R.shoe = new T3.Group(); R.shoe.position.set(0.6, 0, 0.6); H.add(R.shoe); add(R.shoe, Bx(0.32, 0.14, 0.62), PL('#e8453a'), 0, 0.07, 0); add(R.shoe, Bx(0.32, 0.22, 0.3), PL('#e8453a'), 0, 0.18, -0.16); add(R.shoe, Bx(0.33, 0.04, 0.63), PL('#f4f4f4'), 0, 0.02, 0); add(R.shoe, Bx(0.2, 0.02, 0.32), PL('#5a1a1a'), 0, 0.15, 0.08);
  // ---- family ----
  R.leo = rbx({ shirt: '#4a8ad8', pants: '#2a3a5a', hair: '#5a3a1a', logo: ctex(64, 52, (c) => { c.fillStyle = '#ffd23a'; c.font = '40px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('L', 32, 28); }) }); scene.add(R.leo);
  R.dad = rbx({ shirt: '#3a8a5a', pants: '#3a3a42', hair: '#2a1a10', sleeve: true }); scene.add(R.dad); R.mum = rbx({ shirt: '#d84a8a', pants: '#3a3a5a', hair: '#8a4a1a', hairStyle: 'long' }); scene.add(R.mum);
  R.cat = cat(); H.add(R.cat);
  R.sparks = []; for (let i = 0; i < 10; i++) R.sparks.push(spr(scene, GLOW, '#9aff8a', 0.25, 0, -9, 0, 0));
  // ---- flashback stage (sepia, plain backdrop) ----
  const F = R.F = new T3.Group(); F.position.set(...FB); scene.add(F); add(F, Bx(20, 0.2, 20), PL('#c8b08a'), 0, -0.1, 0, false); add(F, Bx(20, 10, 0.2), PL('#d8c4a0'), 0, 5, -3, false);
  add(F, Bx(1.6, 0.08, 1.0), PL('#a8784a'), 1.3, 0.8, -1.2); for (const [x, z] of [[0.6, -1.6], [2.0, -1.6], [0.6, -0.8], [2.0, -0.8]]) add(F, Bx(0.08, 0.8, 0.08), PL('#7a5030'), x, 0.4, z); for (let i = 0; i < 4; i++) add(F, Bx(0.3, 0.01, 0.22), PL('#f4f0e8'), 0.9 + i * 0.28, 0.85, -1.2).rotation.y = i * 0.3;
}

const H3 = (x, y, z) => [HOME[0] + x, HOME[1] + y, HOME[2] + z], F3 = (x, y, z) => [FB[0] + x, FB[1] + y, FB[2] + z];
// Leo's height in inches: one inch per lie, then he keeps going all day
function leoIn(T) { if (T < E.shrank) return 54; if (T < E.q1 + 0.6) return 53; if (T < E.q2 + 0.6) return 52; if (T < E.q3 + 0.5) return 51; if (T < E.c6) return Math.round(lerp(50, 6, prog(T, E.q3 + 0.6, E.c6 - 0.1) ** 0.7)); return 6; }
const LIES = []; for (let t = E.q3 + 0.6; t < E.c6 - 0.1; t += 0.11) LIES.push(t);
function dadScale(T) { if (CLI(T) === 8) { const n = [E.lie1, E.lie2, E.lie3].filter(t => T > t + 0.3).length; return [1.12, 0.92, 0.74, 0.56][n]; } return T > E.grew + 0.1 && CLI(T) >= 9 ? 0.58 : 0.56; }
const SH = [
  [0, (k, T) => TR(k, [-2.2, 2.2, 4], [-1.0, 1.7, -9.5], [0, 1.2, -14], [0, 1.5, -14])],
  [E.c1, (k, T) => TR(k, H3(1.0, 1.5, 9.2), H3(0.8, 1.4, 8.3), H3(0, 1.1, 5.2), H3(0, 1.1, 5.2))],
  [E.c3, (k, T) => TR(k, H3(3.3, 1.5, -0.6), H3(3.1, 1.4, -0.9), H3(1.5, 0.8, -2.9), H3(1.6, 0.7, -2.9))],
  [E.cat - 0.1, (k, T) => TR(k, H3(4.0, 0.9, -1.7), H3(3.8, 0.8, -1.9), H3(2.6, 0.35, -2.6), H3(2.6, 0.35, -2.6))],
  [E.c4, (k, T) => TR(k, H3(-0.6, 1.3, 1.6), H3(-0.4, 1.2, 1.2), H3(0.8, 0.8, -1.8), H3(0.8, 0.7, -1.8))],
  [E.c5, (k, T) => TR(k, H3(-1.2, 1.5, 2.2), H3(-1.0, 1.3, 1.8), H3(0.2, 0.8, -1.4), H3(0.4, 0.5, -1.4))],
  [E.c6, (k, T) => TR(k, H3(0.0, 0.5, 1.9), H3(0.2, 0.4, 1.6), H3(0.6, 0.15, 0.6), H3(0.6, 0.15, 0.6))],
  [E.c7, (k, T) => TR(k, H3(0.2, 1.0, 2.0), H3(0.3, 0.95, 1.7), H3(0.7, 0.7, 0.6), H3(0.7, 0.75, 0.6))],
  [E.c8, (k, T) => TR(k, F3(0, 1.3, 4.2), F3(0, 1.2, 3.6), F3(0.4, 0.8, -1), F3(0.4, 0.7, -1))],
  [E.c9, (k, T) => TR(k, H3(0.2, 1.0, 2.0), H3(0.3, 0.95, 1.7), H3(0.7, 0.75, 0.6), H3(0.7, 0.8, 0.6))],
  [E.c10, (k, T) => TR(k, H3(2.0, 1.4, 1.4), H3(2.2, 1.3, 1.0), H3(2.5, 0.9, -0.6), H3(2.5, 0.9, -0.6))],
  [E.c11, (k, T) => TR(k, [-2.5, 2.6, 9], [-2.5, 3.0, 10], [0, 1.4, -14], [0, 1.6, -14])],
  [E.loop, (k, T) => look([-2.5, 2.4, 9], [0, 1.2, -14])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const leo = R.leo, dad = R.dad, mum = R.mum, l = leo.userData, d = dad.userData, m = mum.userData; [leo, dad, mum].forEach(rrest); leo.visible = dad.visible = mum.visible = true;
  // town crowd walking, mayor waving
  R.crowd.forEach((p, i) => { rrest(p); const mv = p.userData.mv; p.position.set(mv.x, 0, ((mv.z0 + mv.sp * T + 45) % 90 + 90) % 90 - 45); p.rotation.y = mv.sp > 0 ? 0 : PI; rwalk(p, T * 7 + i, 1); }); rrest(R.mayor); R.mayor.userData.armR.rotation.set(-2.8 + 0.3 * S(T * 6), 0, 0); rface(R.mayor, 'smile');
  const s = leoIn(T) / 54; leo.scale.setScalar(s); rface(leo, 'smile'); dad.scale.setScalar(dadScale(T)); mum.scale.setScalar(1.08); rface(dad, 'smile'); rface(mum, 'neutral');
  // vase + cat
  const fall = ci === 3 ? prog(T, E.vase + 0.3, E.vase + 0.75) : ci > 3 && !loop ? 1 : 0; R.vase.visible = fall < 1; R.vase.rotation.z = -1.4 * fall; R.vase.position.set(1.8 + 0.4 * fall, 0.8 - 0.8 * fall * fall, -3.2);
  R.shards.forEach((sh, i) => { const on = fall >= 1 && (ci === 3 || ci === 4); sh.visible = on; const d_ = ci === 3 ? Math.min(1, (T - E.vase - 0.75) * 3) : 1; sh.position.set(2.2 + Math.cos(sh.userData.a) * 0.5 * d_, 0.03, -3.0 + Math.sin(sh.userData.a) * 0.5 * d_); sh.rotation.y = sh.userData.a * 3; });
  R.cat.position.set(2.6, 0, -2.6); R.cat.rotation.y = PI / 2 + 0.6; R.cat.userData.tail.rotation.z = 0.4 + 0.2 * S(T * 3); R.cat.visible = ci >= 3 && ci <= 5; R.shoe.visible = !(ci === 7 || ci === 9);
  // where everyone is, clip by clip
  if (ci === 0 || loop || ci === 11) { leo.visible = dad.visible = mum.visible = false; }
  if (ci === 1 || ci === 2) { leo.position.set(...H3(-0.35, 0, 5.4)); leo.rotation.y = 0.15; mum.visible = false; dad.position.set(...H3(0.75, 0.35, 4.7)); dad.rotation.y = 0.2; if (ci === 1) dad.visible = false; else { d.armR.rotation.set(-1.4, 0, 0.3); rface(dad, 'smile'); } l.armR.rotation.set(ci === 1 ? -2.7 + 0.3 * S(T * 7) : -0.2, 0, 0); }
  if (ci >= 3 && ci <= 5) { leo.position.set(...H3(0.9, 0, -1.9)); leo.rotation.y = 0.3; dad.visible = false; mum.position.set(...H3(-1.4, 0, -1.2)); mum.rotation.y = 0.9; mum.visible = ci > 3 || T > E.asked - 0.2;
    if (ci === 3) { const bump = Math.max(0, 1 - Math.abs(T - E.vase - 0.3) / 0.3); l.armR.rotation.set(-0.6 * bump, 0, 0.9 * bump); rface(leo, T > E.vase + 0.7 ? 'shock' : 'smile'); if (T > E.asked - 0.2) { m.armL.rotation.set(-0.3, 0, 0.9); m.armR.rotation.set(-0.3, 0, -0.9); rface(mum, 'sad'); } if (T > E.cat - 0.1) { leo.rotation.y = 1.4; l.armR.rotation.set(-1.6, 0, 0); rface(leo, 'side'); } }
    if (ci === 4) { rface(leo, 'smug'); rface(mum, 'neutral'); }
    if (ci === 5) { rface(mum, 'neutral'); m.armR.rotation.set(-1.2 + 0.2 * S(T * 5), 0, 0); rface(leo, T > E.q3 + 0.6 ? 'smug' : 'side'); leo.position.y = 0; } }
  if (ci === 6) { leo.position.set(...H3(0.6, 0.06, 0.7)); leo.rotation.y = 0.2; rface(leo, 'shock'); dad.position.set(...H3(1.5, 0, -0.1)); dad.rotation.y = -0.6; mum.position.set(...H3(3.4, 0, -1.5)); mum.rotation.y = -0.4; rface(mum, 'shock'); }
  if (ci === 7 || ci === 9) { dad.position.set(...H3(0.7, 0, 0.3)); dad.rotation.y = 0.15; d.armL.rotation.set(-1.2, 0, 0.35); d.armR.rotation.set(-1.2, 0, -0.35); rface(dad, ci === 9 ? 'smile' : 'sad'); mum.visible = false; leo.position.set(...H3(0.7, 0.42 * dadScale(T) / 0.56, 0.62)); leo.rotation.y = PI + 0.1; rface(leo, 'shock'); if (ci === 9) rface(leo, 'smile'); }
  if (ci === 8) { leo.visible = mum.visible = false; dad.position.set(...F3(0.0, 0, -0.6)); dad.rotation.y = 0.25; rface(dad, [E.lie1, E.lie2, E.lie3].some(t => Math.abs(T - t - 0.2) < 0.6) ? 'smile' : 'neutral'); d.armR.rotation.set(-0.6, 0, -0.2); }
  if (ci === 10) { dad.visible = false; mum.position.set(...H3(3.4, 0, -1.5)); mum.rotation.y = -0.4; rface(mum, 'neutral'); leo.position.set(...H3(2.5, 0.85, -0.6)); leo.rotation.y = 0.5; rface(leo, 'sad'); }
  // sparkles when dad grows from the truth
  R.sparks.forEach((sp, i) => { const on = ci === 9 && T > E.grew - 0.1 && T < E.grew + 1.2; sp.material.opacity = on ? 0.9 * (1 - prog(T, E.grew, E.grew + 1.2)) : 0; const a = i / 10 * PI * 2 + T * 3; sp.position.set(HOME[0] + 0.7 + Math.cos(a) * 0.5, 0.3 + (i % 5) * 0.2 + (T - E.grew) * 0.4, 0.3 + Math.sin(a) * 0.5); }); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 55; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 4); R.sun.position.set(c.x + 6, 14, c.z + 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
// ---------- captions: small white, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.2 || w.a - prev.a > 0.55 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.25) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 48px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 900); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 900); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function pill(x, y, w, h, bg, bd) { octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (bd) { octx.strokeStyle = bd; octx.lineWidth = 4; octx.stroke(); } }
function heightTag(T) { const n = leoIn(T); const ft = Math.floor(n / 12), inch = n % 12; const lp = [E.shrank, E.q1 + 0.6, E.q2 + 0.6, E.q3 + 0.5, ...LIES].filter(t => T >= t).pop(); const b = lp !== undefined && T - lp < 0.2 ? 1 + 0.25 * (1 - (T - lp) / 0.2) : 1;
  octx.save(); octx.translate(560, 130); octx.scale(b, b); pill(-120, -40, 240, 80, 'rgba(10,12,24,0.85)', '#ffd23a'); txt('LEO', 0, -18, 20, '#9aa6d8', 'CapFont'); txt(`${ft}' ${inch}"`, 0, 14, 38, n < 40 ? '#ff6a5a' : '#fff'); octx.restore(); }
function bubble(T, t0, s_, x, y) { const k = ease(prog(T, t0 - 0.05, t0 + 0.15)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '600 38px CapFont'; const w = octx.measureText(s_).width + 50; octx.fillStyle = '#fff'; octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.beginPath(); octx.roundRect(x - w / 2, y - 40, w, 80, 30); octx.fill(); octx.stroke(); octx.beginPath(); octx.moveTo(x - 10, y + 38); octx.lineTo(x + 4, y + 70); octx.lineTo(x + 18, y + 38); octx.fill(); octx.stroke(); octx.fillStyle = '#111'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(s_, x, y + 2); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#bfe2fa'); camera = new T3.PerspectiveCamera(55, RW / RH, 0.02, 2000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = ci === 8 && !loop ? 'sepia(0.85) contrast(1.05)' : 'contrast(1.04) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const lp = [E.shrank, E.q1 + 0.6, E.q2 + 0.6, E.q3 + 0.5].filter(t => T >= t).pop(); if (lp !== undefined && T - lp < 0.1 && !loop && ci <= 5) { octx.fillStyle = 'rgba(255,255,255,0.25)'; octx.fillRect(0, 0, W, H); }
  if (!loop && ci >= 1 && ci <= 7) heightTag(T);
  if (ci === 1 && !loop) { const k = ease(prog(T, AT(1, 'leo') - 0.1, AT(1, 'leo') + 0.2)); if (k > 0) { octx.save(); octx.globalAlpha = k; pill(200, 360, 320, 84, 'rgba(10,12,24,0.85)', '#4a8ad8'); txt('LEO . 10', 360, 403, 40, '#fff'); octx.restore(); } }
  if (ci === 5) { bubble(T, E.q1, 'Homework?', 250, 330); if (T > E.q2 - 0.1) bubble(T, E.q2, 'Teeth?', 470, 430); if (T > E.q3 - 0.1) bubble(T, E.q3, 'Room?', 300, 530); }
  if (ci === 8) { bubble(T, E.lie1, "We're fine.", 360, 330); if (T > E.lie2 - 0.1) bubble(T, E.lie2, "I'm not tired.", 360, 430); if (T > E.lie3 - 0.1) bubble(T, E.lie3, 'I love my job.', 360, 530); txt('BEFORE YOU WERE BORN', 360, 140, 28, '#5a3a1a'); }
  if (ci === 9 && T > E.grew) { const k = ease(prog(T, E.grew, E.grew + 0.2)); octx.save(); octx.globalAlpha = k; pill(250, 330, 220, 80, 'rgba(20,90,40,0.9)', '#9aff8a'); txt('+1 INCH', 360, 372, 38, '#fff'); octx.restore(); }
  if (ci === 10) { const k = ease(prog(T, E.c10 + 0.6, E.c10 + 1.0)); if (k > 0) { octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(250,246,236,0.97)'; octx.beginPath(); octx.roundRect(150, 150, 420, 470, 18); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.stroke(); txt('THE TRUTH', 360, 200, 40, '#111'); const L = ['I broke the vase', 'Not the cat', 'No homework', "Didn't brush", 'Room is a mess', '...and 43 more']; L.forEach((s_, i) => { if (T > E.c10 + 0.8 + i * 0.25) txt(s_, 360, 265 + i * 58, 30, i === 5 ? '#c83a2a' : '#222', 'CapFont'); }); octx.restore(); } }
  if (ci === 11 && !loop) { const k = ease(prog(T, E.c11, E.c11 + 0.25)); octx.save(); octx.globalAlpha = k; octx.font = '60px Russo'; octx.textAlign = 'center'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText('WHAT WOULD YOU', 360, 360); octx.strokeText('LIE ABOUT?', 360, 440); octx.fillStyle = '#fff'; octx.fillText('WHAT WOULD YOU', 360, 360); octx.fillStyle = '#ffd23a'; octx.fillText('LIE ABOUT?', 360, 440); octx.restore(); }
  if (loop) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText('IN THIS TOWN...', 360, 360); octx.fillStyle = '#fff'; octx.fillText('IN THIS TOWN...', 360, 360); octx.restore(); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 11) caption(cap); };
})();
