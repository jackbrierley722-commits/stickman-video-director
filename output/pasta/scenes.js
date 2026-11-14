// How to make pasta — "If you... But... So..." — PS3-style: smooth shading, soft shadows, warm light, sharp render.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 540, RH = 960;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
const AT = wt;
let renderer, scene, camera, glc, out, octx, small, sctx;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0 }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, shadow = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d);
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
let GLOW; function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }

// ---------- the kitchen ----------
const O = {}; const BY = 0.06; // board top
function noodleNest(parent, n, R, col, seed) { const r = rng(seed); const g = new T3.Group(); parent.add(g); const m = SM(col, { roughness: 0.45 });
  for (let i = 0; i < n; i++) { const pts = []; const a0 = r() * PI * 2, turns = 1.2 + r() * 1.4, rr = R * (0.3 + r() * 0.7); for (let k = 0; k <= 40; k++) { const u = k / 40; const a = a0 + u * turns * PI * 2; const rad = rr * (0.4 + 0.6 * S(u * PI)); pts.push(new T3.Vector3(C(a) * rad, 0.006 + S(u * PI) * R * 0.35 * (0.5 + r() * 0.5), S(a) * rad)); }
    const tb = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 60, 0.0035, 5, false), m); tb.castShadow = true; g.add(tb); } return g; }
function build() { const r = rng(9);
  scene.add(new T3.HemisphereLight('#fff2e0', '#6a4a3a', 0.9));
  const key = new T3.DirectionalLight('#ffe6c8', 3.2); key.position.set(-1.2, 2.2, 1.4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -1.2; key.shadow.camera.right = 1.2; key.shadow.camera.top = 1.2; key.shadow.camera.bottom = -1.2; key.shadow.radius = 4; key.shadow.bias = -0.0005; scene.add(key);
  const fill = new T3.PointLight('#ffd8a0', 1.5, 4, 1.5); fill.position.set(0.8, 1.0, 0.6); scene.add(fill); const rim = new T3.DirectionalLight('#c8dcff', 1.0); rim.position.set(1, 1.5, -2); scene.add(rim);
  // counter (marble), backsplash tiles, window
  const marble = ctex(256, 256, (g, w, h) => { g.fillStyle = '#ece8e2'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(150,140,135,${0.08 + r() * 0.15})`; g.lineWidth = 0.5 + r() * 1.5; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.3) * 40; y += (r() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); } }, [3, 2]);
  add(scene, Bx(4, 0.06, 1.4), SM('#ffffff', { map: marble, roughness: 0.25 }), 0, -0.03, -0.1); add(scene, Bx(4, 0.9, 1.3), SM('#3a4a5a', { roughness: 0.5 }), 0, -0.51, -0.05);
  const tiles = ctex(256, 128, (g, w, h) => { g.fillStyle = '#d8d2c8'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 16; x < w + 32; x += 64) { g.fillStyle = `rgb(${236 - r() * 10},${232 - r() * 10},${224 - r() * 10})`; g.fillRect(x + 2, y + 2, 60, 28); } }, [4, 3]);
  add(scene, new T3.PlaneGeometry(4, 1.6), SM('#ffffff', { map: tiles, roughness: 0.3 }), 0, 0.8, -0.8, false);
  const win = add(scene, new T3.PlaneGeometry(0.9, 0.6), new T3.MeshBasicMaterial({ color: '#fff4dc' }), -0.9, 0.95, -0.79, false); glow(scene, '#ffe8c0', 1.8, -0.9, 0.95, -0.7, 0.35);
  for (const [x, y, w, h] of [[-0.9, 0.95, 0.94, 0.04], [-0.9, 1.25, 0.94, 0.04], [-0.9, 0.65, 0.94, 0.04], [-1.35, 0.95, 0.04, 0.64], [-0.45, 0.95, 0.04, 0.64], [-0.9, 0.95, 0.03, 0.6]]) add(scene, Bx(w, h, 0.03), SM('#f4f0e8'), x, y, -0.78, false);
  // shelf + jars + plant
  add(scene, Bx(1.0, 0.03, 0.18), SM('#8a5a3a', { roughness: 0.7 }), 0.75, 1.0, -0.7); for (let i = 0; i < 4; i++) { const j = add(scene, new T3.CylinderGeometry(0.045, 0.045, 0.14, 20), SM('#e8f0f4', { roughness: 0.1, transparent: true, opacity: 0.5 }), 0.45 + i * 0.2, 1.085, -0.7); add(scene, new T3.CylinderGeometry(0.04, 0.04, 0.08 + r() * 0.04, 20), SM(['#d8a858', '#f2e8d0', '#8a5a3a', '#e8c878'][i]), 0.45 + i * 0.2, 1.055, -0.7); }
  add(scene, new T3.CylinderGeometry(0.07, 0.055, 0.12, 20), SM('#c86a4a'), -1.5, 0.06, -0.55); for (let i = 0; i < 9; i++) { const l = add(scene, new T3.SphereGeometry(0.05, 12, 8), SM('#4a8a3a', { roughness: 0.6 }), -1.5 + C(i) * 0.05, 0.17 + (i % 3) * 0.04, -0.55 + S(i) * 0.05); l.scale.set(1, 0.3, 0.6); l.rotation.set(i, i * 2, 0); }
  // board
  const wood = ctex(256, 128, (g, w, h) => { g.fillStyle = '#b07a48'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(90,50,25,${0.1 + r() * 0.2})`; g.lineWidth = 0.5 + r() * 2; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 10, w * 0.6, y + (r() - 0.5) * 10, w, y + (r() - 0.5) * 6); g.stroke(); } });
  O.board = add(scene, Bx(0.8, 0.03, 0.5), SM('#ffffff', { map: wood, roughness: 0.55 }), 0, 0.015 + 0.03, 0);
  // stove + pot (right)
  add(scene, Bx(0.7, 0.03, 0.6), SM('#1a1a1e', { roughness: 0.2, metalness: 0.3 }), 1.1, 0.015, -0.1); add(scene, new T3.TorusGeometry(0.12, 0.012, 8, 32), SM('#3a3a3a', { metalness: 0.6, roughness: 0.4 }), 1.1, 0.04, -0.05).rotation.x = PI / 2;
  O.flame = glow(scene, '#4a8aff', 0.35, 1.1, 0.05, -0.05, 0.0);
  const steel = SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 }); O.pot = new T3.Group(); O.pot.position.set(1.1, 0.04, -0.05); scene.add(O.pot);
  add(O.pot, new T3.CylinderGeometry(0.16, 0.15, 0.2, 40, 1, true), Object.assign(steel.clone(), { side: T3.DoubleSide }), 0, 0.1, 0); add(O.pot, new T3.CylinderGeometry(0.15, 0.15, 0.01, 40), steel, 0, 0.005, 0); for (const sx of [-1, 1]) add(O.pot, Bx(0.08, 0.015, 0.03), SM('#1a1a1a'), sx * 0.19, 0.17, 0);
  O.water = add(O.pot, new T3.CircleGeometry(0.155, 40), SM('#bfe0f0', { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.8 }), 0, 0.16, 0, false); O.water.rotation.x = -PI / 2;
  O.bubbles = []; for (let i = 0; i < 40; i++) { const b = add(O.pot, new T3.SphereGeometry(0.008 + r() * 0.01, 8, 6), SM('#ffffff', { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0, 0, false); b.userData = { o: r(), a: r() * PI * 2, d: r() * 0.13 }; O.bubbles.push(b); }
  O.steam = []; for (let i = 0; i < 18; i++) { const s_ = glow(O.pot, '#ffffff', 0.15, 0, 0.2, 0, 0.0); s_.userData.o = r(); O.steam.push(s_); }
  O.potNoodles = noodleNest(O.pot, 24, 0.12, '#f0d48a', 5); O.potNoodles.position.y = 0.12;
  // ingredients
  O.bag = new T3.Group(); scene.add(O.bag); add(O.bag, Bx(0.16, 0.24, 0.09), SM('#f4ecdc', { roughness: 0.9 }), 0, 0.12, 0); const lbl = ctex(128, 128, (g) => { g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#c8402a'; g.fillRect(0, 30, 128, 50); g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText('FLOUR', 64, 64); g.fillStyle = '#8a6a4a'; g.font = '14px sans-serif'; g.fillText('00 TYPE', 64, 104); });
  add(O.bag, new T3.PlaneGeometry(0.16, 0.16), SM('#ffffff', { map: lbl, roughness: 0.9 }), 0, 0.12, 0.0451, false);
  O.eggs = []; for (let i = 0; i < 3; i++) { const e = new T3.Group(); scene.add(e); const sh = add(e, new T3.SphereGeometry(0.028, 24, 16), SM('#f2e2c8', { roughness: 0.55 }), 0, 0, 0); sh.scale.y = 1.3; e.userData.sh = sh; O.eggs.push(e); }
  O.yolks = []; for (let i = 0; i < 3; i++) { const y = add(scene, new T3.SphereGeometry(0.022, 24, 16), SM('#f6a81a', { roughness: 0.15 }), 0, 0, 0); y.scale.y = 0.55; O.yolks.push(y); }
  O.white = add(scene, new T3.CircleGeometry(0.07, 32), SM('#fff8ea', { roughness: 0.1, transparent: true, opacity: 0.55 }), 0, 0, 0, false); O.white.rotation.x = -PI / 2;
  // flour mound (lathe with crater) + dough
  const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; const x = 0.17 * u; const y = u < 0.3 ? 0.06 + u * 0.12 : 0.1 * (1 - (u - 0.3) / 0.7) ** 1.2 + 0.0; pts.push(new T3.Vector2(Math.max(0.0005, x), y)); }
  O.flour = add(scene, new T3.LatheGeometry(pts, 48), SM('#f6f2ea', { roughness: 1 }), 0, BY, 0);
  O.flourFall = []; for (let i = 0; i < 60; i++) { const p = add(scene, new T3.SphereGeometry(0.004, 6, 4), SM('#ffffff', { roughness: 1 }), 0, 0, 0, false); p.userData.o = r(); O.flourFall.push(p); }
  const dg = new T3.SphereGeometry(0.075, 48, 32); const pos = dg.attributes.position; O.doughBase = pos.array.slice(); O.dough = add(scene, dg, SM('#ead08a', { roughness: 0.75 }), 0, BY, 0); O.dough.userData.lump = []; for (let i = 0; i < pos.count; i++) O.dough.userData.lump.push(r());
  O.shaggy = new T3.Group(); scene.add(O.shaggy); for (let i = 0; i < 40; i++) { const c = add(O.shaggy, new T3.DodecahedronGeometry(0.012 + r() * 0.02, 0), SM('#e8cc86', { roughness: 0.9 }), (r() - 0.5) * 0.2, 0.01 + r() * 0.03, (r() - 0.5) * 0.2); c.rotation.set(r() * 3, r() * 3, 0); }
  O.fork = new T3.Group(); scene.add(O.fork); add(O.fork, Bx(0.012, 0.004, 0.16), steel, 0, 0, 0.09); for (let t = 0; t < 4; t++) add(O.fork, Bx(0.003, 0.003, 0.05), steel, -0.0075 + t * 0.005, 0, -0.015);
  O.bowl = add(scene, new T3.SphereGeometry(0.12, 40, 20, 0, PI * 2, 0, PI / 2), SM('#e8f4fa', { roughness: 0.05, transparent: true, opacity: 0.35, side: T3.DoubleSide }), 0, BY, 0);
  // sheet, pin, knife, strips
  O.sheet = add(scene, Bx(0.5, 0.004, 0.3), SM('#f0d898', { roughness: 0.7 }), 0, BY + 0.002, 0);
  O.pin = new T3.Group(); scene.add(O.pin); add(O.pin, new T3.CylinderGeometry(0.025, 0.025, 0.36, 32), SM('#c89060', { roughness: 0.5 }), 0, 0, 0).rotation.z = PI / 2; for (const sx of [-1, 1]) add(O.pin, new T3.CylinderGeometry(0.012, 0.014, 0.1, 16), SM('#a87048'), sx * 0.23, 0, 0).rotation.z = PI / 2;
  O.knife = new T3.Group(); scene.add(O.knife); add(O.knife, Bx(0.004, 0.05, 0.2), SM('#d8dce2', { metalness: 0.9, roughness: 0.15 }), 0, 0.025, 0); add(O.knife, Bx(0.02, 0.025, 0.11), SM('#1a1a1a'), 0, 0.03, 0.15);
  O.strips = new T3.Group(); scene.add(O.strips); for (let i = 0; i < 28; i++) { const s_ = add(O.strips, Bx(0.006, 0.004, 0.3), SM('#f0d898', { roughness: 0.7 }), -0.12 + i * 0.009, BY + 0.003, 0); s_.userData.i = i; }
  // pan + sauce + garnish
  O.pan = new T3.Group(); scene.add(O.pan); add(O.pan, new T3.CylinderGeometry(0.17, 0.15, 0.05, 48, 1, true), SM('#2a2a2e', { metalness: 0.5, roughness: 0.4, side: T3.DoubleSide }), 0, 0.025, 0); add(O.pan, new T3.CylinderGeometry(0.15, 0.15, 0.01, 48), SM('#2a2a2e', { metalness: 0.5, roughness: 0.4 }), 0, 0.005, 0); add(O.pan, Bx(0.24, 0.015, 0.03), SM('#1a1a1a'), 0.28, 0.04, 0);
  O.sauce = add(O.pan, new T3.CircleGeometry(0.145, 40), SM('#b8281a', { roughness: 0.35 }), 0, 0.02, 0, false); O.sauce.rotation.x = -PI / 2; O.panNoodles = noodleNest(O.pan, 30, 0.12, '#f0d48a', 7); O.panNoodles.position.y = 0.012;
  O.tom = []; for (let i = 0; i < 3; i++) { const t_ = new T3.Group(); scene.add(t_); add(t_, new T3.SphereGeometry(0.04, 24, 16), SM('#d8301e', { roughness: 0.25 }), 0, 0.04, 0); for (let l = 0; l < 5; l++) { const lf = add(t_, Bx(0.006, 0.002, 0.022), SM('#3a7a2a'), C(l * 1.26) * 0.01, 0.079, S(l * 1.26) * 0.01); lf.rotation.y = -l * 1.26; } O.tom.push(t_); }
  O.garlic = new T3.Group(); scene.add(O.garlic); for (let i = 0; i < 7; i++) { const c = add(O.garlic, new T3.SphereGeometry(0.018, 16, 12), SM('#f4ecdc', { roughness: 0.6 }), C(i) * 0.012, 0.025, S(i) * 0.012); c.scale.y = 1.4; }
  O.oil = new T3.Group(); scene.add(O.oil); add(O.oil, new T3.CylinderGeometry(0.035, 0.035, 0.2, 24), SM('#5a7a2a', { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0.1, 0); add(O.oil, new T3.CylinderGeometry(0.012, 0.03, 0.06, 20), SM('#5a7a2a', { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0.23, 0); add(O.oil, new T3.CylinderGeometry(0.013, 0.013, 0.03, 16), SM('#1a1a1a'), 0, 0.27, 0);
  O.basil = new T3.Group(); scene.add(O.basil); for (let i = 0; i < 6; i++) { const b = add(O.basil, new T3.SphereGeometry(0.025, 16, 8), SM('#2e8a2e', { roughness: 0.4 }), C(i) * 0.03, 0.01, S(i) * 0.03); b.scale.set(0.6, 0.15, 1.1); b.rotation.y = i; }
  // final plate
  O.plate = new T3.Group(); scene.add(O.plate); add(O.plate, new T3.CylinderGeometry(0.2, 0.14, 0.02, 64), SM('#f8f6f2', { roughness: 0.2 }), 0, 0.01, 0); add(O.plate, new T3.TorusGeometry(0.19, 0.008, 12, 64), SM('#f8f6f2', { roughness: 0.2 }), 0, 0.022, 0).rotation.x = PI / 2;
  const nest = noodleNest(O.plate, 46, 0.13, '#f0c870', 11); nest.position.y = 0.02; const sauceTop = add(O.plate, new T3.SphereGeometry(0.075, 32, 16), SM('#b8281a', { roughness: 0.25 }), 0, 0.068, 0); sauceTop.scale.set(1, 0.18, 0.9); for (let i = 0; i < 7; i++) { const d_ = add(O.plate, new T3.SphereGeometry(0.02 + r() * 0.015, 16, 10), SM('#b8281a', { roughness: 0.25 }), C(i) * 0.06, 0.06, S(i) * 0.055); d_.scale.y = 0.4; } for (let i = 0; i < 6; i++) add(O.plate, new T3.DodecahedronGeometry(0.008, 0), SM('#e04a2a', { roughness: 0.4 }), (r() - 0.5) * 0.08, 0.075, (r() - 0.5) * 0.08);
  for (let i = 0; i < 3; i++) { const b = add(O.plate, new T3.SphereGeometry(0.022, 16, 8), SM('#2e8a2e', { roughness: 0.4 }), -0.01 + i * 0.015, 0.1, 0.01 - i * 0.01); b.scale.set(0.6, 0.15, 1.1); b.rotation.y = i * 1.3; }
  for (let i = 0; i < 30; i++) add(O.plate, new T3.BoxGeometry(0.006, 0.003, 0.004), SM('#fff6d0'), (r() - 0.5) * 0.12, 0.1 + r() * 0.02, (r() - 0.5) * 0.12, false);
  O.plateSteam = []; for (let i = 0; i < 10; i++) { const s_ = glow(O.plate, '#ffffff', 0.12, 0, 0.15, 0, 0); s_.userData.o = r(); O.plateSteam.push(s_); }
  // hands (smooth capsules)
  const skin = SM('#e8b48e', { roughness: 0.55 }); O.hands = []; for (const sx of [-1, 1]) { const h_ = new T3.Group(); scene.add(h_); const palm = add(h_, new T3.CapsuleGeometry(0.035, 0.05, 8, 16), skin, 0, 0, 0); palm.rotation.x = PI / 2; palm.scale.x = 1.5;
    for (let f = 0; f < 4; f++) { const fg = add(h_, new T3.CapsuleGeometry(0.011, 0.045, 6, 10), skin, -0.03 + f * 0.02, -0.005, -0.075); fg.rotation.x = PI / 2 + 0.3; } const th = add(h_, new T3.CapsuleGeometry(0.012, 0.035, 6, 10), skin, sx * -0.055, 0, -0.02); th.rotation.set(PI / 2, 0, sx * 0.8);
    const sl = add(h_, new T3.CylinderGeometry(0.045, 0.05, 0.25, 20), SM('#2a4a6a', { roughness: 0.8 }), 0, 0.02, 0.17); sl.rotation.x = PI / 2 - 0.2; O.hands.push(h_); }
}
function hideAll() { for (const k of ['bag', 'flour', 'dough', 'shaggy', 'fork', 'bowl', 'sheet', 'pin', 'knife', 'strips', 'pan', 'garlic', 'oil', 'basil', 'plate', 'white']) O[k].visible = false; O.eggs.forEach(e => e.visible = false); O.yolks.forEach(y => y.visible = false); O.plate.children.forEach(c_ => c_.visible = true); O.tom.forEach(t_ => t_.visible = false); O.hands.forEach(h_ => h_.visible = false); O.flourFall.forEach(p => p.visible = false); O.potNoodles.visible = false; O.flame.material.opacity = 0; O.steam.forEach(s_ => s_.material.opacity = 0); O.bubbles.forEach(b => b.visible = false); O.plateSteam.forEach(s_ => s_.material.opacity = 0); }
function doughShape(T, lumpy, squash, smooth) { const p = O.dough.geometry.attributes.position; const b = O.doughBase; const L = O.dough.userData.lump;
  for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2]; const n = 1 + lumpy * (L[i] - 0.5) * 0.35 + 0.04 * S(x * 60 + T) * lumpy; p.setXYZ(i, x * n * (1 + squash * 0.5), Math.max(-0.01, y * n * (1 - squash * 0.45)) + 0.06, z * n * (1 + squash * 0.3)); }
  p.needsUpdate = true; O.dough.geometry.computeVertexNormals(); O.dough.material.roughness = lerp(0.85, 0.45, smooth); O.dough.material.color.set(smooth > 0.5 ? '#f0d690' : '#e2c47a'); }
function hands(T, pressK, y = 0.16) { O.hands.forEach((h_, i) => { h_.visible = true; const sx = i ? 1 : -1; const push = Math.max(0, S(T * 5 + i * PI)); h_.position.set(sx * 0.07, BY + y - push * 0.04 * pressK, 0.02 + push * 0.03); h_.rotation.set(-0.5, sx * -0.3, 0); }); }

// ---------- timeline ----------
const E = { like: AT(0, 'like'), so1: AT(1, 'so'), but1: AT(1, 'but'), flour1: AT(1, 'flour'), eggs1: AT(1, 'eggs'), pour: AT(2, 'pour'), crack: AT(2, 'crack'), volcano: AT(2, 'volcano'), mix: AT(2, 'mix'), knead: AT(3, 'knead'), smooth: AT(3, 'smooth'), but3: AT(3, 'but'), rest: AT(3, 'rest'), thirty: AT(3, 'thirty'),
  roll: AT(4, 'roll'), sheet: AT(4, 'sheet'), but4: AT(4, 'but'), fold: AT(4, 'fold'), slice: AT(4, 'slice'), drop: AT(5, 'drop'), three: AT(5, 'three'), but5: AT(5, 'but'), add: AT(5, 'add'), tom: AT(6, 'tomatoes'), garlic: AT(6, 'garlic'), olive: AT(6, 'olive'), basil: AT(6, 'basil'), toss: AT(6, 'toss'), real: AT(6, 'that\'s'), comment: AT(7, 'comment'), yes: AT(7, 'yes'), no: AT(7, 'no') };
function shot(T) { hideAll(); const ci = CLI(T);
  if (ci === 0) { O.plate.visible = true; O.plate.position.set(0, BY, 0); O.plate.rotation.y = T * 0.25; plateSteam(T); camL([0.05, 0.6, 0.62], [0.02, 0.42, 0.45], prog(T, 0, CL[1].start), [0, 0.05, 0], [0, 0.06, 0]); return; }
  if (ci === 1) { O.bag.visible = T > E.flour1 - 0.4; O.bag.position.set(-0.12, BY, -0.05 + (1 - ease(prog(T, E.flour1 - 0.4, E.flour1))) * 0.3); O.bag.rotation.y = 0.3;
    O.eggs.forEach((e, i) => { e.visible = T > E.eggs1 - 0.3; const k = ease(prog(T, E.eggs1 - 0.3 + i * 0.12, E.eggs1 + 0.1 + i * 0.12)); e.position.set(0.1 + i * 0.065, BY + 0.036 + (1 - k) * 0.2, 0.05); e.rotation.z = 0.2 * i; });
    if (T < E.but1) camL([0, 0.6, 0.55], [0, 0.5, 0.48], prog(T, CL[1].start, E.but1), [0, 0.04, 0], [0, 0.04, 0]); else camL([0.05, 0.35, 0.5], [0.02, 0.3, 0.42], prog(T, E.but1, CL[2].start), [0, 0.08, 0], [0, 0.06, 0]); return; }
  if (ci === 2) { const pk = ease(prog(T, E.pour, E.pour + 1.6)); O.flour.visible = T < E.mix + 0.8; O.flour.scale.set(lerp(0.3, 1, pk), Math.max(0.01, pk), lerp(0.3, 1, pk));
    if (T < E.crack) { O.bag.visible = true; O.bag.position.set(0.02, BY + 0.28, 0); O.bag.rotation.set(0, 0, 2.2); O.flourFall.forEach((p, i) => { const a = (T * 2 + p.userData.o) % 1; p.visible = T < E.pour + 1.6; p.position.set((p.userData.o - 0.5) * 0.02, BY + 0.24 - a * 0.22, (S(i) * 0.02)); }); }
    if (T > E.crack - 0.4) { O.eggs.forEach((e, i) => { const k = prog(T, E.crack - 0.3 + i * 0.25, E.crack + 0.05 + i * 0.25); e.visible = k < 1 && i < 2; e.position.set(-0.02 + i * 0.04, BY + 0.2, 0); e.userData.sh.scale.set(1, 1.3 - k * 0.4, 1); });
      O.yolks.forEach((y, i) => { if (i > 1) return; const k = prog(T, E.crack + 0.05 + i * 0.25, E.crack + 0.35 + i * 0.25); y.visible = k > 0 && T < E.mix + 0.6; y.position.set(-0.015 + i * 0.03, BY + lerp(0.19, 0.045, k * k), 0); }); O.white.visible = T > E.crack + 0.2 && T < E.mix + 0.6; O.white.position.set(0, BY + 0.04, 0); }
    if (T > E.volcano - 0.1 && T < E.mix) { const k = prog(T, E.volcano, E.volcano + 0.6); O.white.scale.setScalar(1 + k * 0.8); O.yolks[0].position.x = -0.015 - k * 0.11; O.yolks[0].position.y = BY + 0.045 - k * 0.03; }
    if (T > E.mix - 0.2) { const k = prog(T, E.mix, CL[3].start); O.fork.visible = true; const a = T * 9; O.fork.position.set(C(a) * 0.03, BY + 0.06, S(a) * 0.03); O.fork.rotation.set(-0.9, a, 0); O.shaggy.visible = k > 0.4; O.shaggy.position.set(0, BY, 0); O.shaggy.scale.setScalar(lerp(0.6, 1, k)); O.flour.material.color.set(k > 0.2 ? '#f0dca8' : '#f6f2ea'); }
    if (T < E.crack - 0.2) camL([0.32, 0.5, 0.55], [0.28, 0.45, 0.5], prog(T, CL[2].start, E.crack), [0, 0.12, 0], [0, 0.1, 0]); else if (T < E.mix - 0.2) camL([0.3, 0.36, 0.5], [0.24, 0.3, 0.42], prog(T, E.crack, E.mix), [0, 0.12, 0], [0, 0.06, 0]); else camL([0, 0.4, 0.22], [0.02, 0.36, 0.18], prog(T, E.mix, CL[3].start), [0, 0.04, 0], [0, 0.04, 0]); return; }
  if (ci === 3) { O.dough.visible = true; O.dough.position.set(0, BY - 0.06, 0); const sm = prog(T, E.knead, E.but3);
    if (T < E.rest - 0.2) { doughShape(T, 1 - sm * 0.85, Math.max(0, S(T * 5)) * 0.6, sm); hands(T, 1); camL([0.34, 0.42, 0.55], [0.28, 0.38, 0.5], prog(T, CL[3].start, E.rest), [0, 0.1, 0], [0, 0.09, 0]); }
    else { doughShape(T, 0.12, 0, 1); O.bowl.visible = true; const bk = ease(prog(T, E.rest - 0.2, E.rest + 0.4)); O.bowl.position.set(0, BY + 0.14 * (1 - bk), 0); camL([0.3, 0.26, 0.42], [0.26, 0.22, 0.36], prog(T, E.rest, CL[4].start), [0, 0.06, 0], [0, 0.06, 0]); } return; }
  if (ci === 4) { const rk = ease(prog(T, E.roll - 0.1, E.but4 - 0.2));
    if (T < E.but4 - 0.2) { O.dough.visible = rk < 0.5; O.dough.position.set(0, BY - 0.06, 0); doughShape(T, 0.1, Math.min(1.6, rk * 3), 1); O.sheet.visible = rk >= 0.5; O.sheet.scale.set(lerp(0.4, 1, (rk - 0.5) * 2), 1, lerp(0.5, 1, (rk - 0.5) * 2)); O.pin.visible = true; O.pin.position.set(0, BY + 0.03, S(T * 4) * 0.08); O.hands.forEach((h_, i) => { h_.visible = true; h_.position.set((i ? 1 : -1) * 0.2, BY + 0.06, O.pin.position.z + 0.01); h_.rotation.set(-1.2, 0, 0); });
      camL([0, 0.5, 0.35], [0, 0.45, 0.3], prog(T, E.roll, E.but4), [0, 0.04, 0], [0, 0.04, 0]); }
    else if (T < E.fold - 0.2) { O.sheet.visible = true; O.sheet.scale.set(1, 1, 1); camL([0.1, 0.25, 0.4], [0.05, 0.22, 0.34], prog(T, E.but4, E.fold), [0, 0.04, 0], [0, 0.04, 0]); }
    else if (T < E.slice - 0.1) { O.sheet.visible = true; const fk = ease(prog(T, E.fold - 0.2, E.fold + 0.6)); O.sheet.scale.set(lerp(1, 0.5, fk), lerp(1, 4, fk), 1); O.sheet.position.y = BY + 0.002 + fk * 0.006; camL([0.15, 0.3, 0.35], [0.1, 0.28, 0.3], prog(T, E.fold, E.slice), [0, 0.04, 0], [0, 0.04, 0]); }
    else { O.strips.visible = true; const sk = prog(T, E.slice, CL[5].start); O.strips.children.forEach((s_, i) => { const cut = sk * 28 > i; s_.position.x = -0.12 + i * 0.009 + (cut ? 0.01 * Math.min(1, sk * 28 - i) : 0); s_.position.y = BY + 0.003; s_.rotation.y = cut ? S(i * 3) * 0.08 * Math.min(1, (sk * 28 - i) / 4) : 0; });
      O.knife.visible = true; O.knife.position.set(-0.12 + Math.min(27, sk * 28) * 0.009, BY + 0.005 + Math.abs(S(T * 22)) * 0.03, 0); camL([0.2, 0.28, 0.28], [0.12, 0.24, 0.24], sk, [0, 0.04, 0], [0, 0.04, 0]); } O.sheet.position.set(0, O.sheet.position.y || BY + 0.002, 0); return; }
  if (ci === 5) { O.flame.material.opacity = 0.8; potBoil(T, 1);
    if (T < E.but5 - 0.2) { O.strips.visible = T < E.drop + 0.8; const dk = prog(T, E.drop, E.drop + 0.8); O.strips.position.set(1.1 * ease(dk), 0.25 * S(dk * PI), -0.05 * dk); O.strips.children.forEach(s_ => { s_.position.y = BY; s_.rotation.y = 0; }); O.potNoodles.visible = T > E.drop + 0.6; O.potNoodles.rotation.y = T * 0.8;
      camL([1.1, 0.55, 0.35], [1.1, 0.5, 0.28], prog(T, CL[5].start, E.but5), [1.0, 0.1, -0.05], [1.1, 0.12, -0.05]); }
    else if (T < E.add - 0.2) { O.plate.visible = true; O.plate.position.set(0, BY, 0); O.plate.children.forEach((c_, i) => { if (i > 2) c_.visible = false; }); camL([0, 0.35, 0.32], [0, 0.32, 0.28], prog(T, E.but5, E.add), [0, 0.05, 0], [0, 0.05, 0]); }
    else { O.pan.visible = true; O.pan.position.set(0, BY, 0); O.panNoodles.visible = false; const k = prog(T, E.add - 0.2, CL[6].start); O.sauce.scale.setScalar(lerp(0.2, 1, ease(k))); camL([0.1, 0.4, 0.3], [0.05, 0.36, 0.26], k, [0, 0.03, 0], [0, 0.03, 0]); } return; }
  if (ci === 6) { O.pan.visible = true; O.pan.position.set(0, BY, 0); O.panNoodles.visible = T > E.toss - 0.2; O.panNoodles.rotation.y = T * 2; O.sauce.scale.setScalar(1);
    const pop = (o, t0, x, z) => { o.visible = T > t0 - 0.3 && T < E.toss + 0.4; const k = ease(prog(T, t0 - 0.3, t0)); o.position.set(x, BY + (1 - k) * 0.15, z); o.scale.setScalar(Math.max(0.01, k)); };
    O.tom.forEach((t_, i) => pop(t_, E.tom + i * 0.12, -0.14 + i * 0.07, 0.24)); pop(O.garlic, E.garlic, 0.1, 0.25); pop(O.oil, E.olive, 0.17, 0.12); pop(O.basil, E.basil, -0.16, 0.12);
    if (T < E.toss) camL([0, 0.62, 0.85], [0, 0.55, 0.78], prog(T, CL[6].start, E.toss), [0, 0.04, 0.1], [0, 0.04, 0.12]);
    else if (T < E.real - 0.1) { O.panNoodles.position.y = 0.012 + Math.abs(S((T - E.toss) * 6)) * 0.05; camL([0.15, 0.3, 0.3], [0.1, 0.28, 0.26], prog(T, E.toss, E.real), [0, 0.04, 0], [0, 0.05, 0]); }
    else { O.pan.visible = false; O.panNoodles.visible = false; O.plate.visible = true; O.plate.position.set(0, BY, 0); O.plate.children.forEach(c_ => c_.visible = true); O.plate.rotation.y = T * 0.3; plateSteam(T); camL([0.3, 0.3, 0.3], [0.2, 0.25, 0.24], prog(T, E.real, CL[7].start), [0, 0.06, 0], [0, 0.06, 0]); } return; }
  O.plate.visible = true; O.plate.position.set(0, BY, 0); O.plate.children.forEach(c_ => c_.visible = true); O.plate.rotation.y = T * 0.3; plateSteam(T); camL([0, 0.5, 0.32], [0, 0.55, 0.3], prog(T, CL[7].start, TM.total), [0, 0.05, 0], [0, 0.05, 0]); }
function plateSteam(T) { O.plateSteam.forEach((s_, i) => { const a = (T * 0.35 + s_.userData.o) % 1; s_.position.set(S(i * 2.3) * 0.05 + S(T + i) * 0.01, 0.1 + a * 0.2, C(i * 1.7) * 0.05); s_.material.opacity = 0.25 * S(a * PI); s_.scale.setScalar(0.08 + a * 0.12); }); }
function potBoil(T, k) { O.bubbles.forEach((b, i) => { const u = b.userData; const a = (T * 1.6 + u.o) % 1; b.visible = true; b.position.set(C(u.a) * u.d, 0.16 + a * 0.012, S(u.a) * u.d); b.scale.setScalar(S(a * PI) * 1.2 * k); });
  O.steam.forEach((s_, i) => { const a = (T * 0.4 + s_.userData.o) % 1; s_.position.set(S(i * 2.1) * 0.08, 0.2 + a * 0.35, C(i * 1.3) * 0.06); s_.material.opacity = 0.3 * S(a * PI) * k; s_.scale.setScalar(0.12 + a * 0.2); }); }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }

// ---------- HUD ----------
function txt(s, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s, x, y); }
function big(s, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(20,10,6,0.9)'; octx.strokeText(s, x, y); octx.fillStyle = col; octx.fillText(s, x, y); octx.restore(); }
// "If you / But / So" chain per step: [label, text, time]
const LBL = { 'IF YOU': '#5ad88a', 'BUT': '#ff6a5a', 'SO': '#ffd25a', 'UH OH': '#ff9a3a' };
const CHAIN = { 1: [['IF YOU', 'WANT PASTA . NEED DOUGH', AT(1, 'if')], ['BUT', 'NO DOUGH', E.but1], ['SO', 'FLOUR + EGGS', E.so1]],
  2: [['IF YOU', 'FLOUR MOUNTAIN + EGGS', AT(2, 'if')], ['UH OH', 'EGG VOLCANO', E.volcano - 0.2], ['SO', 'MIX SLOWLY . FORK', E.mix - 0.3]],
  3: [['IF YOU', 'KNEAD 10 MIN . SMOOTH', AT(3, 'if')], ['BUT', 'TOO TOUGH TO ROLL', E.but3], ['SO', 'REST 30 MIN', AT(3, 'so')]],
  4: [['IF YOU', 'ROLL THIN . SHEET', AT(4, 'if')], ['BUT', 'SHEET ≠ SPAGHETTI', E.but4], ['SO', 'FOLD + SLICE', AT(4, 'so')]],
  5: [['IF YOU', 'BOIL IT . 3 MIN', AT(5, 'if')], ['BUT', 'PLAIN = BORING', E.but5], ['SO', 'ADD SAUCE', AT(5, 'so')]] };
function chainCard(ci, T) { const ch = CHAIN[ci]; if (!ch) return; const a = prog(T, CL[ci].start, CL[ci].start + 0.25); octx.save(); octx.globalAlpha = a;
  octx.fillStyle = 'rgba(20,14,10,0.78)'; octx.beginPath(); octx.roundRect(30, 40, 540, 230, 26); octx.fill(); octx.strokeStyle = 'rgba(255,230,190,0.35)'; octx.lineWidth = 2; octx.stroke();
  ch.forEach(([lb, s, t0], i) => { const on = T > t0 - 0.1, k = prog(T, t0 - 0.1, t0 + 0.15); const y = 92 + i * 66; octx.globalAlpha = a * (on ? 1 : 0.3); octx.fillStyle = LBL[lb]; octx.beginPath(); octx.roundRect(52, y - 24, 130, 48, 24); octx.fill(); txt(lb, 117, y + 1, 22, '#1a1008');
    octx.save(); octx.translate((1 - k) * 30 * (on ? 1 : 0), 0); txt(s, 200, y + 1, 27, on ? '#fff' : '#bba', 'left'); octx.restore(); }); octx.restore(); }
function stepChip(ci, T) { if (ci < 1 || ci > 6) return; octx.save(); octx.fillStyle = 'rgba(20,14,10,0.78)'; octx.beginPath(); octx.roundRect(586, 40, 104, 104, 22); octx.fill(); txt(`${ci}/6`, 638, 84, 38, '#ffd25a'); txt('STEP', 638, 120, 18, '#e8d8c0'); octx.restore(); }
function clockDial(x, y, R, k, label, a) { if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(20,14,10,0.82)'; octx.beginPath(); octx.arc(x, y, R + 16, 0, 7); octx.fill(); octx.strokeStyle = 'rgba(255,255,255,0.15)'; octx.lineWidth = 14; octx.beginPath(); octx.arc(x, y, R, 0, 7); octx.stroke();
  octx.strokeStyle = '#ffd25a'; octx.lineCap = 'round'; octx.beginPath(); octx.arc(x, y, R, -PI / 2, -PI / 2 + PI * 2 * Math.max(0.001, k)); octx.stroke(); txt(label, x, y + 2, R * 0.55, '#fff'); octx.restore(); }
function likePill(T) { const l0 = E.like, l1 = CL[1].start; if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30);
  octx.fillStyle = 'rgba(20,14,10,0.85)'; octx.beginPath(); octx.roundRect(170, 960, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd25a'; octx.lineWidth = 3; octx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); octx.save(); octx.translate(216, 995); octx.scale(hb, hb); octx.fillStyle = '#ff5a6a'; octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore();
  txt('LIKE', 270, 996, 24, '#fff'); const fo = T > AT(0, 'follow'); octx.fillStyle = fo ? '#5ad88a' : '#ffd25a'; octx.beginPath(); octx.roundRect(340, 973, 190, 44, 22); octx.fill(); txt(fo && T > AT(0, 'follow') + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 996, 20, '#1a1008'); octx.restore(); }
const CAPS = []; CL.forEach((c0) => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^(This|With|Like|If|But|So|And|Tomatoes|Toss|Would|Comment|Garlic)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/\bten minutes\b/i, '10 minutes').replace(/\bthirty minutes\b/i, '30 minutes').replace(/\bthree minutes\b/i, '3 minutes'); });
function caption(s) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = s.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1100 - (lines.length - 1) * 31; lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(20,10,6,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = '#fff'; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }

window.initFootball = async function () {
  await Promise.all(['30px Russo', '30px Anton'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#2a2420'); camera = new T3.PerspectiveCamera(40, RW / RH, 0.01, 20); build();
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high'; octx.globalCompositeOperation = 'source-over'; octx.drawImage(glc, 0, 0, W, H);
  sctx.drawImage(glc, 0, 0, 90, 160); octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.22; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const vg = octx.createRadialGradient(360, 640, 380, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,0,0.5)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // hook
  if (ci === 0) { big('REAL PASTA', 180, 92, '#ffd25a', prog(T, 0.2, 0.5)); big('FROM SCRATCH', 270, 56, '#fff', prog(T, AT(0, 'scratch') - 0.1, AT(0, 'scratch') + 0.2)); big('ONLY 2 INGREDIENTS', 360, 44, '#5ad88a', prog(T, AT(0, 'two') - 0.1, AT(0, 'two') + 0.2)); }
  chainCard(ci, T); stepChip(ci, T); likePill(T);
  if (ci === 1 && T > E.flour1 - 0.2) { octx.save(); octx.globalAlpha = prog(T, E.flour1 - 0.2, E.flour1 + 0.1); octx.fillStyle = 'rgba(20,14,10,0.8)'; octx.beginPath(); octx.roundRect(160, 330, 400, 130, 22); octx.fill(); txt('FLOUR . 200 G', 360, 370, 32, '#fff'); if (T > E.eggs1 - 0.1) txt('EGGS . 2', 360, 420, 32, '#ffd25a'); octx.restore(); }
  if (ci === 2 && T > E.volcano - 0.1 && T < E.mix - 0.2) big('VOLCANO!', 420, 96, '#ff9a3a', prog(T, E.volcano - 0.1, E.volcano + 0.1));
  if (ci === 3) { if (T < E.but3) clockDial(360, 420, 90, prog(T, E.knead, E.but3), '10 MIN', prog(T, E.knead, E.knead + 0.3)); if (T > E.rest - 0.2) clockDial(360, 420, 90, prog(T, E.rest, CL[4].start - 0.2), '30 MIN', prog(T, E.rest - 0.2, E.rest + 0.1)); }
  if (ci === 4 && T > E.but4 - 0.1 && T < E.fold - 0.2) big('SHEET ≠ SPAGHETTI', 420, 56, '#ff6a5a', prog(T, E.but4, E.but4 + 0.2));
  if (ci === 5) { if (T > E.three - 0.3 && T < E.but5 - 0.2) clockDial(360, 420, 90, prog(T, E.three, E.but5 - 0.3), '3 MIN', prog(T, E.three - 0.3, E.three)); if (T > E.but5 - 0.1 && T < E.add - 0.2) big('BORING.', 420, 92, '#ff6a5a', prog(T, AT(5, 'boring') - 0.1, AT(5, 'boring') + 0.1)); }
  if (ci === 6 && T < E.toss) { const items = [['TOMATOES', E.tom], ['GARLIC', E.garlic], ['OLIVE OIL', E.olive], ['FRESH BASIL', E.basil]]; octx.save(); octx.fillStyle = 'rgba(20,14,10,0.8)'; octx.beginPath(); octx.roundRect(170, 60, 380, 260, 24); octx.fill(); octx.restore(); txt('THE SAUCE', 360, 100, 30, '#ffd25a');
    items.forEach(([s, t0], i) => { if (T > t0 - 0.1) { txt('✓', 230, 150 + i * 44, 30, '#5ad88a'); txt(s, 260, 150 + i * 44, 30, '#fff', 'left'); } }); }
  if (ci === 6 && T > E.real - 0.1) { big('DONE.', 260, 110, '#ffd25a', prog(T, E.real - 0.1, E.real + 0.2)); big('MADE FROM SCRATCH', 350, 46, '#fff', prog(T, E.real + 0.3, E.real + 0.6)); }
  if (ci === 7) { big('WOULD YOU TRY IT?', 220, 64, '#ffd25a', prog(T, CL[7].start, CL[7].start + 0.3)); if (T > E.comment - 0.1) { const a = prog(T, E.comment - 0.1, E.comment + 0.2); octx.save(); octx.globalAlpha = a; for (const [s, x, col] of [['YES', 240, '#5ad88a'], ['NO', 480, '#ff6a5a']]) { const pop = s === 'YES' ? prog(T, E.yes, E.yes + 0.2) : prog(T, E.no, E.no + 0.2); octx.fillStyle = col; octx.beginPath(); octx.roundRect(x - 100, 320 - 8 * pop, 200, 90, 45); octx.fill(); txt(s, x, 366 - 8 * pop, 44, '#1a1008'); } octx.restore(); big('COMMENT', 470, 50, '#fff', a); }
    const fw = AT(7, 'follow'); if (T > fw - 0.15) { const k = ease(prog(T, fw - 0.15, fw + 0.15)); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30); const on = T > fw + 0.5; octx.fillStyle = on ? '#5ad88a' : '#ffd25a'; octx.beginPath(); octx.roundRect(200, 560, 320, 84, 42); octx.fill(); txt(on ? 'FOLLOWING ✓' : '+ FOLLOW', 360, 603, 38, '#1a1008'); txt('FOR MORE RECIPES', 360, 680, 30, '#fff'); octx.restore(); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) caption(cap.txt);
  for (let i = 1; i < CL.length; i++) { const ts = CL[i].start; if (T >= ts && T < ts + 0.15) { octx.fillStyle = `rgba(255,245,230,${0.5 * (1 - (T - ts) / 0.15)})`; octx.fillRect(0, 0, W, H); } }
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); } };
})();
