// Pick an island: heart / dollar / hourglass / question mark islands, realistic 3D.
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
const IX = [0, 300, 600, 900], SZ = 60, MR = 256; const MK = [];
const PP = (i, x, y, z) => [IX[i] + x, y, z];
function drawShape(i, c) { c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineJoin = 'round';
  if (i === 0) { c.beginPath(); c.moveTo(128, 228); c.bezierCurveTo(18, 150, 6, 58, 75, 46); c.bezierCurveTo(106, 41, 124, 64, 128, 82); c.bezierCurveTo(132, 64, 150, 41, 181, 46); c.bezierCurveTo(250, 58, 238, 150, 128, 228); c.fill(); }
  if (i === 1) { c.font = '250px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeText('$', 128, 134); c.fillText('$', 128, 134); }
  if (i === 2) { [[128, 125, 78, 92, 0.2], [92, 150, 40, 45, 0], [170, 95, 38, 34, 0], [140, 200, 36, 30, 0]].forEach(([x, y, a, b, r]) => { c.beginPath(); c.ellipse(x, y, a, b, r, 0, 7); c.fill(); }); }
  if (i === 3) { [[120, 115, 82, 70, -0.3], [165, 150, 45, 50, 0], [90, 160, 42, 36, 0], [150, 205, 28, 26, 0]].forEach(([x, y, a, b, r]) => { c.beginPath(); c.ellipse(x, y, a, b, r, 0, 7); c.fill(); }); } }
function buildMask(i) { const a = document.createElement('canvas'); a.width = a.height = MR; const c = a.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, MR, MR); drawShape(i, c);
  const b = document.createElement('canvas'); b.width = b.height = MR; const d = b.getContext('2d'); d.fillStyle = '#000'; d.fillRect(0, 0, MR, MR); d.filter = 'blur(7px)'; d.drawImage(a, 0, 0); const px = d.getImageData(0, 0, MR, MR).data; const m = new Float32Array(MR * MR); for (let k = 0; k < MR * MR; k++) m[k] = px[k * 4] / 255; MK[i] = m; }
function M(i, x, z) { const u = clamp((x / SZ + 0.5) * MR, 0, MR - 1.001), v = clamp((z / SZ + 0.5) * MR, 0, MR - 1.001); const u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0, m = MK[i];
  return lerp(lerp(m[v0 * MR + u0], m[v0 * MR + u0 + 1], fu), lerp(m[(v0 + 1) * MR + u0], m[(v0 + 1) * MR + u0 + 1], fu), fv); }
const nse = (x, z) => S(x * 0.31 + S(z * 0.17) * 2) * C(z * 0.27 + S(x * 0.13) * 2);
function HT(i, x, z) { const v = M(i, x, z); if (v < 0.5) return lerp(-2.6, 0.35, ease(v / 0.5)); return 0.35 + (v - 0.5) * 2 * 2.2 + nse(x, z) * 0.35 * (v - 0.5) * 2; }
function landSpots(i, n, seed, thr = 0.8, gap = 4.5) { const r = rng(seed), o = []; let tries = 0; while (o.length < n && tries++ < 5000) { const x = (r() - 0.5) * SZ, z = (r() - 0.5) * SZ; if (M(i, x, z) > thr && o.every(p => Math.hypot(p[0] - x, p[1] - z) > gap)) o.push([x, z]); } return o; }
function centroid(i, z0, z1) { let sx = 0, sz = 0, n = 0; for (let z = z0; z < z1; z += 0.5) for (let x = -30; x < 30; x += 0.5) if (M(i, x, z) > 0.75) { sx += x; sz += z; n++; } return [sx / n, sz / n]; }
// shared assets
let GEO, MAT;
function initShared() { GEO = { trunk: new T3.CylinderGeometry(0.16, 0.24, 1.3, 8), leaf: new T3.SphereGeometry(1, 12, 6), nut: new T3.SphereGeometry(0.22, 12, 10) };
  { const hs = new T3.Shape(); hs.moveTo(0, -1.2); hs.bezierCurveTo(-2.2, 0.2, -1.2, 1.9, 0, 0.8); hs.bezierCurveTo(1.2, 1.9, 2.2, 0.2, 0, -1.2); GEO.heart = new T3.ExtrudeGeometry(hs, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.2, bevelSegments: 3 }); GEO.heart.translate(0, 0, -0.35); }
  MAT = { hleaf: SM('#4aa84a', { roughness: 0.75 }), blossom: SM('#ff7aaa', { roughness: 0.6 }), round: SM('#2f7a3a', { roughness: 0.85 }), spiral: SM('#6a3a7a', { roughness: 0.6 }), orbA: SM('#c87aff', { emissive: '#8a3ae8', emissiveIntensity: 0.9 }), orbB: SM('#5ae8e0', { emissive: '#2aa8a8', emissiveIntensity: 0.9 }), trunk: SM('#8a6a44', { roughness: 0.9 }), leaf: SM('#3f9a3a', { roughness: 0.7, side: T3.DoubleSide }), nut: SM('#5a3a1e', { roughness: 0.7 }), cashnut: SM('#5ac85a', { roughness: 0.5, emissive: '#2a6a2a', emissiveIntensity: 0.3 }), bill: new T3.MeshStandardMaterial({ map: ctex(128, 64, (c) => { c.fillStyle = '#7ac87a'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#2a6a2a'; c.lineWidth = 5; c.strokeRect(5, 5, 118, 54); c.fillStyle = '#1a4a1a'; c.font = '40px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 64, 34); }), side: T3.DoubleSide, roughness: 0.6 }) }; }
function palm(p, x, y, z, s = 1, cash = false, seed = 1) { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = seed * 2.3; p.add(g); let px = 0, py = 0; const lean = 0.08 + (seed % 3) * 0.04;
  for (let k = 0; k < 6; k++) { const m = add(g, GEO.trunk, MAT.trunk, px, py + 0.6, 0); m.rotation.z = -lean * k * 0.6; px += S(lean * k * 0.6) * 1.25; py += C(lean * k * 0.6) * 1.25; }
  const top = new T3.Group(); top.position.set(px, py + 0.3, 0); g.add(top); for (let k = 0; k < 8; k++) { const l = add(top, GEO.leaf, MAT.leaf, 0, 0, 0); l.scale.set(2.4, 0.06, 0.45); l.geometry = GEO.leaf; const a = k / 8 * PI * 2; l.position.set(C(a) * 1.9, -0.5, S(a) * 1.9); l.rotation.set(0, -a, -0.45); }
  const nuts = []; for (let k = 0; k < 4; k++) { const a = k / 4 * PI * 2 + 0.4; nuts.push(add(top, GEO.nut, cash ? MAT.cashnut : MAT.nut, C(a) * 0.3, -0.35, S(a) * 0.3)); } g.userData = { top, nuts }; return g; }
function heartTree(p, x, y, z, s, seed) { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = S(seed) * 0.3; p.add(g); add(g, new T3.CylinderGeometry(0.18, 0.28, 3.2, 8), MAT.trunk, 0, 1.6, 0); add(g, GEO.heart, MAT.hleaf, 0, 4.2, 0);
  for (let k = 0; k < 6; k++) add(g, GEO.nut, MAT.blossom, S(k * 2.1) * 1.0, 4.1 + C(k * 1.3) * 0.9, 0.42 * (k % 2 ? 1 : -1), false); return g; }
function roundTree(p, x, y, z, s, seed) { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); add(g, new T3.CylinderGeometry(0.16, 0.24, 2.6, 8), MAT.trunk, 0, 1.3, 0); add(g, new T3.SphereGeometry(1.5, 18, 14), MAT.round, 0, 3.6, 0); return g; }
function spiralTree(p, x, y, z, s, seed) { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = seed; p.add(g); const pts = []; for (let k = 0; k <= 30; k++) { const q = k / 30; pts.push(new T3.Vector3(S(q * PI * 4) * 0.7 * (1 - q * 0.4), q * 5.5, C(q * PI * 4) * 0.7 * (1 - q * 0.4))); }
  add(g, new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 60, 0.2, 8), MAT.spiral, 0, 0, 0); for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2; add(g, new T3.SphereGeometry(0.42, 14, 10), k % 2 ? MAT.orbA : MAT.orbB, C(a) * 0.9, 5.6 + S(k * 1.7) * 0.4, S(a) * 0.9, false); } return g; }
function label(txt, w, h, bg, fg, size, font = 'Russo') { return ctex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = `${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 2); }); }
function heartTex(col) { return ctex(64, 64, (c) => { c.fillStyle = col; c.beginPath(); c.moveTo(32, 56); c.bezierCurveTo(-6, 30, 8, 2, 32, 18); c.bezierCurveTo(56, 2, 70, 30, 32, 56); c.fill(); }); }
function noteTex() { return ctex(64, 64, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(22, 48, 11, 8, -0.4, 0, 7); c.fill(); c.fillRect(30, 8, 5, 40); c.beginPath(); c.moveTo(35, 8); c.quadraticCurveTo(52, 16, 48, 32); c.quadraticCurveTo(46, 20, 35, 20); c.fill(); }); }
function sprite(p, tex, s, x, y, z) { const m = new T3.Sprite(new T3.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); m.scale.set(s, s, 1); m.position.set(x, y, z); p.add(m); return m; }
function buildIsland(i) { buildMask(i); const g = G['i' + i] = new T3.Group(); g.position.x = IX[i]; scene.add(g);
  const geo = new T3.PlaneGeometry(90, 90, 220, 220); geo.rotateX(-PI / 2); const pos = geo.attributes.position, col = new Float32Array(pos.count * 3); const cS = new T3.Color('#efdca4'), cW = new T3.Color('#c8b07a'), cG = new T3.Color('#5aaa45'), cG2 = new T3.Color('#2f7a30'), cc = new T3.Color();
  for (let k = 0; k < pos.count; k++) { const x = pos.getX(k), z = pos.getZ(k); const h = HT(i, x, z); pos.setY(k, h); if (h < 0.05) cc.copy(cW).lerp(new T3.Color('#4a8a8a'), clamp(-h / 2.6)); else if (h < 0.75) cc.copy(cS); else cc.copy(cG).lerp(cG2, clamp((h - 0.75) / 2.2 + nse(x * 2, z * 2) * 0.25)); col[k * 3] = cc.r; col[k * 3 + 1] = cc.g; col[k * 3 + 2] = cc.b; }
  geo.setAttribute('color', new T3.BufferAttribute(col, 3)); geo.computeVertexNormals(); const land = add(g, geo, new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }), 0, 0, 0); land.castShadow = false;
  const spots = landSpots(i, 26, 11 + i * 7, 0.78, 4.2); g.userData.spots = spots; g.userData.palms = [];
  spots.slice(3).forEach(([x, z], k) => { if (k % 4 === 3) { const fl = add(g, new T3.SphereGeometry(0.6, 10, 8), SM(i === 0 ? '#ff6a9a' : '#f4d24a', { roughness: 0.8 }), x, HT(i, x, z) + 0.3, z); fl.scale.y = 0.5; } else { const y = HT(i, x, z) - 0.1, s_ = 0.8 + (k % 3) * 0.15; g.userData.palms.push(i === 0 ? heartTree(g, x, y, z, s_, k) : i === 1 ? palm(g, x, y, z, s_, true, k) : i === 2 ? roundTree(g, x, y, z, s_, k) : spiralTree(g, x, y, z, s_, k)); } });
  const sl = new T3.DirectionalLight('#fff4e0', 3.2); sl.position.set(30, 60, 25); sl.target.position.set(0, 0, 0); sl.castShadow = true; sl.shadow.mapSize.set(2048, 2048); const sc = sl.shadow.camera; sc.left = sc.bottom = -40; sc.right = sc.top = 40; sc.near = 1; sc.far = 150; sl.shadow.bias = -0.0005; g.add(sl); g.add(sl.target); g.add(new T3.HemisphereLight('#bfe4ff', '#c8b890', 0.7)); }
const DRESS = ['#e85a7a', '#5aa8e8', '#f4c24a', '#8a5ae8', '#4ac88a', '#e8884a', '#ffffff', '#3a3a4a'];
function person(p, x, z, i, k, o = {}) { const h = human(Object.assign({ top: DRESS[k % 8], bot: ['#2a3a5a', '#3a2a1a', '#e8e0d0', '#1a1a1a'][k % 4], hair: ['#2a1a10', '#d8b060', '#6a3a1a', '#111'][k % 4], skin: ['#e8b898', '#b07a50', '#f0c8a8', '#8a5a3a'][k % 4] }, o)); h.position.set(x, HT(i, x, z), z); p.add(h); return h; }
function buildA() { const g = G.i0, i = 0; R.you = person(g, 0, 2, i, 6, { top: '#ffffff', bot: '#4a7ab8', hair: '#3a2414' }); R.adm = []; R.hearts = [];
  for (let k = 0; k < 9; k++) { const a = k / 9 * PI * 2; const x = S(a) * 4.2, z = 2 + C(a) * 4.2; const h = person(g, x, z, i, k); h.rotation.y = Math.atan2(-x, 2 - z); R.adm.push(h); R.hearts.push(sprite(g, heartTex('#ff4a7a'), 0.6, x, h.position.y + 2.2, z)); }
  R.guitar = new T3.Group(); R.adm[0].userData.body.add(R.guitar); R.guitar.position.set(0, 1.15, 0.22); add(R.guitar, new T3.SphereGeometry(0.22, 14, 10), SM('#a8642a'), 0, -0.05, 0).scale.z = 0.4; add(R.guitar, Bx(0.06, 0.6, 0.04), SM('#5a3a1a'), 0.15, 0.25, 0).rotation.z = -0.9; R.guitar.rotation.z = 0.9; R.adm[0].userData.armR.rotation.x = -0.9;
  R.notes = []; const nt = noteTex(); for (let k = 0; k < 6; k++) R.notes.push(sprite(g, nt, 0.5, 0, 0, 0));
  // bathroom hut on right lobe + queue
  const [hx, hz] = [13, -9]; R.hut = [hx, hz]; const hy = HT(i, hx, hz); add(g, Bx(2.2, 2.6, 2.2), SM('#c8a070', { roughness: 0.8 }), hx, hy + 1.3, hz); const rf = add(g, new T3.ConeGeometry(1.9, 1.2, 4), SM('#8a5a3a'), hx, hy + 3.2, hz); rf.rotation.y = PI / 4; add(g, Bx(0.9, 1.9, 0.06), SM('#6a4024'), hx - 0.3, hy + 0.95, hz + 1.12); add(g, new T3.PlaneGeometry(0.8, 0.4), new T3.MeshBasicMaterial({ map: label('WC', 128, 64, '#2a5a9a', '#fff', 40) }), hx - 0.3, hy + 2.25, hz + 1.13, false);
  R.queue = []; for (let k = 0; k < 7; k++) { const x = hx - 0.6 - k * 1.1, z = hz + 2.2 + k * 0.75; const h = person(g, x, z, i, k + 2); h.rotation.y = PI * 0.8; R.queue.push(h); }
  // boat named after you
  R.boat = new T3.Group(); R.boat.position.set(5, 0, 33); g.add(R.boat); const hull = add(R.boat, RB(1.8, 1.0, 5.2, 0.4), SM('#ffffff', { roughness: 0.4 }), 0, 0.3, 0); add(R.boat, Bx(1.7, 0.1, 4.6), SM('#b88a5a'), 0, 0.82, 0); add(R.boat, new T3.CylinderGeometry(0.06, 0.06, 4.5, 8), SM('#ddd'), 0, 3, -0.3); const sail = add(R.boat, new T3.PlaneGeometry(1.8, 3.4), SM('#ffe8f0', { side: T3.DoubleSide }), 0, 3, 0.7, false); sail.rotation.y = PI / 2;
  const nm = add(R.boat, new T3.PlaneGeometry(1.8, 0.5), new T3.MeshBasicMaterial({ map: ctex(256, 72, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 256, 72); c.fillStyle = '#e83a6a'; c.font = '44px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('THE  YOU', 128, 38); const hh = (x) => { c.beginPath(); c.moveTo(x, 54); c.bezierCurveTo(x - 22, 36, x - 12, 16, x, 28); c.bezierCurveTo(x + 12, 16, x + 22, 36, x, 54); c.fill(); }; hh(128); }) }), 0.92, 0.45, 0.6, false); nm.rotation.y = PI / 2; }
function buildB() { const g = G.i1, i = 1, sp = g.userData.spots; R.bPalm = palm(g, sp[0][0], HT(i, sp[0][0], sp[0][1]) - 0.1, sp[0][1], 1.1, true, 7); R.bPalmP = sp[0];
  R.bills = []; for (let k = 0; k < 26; k++) { const b = add(g, new T3.PlaneGeometry(0.5, 0.25), MAT.bill, 0, -50, 0, false); b.userData.r = [S(k * 12.9898) * 43758 % 1, S(k * 78.233) * 12345 % 1, S(k * 3.7) * 999 % 1].map(Math.abs); R.bills.push(b); }
  const [sx, sz] = sp[1]; const sy = HT(i, sx, sz); add(g, new T3.CylinderGeometry(0.08, 0.1, 3, 8), SM('#8a6a44'), sx, sy + 1.5, sz); R.sign = add(g, Bx(3.2, 0.9, 0.1), new T3.MeshStandardMaterial({ map: label('SHOP . 1000 MILES →', 512, 144, '#f4e8c8', '#3a2a1a', 50), roughness: 0.8 }), sx + 1.2, sy + 2.6, sz); R.signP = [sx, sz];
  const [cx, cz] = sp[2]; R.richP = [cx, cz]; const cy = HT(i, cx, cz); R.rich = person(g, cx, cz, i, 3, { top: '#ffffff', bot: '#4a7ab8', hair: '#3a2414' }); R.rich.userData.body.position.y = -0.45; R.rich.userData.legL.rotation.x = R.rich.userData.legR.rotation.x = -1.4;
  for (let k = 0; k < 40; k++) { const a = k * 2.4, r_ = 0.8 + (k % 7) * 0.18; const b = add(g, Bx(0.5, 0.12, 0.25), MAT.bill, cx + C(a) * r_, cy + 0.06 + Math.floor(k / 9) * 0.12, cz + S(a) * r_); b.rotation.y = a; } }
function buildC() { const g = G.i2, i = 2; const [bx, bz] = centroid(i, 8, 30); R.hgP = [bx, bz]; const y = HT(i, bx, bz); const hg = R.hg = new T3.Group(); hg.position.set(bx, y, bz); g.add(hg);
  const wood = SM('#6a4024', { roughness: 0.6 }), glass = new T3.MeshStandardMaterial({ color: '#dff4ff', transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.1, depthWrite: false }); add(hg, new T3.CylinderGeometry(2.3, 2.3, 0.4, 32), wood, 0, 0.2, 0); add(hg, new T3.CylinderGeometry(2.3, 2.3, 0.4, 32), wood, 0, 7.4, 0); for (let k = 0; k < 4; k++) add(hg, new T3.CylinderGeometry(0.12, 0.12, 7, 8), wood, C(k * PI / 2 + PI / 4) * 2.1, 3.8, S(k * PI / 2 + PI / 4) * 2.1);
  add(hg, new T3.CylinderGeometry(0.15, 1.9, 3.3, 32, 1, true), glass, 0, 2.05, 0, false); add(hg, new T3.CylinderGeometry(1.9, 0.15, 3.3, 32, 1, true), glass, 0, 5.55, 0, false);
  const sand = SM('#f0c860', { roughness: 0.8, emissive: '#6a4a10', emissiveIntensity: 0.15 }); R.sTop = add(hg, new T3.ConeGeometry(1.7, 2.2, 32), sand, 0, 4.7, 0, false); R.sTop.rotation.x = PI; R.sBot = add(hg, new T3.ConeGeometry(1.75, 1.6, 32), sand, 0, 1.2, 0, false); R.stream = add(hg, new T3.CylinderGeometry(0.04, 0.04, 2.5, 6), sand, 0, 2.7, 0, false);
  // dock off the bottom edge
  let ez = bz; while (M(i, bx, ez) > 0.45 && ez < 40) ez += 0.3; R.dock = [bx + 4, ez - 3, ez + 9]; for (let z = ez - 3; z < ez + 9; z += 0.5) add(g, Bx(2, 0.12, 0.42), SM('#9a7448', { roughness: 0.85 }), bx + 4, 0.75, z); for (let z = ez - 2; z < ez + 9; z += 3) for (const sx of [-0.9, 0.9]) add(g, new T3.CylinderGeometry(0.1, 0.1, 3, 8), SM('#6a4a2a'), bx + 4 + sx, -0.5, z);
  R.boatC = new T3.Group(); R.boatC.position.set(bx + 6.3, 0, ez + 6.5); g.add(R.boatC); add(R.boatC, RB(1.8, 0.9, 4.6, 0.35), SM('#3a6aa8', { roughness: 0.5 }), 0, 0.25, 0); add(R.boatC, Bx(1.6, 0.08, 4), SM('#c8a070'), 0, 0.72, 0);
  R.ager = person(g, bx + 4, ez - 2, i, 5, { top: '#ffffff', bot: '#4a7ab8', hair: '#3a2414' }); R.agerHair = R.ager.userData.body.children[2].material; R.cane = add(R.ager.userData.armR, new T3.CylinderGeometry(0.025, 0.025, 0.9, 6), SM('#5a3a1a'), 0, -0.95, 0.05); R.cane.visible = false;
  const t0 = g.userData.palms[0].position; R.leafP = [t0.x + 1.6, t0.y + 2.6, t0.z + 1.2]; R.leaves = []; const lm = SM('#c8b03a', { roughness: 0.6, side: T3.DoubleSide });
  for (let k = 0; k < 7; k++) { const l = add(g, GEO.leaf, lm, R.leafP[0] + (k ? S(k * 2.1) * 2.2 : 0), R.leafP[1] + (k ? C(k * 1.3) * 1.2 : 0), R.leafP[2] + (k ? S(k * 3.3) * 1.5 : 0), false); l.scale.set(0.32, 0.03, 0.18); l.rotation.set(0.5 + k, k * 0.7, 0.3); R.leaves.push(l); }
  const [px, pz] = centroid(i, -26, -8); R.cTopP = [px, pz]; R.young = person(g, bx - 2.5, bz + 2, i, 1); R.young.rotation.y = 0.6; }
function buildD() { const g = G.i3, i = 3; const [dx, dz] = centroid(i, 12, 30); R.dotP = [dx, dz]; R.wsp = []; for (let k = 0; k < 40; k++) R.wsp.push(glow(g, '#e8c8ff', 0.5, S(k * 7.1) * 34, 0.3, C(k * 3.7) * 34, 0.9)); const dy = HT(i, dx, dz);
  R.nb = person(g, dx, dz, i, 4, { top: '#3a5ae8', bot: '#2a2a3a', hair: '#d8b060' }); R.cape = add(R.nb.userData.body, new T3.PlaneGeometry(0.6, 1.1), SM('#e83a3a', { side: T3.DoubleSide }), 0, 1.0, -0.2, false);
  R.crabs = []; const red = SM('#e8502a', { roughness: 0.5 }); for (let k = 0; k < 6; k++) { const c = new T3.Group(); const a = k / 6 * PI * 2; c.position.set(dx + S(a) * 2.2, dy + 0.15, dz + C(a) * 2.2); c.rotation.y = a + PI; g.add(c); add(c, new T3.SphereGeometry(0.28, 14, 10), red, 0, 0.12, 0).scale.set(1.3, 0.55, 1); for (const sx of [-1, 1]) { add(c, new T3.SphereGeometry(0.11, 10, 8), red, sx * 0.32, 0.22, 0.25); for (let l = 0; l < 3; l++) add(c, new T3.CylinderGeometry(0.025, 0.025, 0.3, 5), red, sx * 0.35, 0.05, -0.12 + l * 0.12, false).rotation.z = sx * 1.1; add(c, new T3.SphereGeometry(0.04, 8, 6), SM('#111'), sx * 0.08, 0.3, 0.2, false); } R.crabs.push(c); }
  R.spark = []; for (let k = 0; k < 20; k++) R.spark.push(glow(g, '#ffe88a', 0.4, 0, -50, 0, 0.9)); }
let OCEAN, OBASE;
function buildSea() { const geo = new T3.PlaneGeometry(420, 420, 140, 140); geo.rotateX(-PI / 2); OBASE = Float32Array.from(geo.attributes.position.array); OCEAN = add(scene, geo, new T3.MeshStandardMaterial({ color: '#178ab0', roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.88, envMapIntensity: 0.35 }), 0, 0, 0, false); OCEAN.castShadow = false; OCEAN.receiveShadow = false;
  SEABED = add(scene, new T3.PlaneGeometry(4000, 4000).rotateX(-PI / 2), SM('#0d4a68', { roughness: 1 }), 450, -2.7, 0, false);
  R.clouds = []; for (let k = 0; k < 60; k++) { const c = glow(scene, '#ffffff', 14 + (k % 5) * 4, (k * 97) % 1100 - 50, 55 + (k % 4) * 6, ((k * 53) % 200) - 100, 0.55); c.material.blending = T3.NormalBlending; R.clouds.push(c); } }
const OC = ['#e88ab8', '#14b07a', '#2a8ab0', '#8a4ae0'], SB = ['#9a4a7a', '#0a5a3a', '#0d4a68', '#3a1a6a'], AMP = [1, 1, 0.04, 1]; let SEABED;
function sea(cx, cz, T, i = 0) { OCEAN.material.color.set(OC[i]); OCEAN.material.roughness = i === 2 ? 0.02 : 0.08; SEABED.material.color.set(SB[i]); const am = AMP[i]; const st = 420 / 140; const ox = Math.round(cx / st) * st, oz = Math.round(cz / st) * st; OCEAN.position.set(ox, 0, oz); const p = OCEAN.geometry.attributes.position;
  for (let k = 0; k < p.count; k++) { const x = OBASE[k * 3] + ox, z = OBASE[k * 3 + 2] + oz; p.array[k * 3 + 1] = am * (0.22 * S(0.16 * x + 1.4 * T) + 0.16 * S(0.21 * z + 1.1 * T) + 0.07 * S(0.55 * (x + z) + 2.3 * T)); } p.needsUpdate = true; OCEAN.geometry.computeVertexNormals(); }

// ---------- timeline ----------
const E = { look: AT(0, 'every'), heart: AT(1, 'heart'), hearts: AT(1, 'hearts'), pink: AT(1, 'water'), everyone: AT(1, 'everyone'), songs: AT(1, 'songs'), boat: AT(1, 'boat'), cA: AT(2, 'but'), bath: AT(2, 'bathroom'),
  dollar: AT(3, 'dollar'), green: AT(3, 'water'), cash: AT(3, 'cash'), money: AT(3, 'money'), cB: CL[4].start, shop: AT(4, 'shop'), like: AT(4, 'like'), because: AT(4, 'last'),
  normal: AT(5, 'normal'), frozen: AT(5, 'frozen'), still: AT(5, 'still'), here: AT(5, 'here'), cC: AT(6, 'but'), step: AT(6, 'step'), every6: AT(6, 'every'),
  twisted: AT(7, 'twisted'), trees7: AT(7, 'trees'), sparkles: AT(7, 'sparkles'), morning: AT(7, 'superpower'), yest: AT(7, 'neighbour'), cD: CL[8].start, crabs2: AT(8, 'and'), end: CL[9].start, a9: AT(9, 'a'), b9: AT(9, 'b'), c9: AT(9, 'c'), d9: AT(9, 'd'), comment: AT(9, 'comment'), follow: AT(9, 'follow') };
E.coco = E.money; E.loop = AT(9, 'tell') - 0.05; E.A = E.heart; E.B = E.dollar; E.C = E.normal; E.D = E.twisted; E.here = AT(5, 'here');
const REV = [E.heart, E.dollar, E.normal, E.twisted];
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
function topDown(i, k, h0, h1, a0, a1) { const h = lerp(h0, h1, ease(k)), a = lerp(a0, a1, k); camera.up.set(S(a), 0, -C(a)); cam(PP(i, 0, h, 0.001), PP(i, 0, 0, 0)); }
const lp = (i, x, z) => [IX[i] + x, HT(i, x, z), z];
function orbit(i, cx, cz, r, h, a0, a1, k, ly = 1) { const a = lerp(a0, a1, k); cam(PP(i, cx + S(a) * r, h, cz + C(a) * r), PP(i, cx, HT(i, cx, cz) + ly, cz)); }
const SH = [
  [0, 0, (k, T) => topDown(0, k, 92, 84, 0, 0.05)], [0.6, 1, (k, T) => topDown(1, k, 92, 84, 0, 0.05)], [1.2, 2, (k, T) => topDown(2, k, 92, 84, 0, 0.05)], [1.8, 3, (k, T) => topDown(3, k, 92, 84, 0, 0.05)],
  [E.look - 0.05, 0, (k, T) => { cam(PP(0, lerp(-34, -18, k), lerp(12, 24, k), lerp(52, 42, k)), PP(0, 0, 0, 0)); }],
  [E.heart - 0.1, 0, (k, T) => topDown(0, k, 115, 82, -0.3, 0.1)],
  [E.hearts - 0.1, 0, (k, T) => { const t = G.i0.userData.palms[1].position; cam(PP(0, t.x + lerp(5, 4, k), t.y + 4, t.z + lerp(6, 5, k)), PP(0, t.x, t.y + 3.6, t.z)); }],
  [E.pink - 0.05, 0, (k, T) => { cam(PP(0, lerp(-6, 2, k), 1.2, 44), PP(0, 0, 1, 20)); }],
  [E.everyone - 0.1, 0, (k, T) => orbit(0, 0, 2, 9, 3.2, -0.6, 0.2, k, 1.2)],
  [E.songs - 0.1, 0, (k, T) => { const a = R.adm[0].position; cam(PP(0, a.x * 0.45, a.y + 1.7, a.z * 0.45 + 1), PP(0, a.x, a.y + 1.2, a.z)); }],
  [E.boat - 0.1, 0, (k, T) => { cam(PP(0, lerp(17, 13, k), 3.2, 41), PP(0, 5, 1.6, 33)); }],
  [CL[2].start, 0, (k, T) => orbit(0, 0, 2, lerp(16, 7, ease(k)), lerp(14, 4, ease(k)), 0.8, 1.4, k, 1)],
  [E.bath - 0.1, 0, (k, T) => { cam(PP(0, R.hut[0] - 8, 7.5, R.hut[1] + 13), PP(0, R.hut[0] - 1.5, 1.4, R.hut[1] + 1)); }],
  [E.dollar - 0.1, 1, (k, T) => topDown(1, k, 115, 82, 0.3, -0.05)],
  [E.green - 0.05, 1, (k, T) => { cam(PP(1, lerp(8, -4, k), 1.4, 46), PP(1, 0, 1.5, 20)); }],
  [E.cash - 0.1, 1, (k, T) => { const [x, z] = R.bPalmP; cam(PP(1, x + 4, lerp(4, 6.5, k), z + 5), PP(1, x + 1, HT(1, x, z) + 7, z)); }],
  [E.money - 0.1, 1, (k, T) => { const [x, z] = R.bPalmP; cam(PP(1, x + 6, 5, z + 8), PP(1, x + 1, HT(1, x, z) + 4, z)); }],
  [E.cB, 1, (k, T) => { const [x, z] = R.richP; orbit(1, x, z, 5, 2.4, 0.3, 0.8, k, 0.8); }],
  [E.shop - 0.1, 1, (k, T) => { const [x, z] = R.signP; cam(PP(1, x + 1.2, HT(1, x, z) + 2.6, z + lerp(6, 4.5, k)), PP(1, x + 1.2, HT(1, x, z) + 2.5, z)); }],
  [E.like - 0.15, 1, (k, T) => { cam(PP(1, lerp(-20, -36, k), lerp(20, 40, k), lerp(40, 60, k)), PP(1, 0, 0, 0)); }],
  [E.normal - 0.1, 2, (k, T) => topDown(2, k, 115, 82, -0.2, 0.08)],
  [E.frozen - 0.1, 2, (k, T) => { const l = R.leafP; cam(PP(2, l[0] + lerp(1.6, 1.0, k), l[1] + 0.3, l[2] + lerp(1.8, 1.2, k)), PP(2, l[0], l[1], l[2])); }],
  [E.still - 0.1, 2, (k, T) => { cam(PP(2, lerp(-10, -4, k), 1.0, 44), PP(2, 0, 2, 10)); }],
  [E.here - 0.1, 2, (k, T) => { const [x, z] = R.hgP; orbit(2, x, z, 10, 4, -0.5, 0.1, k, 3.5); }],
  [E.cC, 2, (k, T) => { const d = R.dock; cam(PP(2, d[0] + 6, 3.2, d[1] + 2), PP(2, d[0], 1.5, d[1] + 5)); }],
  [E.every6 - 0.1, 2, (k, T) => { const p = R.ager.position; cam(PP(2, p.x + 2.2, 2.2, p.z + 2.2), PP(2, p.x, 1.9, p.z)); }],
  [E.twisted - 0.1, 3, (k, T) => topDown(3, k, 115, 82, 0.2, -0.06)],
  [E.trees7 - 0.1, 3, (k, T) => { const t = G.i3.userData.palms[2].position; orbit(3, t.x, t.z, 6, t.y + 4, 0, 0.6, k, 3.5); }],
  [E.sparkles - 0.1, 3, (k, T) => { cam(PP(3, lerp(-8, 2, k), 1.3, 42), PP(3, 0, 1.2, 18)); }],
  [E.morning - 0.1, 3, (k, T) => { const [x, z] = R.dotP; orbit(3, x, z, 6, 2.2, 1.2, 1.6, k, 1.1); }],
  [E.yest - 0.1, 3, (k, T) => { cam(PP(3, -14, 6, 30), PP(3, R.nb.position.x, R.nb.position.y + 1, R.nb.position.z)); }],
  [E.cD, 3, (k, T) => { const [x, z] = R.dotP; orbit(3, x, z, 4.5, 1.6, -0.4, 0.1, k, 0.6); }],
  [E.crabs2 - 0.1, 3, (k, T) => { const [x, z] = R.dotP; cam(PP(3, x + 1.6, HT(3, x, z) + 0.7, z + 2.6), PP(3, x, HT(3, x, z) + 0.5, z)); }],
  [E.end, 'grid', () => {}],
  [E.loop, 0, (k, T) => topDown(0, 0, 92, 92, 0, 0)],
];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function anim(T) { // per-island life
  R.hearts.forEach((h, k) => { h.position.y = R.adm[k].position.y + 2.2 + S(T * 3 + k) * 0.12; const s = 0.55 + 0.1 * Math.max(0, S(T * 6 + k)); h.scale.set(s, s, 1); });
  R.adm.forEach((h, k) => { rest(h); h.userData.body.position.y = Math.abs(S(T * 4 + k)) * 0.05; if (k > 0) h.userData.armL.rotation.z = -0.3 - 0.3 * Math.max(0, S(T * 5 + k)); }); R.adm[0].userData.armR.rotation.x = -0.9 + S(T * 14) * 0.15;
  const a0 = R.adm[0].position; R.notes.forEach((n, k) => { const q = (T * 0.5 + k / 6) % 1; n.position.set(a0.x + S(k * 2) * 0.6 * q, a0.y + 1.6 + q * 1.8, a0.z + C(k * 3) * 0.5 * q); n.material.opacity = S(q * PI); });
  R.queue.forEach((h, k) => { rest(h); h.userData.body.position.y = Math.abs(S(T * 3 + k)) * 0.03; if (k % 2) h.userData.armR.rotation.x = -0.4 - 0.2 * S(T * 4 + k); });
  rest(R.you); R.you.rotation.y = S(T * 0.7) * 0.6; R.boat.position.y = S(T * 1.2) * 0.12; R.boat.rotation.z = S(T * 0.9) * 0.04;
  // cash coconut burst
  const bk = prog(T, E.coco + 0.3, E.coco + 2.8); const top = R.bPalm.userData.top; const tw = new T3.Vector3(); top.getWorldPosition(tw); tw.x -= IX[1]; R.bPalm.userData.nuts[0].visible = bk <= 0;
  R.bills.forEach((b, k) => { const r = b.userData.r; if (bk <= 0) { b.position.y = -50; return; } const a = r[0] * PI * 2, sp = 2 + r[1] * 3; b.position.set(tw.x + C(a) * sp * bk * 1.4, tw.y - 0.3 + 3 * bk * (1 - r[2] * 0.3) - 7 * bk * bk, tw.z + S(a) * sp * bk * 1.4); b.rotation.set(T * (3 + r[0] * 5), T * (2 + r[1] * 4), T * 2); });
  R.bPalm.userData.top.rotation.z = S(T * 1.3) * 0.03; rest(R.rich); R.rich.userData.body.position.y = -0.45; R.rich.userData.legL.rotation.x = R.rich.userData.legR.rotation.x = -1.4; R.rich.userData.armR.rotation.x = -0.7 + S(T * 2) * 0.1; R.rich.userData.body.rotation.x = 0.15;
  // hourglass: sand flows the wrong way? no, it never runs out
  const sf = (T * 0.05) % 1; R.sTop.scale.set(1, 1, 1); R.sBot.scale.set(1, 1, 1); R.stream.material.opacity = 1;
  // ager walks the dock then ages
  const d = R.dock; const wk = prog(T, E.cC + 0.2, E.step + 0.5); rest(R.ager); R.ager.position.set(IX[2] * 0 + d[0], 0.8, lerp(d[1] + 0.5, d[2] - 2.2, ease(wk))); R.ager.rotation.y = 0; if (wk > 0 && wk < 1) walkP(R.ager, T * 7, 0.8);
  const ag = ease(prog(T, E.step + 0.4, E.every6 + 0.6)); R.agerHair.color.set('#3a2414').lerp(new T3.Color('#e8e8e8'), ag); R.ager.userData.body.rotation.x = 0.35 * ag; R.ager.userData.body.position.y = -0.12 * ag; R.cane.visible = ag > 0.5; if (ag > 0.5) R.ager.userData.armR.rotation.x = -0.25; R.ager.scale.setScalar(1 - 0.06 * ag);
  rest(R.young); R.young.userData.armR.rotation.z = -2.6 + S(T * 6) * 0.3;
  // neighbour flying (yesterday) then on the dot with crabs
  const nb = R.nb; rest(nb); const [dx, dz] = R.dotP; if (T < E.cD) { const f = prog(T, E.yest - 0.5, E.cD); nb.position.set(lerp(-14, 10, f), 9 + S(T * 2) * 0.6, lerp(18, 10, f)); nb.rotation.set(0, PI / 2, 0); nb.userData.body.rotation.x = 1.3; nb.userData.armL.rotation.x = nb.userData.armR.rotation.x = -3.0; R.cape.rotation.x = 0.9 + S(T * 18) * 0.15; }
  else { nb.position.set(dx, HT(3, dx, dz), dz); nb.rotation.set(0, 0.5, 0); nb.userData.body.rotation.x = 0; R.cape.rotation.x = 0.1; nb.userData.armL.rotation.z = 0.6; nb.userData.armR.rotation.z = -0.6; nb.userData.body.position.y = 0; }
  R.crabs.forEach((c, k) => { const a = k / 6 * PI * 2 + S(T * 0.8 + k) * 0.15; const r_ = T > E.crabs2 ? 1.4 : 2.2; c.position.set(dx + S(a) * r_, HT(3, dx, dz) + 0.12, dz + C(a) * r_); c.rotation.y = a + PI; c.children[1].position.y = 0.22 + Math.max(0, S(T * 12 + k)) * 0.1; c.children[2 + 3].position.y = 0.22 + Math.max(0, S(T * 12 + k + 1)) * 0.1; });
  R.spark.forEach((s_, k) => { const on = T > E.morning && T < E.yest; const q = (T * 0.7 + k / 20) % 1; s_.position.set(dx + S(k * 2.3) * 1.5, on ? HT(3, dx, dz) + q * 3 : -50, dz + C(k * 1.7) * 1.5); s_.material.opacity = S(q * PI); });
  R.wsp.forEach((w, k) => { w.material.opacity = 0.9 * Math.max(0, S(T * 3 + k * 1.7)); }); R.clouds.forEach((c, k) => c.position.x = ((k * 97 + T * 1.5) % 1100) - 50); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.up.set(0, 1, 0); camera.fov = 50; camera.aspect = RW / RH; camera.updateProjectionMatrix();
  for (let i = 0; i < 4; i++) G['i' + i].visible = sh[1] === 'grid' || sh[1] === i; anim(T); sh[2](prog(T, t0, t1), T); return { si, t0, isl: sh[1] }; }

// ---------- HUD ----------
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(8,20,30,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.4 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function txt(s_, x, y, size, col, align = 'center') { octx.font = `${size}px Russo`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function icon(i, x, y, s, col) { octx.save(); octx.translate(x, y); octx.fillStyle = col; octx.strokeStyle = col;
  if (i === 0) { octx.beginPath(); octx.moveTo(0, s * 0.45); octx.bezierCurveTo(-s * 0.75, -s * 0.05, -s * 0.4, -s * 0.6, 0, -s * 0.25); octx.bezierCurveTo(s * 0.4, -s * 0.6, s * 0.75, -s * 0.05, 0, s * 0.45); octx.fill(); }
  if (i === 1 || i === 3) { octx.font = `${s * 1.1}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(i === 1 ? '$' : '?', 0, s * 0.05); }
  if (i === 2) { octx.beginPath(); octx.moveTo(-s * 0.35, -s * 0.45); octx.lineTo(s * 0.35, -s * 0.45); octx.lineTo(s * 0.06, 0); octx.lineTo(s * 0.35, s * 0.45); octx.lineTo(-s * 0.35, s * 0.45); octx.lineTo(-s * 0.06, 0); octx.closePath(); octx.fill(); } octx.restore(); }
const NAMES = ['A', 'B', 'C', 'D'], PERK = ['EVERYONE HAS A CRUSH ON YOU', 'MONEY GROWS ON TREES', 'YOU NEVER GET OLDER', 'RANDOM SUPERPOWER DAILY'], COLS = ['#ff6a9a', '#6ad86a', '#f4c24a', '#8ab4ff'];
function chips(T, cur) { if (T < E.A) return; const x0 = 108; for (let i = 0; i < 4; i++) { const x = x0 + i * 168, on = i === cur, done = [E.B, E.C, E.D, E.end][i] <= T; octx.save(); octx.globalAlpha = on ? 1 : 0.75; octx.fillStyle = on ? COLS[i] : 'rgba(10,30,45,0.75)'; octx.beginPath(); octx.roundRect(x - 70, 42, 140, 62, 31); octx.fill(); if (!on) { octx.strokeStyle = COLS[i]; octx.lineWidth = 3; octx.stroke(); }
  txt(NAMES[i], x - 30, 74, 30, on ? '#0a1a24' : '#fff'); icon(i, x + 26, 73, 36, on ? '#0a1a24' : (done || on ? COLS[i] : 'rgba(255,255,255,0.35)')); octx.restore(); } }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30);
  octx.fillStyle = 'rgba(8,20,30,0.85)'; octx.beginPath(); octx.roundRect(170, 940, 380, 70, 35); octx.fill(); octx.strokeStyle = '#fff'; octx.lineWidth = 3; octx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); octx.save(); octx.translate(216, 975); octx.scale(hb, hb); octx.fillStyle = '#ff5a6a'; octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore();
  txt('LIKE', 270, 976, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#5ac8f8'; octx.beginPath(); octx.roundRect(340, 953, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 976, 20, '#0a0a10'); octx.restore(); }
const CAPS = []; CL.forEach((c0) => { const ws = c0.words; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 5 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function caption(s_) { octx.save(); octx.font = '52px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = s_.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1110 - (lines.length - 1) * 32; lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(8,20,30,0.95)'; octx.strokeText(l, 360, y0 + i * 64); octx.fillStyle = '#fff'; octx.fillText(l, 360, y0 + i * 64); }); octx.restore(); }
function bubble(wp, s_, a) { if (a <= 0) return; const v = new T3.Vector3(...wp).project(camera); const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; octx.save(); octx.globalAlpha = a; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; octx.fillStyle = '#fff'; octx.beginPath(); octx.roundRect(x - w / 2, y - 80, w, 54, 18); octx.fill(); octx.beginPath(); octx.moveTo(x - 10, y - 28); octx.lineTo(x + 10, y - 28); octx.lineTo(x, y - 10); octx.fill(); txt(s_, x, y - 52, 28, '#c82a2a'); octx.restore(); }

window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(50, RW / RH, 0.1, 1500);
  scene.background = ctex(16, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a8ad8'); g.addColorStop(0.55, '#8ac8f0'); g.addColorStop(1, '#e0f0f8'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  scene.fog = new T3.Fog('#bfe0f4', 120, 420);
  initShared(); for (let i = 0; i < 4; i++) buildIsland(i); buildA(); buildB(); buildC(); buildD(); buildSea();
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a9ae8'); gr.addColorStop(0.5, '#dff0ff'); gr.addColorStop(1, '#2a6a8a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(150, 18, 30, 14); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); ENV = pm.fromScene(es, 0.02).texture; scene.environment = ENV; }
  GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; { const gc = GRAIN.getContext('2d'); const id = gc.createImageData(512, 512); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 80 + r() * 96; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
const GQ = [[0, 640], [360, 640], [0, 0], [360, 0]];
window.renderFrame = function (T) { const ci = CLI(T); const { si, t0, isl } = shot(T); const ii = typeof isl === 'number' ? isl : 0;
  if (isl === 'grid') { renderer.setScissorTest(true); for (let i = 0; i < 4; i++) { const [x, y] = GQ[i]; renderer.setViewport(x, y, 360, 640); renderer.setScissor(x, y, 360, 640); camera.aspect = 360 / 640; camera.updateProjectionMatrix(); const a = T * 0.15 + i; camera.up.set(S(a), 0, -C(a)); cam(PP(i, 0, 95, 0.001), PP(i, 0, 0, 0)); sea(IX[i], 0, T, i); renderer.render(scene, camera); } renderer.setScissorTest(false); renderer.setViewport(0, 0, RW, RH); }
  else { sea(camera.position.x, camera.position.z, T, ii); renderer.render(scene, camera); }
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(1.14)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'blur(3px)'; octx.globalAlpha = 0.12; octx.drawImage(glc, 0, 0, W, H); octx.globalAlpha = 1; octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.18); if (si > 0 && tk < 1) { SNAP.getContext('2d').drawImage(out, 0, 0); for (let i = 1; i <= 4; i++) { const sc = 1 + (1 - tk) * 0.05 * i; octx.globalAlpha = 0.22 * (1 - tk); octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); } octx.globalAlpha = 1; }
  sctx.filter = 'brightness(0.7) contrast(2.2)'; sctx.drawImage(out, 0, 0, 90, 160); sctx.filter = 'none'; octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.3; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1;
  octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.05; octx.drawImage(GRAIN, -Math.floor(Math.random() * 300), -Math.floor(Math.random() * 300), W + 300, H + 300); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (isl === 'grid') { octx.strokeStyle = '#fff'; octx.lineWidth = 6; octx.beginPath(); octx.moveTo(360, 0); octx.lineTo(360, H); octx.moveTo(0, 640); octx.lineTo(W, 640); octx.stroke(); const hl = [E.a9, E.b9, E.c9, E.d9];
    for (let i = 0; i < 4; i++) { const qx = (i % 2) * 360 + 180, qy = Math.floor(i / 2) * 640; const on = T > hl[i] - 0.1 && (i === 3 ? T < E.comment : T < hl[i + 1] - 0.1) || T > E.comment; const pop = prog(T, hl[i] - 0.1, hl[i] + 0.15);
      if (!on && T < E.comment) { octx.fillStyle = 'rgba(0,10,20,0.45)'; octx.fillRect(qx - 180, qy, 360, 640); } big(NAMES[i], qy + 90, on ? 96 : 80, on ? COLS[i] : '#fff', Math.max(0.4, pop), qx); icon(i, qx, qy + 175, 54, '#fff'); } 
    if (T > E.comment - 0.1) { octx.fillStyle = 'rgba(8,20,30,0.85)'; octx.beginPath(); octx.roundRect(70, 570, 580, 140, 30); octx.fill(); big('COMMENT A, B, C OR D', 618, 44, '#fff', prog(T, E.comment - 0.1, E.comment + 0.15)); big('AND FOLLOW', 672, 32, '#5ac8f8', prog(T, E.follow - 0.2, E.follow + 0.1)); } }
  let cur = -1; for (let k = 0; k < 4; k++) if (T >= REV[k] - 0.1 && T < E.end) cur = k; if (isl !== 'grid' && T < E.loop) chips(T, cur);
  if (T > E.loop) { big('WHICH ISLAND', 230, 80, '#fff', 1); big('WOULD YOU PICK?', 310, 54, '#fff', 1); }
  if (ci === 0) { big('WHICH ISLAND', 230, 80, '#fff', 1); big('WOULD YOU PICK?', 310, 54, '#fff', 1); big('LIVE THERE FOREVER', 380, 42, '#ffe08a', prog(T, AT(0, 'forever') - 0.3, AT(0, 'forever'))); if (T > AT(0, 'every') - 0.1) big('EVERY DETAIL IS A CLUE', 445, 44, '#8ae8ff', prog(T, AT(0, 'every') - 0.1, AT(0, 'every') + 0.15)); }
  if (ci >= 1 && ci <= 8 && ci % 2 === 1 && T > REV[(ci - 1) / 2] - 0.1) { const i = (ci - 1) / 2, s0 = REV[i] - 0.1; const k = prog(T, s0, s0 + 0.2); big('ISLAND ' + NAMES[i], 190, 84, COLS[i], k); const pk = [E.everyone, E.money, E.here, E.morning][i]; const TAGS = [[[E.hearts, 'TREES . HEART SHAPED'], [E.pink, 'WATER . SOFT PINK']], [[E.green, 'WATER . EMERALD'], [E.cash, 'COCONUTS . CASH']], [[E.frozen, 'LEAVES . FROZEN'], [E.still, 'WATER . STILL AS GLASS']], [[E.trees7, 'TREES . SPIRAL'], [E.sparkles, 'WATER . PURPLE SPARKLE']]][i];
    TAGS.forEach(([t_, s_]) => { if (T > t_ - 0.1 && T < pk - 0.2) { const a = prog(T, t_ - 0.1, t_ + 0.15); octx.save(); octx.globalAlpha = a; octx.font = '30px Russo'; const w = octx.measureText(s_).width + 50; octx.fillStyle = 'rgba(8,20,30,0.8)'; octx.beginPath(); octx.roundRect(360 - w / 2, 300, w, 58, 29); octx.fill(); octx.strokeStyle = COLS[i]; octx.lineWidth = 3; octx.stroke(); txt(s_, 360, 330, 30, '#fff'); octx.restore(); } }); if (T > pk - 0.2) big(PERK[i], 270, PERK[i].length > 24 ? 34 : 40, '#fff', prog(T, pk - 0.2, pk + 0.1)); }
  if (ci >= 2 && ci <= 8 && ci % 2 === 0) { const ck = (ci - 2) / 2, s0 = [E.cA, CL[4].start, E.cC, CL[8].start][ck]; if (T > s0 - 0.05) big(['BUT...', 'ONE PROBLEM...', 'BUT...', 'TODAY...'][ck], 190, ck === 1 ? 64 : 90, '#ff5a5a', prog(T, s0 - 0.05, s0 + 0.2));
    const L = [[E.bath, 'NEVER ALONE. EVER.'], [E.shop, 'NOTHING TO BUY'], [E.every6, '+60 YEARS AT ONCE'], [E.crabs2, 'THE CRABS ARE RUDE']][(ci - 2) / 2]; if (T > L[0] - 0.2) big(L[1], 275, 44, '#fff', prog(T, L[0] - 0.2, L[0] + 0.1)); }
  if (ci === 4 && T > E.because - 0.1) big('THE STRANGEST IS NEXT...', 450, 40, '#8ab4ff', prog(T, E.because - 0.1, E.because + 0.2));
  if (ci === 7 && T > E.morning) { octx.fillStyle = 'rgba(8,20,30,0.82)'; octx.beginPath(); octx.roundRect(150, 330, 420, 84, 24); octx.fill(); const pw = ['FLYING', 'X RAY EYES', 'SUPER SPEED', 'INVISIBLE', 'TALK TO CRABS', 'LASER SNEEZE']; const fin = T > E.yest - 0.1; txt(fin ? 'YESTERDAY . FLYING' : 'TODAY . ' + pw[Math.floor(T * 12) % pw.length], 360, 372, 32, fin ? '#8ab4ff' : '#ffe08a'); }
  if (ci === 8) { octx.fillStyle = 'rgba(8,20,30,0.82)'; octx.beginPath(); octx.roundRect(150, 330, 420, 84, 24); octx.fill(); txt('TODAY . TALK TO CRABS', 360, 372, 32, '#ff8a6a');
    if (T > E.crabs2 + 0.2) { const lines = ['NICE HAIR. NOT.', 'WHO INVITED HIM?', 'MOVE.']; R.crabs.slice(0, 3).forEach((c, k) => { const w = new T3.Vector3(); c.getWorldPosition(w); bubble([w.x, w.y + 0.5, w.z], lines[k], prog(T, E.crabs2 + 0.2 + k * 0.4, E.crabs2 + 0.4 + k * 0.4)); }); } }
  likePill(T, E.like, CL[5].start - 0.1, AT(4, 'follow')); if (T > E.follow - 0.2 && T < E.loop) likePill(T, E.follow, TM.total + 1, E.follow + 0.2);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && isl !== 'grid') caption(cap.txt);
};
})();
