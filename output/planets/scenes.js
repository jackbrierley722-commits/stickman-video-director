// Pick a planet — four low-poly worlds, multiple cuts each, higher-res render (540x960, antialiased, smooth upscale).
(() => {
const { T3, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, person, run, idle, cheer } = window.W3;
const RW = 540, RH = 960;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos, PI = Math.PI;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);
let renderer, camera, scene, glc, out, octx, small, sctx;

// ---------- helpers ----------
const L = (c, o = {}) => new T3.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const Ph = (c, o = {}) => new T3.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 90, specular: '#ffffff' }, o));
const Bm = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c }, o));
function add(parent, geo, mat, x = 0, y = 0, z = 0) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d);
function ctex(w, h, draw, nearest = false) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); if (nearest) { t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; } t.colorSpace = T3.SRGBColorSpace; t.wrapS = t.wrapT = T3.RepeatWrapping; t.userData = { c, g }; return t; }
let GLOW;
function glow(parent, color, size, x, y, z, op = 0.8) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false, fog: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); return s; }
function sky(parent, stops, r = 600) { const g = new T3.SphereGeometry(r, 32, 20); const col = []; const p = g.attributes.position; const c = new T3.Color();
  for (let i = 0; i < p.count; i++) { const v = p.getY(i) / r; let a = stops[0], b = stops[stops.length - 1], k = 0; for (let j = 0; j < stops.length - 1; j++) if (v >= stops[j][0] && v <= stops[j + 1][0]) { a = stops[j]; b = stops[j + 1]; k = (v - a[0]) / (b[0] - a[0]); } c.set(a[1]).lerp(new T3.Color(b[1]), k); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new T3.Float32BufferAttribute(col, 3)); const m = new T3.Mesh(g, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false, depthWrite: false })); m.renderOrder = -1; parent.add(m); return m; }
function terrain(parent, size, seg, hfn, colfn, mat) { const g = new T3.PlaneGeometry(size, size, seg, seg); g.rotateX(-PI / 2); const p = g.attributes.position; const col = []; const c = new T3.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const y = hfn(x, z); p.setY(i, y); c.set(colfn(x, y, z)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new T3.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); mat.vertexColors = true; const m = new T3.Mesh(g, mat); parent.add(m); return m; }
function points(parent, n, fn, color, size, add_ = true) { const pos = []; const r = rng(n * 7 + 3); for (let i = 0; i < n; i++) pos.push(...fn(r, i)); const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
  const m = new T3.Points(g, new T3.PointsMaterial({ color, size, map: GLOW, transparent: true, depthWrite: false, blending: add_ ? T3.AdditiveBlending : T3.NormalBlending, sizeAttenuation: true })); parent.add(m); return m; }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function camLin(a, b, k, la, lb) { cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function shades(p) { const h = p.userData.head; add(h, Bx(0.42, 0.1, 0.04), Bm('#0a0a0a'), 0, 0.06, 0.25); add(h, Bx(0.15, 0.12, 0.03), Bm('#2a2a3a'), -0.1, 0.04, 0.27); add(h, Bx(0.15, 0.12, 0.03), Bm('#2a2a3a'), 0.1, 0.04, 0.27); }
const G = {}, PTEX = {}, ETEX = {};
function etex(k, holes) { const im = PTEX[k].image; const sc = document.createElement('canvas'); sc.width = im.width; sc.height = im.height; const sg = sc.getContext('2d'); sg.drawImage(im, 0, 0); const src = sg.getImageData(0, 0, sc.width, sc.height).data; const SW = sc.width;
  const W2 = 1024, H2 = 512; const c = document.createElement('canvas'); c.width = W2; c.height = H2; const g = c.getContext('2d'); const id = g.createImageData(W2, H2); const cx = SW / 2, R0 = SW * 0.388 * 0.82;
  for (let y = 0; y < H2; y++) { const lat = (0.5 - (y + 0.5) / H2) * PI; const cl = C(lat), sl = S(lat); for (let x = 0; x < W2; x++) { const u = (x + 0.5) / W2; const tri = 1 - 4 * Math.abs(u - 0.5); const sx = Math.round(cx + S(tri * PI / 2) * cl * R0), sy = Math.round(cx - sl * R0); const si = (sy * SW + sx) * 4, di = (y * W2 + x) * 4;
    id.data[di] = src[si]; id.data[di + 1] = src[si + 1]; id.data[di + 2] = src[si + 2]; let a = 255; if (holes && (src[si] + src[si + 1] + src[si + 2]) / 3 < 24) a = 0; id.data[di + 3] = a; } }
  g.putImageData(id, 0, 0); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.wrapS = T3.RepeatWrapping; return t; }

// ---------- SPACE (overview grid) ----------
function buildSpace() { const g = G.S = new T3.Group(); scene.add(g);
  points(g, 1500, (r) => { const a = r() * PI * 2, b = Math.acos(r() * 2 - 1), d = 200 + r() * 100; return [d * S(b) * C(a), d * S(b) * S(a), d * C(b)]; }, '#ffffff', 2.2);
  points(g, 200, (r) => { const a = r() * PI * 2, b = Math.acos(r() * 2 - 1), d = 150; return [d * S(b) * C(a), d * S(b) * S(a), d * C(b)]; }, '#b8a0ff', 6);
  const sunL = new T3.DirectionalLight('#ffffff', 2.2); sunL.position.set(-6, 4, 8); g.add(sunL); g.add(new T3.AmbientLight('#404060', 0.6));
  const neb = glow(g, '#6a3aaa', 120, -30, 20, -120, 0.35); glow(g, '#2a6aaa', 100, 40, -30, -120, 0.3);
  const pl = []; const P0 = [[-1.75, 1.75], [1.75, 1.75], [-1.75, -2.75], [1.75, -2.75]];
  G.deb = []; { const r = rng(88); const cols = ['#4a8a3a', '#6a8ad8', '#8a6a4a', '#e0e0f0', '#3a6a2a'];
    for (let i = 0; i < 34; i++) { const sz = 0.06 + r() * 0.14; const c = new T3.Mesh(Bx(sz, sz, sz * 0.6), new T3.MeshLambertMaterial({ color: cols[i % 5], emissive: '#2a1040', transparent: true, depthWrite: false }));
      const e = new T3.Mesh(Bx(sz * 1.08, sz * 1.08, sz * 0.5), new T3.MeshBasicMaterial({ color: '#c060ff', transparent: true, opacity: 0.5, depthWrite: false })); e.position.z = -0.02; c.add(e);
      c.userData = { a: -1.0 + r() * 2.0, sp: 0.07 + r() * 0.09, o: r(), spin: (r() - 0.5) * 4, e }; g.add(c); G.deb.push(c); } }
  const HALO = { A: ['#a8d8ff', 0.4], B: ['#ffb070', 0.12], C: ['#d8c8a8', 0.12], D: ['#b070ff', 0.5] };
  for (const k of 'ABCD') { const P = new T3.Group(); g.add(P); const holes = k === 'D';
    const sp = add(P, new T3.SphereGeometry(1.25, 48, 32), new T3.MeshLambertMaterial({ map: ETEX[k], emissive: '#ffffff', emissiveMap: ETEX[k], emissiveIntensity: 0.55, alphaTest: holes ? 0.5 : 0, side: holes ? T3.DoubleSide : T3.FrontSide })); P.userData.sph = sp;
    if (holes) add(P, new T3.SphereGeometry(1.12, 24, 16), Bm('#0a0414'));
    glow(P, HALO[k][0], 4.6, 0, 0, -0.9, HALO[k][1]);
    if (k === 'B') { glow(P, '#ffc080', 2.4, 1.05, 1.0, -1.2, 0.95); add(P, new T3.SphereGeometry(0.45, 20, 14), Bm('#050308'), 1.05, 1.0, -1.0); }
    pl.push(P); }
  pl.forEach((m, i) => { m.position.set(P0[i][0], P0[i][1], 0); m.userData.home = P0[i]; });
  g.userData.pl = pl; }

// ---------- A: PLANET GLASS ----------
const OC = [-150, 90]; // ocean centre (x,z)
function buildA() { const g = G.A = new T3.Group(); scene.add(g);
  sky(g, [[-1, '#a8d0f0'], [0, '#d8eeff'], [0.15, '#8ac0ec'], [1, '#2a6ac0']]);
  g.add(new T3.HemisphereLight('#f0f8ff', '#9ac0e0', 0.9)); const sun = new T3.DirectionalLight('#ffffff', 1.8); sun.position.set(60, 90, 40); g.add(sun);
  const sunS = glow(g, '#ffffff', 160, 240, 260, -380, 0.9); glow(g, '#fff8d0', 60, 240, 260, -380, 1);
  const hf = (x, z) => { const d = Math.hypot(x - OC[0], z - OC[1]); const ocean = d < 85 ? -lerp(0, 46, clamp((85 - d) / 30)) - (d < 55 ? S(x * 0.2) * 2 + C(z * 0.17) * 2 : 0) : 0; return 1.6 * S(x * 0.05) * C(z * 0.04) + 0.9 * S((x + z) * 0.11) + ocean; };
  terrain(g, 700, 140, hf, (x, y, z) => y < -3 ? (y < -30 ? '#5aa8c8' : '#a8d8d0') : (((x * 3 + z * 7) | 0) % 5 === 0 ? '#e8f4ff' : '#b8d4f0'), Ph('#ffffff', { shininess: 180, specular: '#ffffff', reflectivity: 1 }));
  // crystal mountains
  const r = rng(21); const cc = ['#a8f0ff', '#d8c0ff', '#ffffff', '#8fd8ff', '#ffc8f0', '#c8fff0'];
  for (let i = 0; i < 46; i++) { const x = -260 + r() * 520, z = -330 + r() * 210; if (Math.abs(x) < 25 && z > -150) continue; const h = 30 + r() * 95; const col = cc[(r() * 6) | 0];
    const mt = Ph(col, { transparent: true, opacity: 0.86, shininess: 220, emissive: new T3.Color(col).multiplyScalar(0.18) });
    const m = add(g, new T3.ConeGeometry(h * 0.28, h, 5 + (i % 2)), mt, x, h / 2 - 2, z); m.rotation.set((r() - 0.5) * 0.25, r() * PI, (r() - 0.5) * 0.25);
    for (let k = 0; k < 3; k++) { const hh = h * (0.3 + r() * 0.4); const s = add(g, new T3.ConeGeometry(hh * 0.25, hh, 5), mt, x + (r() - 0.5) * h * 0.6, hh / 2 - 2, z + (r() - 0.5) * h * 0.4 + 6); s.rotation.set((r() - 0.5) * 0.6, r() * PI, (r() - 0.5) * 0.6); } }
  // small crystals scattered on the desert
  for (let i = 0; i < 90; i++) { const x = -200 + r() * 400, z = -120 + r() * 260; if (Math.hypot(x - OC[0], z - OC[1]) < 90) continue; const h = 1.5 + r() * 5; const m = add(g, new T3.OctahedronGeometry(h * 0.35, 0), Ph(cc[i % 6], { transparent: true, opacity: 0.9, shininess: 250, emissive: '#2a4a5a' }), x, hf(x, z) + h * 0.3, z); m.scale.y = 2.2; m.rotation.y = r() * 3; }
  // shining trees (grove at 60,30)
  G.Atrees = []; for (let i = 0; i < 22; i++) { const x = 40 + r() * 70, z = 0 + r() * 70; const t = new T3.Group(); t.position.set(x, hf(x, z), z); g.add(t); const h = 6 + r() * 6;
    add(t, new T3.CylinderGeometry(0.25, 0.45, h, 6), Ph('#f4f8ff', { shininess: 200 }), 0, h / 2, 0);
    for (let k = 0; k < 4; k++) { const col = k % 2 ? '#bffcff' : '#fff6c8'; const o = add(t, new T3.OctahedronGeometry(1.4 + r() * 1.4, 0), Bm(col, { transparent: true, opacity: 0.92 }), (r() - 0.5) * 3, h + (r() - 0.2) * 3, (r() - 0.5) * 3); o.rotation.set(r(), r(), r()); }
    t.userData.g = glow(t, i % 2 ? '#8ff8ff' : '#fff0a0', 14, 0, h + 0.8, 0, 0.7); G.Atrees.push(t); }
  for (const [x, z, c] of [[60, 25, '#8ff8ff'], [85, 50, '#fff0a0'], [50, 60, '#c8f0ff']]) { const pl = new T3.PointLight(c, 3, 40, 1); pl.position.set(x, 8, z); g.add(pl); }
  // ocean: clear surface + seabed life
  const water = add(g, new T3.CircleGeometry(84, 48), Ph('#bff2ff', { transparent: true, opacity: 0.22, shininess: 300, flatShading: false, depthWrite: false }), OC[0], 0.4, OC[1]); water.rotation.x = -PI / 2; G.Awater = water;
  for (let i = 0; i < 70; i++) { const a = r() * PI * 2, d = r() * 60; const x = OC[0] + C(a) * d, z = OC[1] + S(a) * d; const y = hf(x, z); const k = i % 4;
    if (k === 0) add(g, new T3.ConeGeometry(1 + r() * 2, 4 + r() * 8, 5), Ph(['#ff8ab8', '#ffd28a', '#8affd8'][i % 3], { emissive: '#3a1a2a' }), x, y + 3, z);
    else if (k === 1) add(g, new T3.DodecahedronGeometry(1.5 + r() * 3, 0), L('#7a9aa8'), x, y + 1, z);
    else { const o = add(g, new T3.OctahedronGeometry(1 + r() * 2, 0), Ph('#e8ffff', { transparent: true, opacity: 0.8, emissive: '#2a6a7a' }), x, y + 2, z); o.scale.y = 2.5; } }
  G.Afish = []; for (let s = 0; s < 4; s++) for (let i = 0; i < 14; i++) { const f = new T3.Group(); add(f, Bx(0.5, 0.35, 1.0), Ph(['#ffb03a', '#ff5a8a', '#5affff', '#ffffff'][s]), 0, 0, 0); add(f, new T3.ConeGeometry(0.3, 0.5, 4), Ph(['#ffb03a', '#ff5a8a', '#5affff', '#ffffff'][s]), 0, 0, -0.7).rotation.x = -PI / 2; g.add(f); f.userData = { s, i, o: r() }; G.Afish.push(f); }
  // a whale shadow far below
  G.Awhale = add(g, new T3.SphereGeometry(4, 12, 8), L('#2a5a7a'), OC[0], -36, OC[1]); G.Awhale.scale.set(1, 0.7, 3.2);
  // glass bridge across the ocean
  const gm = Ph('#d8f6ff', { transparent: true, opacity: 0.45, shininess: 300 }); for (let i = 0; i < 40; i++) { const x = OC[0] - 100 + i * 5; add(g, Bx(5.05, 0.4, 4), gm, x, 7, OC[1] + 10); }
  add(g, Bx(200, 0.15, 0.15), Ph('#ffffff', { shininess: 200 }), OC[0], 8.4, OC[1] + 8); add(g, Bx(200, 0.15, 0.15), Ph('#ffffff', { shininess: 200 }), OC[0], 8.4, OC[1] + 12);
  for (let i = 0; i < 5; i++) { const x = OC[0] - 80 + i * 40; const m = add(g, new T3.ConeGeometry(2.4, 50, 5), Ph('#c8f4ff', { transparent: true, opacity: 0.7, shininess: 240 }), x, -18, OC[1] + 10); m.rotation.x = PI; }
  G.Aguy = person({ shirt: '#ff7a3a', trousers: '#3a4a6a', skin: '#e8b896', hair: '#3a2414' }); shades(G.Aguy); g.add(G.Aguy);
  G.Asparks = points(g, 500, (r) => [-200 + r() * 400, 0.5 + r() * 25, -200 + r() * 300], '#ffffff', 1.4);
}
function updA(T) { G.Afish.forEach(f => { const { s, i, o } = f.userData; const a = T * 0.25 * (s % 2 ? 1 : -1) + i * 0.09 + s * 1.6; const R = 18 + s * 9 + S(i) * 2; f.position.set(OC[0] + C(a) * R, -8 - s * 7 + S(i * 1.3) * 1.5, OC[1] + S(a) * R); f.rotation.y = -a + (s % 2 ? 0 : PI); });
  G.Awhale.position.set(OC[0] + C(T * 0.1) * 25, -36, OC[1] + S(T * 0.1) * 25); G.Awhale.rotation.y = -T * 0.1;
  G.Atrees.forEach((t, i) => t.userData.g.material.opacity = 0.55 + 0.3 * S(T * 2 + i)); G.Asparks.material.opacity = 0.6 + 0.4 * S(T * 9); }

// ---------- B: ECLIPSIA ----------
function buildB() { const g = G.B = new T3.Group(); scene.add(g);
  sky(g, [[-1, '#1a0e2a'], [-0.02, '#ff8a4a'], [0.04, '#d85a6a'], [0.14, '#6a2a7a'], [0.4, '#2a1450'], [1, '#0a0620']]);
  points(g, 600, (r) => { const a = r() * PI * 2, b = r() * 1.2, d = 500; return [d * S(b) * C(a), d * C(b), d * S(b) * S(a)]; }, '#ffffff', 3);
  g.add(new T3.HemisphereLight('#8a7ad0', '#1a1030', 0.75)); const dl = new T3.DirectionalLight('#ff9a6a', 0.9); dl.position.set(0, 6, -100); g.add(dl);
  // the sun that never rises
  add(g, new T3.SphereGeometry(60, 32, 20), Bm('#ffb060', { fog: false }), 0, -48, -520); glow(g, '#ff8a3a', 420, 0, 0, -500, 0.75); glow(g, '#ffd08a', 180, 0, 0, -500, 0.6);
  const hf = (x, z) => 2.2 * S(x * 0.04) * C(z * 0.05) + 1.2 * S((x - z) * 0.09) - oceanDip(x, z);
  terrain(g, 800, 160, hf, (x, y, z) => y > 1.5 ? '#e0e6ff' : '#aab4e0', L('#ffffff'));
  // purple clouds
  const r = rng(33); const cm = L('#4a2a6a', { emissive: '#1a0a2a', transparent: true, opacity: 0.95 }); G.Bclouds = new T3.Group(); g.add(G.Bclouds);
  for (let i = 0; i < 70; i++) { const c = add(G.Bclouds, new T3.IcosahedronGeometry(10 + r() * 16, 0), cm, -350 + r() * 700, 135 + r() * 30, -400 + r() * 500); c.scale.y = 0.35; c.rotation.y = r() * 3; }
  // icy mountains
  for (let i = 0; i < 30; i++) { const x = 120 + r() * 280, z = -360 + r() * 220; const h = 40 + r() * 110; const m = add(g, new T3.ConeGeometry(h * 0.42, h, 6), L('#c8d8ff', { emissive: '#1a1a3a' }), x, h / 2 - 3, z); m.rotation.y = r() * 3;
    const cap = add(g, new T3.ConeGeometry(h * 0.17, h * 0.4, 6), L('#ffffff', { emissive: '#3a3a5a' }), x, h * 0.8 - 3, z); cap.rotation.y = m.rotation.y; }
  // glowing forest (around 70, 20)
  G.Bglow = []; for (let i = 0; i < 40; i++) { const x = 30 + r() * 90, z = -30 + r() * 90; const t = new T3.Group(); t.position.set(x, hf(x, z), z); g.add(t); const h = 5 + r() * 7; const col = ['#3affe8', '#ff4ae0', '#8a7aff'][i % 3];
    add(t, new T3.CylinderGeometry(0.2, 0.4, h * 0.5, 5), L('#1a1428'), 0, h * 0.25, 0); add(t, new T3.ConeGeometry(h * 0.32, h * 0.8, 6), L('#16243a', { emissive: '#0a1a2a' }), 0, h * 0.75, 0);
    for (let k = 0; k < 5; k++) add(t, new T3.SphereGeometry(0.28, 6, 4), Bm(col), (r() - 0.5) * h * 0.4, h * (0.45 + r() * 0.6), (r() - 0.5) * h * 0.4);
    t.userData.g = glow(t, col, 7, 0, h * 0.7, 0, 0.5); G.Bglow.push(t); }
  for (let i = 0; i < 40; i++) { const x = 30 + r() * 90, z = -30 + r() * 90; const m = new T3.Group(); m.position.set(x, hf(x, z), z); g.add(m); const col = i % 2 ? '#3affe8' : '#ff8af0'; add(m, new T3.CylinderGeometry(0.12, 0.15, 0.8, 5), Bm('#d8e8ff'), 0, 0.4, 0); add(m, new T3.SphereGeometry(0.5, 8, 4, 0, PI * 2, 0, PI / 2), Bm(col), 0, 0.8, 0); glow(m, col, 3, 0, 0.9, 0, 0.6); }
  for (const [x, z, c] of [[60, 10, '#3affe8'], [90, 40, '#ff4ae0'], [70, 50, '#8a7aff']]) { const pl = new T3.PointLight(c, 4, 45, 1); pl.position.set(x, 6, z); g.add(pl); }
  G.Bflies = points(g, 300, (r) => [30 + r() * 90, 1 + r() * 10, -30 + r() * 90], '#bfffd8', 0.6);
  // city (around -60,-60) with artificial suns
  const wt_ = ctex(32, 64, (c, w, h) => { c.fillStyle = '#1a1830'; c.fillRect(0, 0, w, h); const rr = rng(5); for (let y = 2; y < h; y += 4) for (let x = 2; x < w; x += 4) { const v = rr(); c.fillStyle = v > 0.55 ? (v > 0.85 ? '#7af0ff' : '#ffd88a') : '#262444'; c.fillRect(x, y, 2, 2); } }, true);
  G.Btowers = []; for (let i = 0; i < 44; i++) { const x = -150 + (i % 8) * 18 + (r() - 0.5) * 6, z = -120 + Math.floor(i / 8) * 18 + (r() - 0.5) * 6; const h = 20 + r() * 80; const w = 6 + r() * 6; const tx = wt_.clone(); tx.needsUpdate = true; tx.repeat.set(w / 8, h / 16);
    const m = add(g, Bx(w, h, w), new T3.MeshLambertMaterial({ color: '#8a88b8', map: tx, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: 0.9 }), x, h / 2, z); G.Btowers.push(m); if (i % 3 === 0) add(g, Bx(w * 0.3, 8, w * 0.3), L('#5a5878'), x, h + 4, z); }
  for (let i = 0; i < 10; i++) { const a = G.Btowers[(i * 7) % 44], b = G.Btowers[(i * 7 + 1) % 44]; const y = Math.min(a.position.y, b.position.y) * 1.3; const len = a.position.distanceTo(b.position); const m = add(g, Bx(len, 1.2, 2.5), L('#c8c8ff', { emissive: '#4a4a8a' }), (a.position.x + b.position.x) / 2, y, (a.position.z + b.position.z) / 2); m.rotation.y = -Math.atan2(b.position.z - a.position.z, b.position.x - a.position.x); }
  G.Bsuns = []; for (const [x, z, h] of [[-110, -95, 120], [-40, -60, 105], [-80, -20, 95]]) { add(g, new T3.CylinderGeometry(1, 2.5, h, 6), L('#3a3858'), x, h / 2, z); const s = add(g, new T3.SphereGeometry(7, 20, 14), Bm('#fff0b0', { fog: false }), x, h + 6, z); const gl = glow(g, '#ffd27a', 70, x, h + 6, z, 0.85); const pl = new T3.PointLight('#ffd08a', 6, 260, 1); pl.position.set(x, h + 6, z); g.add(pl); G.Bsuns.push(gl); }
  G.Bships = []; for (let i = 0; i < 12; i++) { const s = add(g, Bx(1.6, 0.6, 3.4), Bm(i % 2 ? '#7af0ff' : '#ffd27a')); s.userData.o = r(); G.Bships.push(s); }
  G.Bsnow = points(g, 900, (r) => [-40 + r() * 80, r() * 40, -40 + r() * 80], '#ffffff', 0.35, false);
  G.Bguy = person({ shirt: '#c83a3a', trousers: '#2a2a3a', skin: '#e8b896', hair: '#2a1a14', hat: 'cap', hatCol: '#c83a3a', longSleeve: true }); g.add(G.Bguy);
  add(G.Bguy.userData.body, Bx(0.6, 0.12, 0.34), L('#f0f0f0'), 0, 1.66, 0); // scarf
}
function updB(T) { G.Bclouds.position.x = T * 2; G.Bglow.forEach((t, i) => t.userData.g.material.opacity = 0.35 + 0.25 * S(T * 1.5 + i)); G.Bsuns.forEach((s, i) => s.scale.setScalar(70 + 6 * S(T * 2 + i)));
  G.Bships.forEach((s, i) => { const k = ((T * 0.05 + s.userData.o) % 1); s.position.set(-170 + k * 200, 40 + (i % 4) * 14, -130 + (i % 6) * 22); s.rotation.y = PI / 2; });
  const p = G.Bsnow.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - 0.15; if (y < 0) y += 40; p.setY(i, y); } p.needsUpdate = true; G.Bflies.material.opacity = 0.6 + 0.4 * S(T * 5); }

// ---------- B: dark ocean, bridges, boats, oasis ----------
const BO = [-10, -300];
function oceanDip(x, z) { const d = Math.hypot(x - BO[0], (z - BO[1]) * 0.9); return d < 170 ? lerp(0, 6, clamp((170 - d) / 22)) : 0; }
function buildBocean() { const g = G.B; const r = rng(61);
  add(g, new T3.CircleGeometry(185, 64), Ph('#4a3a8a', { shininess: 120, specular: '#ffb080', emissive: '#1e1440', flatShading: false }), BO[0], 0.3, BO[1]).rotation.x = -PI / 2;
  const sp = add(g, new T3.PlaneGeometry(30, 260), new T3.MeshBasicMaterial({ map: GLOW, color: '#ff9a5a', transparent: true, opacity: 0.6, blending: T3.AdditiveBlending, depthWrite: false }), 0, 0.5, -390); sp.rotation.x = -PI / 2;
  for (const [x0, z0, x1, z1] of [[-175, -225, 160, -225], [-10, -132, -10, -280]]) { const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0); const bg = new T3.Group(); bg.position.set(x0, 0, z0); bg.rotation.y = -ang; g.add(bg);
    const n = Math.floor(len / 6); for (let i = 0; i < n; i++) { const x = i * 6 + 3; const y = 3 + S(PI * x / len) * 7; add(bg, Bx(6.2, 0.6, 4), L('#8a86b0', { emissive: '#1a1830' }), x, y, 0);
      if (i % 3 === 0) { const c = i % 2 ? '#7af0ff' : '#ffd27a'; for (const zz of [1.9, -1.9]) { add(bg, Bx(0.25, 2.2, 0.25), L('#5a5878'), x, y + 1.2, zz); add(bg, new T3.SphereGeometry(0.35, 8, 6), Bm(c), x, y + 2.4, zz); glow(bg, c, 6, x, y + 2.4, zz, 0.8); } }
      if (i % 7 === 3) add(bg, Bx(1.8, y + 2, 1.8), L('#4a4668'), x, y / 2 - 1, 0); } }
  // oasis island
  const oi = new T3.Group(); oi.position.set(BO[0], 0, BO[1]); g.add(oi); add(oi, new T3.CylinderGeometry(22, 27, 4, 22), L('#d8c4a0'), 0, 0.4, 0); add(oi, new T3.CylinderGeometry(15, 21, 1, 22), L('#2e5a3e', { emissive: '#0a1a12' }), 0, 2.7, 0);
  const pool = add(oi, new T3.CircleGeometry(6.5, 24), Bm('#3affe8'), 0, 3.25, 0); pool.rotation.x = -PI / 2; glow(oi, '#3affe8', 26, 0, 4, 0, 0.7); const pl = new T3.PointLight('#5affe8', 6, 70, 1); pl.position.set(0, 8, 0); oi.add(pl);
  for (let i = 0; i < 11; i++) { const a = i / 11 * PI * 2 + r() * 0.3, d = 9 + r() * 6; const tr = new T3.Group(); tr.position.set(C(a) * d, 3.2, S(a) * d); tr.rotation.set(S(a) * 0.15, 0, -C(a) * 0.15); oi.add(tr); const h = 6 + r() * 4;
    for (let k = 0; k < 4; k++) add(tr, new T3.CylinderGeometry(0.3, 0.38, h / 4, 6), L('#4a3a2e'), C(a) * k * 0.25, h / 8 + k * h / 4, S(a) * k * 0.25);
    const col = i % 2 ? '#3affd8' : '#ff8af0'; for (let k = 0; k < 7; k++) { const lf = add(tr, new T3.ConeGeometry(0.7, 4.2, 4), L('#1e4a3e', { emissive: '#0a2a22' }), C(a) + C(k) * 1.8, h + 0.2, S(a) + S(k) * 1.8); lf.rotation.set(S(k) * 1.2, 0, -C(k) * 1.2); lf.scale.z = 0.3; } glow(tr, col, 6, C(a), h + 0.5, S(a), 0.6); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; add(oi, Bx(0.2, 1.4, 0.2), L('#3a3040'), C(a) * 18, 3.3, S(a) * 18); glow(oi, '#ffd27a', 3, C(a) * 18, 4.2, S(a) * 18, 0.9); }
  // boats with lanterns
  G.Bboats = []; for (let i = 0; i < 14; i++) { const b = new T3.Group(); b.scale.setScalar(1.6); g.add(b); add(b, Bx(1.6, 0.8, 4), L('#2e2238'), 0, 0.3, 0); add(b, Bx(1.2, 0.8, 1.4), L('#5a4a6a'), 0, 1.0, -0.6); add(b, new T3.CylinderGeometry(0.08, 0.08, 4, 5), L('#3a2e2a'), 0, 2.6, 0.5);
    const sl = add(b, new T3.ConeGeometry(1.3, 3.2, 3), L('#e8dcc8', { emissive: '#3a2a20' }), 0, 2.7, 0.9); sl.scale.z = 0.12; add(b, new T3.SphereGeometry(0.22, 6, 4), Bm('#ffc870'), 0, 1.0, 1.9); glow(b, '#ffb860', 7, 0, 1.0, 1.9, 1.0); glow(b, '#ffb860', 3, 0, 2.7, 0.9, 0.5);
    const near = i < 4; b.userData = { fix: near ? [[0, -186], [10, -200], [-12, -208], [4, -222]][i] : null, R: near ? 70 + i * 6 : 35 + r() * 120, a: near ? PI / 2 - 0.35 + i * 0.22 : r() * PI * 2, sp: (0.01 + r() * 0.015) * (i % 2 ? 1 : -1) }; G.Bboats.push(b); } }
function updBocean(T) { G.Bboats.forEach((b, i) => { const u = b.userData; const a = u.a + T * u.sp; if (u.fix) { b.position.set(u.fix[0] + S(T * 0.2 + i) * 2, 0.35 + S(T * 1.4 + i) * 0.12, u.fix[1] + T * 0.3); b.rotation.set(S(T * 1.1 + i) * 0.04, 0.4 + i * 0.5, S(T * 1.3 + i) * 0.05); return; } b.position.set(BO[0] + C(a) * u.R, 0.35 + S(T * 1.4 + i) * 0.12, BO[1] + S(a) * u.R * 0.9); b.rotation.set(S(T * 1.1 + i) * 0.04, -a + (u.sp > 0 ? 0 : PI), S(T * 1.3 + i) * 0.05); }); }

// ---------- C: PLANET BORING ----------
function buildC() { const g = G.C = new T3.Group(); scene.add(g);
  sky(g, [[-1, '#8a8a8a'], [0, '#a4a4a2'], [1, '#8e8e8e']]);
  g.add(new T3.HemisphereLight('#b8b8b6', '#6a6a68', 1.2)); const dl = new T3.DirectionalLight('#d0d0d0', 0.4); dl.position.set(20, 50, 20); g.add(dl);
  add(g, new T3.PlaneGeometry(900, 900), L('#8e8d8a', { flatShading: false }), 0, 0, 0).rotation.x = -PI / 2;
  const cl = L('#9a9a9a', { flatShading: false }); for (let i = 0; i < 12; i++) { const c = add(g, Bx(160, 6, 160), cl, -600 + i * 160, 90, -120); }
  const r = rng(77); for (let i = 0; i < 16; i++) { const h = 25 + (i % 3) * 3; add(g, new T3.ConeGeometry(h * 1.4, h, 8), L('#7c7c7a', { flatShading: false }), -300 + i * 40, h / 2, -260); }
  add(g, Bx(8, 0.05, 900), L('#6e6e6c'), 0, 0.03, 0); for (let i = 0; i < 40; i++) add(g, Bx(0.4, 0.06, 4), L('#a8a8a6'), 0, 0.05, -400 + i * 20);
  // identical houses
  G.Chouses = []; for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) { const hgrp = new T3.Group(); hgrp.position.set((i < 3 ? -14 - i * 12 : 14 + (i - 3) * 12), 0, -20 - j * 14); g.add(hgrp);
    add(hgrp, Bx(7, 5, 7), L('#a09e98'), 0, 2.5, 0); const roof = add(hgrp, new T3.ConeGeometry(5.6, 3, 4), L('#6a6864'), 0, 6.5, 0); roof.rotation.y = PI / 4;
    const side = i < 3 ? 1 : -1; add(hgrp, Bx(0.1, 2.2, 1.3), L('#5a5856'), side * 3.51, 1.1, 0); add(hgrp, Bx(0.1, 1.1, 1.1), L('#c8c8c4'), side * 3.51, 3.2, -2); add(hgrp, Bx(0.1, 1.1, 1.1), L('#c8c8c4'), side * 3.51, 3.2, 2);
    G.Chouses.push(hgrp); }
  G.Cguy = person({ shirt: '#9a9a98', trousers: '#6a6a6a', skin: '#c8b8a8', hair: '#5a5a5a' }); g.add(G.Cguy);
  G.Cchair = new T3.Group(); g.add(G.Cchair); add(G.Cchair, Bx(1, 0.1, 1), L('#7a7a78'), 0, 0.5, 0); add(G.Cchair, Bx(1, 1, 0.1), L('#7a7a78'), 0, 1.0, -0.45); for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) add(G.Cchair, Bx(0.08, 0.5, 0.08), L('#5a5a58'), a, 0.25, b);
  G.Csign = new T3.Group(); g.add(G.Csign); add(G.Csign, Bx(0.2, 3, 0.2), L('#6a6a68'), 0, 1.5, 0); const st = TX.sign('BORING', '#b8b8b4', '#4a4a48', 128, 48, 12); add(G.Csign, new T3.PlaneGeometry(3, 1.1), Bm('#ffffff', { map: st }), 0, 3.4, 0.12);
}

// ---------- D: PLANET D (glitched world) ----------
const LK = [25, -110];
function hfD(x, z) { const d = Math.hypot(x - LK[0], z - LK[1]); const lake = d < 56 ? lerp(0, 3, clamp((56 - d) / 10)) : 0; return 0.6 * S(x * 0.07) * C(z * 0.06) + 0.35 * S((x + z) * 0.2) - lake; }
let D_chunk, D_void, D_guyHole;
function dHole(g, x, y, z, w, h) { const H = new T3.Group(); H.position.set(x, y, z); g.add(H); const r = rng((x * 13 + z * 7) | 0);
  const parts = [[0, 0, w, h], [w * (0.2 + r() * 0.2), h * 0.5, w * 0.5, h * 0.55], [-w * (0.25 + r() * 0.2), -h * 0.45, w * 0.45, h * 0.5], [w * 0.45, -h * 0.2, w * 0.3, h * 0.35]];
  for (const [px, py, pw, ph] of parts) { add(H, new T3.PlaneGeometry(pw + Math.max(0.5, w * 0.05), ph + Math.max(0.5, w * 0.05)), Bm('#b050ff', { fog: false }), px, py, -0.05); }
  for (const [px, py, pw, ph] of parts) add(H, new T3.PlaneGeometry(pw, ph), Bm('#030106', { fog: false }), px, py, 0);
  G.Dholes.push(H); return H; }
function dIsland(g, x, y, z, s, trees, fall) { const r = rng((x * 31 + z) | 0); const I = new T3.Group(); I.position.set(x, y, z); g.add(I);
  add(I, Bx(10 * s, 1.6 * s, 7 * s), L('#45542c'), 0, 0, 0); add(I, Bx(10.3 * s, 0.35 * s, 7.3 * s), L('#5c6c36'), 0, 0.9 * s, 0);
  for (let k = 0; k < 4; k++) add(I, Bx((8.4 - k * 1.9) * s, 1.6 * s, (5.8 - k * 1.3) * s), L(k % 2 ? '#3a2e2a' : '#4a3a32'), (r() - 0.5) * s, -(1.6 + k * 1.5) * s, (r() - 0.5) * s);
  for (let k = 0; k < 9; k++) { const h = (1 + r() * 4) * s; add(I, Bx(0.22 * s, h, 0.22 * s), L('#2a2420'), (r() - 0.5) * 8 * s, -(2 + r() * 3) * s - h / 2, (r() - 0.5) * 5 * s); }
  add(I, Bx(0.3 * s, 4 * s, 7.4 * s), Bm('#a040f0'), 5.15 * s, -1.5 * s, 0); add(I, Bx(2.6 * s, 2.4 * s, 7.6 * s), Bm('#05020a'), 4.0 * s, -0.6 * s, 0);
  for (let k = 0; k < trees; k++) { const tx = (-3 + k * 2.5) * s, tz = (r() - 0.5) * 3 * s; add(I, new T3.CylinderGeometry(0.15 * s, 0.2 * s, 2 * s, 5), L('#2a2018'), tx, 2 * s, tz); add(I, new T3.ConeGeometry(1.2 * s, 2.6 * s, 6), L('#2a4426'), tx, 3.6 * s, tz); add(I, new T3.ConeGeometry(0.9 * s, 2 * s, 6), L('#33502c'), tx, 4.6 * s, tz); }
  if (fall) { const ft = ctex(16, 64, (c, w, h) => { for (let y_ = 0; y_ < h; y_ += 2) { c.fillStyle = y_ % 6 ? 'rgba(220,230,255,0.85)' : 'rgba(170,190,240,0.6)'; c.fillRect(0, y_, w, 2); } for (let x_ = 0; x_ < w; x_ += 4) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x_, 0, 1, h); } }, true); ft.repeat.set(1, 6); G.Dfall = ft;
    const wf = add(I, new T3.PlaneGeometry(2.4 * s, fall), new T3.MeshBasicMaterial({ map: ft, transparent: true, opacity: 0.9, side: T3.DoubleSide }), -5.2 * s, -fall / 2 + 0.6 * s, 0); wf.rotation.y = PI / 2; glow(I, '#e8e0ff', 14 * s, -5.2 * s, -fall + 1, 0, 0.6); }
  I.userData = { y, o: r() }; G.Disl.push(I); return I; }
function buildD() { const g = G.D = new T3.Group(); scene.add(g); G.Dholes = []; G.Disl = [];
  sky(g, [[-1, '#120a1e'], [-0.02, '#2a1838'], [0.02, '#d8a0f0'], [0.1, '#9a68c0'], [0.3, '#4a2e66'], [0.6, '#2a1a3e'], [1, '#140a22']]);
  g.add(new T3.HemisphereLight('#c8a8f4', '#2a2420', 1.0)); const dl = new T3.DirectionalLight('#e8b8ff', 0.7); dl.position.set(60, 40, -120); g.add(dl);
  const r = rng(404);
  // the broken planet hanging in the sky
  G.Dplanet = new T3.Group(); G.Dplanet.position.set(120, 190, -440); g.add(G.Dplanet);
  G.DplanetS = add(G.Dplanet, new T3.SphereGeometry(75, 48, 32), new T3.MeshBasicMaterial({ map: ETEX.D, alphaTest: 0.5, fog: false, side: T3.DoubleSide })); add(G.Dplanet, new T3.SphereGeometry(68, 24, 16), Bm('#0a0414', { fog: false })); glow(G.Dplanet, '#b070ff', 260, 0, 0, -60, 0.55);
  // blocky purple clouds
  G.Dclouds = new T3.Group(); g.add(G.Dclouds); for (let i = 0; i < 70; i++) { const lo = i < 18; const c = add(G.Dclouds, Bx(20 + r() * 40, 3 + r() * 4, 12 + r() * 18), L(lo ? '#9a74c0' : '#4a3462', { emissive: lo ? '#3a2050' : '#160a26' }), -450 + r() * 900, lo ? 25 + r() * 25 : 85 + r() * 70, lo ? -380 + r() * 60 : -480 + r() * 380); c.rotation.y = (r() - 0.5) * 0.3; }
  // ground, lake, puddles, rocks, grass
  terrain(g, 900, 180, hfD, (x, y, z) => y < -1 ? '#2a2230' : (((x * 7 + z * 3) | 0) % 4 === 0 ? '#4c4832' : '#38361f'), L('#ffffff'));
  add(g, new T3.CircleGeometry(57, 48), Ph('#a674d8', { shininess: 220, flatShading: false, specular: '#ffffff' }), LK[0], 0.15, LK[1]).rotation.x = -PI / 2;
  for (const [x, z, s_] of [[-14, 6, 4.5], [-4, -2, 2.5], [9, 12, 3.2], [-26, 18, 3.5], [16, -14, 2.2], [-34, -2, 2.8], [3, 22, 2.4]]) { const pd = add(g, new T3.CircleGeometry(s_, 10), Ph('#b88ae8', { shininess: 260, specular: '#ffffff' }), x, hfD(x, z) + 0.12, z); pd.rotation.x = -PI / 2; pd.scale.y = 0.6; }
  for (let i = 0; i < 90; i++) { const x = -70 + r() * 140, z = -80 + r() * 110; const s_ = 0.4 + r() * 2.4; const m = add(g, r() < 0.5 ? Bx(s_ * 1.6, s_ * 0.6, s_) : new T3.DodecahedronGeometry(s_ * 0.6, 0), L(r() < 0.5 ? '#4a4448' : '#3a3538'), x, hfD(x, z) + s_ * 0.2, z); m.rotation.set((r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5); }
  for (let i = 0; i < 320; i++) { const x = -60 + r() * 120, z = -60 + r() * 90; if (Math.hypot(x - LK[0], z - LK[1]) < 58) continue; add(g, new T3.ConeGeometry(0.12, 0.6 + r() * 1.0, 3), L(r() < 0.5 ? '#6a6234' : '#575026'), x, hfD(x, z) + 0.4, z); }
  // ruined building with glowing 404
  const ru = new T3.Group(); ru.position.set(-26, 0, -18); g.add(ru); const cm = L('#3e383a');
  add(ru, Bx(16, 9, 5), cm, 0, 4.5, 0); add(ru, Bx(9, 4, 5), cm, -3.5, 11, 0); add(ru, Bx(2, 3, 5), cm, 6.5, 10.5, 0);
  for (const [x, y] of [[5, 6.5], [5, 2.5], [-6.5, 11]]) add(ru, Bx(2.2, 2.4, 5.1), Bm('#0a0610'), x, y, 0);
  const t404 = ctex(96, 32, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.font = '24px PressStart'; c.textBaseline = 'middle'; c.fillStyle = '#efe0ff'; c.fillText('404', 6, 18); }, true);
  add(ru, new T3.PlaneGeometry(9, 3), new T3.MeshBasicMaterial({ map: t404, blending: T3.AdditiveBlending, transparent: true }), -2.5, 4.6, 2.53); glow(ru, '#c8a0ff', 14, -2.5, 4.6, 3.5, 0.35);
  add(ru, Bx(6, 0.8, 4), cm, 9, 0.6, 4).rotation.z = 0.3;
  // colonnade ruins
  const co = new T3.Group(); co.position.set(34, 0, -62); g.add(co); for (let i = 0; i < 6; i++) add(co, Bx(1.6, i === 5 ? 4 : 9, 1.6), L('#45404a'), -10 + i * 4, i === 5 ? 2 : 4.5, 0); add(co, Bx(19, 1.6, 3), L('#45404a'), -2, 9.6, 0);
  // power poles + sagging wires
  const poles = [[-38, 14], [-30, -6], [-22, -30], [-14, -54]]; poles.forEach(([x, z]) => { add(g, Bx(0.45, 13, 0.45), L('#241c20'), x, 6.5, z); add(g, Bx(3.4, 0.3, 0.3), L('#241c20'), x, 12, z); });
  const wm = new T3.LineBasicMaterial({ color: '#100810' }); for (let i = 0; i < poles.length - 1; i++) for (const o of [-1.5, 1.5]) { const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push(new T3.Vector3(lerp(poles[i][0], poles[i + 1][0], u) + o, 12 - S(u * PI) * 2.2, lerp(poles[i][1], poles[i + 1][1], u))); } g.add(new T3.Line(new T3.BufferGeometry().setFromPoints(pts), wm)); }
  // distant ruined skyline
  for (let i = 0; i < 40; i++) { const h = 5 + r() * 28; add(g, Bx(4 + r() * 8, h, 4 + r() * 6), L('#4e3a62'), -320 + i * 16 + r() * 6, h / 2, -280 - r() * 40); }
  // floating islands (one with a waterfall into the lake)
  dIsland(g, -30, 38, -110, 1.6, 2, 0); dIsland(g, 12, 24, -70, 0.9, 1, 0); dIsland(g, 42, 30, -118, 1.8, 0, 31); dIsland(g, -64, 56, -165, 1.3, 2, 0); dIsland(g, 72, 46, -92, 0.8, 1, 0); dIsland(g, -8, 64, -210, 1.2, 1, 0);
  for (let i = 0; i < 12; i++) dIsland(g, -90 + r() * 180, 18 + r() * 50, -60 - r() * 160, 0.25 + r() * 0.25, 0, 0);
  // holes ripped in reality
  dHole(g, -50, 75, -230, 34, 18); dHole(g, 70, 115, -310, 44, 22); dHole(g, 0, 46, -165, 14, 8); dHole(g, 150, 45, -260, 26, 12); dHole(g, 55, 3, -104, 11, 4.5); dHole(g, -8, 8, -60, 6, 3.5);
  // the piece of land that will vanish
  D_chunk = new T3.Group(); g.add(D_chunk); add(D_chunk, Bx(14, 3, 12), L('#45542c'), 0, -1.4, 0); add(D_chunk, Bx(14.2, 0.3, 12.2), L('#5c6c36'), 0, 0.05, 0);
  for (let k = 0; k < 3; k++) add(D_chunk, Bx(11 - k * 3.5, 2.2, 9 - k * 2.8), L(k % 2 ? '#3a2e2a' : '#4a3a32'), 0, -3.9 - k * 2.2, 0);
  add(D_chunk, Bx(1.5, 7, 1.5), L('#45404a'), 3, 3.5, -2); add(D_chunk, Bx(1.5, 3, 1.5), L('#45404a'), -1, 1.5, -3); add(D_chunk, Bx(5, 1.2, 1.8), L('#45404a'), 2, 7.4, -2);
  add(D_chunk, new T3.CylinderGeometry(0.2, 0.25, 3, 5), L('#2a2018'), -4, 1.5, 2); add(D_chunk, new T3.ConeGeometry(1.6, 3.4, 6), L('#2a4426'), -4, 4.2, 2); add(D_chunk, new T3.DodecahedronGeometry(1, 0), L('#4a4448'), 4, 0.6, 3);
  D_void = dHole(g, 8, 2.5, -35, 16, 6); D_guyHole = dHole(g, 8.5, 0.7, 3.5, 2.6, 1.4);
  G.Dguy = person({ shirt: '#3affd8', trousers: '#2a2a40', skin: '#e8b896', hair: '#1a1a1a' }); g.add(G.Dguy);
}
const VAN = () => AT(9, 'disappears'), REAP = () => AT(9, 'reappears');
function updD(T) { G.Disl.forEach((I, i) => { I.position.y = I.userData.y + S(T * 0.6 + i) * 1.2; I.rotation.y = S(T * 0.1 + i) * 0.05; }); G.Dclouds.position.x = T * 1.5; G.DplanetS.rotation.y = T * 0.06; if (G.Dfall) G.Dfall.offset.y = T * 2.5;
  G.Dholes.forEach((H, i) => { const j = Math.floor(T * 10 + i * 3); H.visible = (j * 31 + i) % 23 !== 0; H.scale.setScalar(((j * 7919 + i) % 9 === 0) ? 1.12 : 1); });
  const v = VAN(), rp = REAP(); D_chunk.visible = true; D_chunk.scale.set(1, 1, 1); D_chunk.position.set(8, hfD(8, -35), -35); D_chunk.rotation.set(0, 0, 0); D_void.visible = T > v + 0.3 && T < TM.total;
  if (T > v - 0.4 && T < v + 0.3) { D_chunk.visible = Math.floor(T * 30) % 2 === 0; D_chunk.position.x += (Math.floor(T * 30) % 3 - 1) * 1.5; }
  if (T >= v + 0.3) { const k = prog(T, v + 0.3, v + 0.5); D_chunk.scale.set(1 + k * 0.3, 1 - k, 1 + k * 0.3); D_chunk.visible = k < 1; }
  if (T >= rp - 0.1) { const k = ease(prog(T, rp - 0.1, rp + 0.3)); D_chunk.visible = Math.floor(T * 30) % 3 !== 0 || T > rp + 0.4; D_chunk.position.set(-45, 44 + S(T) * 1.2, -140); D_chunk.rotation.set(0.12, 0.6, 0.25); D_chunk.scale.setScalar(Math.max(0.01, k)); }
  D_guyHole.visible = Math.floor(T * 6) % 3 !== 0; }
// ---------- SHOTS ----------
const S0 = CL[6].start, S1 = CL[7].start, S2 = CL[8].start, S3 = CL[9].start, END = CL[10].start;
function spaceShot(lt, T, mode, focus = -1, k = 0) { const pl = G.S.userData.pl;
  pl.forEach((m, i) => { m.visible = focus < 0 || focus === i; m.position.set(m.userData.home[0] + 0.05 * C(T * 0.55 + i * 1.3), m.userData.home[1] + 0.07 * S(T * 0.8 + i * 1.7), 0); m.scale.setScalar(1);
    m.userData.sph.rotation.set(0.22 + 0.03 * S(T * 0.4 + i), T * 0.35 + i * 1.7, 0.06 * S(T * 0.3 + i)); if (i === 3 && S(T * 9) > 0.8) m.position.x += 0.06 * S(T * 70); });
  if (mode === 'hook') { pl.forEach((m, i) => m.scale.setScalar(Math.max(0.001, ease(prog(T, 1.0 + i * 0.25, 1.4 + i * 0.25))))); camL([0, -0.5, 13.5], [0, -0.5, 11.5], prog(T, 0, CL[1].start), [0, -0.5, 0], [0, -0.5, 0]); }
  else if (mode === 'count') { cam([S(T * 0.6) * 0.6, -0.5 + C(T * 0.5) * 0.3, 11.5 - (T - CL[1].start) * 0.2], [0, -0.5, 0]); }
  else if (mode === 'approach') { const m = pl[focus]; m.position.set(0, 0.05 * S(T * 0.8), 0); m.userData.sph.rotation.y = T * 0.5; cam([0.3 * (1 - k), 0, lerp(8.0, 4.1, ease(k) * 0.6 + k * 0.4)], [0, 0, 0]); }
  else { camL([0, -0.5, 13.5], [0, -0.5, 11.5], prog(lt, 0, 2), [0, -0.5, 0], [0, -0.5, 0]); }
  const D_ = pl[3], sc = D_.scale.x; G.deb.forEach(c => { const u = c.userData; c.visible = D_.visible && sc > 0.05; const ph = (T * u.sp + u.o) % 1; const rr = (1.05 + ph * 1.5) * sc;
    c.position.set(D_.position.x + C(u.a) * rr, D_.position.y + S(u.a) * rr - ph * ph * 0.3 * sc, 0.3); c.scale.setScalar(sc); c.rotation.set(T * u.spin * 0.3, T * u.spin * 0.5, T * u.spin); const op = clamp(ph * 6) * clamp((1 - ph) * 3); c.material.opacity = op; u.e.material.opacity = 0.5 * op; }); }
// [startTime, planet, label, fn(k, lt, T)]
const SH = [
  [0, 'S', '', (k, lt, T) => spaceShot(lt, T, 'hook')],
  [CL[1].start, 'S', '', (k, lt, T) => spaceShot(lt, T, 'count')],
  // ---- A
  [S0, 'SA', '', (k, lt, T) => spaceShot(lt, T, 'approach', 0, k)],
  [AT(6, 'giant'), 'A', 'CRYSTAL MOUNTAINS', (k) => camL([-60, 8, -110], [40, 14, -115], k, [-30, 40, -230], [60, 45, -230])],
  [AT(6, 'deserts'), 'A', 'MIRROR DESERT', (k) => camLin([-20, 2.5, 40], [-5, 2.5, 0], k, [30, 2, -60], [50, 3, -90])],
  [AT(6, 'trees'), 'A', 'SHINING FOREST', (k) => camL([45, 4, 95], [55, 5, 75], k, [75, 9, 30], [80, 10, 25])],
  [AT(6, 'and'), 'A', 'CLEAR OCEAN', (k) => camL([OC[0] + 40, 30, OC[1] + 40], [OC[0] + 15, 18, OC[1] + 15], k, [OC[0], -30, OC[1]], [OC[0], -34, OC[1]])],
  [AT(6, 'mile') - 0.2, 'A', 'CLEAR OCEAN', (k) => camL([OC[0] + 5, 6, OC[1] - 5], [OC[0] + 3, -6, OC[1] - 3], k, [OC[0] + 1, -40, OC[1]], [OC[0], -45, OC[1]])],
  [AT(6, 'just'), 'A', 'GLASS BRIDGE', (k, lt, T) => { const u = G.Aguy; u.position.set(OC[0] - 30 + k * 4, 7.2, OC[1] + 10); u.rotation.y = PI / 2; run(u, T * 5, 0.5); camL([OC[0] - 22, 9.5, OC[1] + 16], [OC[0] - 23, 9.2, OC[1] + 14], k, [OC[0] - 28, 8.6, OC[1] + 10], [OC[0] - 26, 8.6, OC[1] + 10]); }],
  [AT(6, 'a', 2), 'A', 'GLASS BRIDGE', (k, lt, T) => { const u = G.Aguy; u.position.set(OC[0] - 26, 7.2, OC[1] + 10); u.rotation.y = 0.5; idle(u, T); u.userData.armR.rotation.x = -2.2; u.userData.armR.rotation.z = 0.4; camL([OC[0] - 24.5, 9.0, OC[1] + 13], [OC[0] - 25, 9.0, OC[1] + 12.2], k, [OC[0] - 26, 8.9, OC[1] + 10], [OC[0] - 26, 9.0, OC[1] + 10]); }],
  // ---- B
  [S1, 'SB', '', (k, lt, T) => spaceShot(lt, T, 'approach', 1, k)],
  [AT(7, 'the'), 'B', 'THE HORIZON', (k) => camL([0, 6, 60], [0, 9, 30], k, [0, 4, -300], [0, 8, -300])],
  [AT(7, 'under'), 'B', 'PURPLE CLOUDS', (k) => camL([20, 4, 20], [10, 6, 0], k, [0, 140, -120], [-30, 145, -160])],
  [AT(7, 'icy'), 'B', 'ICY MOUNTAINS', (k) => camL([190, 14, 60], [165, 22, 35], k, [260, 45, -240], [270, 55, -240])],
  [AT(7, 'forests'), 'B', 'GLOW FOREST', (k) => camL([60, 2.5, 90], [72, 3, 62], k, [75, 4, 20], [80, 5, 10])],
  [AT(7, 'a'), 'B', 'THE DARK OCEAN', (k) => camL([70, 5, -118], [52, 6, -128], k, [-10, 6, -260], [-30, 7, -280])],
  [AT(7, 'boats') - 0.3, 'B', 'LITTLE BOATS', (k) => camL([22, 3.2, -150], [14, 3.4, -158], k, [-8, 1, -225], [-14, 1, -232])],
  [AT(7, 'oasis') - 0.3, 'B', 'THE OASIS', (k) => camL([28, 15, -248], [18, 11, -262], k, [-10, 4, -300], [-10, 4, -300])],
  [AT(7, 'and', 1), 'B', 'NEON CITY', (k) => camL([20, 40, 60], [-20, 60, 20], k, [-80, 40, -60], [-100, 60, -100])],
  [AT(7, 'artificial') - 0.4, 'B', 'ARTIFICIAL SUN', (k) => camL([0, 30, 20], [-8, 40, 8], k, [-40, 100, -60], [-45, 108, -70])],
  [AT(7, "it's", 1), 'B', 'MINUS 40 DEGREES', (k, lt, T) => { const u = G.Bguy; u.position.set(0, 0, 0); u.rotation.y = 0.3; idle(u, T); u.userData.armL.rotation.set(-1.2, 0, 0.75); u.userData.armR.rotation.set(-1.2, 0, -0.75); u.userData.head.rotation.x = 0.15; u.position.x = S(T * 50) * 0.02; G.Bsnow.position.set(-40, 0, -40); camL([1.2, 2.0, 4.0], [0.8, 1.9, 3.2], k, [0, 1.6, 0], [0, 1.7, 0]); }],
  [AT(7, 'but'), 'B', 'GOLDEN HOUR', (k, lt, T) => { const u = G.Bguy; u.position.set(0, hfB(0, -20), -20); u.rotation.y = PI; idle(u, T); cam([lerp(3, 0, ease(k)), 2.5, lerp(-6, -4, ease(k))], [0, 3, -300]); }],
  // ---- C
  [S2, 'SC', '', (k, lt, T) => spaceShot(lt, T, 'approach', 2, k)],
  [AT(8, 'absolutely'), 'C', 'NOTHING HAPPENING', (k, lt, T) => { const u = G.Cguy; u.position.set(0, 0, 0); u.rotation.y = 0; pose0(u); cam([2.4, 1.7, 5.5], [0, 1.4, 0]); }],
  [AT(8, 'flat'), 'C', 'FLAT GREY DESERT', (k) => camL([60, 3, 60], [50, 3, 40], k, [60, 1, -100], [40, 1, -100])],
  [AT(8, 'dull'), 'C', 'DULL MOUNTAINS', (k) => camL([-20, 6, -120], [0, 6, -130], k, [-20, 15, -260], [0, 15, -260])],
  [AT(8, 'identical'), 'C', 'IDENTICAL HOUSES', (k) => camLin([4, 3, 5], [4, 3, -70], k, [-20, 3, -30], [-20, 3, -100])],
  [AT(8, 'the'), 'C', 'THE SKY', (k) => camL([0, 2, 10], [0, 2, 10], k, [0, 30, -40], [0, 60, -30])],
  [AT(8, 'every'), 'C', 'DAY 1', (k, lt, T) => boringDay(T)],
  [AT(8, 'exactly', 1), 'C', 'DAY 2', (k, lt, T) => boringDay(T)],
  [AT(8, 'same', 1), 'C', 'DAY 365', (k, lt, T) => boringDay(T)],
  [AT(8, 'but'), 'C', 'DANGER LEVEL 0%', (k, lt, T) => { const u = G.Cguy; u.position.set(0, 0.0, -0.1); u.rotation.y = 0; pose0(u); u.userData.legL.rotation.x = u.userData.legR.rotation.x = -1.5; u.userData.body.position.y = -0.35; u.userData.armR.rotation.x = -1.6 * ease(prog(lt, 0.5, 0.9)); G.Cchair.position.set(0, 0, 0); G.Cchair.visible = true; camL([2.6, 1.6, 4.4], [2.2, 1.5, 3.6], k, [0, 1.2, 0], [0, 1.25, 0]); }],
  // ---- D
  [S3, 'SD', '', (k, lt, T) => spaceShot(lt, T, 'approach', 3, k)],
  [AT(9, 'reality'), 'D', 'THE RUINS', (k) => camL([-8, 1.3, 15], [-12, 1.5, 9], k, [-24, 4, -16], [-24, 4.6, -16])],
  [AT(9, 'whole'), 'D', 'FLOATING ISLANDS', (k) => camL([4, 3, 28], [10, 7, 18], k, [5, 32, -110], [15, 36, -120])],
  [AT(9, 'holes'), 'D', 'HOLES IN THE SKY', (k) => camL([0, 3, 12], [4, 4, 6], k, [40, 70, -240], [90, 125, -380])],
  [AT(9, 'and'), 'D', 'RESET IN 24 HOURS', (k) => camL([40, 14, 12], [34, 15, 6], k, [8, 2, -35], [8, 2.5, -35])],
  [REAP() - 0.05, 'D', 'SOMEWHERE ELSE', (k) => camL([-8, 12, 2], [-16, 16, -6], k, [-45, 44, -140], [-45, 46, -140])],
  [AT(9, 'hopefully'), 'D', 'YOU ARE HERE', (k, lt, T) => { const u = G.Dguy; u.position.set(5, hfD(5, 5), 5); u.rotation.y = 0.4; idle(u, T); u.userData.head.rotation.x = 0.5; u.userData.head.rotation.y = S(T * 3) * 0.6; camL([10, 4.6, 13], [9, 3.6, 11.5], k, [5.5, 1.0, 4.5], [5.5, 1.2, 4.5]); }],
  // ---- outro
  [END, 'S', '', (k, lt, T) => spaceShot(lt, T, 'end')],
];
function hfB(x, z) { return 2.2 * S(x * 0.04) * C(z * 0.05) + 1.2 * S((x - z) * 0.09) - oceanDip(x, z); }
function pose0(p) { const u = p.userData; u.body.position.y = 0; u.body.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); }
function boringDay(T) { const u = G.Cguy; u.position.set(0, 0, 0); u.rotation.y = 0; pose0(u); cam([2.4, 1.7, 5.5], [0, 1.4, 0]); }
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }

// ---------- HUD ----------
function bigText(ctx, s, y, size, col = '#ffd23a', a = 1, font = 'Russo', x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#05081a'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
const PL = { A: { n: 'PLANET A', c: '#8ff0ff', s: 'TEMP 24°C . DANGER LOW' }, B: { n: 'PLANET B', c: '#c88aff', s: 'TEMP MINUS 40°C . ALWAYS DUSK' }, C: { n: 'PLANET C', c: '#c8c8c8', s: 'TEMP 15°C . EVENTS TODAY 0' }, D: { n: 'PLANET D', c: '#ff5ae8', s: 'TEMP ERROR . STATUS UNKNOWN' } };
function header(ctx, p, T, t0) { const P = PL[p]; const k = ease(prog(T, t0, t0 + 0.35)); ctx.save(); ctx.translate(lerp(-600, 0, k), 0);
  ctx.fillStyle = 'rgba(6,8,20,0.72)'; ctx.beginPath(); ctx.roundRect(24, 50, 620, 120, 22); ctx.fill(); ctx.strokeStyle = P.c; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = P.c; ctx.beginPath(); ctx.arc(94, 110, 44, 0, 7); ctx.fill(); ctx.font = '58px Russo'; ctx.fillStyle = '#05081a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p, 94, 113);
  ctx.textAlign = 'left'; ctx.font = '46px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(P.n, 156, 96); ctx.font = '16px PressStart'; ctx.fillStyle = P.c; ctx.fillText(P.s, 158, 142); ctx.restore(); }
function locLabel(ctx, s, T, t0, col) { if (!s) return; const k = ease(prog(T, t0 + 0.05, t0 + 0.35)); ctx.save(); ctx.globalAlpha = k; ctx.font = '30px Russo'; const w = ctx.measureText(s).width + 70; const x = 30, y = 930;
  ctx.fillStyle = 'rgba(6,8,20,0.75)'; ctx.beginPath(); ctx.roundRect(x, y, w, 56, 28); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 30, y + 22, 11, PI, 0); ctx.lineTo(x + 30, y + 42); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#05081a'; ctx.beginPath(); ctx.arc(x + 30, y + 22, 4.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 52, y + 29); ctx.restore(); }
const CAPS = [];
CL.forEach((c0, ci) => { if (ci >= 1 && ci <= 5) return; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^(Planet|Giant|Deserts|Trees|And|Just|A|The|So|Under|Icy|Forests|It's|But|Absolutely|Ever|Flat|Dull|Identical|Exactly|Reality|Buildings|Hopefully|Comment|No|Choose|You)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/\btwenty four\b/i, '24'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '52px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1090 - (lines.length - 1) * 32; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 64); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 64); }); ctx.restore(); }
const V = new T3.Vector3(); function proj(o) { o.getWorldPosition(V); V.project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H]; }

window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart', '30px Bangers'].map(f => document.fonts.load(f)));
  makeTextures();
  for (const k of 'ABCD') { const im = new Image(); im.src = window['PLANET_' + k]; await im.decode(); const t = new T3.Texture(im); t.colorSpace = T3.SRGBColorSpace; t.needsUpdate = true; PTEX[k] = t; }
  for (const k of 'ABCD') ETEX[k] = etex(k, k === 'D');
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(60, RW / RH, 0.1, 2000); scene = new T3.Scene();
  buildSpace(); buildA(); buildB(); buildBocean(); buildC(); buildD();
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d');
};
window.DURATION = TM.total;
const FOGS = { S: null, A: ['#b8d8f4', 220, 900], B: ['#2a1640', 60, 520], C: ['#a2a2a0', 40, 320], D: ['#4a3060', 110, 620] };
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total, p = sh[1]; const k = prog(T, t0, t1), lt = T - t0;
  const grp = p[0] === 'S' ? 'S' : p, PL_ = p.length === 2 ? p[1] : p;
  for (const key of ['S', 'A', 'B', 'C', 'D']) G[key].visible = key === grp;
  scene.background = new T3.Color(grp === 'S' ? '#02020a' : '#000'); const f = FOGS[grp]; scene.fog = f ? new T3.Fog(f[0], f[1], f[2]) : null;
  camera.fov = 60; camera.updateProjectionMatrix();
  G.Aguy.visible = G.Bguy.visible = G.Cguy.visible = G.Dguy.visible = false; G.Cchair.visible = false; G.Csign.visible = false;
  if (p === 'A') { updA(T); G.Aguy.visible = sh[2] === 'GLASS BRIDGE'; pose0(G.Aguy); }
  if (p === 'B') { updB(T); updBocean(T); G.Bguy.visible = /MINUS|GOLDEN/.test(sh[2]); pose0(G.Bguy); G.Bsnow.position.set(-40, 0, -40); }
  if (p === 'C') { G.Cguy.visible = /NOTHING|DAY|DANGER/.test(sh[2]); G.Csign.visible = /NOTHING|DAY/.test(sh[2]); G.Csign.position.set(-2.2, 0, -4); G.Csign.rotation.y = 0.3; }
  if (p === 'D') { updD(T); G.Dguy.visible = sh[2] === 'YOU ARE HERE'; pose0(G.Dguy); }
  sh[3](k, lt, T);
  if (grp === 'D') G.Dholes.forEach(H => H.lookAt(camera.position));
  renderer.render(scene, camera);
  // ---- composite (smooth upscale, soft bloom)
  octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high'; octx.globalCompositeOperation = 'source-over'; octx.drawImage(glc, 0, 0, W, H);
  const bloom = { S: 0.25, A: 0.18, B: 0.45, C: 0, D: 0.28 }[grp]; if (bloom) { sctx.drawImage(glc, 0, 0, 90, 160); octx.globalCompositeOperation = 'screen'; octx.globalAlpha = bloom; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over'; }
  if (p === 'A') { const gl = 0.25 + 0.15 * S(T * 3); const gr = octx.createRadialGradient(620, 160, 0, 620, 160, 420); gr.addColorStop(0, `rgba(255,255,240,${gl * 0.45})`); gr.addColorStop(1, 'rgba(255,255,240,0)'); octx.fillStyle = gr; octx.fillRect(0, 0, W, H);
    if (sh[2] === 'GLASS BRIDGE' && si === SH.findIndex(s => s[0] === AT(6, 'a', 2))) { const fl = 0.5 + 0.4 * S(T * 20); octx.fillStyle = `rgba(255,255,255,${fl * 0.35})`; octx.fillRect(0, 0, W, H); } }
  if (p === 'D' || p === 'SD') { const r = rng(Math.floor(T * 12)); const burst = (T > VAN() - 0.4 && T < VAN() + 0.5) || (T > REAP() - 0.2 && T < REAP() + 0.4) ? 3 : 1; const n = Math.floor(r() * 4 * burst) + (r() < 0.3 ? 2 : 0);
    for (let i = 0; i < n; i++) { const y = r() * H, h = 10 + r() * 60 * burst, dx = (r() - 0.5) * 80 * burst; octx.drawImage(out, 0, y, W, h, dx, y, W, h); octx.fillStyle = r() < 0.5 ? 'rgba(255,60,230,0.18)' : 'rgba(60,255,220,0.18)'; octx.fillRect(0, y, W, h); } }
  if (p === 'C') { octx.fillStyle = 'rgba(128,128,128,0.08)'; octx.fillRect(0, 0, W, H); }
  octx.fillStyle = 'rgba(0,0,0,0.04)'; for (let y = 0; y < H; y += 4) octx.fillRect(0, y, W, 1);
  const vg = octx.createRadialGradient(360, 640, 450, 360, 640, 950); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // ---- overlays
  if (p === 'S') { const pl = G.S.userData.pl; const names = ['GLASS', 'ECLIPSIA', 'BORING', '404'], cols = ['#8ff0ff', '#c88aff', '#c8c8c8', '#ff5ae8'];
    pl.forEach((m, i) => { const [x, y] = proj(m); const a = ci === 0 ? prog(T, 1.2 + i * 0.25, 1.5 + i * 0.25) : 1; bigText(octx, 'ABCD'[i], y - 150, 66, cols[i], a, 'Russo', x); });
    if (ci === 0) { bigText(octx, 'PICK A PLANET', 110, 80, '#ffd23a', prog(T, 0.1, 0.4)); bigText(octx, 'LIVE THERE FOR 1 YEAR', 180, 40, '#fff', prog(T, AT(0, 'you') - 0.1, AT(0, 'you') + 0.2)); }
    if (ci >= 1 && ci <= 5) { const n = 6 - ci, lt2 = T - CL[ci].start, tot = prog(T, CL[1].start, S0); const col = n <= 2 ? '#ff5a3a' : '#ffd23a'; const cx = 360, cy = 660, R = 210;
      octx.save(); octx.fillStyle = 'rgba(2,2,12,0.45)'; octx.fillRect(0, 0, W, H); octx.fillStyle = 'rgba(6,8,22,0.85)'; octx.beginPath(); octx.arc(cx, cy, R - 20, 0, 7); octx.fill();
      octx.lineWidth = 30; octx.strokeStyle = 'rgba(255,255,255,0.14)'; octx.beginPath(); octx.arc(cx, cy, R, 0, 7); octx.stroke();
      octx.strokeStyle = col; octx.lineCap = 'round'; octx.shadowColor = col; octx.shadowBlur = 24; octx.beginPath(); octx.arc(cx, cy, R, -PI / 2, -PI / 2 + PI * 2 * Math.max(0.001, 1 - tot)); octx.stroke(); octx.shadowBlur = 0;
      for (let q = 0; q < 5; q++) { const a = -PI / 2 + q / 5 * PI * 2; octx.fillStyle = '#05081a'; octx.beginPath(); octx.arc(cx + C(a) * R, cy + S(a) * R, 7, 0, 7); octx.fill(); }
      const ea = -PI / 2 + PI * 2 * (1 - tot); octx.fillStyle = '#fff'; octx.beginPath(); octx.arc(cx + C(ea) * R, cy + S(ea) * R, 12, 0, 7); octx.fill();
      const sc = 1 + 0.35 * (1 - ease(prog(lt2, 0, 0.2))); octx.translate(cx, cy); octx.scale(sc, sc); bigText(octx, String(n), 8, 230, col, 1, 'Russo', 0); octx.restore(); }
    if (ci === 10) { bigText(octx, 'WHICH ONE?', 110, 84, '#ffd23a', prog(T, END, END + 0.3)); bigText(octx, 'COMMENT A B C OR D', 180, 44, '#fff', prog(T, AT(10, 'comment') - 0.1, AT(10, 'comment') + 0.2)); } }
  else { const pStart = SH.find(s => s[1] === PL_ || s[1] === 'S' + PL_)[0]; header(octx, PL_, T, pStart); locLabel(octx, sh[2], T, t0, PL[PL_].c);
    if (p === 'A' && /CLEAR OCEAN/.test(sh[2])) { const d = Math.round(lerp(0, 5280, prog(T, AT(6, 'clear'), AT(6, 'down') + 0.4))); bigText(octx, `DEPTH ${d.toLocaleString('en-US').replace(',', ' ')} FT`, 260, 40, '#8ff0ff', prog(T, AT(6, 'clear'), AT(6, 'clear') + 0.2)); }
    if (p === 'A' && T > AT(6, 'a', 2)) bigText(octx, 'BRING SUNGLASSES', 300, 56, '#ffd23a', prog(T, AT(6, 'a', 2), AT(6, 'a', 2) + 0.2));
    if (p === 'B' && T > AT(7, 'golden')) bigText(octx, 'ALWAYS GOLDEN HOUR', 300, 52, '#ffb060', prog(T, AT(7, 'golden'), AT(7, 'golden') + 0.3));
    if (p === 'C' && /NOTHING/.test(sh[2])) bigText(octx, 'EVENTS TODAY . 0', 300, 52, '#c8c8c8', 1);
    if (p === 'C' && /^DAY/.test(sh[2])) { bigText(octx, sh[2], 320, 110, '#ffffff', 1); bigText(octx, 'EXACTLY THE SAME', 410, 40, '#c8c8c8', 1); }
    if (p === 'C' && /DANGER/.test(sh[2])) bigText(octx, 'NOTHING CAN HURT YOU', 300, 48, '#7dffb0', prog(T, t0, t0 + 0.3));
    if (p === 'D') { if (/RESET/.test(sh[2])) { const left = Math.max(0, 24 * 3600 * (1 - prog(T, AT(9, 'every'), VAN()))); const hh = Math.floor(left / 3600), mm = Math.floor(left / 60) % 60, ss = Math.floor(left) % 60; const st = `${String(hh).padStart(2, '0')} . ${String(mm).padStart(2, '0')} . ${String(ss).padStart(2, '0')}`; bigText(octx, T < VAN() ? st : 'DELETED', 300, T < VAN() ? 70 : 90, '#ff5ae8', 1, T < VAN() ? 'Russo' : 'Bangers'); }
      if (/SOMEWHERE/.test(sh[2])) bigText(octx, 'RESTORED', 300, 80, '#3affd8', 1, 'Bangers');
      if (/YOU ARE HERE/.test(sh[2])) bigText(octx, 'SAVE YOUR GAME?', 300, 56, '#ff5ae8', prog(T, t0 + 0.3, t0 + 0.6)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  // planet transitions: quick flash
  for (const ts of [S0, S1, S2, S3, END]) if (T >= ts && T < ts + 0.2) { octx.fillStyle = `rgba(255,255,255,${0.8 * (1 - (T - ts) / 0.2)})`; octx.fillRect(0, 0, W, H); }
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
