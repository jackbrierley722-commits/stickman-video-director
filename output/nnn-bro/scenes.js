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

// ---------- helpers ----------
function rod(p, a, b, r, mat, sh = true) { const A = new T3.Vector3(...a), B = new T3.Vector3(...b); const L = A.distanceTo(B); const m = add(p, Cy(r, r, L, 12), mat, 0, 0, 0, sh); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; }
function wheelR(r, o = {}) { const w = new T3.Group(); const rub = SM(o.tyreCol || '#1c1c1e', { roughness: 0.85 }); const rimM = o.rimM || SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 });
  w.userData.tyre = add(w, new T3.TorusGeometry(r, o.tyre || 0.028, 14, 48), rub, 0, 0, 0); add(w, new T3.TorusGeometry(r - (o.tyre || 0.028) - 0.008, o.rim || 0.012, 8, 48), rimM, 0, 0, 0);
  const n = o.spokes || 24, sm = o.spokeM || SM('#d8dce0', { metalness: 0.9, roughness: 0.3 }); for (let i = 0; i < n; i++) { const a = i / n * 2 * PI; rod(w, [0, 0, (i % 2 ? 0.02 : -0.02)], [C(a) * (r - 0.04), S(a) * (r - 0.04), 0], o.spokeR || 0.0035, sm, false); }
  add(w, Cy(0.03, 0.03, 0.09, 14), SM('#9aa0a6', { metalness: 0.8, roughness: 0.3 }), 0, 0, 0).rotation.x = PI / 2; return w; }
function crankR(p, x, y, len = 0.16) { const c = new T3.Group(); c.position.set(x, y, 0); p.add(c); const m = SM('#7a7e84', { metalness: 0.8, roughness: 0.35 }); for (const s of [-1, 1]) { const arm = new T3.Group(); arm.rotation.z = s > 0 ? 0 : PI; c.add(arm); rod(arm, [0, 0, 0.07 * s], [0, -len, 0.07 * s], 0.012, m); add(arm, RB(0.09, 0.025, 0.07, 0.008), SM('#2a2a2a', { roughness: 0.7 }), 0, -len, 0.11 * s); } return c; }
const WOOD = () => SM('#8a5a32', { roughness: 0.7, map: noiseTex(64, 256, '#8a5a32', [['rgba(60,30,10,0.25)', 300, 2], ['rgba(255,220,180,0.06)', 200, 2]], 5, [1, 1]) });
const IRON = () => SM('#2c2c2e', { metalness: 0.7, roughness: 0.45 });
const LEATHER = () => SM('#5a3420', { roughness: 0.55 });
// ---------- street ----------
function houseR(p, x, z, brick, door, seed) { const g = new T3.Group(); g.position.set(x, 0, z); p.add(g); const bt = brickTex(brick, seed); bt.repeat.set(3, 2);
  add(g, Bx(7.6, 6.2, 7), SM('#ffffff', { map: bt, roughness: 0.9 }), 0, 3.1, 0); const roof = add(g, new T3.CylinderGeometry(0.01, 5.4, 2.6, 4, 1), SM('#4a4e56', { roughness: 0.75 }), 0, 7.5, 0); roof.rotation.y = PI / 4; roof.scale.z = 0.95;
  const glass = SM('#9ab4c8', { metalness: 0.3, roughness: 0.05, envMapIntensity: 1.4 }); const frm = SM('#f2f0ea', { roughness: 0.5 });
  for (const [wx, wy] of [[-2.2, 1.7], [2.2, 1.7], [-2.2, 4.5], [0, 4.5], [2.2, 4.5]]) { add(g, RB(1.3, 1.5, 0.12, 0.03), frm, wx, wy, 3.52); add(g, Bx(1.1, 1.3, 0.05), glass, wx, wy, 3.6); add(g, Bx(1.1, 0.04, 0.06), frm, wx, wy, 3.63); }
  add(g, RB(1.2, 2.3, 0.12, 0.03), SM(door, { roughness: 0.4 }), 0, 1.15, 3.54); add(g, Sp(0.05), SM('#c8a040', { metalness: 1, roughness: 0.3 }), 0.4, 1.1, 3.62);
  add(g, Bx(7.8, 0.25, 0.3), SM('#e8e4dc'), 0, 6.2, 3.55); return g; }
function treeR(p, x, z, s, seed) { const r = rng(seed); add(p, Cy(0.1 * s, 0.16 * s, 2.6 * s, 10), SM('#5a4030', { roughness: 1 }), x, 1.3 * s, z); const col = ['#3a6a2a', '#4a7a32', '#2e5a26', '#5a8a3a'][Math.floor(r() * 4)]; for (let k = 0; k < 6; k++) add(p, Sp((0.9 + r() * 0.6) * s, 16, 12), SM(col, { roughness: 0.95 }), x + (r() - 0.5) * 1.4 * s, (2.8 + r() * 1.4) * s, z + (r() - 0.5) * 1.4 * s); }
function hedge(p, x, z, w) { for (let i = 0; i < w / 0.7; i++) add(p, Sp(0.45, 12, 8), SM(i % 2 ? '#3a5a2a' : '#456a30', { roughness: 1 }), x - w / 2 + i * 0.7, 0.4, z).scale.set(1, 0.9, 0.8); }
function lamp(p, x, z) { const m = SM('#2a2c30', { metalness: 0.7, roughness: 0.4 }); add(p, Cy(0.05, 0.08, 4.5, 10), m, x, 2.25, z); rod(p, [x, 4.4, z], [x, 4.6, z + 0.8], 0.04, m); add(p, RB(0.35, 0.12, 0.5, 0.04), SM('#e8e8e0', { emissive: '#fff4d0', emissiveIntensity: 0.2 }), x, 4.55, z + 0.95); }
const CARCOL = ['#c83a2a', '#e8e8ec', '#2a2a30', '#3a5a8a', '#8a8a90', '#d8c8a0'];
function carR(p, x, z, seed) { const r = rng(seed); const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = PI / 2; p.add(g); const paint = SM(CARCOL[Math.floor(r() * 6)], { metalness: 0.6, roughness: 0.28 }); add(g, RB(1.8, 0.7, 4.3, 0.15), paint, 0, 0.6, 0); add(g, RB(1.6, 0.6, 2.3, 0.2), paint, 0, 1.15, -0.2); add(g, RB(1.62, 0.45, 2.1, 0.15), SM('#1a2430', { metalness: 0.4, roughness: 0.08 }), 0, 1.18, -0.2); for (const [wx, wz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) add(g, Cy(0.33, 0.33, 0.22, 18), SM('#151515', { roughness: 0.7 }), wx, 0.33, wz).rotation.z = PI / 2; return g; }

function face(p, kind, T) { const u = p.userData; u.mouth.scale.set(1, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12; b.position.y = 0.04; });
  if (kind === 'angry') u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.45; b.position.y = 0.034; });
  if (kind === 'shock') { u.mouth.scale.set(0.8, 3.2, 1); u.brows.forEach(b => b.position.y = 0.05); }
  if (kind === 'grin') u.mouth.scale.set(1.5, 1.4, 1);
  if (kind === 'smug') { u.mouth.scale.set(1.3, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12 + (b.userData.sx > 0 ? 0.3 : 0); b.position.y = b.userData.sx > 0 ? 0.048 : 0.038; }); }
  if (kind === 'yell') { u.mouth.scale.set(1.2, 2.6 + Math.abs(S(T * 18)), 1); u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.4; }); } }

// ---------- timing ----------
const E = { lost: AT(0, 'lost'), bro0: AT(0, 'bro'), c1: CL[1].start, c2: CL[2].start, day: AT(2, 'day'), again2: AT(2, 'again'),
  c3: CL[3].start, lost3: AT(3, 'lost'), rename: AT(3, 'rename'), notnow: AT(3, 'not'), clever: AT(3, 'clever'),
  c4: CL[4].start, lost4: AT(4, 'lost'), fly: AT(4, 'fly'), much: AT(4, 'much'), c5: CL[5].start, tell: AT(5, 'tell'), strong: AT(5, 'strong'),
  c6: CL[6].start, same: AT(6, 'same'), except: AT(6, 'except'), dave: AT(6, 'dave'), dave2: AT(6, 'dave', 1), c7: CL[7].start };
E.loop = TM.total - 0.4;
E.replies = [0, 1, 2, 3].map(i => E.c6 + 0.15 + i * 0.22);
const GL = [0, 0, 400]; // the globe scene sits far from the bedroom
// ---------- canvas textures that change over time ----------
function stampDraw(c, x, y, k, s = 1) { if (k <= 0) return; const sc = lerp(2.4, 1, ease(k)); c.save(); c.translate(x, y); c.rotate(-0.22); c.scale(sc * s, sc * s); c.globalAlpha = Math.min(1, k * 2) * 0.92;
  c.strokeStyle = '#d61c1c'; c.lineWidth = 7; c.beginPath(); c.roundRect(-64, -27, 128, 54, 8); c.stroke(); c.fillStyle = '#d61c1c'; c.font = '46px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LOST', 0, 3); c.restore(); }
const STAMP = (T, t0) => T < t0 - 0.12 ? 0 : prog(T, t0 - 0.12, t0);
function drawCal(c, st) { const w = 512, h = 640; c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#d63a2a'; c.fillRect(0, 0, w, 118);
  c.fillStyle = '#fff'; c.font = '66px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NOVEMBER', w / 2, 62);
  c.fillStyle = '#555'; c.font = '600 22px CapFont'; 'SMTWTFS'.split('').forEach((d, i) => c.fillText(d, 36.5 + i * 73, 146));
  c.strokeStyle = '#cfc8b8'; c.lineWidth = 2; for (let r = 0; r <= 5; r++) { c.beginPath(); c.moveTo(0, 166 + r * 92); c.lineTo(w, 166 + r * 92); c.stroke(); } for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(i * 73, 166); c.lineTo(i * 73, 626); c.stroke(); }
  for (let d = 1; d <= 30; d++) { const col = (d - 1) % 7, row = Math.floor((d - 1) / 7), x = col * 73, y = 166 + row * 92; c.fillStyle = '#333'; c.font = '600 24px CapFont'; c.textAlign = 'left'; c.fillText(String(d), x + 7, y + 20);
    if (d <= 2) { c.strokeStyle = '#2aa84a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 22, y + 56); c.lineTo(x + 34, y + 70); c.lineTo(x + 56, y + 40); c.stroke(); } }
  for (let d = 1; d <= 30; d++) { const k = st[d] || 0; if (k > 0) { const col = (d - 1) % 7, row = Math.floor((d - 1) / 7); stampDraw(c, col * 73 + 36, 166 + row * 92 + 52, k, d === 3 && st.big ? 0.75 : 0.5); } } }
function drawBoard(c, st) { const w = 512, h = 320; c.fillStyle = '#fdfdfb'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a5ac8'; c.font = '34px Bangers'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('THE COUNTER', w / 2, 30);
  const r = rng(7); for (let i = 0; i < 10; i++) { const x = 60 + (i % 5) * 98, y = 82 + Math.floor(i / 5) * 62, a = (r() - 0.5) * 0.2; c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#222'; c.font = '38px Bangers'; c.fillText('DAY 1', 0, 0); c.strokeStyle = '#d61c1c'; c.lineWidth = 5; c.beginPath(); c.moveTo(-44, 6); c.lineTo(44, -6); c.stroke(); c.restore(); }
  if (st.w > 0) { c.save(); c.beginPath(); c.rect(0, 190, 120 + 300 * st.w, 130); c.clip(); c.fillStyle = '#111'; c.font = '96px Bangers'; c.fillText('DAY 1', w / 2, 248); c.restore(); }
  if (st.ag > 0) { c.save(); c.globalAlpha = st.ag; c.fillStyle = '#2a5ac8'; c.font = '34px Bangers'; c.fillText('(again)', 410, 290); c.restore(); }
  stampDraw(c, w / 2, 250, st.s, 1.5); }
function drawBanner(c, st) { const w = 1024, h = 300; c.fillStyle = '#fff3c8'; c.fillRect(0, 0, w, h); c.fillStyle = '#d63a2a'; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64 + 64, 0); c.lineTo(i * 64 + 32, 34); c.fill(); c.fillStyle = c.fillStyle === '#d63a2a' ? '#2a5ac8' : '#d63a2a'; }
  c.font = '128px Bangers'; c.textAlign = 'left'; c.textBaseline = 'middle'; const full = 'NO NUT NOVEMBER', a = c.measureText('NO NUT ').width, tw = c.measureText(full).width, x0 = (w - tw) / 2; c.fillStyle = '#1a1a1a'; c.fillText(full, x0, 205);
  if (st.k > 0) { c.strokeStyle = '#d61c1c'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 6, 212); c.lineTo(x0 - 6 + (a - 10) * st.k, 196); c.stroke(); }
  if (st.n > 0) { c.save(); c.beginPath(); c.rect(0, 0, x0 + (a + 40) * st.n, 140); c.clip(); c.translate(x0 + a / 2 - 10, 92); c.rotate(-0.06); c.fillStyle = '#d61c1c'; c.font = '92px Bangers'; c.textAlign = 'center'; c.fillText('NOT NOW', 0, 0); c.restore(); }
  stampDraw(c, w * 0.62, 170, st.s, 2.1); }
function dynTex(w, h, fn) { const t = ctex(w, h, () => {}); t.userData.fn = fn; t.userData.key = ''; return t; }
function updTex(t, st) { const key = JSON.stringify(st); if (key === t.userData.key) return; t.userData.key = key; const c = t.userData.g; c.clearRect(0, 0, t.userData.c.width, t.userData.c.height); t.userData.fn(c, st); t.needsUpdate = true; }
function texPlane(p, tex, w, h, x, y, z, ry = 0) { const m = add(p, new T3.PlaneGeometry(w, h), BM('#ffffff', { map: tex }), x, y, z, false); m.rotation.y = ry; m.receiveShadow = false; return m; }
function globeTex() { return ctex(1024, 512, (c, w, h) => { c.fillStyle = '#2f86d8'; c.fillRect(0, 0, w, h); const r = rng(21); const blob = (cx, cy, n, s, col) => { c.fillStyle = col; for (let i = 0; i < n; i++) { c.beginPath(); c.arc(cx + (r() - 0.5) * s * 2, cy + (r() - 0.5) * s, s * (0.25 + r() * 0.35), 0, 7); c.fill(); } };
  for (const [cx, cy, s] of [[180, 160, 70], [250, 330, 55], [520, 150, 60], [540, 300, 60], [720, 170, 110], [830, 360, 45], [430, 80, 40]]) blob(cx, cy, 26, s, '#4fae4a'); for (const [cx, cy, s] of [[730, 150, 70], [200, 140, 40]]) blob(cx, cy, 10, s, '#8ac25a');
  c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, w, 26); c.fillRect(0, h - 30, w, 30); }); }
function starTex() { return ctex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e1638'); g.addColorStop(1, '#24346a'); c.fillStyle = g; c.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; const s = r() < 0.1 ? 2.4 : 1.2; c.fillRect(r() * w, r() * h, s, s); } }); }
function build() {
  buildSky(); R.sun.intensity = 2.4; R.hemi.intensity = 1.2;
  const G = R.G = new T3.Group(); scene.add(G);
  // bedroom: floor, three walls, rug, window, bed, plant, desk
  const wood = SM('#ffffff', { map: noiseTex(256, 256, '#c08a58', [['rgba(90,50,20,0.18)', 600, 3], ['rgba(255,230,190,0.1)', 300, 2]], 4, [3, 3]) });
  add(G, Bx(7, 0.1, 6.5), wood, 0, -0.05, 0.6);
  for (let i = 0; i < 10; i++) add(G, Bx(0.012, 0.004, 6.5), SM('#8a5a32'), -3.15 + i * 0.7, 0.001, 0.6, false);
  const wallM = SM('#86aecb'), wallM2 = SM('#98bcd4');
  add(G, Bx(7, 2.9, 0.1), wallM, 0, 1.45, -2.55); add(G, Bx(0.1, 2.9, 6.5), wallM2, -3.05, 1.45, 0.6); add(G, Bx(0.1, 2.9, 6.5), wallM2, 3.05, 1.45, 0.6);
  add(G, Bx(7, 0.12, 0.04), SM('#f2efe8'), 0, 0.06, -2.49); add(G, Bx(0.04, 0.12, 6.5), SM('#f2efe8'), -2.99, 0.06, 0.6); add(G, Bx(0.04, 0.12, 6.5), SM('#f2efe8'), 2.99, 0.06, 0.6);
  const rug = add(G, Cy(1.25, 1.25, 0.02, 40), SM('#c85a4a'), 0, 0.012, -0.3, false); rug.scale.z = 0.8; const rug2 = add(G, Cy(0.95, 0.95, 0.022, 40), SM('#e8b450'), 0, 0.013, -0.3, false); rug2.scale.z = 0.8;
  // window on the left wall with a sky view
  const skyT = ctex(64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a9ae0'); g.addColorStop(1, '#bfe0f4'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  texPlane(G, skyT, 1.1, 1.0, -2.99, 1.65, -0.6, PI / 2); const fr = SM('#f4f2ec'); for (const [y, z, a, b] of [[2.17, -0.6, 0.08, 1.24], [1.13, -0.6, 0.08, 1.24], [1.65, -0.6, 1.0, 0.06]]) add(G, Bx(0.08, a, b), fr, -2.97, y, z); for (const z of [-1.2, 0.0]) add(G, Bx(0.08, 1.12, 0.08), fr, -2.97, 1.65, z);
  add(G, Bx(0.08, 1.12, 0.05), fr, -2.97, 1.65, -0.6);
  // calendar, whiteboard, banner on the back wall
  R.calT = dynTex(512, 640, drawCal); add(G, Bx(0.86, 1.06, 0.02), SM('#e8e2d4'), -1.6, 1.55, -2.495); R.cal = texPlane(G, R.calT, 0.8, 1.0, -1.6, 1.55, -2.48); add(G, Sp(0.02), SM('#888'), -1.6, 2.1, -2.48);
  R.boardT = dynTex(512, 320, drawBoard); add(G, Bx(1.52, 0.97, 0.04), SM('#b8bcc2'), 0.6, 1.42, -2.49); texPlane(G, R.boardT, 1.42, 0.888, 0.6, 1.42, -2.465); add(G, Bx(1.3, 0.04, 0.08), SM('#b8bcc2'), 0.6, 0.92, -2.45);
  add(G, Cy(0.012, 0.012, 0.12, 8), SM('#d61c1c'), 0.3, 0.955, -2.44).rotation.z = PI / 2;
  R.banT = dynTex(1024, 300, drawBanner); texPlane(G, R.banT, 1.7, 0.5, 0.6, 2.3, -2.48);
  // bed
  add(G, Bx(1.22, 0.32, 2.05), WOOD(), 2.2, 0.16, -1.44); add(G, Bx(1.12, 0.22, 1.98), SM('#f4f2ee'), 2.2, 0.43, -1.44); add(G, Bx(1.22, 0.95, 0.08), WOOD(), 2.2, 0.62, -2.46);
  add(G, RB(1.16, 0.2, 1.3, 0.06), SM('#4a74c8'), 2.2, 0.62, -0.95); add(G, RB(0.78, 0.16, 0.36, 0.06), SM('#ffffff'), 2.2, 0.62, -2.2);
  // plant and bedside table
  add(G, Cy(0.18, 0.14, 0.34, 16), SM('#c86a3a'), -2.55, 0.17, -2.1); for (let k = 0; k < 7; k++) { const l = add(G, Sp(0.16, 10, 8), SM(k % 2 ? '#3a8a3a' : '#4aa04a'), -2.55 + S(k * 2.2) * 0.12, 0.5 + k * 0.06, -2.1 + C(k * 2.2) * 0.1); l.scale.set(0.7, 1.4, 0.5); l.rotation.z = S(k * 2.2) * 0.6; }
  add(G, Bx(0.5, 0.5, 0.45), WOOD(), 1.25, 0.25, -2.2); add(G, Cy(0.08, 0.12, 0.05, 14), SM('#e8e0d0'), 1.25, 0.53, -2.2); add(G, Cy(0.015, 0.015, 0.3, 8), SM('#e8e0d0'), 1.25, 0.7, -2.2); add(G, Cy(0.09, 0.16, 0.18, 16), SM('#ffe0a0', { emissive: '#ffcc70', emissiveIntensity: 0.3 }), 1.25, 0.88, -2.2);
  // the bro
  const you = R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(you);
  R.marker = add(you.userData.armR.userData.h, Cy(0.018, 0.018, 0.16, 8), SM('#222222'), 0, -0.07, 0.03); R.marker.rotation.x = PI / 2;
  const ph = R.phone = new T3.Group(); you.userData.armR.userData.h.add(ph); ph.position.set(-0.02, -0.06, 0.05); add(ph, RB(0.09, 0.17, 0.014, 0.012), SM('#1a1a1e'), 0, 0, 0); const scr = add(ph, new T3.PlaneGeometry(0.078, 0.155), BM('#bfe0ff'), 0, 0, -0.008, false); scr.rotation.y = PI;
  // globe scene
  const GG = R.GG = new T3.Group(); GG.position.set(...GL); scene.add(GG);
  add(GG, Sp(45, 32, 16), new T3.MeshBasicMaterial({ map: starTex(), side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  R.globe = add(GG, Sp(6, 64, 40), SM('#ffffff', { map: globeTex() }), 0, 0, 0, false);
  const pl = R.plane = new T3.Group(); GG.add(pl); pl.position.set(0, 7.0, 1.2); const white = SM('#f6f6f8'), blue = SM('#2a5ac8');
  const fus = add(pl, Cap(0.36, 2.6, 16), white, 0, 0, 0); fus.rotation.z = PI / 2; const nose = add(pl, Sp(0.2, 12, 10), SM('#222a3a'), -1.5, 0.12, 0.2); nose.scale.set(0.6, 0.5, 0.9);
  add(pl, Bx(0.8, 0.06, 3.4), white, 0.1, -0.12, 0); add(pl, Bx(0.84, 0.065, 0.1), blue, 0.1, -0.12, 1.7); add(pl, Bx(0.84, 0.065, 0.1), blue, 0.1, -0.12, -1.7);
  const fin = add(pl, Bx(0.6, 0.75, 0.06), blue, 1.45, 0.5, 0); fin.rotation.z = -0.35; add(pl, Bx(0.45, 0.05, 1.3), white, 1.5, 0.08, 0);
  for (const z of [-0.95, 0.95]) { const en = add(pl, Cy(0.14, 0.14, 0.55, 14), SM('#c8ccd4'), -0.05, -0.32, z); en.rotation.z = PI / 2; }
  add(pl, Bx(2.5, 0.06, 0.02), blue, -0.1, -0.08, 0.36, false);
  for (let i = 0; i < 9; i++) add(pl, new T3.CircleGeometry(0.055, 14), BM('#2a3446'), -1.1 + i * 0.26, 0.09, 0.358, false);
  R.trail = []; for (let i = 0; i < 14; i++) R.trail.push(spr(GG, GLOW, '#ffffff', 0.6, 0, 0, 0, 0, T3.NormalBlending));
}
// ---------- shots ----------
const CALV = [[-1.6, 1.55, -1.25], [-1.6, 1.55, -2.5]], CAL2 = [[-1.6, 1.55, -1.12], [-1.6, 1.55, -2.5]];
const SH = [
  [0, (k, T) => TR(k, CALV[0], CAL2[0], CALV[1], CAL2[1])],
  [E.bro0 - 0.05, (k, T) => TR(k, [-1.0, 1.5, 0.75], [-1.05, 1.48, 0.55], [-1.15, 1.32, -2.2], [-1.15, 1.32, -2.2])],
  [E.c1, (k, T) => TR(k, [0.0, 2.35, -0.24], [0.0, 2.1, -0.25], [0, 0, -0.3], [0, 0, -0.3])],
  [E.c2, (k, T) => TR(k, [1.15, 1.5, 0.45], [1.0, 1.48, 0.15], [0.45, 1.36, -2.5], [0.5, 1.36, -2.5])],
  [E.again2 - 0.1, (k, T) => TR(k, [0.75, 1.42, -0.5], [0.72, 1.42, -0.62], [0.55, 1.3, -2.5], [0.55, 1.3, -2.5])],
  [E.c3, (k, T) => TR(k, [0.65, 1.42, -0.85], [0.62, 1.42, -0.95], [0.6, 1.42, -2.5], [0.6, 1.42, -2.5])],
  [E.rename - 0.1, (k, T) => TR(k, [0.75, 1.75, 0.95], [0.7, 1.8, 0.7], [0.55, 1.75, -2.5], [0.58, 1.85, -2.5])],
  [E.clever - 0.1, (k, T) => TR(k, [0.45, 1.68, 0.35], [0.4, 1.68, 0.2], [0.12, 1.55, -1.4], [0.12, 1.58, -1.4])],
  [E.c4, (k, T) => TR(k, [0.6, 2.28, -1.15], [0.6, 2.28, -1.3], [0.6, 2.3, -2.5], [0.6, 2.3, -2.5])],
  [E.fly - 0.05, (k, T) => TR(k, [GL[0] - 1.5, GL[1] + 7.4, GL[2] + 7.5], [GL[0] + 0.5, GL[1] + 6.8, GL[2] + 13.5], [GL[0] - 0.4, GL[1] + 7.0, GL[2] + 1.2], [GL[0], GL[1] + 4.2, GL[2]])],
  [E.much - 0.1, (k, T) => TR(k, [GL[0] - 2.6, GL[1] + 7.9, GL[2] + 3.6], [GL[0] - 2.7, GL[1] + 7.9, GL[2] + 3.4], [GL[0] - 0.3, GL[1] + 7.6, GL[2] + 1.2], [GL[0] - 0.3, GL[1] + 7.6, GL[2] + 1.2])],
  [E.c5, (k, T) => TR(k, [1.1, 1.35, 0.45], [1.15, 1.32, 0.25], [2.2, 0.95, -1.9], [2.2, 0.95, -1.9])],
  [E.c7, (k, T) => TR(k, CALV[0], CAL2[0], CALV[1], CAL2[1])],
  [E.loop, (k, T) => look(CALV[0], CALV[1])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const you = R.you, u = you.userData; rest(you); you.visible = true; you.scale.setScalar(1); you.rotation.set(0, 0, 0); R.marker.visible = false; R.phone.visible = false; face(you, 'neutral', T);
  // textures
  const st = {}; if (!loop) { st[3] = cl === 0 ? STAMP(T, E.lost) : 1; st.big = cl === 0; if (cl === 7) { const order = [...Array(30).keys()].map(i => i + 1).filter(d => d !== 3); order.forEach((d, i) => { st[d] = STAMP(T, E.c7 + 0.25 + i * 0.075); }); } }
  for (const d in st) if (typeof st[d] === 'number') st[d] = Math.round(st[d] * 20) / 20; updTex(R.calT, st);
  const bw = cl === 2 ? prog(T, E.day - 0.15, E.day + 0.45) : cl === 3 ? 1 : 0; updTex(R.boardT, { w: Math.round(bw * 20) / 20, ag: cl === 2 ? Math.round(prog(T, E.again2, E.again2 + 0.3) * 10) / 10 : cl === 3 ? 1 : 0, s: cl === 3 ? Math.round(STAMP(T, E.lost3) * 20) / 20 : 0 });
  updTex(R.banT, { k: cl === 3 ? Math.round(prog(T, E.rename, E.rename + 0.5) * 20) / 20 : cl >= 4 ? 1 : 0, n: cl === 3 ? Math.round(prog(T, E.notnow - 0.2, E.notnow + 0.55) * 20) / 20 : cl >= 4 ? 1 : 0, s: cl === 4 ? Math.round(STAMP(T, E.lost4) * 20) / 20 : 0 });
  // the globe spins east under the plane, so the plane goes west
  R.globe.rotation.y = T * 0.9; R.plane.position.y = 7.0 + 0.08 * S(T * 3); R.plane.rotation.z = 0.04 * S(T * 2);
  R.trail.forEach((s_, i) => { s_.position.set(1.7 + i * 0.32, 7.0 + 0.08 * S((T - i * 0.05) * 3), 1.2); s_.material.opacity = 0.45 * (1 - i / 14); s_.scale.setScalar(0.25 + i * 0.03); });
  if (cl === 0) { if (T < E.bro0 - 0.05 && !loop) you.visible = false; you.position.set(-0.72, 0, -1.55); you.rotation.y = 0.35;
    u.armR.rotation.set(-2.35, 0, -0.55); u.armR.userData.e.rotation.x = -1.35; u.head.rotation.set(0.3, 0, 0); u.up.rotation.x = 0.12; face(you, 'angry', T); if (loop) you.visible = false; }
  if (cl === 1) { you.position.set(0, 0.16, 0.6); you.rotation.set(-PI / 2, 0, 0); u.armL.rotation.z = -1.25; u.armR.rotation.z = 1.25; u.legL.rotation.z = -0.28; u.legR.rotation.z = 0.28; face(you, 'neutral', T); u.mouth.scale.set(0.5, 1, 1); }
  if (cl === 2) { you.position.set(-0.05, 0, -1.95); you.rotation.y = PI * 0.78; R.marker.visible = true; const wr = T > E.day - 0.2 && T < E.again2; u.armR.rotation.set(wr ? -1.9 + 0.12 * S(T * 16) : -0.5, 0, wr ? 0.1 : 0); u.armR.userData.e.rotation.x = wr ? -0.3 : -0.4;
    if (T > E.again2 - 0.1) { you.rotation.y = 0.5; face(you, 'neutral', T); u.mouth.scale.set(0.6, 1, 1); } }
  if (cl === 3) { if (T < E.rename - 0.1) { you.position.set(-0.05, 0, -1.95); you.rotation.y = PI * 0.78; face(you, 'shock', T); }
    else { you.position.set(0.12, 0, -1.4); you.rotation.y = 0.15; R.marker.visible = true; const up_ = T < E.clever - 0.1; u.armR.rotation.set(up_ ? -2.7 : -0.9, 0, up_ ? 0.15 : -0.2); u.armR.userData.e.rotation.x = up_ ? -0.2 : -1.2; face(you, T > E.clever - 0.1 ? 'smug' : 'grin', T); } }
  if (cl === 4) { if (T < E.fly - 0.05) you.visible = false; else { const sc = 0.55, top = GL[1] + R.plane.position.y + 0.36; seatPose(you, 0); you.scale.setScalar(sc); you.position.set(GL[0] + 0.15, top + (0.06 - 0.92) * sc + 0.02, GL[2] + 1.2); you.rotation.y = -PI / 2;
    u.armR.rotation.set(-1.6, 0, 0); u.armR.userData.e.rotation.x = 0; u.armL.rotation.set(-2.8, 0, -0.3); u.legL.rotation.z = -0.4; u.legR.rotation.z = 0.4; face(you, T > E.much - 0.1 ? 'grin' : 'yell', T); u.head.rotation.y = T > E.much - 0.1 ? 1.1 : 0; } }
  if (cl === 5 || cl === 6) { seatPose(you, 0.55); you.position.x = 2.2; you.position.z = -1.95; you.rotation.y = 0; u.up.rotation.x = -0.15; R.phone.visible = true; u.armR.rotation.set(-1.15, 0, 0.25); u.armR.userData.e.rotation.set(-1.25, 0, 0); u.armR.userData.h.rotation.set(0.3, 0, 0);
    u.armL.rotation.set(-0.35, 0, -0.1); u.head.rotation.set(0.25, 0.05, 0); face(you, cl === 6 && T > E.dave2 - 0.1 ? 'grin' : 'smug', T); }
  if (cl === 7) you.visible = false; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 64; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const g = camera.position.z > 200; if (g) { R.sun.position.set(GL[0] + 10, GL[1] + 16, GL[2] + 14); R.sun.target.position.set(...GL); } else { R.sun.position.set(2.5, 9, 7); R.sun.target.position.set(0, 0, -1.2); } R.sun.target.updateMatrixWorld(); return { si, t0 }; }

// ===================== CEL-SHADED TOON LOOK (ink outlines, 2-tone shading, cartoon people) =====================
// cartoon person with the same rig/API as human(): up, head, mouth, brows, armL/R (.userData.e/.h), legL/R (.userData.k)
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#e8b890'), top = SM(o.top || '#3a6ad8'), bot = SM(o.bot || '#2a2e3a'), hairM = SM(o.hair || '#4a2e1a'), shoe = SM(o.shoe || '#f4f4f4'), ink = new T3.MeshBasicMaterial({ color: '#141414' });
  const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  add(up, Cap(0.17, 0.36, 14), top, 0, 0.3, 0).scale.z = 0.72; add(up, Sp(0.17, 16, 12), bot, 0, -0.02, 0).scale.set(1, 0.65, 0.75); add(up, Cy(0.05, 0.055, 0.1, 10), skin, 0, 0.62, 0);
  const head = new T3.Group(); head.position.set(0, 0.8, 0); up.add(head); const hs = add(head, Sp(0.15, 24, 18), skin, 0, 0, 0); hs.scale.set(0.92, 1.05, 0.95);
  for (const sx of [-1, 1]) add(head, Sp(0.03, 10, 8), skin, sx * 0.138, -0.005, 0).scale.set(0.5, 1, 0.8);
  const hairCap = add(head, new T3.SphereGeometry(0.158, 24, 14, 0, PI * 2, 0, PI * 0.46), hairM, 0, 0.012, -0.01); hairCap.rotation.x = -0.25; add(head, Sp(0.07, 10, 8), hairM, 0.05, 0.12, 0.06).scale.set(1.4, 0.6, 1);
  const brows = []; for (const sx of [-1, 1]) { add(head, Sp(0.019, 10, 8), ink, sx * 0.05, 0.012, 0.135, false).scale.set(1, 1.3, 0.5); const br = add(head, Bx(0.016, 0.06, 0.012), ink, sx * 0.052, 0.045, 0.134, false); br.rotation.z = PI / 2 - sx * 0.12; br.userData.sx = -sx; brows.push(br); }
  add(head, Sp(0.022, 10, 8), skin, 0, -0.018, 0.142).scale.set(0.8, 0.8, 0.9); // nose
  const mouth = new T3.Group(); mouth.position.set(0, -0.06, 0.132); head.add(mouth); add(mouth, Bx(0.05, 0.01, 0.006), ink, 0, 0, 0, false);
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.2, 0.5, 0); up.add(s_); add(s_, Sp(0.06), top, 0, 0, 0); add(s_, Cap(0.05, 0.2, 10), o.short ? top : top, 0, -0.13, 0); const e = new T3.Group(); e.position.y = -0.28; s_.add(e); add(e, Cap(0.045, 0.2, 10), o.short ? skin : top, 0, -0.12, 0); const h = new T3.Group(); h.position.y = -0.27; e.add(h); add(h, Sp(0.05, 12, 10), skin, 0, -0.02, 0).scale.set(0.9, 1.1, 0.7); s_.userData.e = e; s_.userData.h = h; return s_; };
  const leg = (sx) => { const hp = new T3.Group(); hp.position.set(sx * 0.09, 0.92, 0); g.add(hp); add(hp, Cap(0.072, 0.32, 10), bot, 0, -0.22, 0); const k = new T3.Group(); k.position.y = -0.45; hp.add(k); add(k, Cap(0.058, 0.32, 10), o.short ? skin : bot, 0, -0.2, 0); const sh = add(k, Cap(0.055, 0.12, 8), shoe, 0, -0.42, 0.05); sh.rotation.x = PI / 2; sh.scale.set(1.1, 1, 0.7); hp.userData.k = k; return hp; };
  g.userData = { up, head, mouth, brows, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
// golden-hour sky and a low warm sun
function goldenHour() { const st = ctex(16, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7ac8'); gr.addColorStop(0.32, '#8ab8e0'); gr.addColorStop(0.45, '#f4c8a0'); gr.addColorStop(0.5, '#ff9a6a'); gr.addColorStop(0.52, '#e8a878'); gr.addColorStop(1, '#c89a78'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); R.sky.material.map = st; R.sky.material.needsUpdate = true;
  R.sun.color.set('#ffd0a0'); R.hemi.color.set('#ffd8b8'); R.hemi.groundColor.set('#8a6a58'); }
function sunAt(x, y, z) { R.sun.target.position.set(x, y, z); R.sun.position.set(x - 50, y + 30, z - 60); }
// convert every lit material to a 2-step toon material and give solid meshes an ink outline (screen-space width)
let GRAD, INK;
function toonify(root) { GRAD = ctex(4, 1, (c) => { c.fillStyle = '#5a5a5a'; c.fillRect(0, 0, 2, 1); c.fillStyle = '#ffffff'; c.fillRect(2, 0, 2, 1); }); GRAD.minFilter = GRAD.magFilter = T3.NearestFilter; GRAD.colorSpace = T3.NoColorSpace;
  INK = new T3.ShaderMaterial({ uniforms: { uT: { value: 0.0065 } }, side: T3.BackSide, vertexShader: 'uniform float uT; void main(){ vec4 c = projectionMatrix * modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); vec2 o = normalize((projectionMatrix * vec4(n,0.0)).xy + 1e-6); c.xy += o * uT * c.w; gl_Position = c; }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.07,0.06,0.08,1.0); }' });
  const cache = new Map(); const meshes = []; root.traverse(m => { if (m.isMesh && m.material && m.material.isMeshStandardMaterial) meshes.push(m); });
  meshes.forEach(m => { const sm = m.material; let tm = cache.get(sm); if (!tm) { tm = new T3.MeshToonMaterial({ color: sm.color, map: sm.map || null, gradientMap: GRAD, transparent: sm.transparent, opacity: sm.opacity, side: sm.side, emissive: sm.emissive, emissiveIntensity: sm.emissiveIntensity }); cache.set(sm, tm); } m.material = tm;
    m.geometry.computeBoundingSphere(); const r = m.geometry.boundingSphere ? m.geometry.boundingSphere.radius * Math.max(m.scale.x, m.scale.y, m.scale.z) : 0; if (r > 0 && r < 30 && !sm.transparent) { const ol = new T3.Mesh(m.geometry, INK); ol.castShadow = false; ol.receiveShadow = false; ol.renderOrder = -1; m.add(ol); } }); }
// ---------- captions: 2-3 words, yellow with ink outline ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const prv = c0.words[j - 1]; const w = Object.assign({}, w0, { w: (prv && /^day$/i.test(prv.w) && /^one$/i.test(w0.w)) ? '1' : (({ three: '3' })[w0.w.toLowerCase()] || w0.w) }); const prev = cur[cur.length - 1]; if (cur.length && ((/^no$/i.test(w0.w) && c0.words[j + 1] && /^nut$/i.test(c0.words[j + 1].w)) || cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1030); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1030); octx.restore(); }
// ---------- the clock that never reaches December ----------
function clockCard(T) { const k = ease(prog(T, E.fly + 0.1, E.fly + 0.4)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(255,255,255,0.96)'; octx.beginPath(); octx.roundRect(190, 150, 340, 120, 22); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.stroke();
  octx.fillStyle = '#d63a2a'; octx.font = '30px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('NOV 30', 360, 186); octx.fillStyle = '#111'; octx.font = '52px Russo'; octx.fillText(Math.floor(T * 2) % 2 ? '23:59' : '23 59', 360, 238); octx.restore(); }
// ---------- group chat ----------
function bubble(y, text, mine, name, k, col) { if (k <= 0) return; const s = lerp(0.6, 1, ease(k)); octx.save(); octx.globalAlpha = Math.min(1, k * 1.5); octx.font = '600 30px CapFont'; const w = octx.measureText(text).width + 44, h = 58, x = mine ? 548 - w : 190;
  octx.translate(mine ? x + w : x, y + h / 2); octx.scale(s, s); octx.translate(mine ? -(x + w) : -x, -(y + h / 2));
  if (!mine) { octx.fillStyle = col; octx.beginPath(); octx.arc(160, y + h / 2, 22, 0, 7); octx.fill(); octx.fillStyle = '#fff'; octx.font = '600 22px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(name[0], 160, y + h / 2 + 1); }
  octx.fillStyle = mine ? '#2a7af0' : '#e8e8ee'; octx.beginPath(); octx.roundRect(x, y, w, h, 26); octx.fill(); octx.fillStyle = mine ? '#fff' : '#111'; octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(text, x + 22, y + h / 2 + 1);
  if (!mine) { octx.fillStyle = '#8a8a96'; octx.font = '600 18px CapFont'; octx.fillText(name, x + 6, y - 11); } octx.restore(); }
function chat(T) { const k = ease(prog(T, E.tell - 0.25, E.tell + 0.15)); if (k <= 0) return; const dy = (1 - k) * 900; octx.save(); octx.translate(0, dy);
  octx.fillStyle = '#111'; octx.beginPath(); octx.roundRect(118, 120, 484, 820, 52); octx.fill(); octx.fillStyle = '#ffffff'; octx.beginPath(); octx.roundRect(134, 136, 452, 788, 40); octx.fill();
  octx.fillStyle = '#f2f2f6'; octx.fillRect(134, 170, 452, 90); octx.fillStyle = '#111'; octx.beginPath(); octx.roundRect(310, 146, 100, 22, 11); octx.fill();
  ['#e8453a', '#2a7af0', '#2aa84a', '#e8a030'].forEach((c, i) => { octx.fillStyle = c; octx.beginPath(); octx.arc(184 + i * 22, 215, 20, 0, 7); octx.fill(); octx.strokeStyle = '#f2f2f6'; octx.lineWidth = 3; octx.stroke(); });
  octx.fillStyle = '#111'; octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText('THE BROS', 270, 204); octx.fillStyle = '#8a8a96'; octx.font = '600 18px CapFont'; octx.fillText('6 members', 270, 234);
  // typed then sent
  const typed = 'still going strong'; const n = Math.round(typed.length * prog(T, E.tell + 0.1, E.strong + 0.1)); const sent = T > E.strong + 0.15;
  if (sent) bubble(300, typed, true, '', prog(T, E.strong + 0.15, E.strong + 0.35), '');
  octx.fillStyle = '#f2f2f6'; octx.beginPath(); octx.roundRect(150, 852, 420, 54, 27); octx.fill(); octx.fillStyle = sent || n === 0 ? '#9a9aa6' : '#111'; octx.font = '600 26px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(sent || n === 0 ? 'Message' : typed.slice(0, n) + (Math.floor(T * 4) % 2 ? '|' : ''), 176, 880);
  const B = [['Jake', '#2a7af0'], ['Tom', '#2aa84a'], ['Kyle', '#e8a030'], ['Mo', '#9a4ad8']]; B.forEach(([nm, c], i) => bubble(400 + i * 92, 'same', false, nm, prog(T, E.replies[i], E.replies[i] + 0.18), c));
  if (T > E.except && T < E.dave2 - 0.15) { const y = 400 + 4 * 92; octx.fillStyle = '#c84a4a'; octx.beginPath(); octx.arc(160, y + 29, 22, 0, 7); octx.fill(); octx.fillStyle = '#e8e8ee'; octx.beginPath(); octx.roundRect(190, y, 96, 58, 26); octx.fill(); for (let i = 0; i < 3; i++) { octx.fillStyle = '#8a8a96'; octx.beginPath(); octx.arc(218 + i * 20, y + 29 - 5 * Math.max(0, S(T * 10 - i)), 7, 0, 7); octx.fill(); } }
  bubble(400 + 4 * 92, 'lost. nov 1. 00:03', false, 'Dave', prog(T, E.dave2 - 0.15, E.dave2 + 0.05), '#c84a4a'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo', '44px Bangers'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  build(); goldenHour(); toonify(scene); R.sun.shadow.camera.left = R.sun.shadow.camera.bottom = -6; R.sun.shadow.camera.right = R.sun.shadow.camera.top = 6; R.sun.shadow.camera.updateProjectionMatrix();
  out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const ci_ = CLI(T); if (!loop && ci_ === 4) clockCard(T); if (!loop && (ci_ === 5 || ci_ === 6)) chat(T);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
