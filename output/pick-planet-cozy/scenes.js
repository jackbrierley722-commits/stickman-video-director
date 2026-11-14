// Pick a planet (cozy pixel 3D). Rendered small and upscaled with nearest-neighbour for a pixel look; pixel font text.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 360, RH = 640;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
let renderer, scene, camera, out, octx, glc, GLOW;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7, metalness: 0 }, o));
const BM = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !(mat instanceof T3.MeshBasicMaterial); p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Sp = (r, a = 24, b = 16) => new T3.SphereGeometry(r, a, b), Cy = (a, b, h, n = 16) => new T3.CylinderGeometry(a, b, h, n);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.userData = { g, c }; return t; }
function glow(p, col, size, x, y, z, op = 1) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function look(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const G = {}, R = {};
function skyBall(g, top, mid, bot, r = 60) { const t = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.5, mid); gr.addColorStop(1, bot); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); add(g, Sp(r, 24, 16), new T3.MeshBasicMaterial({ map: t, side: T3.BackSide, fog: false })); }

// ---------- people (smooth, detailed) ----------
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#d8a888', { roughness: 0.55 }), top = SM(o.top || '#5a3a2a', { roughness: 0.85 }), bot = SM(o.bot || '#2a3a5a', { roughness: 0.85 }), hairM = SM(o.hair || '#2a1a10', { roughness: 0.9 });
  const up = new T3.Group(); up.position.y = 0.92; g.add(up); const torso = add(up, new T3.CapsuleGeometry(0.17, 0.36, 8, 18), top, 0, 0.3, 0); torso.scale.set(1, 1, 0.72); add(g, new T3.CapsuleGeometry(0.16, 0.06, 6, 16), bot, 0, 0.92, 0).scale.set(1, 1, 0.75);
  if (o.hood) { add(up, new T3.TorusGeometry(0.1, 0.045, 8, 16), top, 0, 0.56, -0.03).rotation.x = PI / 2.4; add(up, Cy(0.008, 0.008, 0.14, 5), SM('#e8e0d0'), 0.04, 0.42, 0.13); add(up, Cy(0.008, 0.008, 0.14, 5), SM('#e8e0d0'), -0.04, 0.42, 0.13); add(up, Bx(0.2, 0.09, 0.04), top, 0, 0.18, 0.12); }
  add(up, Cy(0.05, 0.058, 0.1, 12), skin, 0, 0.6, 0); const head = new T3.Group(); head.position.set(0, 0.76, 0); up.add(head); add(head, Sp(0.112, 28, 20), skin).scale.set(0.9, 1.1, 1); add(head, Sp(0.09, 20, 14), skin, 0, -0.06, 0.02).scale.set(0.95, 0.75, 0.95);
  for (const sx of [-1, 1]) { add(head, Sp(0.02, 12, 10), SM('#f4f0ea', { roughness: 0.2 }), sx * 0.04, 0.012, 0.092); add(head, Sp(0.011, 10, 8), SM('#2a1a10', { roughness: 0.1 }), sx * 0.04, 0.012, 0.108); add(head, new T3.CapsuleGeometry(0.008, 0.035, 4, 8), hairM, sx * 0.042, 0.048, 0.1).rotation.z = PI / 2 + sx * (o.angry ? 0.25 : 0.06); add(head, Sp(0.025, 10, 8), skin, sx * 0.104, 0.0, 0.0).scale.set(0.45, 1, 0.75); }
  add(head, new T3.ConeGeometry(0.018, 0.045, 8), skin, 0, -0.012, 0.112).rotation.x = PI / 2.2;
  const mouth = new T3.Group(); mouth.position.set(0, -0.058, 0.096); head.add(mouth); const mw = o.grin ? 0.036 : 0.022; const arc = add(mouth, new T3.TorusGeometry(mw, 0.0045, 6, 16, PI), SM('#7a3a32'), 0, 0.012, 0); arc.rotation.z = PI; if (o.grin) add(mouth, new T3.CircleGeometry(mw * 0.95, 16, PI, PI), SM('#f4f0e8'), 0, 0.012, -0.001);
  if (o.hair !== null) { const hc = add(head, new T3.SphereGeometry(0.118, 28, 16, 0, PI * 2, 0, PI * 0.52), hairM, 0, 0.015, -0.008); hc.scale.set(0.95, 1.08, 1.06); if (o.long) add(head, new T3.CapsuleGeometry(0.1, 0.18, 6, 14), hairM, 0, -0.08, -0.06).scale.set(1.05, 1, 0.6); }
  if (o.beanie) add(head, new T3.SphereGeometry(0.122, 24, 12, 0, PI * 2, 0, PI * 0.5), SM(o.beanie, { roughness: 1 }), 0, 0.03, -0.005).scale.set(0.95, 1.05, 1.05);
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.215, 0.5, 0); up.add(s_); add(s_, new T3.CapsuleGeometry(0.052, 0.22, 6, 12), top, 0, -0.14, 0); const e = new T3.Group(); e.position.y = -0.29; s_.add(e); add(e, new T3.CapsuleGeometry(0.045, 0.2, 6, 12), o.short ? skin : top, 0, -0.12, 0); add(e, Sp(0.042, 12, 10), skin, 0, -0.27, 0.01).scale.set(0.8, 1.15, 0.6); s_.userData.e = e; return s_; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.09, 0.9, 0); g.add(h); add(h, new T3.CapsuleGeometry(0.072, 0.34, 6, 12), bot, 0, -0.21, 0); const k = new T3.Group(); k.position.y = -0.43; h.add(k); add(k, new T3.CapsuleGeometry(0.058, 0.33, 6, 12), bot, 0, -0.2, 0); add(k, Bx(0.1, 0.07, 0.24), SM(o.shoe || '#1a1a1e', { roughness: 0.5 }), 0, -0.43, 0.05); h.userData.k = k; return h; };
  g.userData = { up, head, mouth, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
function sitPose(p) { const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2; l.userData.k.rotation.x = PI / 2; } }

// ---------- space: four planets ----------
const PL = [[-1.15, 1.25], [1.15, 1.25], [-1.15, -1.25], [1.15, -1.25]];
function planetTex(i) { const r = rng(10 + i); return ctex(256, 128, (c, w, h) => {
  if (i === 0) { c.fillStyle = '#5a3418'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { let x = 0; while (x < w) { const bw = 3 + r() * 5; c.fillStyle = ['#c8402a', '#2a6ab8', '#e8b83a', '#3a9a5a', '#8a3ab8', '#e8e0c8'][Math.floor(r() * 6)]; c.fillRect(x, y + 2, bw, 12 + r() * 2); x += bw + 1; } c.fillStyle = '#3a2210'; c.fillRect(0, y + 14, w, 2); } }
  if (i === 1) { c.fillStyle = '#eef4fa'; c.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(160,180,200,0.4)'; c.beginPath(); c.ellipse(r() * w, r() * h, 6 + r() * 14, 3 + r() * 6, 0, 0, 7); c.fill(); } for (let k = 0; k < 22; k++) { c.fillStyle = '#3ac8d8'; c.beginPath(); c.ellipse(r() * w, 20 + r() * (h - 40), 5 + r() * 8, 3 + r() * 5, 0, 0, 7); c.fill(); } }
  if (i === 2) { c.fillStyle = '#1a1438'; c.fillRect(0, 0, w, h); for (let y = 10; y < h; y += 18) { c.strokeStyle = 'rgba(255,190,90,0.5)'; c.lineWidth = 1; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + S(x * 0.08) * 3); c.stroke(); for (let x = 4; x < w; x += 9) { c.fillStyle = r() > 0.4 ? '#ff5a3a' : '#ffc84a'; c.fillRect(x, y + S(x * 0.08) * 3 - 1, 3, 4); } } }
  if (i === 3) { c.fillStyle = '#1a6ab8'; c.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { c.fillStyle = r() > 0.5 ? 'rgba(120,200,255,0.5)' : 'rgba(10,60,140,0.5)'; c.fillRect(r() * w, r() * h, 6, 1); } c.fillStyle = '#e8d08a'; c.beginPath(); c.ellipse(140, 60, 10, 7, 0, 0, 7); c.fill(); c.fillStyle = '#4aa84a'; c.beginPath(); c.ellipse(140, 59, 6, 4, 0, 0, 7); c.fill(); }
}); }
function buildSpace() { const g = G.space = new T3.Group(); scene.add(g); const r = rng(2); const sg = new T3.BufferGeometry(); const pts = []; for (let i = 0; i < 700; i++) pts.push((r() - 0.5) * 30, (r() - 0.5) * 40, -6 - r() * 10); sg.setAttribute('position', new T3.Float32BufferAttribute(pts, 3)); g.add(new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 0.05 })));
  { const nt = ctex(256, 384, (c, w, h) => { c.fillStyle = '#05050f'; c.fillRect(0, 0, w, h); const rr = rng(21); for (let k = 0; k < 26; k++) { const x = rr() * w, y = rr() * h, rad = 40 + rr() * 110; const col = ['90,40,160', '40,80,190', '190,60,140', '30,130,170'][k % 4]; const gr = c.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${col},0.16)`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.fillRect(0, 0, w, h); } for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(255,255,255,${rr() * 0.8})`; c.fillRect(rr() * w, rr() * h, 1, 1); } }); add(g, new T3.PlaneGeometry(30, 45), new T3.MeshBasicMaterial({ map: nt, toneMapped: false }), 0, 0, -14); }
  g.add(new T3.AmbientLight('#6a7ab8', 0.9)); const sun = new T3.DirectionalLight('#fff4e0', 2.4); sun.position.set(-3, 4, 5); g.add(sun);
  const rims = ['#ff9a4a', '#9ae0ff', '#c86aff', '#ffb04a']; R.planets = PL.map(([x, y], i) => { const p = new T3.Group(); p.position.set(x, y, 0); g.add(p); glow(p, rims[i], 2.6, 0, 0, -0.5, 0.55); const ball = add(p, Sp(0.8, 32, 24), SM('#ffffff', { map: planetTex(i), roughness: 0.8, emissive: i === 2 ? '#ffffff' : '#000000', emissiveMap: i === 2 ? planetTex(2) : null, emissiveIntensity: i === 2 ? 0.6 : 0 })); p.userData.ball = ball; return p; });
  // props: rain cloud (1), steam + peaks (2), lantern ring (3), lighthouse (4)
  { const cl = new T3.Group(); R.planets[0].add(cl); for (const [dx, dy] of [[0, 0], [0.18, 0.05], [-0.16, 0.03], [0.07, 0.12]]) add(cl, Sp(0.16, 12, 8), SM('#9aa4b8'), dx, dy, 0); cl.position.set(0.55, 0.75, 0.3); R.cloud = cl; R.rain = []; for (let k = 0; k < 8; k++) R.rain.push(add(cl, Bx(0.012, 0.12, 0.012), BM('#9ac8ff'), -0.2 + k * 0.055, -0.2, 0.1)); }
  { R.steam = []; for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2; const st = glow(R.planets[1], '#ffffff', 0.35, C(a) * 0.6, S(a) * 0.6, 0.6, 0.5); st.userData.a = a; R.steam.push(st); } for (let k = 0; k < 4; k++) { const m = add(R.planets[1].userData.ball, new T3.ConeGeometry(0.12, 0.25, 6), SM('#ffffff')); const a = k * 1.4 + 0.3, b = 0.6 + k * 0.25; m.position.set(C(a) * S(b) * 0.8, C(b) * 0.8, S(a) * S(b) * 0.8); m.lookAt(0, 0, 0); m.rotateX(-PI / 2); } }
  { const ring = new T3.Group(); R.planets[2].add(ring); ring.rotation.set(1.2, 0, 0.3); for (let k = 0; k < 18; k++) { const a = k / 18 * PI * 2; add(ring, Sp(0.045, 8, 6), BM(k % 2 ? '#ff5a3a' : '#ffc84a'), C(a) * 1.0, S(a) * 1.0, 0); } R.ring = ring; }
  { const ball = R.planets[3].userData.ball; const lh = new T3.Group(); ball.add(lh); lh.position.set(0, 0.8, 0.0); add(lh, Cy(0.03, 0.05, 0.25, 8), SM('#ffffff'), 0, 0.12, 0); add(lh, Cy(0.031, 0.031, 0.05, 8), SM('#d83a2a'), 0, 0.12, 0); R.lhGlow = glow(lh, '#ffe88a', 0.25, 0, 0.27, 0, 0.9); R.planets[3].userData.lh = lh; ball.rotation.x = 0.5; }
}

// ---------- 1. library ----------
function buildLibrary() { const g = G.lib = new T3.Group(); g.position.set(100, 0, 0); scene.add(g); const r = rng(5);
  add(g, Bx(6, 0.1, 16), SM('#6a4024', { roughness: 0.8 }), 0, -0.05, 0); add(g, Bx(6, 0.1, 16), SM('#3a2414'), 0, 5.05, 0); add(g, Bx(6, 5, 0.2), SM('#4a3020'), 0, 2.5, -8); add(g, Bx(6, 5, 0.2), SM('#4a3020'), 0, 2.5, 8);
  add(g, Bx(2.4, 0.02, 12), SM('#8a2a2a', { roughness: 1 }), 0, 0.01, 0); // rug runner
  const cols = ['#c8402a', '#2a6ab8', '#e8b83a', '#3a9a5a', '#8a3ab8', '#e8e0c8', '#d8783a', '#2a3a6a']; const geo = Bx(1, 1, 1); const N = 2400; const mats = cols.map(c => SM(c, { roughness: 0.75 }));
  const inst = mats.map(m => new T3.InstancedMesh(geo, m, N / cols.length)); const cnt = cols.map(() => 0); const M = new T3.Matrix4();
  for (const sx of [-1, 1]) { add(g, Bx(0.7, 5, 15), SM('#5a3418'), sx * 2.7, 2.5, 0); for (let lv = 0; lv < 6; lv++) { const y = 0.25 + lv * 0.8; add(g, Bx(0.75, 0.06, 15), SM('#3a2210'), sx * 2.55, y, 0); let z = -7.4; while (z < 7.4) { const bw = 0.06 + r() * 0.07, bh = 0.5 + r() * 0.2; const ci = Math.floor(r() * cols.length); if (cnt[ci] < N / cols.length) { M.compose(new T3.Vector3(sx * 2.45, y + 0.03 + bh / 2, z), new T3.Quaternion(), new T3.Vector3(0.45, bh, bw)); inst[ci].setMatrixAt(cnt[ci]++, M); } z += bw + 0.01; } } }
  inst.forEach((m, i) => { m.count = cnt[i]; g.add(m); });
  // rainy window + fireplace at the end
  R.rainT = ctex(128, 192, () => {}); add(g, new T3.PlaneGeometry(2.2, 3.0), new T3.MeshBasicMaterial({ map: R.rainT, toneMapped: false }), 0, 2.6, -7.88); for (const x of [-0.37, 0.37]) add(g, Bx(0.06, 3.0, 0.06), SM('#2a1a10'), x, 2.6, -7.85); add(g, Bx(2.2, 0.06, 0.06), SM('#2a1a10'), 0, 2.6, -7.85);
  add(g, Bx(1.6, 1.3, 0.6), SM('#7a5a4a'), 2.0, 0.65, -6.5).rotation.y = -0.5; R.fire = add(g, new T3.PlaneGeometry(0.8, 0.6), BM('#ff8a2a'), 1.82, 0.5, -6.15); R.fire.rotation.y = -0.5; R.fireL = new T3.PointLight('#ff8a3a', 8, 6, 1.5); R.fireL.position.set(1.5, 0.8, -5.8); g.add(R.fireL);
  add(g, Bx(0.9, 0.45, 0.9), SM('#8a2a2a'), -0.6, 0.25, -5.6); add(g, Bx(0.9, 0.9, 0.2), SM('#8a2a2a'), -0.6, 0.6, -6.0); // armchair
  { const t = ctex(256, 64, (c) => { c.fillStyle = '#2a1a10'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#e8c86a'; c.font = '30px PressStart'; c.textAlign = 'center'; c.fillText('SILENCE', 128, 46); }); R.sign = add(g, new T3.PlaneGeometry(1.4, 0.35), new T3.MeshBasicMaterial({ map: t }), 0, 4.5, -7.85); }
  for (const z of [-5, -1, 3]) { add(g, Sp(0.18, 12, 8), BM('#ffd27a'), 0, 4.2, z); const l = new T3.PointLight('#ffb84a', 7, 7, 1.4); l.position.set(0, 4.0, z); g.add(l); glow(g, '#ffb84a', 1.2, 0, 4.2, z, 0.6); }
  R.reader = human({ top: '#6a3a2a', bot: '#3a3a4a', hair: '#3a2214', skin: '#e0b090', hood: true }); R.reader.position.set(-0.6, -0.4, -5.75); sitPose(R.reader); g.add(R.reader); { const u = R.reader.userData; u.armL.rotation.set(-1.0, 0, 0.15); u.armR.rotation.set(-1.0, 0, -0.15); u.armL.userData.e.rotation.x = -0.9; u.armR.userData.e.rotation.x = -0.9; u.head.rotation.x = 0.3; R.book = add(u.up, Bx(0.26, 0.2, 0.04), SM('#2a5a9a'), 0, 0.28, 0.36); R.book.rotation.x = -0.6; }
  g.add(new T3.HemisphereLight('#ffd8a8', '#3a2010', 0.6)); const key = new T3.DirectionalLight('#ffc890', 0.8); key.position.set(102, 6, 2); key.target.position.set(100, 0, -5); scene.add(key.target); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); g.parent.add(key); }

// ---------- 2. hot springs ----------
function buildSprings() { const g = G.spr = new T3.Group(); g.position.set(200, 0, 0); scene.add(g); skyBall(g, '#7aa8e8', '#f0c8d8', '#ffffff');
  const gg = new T3.PlaneGeometry(40, 40, 40, 40); const p = gg.attributes.position; const r = rng(3); for (let i = 0; i < p.count; i++) p.setZ(i, r() * 0.2); gg.computeVertexNormals(); const gr = add(g, gg, SM('#f4f8fc', { roughness: 0.9 })); gr.rotation.x = -PI / 2;
  for (let k = 0; k < 7; k++) { const x = -14 + k * 5, z = -16 - (k % 3) * 3; add(g, new T3.ConeGeometry(4 + (k % 3), 8 + (k % 4) * 2, 7), SM('#8a9ab8'), x, 3.5, z); add(g, new T3.ConeGeometry(2 + (k % 3) * 0.5, 4, 7), SM('#ffffff'), x, 6 + (k % 4), z); }
  R.pools = []; for (const [x, z, s] of [[0, -2, 2.2], [-3.5, -5, 1.5], [3.2, -6, 1.7], [-1.5, -9, 1.3]]) { const m = add(g, new T3.CircleGeometry(s, 24), SM('#3ac8d8', { emissive: '#1a8a9a', emissiveIntensity: 0.5, roughness: 0.15 }), x, 0.12, z); m.rotation.x = -PI / 2; for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2; add(g, new T3.DodecahedronGeometry(0.35 + (k % 3) * 0.1), SM('#6a6a72'), x + C(a) * s, 0.15, z + S(a) * s); } R.pools.push([x, z, s]); }
  R.steamS = []; for (let k = 0; k < 30; k++) { const pl = R.pools[k % 4]; const s_ = glow(g, '#ffffff', 1.4, pl[0], 0.5, pl[1], 0.3); s_.userData = { pl, ph: k * 0.37, dx: (rng(k)() - 0.5) * pl[2] }; R.steamS.push(s_); }
  const bowl = new T3.Group(); bowl.position.set(1.6, 0.42, -0.4); g.add(bowl); add(bowl, Cy(0.28, 0.16, 0.22, 16), SM('#c83a2a'), 0, 0, 0); add(bowl, Cy(0.26, 0.26, 0.02, 16), SM('#f4d06a'), 0, 0.1, 0); add(bowl, Sp(0.07, 8, 6), SM('#fff8e8'), 0.08, 0.13, 0.05); for (const dz of [-0.03, 0.03]) add(bowl, Cy(0.01, 0.01, 0.6, 5), SM('#d8b878'), 0.1, 0.25, dz).rotation.z = 1.0;
  const sg = new T3.BufferGeometry(); const sp = []; for (let i = 0; i < 600; i++) sp.push((r() - 0.5) * 20, r() * 8, -r() * 14 + 4); sg.setAttribute('position', new T3.Float32BufferAttribute(sp, 3)); R.snow = new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 0.08 })); g.add(R.snow); R.snow0 = sp.slice();
  for (let k = 0; k < 26; k++) { const a = rng(k + 50); const x = (a() - 0.5) * 26, z = -4 - a() * 12; if (Math.abs(x) < 5 && z > -11) continue; const t_ = new T3.Group(); t_.position.set(x, 0, z); g.add(t_); add(t_, Cy(0.12, 0.15, 0.8, 8), SM('#4a3020'), 0, 0.4, 0); for (let j = 0; j < 3; j++) { add(t_, new T3.ConeGeometry(1.0 - j * 0.25, 1.3, 9), SM('#24543a'), 0, 1.1 + j * 0.75, 0); add(t_, new T3.ConeGeometry(0.75 - j * 0.2, 0.5, 9), SM('#f4f8fc'), 0, 1.6 + j * 0.75, 0); } }
  R.soaker = human({ top: '#e8e0d0', skin: '#c89070', hair: '#1a1210', short: true }); R.soaker.position.set(-0.9, -0.82, -2.6); R.soaker.rotation.y = 0.5; g.add(R.soaker); { const u = R.soaker.userData; u.armL.rotation.set(0, 0, 1.2); u.armR.rotation.set(0, 0, -1.2); u.head.rotation.x = -0.15; add(u.head, Bx(0.18, 0.05, 0.14), SM('#ffffff'), 0, 0.12, 0); }
  g.add(new T3.HemisphereLight('#c8dcff', '#e8e0f0', 1.2)); const sun = new T3.DirectionalLight('#ffe0c8', 1.6); sun.position.set(205, 8, 4); sun.target.position.set(200, 0, -3); g.parent.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); { const c_ = sun.shadow.camera; c_.left = c_.bottom = -12; c_.right = c_.top = 12; c_.near = 0.5; c_.far = 60; } sun.shadow.bias = -0.0005; g.add(sun); sun.position.set(5, 8, 4); sun.target.position.set(200, 0, -3); }

// ---------- 3. night market ----------
function buildMarket() { const g = G.mkt = new T3.Group(); g.position.set(300, 0, 0); scene.add(g); skyBall(g, '#0a0a24', '#1a1438', '#3a1a3a'); add(g, Sp(1.2, 16, 12), BM('#fff4d8'), 6, 14, -40); glow(g, '#fff4d8', 8, 6, 14, -39.5, 0.5);
  add(g, Bx(8, 0.1, 40), SM('#2a2a34', { roughness: 0.6, metalness: 0.2 }), 0, -0.05, -10); const r = rng(8);
  const aw = ['#d83a3a', '#e8b83a', '#3a8ad8', '#3aa85a', '#d85ab8']; for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) { const z = 2 - k * 3.2; const col = aw[(k + (sx > 0 ? 2 : 0)) % 5]; const st = new T3.Group(); st.position.set(sx * 3.0, 0, z); g.add(st);
    add(st, Bx(1.6, 1.0, 2.4), SM('#5a3a2a'), 0, 0.5, 0); add(st, Bx(1.8, 0.1, 2.8), SM(col, { emissive: col, emissiveIntensity: 0.25 }), -sx * 0.2, 2.3, 0).rotation.z = sx * 0.25; for (const dz of [-1.2, 1.2]) add(st, Cy(0.05, 0.05, 2.2, 6), SM('#2a1a10'), -sx * 0.7, 1.1, dz);
    add(st, Bx(1.2, 0.08, 2.0), BM('#ffd890'), -sx * 0.1, 1.05, 0); for (let f = 0; f < 4; f++) add(st, Sp(0.12, 8, 6), SM(['#e8a03a', '#d8402a', '#f4e0a0', '#8a5a2a'][f]), -sx * 0.2, 1.15, -0.8 + f * 0.5);
    const l = new T3.PointLight('#ffb070', 3, 4, 1.5); l.position.set(-sx * 0.6, 1.8, 0); st.add(l);
    const sgn = ctex(128, 48, (c) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, 128, 48); c.fillStyle = col; c.font = '18px PressStart'; c.textAlign = 'center'; c.fillText(['NOODLE', 'DUMPLING', 'TAKOYAKI', 'SKEWER', 'MOCHI'][(k + 3) % 5], 64, 32); }); const sm = add(st, new T3.PlaneGeometry(1.4, 0.5), new T3.MeshBasicMaterial({ map: sgn, toneMapped: false }), -sx * 0.82, 2.65, 0); sm.rotation.y = -sx * PI / 2; }
  R.lanterns = []; for (let k = 0; k < 10; k++) { const z = 1 - k * 3; for (let j = 0; j <= 8; j++) { const x = -3 + j * 0.75, y = 3.6 - S(j / 8 * PI) * 0.6; const ln = add(g, Sp(0.14, 10, 8), BM(j % 2 ? '#ff4a2a' : '#ffb83a'), x, y, z); R.lanterns.push(ln); if (j % 3 === 1) glow(g, j % 2 ? '#ff6a3a' : '#ffc84a', 0.9, x, y, z, 0.5); } }
  R.clockT = ctex(256, 96, () => {}); const clk = new T3.Group(); clk.position.set(-1.6, 0, -6.6); g.add(clk); add(clk, Cy(0.06, 0.06, 3.4, 8), SM('#2a2a2e'), 0, 1.7, 0); add(clk, Bx(1.2, 0.5, 0.15), SM('#1a1a1a'), 0, 3.5, 0); add(clk, new T3.PlaneGeometry(1.1, 0.42), new T3.MeshBasicMaterial({ map: R.clockT, toneMapped: false }), 0, 3.5, 0.08);
  for (const sx of [-1, 1]) for (let k = 0; k < 12; k++) { const z = 3 - k * 3, h = 4 + ((k * 7 + (sx > 0 ? 3 : 0)) % 5) * 1.3; const wt_ = ctex(64, 128, (c) => { c.fillStyle = '#1a1424'; c.fillRect(0, 0, 64, 128); const rr = rng(k * 9 + sx + 30); for (let y = 6; y < 124; y += 14) for (let x = 6; x < 60; x += 14) { c.fillStyle = rr() > 0.45 ? ['#ffcc7a', '#ff9a5a', '#9ad0ff'][Math.floor(rr() * 3)] : '#0e0a16'; c.fillRect(x, y, 8, 9); } }); add(g, Bx(3, h, 2.8), new T3.MeshStandardMaterial({ color: '#ffffff', map: wt_, emissive: '#ffffff', emissiveMap: wt_, emissiveIntensity: 0.6 }), sx * 6.0, h / 2, z); }
  { const sg = new T3.BufferGeometry(); const sp = []; const rr = rng(77); for (let i = 0; i < 400; i++) sp.push((rr() - 0.5) * 80, 10 + rr() * 30, -30 - rr() * 20); sg.setAttribute('position', new T3.Float32BufferAttribute(sp, 3)); g.add(new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 0.15 }))); }
  R.vendors = [[-1, 0], [1, 1], [-1, 2]].map(([sx, k], i) => { const v = human({ top: ['#d84a3a', '#3a6ab8', '#e8a83a'][i], bot: '#2a2a32', skin: ['#e0b090', '#a87050', '#d8a078'][i], hair: ['#1a1010', '#3a2a1a', '#e8e0d0'][i], grin: true, beanie: i === 1 ? '#2a2a2a' : null }); v.position.set(sx * 3.55, 0, 2 - k * 3.2); v.rotation.y = -sx * PI / 2; g.add(v); v.userData.sx = sx; return v; });
  g.add(new T3.HemisphereLight('#4a3a8a', '#1a1018', 0.7)); }
function drawClock(s_) { const c = R.clockT.userData.g; c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#ff3a2a'; c.font = '44px PressStart'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s_, 128, 52); R.clockT.needsUpdate = true; }

// ---------- 4. lighthouse island ----------
function buildIsland() { const g = G.isl = new T3.Group(); g.position.set(400, 0, 0); scene.add(g); skyBall(g, '#3a3a8a', '#e86a6a', '#ffc86a', 90);
  add(g, Sp(4, 24, 16), BM('#ffd27a'), -10, 6, -70); glow(g, '#ffb04a', 30, -10, 6, -69, 0.6);
  R.seaT = ctex(256, 256, (c, w, h) => { c.fillStyle = '#2a5aa8'; c.fillRect(0, 0, w, h); const r = rng(4); for (let k = 0; k < 500; k++) { c.fillStyle = r() > 0.5 ? 'rgba(140,200,255,0.45)' : 'rgba(255,180,140,0.35)'; c.fillRect(r() * w, r() * h, 8 + r() * 10, 2); } }); R.seaT.wrapS = R.seaT.wrapT = T3.RepeatWrapping; R.seaT.repeat.set(30, 30);
  const sea = add(g, new T3.PlaneGeometry(300, 300), SM('#ffffff', { map: R.seaT, roughness: 0.3, metalness: 0.2 }), 0, 0, 0); sea.rotation.x = -PI / 2;
  add(g, Cy(3.2, 3.8, 0.6, 24), SM('#e8d08a'), 0, 0.1, 0); add(g, Cy(2.4, 3.0, 0.5, 20), SM('#5aa84a'), -0.3, 0.55, -0.3);
  const lh = new T3.Group(); lh.position.set(-1.0, 0.8, -1.0); g.add(lh); for (let k = 0; k < 5; k++) add(lh, Cy(0.42 - k * 0.04, 0.46 - k * 0.04, 0.8, 16), SM(k % 2 ? '#d83a2a' : '#f4f4f0'), 0, 0.4 + k * 0.8, 0); add(lh, Cy(0.32, 0.32, 0.5, 12), BM('#ffe88a'), 0, 4.3, 0); add(lh, new T3.ConeGeometry(0.4, 0.5, 12), SM('#2a2a2e'), 0, 4.8, 0); glow(lh, '#ffe88a', 2.5, 0, 4.3, 0, 0.8);
  R.beam = add(lh, new T3.ConeGeometry(0.9, 12, 16, 1, true), new T3.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0.12, depthWrite: false, side: T3.DoubleSide, toneMapped: false, blending: T3.AdditiveBlending }), 0, 4.3, 0); R.beam.geometry.translate(0, -6, 0); R.beam.rotation.z = PI / 2;
  add(g, Bx(1.2, 0.9, 1.0), SM('#f0e8d8'), 1.0, 1.25, -1.0); add(g, new T3.ConeGeometry(0.95, 0.6, 4), SM('#3a6ab8'), 1.0, 2.0, -1.0).rotation.y = PI / 4; add(g, Bx(0.3, 0.3, 0.05), BM('#ffd890'), 1.0, 1.35, -0.48);
  // dog
  const dog = R.dog = new T3.Group(); dog.position.set(0.6, 0.8, 1.2); dog.rotation.y = 0.5; g.add(dog); const fur = SM('#c88a4a'); add(dog, Bx(0.5, 0.25, 0.25), fur, 0, 0.3, 0); add(dog, Bx(0.22, 0.22, 0.22), fur, 0.3, 0.48, 0); add(dog, Bx(0.1, 0.08, 0.12), SM('#e8c8a0'), 0.44, 0.44, 0); add(dog, Bx(0.04, 0.04, 0.04), SM('#111'), 0.5, 0.47, 0);
  for (const dz of [-0.08, 0.08]) { add(dog, Bx(0.06, 0.12, 0.05), SM('#7a4a2a'), 0.28, 0.62, dz); add(dog, Sp(0.02, 6, 4), SM('#111'), 0.4, 0.53, dz * 0.8); } for (const [dx, dz] of [[-0.18, -0.08], [-0.18, 0.08], [0.18, -0.08], [0.18, 0.08]]) add(dog, Bx(0.07, 0.2, 0.07), fur, dx, 0.1, dz); R.tail = add(dog, Bx(0.2, 0.05, 0.05), fur, -0.33, 0.42, 0);
  for (const [x, z, s_] of [[-40, -70, 6], [30, -80, 9], [70, -60, 5], [-75, -50, 7]]) add(g, Sp(s_, 16, 10), SM('#3a3a5a'), x, -s_ * 0.6, z).scale.set(1.6, 0.6, 1);
  for (const [x, y, z, s_] of [[-25, 18, -70, 6], [20, 22, -80, 8], [45, 14, -65, 5], [-50, 25, -60, 7]]) { const cl = new T3.Group(); cl.position.set(x, y, z); g.add(cl); for (let k = 0; k < 5; k++) add(cl, Sp(s_ * (0.5 + (k % 2) * 0.3), 12, 8), SM('#ffb8a8', { emissive: '#ff9a7a', emissiveIntensity: 0.3 }), (k - 2) * s_ * 0.55, (k % 2) * s_ * 0.2, 0).scale.y = 0.55; }
  R.islander = human({ top: '#3a6a5a', bot: '#2a2a3a', skin: '#d8a888', hair: '#5a3a1a', hood: true }); R.islander.position.set(-0.5, -0.08, 0.9); R.islander.rotation.y = PI + 0.6; sitPose(R.islander); g.add(R.islander); { const u = R.islander.userData; u.armL.rotation.set(-0.5, 0, 0.3); u.armR.rotation.set(-0.5, 0, -0.3); u.armL.userData.e.rotation.x = -0.6; u.armR.userData.e.rotation.x = -0.6; }
  g.add(new T3.HemisphereLight('#ffb8a0', '#3a3a6a', 1.0)); const sun = new T3.DirectionalLight('#ffc890', 2.2); sun.position.set(-10, 6, -20); sun.target.position.set(400, 0, 0); scene.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); { const c_ = sun.shadow.camera; c_.left = c_.bottom = -12; c_.right = c_.top = 12; c_.near = 0.5; c_.far = 60; } sun.shadow.bias = -0.0005; g.add(sun); }

// ---------- timing + shots ----------
const E = { live: AT(0, 'you'), every0: AT(0, 'and'), p1: CL[1].start, lib: AT(1, 'the'), c1: CL[2].start, whisper: AT(2, 'you'), p2: CL[3].start, snowy: AT(3, 'snowy'), ramen: AT(3, 'free'), c2: CL[4].start, step: AT(4, 'the', 1), minus: AT(4, "it's"),
  like: CL[5].start, follow5: AT(5, 'follow'), omen: CL[6].start, bad: AT(6, 'bad'), p3: CL[7].start, nightm: AT(7, 'a'), c3: CL[8].start, twoam: AT(8, "it's"), sun3: AT(8, 'the', 1), smile: AT(8, 'and'), p4: CL[9].start, island: AT(9, 'your'), dog: AT(9, 'and'), c4: CL[10].start, human: AT(10, "you're"), end: CL[11].start, cmt: AT(11, 'comment') };
E.loop = TM.total - 0.4;
const zoomTo = (i, k) => { const [x, y] = PL[i]; return [L3([0, 0, 7.6], [x, y, 2.0], ease(k)), L3([0, 0, 0], [x, y, 0], ease(k))]; };
const SH = [
  [0, 'space', (k, T) => look([0, 0, 7.6], [0, 0, 0])],
  [E.p1, 'space', (k, T) => { const [p, l] = zoomTo(0, prog(T, E.p1, E.lib)); look(p, l); }],
  [E.lib - 0.05, 'lib', (k, T) => look([100, 1.6, lerp(6.5, -1.2, k)], [100, 1.5, -8])],
  [E.c1 - 0.1, 'lib', (k, T) => look([100.3, 1.25, lerp(-3.4, -4.0, k)], [99.4, 0.95, -5.75])],
  [E.p2, 'space', (k, T) => { const [p, l] = zoomTo(1, prog(T, E.p2, E.snowy)); look(p, l); }],
  [E.snowy - 0.05, 'spr', (k, T) => look([200 + lerp(-2, 1, k), 1.6, 6], [200, 0.8, -4])],
  [E.ramen - 0.1, 'spr', (k, T) => look([202.0, 0.95, 0.55], [201.55, 0.42, -0.45])],
  [E.c2 - 0.1, 'spr', (k, T) => look([200 + S(T * 40) * (T > E.minus ? 0.04 : 0), 1.4, 5], [200, 1.0, -4])],
  [E.like - 0.1, 'space', (k, T) => look(L3([0, 0, 7.6], [0, 0, 6.8], k), [0, 0, 0])],
  [E.omen, 'space', (k, T) => { const [p, l] = zoomTo(2, 0.75 * ease(prog(T, E.omen, E.nightm))); look(p, l); }],
  [E.nightm - 0.05, 'mkt', (k, T) => look([300, 1.7, lerp(4, -10, k)], [300, 1.9, -25])],
  [E.c3 - 0.1, 'mkt', (k, T) => look([299.9, 3.0, -3.6], L3([298.4, 3.4, -6.6], [302, 9, -35], ease(prog(T, E.sun3 - 0.1, E.sun3 + 0.8))))],
  [E.smile - 0.1, 'mkt', (k, T) => look(L3([301.6, 1.65, -0.4], [302.4, 1.66, -0.9], ease(k)), [303.55, 1.66, -1.2])],
  [E.p4, 'space', (k, T) => { const [p, l] = zoomTo(3, prog(T, E.p4, E.island)); look(p, l); }],
  [E.island - 0.05, 'isl', (k, T) => { const a = lerp(0.6, 1.4, k); look([400 + C(a) * 9, 3.2, S(a) * 9], [399.8, 1.8, 0]); }],
  [E.dog - 0.1, 'isl', (k, T) => look([401.9, 1.5, 3.6], [400.5, 0.9, 1.2])],
  [E.c4 - 0.1, 'isl', (k, T) => { const kk = ease(prog(T, E.human - 0.2, E.human + 1.4)); look([400 + lerp(2, 10, kk), lerp(2.5, 60, kk), lerp(6, 25, kk)], [400, 0.5, 0]); }],
  [E.end, 'space', (k, T) => look(L3([0, 0, 6.8], [0, 0, 7.6], ease(k)), [0, 0, 0])],
  [E.loop, 'space', (k, T) => look([0, 0, 7.6], [0, 0, 0])] ];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function anim(T) { const ci = CLI(T);
  R.planets.forEach((p, i) => { p.userData.ball.rotation.y = T * (0.25 + i * 0.05); p.position.y = PL[i][1] + S(T * 1.2 + i) * 0.04; });
  R.cloud.position.set(C(T * 0.8) * 0.75, 0.55 + S(T * 0.8) * 0.2, 0.5); R.rain.forEach((d, k) => d.position.y = -0.2 - ((T * 2 + k * 0.13) % 0.3)); R.steam.forEach((s_, k) => { const q = (T * 0.5 + k / 6) % 1; s_.position.set(C(s_.userData.a) * (0.65 + q * 0.3), S(s_.userData.a) * (0.65 + q * 0.3), 0.6); s_.material.opacity = 0.5 * S(q * PI); }); R.ring.rotation.z = T * 0.4; R.lhGlow.material.opacity = 0.5 + 0.4 * S(T * 4);
  { const c = R.rainT.userData.g; c.fillStyle = '#2a3a5a'; c.fillRect(0, 0, 128, 192); c.fillStyle = 'rgba(160,200,255,0.6)'; const r = rng(Math.floor(T * 12)); for (let k = 0; k < 40; k++) c.fillRect(r() * 128, r() * 192, 1, 6 + r() * 8); c.fillStyle = 'rgba(200,220,255,0.35)'; for (let k = 0; k < 14; k++) { c.beginPath(); c.arc(r() * 128, r() * 192, 1.5, 0, 7); c.fill(); } R.rainT.needsUpdate = true; }
  R.fireL.intensity = 7 + S(T * 13) * 1.5 + S(T * 31) * 1; R.fire.material.color.setHSL(0.07 + S(T * 9) * 0.01, 1, 0.55);
  // reader: turns a page; in the catch, finger to lips
  { const u = R.reader.userData; const shh = 0; u.armR.rotation.set(lerp(-1.0, -2.2, shh), 0, lerp(-0.15, 0.25, shh)); u.armR.userData.e.rotation.x = lerp(-0.9, -1.9, shh); u.head.rotation.set(lerp(0.3, -0.05, shh), 0, 0); R.book.visible = shh < 0.5; }
  const bliz = ci === 4 ? ease(prog(T, E.minus - 0.2, E.minus + 0.4)) : 0; R.steamS.forEach((s_) => { const q = (T * 0.35 + s_.userData.ph) % 1; const [x, z] = s_.userData.pl; s_.position.set(x + s_.userData.dx + q * bliz * 3, 0.4 + q * 2.5, z); s_.material.opacity = 0.35 * S(q * PI); s_.scale.setScalar(1 + q * 1.5); });
  { const p = R.snow.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const sp = 0.6 + bliz * 4; p.setY(i, ((R.snow0[i * 3 + 1] - T * sp) % 8 + 8) % 8); p.setX(i, R.snow0[i * 3] + S(T + i) * 0.3 + ((T * bliz * 6) % 20) - (bliz ? 10 : 0)); } p.needsUpdate = true; R.snow.material.size = 0.08 + bliz * 0.06; }
  R.soaker.userData.head.rotation.y = bliz ? S(T * 30) * 0.05 : 0;
  drawClock(ci === 8 && T < E.twoam ? '1.59 AM' : '2.00 AM'); R.lanterns.forEach((l, k) => l.scale.setScalar(1 + S(T * 3 + k) * 0.08));
  // vendors: busy until the catch, then all turn and stare with the same smile
  const stare = ci === 8 && T > E.smile - 0.2 || ci === 11 && false; R.vendors.forEach((v, i) => { const u = v.userData; u.head.rotation.set(stare ? -0.06 : 0, stare ? 0 : S(T * 1.3 + i) * 0.2, 0); u.armR.rotation.x = stare ? 0 : -0.8 + S(T * 4 + i) * 0.25; u.armL.rotation.x = stare ? 0 : -0.7; u.armR.userData.e.rotation.x = stare ? 0 : -0.5; });
  R.seaT.offset.set(T * 0.02, T * 0.01); R.beam.rotation.y = T * 1.2; R.tail.rotation.y = S(T * 14) * 0.6; R.islander.userData.head.rotation.y = S(T * 0.5) * 0.15; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); anim(T); for (const k in G) G[k].visible = k === sh[1]; scene.background = new T3.Color(sh[1] === 'space' ? '#05050c' : '#000000'); sh[2](prog(T, t0, t1), T); return { si, t0, place: sh[1] }; }

// ---------- pixel text ----------
function ptxt(s_, x, y, size, col = '#fff', align = 'center') { octx.save(); octx.font = `${size}px PressStart`; octx.textAlign = align; octx.textBaseline = 'middle'; const sh = Math.max(3, Math.round(size / 7)); octx.fillStyle = '#000'; for (const [dx, dy] of [[sh, sh], [-sh / 2, sh], [sh, -sh / 2], [0, sh]]) octx.fillText(s_, x + dx, y + dy); octx.fillStyle = col; octx.fillText(s_, x, y); octx.restore(); }
function pwrap(s_, y, size, col, maxW = 640) { octx.font = `${size}px PressStart`; const words = s_.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (octx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur); lines.forEach((l, i) => ptxt(l, 360, y + i * size * 1.45, size, col)); }
const SEQ = [[['minus', 'thirty'], 'minus 30']];
const CAPS = []; CL.forEach(c0 => { const ws = []; for (let i = 0; i < c0.words.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => c0.words[i + k] && c0.words[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { ws.push({ w: hit[1], a: c0.words[i].a, b: c0.words[i + hit[0] - 1].b }); i += hit[0] - 1; } else ws.push(c0.words[i]); }
  let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; }; ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.25 || (/^[A-Z]/.test(w.w) && !/^(A\.|I)$/.test(w.w)))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.4) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function likePill(T) { if (T < E.like - 0.1 || T > E.omen - 0.15) return; const k = prog(T, E.like - 0.1, E.like + 0.1); octx.save(); octx.globalAlpha = k; octx.fillStyle = '#000'; octx.fillRect(150, 1000, 420, 84); octx.fillStyle = '#ff5a6a'; octx.fillRect(158, 1008, 180, 68); octx.fillStyle = T > E.follow5 + 0.2 ? '#5ad88a' : '#ffd25a'; octx.fillRect(346, 1008, 216, 68); octx.restore(); octx.save(); octx.globalAlpha = k; ptxt('LIKE', 248, 1043, 26, '#fff'); ptxt(T > E.follow5 + 0.2 ? 'DONE' : 'FOLLOW', 454, 1043, 24, '#111'); octx.restore(); }
window.initFootball = async function () { await document.fonts.load('30px PressStart');
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH; renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(50, RW / RH, 0.05, 400); scene.add(camera); buildSpace(); buildLibrary(); buildSprings(); buildMarket(); buildIsland(); scene.fog = null;
  out = document.getElementById('c'); octx = out.getContext('2d'); };
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0, place } = shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over'; octx.drawImage(glc, 0, 0, W, H);
  // soft bloom from a tiny copy, still pixel-sized
  octx.save(); octx.globalCompositeOperation = 'screen'; octx.globalAlpha = 0.25; octx.imageSmoothingEnabled = true; octx.filter = 'blur(10px) brightness(1.2)'; octx.drawImage(glc, 0, 0, W, H); octx.restore();
  // scene-change blink (two pixel frames of white)
  if (si > 0 && T - t0 < 0.08 && place !== SH[si - 1][1]) { octx.fillStyle = 'rgba(255,255,255,0.6)'; octx.fillRect(0, 0, W, H); }
  // frost vignette on the blizzard
  if (ci === 4 && T > E.minus - 0.2) { const k = prog(T, E.minus - 0.2, E.minus + 0.4); const vg = octx.createRadialGradient(360, 640, 250, 360, 640, 760); vg.addColorStop(0, 'rgba(200,230,255,0)'); vg.addColorStop(1, `rgba(220,240,255,${0.75 * k})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  // planet 3 omen: darken + red edge
  if (ci === 6 || (ci === 7 && T < E.nightm)) { const k = ci === 6 ? prog(T, E.omen, E.omen + 1.2) : 1; octx.save(); octx.fillStyle = `rgba(0,0,0,${0.35 * k})`; octx.fillRect(0, 0, W, H); const vg = octx.createRadialGradient(360, 640, 200, 360, 640, 760); vg.addColorStop(0, 'rgba(120,0,0,0)'); vg.addColorStop(1, `rgba(140,0,0,${0.6 * k})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); octx.restore(); }
  if (place === 'space') { const gridView = ci === 0 || ci === 5 || ci === 11 || loop; if (gridView) ['01', '02', '03', '04'].forEach((n, i) => { const x = i % 2 ? 540 : 180, y = i < 2 ? 655 : 1080; ptxt(n, x, y, 30, '#fff'); }); }
  const cap = CAPS.find(c => T >= c.a && T < c.b);
  if (ci === 0 || loop) { pwrap('Pick a planet.', 190, 40, '#fff'); if (T > E.live - 0.1 || loop) { ptxt('You have to live there', 360, 270, 26, '#ffd25a'); ptxt('for a year.', 360, 315, 26, '#ffd25a'); } if (!loop && T > E.every0 - 0.1) ptxt('Every planet has a catch.', 360, 380, 22, '#ff6a5a'); }
  else if (cap && ci !== 6) pwrap(cap.txt, 250, 34, '#fff');
  const VER = { 1: ['GOOD CHOICE', '#5ad88a'], 3: ['NOT BAD', '#ffd25a'], 9: ['ALRIGHT', '#7ad0ff'] };
  const stamp = (txt_, col, t0_, fg = '#111') => { const k = T - t0_; const sc = k < 0.08 ? 1.5 : k < 0.16 ? 1.15 : 1; octx.save(); octx.translate(360, 560); octx.rotate(-0.08); octx.scale(sc, sc); octx.fillStyle = '#000'; octx.fillRect(-300, -62, 600, 124); octx.fillStyle = col; octx.fillRect(-292, -54, 584, 108); octx.restore(); octx.save(); octx.translate(360, 560); octx.rotate(-0.08); octx.scale(sc, sc); ptxt(txt_, 0, 4, txt_.length > 9 ? 40 : 46, fg); octx.restore(); };
  if (VER[ci] && !loop && T < AT(ci, 'planet') + 0.35) stamp(VER[ci][0], VER[ci][1], CL[ci].start);
  if ((ci === 6 && T > E.bad - 0.05) || (ci === 7 && T < AT(7, 'three') + 0.3)) stamp('BAD CHOICE', '#5a0a0a', E.bad - 0.05, '#ff3a2a');
  const nameAt = (n) => ptxt(n, 360, 1120, 30, '#ffd25a');
  if (ci === 1 && T > E.lib) nameAt('LIBRARY PLANET'); if (ci === 3) nameAt('HOT SPRING PLANET'); if (ci === 7) nameAt('NIGHT MARKET PLANET'); if (ci === 9) nameAt('LIGHTHOUSE PLANET');
  const catchAt = (a, b, t_, col = '#fff') => { ptxt('THE CATCH?', 360, 1040, 34, '#ff5a4a'); if (T > t_) { ptxt(a, 360, 1110, 26, '#fff'); if (b) ptxt(b, 360, 1160, 26, col); } };
  if (ci === 2) catchAt('WHISPER ONLY.', 'ALL YEAR.', E.whisper); if (ci === 4) catchAt('OUT OF THE WATER', '= MINUS 30.', E.step); if (ci === 8) catchAt('ALWAYS 2 AM. NO SUNRISE.', T > E.smile - 0.1 ? 'THEY NEVER STOP SMILING.' : '', E.twoam, '#ff5a4a'); if (ci === 10) catchAt("YOU'RE THE ONLY", 'HUMAN THERE.', E.human);
  if (ci === 11 && !loop && T > E.cmt - 0.1) { ptxt('COMMENT', 360, 860, 34, '#fff'); ptxt('1 . 2 . 3 . OR 4', 360, 920, 30, '#ffd25a'); }
  likePill(T); };
})();
