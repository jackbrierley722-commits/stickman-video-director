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
const E = { c1: CL[1].start, clever: AT(1, 'clever'), c2: CL[2].start, c3: CL[3].start, lean: AT(3, 'he'), c4: CL[4].start, stand: AT(4, 'he'),
  c5: CL[5].start, door: AT(5, 'with'), lock: AT(5, 'and'), much: AT(5, 'much'), c6: CL[6].start };
E.reveal = E.c6 + 0.4; E.loop = TM.total - 0.4;
const UX = [-1.2, 0, 1.2, 2.4]; // urinal x positions along the back wall (z = 0)
function tileTex(base, grout, w, h, rep, seed) { const t = ctex(256, 256, (c) => { c.fillStyle = grout; c.fillRect(0, 0, 256, 256); const r = rng(seed); const tw = 256 / w, th = 256 / h; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = (r() - 0.5) * 8; c.fillStyle = base; c.globalAlpha = 1; c.fillRect(i * tw + 2, j * th + 2, tw - 4, th - 4); c.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 60})`; c.fillRect(i * tw + 2, j * th + 2, tw - 4, th - 4); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function urinal(p, x) { const g = new T3.Group(); g.position.set(x, 0, 0.0); p.add(g); const cer = SM('#f6f6f4', { roughness: 0.12, metalness: 0.05 });
  const body = add(g, Sp(0.26, 24, 18), cer, 0, 0.78, 0.2); body.scale.set(0.9, 1.4, 0.75); add(g, RB(0.4, 0.5, 0.18, 0.08), cer, 0, 0.95, 0.06); add(g, Sp(0.2, 20, 14, 0, PI * 2, PI * 0.5, PI * 0.5), SM('#e8eae8', { roughness: 0.2 }), 0, 0.68, 0.24).scale.set(0.9, 0.6, 0.7);
  const ch = SM('#c8ccd2', { metalness: 0.95, roughness: 0.2 }); add(g, Cy(0.018, 0.018, 0.5, 10), ch, 0, 1.45, 0.04); add(g, Cy(0.04, 0.04, 0.08, 14), ch, 0, 1.72, 0.05); add(g, Bx(0.08, 0.02, 0.02), ch, 0.05, 1.72, 0.08); return g; }
function build() {
  buildSky(); R.sun.intensity = 2.6; R.hemi.intensity = 1.0;
  // ===== RESTROOM =====
  const RM = R.room = new T3.Group(); scene.add(RM);
  add(RM, Bx(9, 0.1, 8), SM('#ffffff', { map: tileTex('#8a8e92', '#5a5e62', 8, 8, [6, 5], 3), roughness: 0.35 }), 0.6, -0.05, 2.6);
  const wt = SM('#ffffff', { map: tileTex('#eef1f2', '#c8ccd0', 6, 12, [6, 3], 5), roughness: 0.25 }); add(RM, Bx(9, 3.2, 0.1), wt, 0.6, 1.6, -0.15); add(RM, Bx(0.1, 3.2, 8), wt, -3.9, 1.6, 2.6); add(RM, Bx(0.1, 3.2, 8), wt, 5.1, 1.6, 2.6);
  add(RM, Bx(9, 0.1, 8), SM('#e8e8e4'), 0.6, 3.2, 2.6, false); for (const x of [-1.5, 1.5, 4]) { add(RM, RB(1.2, 0.05, 0.3, 0.02), SM('#ffffff', { emissive: '#ffffff', emissiveIntensity: 1.2 }), x, 3.14, 1.4, false); }
  R.roomL = new T3.PointLight('#fff8ee', 9, 14, 1.4); R.roomL.position.set(0.6, 2.9, 2.2); RM.add(R.roomL); R.roomL.castShadow = true; R.roomL.shadow.mapSize.set(1024, 1024);
  R.urinals = UX.map(x => urinal(RM, x));
  // dividers (stainless steel), grow taller on cue
  R.div = new T3.Group(); R.div.position.set(0.6, 0, 0.32); RM.add(R.div); R.divPanel = add(R.div, RB(0.04, 1, 0.6, 0.015), SM('#c8ccd2', { metalness: 0.9, roughness: 0.28 }), 0, 0.5, 0); R.divPanel.geometry.translate(0, 0, 0);
  R.bolts = []; for (const y of [0.4, 1.0]) { const bb = add(R.div, Cy(0.018, 0.018, 0.05, 10), SM('#9aa0a6', { metalness: 1, roughness: 0.25 }), 0, y, -0.28); bb.rotation.z = PI / 2; R.bolts.push(bb); }
  // cubicle: two side panels, front with a door, the engaged lock
  const lam = SM('#3a6a8a', { roughness: 0.45 }); R.cub = new T3.Group(); R.cub.position.set(-1.2, 0, 0); RM.add(R.cub);
  R.cubL = add(R.cub, RB(0.04, 2.1, 1.5, 0.015), lam, -0.55, 1.12, 0.75); R.cubR = add(R.cub, RB(0.04, 2.1, 1.5, 0.015), lam, 0.55, 1.12, 0.75); R.cubF = add(R.cub, RB(0.2, 2.1, 0.04, 0.015), lam, -0.48, 1.12, 1.5);
  R.doorPiv = new T3.Group(); R.doorPiv.position.set(0.53, 0, 1.5); R.cub.add(R.doorPiv); R.door = add(R.doorPiv, RB(0.92, 1.95, 0.04, 0.015), lam, -0.46, 1.12, 0);
  const ch = SM('#c8ccd2', { metalness: 0.95, roughness: 0.2 }); for (const y of [0.4, 1.7]) add(R.doorPiv, Cy(0.02, 0.02, 0.12, 10), ch, 0, y, 0.0);
  R.lockTex = ctex(128, 48, () => {}); R.lockFace = add(R.doorPiv, new T3.PlaneGeometry(0.16, 0.06), new T3.MeshBasicMaterial({ map: R.lockTex, toneMapped: false }), -0.8, 1.15, 0.04, false); add(R.doorPiv, RB(0.2, 0.1, 0.02, 0.01), ch, -0.8, 1.15, 0.018);
  R.lockKnob = add(R.doorPiv, Cy(0.03, 0.03, 0.03, 14), ch, -0.8, 1.15, -0.03); R.lockKnob.rotation.x = PI / 2; add(R.lockKnob, Bx(0.05, 0.012, 0.02), SM('#222'), 0, -0.02, 0);
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); RM.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); RM.add(R.bro);
  // ===== STADIUM (the reveal) =====
  const ST = R.stadium = new T3.Group(); scene.add(ST); ST.visible = false;
  const pt = ctex(256, 256, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#3f8a3a' : '#4a9a42'; c.fillRect(0, i * 16, 256, 16); } c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; c.strokeRect(8, 8, 240, 240); c.beginPath(); c.moveTo(8, 128); c.lineTo(248, 128); c.stroke(); c.beginPath(); c.arc(128, 128, 30, 0, 7); c.stroke(); });
  add(ST, Bx(70, 0.1, 105), SM('#ffffff', { map: pt, roughness: 0.9 }), 0, -0.06, 0, false);
  const crowd = ctex(512, 128, (c) => { c.fillStyle = '#222630'; c.fillRect(0, 0, 512, 128); const r = rng(5); for (let i = 0; i < 3200; i++) { c.fillStyle = ['#d83a3a', '#f4f4f4', '#2a5aa8', '#f1c40f', '#e8b890', '#3a3a42'][Math.floor(r() * 6)]; c.fillRect(r() * 512, r() * 128, 3, 4); } }); crowd.wrapS = T3.RepeatWrapping; crowd.repeat.set(8, 1);
  const stand = (x, z, w, ry) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; ST.add(g); const m = add(g, new T3.PlaneGeometry(w, 34), SM('#ffffff', { map: crowd, roughness: 1, side: T3.DoubleSide }), 0, 14, 0, false); m.rotation.x = -0.65; add(g, Bx(w, 2, 2), SM('#5a5e66'), 0, 1, 2, false); add(g, Bx(w, 8, 1), SM('#2a2e36'), 0, 30, -12, false); };
  stand(0, -66, 90, 0); stand(0, 66, 90, PI); stand(-48, 0, 120, PI / 2); stand(48, 0, 120, -PI / 2);
  for (const [x, z] of [[-40, -60], [40, -60], [-40, 60], [40, 60]]) { add(ST, Cy(0.5, 0.7, 50, 10), SM('#8a8e94', { metalness: 0.6 }), x, 25, z, false); add(ST, RB(8, 4, 1, 0.2), SM('#ffffff', { emissive: '#fff8e0', emissiveIntensity: 3 }), x * 0.92, 50, z * 0.92, false).lookAt(0, 0, 0); }
  R.screen = add(ST, Bx(18, 9, 0.5), SM('#111'), 0, 26, -58, false); R.screenImg = add(ST, new T3.PlaneGeometry(17, 8.4), new T3.MeshBasicMaterial({ map: ctex(512, 256, (c) => { c.fillStyle = '#0a0a12'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#3a6a8a'; c.fillRect(196, 50, 120, 170); c.fillStyle = '#d83a3a'; c.fillRect(290, 120, 18, 8); c.fillStyle = '#fff'; c.font = '28px Russo'; c.fillText('LIVE', 20, 40); c.fillStyle = '#d83a3a'; c.beginPath(); c.arc(100, 30, 8, 0, 7); c.fill(); }), toneMapped: false }), 0, 26, -57.7, false);
}
function lockDraw(engaged) { const c = R.lockTex.userData.g; c.fillStyle = engaged ? '#c81e1e' : '#1e8a3a'; c.fillRect(0, 0, 128, 48); c.fillStyle = '#fff'; c.font = '22px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(engaged ? 'ENGAGED' : 'VACANT', 64, 25); R.lockTex.needsUpdate = true; }
let LOCKED = null;
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [-0.6, 1.95, 3.6], [-0.6, 1.9, 3.2], [-0.6, 1.3, 0], [-0.6, 1.3, 0])],
  [E.c1, (k, T) => TR(k, [0.3, 2.4, 6.4], [0.3, 2.3, 5.8], [0.3, 1.1, 0], [0.3, 1.1, 0])],
  [E.c2, (k, T) => TR(k, [1.6, 1.8, 3.4], [1.1, 1.7, 2.8], [0.2, 1.3, 0], [-0.2, 1.3, 0])],
  [E.c3, (k, T) => TR(k, [0.6, 1.7, 2.6], [0.6, 1.6, 2.2], [0.6, 0.8, 0.2], [0.6, 0.8, 0.2])],
  [E.lean - 0.1, (k, T) => TR(k, [-0.4, 1.85, 2.4], [-0.3, 1.8, 2.1], [0.2, 1.5, 0.2], [0.2, 1.5, 0.2])],
  [E.c4, (k, T) => TR(k, [0.6, 1.0, 2.6], [0.6, 1.6, 2.6], [0.6, 1.2, 0.3], [0.6, 2.0, 0.3])],
  [E.stand - 0.1, (k, T) => TR(k, [-0.5, 2.2, 3.2], [-0.4, 2.3, 2.8], [0.6, 2.0, 0.2], [0.6, 2.1, 0.2])],
  [E.c5, (k, T) => TR(k, [0.4, 2.6, 4.4], [0.2, 2.5, 3.8], [-1.2, 1.1, 0.8], [-1.2, 1.1, 0.8])],
  [E.door - 0.1, (k, T) => TR(k, [0.6, 1.6, 3.6], [0.4, 1.55, 3.3], [-1.0, 1.15, 1.5], [-1.0, 1.15, 1.5])],
  [E.lock - 0.1, (k, T) => TR(k, [-1.4, 1.1, 2.35], [-1.42, 1.08, 2.15], [-1.47, 0.98, 1.52], [-1.47, 0.98, 1.52])],
  [E.much - 0.1, (k, T) => TR(k, [0.8, 1.7, 3.6], [0.6, 1.7, 3.2], [-1.0, 1.3, 1.2], [-1.0, 1.3, 1.2])],
  [E.c6, (k, T) => { const q = ease(prog(T, E.reveal, E.loop - 0.2)); look(L3([0.6, 2.0, 5], [30, 38, 70], q), L3([-1.2, 1.2, 0.8], [-1.2, 0, 0], q)); }],
  [E.loop, (k, T) => look([-0.6, 1.95, 3.6], [-0.6, 1.3, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function atUrinal(p, x) { rest(p); p.position.set(x, 0, 0.62); p.rotation.set(0, PI, 0); const u = p.userData; u.armL.rotation.x = -0.6; u.armR.rotation.x = -0.6; u.armL.userData.e.rotation.x = -0.6; u.armR.userData.e.rotation.x = -0.6; u.head.rotation.x = 0.25; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci;
  const reveal = cl === 6 && T > E.reveal; R.stadium.visible = reveal; R.sky.visible = reveal; scene.background = reveal ? new T3.Color('#0a1022') : null;
  // the room's walls/ceiling fall away for the reveal, the cubicle stays on the pitch
  R.room.children.forEach(m => { if (m !== R.cub && m !== R.you && m !== R.bro && m !== R.roomL) m.visible = !reveal; }); R.roomL.intensity = reveal ? 0 : 9; R.sun.intensity = reveal ? 1.4 : 1.2; R.hemi.intensity = reveal ? 1.0 : 0.6;
  const you = R.you, bro = R.bro; atUrinal(you, UX[0]); face(you, 'neutral', T); bro.visible = true;
  // bro positions
  if (cl === 0) { atUrinal(bro, UX[1]); bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.35; }
  else if (cl === 1) { const k = prog(T, E.c1 + 0.2, E.clever); atUrinal(bro, lerp(UX[1], UX[2], k)); face(you, T > E.clever - 0.1 ? 'grin' : 'neutral', T); }
  else if (cl === 2) { const k = prog(T, E.c2 + 0.3, E.c3 - 0.3); atUrinal(bro, lerp(UX[2], UX[1], ease(k))); if (k > 0 && k < 1) walkPose(bro, T * 8, 0.5), bro.rotation.y = -PI / 2; bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.4; }
  else if (cl === 3 || cl === 4) { atUrinal(bro, UX[1]); const lean = cl === 3 && T > E.lean - 0.1 ? ease(prog(T, E.lean - 0.1, E.lean + 0.4)) : 0; bro.userData.up.rotation.z = 0.5 * lean; bro.position.x = UX[1] - 0.15 * lean; bro.userData.head.rotation.y = -0.7 * lean; face(bro, 'grin', T); face(you, lean > 0.5 ? 'shock' : 'neutral', T); you.userData.head.rotation.y = 0.4 * lean;
    if (cl === 4) { const up = T > E.stand - 0.1 ? ease(prog(T, E.stand - 0.1, E.stand + 0.5)) : 0; bro.position.set(UX[1], 0.62 * up, 0.62 - 0.32 * up); bro.userData.up.rotation.z = 0; bro.userData.head.rotation.set(0.55 * up, -0.4 * up, 0); face(bro, 'grin', T); face(you, up > 0.5 ? 'angry' : 'neutral', T); you.userData.head.rotation.x = -0.3 * up; you.userData.head.rotation.y = 0.3 * up; } }
  else if (cl >= 5 || loop) { atUrinal(bro, 0.3); bro.position.z = 2.3; bro.rotation.y = PI * 0.9; const knock = cl === 5 && T > E.lock ? Math.abs(S(T * 9)) : 0; bro.userData.armR.rotation.x = -1.5 - 0.3 * knock; face(bro, cl === 6 ? 'shock' : 'angry', T);
    if (reveal) { bro.position.set(0.6, 0, 2.4); bro.rotation.y = 0.3; rest(bro); bro.userData.armR.rotation.set(-2.9, 0, -0.3 + 0.3 * S(T * 8)); bro.userData.armL.rotation.set(-2.9, 0, 0.3); face(bro, 'grin', T); } }
  if (loop) { atUrinal(bro, UX[1]); bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.35; }
  // divider
  const divOn = cl >= 3 && cl <= 4; R.div.visible = divOn; const tall = cl === 4 ? ease(prog(T, E.c4 + 0.3, E.stand - 0.3)) : 0; R.div.scale.y = 1 + 1.3 * tall; R.div.position.y = 0.45; R.bolts.forEach((b, i) => b.rotation.x = cl === 3 ? T * 20 * (T < E.c3 + 1.2 ? 1 : 0) : 0);
  // cubicle builds around you
  const cubOn = cl >= 5 || (loop && false); R.cub.visible = cl >= 5 && !loop; const rise = cl === 5 ? ease(prog(T, E.c5 + 0.1, E.door - 0.2)) : 1; [R.cubL, R.cubR, R.cubF].forEach(m => { m.scale.y = Math.max(0.01, rise); m.position.y = 1.12 * rise; });
  R.doorPiv.visible = cl > 5 || T > E.door - 0.1; R.doorPiv.rotation.y = cl === 5 ? -1.4 * (1 - ease(prog(T, E.door + 0.1, E.door + 0.7))) : 0;
  const engaged = cl > 5 || T > E.lock + 0.5; R.lockKnob.rotation.z = engaged ? PI / 2 : 0; if (LOCKED !== engaged) { lockDraw(engaged); LOCKED = engaged; }
  if (cl >= 5 && !loop) { you.visible = !(reveal && false); face(you, cl === 6 ? 'grin' : (T > E.much - 0.1 ? 'grin' : 'neutral'), T); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(0, 0, 0); return { si, t0 }; }

// ---------- captions only: small bold white with a soft shadow, 2-3 words, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w => { const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.shadowColor = 'rgba(0,0,0,0.85)'; octx.shadowBlur = 10; octx.shadowOffsetY = 3; octx.lineJoin = 'round'; octx.lineWidth = 5; octx.strokeStyle = 'rgba(0,0,0,0.55)'; octx.strokeText(c.t, 360, 640); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 640); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#c8d4dc', 60, 500); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a8ac8'); gr.addColorStop(0.5, '#e8ecf0'); gr.addColorStop(1, '#5a5a50'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); scene.environment = pm.fromScene(es, 0.04).texture; }
  build(); out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};

function label(T, t0, top, sub, col = '#ffd34a', y = 180) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '30px Russo'; const w = Math.max(octx.measureText(top).width, 160) + 60; pill(360 - w / 2, y, w, 60, col); txt(top, 360, y + 32, 30, '#111'); if (sub) txt(sub, 360, y + 88, 26, '#fff'); octx.restore(); }
function callout(T, t0, s_, x, y, col = '#ffd34a') { const k = ease(prog(T, t0 - 0.05, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; pill(x - w / 2, y - 26, w, 52, 'rgba(10,12,28,0.88)', col); txt(s_, x, y + 1, 28, col); octx.restore(); }

window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.06)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
