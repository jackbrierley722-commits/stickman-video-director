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

const G = {}; const R = {}; let SNAP;
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

// ---------- 1986 room ----------
const RX = 200; const RP = (x, y, z) => [RX + x, y, z];
function shagT() { const r = rng(5); const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#b8581a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = r(); c.fillStyle = v < 0.4 ? 'rgba(90,30,8,0.5)' : v < 0.8 ? 'rgba(240,140,60,0.45)' : 'rgba(255,190,100,0.4)'; const x = r() * w, y = r() * h; c.fillRect(x, y, 1.5, 3 + r() * 3); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(4, 4); return t; }
function wall70T() { const t = ctex(128, 128, (c, w, h) => { c.fillStyle = '#6a4024'; c.fillRect(0, 0, w, h); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { const cx = x * 64 + 32, cy = y * 64 + 32; ['#e8a030', '#c86420', '#8a4a20'].forEach((col, k) => { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 26 - k * 8, 0, 7); c.stroke(); }); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(5, 1.4); return t; }
function spreadT() { return ctex(256, 256, (c, w, h) => { c.fillStyle = '#a0461a'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h; for (let k = 0; k < 6; k++) { c.fillStyle = ['#e8a030', '#f4d070', '#6a2a10'][k % 3]; c.beginPath(); c.ellipse(x + C(k) * 10, y + S(k) * 10, 9, 5, k, 0, 7); c.fill(); } c.fillStyle = '#3a1a08'; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } }); }
function buildRoom() { const g = G.room = new T3.Group(); g.position.x = RX; scene.add(g); const wood = SM('#ffffff', { map: woodT(), roughness: 0.45 }), brass = SM('#c8a050', { metalness: 0.9, roughness: 0.25 }), wp = SM('#ffffff', { map: wall70T(), roughness: 0.85 });
  add(g, Bx(6, 0.06, 7), SM('#ffffff', { map: shagT(), roughness: 1 }), 0, -0.03, 0); add(g, Bx(6, 0.06, 7), SM('#e8dcc0'), 0, 2.73, 0);
  add(g, Bx(6, 2.7, 0.1), wp, 0, 1.35, -3.5); add(g, Bx(0.1, 2.7, 7), wp, -3, 1.35, 0); add(g, Bx(0.1, 2.7, 7), wp, 3, 1.35, 0);
  add(g, Bx(1.03, 2.7, 0.1), wp, -2.49, 1.35, 3.5); add(g, Bx(3.97, 2.7, 0.1), wp, 1.0, 1.35, 3.5); add(g, Bx(0.96, 0.6, 0.1), wp, -1.5, 2.4, 3.5);
  for (const [w, d, x, z] of [[6, 0.06, 0, -3.44], [0.06, 7, -2.94, 0], [0.06, 7, 2.94, 0]]) add(g, Bx(w, 1.0, d), wood, x, 0.5, z);
  // bed
  add(g, RB(2, 0.4, 2.4, 0.05), wood, 0.6, 0.22, -2.2); add(g, Bx(1.9, 0.25, 2.3), SM('#ffffff', { map: spreadT(), roughness: 0.9 }), 0.6, 0.52, -2.2); add(g, Bx(2.1, 1.1, 0.12), wood, 0.6, 0.75, -3.4);
  for (const x of [0.15, 1.05]) add(g, RB(0.7, 0.14, 0.4, 0.06), SM('#f0e4cc', { roughness: 0.9 }), x, 0.72, -3.05);
  // bedside + rotary phone + lamp
  add(g, RB(0.6, 0.6, 0.5, 0.03), wood, -0.8, 0.3, -3.05); R.rphone = new T3.Group(); R.rphone.position.set(-0.85, 0.6, -2.95); g.add(R.rphone); const cream = SM('#efe2c4', { roughness: 0.35 });
  add(R.rphone, RB(0.26, 0.12, 0.22, 0.04), cream, 0, 0.06, 0); const dial = add(R.rphone, new T3.CylinderGeometry(0.075, 0.075, 0.02, 24), SM('#f8f0e0'), 0, 0.13, 0.04); dial.rotation.x = 0.4;
  R.rhand = new T3.Group(); R.rhand.position.set(0, 0.16, -0.04); R.rphone.add(R.rhand); const hc = add(R.rhand, new T3.CapsuleGeometry(0.03, 0.2, 6, 12), cream, 0, 0, 0); hc.rotation.z = PI / 2; for (const sx of [-1, 1]) add(R.rhand, new T3.SphereGeometry(0.045, 12, 10), cream, sx * 0.12, -0.01, 0).scale.y = 0.7;
  add(g, new T3.CylinderGeometry(0.05, 0.08, 0.3, 12), SM('#c86420'), -0.65, 0.75, -3.2); add(g, new T3.ConeGeometry(0.2, 0.22, 20, 1, true), SM('#e8a030', { emissive: '#e88a30', emissiveIntensity: 0.6, side: T3.DoubleSide }), -0.65, 1.0, -3.2);
  const ll = new T3.PointLight('#ffb060', 3, 6, 1.6); ll.position.set(-0.65, 0.95, -3.0); ll.castShadow = true; g.add(ll); glow(g, '#ffb060', 0.7, -0.65, 0.98, -3.15, 0.5);
  // TV
  const tv = new T3.Group(); tv.position.set(2.2, 0, -2.5); tv.rotation.y = -0.65; g.add(tv); add(tv, RB(1.15, 1.0, 0.75, 0.05), wood, 0, 0.5, 0); add(tv, Bx(0.85, 0.66, 0.05), SM('#1a1a1a'), -0.1, 0.55, 0.38);
  R.tvT = ctex(96, 72, () => {}); R.tvS = add(tv, new T3.PlaneGeometry(0.7, 0.52), new T3.MeshBasicMaterial({ map: R.tvT, toneMapped: false, color: '#c8d0d8' }), -0.1, 0.55, 0.415, false); for (let k = 0; k < 2; k++) add(tv, new T3.CylinderGeometry(0.035, 0.035, 0.03, 12), brass, 0.42, 0.7 - k * 0.15, 0.39).rotation.x = PI / 2;
  add(tv, new T3.CylinderGeometry(0.01, 0.01, 0.6, 6), SM('#888', { metalness: 0.8 }), 0.2, 1.25, 0).rotation.z = 0.5; add(tv, new T3.CylinderGeometry(0.01, 0.01, 0.6, 6), SM('#888', { metalness: 0.8 }), -0.1, 1.25, 0).rotation.z = -0.5;
  R.tvL = new T3.PointLight('#bcd4ff', 1.5, 4, 1.6); R.tvL.position.set(1.6, 0.8, -1.8); g.add(R.tvL);
  // record player
  add(g, RB(0.5, 0.6, 1.2, 0.03), wood, -2.65, 0.3, -1.6); add(g, RB(0.45, 0.1, 0.5, 0.02), SM('#3a2a1a', { roughness: 0.4 }), -2.65, 0.65, -1.6);
  R.disc = new T3.Group(); R.disc.position.set(-2.65, 0.71, -1.6); g.add(R.disc); add(R.disc, new T3.CylinderGeometry(0.17, 0.17, 0.008, 40), SM('#0e0e10', { roughness: 0.25, metalness: 0.2 }), 0, 0, 0); add(R.disc, new T3.CylinderGeometry(0.06, 0.06, 0.01, 24), SM('#e85a2a'), 0, 0.002, 0); add(R.disc, Bx(0.03, 0.012, 0.03), SM('#f4d070'), 0.035, 0.006, 0);
  const arm = add(g, Bx(0.012, 0.012, 0.22), SM('#c8c8c8', { metalness: 0.8 }), -2.5, 0.74, -1.5); arm.rotation.y = 0.5;
  // desk, guest book, banker lamp
  add(g, Bx(0.75, 0.05, 1.5), wood, -2.6, 0.78, 0.6); for (const z of [-0.1, 1.3]) add(g, Bx(0.7, 0.76, 0.05), wood, -2.6, 0.38, z);
  R.bookT = ctex(512, 320, () => {}); const bk = add(g, new T3.PlaneGeometry(0.5, 0.32), new T3.MeshStandardMaterial({ map: R.bookT, roughness: 0.8, color: '#cfc6b4' }), -2.55, 0.815, 0.6, false); bk.rotation.set(-PI / 2, 0, -PI / 2); add(g, Bx(0.34, 0.02, 0.52), SM('#5a1a1a'), -2.55, 0.8, 0.6);
  add(g, new T3.CylinderGeometry(0.008, 0.008, 0.14, 8), SM('#1a3a8a'), -2.4, 0.83, 0.95).rotation.set(PI / 2, 0, 0.6);
  add(g, new T3.CylinderGeometry(0.03, 0.06, 0.25, 10), brass, -2.8, 0.93, 1.15); add(g, new T3.CylinderGeometry(0.1, 0.1, 0.25, 16, 1, true, 0, PI), SM('#2a6a3a', { side: T3.DoubleSide, emissive: '#1a4a2a', emissiveIntensity: 0.4 }), -2.75, 1.08, 1.15).rotation.z = PI / 2;
  const dl = new T3.PointLight('#ffd8a0', 1.1, 3, 1.6); dl.position.set(-2.6, 1.05, 0.9); g.add(dl);
  // calendar
  R.calT = ctex(256, 320, (c) => { c.fillStyle = '#f8f0e0'; c.fillRect(0, 0, 256, 320); c.fillStyle = '#c84a2a'; c.fillRect(0, 0, 256, 70); c.fillStyle = '#fff'; c.font = '30px Russo'; c.textAlign = 'center'; c.fillText('NOVEMBER', 128, 34); c.font = '24px Russo'; c.fillText('1986', 128, 62);
    c.fillStyle = '#3a2a1a'; c.font = '20px Russo'; for (let d = 1; d <= 30; d++) { const k = d + 5 - 1, x = 22 + (k % 7) * 35, y = 108 + Math.floor(k / 7) * 42; c.fillText(String(d), x, y); if (d === 11) { c.strokeStyle = '#d81a1a'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y - 7, 18, 16, 0, 0, 7); c.stroke(); } } });
  add(g, new T3.PlaneGeometry(0.42, 0.52), new T3.MeshStandardMaterial({ map: R.calT, roughness: 0.8 }), -2.93, 1.75, 1.9, false).rotation.y = PI / 2;
  // window with city + ledge, curtains
  add(g, new T3.PlaneGeometry(1.5, 1.35), new T3.MeshBasicMaterial({ map: ctex(256, 230, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1028'); gr.addColorStop(1, '#2a2a4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 14; i++) { const bx = r() * w, bw = 20 + r() * 30, bh = 60 + r() * 110; c.fillStyle = '#12142a'; c.fillRect(bx, h - 40 - bh, bw, bh); for (let k = 0; k < 20; k++) if (r() < 0.5) { c.fillStyle = r() < 0.7 ? '#f4c86a' : '#8ab4ff'; c.fillRect(bx + 3 + (k % 4) * 6, h - 40 - bh + 6 + Math.floor(k / 4) * 12, 3, 5); } } c.fillStyle = '#6a6a72'; c.fillRect(0, h - 40, w, 22); c.fillStyle = '#4a4a52'; c.fillRect(0, h - 18, w, 18); c.fillStyle = '#f8f0d8'; c.beginPath(); c.arc(200, 40, 14, 0, 7); c.fill(); }), toneMapped: false, color: '#a8a8b8' }), 2.94, 1.55, 0, false).rotation.y = -PI / 2;
  add(g, Bx(0.08, 0.08, 1.62), wood, 2.92, 0.86, 0); add(g, Bx(0.08, 0.08, 1.62), wood, 2.92, 2.24, 0); add(g, Bx(0.05, 1.35, 0.05), wood, 2.93, 1.55, 0);
  R.curt = []; for (const sz of [-1, 1]) { const cg = new T3.Group(); cg.position.set(2.85, 0, sz * 1.0); g.add(cg); for (let k = 0; k < 5; k++) add(cg, new T3.CylinderGeometry(0.06, 0.07, 2.4, 10), SM('#8a3a14', { roughness: 0.9 }), 0, 1.25, k * 0.09 - 0.18); R.curt.push(cg); }
  const moon = new T3.DirectionalLight('#8aa8ff', 0.6); moon.position.set(8, 3, 0.5); moon.target.position.set(0, 0, 0); g.add(moon); g.add(moon.target);
  // tea table + armchair
  add(g, new T3.CylinderGeometry(0.35, 0.35, 0.04, 28), wood, 2.1, 0.7, 1.2); add(g, new T3.CylinderGeometry(0.04, 0.06, 0.7, 10), wood, 2.1, 0.35, 1.2);
  add(g, new T3.CylinderGeometry(0.1, 0.1, 0.01, 24), SM('#f8f4ec'), 2.05, 0.725, 1.15); R.cup = add(g, new T3.CylinderGeometry(0.05, 0.04, 0.08, 20), SM('#f8f4ec', { roughness: 0.3 }), 2.05, 0.77, 1.15); add(g, new T3.CylinderGeometry(0.045, 0.045, 0.005, 20), SM('#8a4a1a', { roughness: 0.1 }), 2.05, 0.805, 1.15, false); add(g, new T3.TorusGeometry(0.025, 0.007, 8, 16), SM('#f8f4ec', { roughness: 0.3 }), 2.1, 0.775, 1.15);
  R.steam = []; for (let k = 0; k < 10; k++) { const s_ = glow(g, '#ffffff', 0.08, 2.05, 0.85, 1.15, 0.3); s_.material.blending = T3.NormalBlending; R.steam.push(s_); }
  const mus = SM('#c8962a', { roughness: 0.9 }); add(g, RB(0.8, 0.4, 0.8, 0.1), mus, 2.3, 0.3, 2.3); add(g, RB(0.8, 0.7, 0.2, 0.08), mus, 2.3, 0.75, 2.65); for (const sx of [-1, 1]) add(g, RB(0.18, 0.5, 0.8, 0.07), mus, 2.3 + sx * 0.36, 0.45, 2.3);
  // inside of the door
  R.idoor = new T3.Group(); R.idoor.position.set(-1.975, 0, 3.43); g.add(R.idoor); R.islab = add(R.idoor, Bx(0.95, 2.1, 0.06), wood, 0.475, 1.05, 0); R.ihandle = new T3.Group(); R.ihandle.position.set(0.85, 1.0, -0.05); R.idoor.add(R.ihandle); add(R.ihandle, new T3.SphereGeometry(0.035, 14, 10), brass, 0, 0, 0); add(R.ihandle, Bx(0.12, 0.025, 0.025), brass, -0.06, 0, -0.02);
  R.peep = add(R.idoor, new T3.TorusGeometry(0.018, 0.007, 8, 18), brass, 0.475, 1.6, -0.035); R.peepG = add(R.idoor, new T3.CircleGeometry(0.014, 16), new T3.MeshBasicMaterial({ color: '#ffe0a0', toneMapped: false }), 0.475, 1.6, -0.034, false); R.peepG.rotation.y = PI;
  R.gap = add(g, new T3.PlaneGeometry(0.9, 0.08), new T3.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0.8, toneMapped: false }), -1.5, 0.006, 3.38, false); R.gap.rotation.x = -PI / 2;
  R.feet = []; for (const sx of [-0.15, 0.15]) { const f = add(g, new T3.PlaneGeometry(0.12, 0.12), new T3.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.85 }), -1.5 + sx, 0.008, 3.4, false); f.rotation.x = -PI / 2; R.feet.push(f); }
  R.doorL = new T3.PointLight('#ffd0a0', 0, 3, 1.6); R.doorL.position.set(-1.5, 0.2, 3.7); g.add(R.doorL);
  g.add(new T3.HemisphereLight('#ffd8b0', '#3a1a0a', 0.45)); const cl = new T3.PointLight('#ffc890', 2.5, 9, 1.6); cl.position.set(0, 2.5, 0.5); cl.castShadow = true; g.add(cl);
  R.rleo = human({ top: '#6a1420', bot: '#1a1a22', hair: '#3a2414', skin: '#e0b090' }); g.add(R.rleo); }
function drawBook(a) { const c = R.bookT.userData.g; c.fillStyle = '#f4ead0'; c.fillRect(0, 0, 512, 320); c.fillStyle = '#c8b890'; c.fillRect(254, 0, 4, 320); c.strokeStyle = 'rgba(80,110,160,0.35)'; c.lineWidth = 1; for (let y = 70; y < 320; y += 34) { c.beginPath(); c.moveTo(10, y); c.lineTo(502, y); c.stroke(); }
  c.fillStyle = '#5a1a1a'; c.font = '20px Russo'; c.fillText('HOLLOW CREST . GUESTS', 20, 36); c.fillStyle = '#3a2a1a'; c.font = 'italic 26px Georgia, serif'; c.fillText('11 Nov 1986', 18, 98); c.fillText('M. Hale', 200, 98); c.fillText('429A', 400, 98);
  if (a > 0) { c.save(); c.globalAlpha = a; c.fillStyle = '#1a3ab8'; c.font = 'italic 30px Georgia, serif'; c.fillText('11 Nov 2026', 18, 132); c.font = 'italic bold 34px Georgia, serif'; c.fillText('Leo', 210, 132); c.font = 'italic 30px Georgia, serif'; c.fillText('429A', 400, 132); c.restore(); } R.bookT.needsUpdate = true; }
function drawTV() { const c = R.tvT.userData.g; const id = c.createImageData(96, 72); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } c.putImageData(id, 0, 0); R.tvT.needsUpdate = true; }

// ---------- timeline ----------
const E = { inside: AT(0, 'inside'), tea: AT(0, 'and'), orange: CL[1].start, record: AT(1, 'a'), tv: AT(1, 'a', 1), everything: AT(1, 'everything'), calendar: AT(1, 'even'), eleven: AT(1, 'eleven'),
  desk: CL[2].start, one: AT(2, 'one'), but2: AT(2, 'but'), leo2: AT(2, 'leo'), never: CL[3].start, like: AT(3, 'like'), phone: CL[4].start, picks: AT(4, 'leo'), whis: AT(4, 'a'), w5: CL[5].start,
  behind: CL[6].start, slams: AT(6, 'slams'), handle: AT(6, 'the', 1), gone: AT(6, 'gone'), knocks: AT(6, 'then'), knockW: AT(6, 'knocks'), three: AT(6, 'three'), optA: CL[7].start, optB: AT(7, 'option', 1), comment: AT(7, 'comment'), follow: AT(7, 'follow') };
E.loop = TM.total - 0.45; const KN = [E.knockW + 0.3, E.knockW + 0.62, E.knockW + 0.94];
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
function show(k) { for (const n of ['corr', 'room']) G[n].visible = n === k; }
function corrOpen(T) { const d = R.doors[3]; d.visible = true; d.userData.slab.visible = false; d.userData.slab.material.opacity = 1; d.userData.frame.material.opacity = 1; d.userData.pl.material.opacity = 1; d.userData.pl.material.emissiveIntensity = 0.5 + 0.2 * S(T * 3); R.under.material.opacity = 0; R.dust.forEach(p => p.material.opacity = 0); }
const S0 = (k, T) => { corrOpen(T); R.corrLeo.visible = true; rest(R.corrLeo); R.corrLeo.position.set(0.25, 0, DZ[3] + 1.0); R.corrLeo.rotation.y = -PI / 2 - 0.35; camL([100 + 1.25, 1.75, DZ[3] + 2.7], [100 + 0.85, 1.7, DZ[3] + 2.1], k, [100 - 1.5, 1.3, DZ[3]], [100 - 1.5, 1.3, DZ[3]]); };
const SH = [
  [0, 'corr', S0],
  [E.inside - 0.1, 'room', (k, T) => camL(RP(-1.4, 1.7, 3.25), RP(-1.2, 1.65, 2.9), k, RP(0.6, 0.9, -2), RP(0.4, 0.9, -2))],
  [E.tea - 0.1, 'room', (k, T) => camL(RP(1.72, 1.0, 1.5), RP(1.82, 0.96, 1.4), k, RP(2.05, 0.8, 1.15), RP(2.05, 0.82, 1.15))],
  [E.orange, 'room', (k, T) => camL(RP(-1.0, 0.25, 1.6), RP(0.4, 0.28, 0.6), k, RP(1.2, 0.05, -1), RP(1.6, 0.05, -1.4))],
  [E.record - 0.1, 'room', (k, T) => camL(RP(-2.15, 1.15, -1.15), RP(-2.25, 1.05, -1.25), k, RP(-2.65, 0.7, -1.6), RP(-2.65, 0.7, -1.6))],
  [E.tv - 0.1, 'room', (k, T) => camL(RP(1.0, 1.0, -0.9), RP(1.2, 0.95, -1.2), k, RP(2.05, 0.6, -2.3), RP(2.05, 0.6, -2.3))],
  [E.everything - 0.1, 'room', (k, T) => camL(RP(2.6, 2.4, 3.1), RP(2.2, 2.35, 3.2), k, RP(-0.6, 0.6, -1.5), RP(-0.8, 0.6, -1.4))],
  [E.calendar - 0.1, 'room', (k, T) => camL(RP(-2.05, 1.72, 1.9), RP(-2.3, 1.74, 1.9), k, RP(-2.93, 1.74, 1.9), RP(-2.93, 1.74, 1.9))],
  [E.desk, 'room', (k, T) => camL(RP(-1.0, 1.6, 1.6), RP(-1.2, 1.55, 1.4), k, RP(-2.6, 0.85, 0.6), RP(-2.6, 0.85, 0.6))],
  [E.one - 0.1, 'room', (k, T) => { camera.up.set(1, 0, 0); camL(RP(-2.5, 1.35, 0.6), RP(-2.53, 1.2, 0.6), k, RP(-2.55, 0.81, 0.6), RP(-2.55, 0.81, 0.6)); }],
  [E.leo2 - 0.15, 'room', (k, T) => { camera.up.set(1, 0, 0); camL(RP(-2.48, 1.2, 0.66), RP(-2.5, 1.12, 0.66), k, RP(-2.52, 0.81, 0.66), RP(-2.52, 0.81, 0.66)); }],
  [E.never, 'room', (k, T) => camL(RP(-2.75, 1.6, 1.3), RP(-2.8, 1.62, 1.15), k, RP(-1.9, 1.5, 0.6), RP(-1.9, 1.55, 0.6))],
  [E.like - 0.15, 'room', (k, T) => camL(RP(2.8, 2.6, 3.3), RP(2.75, 2.58, 3.25), k, RP(-1, 0.5, -0.5), RP(-1.1, 0.5, -0.6))],
  [E.phone, 'room', (k, T) => camL(RP(-0.45, 1.0, -2.3), RP(-0.55, 0.95, -2.45), k, RP(-0.85, 0.66, -2.95), RP(-0.85, 0.66, -2.95))],
  [E.picks - 0.1, 'room', (k, T) => camL(RP(1.0, 1.5, -0.9), RP(0.9, 1.5, -1.1), k, RP(-0.4, 1.2, -2.6), RP(-0.4, 1.3, -2.6))],
  [E.whis - 0.2, 'room', (k, T) => camL(RP(0.75, 1.6, -1.85), RP(0.6, 1.62, -2.0), k, RP(-0.3, 1.5, -2.5), RP(-0.3, 1.55, -2.5))],
  [E.w5, 'room', (k, T) => camL(RP(0.45, 1.68, -2.2), RP(0.35, 1.68, -2.3), k, RP(-0.3, 1.62, -2.5), RP(-0.3, 1.64, -2.5))],
  [E.behind, 'room', (k, T) => camL(RP(0.35, 1.7, -0.7), RP(0.3, 1.7, -0.4), k, RP(-1.5, 1.2, 3.4), RP(-1.5, 1.2, 3.4))],
  [E.handle - 0.1, 'room', (k, T) => camL(RP(-0.62, 1.08, 2.75), RP(-0.64, 1.05, 2.95), k, RP(-1.13, 1.0, 3.4), RP(-1.13, 1.0, 3.4))],
  [E.knocks - 0.1, 'room', (k, T) => camL(RP(-1.1, 0.35, 2.3), RP(-1.15, 0.3, 2.5), k, RP(-1.5, 0.3, 3.4), RP(-1.5, 0.3, 3.4))],
  [E.three - 0.15, 'room', (k, T) => camL(RP(-1.5, 1.6, 0.6), RP(-1.5, 1.6, 1.0), k, RP(-1.5, 1.3, 3.4), RP(-1.5, 1.3, 3.4))],
  [E.optA, 'room', (k, T) => camL(RP(-1.03, 1.61, 3.05), RP(-1.03, 1.61, 3.2), k, RP(-1.025, 1.6, 3.4), RP(-1.025, 1.6, 3.4))],
  [E.optB - 0.1, 'room', (k, T) => camL(RP(1.2, 1.5, 0.7), RP(1.6, 1.5, 0.4), k, RP(2.94, 1.5, 0), RP(2.94, 1.5, 0))],
  [E.comment - 0.1, 'room', (k, T) => camL(RP(0.9, 2.3, -2.7), RP(0.8, 2.3, -2.9), k, RP(0, 1, 1.6), RP(0, 1, 1.6))],
  [E.loop, 'corr', (k, T) => S0(0, T)],
];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function anim(T) { const L = R.rleo; rest(L); L.visible = true; const ci = CLI(T);
  if (T < E.desk) { const w = prog(T, E.inside - 0.1, E.tea); L.position.set(lerp(-1.5, -0.6, w), 0, lerp(3.0, 1.6, w)); L.rotation.y = PI + 0.3; if (w > 0 && w < 1) walkP(L, T * 7, 0.8); }
  else if (T < E.phone) { L.position.set(-1.9, 0, 0.6); L.rotation.y = -PI / 2; L.userData.armR.rotation.x = -0.4; }
  else if (T < E.behind) { const w = prog(T, E.phone, E.picks); L.position.set(lerp(-1.4, -0.3, w), 0, lerp(0.2, -2.5, w)); L.rotation.y = w < 1 ? PI : PI / 2; if (w > 0 && w < 1) walkP(L, T * 7, 0.8); }
  else { L.position.set(0, 0, 0.5); L.rotation.y = 0; if (T > E.slams - 0.1 && T < E.slams + 0.6) L.userData.body.position.y = -0.03; }
  // phone + handset
  const ringing = T > E.phone && T < E.picks + 0.3; R.rphone.position.x = -0.85 + (ringing ? S(T * 70) * 0.004 : 0); R.rhand.rotation.z = ringing ? S(T * 55) * 0.05 : 0;
  if (T > E.picks + 0.3 && T < E.behind) { L.updateMatrixWorld(true); R.rhand.position.set(0.48, 1.0, 0.48); R.rhand.rotation.set(0, 0.6, 1.2); L.userData.armL.rotation.x = -2.5; L.userData.armL.rotation.z = 0.2; } else { R.rhand.position.set(0, 0.16, -0.04); R.rhand.rotation.set(0, 0, R.rhand.rotation.z); }
  // door: open until slam, then knocks
  let da = T < E.slams - 0.08 ? 1.35 : 1.35 * (1 - ease(prog(T, E.slams - 0.08, E.slams + 0.04))); KN.forEach(kt => { if (T > kt && T < kt + 0.15) da += S((T - kt) * 60) * 0.006; }); R.idoor.rotation.y = da;
  R.ihandle.visible = T < E.gone; R.ihandle.scale.setScalar(T > E.gone - 0.25 ? 1 - prog(T, E.gone - 0.25, E.gone) : 1);
  R.feet.forEach(f => f.visible = T > E.knocks); R.gap.material.opacity = T > E.slams ? 0.85 : 0; R.doorL.intensity = T > E.slams ? 1.2 : 0;
  R.peepG.material.color.set(T > E.optA ? '#ffe0a0' : '#5a4a3a');
  R.disc.rotation.y = -T * 3.5; drawTV(); R.tvL.intensity = 1.2 + Math.random() * 0.6; drawBook(ease(prog(T, E.but2 + 0.3, E.leo2 + 0.2)));
  R.steam.forEach((s_, k) => { const q = (T * 0.35 + k / 10) % 1; s_.position.set(2.05 + S(q * 9 + k) * 0.03 * q * 3, 0.83 + q * 0.4, 1.15 + C(q * 7 + k) * 0.03 * q * 3); s_.scale.setScalar(0.06 + q * 0.12); s_.material.opacity = 0.35 * S(q * PI); });
  R.curt.forEach((c, k) => c.rotation.x = S(T * 0.8 + k) * 0.015); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; show(sh[1]); camera.up.set(0, 1, 0); scene.background = new T3.Color('#050406'); anim(T); sh[2](prog(T, t0, t1), T); return { si, t0, place: sh[1] }; }

// ---------- HUD ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(5,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
const CLUES = [['STILL 1986 INSIDE', () => E.inside + 0.6], ['TEA STILL HOT', () => E.tea + 0.5], ["LEO'S NAME IN THE BOOK", () => E.leo2], ['DOOR SLAMMED SHUT', () => E.slams], ['HANDLE GONE', () => E.gone]];
function caseFile(T, show_) { if (!show_) return; octx.save(); octx.fillStyle = 'rgba(14,10,8,0.82)'; octx.beginPath(); octx.roundRect(24, 40, 420, 66 + CLUES.length * 34, 18); octx.fill(); octx.strokeStyle = 'rgba(200,160,80,0.6)'; octx.lineWidth = 2; octx.stroke();
  txt('CASE FILE . 429A', 44, 68, 18, '#e8c870', 'left', 'PressStart'); CLUES.forEach(([s_, f], i) => { const on = T > f(); const fl = on && T < f() + 0.5 ? 1 - (T - f()) / 0.5 : 0; const y = 108 + i * 34; if (fl) { octx.fillStyle = `rgba(232,200,112,${0.35 * fl})`; octx.fillRect(30, y - 15, 408, 30); } txt(on ? '■' : '□', 50, y, 18, on ? '#ff5a4a' : '#6a5a4a', 'left'); txt(on ? s_ : '???', 78, y, 20, on ? '#fff' : '#6a5a4a', 'left'); });
  octx.fillStyle = 'rgba(14,10,8,0.82)'; octx.beginPath(); octx.roundRect(470, 40, 226, 108, 18); octx.fill(); const mm = 41 + Math.floor(prog(T, 0, TM.total) * 6); txt(`4.${mm} AM`, 583, 82, 38, '#ff7a5a'); txt('PART 2', 583, 126, 18, '#e8c870', 'center', 'PressStart'); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30);
  octx.fillStyle = 'rgba(10,8,8,0.85)'; octx.beginPath(); octx.roundRect(170, 940, 380, 70, 35); octx.fill(); octx.strokeStyle = '#e8c870'; octx.lineWidth = 3; octx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); octx.save(); octx.translate(216, 975); octx.scale(hb, hb); octx.fillStyle = '#ff5a6a'; octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore();
  txt('LIKE', 270, 976, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#e8c870'; octx.beginPath(); octx.roundRect(340, 953, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 976, 20, '#0a0a10'); octx.restore(); }
const SEQ = [[['four', 'twenty', 'nine', 'a'], '429A'], [['nineteen', 'eighty', 'six'], '1986'], [['eleven', 'november'], '11 November'], [['part', 'three'], 'part 3']];
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { o.push({ w: hit[1] + (/\.$/.test(ws[i + hit[0] - 1].w) ? '.' : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 5 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function caption(s_, whisper) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = s_.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1100 - (lines.length - 1) * 31; lines.forEach((l, i) => { const jx = whisper ? (Math.random() - 0.5) * 3 : 0; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(5,4,8,0.95)'; octx.strokeText(l, 360 + jx, y0 + i * 62); octx.fillStyle = whisper ? '#ff6a5a' : '#fff'; octx.fillText(l, 360 + jx, y0 + i * 62); }); octx.restore(); }
function tag(s_, a) { if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = '30px Russo'; const w = octx.measureText(s_).width + 50; octx.fillStyle = 'rgba(14,10,8,0.82)'; octx.beginPath(); octx.roundRect(360 - w / 2, 320, w, 58, 29); octx.fill(); octx.strokeStyle = '#e8c870'; octx.lineWidth = 3; octx.stroke(); txt(s_, 360, 350, 30, '#fff'); octx.restore(); }

window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 200); buildCorr(); buildRoom();
  { const g = G.corr; R.doorGlow = add(g, new T3.PlaneGeometry(0.9, 2.05), new T3.MeshBasicMaterial({ color: '#ffb060', toneMapped: false }), -1.53, 1.05, DZ[3], false); R.doorGlow.rotation.y = PI / 2; const dl = new T3.PointLight('#ffa050', 4, 6, 1.5); dl.position.set(-1.1, 1.3, DZ[3]); g.add(dl); glow(g, '#ffb060', 2.2, -1.3, 1.2, DZ[3], 0.35); }
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe6c0'); gr.addColorStop(0.5, '#6a4a3a'); gr.addColorStop(1, '#1a1210'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(60, 14, 40, 14); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); ENV = pm.fromScene(es, 0.02).texture; scene.environment = ENV; }
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0, place } = shot(T); renderer.render(scene, camera); const loop = T >= E.loop;
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.08) saturate(1.08) sepia(0.1)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(3px)'; octx.globalAlpha = 0.18; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.18); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.05 * i; octx.globalAlpha = 0.22 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.6) contrast(2.4)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.42; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.08; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const wv = ci === 5 ? 0.85 : 0.6; const vg = octx.createRadialGradient(360, 640, ci === 5 ? 250 : 380, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${wv})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (T > E.slams - 0.05 && T < E.slams + 0.12) { octx.fillStyle = `rgba(255,240,220,${0.35 * (1 - prog(T, E.slams - 0.05, E.slams + 0.12))})`; octx.fillRect(0, 0, W, H); }
  if (ci === 0 || loop) { big('ROOM 429A', 300, 96, '#e8c870', 1); big('PART 2', 380, 40, '#fff', 1); if (!loop && T > E.inside - 0.1) big("IT'S STILL 1986", 460, 50, '#fff', prog(T, E.inside - 0.1, E.inside + 0.15)); if (!loop && T > E.tea - 0.1) big('THE TEA IS STILL HOT', 540, 44, '#ff6a4a', prog(T, AT(0, 'hot') - 0.2, AT(0, 'hot') + 0.05)); }
  caseFile(T, ci >= 1 && !loop);
  if (ci === 1) { const tags = [[E.orange, 'ORANGE CARPET'], [E.record, 'RECORD . STILL SPINNING'], [E.tv, 'TV . SIZE OF A FRIDGE'], [E.everything, 'EVERYTHING . BRAND NEW'], [E.calendar, 'CALENDAR . 11 NOV 1986']]; let cur = null; tags.forEach(t_ => { if (T > t_[0] - 0.1) cur = t_; }); if (cur) tag(cur[1], prog(T, cur[0] - 0.1, cur[0] + 0.1)); }
  if (ci === 2 && T > E.leo2 - 0.1) { big('LEO', 420, 110, '#5a8aff', prog(T, E.leo2 - 0.1, E.leo2 + 0.15)); big('FRESH INK', 510, 40, '#fff', prog(T, E.leo2 + 0.2, E.leo2 + 0.4)); }
  if (ci === 3 && T < E.like - 0.1) big('HE NEVER SIGNED IT', 420, 50, '#ff6a4a', prog(T, AT(3, 'signed') - 0.2, AT(3, 'signed')));
  if (ci === 5) { const j = () => (Math.random() - 0.5) * 4; big("DON'T LET THE", 420 + j(), 54, '#ff4a3a', prog(T, E.w5, E.w5 + 0.3), 360 + j()); big('DOOR CLOSE', 490 + j(), 70, '#ff4a3a', prog(T, E.w5 + 0.3, E.w5 + 0.6), 360 + j()); }
  if (ci === 6) { if (T > E.slams - 0.05 && T < E.handle - 0.1) big('SLAM', 440, 110, '#fff', prog(T, E.slams - 0.05, E.slams + 0.05)); if (T > E.gone - 0.1 && T < E.knocks - 0.1) big('THE HANDLE IS GONE', 440, 46, '#ff6a4a', prog(T, E.gone - 0.1, E.gone + 0.1)); KN.forEach((kt, k) => { if (T > kt) big('KNOCK', 420 + k * 70, 56, '#fff', prog(T, kt, kt + 0.1), 260 + k * 100); }); }
  if (ci === 7 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. LOOK THROUGH' : 'B. CLIMB OUT', 440, 60, A ? '#e8c870' : '#7ad0ff', 1); big(A ? 'THE PEEPHOLE' : 'ONTO THE LEDGE', 520, 54, '#fff', 1); }
    else { big('A. PEEPHOLE', 400, 54, '#e8c870', prog(T, E.comment - 0.1, E.comment + 0.15)); big('B. LEDGE', 470, 54, '#7ad0ff', prog(T, E.comment, E.comment + 0.25)); big('COMMENT A OR B', 560, 60, '#fff', prog(T, E.comment + 0.2, E.comment + 0.45)); } }
  likePill(T, E.like, E.phone - 0.2, AT(3, 'follow')); if (T > E.follow - 0.2 && !loop) likePill(T, E.follow, TM.total + 1, E.follow + 0.25);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap.txt, ci === 5); };
})();
