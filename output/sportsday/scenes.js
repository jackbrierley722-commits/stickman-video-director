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
const E = { already: AT(0, 'already'), c1: CL[1].start, thirty: AT(1, 'thirty'), shade: AT(1, 'shade'), c2: CL[2].start, fall: AT(2, 'fall'), whistle: AT(2, 'whistle'), c3: CL[3].start, kid: AT(3, "kid's"), glued: AT(3, 'glued'),
  c4: CL[4].start, ends: AT(4, 'ends'), c5: CL[5].start, says: AT(5, 'says'), c6: CL[6].start, c7: CL[7].start, spikes: AT(7, 'spikes'), wearing: AT(7, "he's"), c8: CL[8].start, ham: AT(8, 'hamstring'), wins: AT(8, 'wins'), c9: CL[9].start };
E.loop = TM.total - 0.4;
const STARTX = -12, FINX = 12;
function quake() { return 0; }
function kid(top) { const k = human({ top, bot: '#1c1c24', hair: ['#3a2416', '#c89a5a', '#141010', '#8a4a1a'][Math.floor(Math.random() * 4)], skin: ['#f0c8a0', '#c8946a', '#8a5a3a', '#e8b890'][Math.floor(Math.random() * 4)], short: true }); k.scale.setScalar(0.62); R.G.add(k); return k; }
function build() {
  R.hemi = new T3.HemisphereLight('#f4f8ff', '#8aa86a', 1.4); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff2d8', 2.4); R.sun.position.set(-8, 18, 10); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -26; sc.right = sc.top = 26; sc.far = 80; R.sun.shadow.radius = 4; scene.add(R.sun); scene.add(R.sun.target);
  scene.background = new T3.Color('#9fd0f4'); scene.fog = new T3.Fog('#cfe6f6', 40, 140);
  const G = R.G = new T3.Group(); scene.add(G); const grass = SM('#6ab04a', { roughness: 0.95 }), grass2 = SM('#62a644', { roughness: 0.95 }), white = SM('#f8f8f4');
  add(G, Bx(160, 0.2, 160), grass, 0, -0.1, 0); for (let i = 0; i < 16; i++) add(G, Bx(160, 0.01, 5), i % 2 ? grass : grass2, 0, 0.002, -40 + i * 5, false);
  for (let l = 0; l <= 6; l++) add(G, Bx(30, 0.02, 0.07), white, 0, 0.01, -1 + l * 1.0, false); add(G, Bx(0.12, 0.02, 6), white, STARTX, 0.012, 2, false); add(G, Bx(0.12, 0.02, 6), white, FINX, 0.012, 2, false);
  for (const z of [-1.2, 5.2]) add(G, Cy(0.05, 0.05, 1.2, 8), SM('#e8e8e8'), FINX, 0.6, z); R.tape = add(G, Bx(0.04, 0.05, 6.4), SM('#e83a2a'), FINX, 1.05, 2, false);
  // school + gazebo + bunting
  add(G, Bx(40, 9, 8), SM('#b86a4a', { roughness: 0.9 }), 0, 4.5, -30); for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) add(G, Bx(2, 1.6, 0.1), SM('#bfe0f4'), -16 + i * 3, 3 + j * 3.5, -25.95, false);
  const gz = new T3.Group(); gz.position.set(-6, 0, -6); G.add(gz); add(gz, Cy(2.6, 2.6, 0.2, 4), SM('#f4f4f0'), 0, 2.6, 0).rotation.y = PI / 4; add(gz, new T3.ConeGeometry(2.7, 0.9, 4), SM('#e84a4a'), 0, 3.1, 0).rotation.y = PI / 4; for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) add(gz, Cy(0.05, 0.05, 2.6, 6), SM('#888'), x, 1.3, z); add(gz, Bx(2.4, 0.8, 0.8), SM('#e8e0d0'), 0, 0.4, 0.6);
  const flagC = ['#e84a4a', '#3a7ae8', '#f4c830', '#3ab85a']; for (let i = 0; i < 26; i++) { const f = add(G, new T3.ConeGeometry(0.18, 0.4, 3), SM(flagC[i % 4]), -13 + i * 1.04, 3.4 - 0.4 * S(PI * (i % 13) / 12), -2.2, false); f.rotation.x = PI; }
  add(G, Cy(0.06, 0.06, 4, 6), SM('#888'), -13.3, 2, -2.2); add(G, Cy(0.06, 0.06, 4, 6), SM('#888'), 13.6, 2, -2.2);
  // people
  const houses = ['#e84a4a', '#3a7ae8', '#f4c830', '#3ab85a'];
  R.you = kid('#e84a4a'); R.friend = kid('#3a7ae8'); R.kids = []; for (let i = 0; i < 10; i++) R.kids.push(kid(houses[i % 4]));
  R.sacks = []; for (let i = 0; i < 4; i++) { const s = add(G, Cy(0.34, 0.3, 0.75, 12), SM('#c8a86a', { roughness: 1 }), 0, -5, 0); R.sacks.push(s); }
  R.spoons = []; for (let i = 0; i < 4; i++) { const g = new T3.Group(); add(g, Bx(0.04, 0.02, 0.4), SM('#c8c8cc', { metalness: 0.6, roughness: 0.3 }), 0, 0, 0.2); const egg = add(g, Sp(0.08, 12, 10), SM('#f8f4ea'), 0, 0.07, 0.38); egg.scale.set(0.8, 1, 0.8); g.userData.egg = egg; G.add(g); R.spoons.push(g); }
  R.band = add(G, Cy(0.1, 0.1, 0.12, 10), SM('#f4f4f4'), 0, -5, 0);
  R.teacher = human({ top: '#2a3a6a', bot: '#2a3a6a', hair: '#5a3a1a', skin: '#e8b890', shoe: '#f4f4f4' }); G.add(R.teacher); const th = R.teacher.userData.head; add(th, Cy(0.2, 0.2, 0.02, 16), SM('#e8d8a0'), 0, 0.12, 0); add(th, Cy(0.12, 0.14, 0.12, 16), SM('#e8d8a0'), 0, 0.18, 0);
  R.clip = add(G, Bx(0.32, 0.42, 0.03), SM('#8a5a32'), 0, -5, 0); R.mega = new T3.Group(); G.add(R.mega); add(R.mega, new T3.ConeGeometry(0.16, 0.4, 14, 1, true), SM('#e8e8e8', { side: T3.DoubleSide }), 0, 0, 0).rotation.x = -PI / 2;
  R.dad = human({ top: '#f4f4f0', bot: '#1c1c24', hair: '#3a2416', skin: '#e8b890', shoe: '#7aff3a', short: true }); G.add(R.dad); const dh = R.dad.userData.head; add(dh, new T3.TorusGeometry(0.152, 0.025, 8, 20), SM('#e83a2a'), 0, 0.06, 0).rotation.x = PI / 2;
  R.dad2 = human({ top: '#5a7a5a', bot: '#5a5a6a', hair: '#8a7a6a', skin: '#c8946a' }); G.add(R.dad2); R.dad3 = human({ top: '#8a3a5a', bot: '#3a3a4a', hair: '#141010', skin: '#8a5a3a' }); G.add(R.dad3);
  R.cup = add(G, Cy(0.05, 0.04, 0.12, 10), SM('#f4f0e8'), 0, -5, 0);
  R.parents = []; for (let i = 0; i < 9; i++) { const p = human({ top: ['#c86a4a', '#4a8aa8', '#8a8a5a', '#a84a8a', '#4a6a4a'][i % 5], bot: '#3a3a44', hair: ['#3a2416', '#c89a5a', '#141010'][i % 3], skin: ['#f0c8a0', '#c8946a', '#8a5a3a'][i % 3] }); p.position.set(-9 + i * 2.1, 0, -4.5 - (i % 2) * 0.7); p.rotation.y = 0.1 * (i % 3 - 1); G.add(p); R.parents.push(p); }
  R.sticker = add(G, Cy(0.09, 0.09, 0.01, 20), new T3.MeshStandardMaterial({ map: ctex(128, 128, c => { c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.save(); c.translate(64, 64); c.rotate(-PI / 2); c.fillStyle = '#c83a2a'; c.font = 'bold 24px Russo'; c.textAlign = 'center'; c.fillText('TAKING', 0, -6); c.fillText('PART', 0, 22); c.restore(); }) }), 0, -5, 0);
  R.medal = add(G, Cy(0.09, 0.09, 0.02, 16), SM('#f4c830', { metalness: 0.7, roughness: 0.3 }), 0, -5, 0); R.podium = add(G, Bx(1.2, 0.6, 1.0), SM('#f4f4f0'), FINX + 3, 0.3, 2.5); R.podium.visible = false;
}
// ---------- helpers ----------
const lane = i => -0.5 + i * 1.0;
function placeKids(fn) { R.kids.forEach((k, i) => { rest(k); k.visible = true; fn(k, i); }); }
function sitCrowd(T) { placeKids((k, i) => { k.position.set(-8 + i * 1.7, 0, 7 + (i % 2) * 0.8); k.rotation.y = PI; const u = k.userData; u.legL.rotation.x = -PI / 2; u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = PI / 2.2; u.legR.userData.k.rotation.x = PI / 2.2; k.position.y = -0.28; if (i % 3 === 0) u.armR.rotation.set(-2.6 + 0.3 * S(T * 6 + i), 0, 0); }); }
function runPose(p, ph, a = 1) { walkPose(p, ph, a); }
// ---------- shots ----------
const SH = [
  [0, (k, T) => { const kk = ease(prog(T, 0, 1.8)); look(L3([STARTX + 0.5, 42, 2.2], [STARTX + 3.2, 1.5, 4.8], kk), L3([STARTX + 0.5, 0, 2.0], [STARTX, 1.0, 1.0], kk)); }],
  [E.c1, (k, T) => TR(k, [0, 6, 18], [2, 5, 16], [0, 1.5, -2], [0, 1.5, -2])],
  [E.shade - 0.15, (k, T) => TR(k, [-2.2, 1.6, 2.6], [-2.0, 1.55, 2.3], [-3.0, 1.75, 0], [-3.0, 1.8, 0])],
  [E.c2, (k, T) => TR(k, [STARTX + 3.5, 1.6, 7.5], [STARTX + 4, 1.4, 6.5], [STARTX + 1, 0.6, 1.2], [STARTX + 2, 0.5, 1.2])],
  [E.c3, (k, T) => { const x = lerp(-8, 4, prog(T, E.c3, E.c4)); TR(k, [x + 1, 1.4, 6.5], [x + 2, 1.3, 6.0], [x, 0.7, 1.2], [x + 1, 0.7, 1.2]); }],
  [E.glued - 0.15, (k, T) => { const x = R.kids[2].position.x; TR(k, [x + 1.0, 0.95, 2.6], [x + 0.8, 0.9, 2.3], [x, 0.75, 1.0], [x, 0.75, 1.0]); }],
  [E.c4, (k, T) => TR(k, [-1, 1.3, 6.2], [0, 1.2, 5.6], [-1.5, 0.5, 1.2], [-1, 0.4, 1.2])],
  [E.c5, (k, T) => TR(k, [0.2, 1.0, 1.6], [0.12, 0.95, 1.1], [0, 0.85, 0], [0, 0.82, 0])],
  [E.c6, (k, T) => TR(k, [STARTX + 6, 2.2, 8], [STARTX + 5, 2.0, 7], [STARTX + 1, 1.3, 1.5], [STARTX + 1, 1.3, 1.5])],
  [E.c7, (k, T) => TR(k, [STARTX + 2.6, 1.6, 5.0], [STARTX + 2.0, 1.4, 4.2], [STARTX, 0.9, 1.0], [STARTX, 0.9, 1.0])],
  [E.spikes - 0.15, (k, T) => TR(k, [STARTX + 0.9, 0.35, 2.0], [STARTX + 0.8, 0.3, 1.8], [STARTX, 0.08, 1.0], [STARTX, 0.08, 1.0])],
  [E.c8, (k, T) => { const x = R.dad.position.x; look([x + 3.5, 2.2, 7.5], [x + 1.5, 1.0, 1.5]); }],
  [E.c9, (k, T) => TR(k, [FINX + 5.5, 2.2, 7.5], [FINX + 5, 2.0, 6.5], [FINX + 3, 1.3, 2.5], [FINX + 3, 1.4, 2.5])],
  [E.loop, (k, T) => look([STARTX + 0.5, 42, 2.2], [STARTX + 0.5, 0, 2.0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, fr = R.friend, u = you.userData, fu = fr.userData, te = R.teacher, tu = te.userData, d = R.dad, du = d.userData;
  [you, fr, te, d, R.dad2, R.dad3].forEach(p => { rest(p); p.visible = true; p.rotation.set(0, 0, 0); p.position.y = 0; });
  R.sacks.forEach(s => s.visible = false); R.spoons.forEach(s => s.visible = false); R.band.visible = false; R.clip.visible = false; R.mega.visible = false; R.cup.visible = false; R.sticker.visible = false; R.medal.visible = false; R.podium.visible = false; R.tape.visible = true; R.tape.scale.set(1, 1, 1);
  sitCrowd(T); you.position.set(-4, 0, 6); you.rotation.y = PI; fr.position.set(-3, 0, 6); fr.rotation.y = PI; te.position.set(-3, 0, 0.2); te.rotation.y = 0.3; d.position.set(STARTX - 1, 0, 1.0); d.rotation.y = PI / 2; R.dad2.position.set(-20, 0, -8); R.dad3.position.set(-20, 0, -9);
  // dad stretching (hook + clip 7)
  const stretch = (p, T) => { const pu = p.userData, s = S(T * 2.2); pu.legL.rotation.x = -0.9; pu.legL.userData.k.rotation.x = 0.9; pu.legR.rotation.x = 0.5; p.position.y = -0.18; pu.armL.rotation.set(-2.9 + 0.3 * s, 0, 0); pu.armR.rotation.set(-2.9 - 0.3 * s, 0, 0); pu.up.rotation.x = 0.2; face(p, 'angry', T); };
  if (ci === 0 || loop) stretch(d, T);
  if (ci === 1) { te.position.set(-3, 0, 0); te.rotation.y = 0.5; tu.armR.rotation.set(-2.7, 0, 0.3); tu.armR.userData.e.rotation.x = -0.6; R.clip.visible = true; te.updateMatrixWorld(true); const h = tu.armR.userData.h.getWorldPosition(new T3.Vector3()); R.clip.position.set(h.x - 0.05, h.y + 0.02, h.z + 0.1); R.clip.rotation.set(-1.2, 0.3, 0); face(te, 'neutral', T); }
  // sack race: you topple before the whistle
  if (ci === 2) { const go = T > E.whistle; [you, R.kids[0], R.kids[1], R.kids[2]].forEach((p, i) => { const s = R.sacks[i]; s.visible = true; const hop = go ? Math.abs(S(T * 7 + i)) * 0.25 : 0; p.position.set(STARTX + 0.6 + (go ? (T - E.whistle) * 1.2 : 0), hop, lane(i)); p.rotation.y = PI / 2; p.userData.armL.rotation.set(-0.8, 0, -0.2); p.userData.armR.rotation.set(-0.8, 0, 0.2);
      if (i === 0) { const f = ease(prog(T, E.fall - 0.05, E.fall + 0.35)); p.position.set(STARTX + 0.6 + 0.4 * f, 0.05, lane(0)); p.rotation.set(0, PI / 2, -1.45 * f); face(p, f > 0.5 ? 'shock' : 'neutral', T); }
      p.updateMatrixWorld(true); const hip = p.localToWorld(new T3.Vector3(0, 0.35, 0)); s.position.copy(hip); s.rotation.copy(p.rotation); s.scale.setScalar(0.62 * 1.1); });
    te.position.set(STARTX - 0.5, 0, -1.6); te.rotation.y = 0.8; tu.armR.rotation.set(-2.0, 0, 0); }
  // egg and spoon: everyone wobbles, one egg never moves
  if (ci === 3) { [R.kids[0], R.kids[1], R.kids[2], R.kids[3]].forEach((p, i) => { const sp = R.spoons[i]; sp.visible = true; const x = lerp(-8, 4, prog(T, E.c3, E.c4)) + (i === 2 ? 1.2 + (T - E.c3) * 0.6 : 0) - i * 0.3; p.position.set(x, 0, lane(i)); p.rotation.y = PI / 2; walkPose(p, T * (i === 2 ? 14 : 8) + i, i === 2 ? 1.4 : 0.6); p.userData.armR.rotation.set(-1.4, 0, 0);
      p.updateMatrixWorld(true); const hp = p.userData.armR.userData.h.getWorldPosition(new T3.Vector3()); sp.position.copy(hp); sp.rotation.set(0, PI / 2, i === 2 ? 0.9 : 0.15 * S(T * 5 + i)); const fell = i === 1 && T > E.kid; sp.userData.egg.position.set(0, fell ? -0.9 : 0.07, 0.38); face(p, i === 2 ? 'smug' : 'neutral', T); }); you.visible = false; fr.visible = false; }
  // three-legged: down you go, then the glare
  if (ci === 4) { const f = ease(prog(T, E.c4 + 0.4, E.ends - 0.1)); [you, fr].forEach((p, i) => { p.position.set(-1.5 + f * 0.8, 0.05 * f, 1.0 + i * 0.32); p.rotation.set(0, PI / 2, (i ? 1 : -1) * 0.3 * f); p.rotation.x = f * 0.9; walkPose(p, T * 10 + i, 0.6 * (1 - f)); });
    if (T > E.ends - 0.1) { you.rotation.set(0, 0.2, 0); fr.rotation.set(0, -0.2 + PI, 0); you.position.set(-1.2, 0, 1.0); fr.position.set(-0.7, 0, 1.0); you.rotation.y = PI / 2; fr.rotation.y = -PI / 2; face(you, 'angry', T); face(fr, 'angry', T); }
    R.band.visible = true; you.updateMatrixWorld(true); const kp = you.userData.legL.userData.k.getWorldPosition(new T3.Vector3()); R.band.position.set(kp.x, kp.y - 0.05, kp.z + 0.16); }
  // sticker close-up
  if (ci === 5) { you.position.set(0, 0, 0); you.rotation.y = 0; face(you, T > E.says ? 'neutral' : 'smug', T); you.updateMatrixWorld(true); const c = you.localToWorld(new T3.Vector3(0.09, 1.28, 0.16)); R.sticker.visible = true; R.sticker.position.copy(c); R.sticker.rotation.set(PI / 2, 0, 0); placeKids(k => k.visible = false); }
  // parents' race announced: megaphone, dads line up
  if (ci >= 6 || loop) { te.position.set(STARTX - 1.0, 0, -1.4); te.rotation.y = 0.6; if (ci === 6) { tu.armR.rotation.set(-1.6, 0.3, 0); R.mega.visible = true; te.updateMatrixWorld(true); const h = tu.armR.userData.h.getWorldPosition(new T3.Vector3()); R.mega.position.copy(h); R.mega.rotation.set(0, 0.6, 0); face(te, 'yell', T); }
    if (!loop) { d.position.set(STARTX - 0.4, 0, lane(1)); d.rotation.y = PI / 2; R.dad2.position.set(STARTX - 0.4, 0, lane(2)); R.dad2.rotation.y = PI / 2; R.dad3.position.set(STARTX - 0.4, 0, lane(3)); R.dad3.rotation.y = PI / 2 - 0.4; R.cup.visible = ci < 8; R.dad3.updateMatrixWorld(true); const h = R.dad3.userData.armR.userData.h.getWorldPosition(new T3.Vector3()); R.dad3.userData.armR.rotation.set(-1.2, 0, 0); R.cup.position.set(h.x, h.y + 0.05, h.z); } }
  if (ci === 7) stretch(d, T);
  // the race: hamstring at halfway, still wins
  if (ci === 8) { const k = prog(T, E.c8, E.wins + 0.1); const ham = T > E.ham; const dx = lerp(STARTX, FINX + 0.6, k); d.position.set(dx, 0, lane(1)); d.rotation.y = PI / 2; if (!ham) { walkPose(d, T * 16, 1.6); face(d, 'angry', T); } else { du.legR.rotation.x = -1.2; du.legR.userData.k.rotation.x = 1.4; du.legL.rotation.x = 0.3 * S(T * 16); d.position.y = 0.15 * Math.abs(S(T * 9)); du.armR.rotation.set(0.6, 0, 0.3); du.armL.rotation.set(-2.6, 0, 0); face(d, 'yell', T); d.rotation.z = 0.12 * S(T * 9); }
    [R.dad2, R.dad3].forEach((p, i) => { p.position.set(lerp(STARTX, FINX - 2.5 - i, k), 0, lane(2 + i)); p.rotation.y = PI / 2; walkPose(p, T * 9 + i, 0.8); face(p, 'neutral', T); }); R.cup.visible = false;
    if (T > E.wins) { R.tape.scale.set(1, 1, 0.3); } }
  // winner on the podium, medal held high, still limping; you facepalm
  if (ci === 9) { R.podium.visible = true; d.position.set(FINX + 3, 0.6, 2.5); d.rotation.y = PI / 2 + 0.6; du.armL.rotation.set(-2.9, 0, 0); du.legR.rotation.x = -0.8; du.legR.userData.k.rotation.x = 1.2; face(d, 'grin', T); R.medal.visible = true; d.updateMatrixWorld(true); const h = du.armL.userData.h.getWorldPosition(new T3.Vector3()); R.medal.position.set(h.x, h.y + 0.1, h.z); R.medal.rotation.set(PI / 2, 0, T * 3); R.tape.visible = false;
    you.position.set(FINX + 1.6, 0, 3.6); you.rotation.y = 0.9; u.armR.rotation.set(-2.4, 0, 0.6); u.armR.userData.e.rotation.x = -1.6; face(you, 'neutral', T); [R.dad2, R.dad3].forEach((p, i) => { p.position.set(FINX + 4.4 + i, 0, 1.6 + i); p.rotation.y = -0.6; }); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.sun.position.set(c.x - 8, 18, c.z + 10); R.sun.target.position.set(c.x, 0, c.z - 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }

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
// ---------- captions ----------
const NUMW = {};
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function card(text, y, a, col = '#ffd23a', size = 62) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1.4 - 0.4 * a : 1; octx.translate(360, y); octx.rotate(-0.06); octx.scale(sc, sc); octx.font = size + 'px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round';
  octx.lineWidth = size * 0.28; octx.strokeStyle = '#5a2a0a'; octx.strokeText(text, 0, 4); octx.lineWidth = size * 0.14; octx.strokeStyle = '#fff4d0'; octx.strokeText(text, 0, 0); octx.fillStyle = col; octx.fillText(text, 0, 0); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(62, RW / RH, 0.03, 2000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  { const hz = octx.createLinearGradient(0, 0, 0, H); hz.addColorStop(0, 'rgba(255,220,150,0.18)'); hz.addColorStop(0.5, 'rgba(255,220,150,0)'); octx.fillStyle = hz; octx.fillRect(0, 0, W, H); const fl = octx.createRadialGradient(650, 60, 0, 650, 60, 260); fl.addColorStop(0, 'rgba(255,250,220,0.55)'); fl.addColorStop(1, 'rgba(255,250,220,0)'); octx.fillStyle = fl; octx.fillRect(0, 0, W, H); }
  if (ci === 0 || loop) { card("DON'T ENTER", 300, loop ? 1 : prog(T, 0, 0.15), '#ff5a3a', 66); card("THE PARENTS' RACE", 375, loop ? 1 : prog(T, 0.5, 0.7), '#ffd23a', 50); }
  if (ci === 1) { card('SPORTS DAY', 300, prog(T, E.c1, E.c1 + 0.15)); if (T > E.thirty - 0.1) { const a = prog(T, E.thirty - 0.1, E.thirty + 0.1); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(200,40,20,0.92)'; octx.beginPath(); octx.roundRect(470, 380, 210, 90, 45); octx.fill(); txt('31°C', 575, 426, 54, '#fff'); octx.restore(); } }
  if (ci === 2) { card('SACK RACE', 300, prog(T, E.c2, E.c2 + 0.15)); if (T > E.fall + 0.2 && T < E.whistle) card('FALSE START', 380, prog(T, E.fall + 0.2, E.fall + 0.35), '#ff5a3a', 44); }
  if (ci === 3) { card('EGG & SPOON', 300, prog(T, E.c3, E.c3 + 0.15)); if (T > E.glued - 0.1) card('GLUED?', 380, prog(T, E.glued - 0.1, E.glued + 0.1), '#ff5a3a', 56); }
  if (ci === 4) { card('3-LEGGED RACE', 300, prog(T, E.c4, E.c4 + 0.15), '#ffd23a', 54); if (T > E.ends - 0.1) card('FRIENDSHIP: OVER', 380, prog(T, E.ends - 0.1, E.ends + 0.1), '#ff5a3a', 44); }
  if (ci === 5) card('PARTICIPATION', 300, prog(T, E.c5, E.c5 + 0.15), '#ffd23a', 52);
  if (ci === 6) card("PARENTS' RACE", 300, prog(T, E.c6, E.c6 + 0.15), '#ffd23a', 58);
  if (ci === 7) { card('STRETCHING SINCE 9AM', 300, prog(T, E.c7 + 0.3, E.c7 + 0.45), '#ffd23a', 40); if (T > E.spikes - 0.1) card('RUNNING SPIKES', 380, prog(T, E.spikes - 0.1, E.spikes + 0.1), '#7aff3a', 48); }
  if (ci === 8) { if (T > E.ham - 0.1) card('HAMSTRING', 300, prog(T, E.ham - 0.1, E.ham + 0.1), '#ff5a3a', 58); if (T > E.wins - 0.1) { card('STILL WINS', 380, prog(T, E.wins - 0.1, E.wins + 0.1), '#7aff3a', 56); octx.fillStyle = `rgba(255,255,255,${0.5 * (1 - prog(T, E.wins, E.wins + 0.3))})`; octx.fillRect(0, 0, W, H); } }
  if (ci === 9 && !loop) { card('COMMENT THE RACE', 300, prog(T, E.c9, E.c9 + 0.15), '#ffd23a', 50); card('YOU ALWAYS LOST', 370, prog(T, E.c9 + 0.2, E.c9 + 0.35), '#fff', 50); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
