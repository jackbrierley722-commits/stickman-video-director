// 429A — mystery series, realistic 3D (native 720p, PBR, soft shadows, grade, grain).
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

const G = {}; const R = {};
// ---------- textures ----------
function carpetT(rep) { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#5a1a22'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8a050'; c.lineWidth = 3; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x + 32, y + 6); c.lineTo(x + 58, y + 32); c.lineTo(x + 32, y + 58); c.lineTo(x + 6, y + 32); c.closePath(); c.stroke(); c.fillStyle = '#3a0e16'; c.beginPath(); c.arc(x + 32, y + 32, 8, 0, 7); c.fill(); } const r = rng(4); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.15})`; c.fillRect(r() * w, r() * h, 2, 2); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function paperT(rep) { const t = ctex(128, 256, (c, w, h) => { c.fillStyle = '#2a3a30'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(200,170,90,0.18)'; c.fillRect(x + 14, 0, 4, h); } for (let y = 16; y < h; y += 40) for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(200,170,90,0.25)'; c.beginPath(); c.arc(x + 16, y, 5, 0, 7); c.fill(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function woodT() { const r = rng(9); return ctex(256, 128, (c, w, h) => { c.fillStyle = '#5a321e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(30,14,6,${0.15 + r() * 0.2})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const y = r() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 12, w * 0.6, y + (r() - 0.5) * 12, w, y + (r() - 0.5) * 8); c.stroke(); } }); }
function plate(txt, w = 128, h = 48, bg = '#b8903a', fg = '#2a1a08', size = 30) { return ctex(w, h, (c) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e8c870'); g.addColorStop(0.5, bg); g.addColorStop(1, '#8a6a2a'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a4a1a'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4); c.fillStyle = fg; c.font = `${size}px Russo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 2); }); }
// ---------- lobby ----------
function buildLobby() { const g = G.lobby = new T3.Group(); scene.add(g); const wood = SM('#ffffff', { map: woodT(), roughness: 0.45 });
  add(g, Bx(16, 0.1, 14), SM('#ffffff', { map: carpetT([4, 4]), roughness: 0.9 }), 0, -0.05, 0); add(g, Bx(16, 0.1, 14), SM('#e8e0cc', { roughness: 0.9 }), 0, 3.6, 0);
  const wp = SM('#ffffff', { map: paperT([8, 2]), roughness: 0.85 }); add(g, Bx(16, 3.6, 0.2), wp, 0, 1.8, -3.5); add(g, Bx(0.2, 3.6, 14), wp, -7, 1.8, 0); add(g, Bx(0.2, 3.6, 14), wp, 7, 1.8, 0); add(g, Bx(16, 1.0, 0.24), wood, 0, 0.5, -3.48);
  // desk
  add(g, RB(4.2, 1.05, 0.9, 0.06), wood, 0, 0.53, -0.6); add(g, Bx(4.4, 0.06, 1.1), SM('#2a2a2e', { roughness: 0.15, metalness: 0.2 }), 0, 1.09, -0.6); add(g, Bx(4.2, 0.05, 0.9), wood, 0, 0.75, -1.3);
  R.note = add(g, new T3.PlaneGeometry(0.16, 0.16), SM('#ffffff', { map: ctex(128, 128, (c) => { c.fillStyle = '#f6e86a'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#1a2a8a'; c.font = 'italic 15px sans-serif'; ['Rule 1.', 'NEVER go up', 'to a room that', "doesn't exist.", '      Leo'].forEach((l, i) => c.fillText(l, 8, 22 + i * 22)); }), roughness: 0.8 }), 0.6, 1.035, -0.62, false); R.note.rotation.x = PI / 2;
  // monitor + keyboard
  R.scrT = ctex(512, 400, () => {}); add(g, RB(0.62, 0.5, 0.45, 0.05), SM('#d8d2c0', { roughness: 0.6 }), -0.8, 1.38, -0.75); R.scr = add(g, new T3.PlaneGeometry(0.5, 0.39), new T3.MeshBasicMaterial({ map: R.scrT, toneMapped: false, color: '#b8b8b8' }), -0.8, 1.39, -0.485, false); add(g, Bx(0.5, 0.03, 0.18), SM('#d8d2c0'), -0.8, 1.13, -0.3);
  R.scrL = new T3.PointLight('#9ad8ff', 0.5, 2.5, 1.5); R.scrL.position.set(-0.8, 1.6, 0.4); g.add(R.scrL);
  // desk phone
  R.phone = new T3.Group(); R.phone.position.set(0.9, 1.12, -0.55); g.add(R.phone); add(R.phone, RB(0.3, 0.08, 0.24, 0.03), SM('#34343a', { roughness: 0.35 }), 0, 0.04, 0); for (let i = 0; i < 9; i++) add(R.phone, Bx(0.03, 0.01, 0.025), SM('#c8c8c0'), -0.1 + (i % 3) * 0.04, 0.105, 0.0 + Math.floor(i / 3) * 0.035, false); R.hand = add(R.phone, new T3.CapsuleGeometry(0.035, 0.24, 6, 12), SM('#34343a', { roughness: 0.3 }), 0, 0.13, -0.085); R.hand.rotation.z = PI / 2;
  R.lcdT = ctex(128, 48, () => {}); R.lcd = add(R.phone, new T3.PlaneGeometry(0.14, 0.055), new T3.MeshBasicMaterial({ map: R.lcdT, toneMapped: false }), 0.05, 0.11, 0.05, false); R.lcd.rotation.x = -PI / 2 + 0.3; R.ringL = new T3.PointLight('#ff3a2a', 0, 1.2, 2); R.ringL.position.set(0.9, 1.3, -0.4); g.add(R.ringL);
  // lamp
  add(g, new T3.CylinderGeometry(0.08, 0.1, 0.04, 20), SM('#c8a050', { metalness: 0.8, roughness: 0.3 }), 1.6, 1.14, -0.8); add(g, new T3.CylinderGeometry(0.015, 0.015, 0.4, 8), SM('#c8a050', { metalness: 0.8, roughness: 0.3 }), 1.6, 1.34, -0.8); add(g, new T3.CylinderGeometry(0.1, 0.18, 0.18, 24, 1, true), SM('#2a5a3a', { side: T3.DoubleSide }), 1.6, 1.56, -0.8); const ll = new T3.PointLight('#ffc878', 3, 5, 1.6); ll.position.set(1.6, 1.45, -0.7); g.add(ll); glow(g, '#ffc878', 0.8, 1.6, 1.5, -0.75, 0.6);
  // key cabinet
  add(g, Bx(2.4, 1.6, 0.12), wood, 0, 2.1, -3.35); R.keys = []; for (let r_ = 0; r_ < 4; r_++) for (let k = 0; k < 6; k++) { const n = 401 + r_ * 10 + k; const x = -0.95 + k * 0.38, y = 2.7 - r_ * 0.38; add(g, new T3.CylinderGeometry(0.012, 0.012, 0.08, 6), SM('#c8a050', { metalness: 0.9, roughness: 0.3 }), x, y, -3.27).rotation.x = PI / 2; const tg = add(g, new T3.PlaneGeometry(0.16, 0.08), new T3.MeshStandardMaterial({ map: plate(String(n), 96, 48, '#e8e0c8', '#3a2a1a', 26), roughness: 0.7 }), x, y - 0.1, -3.22, false); }
  R.key429a = new T3.Group(); R.key429a.position.set(1.33, 1.56, -3.22); g.add(R.key429a); add(R.key429a, new T3.PlaneGeometry(0.18, 0.09), new T3.MeshStandardMaterial({ map: plate('429A', 96, 48, '#c84a3a', '#fff', 24), roughness: 0.6, emissive: '#ff4a2a', emissiveIntensity: 0.2 }), 0, 0, 0, false);
  // clock
  R.clockT = ctex(128, 128, () => {}); add(g, new T3.CylinderGeometry(0.3, 0.3, 0.05, 40), SM('#ffffff', { map: R.clockT, roughness: 0.4 }), -2.6, 2.6, -3.36).rotation.x = PI / 2; add(g, new T3.TorusGeometry(0.31, 0.03, 10, 40), SM('#c8a050', { metalness: 0.9, roughness: 0.25 }), -2.6, 2.6, -3.34);
  // lift doors on the left wall
  add(g, Bx(0.1, 2.5, 1.9), SM('#c8a050', { metalness: 0.9, roughness: 0.3 }), -6.88, 1.25, -1.5); add(g, Bx(0.12, 2.3, 0.02), SM('#4a3a1a'), -6.84, 1.2, -1.5); add(g, new T3.PlaneGeometry(0.5, 0.2), new T3.MeshBasicMaterial({ map: plate('4', 64, 32, '#1a1a1a', '#ff7a3a', 22), toneMapped: false }), -6.82, 2.7, -1.5, false).rotation.y = PI / 2;
  R.leo = human({ top: '#6a1420', bot: '#1a1a22', hair: '#3a2414', skin: '#e0b090' }); g.add(R.leo); add(R.leo.userData.body, Bx(0.1, 0.05, 0.01), SM('#c8a050', { metalness: 0.9 }), -0.1, 1.42, 0.15, false);
  g.add(new T3.HemisphereLight('#c8b8a0', '#2a1a14', 0.5)); const cl = new T3.PointLight('#ffd8a0', 4, 12, 1.6); cl.position.set(0, 3.2, 1); g.add(cl); sun(g, 3, 6, 4, 0, 0, -1, '#ffd8b0', 0.8, 6); }
function drawScreen(mode, T) { const c = R.scrT.userData.g, w = 512, h = 400; c.fillStyle = '#0a1a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#7ad0ff'; c.font = '26px PressStart'; c.fillText('HOLLOW CREST', 24, 44); c.fillStyle = '#3a5a7a'; c.fillRect(24, 60, 464, 3); c.font = '22px PressStart';
  const ln = (s_, y, col = '#bfe8ff') => { c.fillStyle = col; c.fillText(s_, 24, y); };
  if (mode >= 1) { ln('SEARCH . 429A', 110); } if (mode === 1) ln('ROOM NOT FOUND', 170, '#ff5a4a');
  if (mode >= 2) { ln('1 BOOKING FOUND', 170, '#ffd25a'); ln('GUEST . M. HALE', 220); } if (mode >= 3) ln('IN  . 11 NOV 1986', 270); if (mode >= 4) ln('OUT . ' + (S(T * 8) > 0 ? '----' : ''), 320, '#ff5a4a');
  if (S(T * 6) > 0) { c.fillStyle = '#bfe8ff'; c.fillRect(24 + (mode >= 1 ? 0 : 0), 360, 16, 22); } R.scrT.needsUpdate = true; }
function drawLCD(on, T) { const c = R.lcdT.userData.g; c.fillStyle = on ? '#9ad8a0' : '#3a4a3a'; c.fillRect(0, 0, 128, 48); if (on) { c.fillStyle = '#0a1a0a'; c.font = '24px PressStart'; c.textAlign = 'center'; c.fillText(S(T * 10) > -0.3 ? '429A' : '', 64, 34); c.textAlign = 'left'; } R.lcdT.needsUpdate = true; }
function drawClock(h, m) { const c = R.clockT.userData.g; c.fillStyle = '#f8f4ea'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#1a1a1a'; for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2; c.lineWidth = 3; c.beginPath(); c.moveTo(64 + S(a) * 46, 64 - C(a) * 46); c.lineTo(64 + S(a) * 56, 64 - C(a) * 56); c.stroke(); }
  const ha = (h % 12 + m / 60) / 12 * PI * 2, ma_ = m / 60 * PI * 2; c.lineWidth = 6; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + S(ha) * 28, 64 - C(ha) * 28); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + S(ma_) * 44, 64 - C(ma_) * 44); c.stroke(); R.clockT.needsUpdate = true; }
// ---------- lift ----------
function buildLift() { const g = G.lift = new T3.Group(); g.position.x = 40; scene.add(g); const brass = SM('#c8a050', { metalness: 0.9, roughness: 0.28 });
  add(g, Bx(2, 0.1, 2), SM('#3a2a20'), 0, -0.05, 0); add(g, Bx(2, 0.1, 2), SM('#e8e0cc'), 0, 2.6, 0); for (const [x, z, w_, d] of [[-1, 0, 0.1, 2], [1, 0, 0.1, 2], [0, -1, 2, 0.1]]) add(g, Bx(w_, 2.6, d), SM('#7a5a3a', { roughness: 0.5 }), x, 1.3, z);
  add(g, Bx(0.3, 0.7, 0.04), brass, 0.85, 1.3, 0.6).rotation.y = -PI / 2; for (let i = 0; i < 6; i++) { const b = add(g, new T3.CylinderGeometry(0.035, 0.035, 0.03, 16), new T3.MeshBasicMaterial({ color: i === 3 ? '#ffb04a' : '#d8d0c0', toneMapped: false }), 0.82, 1.05 + i * 0.1, 0.6, false); b.rotation.z = PI / 2; }
  R.liftL = new T3.PointLight('#fff0d8', 3, 5, 1.5); R.liftL.position.set(0, 2.4, 0); g.add(R.liftL); g.add(new T3.HemisphereLight('#c8b8a0', '#2a1a14', 0.4)); R.liftLeo = human({ top: '#6a1420', bot: '#1a1a22', hair: '#3a2414', skin: '#e0b090' }); R.liftLeo.position.set(-0.2, 0, -0.3); g.add(R.liftLeo); }
// ---------- corridor ----------
const DZ = [-2, -6, -10, -12, -14, -18];
function buildCorr() { const g = G.corr = new T3.Group(); g.position.x = 100; scene.add(g); const wood = SM('#ffffff', { map: woodT(), roughness: 0.4 }), brass = SM('#c8a050', { metalness: 0.9, roughness: 0.25 });
  add(g, Bx(3.2, 0.1, 30), SM('#ffffff', { map: carpetT([1, 10]), roughness: 0.9 }), 0, -0.05, -10); add(g, Bx(3.2, 0.1, 30), SM('#e8e0cc'), 0, 2.9, -10); const wp = SM('#ffffff', { map: paperT([10, 1.6]), roughness: 0.85 });
  for (const sx of [-1, 1]) { add(g, Bx(0.15, 2.9, 30), wp, sx * 1.6, 1.45, -10); add(g, Bx(0.18, 0.9, 30), wood, sx * 1.58, 0.45, -10); } add(g, Bx(3.2, 2.9, 0.15), wp, 0, 1.45, -25);
  const nums = ['427', '428', '429', '429A', '430', '431']; R.doors = [];
  nums.forEach((n, i) => { const z = DZ[i]; const d = new T3.Group(); d.position.set(-1.5, 0, z); g.add(d); const mat = i === 3 ? new T3.MeshStandardMaterial({ map: woodT(), roughness: 0.4, transparent: true, opacity: 1 }) : wood; const slab = add(d, Bx(0.08, 2.1, 0.95), mat, 0.04, 1.05, 0); add(d, Bx(0.1, 2.25, 1.15), SM('#3a2010', { transparent: i === 3 }), 0.0, 1.12, 0);
    const pl = add(d, new T3.PlaneGeometry(0.34, 0.13), new T3.MeshStandardMaterial({ map: plate(n, 128, 48), roughness: 0.3, metalness: 0.6, emissive: i === 3 ? '#ff7a3a' : '#000', emissiveIntensity: 0, transparent: i === 3 }), 0.1, 1.65, 0, false); pl.rotation.y = PI / 2;
    const hd = new T3.Group(); hd.position.set(0.12, 1.0, 0.3); d.add(hd); add(hd, new T3.SphereGeometry(0.04, 16, 12), brass, 0, 0, 0); add(hd, Bx(0.03, 0.03, 0.13), brass, 0.02, 0, -0.06);
    d.userData = { slab, pl, hd, frame: d.children[1] }; R.doors.push(d); });
  R.under = add(g, new T3.PlaneGeometry(0.06, 0.9), new T3.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0, toneMapped: false }), -1.44, 0.03, DZ[3], false); R.under.rotation.set(-PI / 2, 0, PI / 2);
  R.sconces = []; for (let z = -1; z > -24; z -= 4) for (const sx of [-1, 1]) { add(g, new T3.CylinderGeometry(0.06, 0.1, 0.18, 12), SM('#f4e0b0', { emissive: '#ffd890', emissiveIntensity: 1.2 }), sx * 1.5, 2.1, z); } for (let z = -2; z > -24; z -= 8) { const pl = new T3.PointLight('#ffd0a0', 5, 10, 1.4); pl.position.set(0, 2.4, z); g.add(pl); R.sconces.push(pl); }
  R.dust = []; for (let i = 0; i < 40; i++) { const d = glow(g, '#ffe8c0', 0.05, -1.3, 1, DZ[3], 0); d.userData.o = i / 40; R.dust.push(d); }
  g.add(new T3.HemisphereLight('#b8a890', '#2a1a14', 0.35)); R.corrLeo = human({ top: '#6a1420', bot: '#1a1a22', hair: '#3a2414', skin: '#e0b090' }); g.add(R.corrLeo); }

// ---------- timeline ----------
const E = { so0: AT(0, 'so'), leo: AT(1, 'leo'), fourth: AT(1, 'room'), hollow: AT(1, 'hollow'), likeT: AT(3, 'like'), nothing: AT(1, 'nothing'), rings: AT(2, 'phone'), screen: AT(2, 'room'), says: AT(2, 'room'), checks: AT(3, 'checks'), nosuch: AT(3, 'no'), booking: AT(3, 'but'), one3: AT(3, 'one'), checked: AT(3, 'checked'), forty: AT(3, 'forty'), never3: AT(3, 'never'),
  finds: AT(4, 'then'), rule: AT(4, 'rule'), hand: AT(4, 'written'), lift: AT(5, 'he'), r429: AT(5, 'four'), r430: AT(5, 'four', 1), between: AT(5, 'and'), door5: AT(5, 'door'), brass: AT(6, 'the'), inside6: AT(6, 'and'), turns: AT(7, 'handle'), fromIn: AT(7, 'from'), optB: AT(8, 'b'), comment: AT(8, 'comment') };
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
function show(k) { for (const n of ['lobby', 'lift', 'corr']) G[n].visible = n === k; }
const DOOR_APPEAR = () => E.between + 0.3;
function corrState(T, appear) { const d = R.doors[3]; const a = appear; d.userData.slab.material.opacity = a; d.userData.frame.material.opacity = a; d.userData.pl.material.opacity = a; d.visible = a > 0.01; d.userData.pl.material.emissiveIntensity = T > E.brass ? 0.5 + 0.3 * S(T * 3) : 0.15;
  const ring = T > E.inside6 && T < CL[8].start + 20; R.under.material.opacity = a * (ring ? 0.55 + 0.45 * Math.max(0, S(T * 9)) : 0.35); d.userData.hd.rotation.x = T > E.turns ? -0.9 * ease(prog(T, E.turns, E.turns + 0.8)) : 0;
  R.dust.forEach((p, i) => { const k = (T * 0.15 + p.userData.o) % 1; p.position.set(-1.25 + S(i * 2.1) * 0.15, 0.2 + k * 2.2, DZ[3] + C(i * 1.7) * 0.5); p.material.opacity = a * 0.5 * S(k * PI); });
  R.sconces.forEach((l, i) => l.intensity = 5 * (T > E.turns && T < E.turns + 1.2 && Math.floor(T * 14) % 3 === 0 ? 0.2 : 1)); }
// shot list: [start, place, fn(k, T)]
const SH = [
  [0, 'corr', (k, T) => { corrState(T, 1); R.corrLeo.visible = false; camL([100 + 0.9, 1.7, DZ[3] + 0.9], [100 + 0.6, 1.66, DZ[3] + 0.55], k, [100 - 1.45, 1.6, DZ[3]], [100 - 1.45, 1.6, DZ[3]]); }],
  [E.so0 - 0.1, 'lobby', (k, T) => { drawLCD(true, T); cam([1.0, 1.42, -0.05], [0.93, 1.16, -0.5]); }],
  [E.leo - 0.2, 'lobby', (k, T) => { camL([1.4, 1.75, 1.4], [1.2, 1.7, 1.1], k, [0, 1.6, -1.25], [0, 1.65, -1.25]); }],
  [E.hollow - 0.1, 'lobby', (k, T) => { drawLCD(true, T); camL([4.5, 2.6, 5.5], [3.6, 2.2, 4.6], k, [0, 1.3, -1.5], [0, 1.3, -1.5]); }],
  [E.likeT - 0.15, 'lobby', (k, T) => { camL([1.1, 1.7, -2.2], [1.25, 1.62, -2.6], k, [1.33, 1.56, -3.22], [1.33, 1.56, -3.22]); }],
  [E.fourth - 0.1, 'corr', (k, T) => { corrState(T, 0); R.corrLeo.visible = false; camL([100 + 1.1, 1.8, 2], [100 + 1.0, 1.7, 0], k, [100 - 1.3, 1.2, -12], [100 - 1.3, 1.2, -13]); }],
  [CL[2].start, 'lobby', (k, T) => { cam([-2.6, 2.6, -2.3], [-2.6, 2.6, -3.36]); }],
  [E.rings - 0.2, 'lobby', (k, T) => { drawLCD(true, T); camL([1.7, 1.75, 0.9], [1.4, 1.6, 0.5], k, [0.8, 1.2, -0.6], [0.85, 1.18, -0.55]); }],
  [E.screen - 0.1, 'lobby', (k, T) => { drawLCD(true, T); cam([0.97, 1.33, -0.25], [0.94, 1.16, -0.5]); }],
  [CL[3].start, 'lobby', (k, T) => { camL([-0.2, 1.75, 0.8], [-0.4, 1.7, 0.5], k, [-0.8, 1.4, -0.6], [-0.8, 1.4, -0.6]); }],
  [E.nosuch - 0.2, 'lobby', (k, T) => { cam([-0.8, 1.39, 0.32], [-0.8, 1.39, -0.49]); }],
  [CL[4].start, 'lobby', (k, T) => { camL([0.4, 0.55, -0.2], [0.5, 0.6, -0.35], k, [0.6, 1.03, -0.62], [0.6, 1.03, -0.62]); }],
  [E.hand - 0.1, 'lobby', (k, T) => { cam([0.6, 0.72, -0.5], [0.6, 1.03, -0.62]); }],
  [CL[5].start, 'lift', (k, T) => { camL([40 + 0.75, 1.75, 0.95], [40 + 0.6, 1.7, 0.85], k, [40 - 0.2, 1.3, -0.3], [40 - 0.2, 1.35, -0.3]); }],
  [E.r429 - 0.2, 'corr', (k, T) => { corrState(T, ease(prog(T, DOOR_APPEAR(), DOOR_APPEAR() + 1.6))); R.corrLeo.visible = true; R.corrLeo.position.set(0.2, 0, lerp(-1, -9.5, ease(prog(T, E.r429 - 0.2, E.between)))); R.corrLeo.rotation.y = PI; if (T < E.between) walkP(R.corrLeo, T * 7, 0.8); else { rest(R.corrLeo); R.corrLeo.rotation.y = -PI / 2; }
    camL([100 + 1.2, 1.9, 1], [100 + 1.0, 1.8, -6], k, [100 - 1.4, 1.2, -9], [100 - 1.4, 1.3, -12]); }],
  [CL[6].start, 'corr', (k, T) => { corrState(T, 1); R.corrLeo.visible = false; camL([100 - 0.95, 1.68, DZ[3] + 0.35], [100 - 1.05, 1.66, DZ[3] + 0.25], k, [100 - 1.45, 1.65, DZ[3]], [100 - 1.45, 1.65, DZ[3]]); }],
  [E.inside6 - 0.1, 'corr', (k, T) => { corrState(T, 1); R.corrLeo.visible = false; camL([100 - 0.6, 0.35, DZ[3] + 0.6], [100 - 0.7, 0.3, DZ[3] + 0.5], k, [100 - 1.45, 0.1, DZ[3]], [100 - 1.45, 0.08, DZ[3]]); }],
  [CL[7].start, 'corr', (k, T) => { corrState(T, 1); R.corrLeo.visible = false; camL([100 - 1.0, 1.15, DZ[3] + 0.75], [100 - 1.1, 1.08, DZ[3] + 0.6], k, [100 - 1.38, 1.0, DZ[3] + 0.3], [100 - 1.38, 1.0, DZ[3] + 0.3]); }],
  [CL[8].start, 'corr', (k, T) => { corrState(T, 1); R.corrLeo.visible = true; R.corrLeo.position.set(-0.45, 0, DZ[3] + 0.9); R.corrLeo.rotation.y = -PI / 2 - 0.5; rest(R.corrLeo); camL([100 + 1.2, 1.5, DZ[3] + 4.2], [100 + 1.1, 1.55, DZ[3] + 3.6], k, [100 - 1.2, 1.2, DZ[3] - 0.2], [100 - 1.3, 1.2, DZ[3] - 0.2]); }],
];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function shot(T) { const ci = CLI(T); const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; show(sh[1]); scene.background = new T3.Color('#050406');
  const ringing = T > E.rings - 0.3 && T < CL[3].start || T < E.leo - 0.2; R.phone.position.x = 0.9 + (ringing ? S(T * 60) * 0.004 : 0); R.ringL.intensity = ringing && S(T * 10) > 0 ? 0.35 : 0; drawLCD(ringing, T);
  const mode = T < E.nosuch - 0.1 ? 0 : T < E.booking - 0.1 ? 1 : T < E.forty - 0.3 ? 2 : T < E.never3 - 0.2 ? 3 : 4; drawScreen(mode, T); const mm = 29 + Math.floor(prog(T, CL[2].start, TM.total) * 12); drawClock(4, mm);
  R.key429a.visible = T > E.booking; R.leo.visible = true; rest(R.leo); R.leo.position.set(0, 0, -1.25); R.leo.rotation.y = 0; if (ci === 3) { R.leo.position.set(-0.6, 0, -1.25); R.leo.rotation.y = 0.35; R.leo.userData.armL.rotation.x = R.leo.userData.armR.rotation.x = -0.9; } if (ci === 4) { R.leo.userData.body.position.y = -0.5; R.leo.userData.legL.rotation.x = R.leo.userData.legR.rotation.x = -1.2; }
  rest(R.liftLeo); R.liftL.intensity = 3 * (Math.floor(T * 9) % 7 === 0 ? 0.3 : 1);
  sh[2](prog(T, t0, t1), T); return { si, t0 }; }

// ---------- HUD ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(5,4,8,0.92)'; octx.strokeText(s_, x, y); octx.fillStyle = col; octx.fillText(s_, x, y); octx.restore(); }
const CLUES = [['CALL FROM 429A', () => E.rings], ['BOOKED IN 1986', () => E.forty], ['NOTE IN HIS HANDWRITING', () => E.hand], ['A DOOR THAT WASN\'T THERE', () => E.door5], ['HANDLE TURNED . INSIDE', () => E.turns]];
function caseFile(T) { if (T < CL[1].start) return; const a = prog(T, CL[1].start, CL[1].start + 0.3); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(14,10,8,0.82)'; octx.beginPath(); octx.roundRect(24, 40, 420, 66 + CLUES.length * 34, 18); octx.fill(); octx.strokeStyle = 'rgba(200,160,80,0.6)'; octx.lineWidth = 2; octx.stroke();
  txt('CASE FILE . 429A', 44, 68, 18, '#e8c870', 'left', 'PressStart'); CLUES.forEach(([s_, f], i) => { const on = T > f(); const fl = on && T < f() + 0.5 ? 1 - (T - f()) / 0.5 : 0; const y = 108 + i * 34; if (fl) { octx.fillStyle = `rgba(232,200,112,${0.35 * fl})`; octx.fillRect(30, y - 15, 408, 30); } txt(on ? '■' : '□', 50, y, 18, on ? '#ff5a4a' : '#6a5a4a', 'left'); txt(on ? s_ : '???', 78, y, 20, on ? '#fff' : '#6a5a4a', 'left'); }); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(14,10,8,0.82)'; octx.beginPath(); octx.roundRect(470, 40, 226, 90, 18); octx.fill(); const mm = 29 + Math.floor(prog(T, CL[2].start, TM.total) * 12); txt(`4.${mm} AM`, 583, 86, 38, T > CL[2].start ? '#ff7a5a' : '#fff'); octx.restore(); }
function likePill(T) { const l0 = E.likeT, l1 = CL[4].start - 0.1; if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30);
  octx.fillStyle = 'rgba(10,8,8,0.85)'; octx.beginPath(); octx.roundRect(170, 960, 380, 70, 35); octx.fill(); octx.strokeStyle = '#e8c870'; octx.lineWidth = 3; octx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); octx.save(); octx.translate(216, 995); octx.scale(hb, hb); octx.fillStyle = '#ff5a6a'; octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore();
  txt('LIKE', 270, 996, 24, '#fff'); const fo = T > AT(3, 'follow'); octx.fillStyle = fo ? '#5ad88a' : '#e8c870'; octx.beginPath(); octx.roundRect(340, 973, 190, 44, 22); octx.fill(); txt(fo && T > AT(3, 'follow') + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 996, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['four', 'twenty', 'nine', 'a'], '429A'], [['four', 'twenty', 'nine'], '429'], [['four', 'thirty'], '430'], [['rule', 'one'], 'Rule 1.'], [['part', 'one'], 'part 1'], [['part', 'two'], 'part 2']];
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { o.push({ w: hit[1] + (/\.$/.test(ws[i + hit[0] - 1].w) && !/\.$/.test(hit[1]) ? '.' : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 5 || w.a - cur[cur.length - 1].b > 0.2 || (/^(There|So|Like|This|It's|On|Nothing|At|The|Room|Leo|No|But|One|Checked|Never|Then|Rule|And|From|Option|Open|Run|Comment|Under|Written|He|Four|A\.|B\.)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/\bat 429 in\b/i, 'at 4.29 in'); });
function caption(s_) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = s_.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1100 - (lines.length - 1) * 31; lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(5,4,8,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = '#fff'; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }

let SNAP;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 200); buildLobby(); buildLift(); buildCorr();
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe6c0'); gr.addColorStop(0.5, '#6a4a3a'); gr.addColorStop(1, '#1a1210'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(60, 14, 40, 14); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); ENV = pm.fromScene(es, 0.02).texture; scene.environment = ENV; }
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.08) saturate(1.05) sepia(0.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(3px)'; octx.globalAlpha = 0.2; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  // transition: zoom-blur punch for the first frames of every shot
  const tk = prog(T, t0, t0 + 0.18); if (si > 0 && tk < 1) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.05 * i; octx.globalAlpha = 0.22 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.6) contrast(2.4)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.45; octx.imageSmoothingEnabled = true; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.08; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const vg = octx.createRadialGradient(360, 640, 380, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { big('THERE IS NO', 230, 54, '#fff', 1); big('ROOM 429A', 320, 100, '#e8c870', 1); if (T > E.so0 - 0.1) big('SO WHO JUST CALLED?', 420, 44, '#ff5a4a', prog(T, E.so0 - 0.1, E.so0 + 0.15)); }
  caseFile(T); likePill(T);
  if (ci === 1) { if (T < E.fourth - 0.1) { big('LEO', 300, 90, '#e8c870', prog(T, E.leo - 0.1, E.leo + 0.2)); big('NIGHT DESK', 380, 44, '#fff', prog(T, AT(1, 'night') - 0.1, AT(1, 'night') + 0.2)); } else { big('429', 300, 60, '#fff', prog(T, AT(1, 'room') - 0.1, AT(1, 'room') + 0.2), 220); big('430', 300, 60, '#fff', prog(T, AT(1, 'thirty') - 0.2, AT(1, 'thirty') + 0.1), 500); if (T > E.nothing - 0.1) big('NOTHING IN BETWEEN', 390, 46, '#ff5a4a', prog(T, E.nothing - 0.1, E.nothing + 0.2)); } }
  if (ci === 2 && T < E.rings - 0.2) big('4.29 AM', 330, 96, '#ff7a5a', prog(T, CL[2].start, CL[2].start + 0.2));
  if (ci === 2 && T > E.says) big('ROOM 429A', 300, 80, '#ff5a4a', prog(T, E.says, E.says + 0.2));
  if (ci === 3 && T > E.forty - 0.2) big('40 YEARS AGO TONIGHT', 300, 46, '#e8c870', prog(T, E.forty - 0.2, E.forty + 0.1));
  if (ci === 4 && T > E.hand - 0.1) { big("LEO'S OWN", 290, 70, '#fff', prog(T, AT(4, 'own') - 0.3, AT(4, 'own'))); big('HANDWRITING', 370, 70, '#ff5a4a', prog(T, AT(4, 'handwriting') - 0.1, AT(4, 'handwriting') + 0.2)); }
  if (ci === 5 && T > E.door5 - 0.2) big("WASN'T THERE THIS AFTERNOON", 330, 36, '#e8c870', prog(T, E.door5 - 0.2, E.door5 + 0.1));
  if (ci === 6) { if (T < E.inside6) big('STILL WARM', 320, 70, '#ff9a5a', prog(T, AT(6, 'warm') - 0.1, AT(6, 'warm') + 0.2)); else big('STILL RINGING', 320, 64, '#ff5a4a', prog(T, AT(6, 'ringing') - 0.1, AT(6, 'ringing') + 0.2)); }
  if (ci === 7 && T > E.fromIn - 0.1) big('FROM THE INSIDE', 320, 64, '#ff5a4a', prog(T, E.fromIn - 0.1, E.fromIn + 0.2));
  if (ci === 8) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.2; big(A ? 'A. OPEN THE DOOR' : 'B. RUN TO THE LIFT', 520, A ? 62 : 56, A ? '#e8c870' : '#7ad0ff', 1); big(A ? 'SEE WHO IS INSIDE' : 'CALL THE MANAGER', 600, 38, '#fff', 1); }
    else { big('COMMENT A OR B', 520, 70, '#e8c870', prog(T, E.comment - 0.1, E.comment + 0.2)); big('FOLLOW FOR PART 2', 610, 44, '#fff', prog(T, AT(8, 'follow') - 0.2, AT(8, 'follow') + 0.1)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) caption(cap.txt);
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); } };
})();
