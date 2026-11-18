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
const E = { c1: CL[1].start, knock: AT(1, 'knock'), says1: AT(1, 'he'), c2: CL[2].start, two: AT(2, 'two'), c3: CL[3].start, back: AT(3, 'he'), busy: AT(3, 'it'),
  c4: CL[4].start, water: AT(4, 'and'), more: AT(4, 'now'), c5: CL[5].start, opens: AT(5, 'the'), much: AT(5, 'much'), c6: CL[6].start, c7: CL[7].start };
E.loop = TM.total - 0.4;
const DZ = -2; // the bathroom door sits in the wall at z = -2
function paperTex(text, col) { return ctex(256, 180, (c) => { c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, 256, 180); c.strokeStyle = '#c8d8e8'; c.lineWidth = 2; for (let y = 30; y < 180; y += 26) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } c.fillStyle = col; c.font = '64px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(128, 96); c.rotate(-0.06); c.fillText(text, 0, 0); c.restore(); }); }
function screenTex(kind) { return ctex(320, 200, (c) => { if (kind === 'game') { const g = c.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#1a3a7a'); g.addColorStop(1, '#3a1a5a'); c.fillStyle = g; c.fillRect(0, 0, 320, 200); c.fillStyle = '#2a8a3a'; c.fillRect(0, 140, 320, 60); c.fillStyle = '#ffd34a'; c.fillRect(150, 100, 20, 40); c.fillStyle = '#fff'; c.font = '16px Russo'; c.fillText('KILLS 27', 10, 20); }
  else if (kind === 'live') { c.fillStyle = '#121218'; c.fillRect(0, 0, 320, 200); c.fillStyle = '#e8263a'; c.fillRect(10, 10, 70, 26); c.fillStyle = '#fff'; c.font = '18px Russo'; c.fillText('LIVE', 22, 30); c.fillText('41.2K watching', 96, 30); const r = rng(3); for (let i = 0; i < 6; i++) { c.fillStyle = ['#9ad0ff', '#ffd34a', '#ff9ab0', '#8ff0a4'][i % 4]; c.font = '14px Arial'; c.fillText(['W stream', 'is he in the toilet??', 'LMAO', 'bro 45 mins', 'hydrate king', 'knock knock'][i], 12, 64 + i * 22); } }
  else { c.fillStyle = '#0a0a10'; c.fillRect(0, 0, 320, 200); c.fillStyle = '#e8263a'; c.font = '30px Russo'; c.textAlign = 'center'; c.fillText('NO INTERNET', 160, 110); } }); }
function build() {
  buildSky(); R.sun.intensity = 0.0; R.hemi.intensity = 0.22; R.sky.visible = false;
  // ===== HALLWAY =====
  const H = R.hall = new T3.Group(); scene.add(H);
  add(H, Bx(8, 0.1, 6), SM('#ffffff', { map: noiseTex(128, 512, '#8a6040', [['rgba(60,30,10,0.25)', 600, 2], ['rgba(255,220,180,0.06)', 300, 2]], 4, [6, 2]), roughness: 0.55 }), 0, -0.05, 1);
  const paint = SM('#e8dcc8', { roughness: 0.85 }); add(H, Bx(3.35, 2.8, 0.15), paint, -2.17, 1.4, DZ); add(H, Bx(3.35, 2.8, 0.15), paint, 2.17, 1.4, DZ); add(H, Bx(1.0, 0.65, 0.15), paint, 0, 2.475, DZ); add(H, Bx(0.15, 2.8, 6), paint, -3.8, 1.4, 1); add(H, Bx(0.15, 2.8, 6), paint, 3.8, 1.4, 1); add(H, Bx(8, 0.1, 6), SM('#f2f0ea'), 0, 2.8, 1, false);
  add(H, Bx(8, 0.12, 0.03), SM('#f4f2ee'), 0, 0.06, DZ + 0.09); const trim = SM('#f4f2ee', { roughness: 0.4 }); add(H, Bx(1.12, 0.08, 0.06), trim, 0, 2.17, DZ + 0.09); add(H, Bx(0.06, 2.15, 0.06), trim, -0.53, 1.08, DZ + 0.09); add(H, Bx(0.06, 2.15, 0.06), trim, 0.53, 1.08, DZ + 0.09);
  R.doorPiv = new T3.Group(); R.doorPiv.position.set(-0.5, 0, DZ); H.add(R.doorPiv); R.door = add(R.doorPiv, RB(0.98, 2.1, 0.05, 0.015), SM('#f4f2ee', { roughness: 0.45 }), 0.49, 1.07, 0);
  for (const [y, h] of [[1.55, 0.7], [0.55, 0.7]]) add(R.doorPiv, RB(0.7, h, 0.01, 0.005), SM('#e8e6e0', { roughness: 0.5 }), 0.49, y, 0.03, false); add(R.doorPiv, Sp(0.035), SM('#c8a040', { metalness: 1, roughness: 0.25 }), 0.88, 1.0, 0.06);
  // the RGB glow leaking under the door (the clue)
  R.leak = add(H, new T3.PlaneGeometry(0.95, 0.5), new T3.MeshBasicMaterial({ color: '#ff3af0', transparent: true, opacity: 0.5, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false }), 0, 0.006, DZ + 0.25, false); R.leak.scale.y = 0.6; R.leakL = new T3.PointLight('#ff3af0', 2.5, 1.6, 1.5); R.leakL.position.set(0, 0.08, DZ + 0.15); H.add(R.leakL); R.leak.rotation.x = -PI / 2;
  R.hallL = new T3.PointLight('#ffe2b8', 12, 9, 1.4); R.hallL.castShadow = true; R.hallL.position.set(0, 2.5, 1.5); H.add(R.hallL); add(H, Cy(0.18, 0.18, 0.05, 20), SM('#fff', { emissive: '#fff2dc', emissiveIntensity: 2 }), 0, 2.74, 1.5, false);
  // wall clock (time skip) and the router shelf
  R.clock = new T3.Group(); R.clock.position.set(-1.6, 2.0, DZ + 0.09); H.add(R.clock); add(R.clock, Cy(0.22, 0.22, 0.04, 28), SM('#ffffff'), 0, 0, 0).rotation.x = PI / 2; add(R.clock, new T3.TorusGeometry(0.22, 0.02, 8, 28), SM('#2a2a2e'), 0, 0, 0.01);
  R.cM = new T3.Group(); R.cM.position.z = 0.03; R.clock.add(R.cM); add(R.cM, Bx(0.015, 0.17, 0.01), SM('#111'), 0, 0.08, 0, false); R.cH = new T3.Group(); R.cH.position.z = 0.035; R.clock.add(R.cH); add(R.cH, Bx(0.025, 0.11, 0.01), SM('#111'), 0, 0.05, 0, false);
  add(H, Bx(0.9, 0.04, 0.3), SM('#8a5a32'), 1.8, 1.1, DZ + 0.22); R.router = new T3.Group(); R.router.position.set(1.8, 1.14, DZ + 0.22); H.add(R.router); add(R.router, RB(0.36, 0.06, 0.2, 0.02), SM('#1a1a1e', { roughness: 0.4 }), 0, 0.03, 0); for (const sx of [-0.14, 0.14]) { const an = add(R.router, Cy(0.008, 0.008, 0.2, 6), SM('#1a1a1e'), sx, 0.15, -0.06); an.rotation.z = sx * 0.6; }
  R.leds = []; for (let i = 0; i < 4; i++) R.leds.push(add(R.router, Sp(0.008, 6, 4), new T3.MeshBasicMaterial({ color: '#30ff60', toneMapped: false }), -0.09 + i * 0.06, 0.04, 0.101, false));
  R.plug = new T3.Group(); H.add(R.plug); add(R.plug, Bx(0.05, 0.05, 0.04), SM('#f4f4f4'), 0, 0, 0); R.cable = add(H, Cy(0.006, 0.006, 0.6, 6), SM('#222'), 0, 0, 0, false);
  // the note
  R.note = add(H, new T3.PlaneGeometry(0.22, 0.155), new T3.MeshStandardMaterial({ map: paperTex('PLEASE', '#2a4a8a'), roughness: 0.9, side: T3.DoubleSide }), 0, 0.012, DZ + 0.3, false); R.note.rotation.x = -PI / 2; R.noteBusy = paperTex('BUSY', '#c81e1e'); R.notePlease = R.note.material.map;
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); H.add(R.you);
  R.phone = new T3.Group(); R.you.userData.armR.userData.h.add(R.phone); add(R.phone, RB(0.075, 0.15, 0.01, 0.008), SM('#111'), 0, -0.06, 0.03); R.phoneScr = add(R.phone, new T3.PlaneGeometry(0.066, 0.135), new T3.MeshBasicMaterial({ map: ctex(64, 128, (c) => { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#6ac8ff'); g.addColorStop(1, '#2a6ab8'); c.fillStyle = g; c.fillRect(0, 0, 64, 128); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; for (let x = 6; x < 64; x += 8) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x + 2, 128); c.stroke(); } c.fillStyle = '#3a6a3a'; c.fillRect(0, 0, 64, 20); }), toneMapped: false }), 0, -0.06, 0.036, false);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); scene.add(R.bro); R.headset = new T3.Group(); R.bro.userData.head.add(R.headset); add(R.headset, new T3.TorusGeometry(0.115, 0.012, 6, 20, PI), SM('#1a1a1e'), 0, 0.02, 0).rotation.y = PI / 2; for (const sx of [-1, 1]) add(R.headset, Cy(0.045, 0.045, 0.03, 14), SM('#e8263a', { emissive: '#e8263a', emissiveIntensity: 0.6 }), sx * 0.11, 0.0, 0).rotation.z = PI / 2;
  // ===== BATHROOM (the secret setup) =====
  const B = R.bath = new T3.Group(); scene.add(B);
  add(B, Bx(4, 0.1, 3.2), SM('#ffffff', { map: noiseTex(64, 64, '#30343a', [['rgba(0,0,0,0.1)', 200, 2]], 6, [6, 5]), roughness: 0.3, envMapIntensity: 0.15 }), 0, -0.04, DZ - 1.6);
  const tile = SM('#2a3038', { roughness: 0.35, envMapIntensity: 0.15 }); add(B, Bx(4, 2.8, 0.1), tile, 0, 1.4, DZ - 3.2); add(B, Bx(0.1, 2.8, 3.2), tile, -2, 1.4, DZ - 1.6); add(B, Bx(0.1, 2.8, 3.2), tile, 2, 1.4, DZ - 1.6);
  const cer = SM('#f6f6f4', { roughness: 0.15 }); const tl = new T3.Group(); tl.position.set(-0.9, 0, DZ - 2.4); B.add(tl); add(tl, Cy(0.18, 0.14, 0.4, 20), cer, 0, 0.2, 0.05); add(tl, Sp(0.24, 20, 12), cer, 0, 0.42, 0.15).scale.set(0.85, 0.25, 1.15); add(tl, RB(0.42, 0.42, 0.18, 0.04), cer, 0, 0.62, -0.18);
  // desk + 3 monitors + RGB
  add(B, Bx(1.6, 0.05, 0.6), SM('#1a1a1e', { roughness: 0.4 }), 0.6, 0.78, DZ - 2.85); for (const x of [-0.15, 1.35]) add(B, Bx(0.05, 0.78, 0.5), SM('#1a1a1e'), x, 0.39, DZ - 2.85);
  R.mons = []; [[-0.05, 0.35], [0.6, 0], [1.25, -0.35]].forEach(([x, ry], i) => { const m = new T3.Group(); m.position.set(x, 1.18, DZ - 3.0); m.rotation.y = ry; m.scale.setScalar(1.25); B.add(m); add(m, RB(0.56, 0.34, 0.03, 0.01), SM('#111'), 0, 0, 0); const scr = add(m, new T3.PlaneGeometry(0.52, 0.3), new T3.MeshBasicMaterial({ map: screenTex(i === 1 ? 'live' : 'game'), toneMapped: false }), 0, 0, 0.017, false); R.mons.push(scr); });
  R.noNet = screenTex('off'); R.monTex = R.mons.map(m => m.material.map);
  R.rgb = []; for (const [x, y, z, w, h] of [[0, 2.7, DZ - 3.13, 3.9, 0.04], [-1.94, 1.4, DZ - 1.6, 0.04, 2.6], [1.94, 1.4, DZ - 1.6, 0.04, 2.6]]) R.rgb.push(add(B, Bx(w, h, 0.04), new T3.MeshBasicMaterial({ color: '#ff3af0', toneMapped: false }), x, y, z, false));
  R.rgbL = new T3.PointLight('#ff3af0', 18, 7, 1.4); R.rgbL.position.set(0.3, 2.0, DZ - 1.5); B.add(R.rgbL); R.monL = new T3.PointLight('#6a9aff', 10, 4, 1.4); R.monL.position.set(0.6, 1.2, DZ - 2.4); B.add(R.monL);
  const fr = new T3.Group(); fr.position.set(1.6, 0, DZ - 1.0); B.add(fr); add(fr, RB(0.5, 0.8, 0.5, 0.03), SM('#e8e8ec', { roughness: 0.3 }), 0, 0.4, 0); add(fr, Bx(0.4, 0.05, 0.02), new T3.MeshBasicMaterial({ color: '#7af0ff', toneMapped: false }), 0, 0.72, -0.26, false);
  add(B, new T3.TorusGeometry(0.22, 0.02, 8, 30), new T3.MeshBasicMaterial({ color: '#fff8e8', toneMapped: false }), -1.6, 1.6, DZ - 2.6, false); add(B, Cy(0.012, 0.012, 1.4, 6), SM('#222'), -1.6, 0.75, DZ - 2.6);
  R.chair = new T3.Group(); R.chair.position.set(1.3, 0, DZ - 2.1); R.chair.rotation.y = -0.8; B.add(R.chair); add(R.chair, RB(0.5, 0.1, 0.5, 0.04), SM('#e8263a', { roughness: 0.4 }), 0, 0.5, 0); add(R.chair, RB(0.5, 0.8, 0.1, 0.04), SM('#e8263a', { roughness: 0.4 }), 0, 0.95, 0.25); add(R.chair, Cy(0.03, 0.03, 0.45, 8), SM('#222'), 0, 0.25, 0);
}
const SH = [
  [0, (k, T) => TR(k, [0.9, 1.5, 2.2], [0.75, 1.45, 1.9], [-0.1, 0.9, DZ], [-0.1, 0.9, DZ])],
  [E.c1, (k, T) => TR(k, [1.0, 1.35, DZ + 1.1], [0.95, 1.35, DZ + 1.0], [0.15, 1.25, DZ + 0.2], [0.15, 1.25, DZ + 0.2])],
  [E.c2, (k, T) => TR(k, [-0.4, 1.6, 1.4], [-0.6, 1.7, 1.0], [-1.5, 1.4, DZ], [-1.6, 1.8, DZ])],
  [E.c3, (k, T) => TR(k, [0.55, 0.45, DZ + 0.75], [0.5, 0.38, DZ + 0.65], [0.05, 0.0, DZ + 0.22], [0.05, 0.0, DZ + 0.22])],
  [E.c4, (k, T) => TR(k, [1.1, 1.35, DZ + 0.8], [1.0, 1.3, DZ + 0.7], [0.2, 1.15, DZ + 0.35], [0.2, 1.15, DZ + 0.35])],
  [E.more - 0.1, (k, T) => TR(k, [0.0, 1.3, 1.8], [0.0, 1.3, 1.6], [0.0, 0.9, DZ + 0.6], [0.0, 0.9, DZ + 0.6])],
  [E.c5, (k, T) => TR(k, [1.9, 1.35, DZ + 0.8], [1.85, 1.3, DZ + 0.7], [1.8, 1.15, DZ + 0.22], [1.8, 1.15, DZ + 0.22])],
  [E.opens - 0.1, (k, T) => TR(k, [0.8, 1.6, 1.8], [0.6, 1.6, 1.4], [0, 1.3, DZ], [0, 1.3, DZ])],
  [E.c6, (k, T) => TR(k, [0.3, 1.6, DZ + 0.9], [0.5, 1.5, DZ - 0.2], [0.2, 1.15, DZ - 3], [0.2, 1.15, DZ - 2.6])],
  [E.c7, (k, T) => TR(k, [1.1, 1.6, 0.6], [1.0, 1.6, 0.3], [0.2, 1.4, DZ], [0.2, 1.4, DZ])],
  [E.loop, (k, T) => look([0.9, 1.5, 2.2], [-0.1, 0.9, DZ])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function needIt(p, T, amt = 1) { rest(p); const u = p.userData; u.legL.rotation.z = 0.1 * amt; u.legR.rotation.z = -0.1 * amt; u.legL.rotation.x = 0.1 * S(T * 9) * amt; u.legR.rotation.x = -0.1 * S(T * 9) * amt; u.up.rotation.x = 0.12 * amt; u.armL.rotation.set(-0.5, 0, 0.2); u.armR.rotation.set(-0.5, 0, -0.2); p.position.y = 0.02 * Math.abs(S(T * 9)) * amt; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const you = R.you, bro = R.bro, u = you.userData;
  const hue = (T * 0.25) % 1; const rgbCol = new T3.Color().setHSL(hue, 0.9, 0.55); R.rgb.forEach(m => m.material.color.copy(rgbCol)); R.rgbL.color.copy(rgbCol); R.leak.material.color.copy(rgbCol);
  const doorOpen = (cl === 5 && T > E.opens + 1.0) || cl === 6; R.doorPiv.rotation.y = doorOpen ? -1.6 * ease(prog(T, cl === 6 ? 0 : E.opens + 1.0, cl === 6 ? 0.01 : E.opens + 1.5)) : 0; R.leak.material.opacity = doorOpen ? 0 : 0.55 + 0.15 * S(T * 3); R.leakL.color.copy(rgbCol); R.leakL.intensity = doorOpen ? 0 : 2.5;
  const netOff = (cl === 5 && T > E.c5 + 1.0) || cl === 6; R.leds.forEach((l, i) => l.material.color.set(netOff ? '#202020' : (Math.floor(T * 6 + i) % 3 ? '#30ff60' : '#106020'))); R.mons.forEach((m, i) => m.material.map = netOff ? R.noNet : R.monTex[i]);
  // you: desperate outside the door
  you.visible = true; you.position.set(0.15, 0, DZ + 0.8); you.rotation.set(0, PI, 0); needIt(you, T, cl === 4 && T > E.more - 0.2 ? 2.2 : 1); face(you, 'angry', T); R.phone.visible = false;
  if (cl === 1 && T < E.says1 + 0.2) { const kn = Math.max(0, S((T - E.knock) * 18)); u.armR.rotation.set(-1.6 - 0.25 * kn, 0, -0.1); u.armR.userData.e.rotation.x = -0.6; }
  if (cl === 1 && T > E.says1) face(you, 'neutral', T);
  if (cl === 2) { you.position.set(-1.0, 0, DZ + 0.45); you.rotation.y = PI * 0.95; rest(you); for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.2; l.userData.k.rotation.x = 0.4; } you.position.y = -0.62; u.up.rotation.x = -0.25; u.armL.rotation.x = u.armR.rotation.x = -0.7; face(you, 'neutral', T); }
  if (cl === 3) { rest(you); you.position.set(-0.45, 0, DZ + 0.55); you.rotation.y = PI + 0.5; for (const l of [u.legL, u.legR]) { l.rotation.x = -1.6; l.userData.k.rotation.x = 2.4; } you.position.y = -0.55; u.up.rotation.x = 0.6; u.armR.rotation.set(-1.3, 0, 0); face(you, 'neutral', T); }
  if (cl === 4) { R.phone.visible = T > E.water - 0.3; if (R.phone.visible) { u.armR.rotation.set(-1.5, 0.2, -0.3); u.armR.userData.e.rotation.x = -0.3; } face(you, T > E.more - 0.2 ? 'shock' : 'angry', T); }
  if (cl === 5) { if (T < E.c5 + 1.2) { you.position.set(1.65, 0, DZ + 0.75); you.rotation.y = PI; rest(you); u.armR.rotation.set(-1.2 - 0.6 * prog(T, E.c5 + 0.4, E.c5 + 1.0), 0, 0); } else { you.position.set(1.1, 0, DZ + 0.9); you.rotation.y = PI + 0.7; rest(you); face(you, T > E.much - 0.1 ? 'grin' : 'neutral', T); } }
  if (cl === 6) { you.visible = false; }
  if (cl === 7) { you.position.set(0.2, 0, DZ + 0.8); needIt(you, T, 0.4); face(you, 'grin', T); }
  // router plug pulled
  const pulled = netOff ? 1 : (cl === 5 ? prog(T, E.c5 + 0.5, E.c5 + 1.0) : 0); R.plug.position.set(2.25 + 0.1, 0.7 - pulled * 0.25, DZ + 0.09 + 0.05 + pulled * 0.2); R.cable.position.set(2.1, 0.92, DZ + 0.16); R.cable.rotation.z = 0.9; R.cable.visible = true;
  // the note: slides under, comes back BUSY
  R.note.visible = cl === 3; if (cl === 3) { const outK = prog(T, E.c3 + 0.3, E.back - 0.3), backK = prog(T, E.back, E.busy - 0.1); R.note.position.z = DZ + 0.3 - 0.6 * outK + 0.6 * backK; R.note.material.map = T > E.back ? R.noteBusy : R.notePlease; R.note.material.needsUpdate = true; }
  // clock jumps 20 minutes
  const mins = cl === 2 ? 45 + 20 * ease(prog(T, E.c2, E.two)) : cl >= 3 ? 70 : 45; R.cM.rotation.z = -mins / 60 * 2 * PI; R.cH.rotation.z = -(10 + mins / 60) / 12 * 2 * PI;
  // bro: gaming in the bathroom, then caught
  bro.visible = cl === 5 && T > E.opens + 1.0 || cl === 6; rest(bro);
  if (cl === 5) { bro.position.set(0, 0, DZ - 0.25); bro.rotation.set(0, 0, 0); face(bro, 'shock', T); bro.userData.armR.rotation.set(-1.6, 0, -0.2); }
  if (cl === 6) { bro.position.set(-0.45, 0, DZ - 1.4); bro.rotation.set(0, 0.5, 0); face(bro, 'grin', T); bro.userData.armL.rotation.set(-0.4, 0, 0.5); bro.userData.armR.rotation.set(-0.4, 0, -0.5); bro.userData.head.rotation.y = 0.2; }
  R.bath.visible = cl >= 5 && (T > E.opens + 0.8 || cl === 6); renderer.toneMappingExposure = cl === 6 ? 0.75 : 0.9; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(0, 0, 0); return { si, t0 }; }
// ---------- captions only: small bold white with a soft shadow, 2-3 words, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: ({ forty: '40', five: '5', twenty: '20', three: '3' })[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.shadowColor = 'rgba(0,0,0,0.85)'; octx.shadowBlur = 10; octx.shadowOffsetY = 3; octx.lineJoin = 'round'; octx.lineWidth = 5; octx.strokeStyle = 'rgba(0,0,0,0.55)'; octx.strokeText(c.t, 360, 640); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 640); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#c8d4dc', 60, 500); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3e48'); gr.addColorStop(0.5, '#6a6862'); gr.addColorStop(1, '#3a3630'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); scene.environment = pm.fromScene(es, 0.04).texture; }
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
