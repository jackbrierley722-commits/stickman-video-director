
// ---------- sets ----------
const YD = [0, 0, 0], LK = [50, 0, 0], GR = [100, 0, 0], DW = [150, 0, 0];
const R = {}; const WINM = []; const SIRENS = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof) { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4; add(h, Bx(1.2, 2.2, 0.12), SM('#7a4a2a'), 0, 1.1, 3.02);
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); } return h; }
function fence(g, x0, x1, z) { const fm = SM('#c49a6c'); for (let x = x0; x <= x1; x += 0.5) add(g, Bx(0.12, 1.3, 0.08), fm, x, 0.65, z); add(g, Bx(x1 - x0, 0.1, 0.06), fm, (x0 + x1) / 2, 1.0, z + 0.06); add(g, Bx(x1 - x0, 0.1, 0.06), fm, (x0 + x1) / 2, 0.4, z + 0.06); }
// the body: a rolled-up rug with two shoes poking out (cartoon, nothing graphic)
function rug(g, x, y, z, ry = 0) { const r = new T3.Group(); r.position.set(x, y, z); r.rotation.y = ry; g.add(r); const c = add(r, Cy(0.32, 0.32, 1.8, 14), SM('#b23a48', { map: ctex(64, 64, q => { q.fillStyle = '#b23a48'; q.fillRect(0, 0, 64, 64); q.fillStyle = '#e8c07a'; for (let i = 0; i < 64; i += 16) q.fillRect(0, i, 64, 4); }) }), 0, 0.32, 0); c.rotation.z = PI / 2;
  for (const z_ of [-0.12, 0.12]) add(r, Bx(0.18, 0.22, 0.14), SM('#2a2220'), 1.0, 0.3, z_); return r; }
function hand(g, x, y, z) { const h = new T3.Group(); h.position.set(x, y, z); g.add(h); const sk = SM('#e0a878'); add(h, Bx(0.22, 0.4, 0.14), sk, 0, 0.2, 0); for (let i = 0; i < 4; i++) add(h, Bx(0.045, 0.16, 0.06), sk, -0.075 + i * 0.05, 0.47, 0); add(h, Bx(0.05, 0.12, 0.06), sk, 0.13, 0.32, 0).rotation.z = -0.6; return h; }
function policeCar(g, x, z, ry) { const c = new T3.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); add(c, Bx(2.0, 0.8, 4.2), SM('#f4f4f4'), 0, 0.7, 0); add(c, Bx(1.8, 0.7, 2.2), SM('#f4f4f4'), 0, 1.45, -0.2); add(c, Bx(2.02, 0.25, 4.22), SM('#1d3f8a'), 0, 0.8, 0); add(c, Bx(1.7, 0.55, 2.0), SM('#1b2430', { roughness: 0.2 }), 0, 1.45, -0.2);
  for (const [wx, wz] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) add(c, Cy(0.38, 0.38, 0.3, 12), SM('#151515'), wx, 0.38, wz).rotation.z = PI / 2;
  const red = add(c, Bx(0.6, 0.18, 0.35), SM('#550000', { emissive: '#ff2030', emissiveIntensity: 0 }), -0.35, 1.9, -0.2), blue = add(c, Bx(0.6, 0.18, 0.35), SM('#000055', { emissive: '#2050ff', emissiveIntensity: 0 }), 0.35, 1.9, -0.2);
  const lr = new T3.PointLight('#ff2030', 0, 14, 1.5), lb = new T3.PointLight('#2050ff', 0, 14, 1.5); lr.position.set(-0.6, 2.4, -0.2); lb.position.set(0.6, 2.4, -0.2); c.add(lr); c.add(lb); SIRENS.push({ c, red, blue, lr, lb }); return c; }
function tape(g, pts) { const tm = SM('#ffd400', { map: ctex(256, 32, q => { q.fillStyle = '#ffd400'; q.fillRect(0, 0, 256, 32); q.fillStyle = '#111'; q.font = '20px Russo'; q.fillText('POLICE LINE . DO NOT CROSS', 8, 23); }) });
  for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = add(g, Bx(L, 0.18, 0.02), tm, (a[0] + b[0]) / 2, 1.0, (a[1] + b[1]) / 2, false); m.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); }
  for (const p of pts) add(g, Cy(0.05, 0.05, 1.1, 6), SM('#ff7a00'), p[0], 0.55, p[1]); }
function dogMesh(g) { const d = new T3.Group(); g.add(d); const fur = SM('#a0652e'); add(d, Bx(0.45, 0.4, 0.9), fur, 0, 0.55, 0); const hd = add(d, Bx(0.4, 0.38, 0.4), fur, 0, 0.85, 0.5); add(d, Bx(0.22, 0.16, 0.2), SM('#7a4a20'), 0, 0.78, 0.76); add(d, Bx(0.08, 0.08, 0.04), BM('#111'), 0, 0.84, 0.86);
  for (const x of [-0.12, 0.12]) { add(d, Bx(0.07, 0.07, 0.02), BM('#111'), x, 0.92, 0.705); add(d, Bx(0.1, 0.22, 0.06), SM('#5a3510'), x * 1.5, 1.05, 0.45); }
  d.userData.legs = [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]].map(([x, z]) => { const l = new T3.Group(); l.position.set(x, 0.4, z); d.add(l); add(l, Bx(0.12, 0.4, 0.12), fur, 0, -0.2, 0); return l; });
  const tl = add(d, Bx(0.08, 0.08, 0.4), fur, 0, 0.75, -0.6); tl.rotation.x = -0.6; d.userData.tail = tl; return d; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const you = (extra = {}) => person(Object.assign({ skin: '#e0a878', top: '#3b3b3b', bot: '#2d3436', hair: '#2b1a10', style: 'short', face: 'shock' }, extra));
  const cop = (i) => { const p = person({ skin: ['#c68a5a', '#ffd9b8', '#8d5a3a'][i % 3], top: '#1d2f5a', bot: '#1d2f5a', hair: '#1a1a1a', style: 'short', extras: ['cap'], capCol: '#1d2f5a', face: 'angry' }); return p; };

  // ===== BACKYARD =====
  const YG = grp(YD); house(YG, 0, -9, 0, '#ffd6a5', '#c0392b'); house(YG, 9, -9, 0, '#a0c4ff', '#2c3e50'); fence(YG, -6, 12, -4.5); tree(YG, -5, -2); tree(YG, 8, 1, 0.9);
  R.mound = add(YG, Sp(0.9, 10, 6, 0, 2 * PI, 0, PI / 2), SM('#6b4a2e'), -0.6, 0, 0.2); R.hole = add(YG, Cy(0.9, 0.9, 0.04, 16), BM('#2a1a10'), 0.9, 0.02, 0.4, false);
  R.shovel = new T3.Group(); YG.add(R.shovel); add(R.shovel, Cy(0.04, 0.04, 1.4, 6), SM('#8a5a32'), 0, 0.7, 0); add(R.shovel, Bx(0.3, 0.35, 0.04), SM('#8a8a8a', { metalness: 0.6 }), 0, 0.02, 0);
  R.rugY = rug(YG, 0.9, -0.1, 0.4, 0.3); R.youY = you({ face: 'shock' }); place(R.youY, YG, 2.2, 0.6, -1.0); tag(R.youY, 'YOU', '#ff9a9a');
  R.dog = dogMesh(YG); R.rugDog = rug(YG, 0, 0, 0, 0); R.copsY = [cop(0), cop(1)]; R.copsY.forEach((p, i) => { place(p, YG, 4 + i * 1.2, 3.5, PI + 0.4); tag(p, 'POLICE', '#9ad0ff'); }); R.carY = policeCar(YG, 6.5, 6, -0.6);
  tape(YG, [[2, 1.5], [6, 1.5], [6, 5], [2, 5]]); R.tapeY = YG.children.slice(-8);

  // ===== LAKE =====
  const LG = grp(LK); add(LG, Bx(60, 0.05, 40), SM('#2f8fd4', { roughness: 0.15, metalness: 0.1 }), 0, 0.05, -18); add(LG, Bx(60, 0.3, 4), SM('#d9c08a'), 0, 0.05, 3);
  add(LG, Bx(1.6, 0.2, 7), SM('#8a5a32'), -3, 0.5, -1.5); for (const z of [-4.5, -1.5, 1.5]) for (const x of [-3.6, -2.4]) add(LG, Cy(0.1, 0.1, 1.2, 6), SM('#6b4423'), x, 0.1, z);
  tree(LG, 8, 4); tree(LG, -10, 5, 1.2); tree(LG, 14, 6);
  R.boat = new T3.Group(); R.boat.position.set(3, 0.1, -7); LG.add(R.boat); add(R.boat, Bx(1.6, 0.5, 3.4), SM('#c0392b'), 0, 0.2, 0); add(R.boat, Bx(1.3, 0.1, 3.0), SM('#8a5a32'), 0, 0.42, 0);
  R.fisher = person({ skin: '#ffd9b8', top: '#f1c40f', bot: '#2e3d66', hair: '#7a7a7a', style: 'short', extras: ['beard'], face: 'grin' }); place(R.fisher, R.boat, 0, -0.6, PI / 2 + 0.3); R.fisher.position.y = 0.35; tag(R.fisher, 'FISHERMAN', '#ffe27a');
  R.rod = new T3.Group(); R.fisher.userData.armR.add(R.rod); R.rod.position.set(0, -0.8, 0.1); add(R.rod, Cy(0.025, 0.035, 2.6, 6), SM('#222'), 0, 1.1, 0.6).rotation.x = 0.5;
  R.rugL = rug(LG, 5.2, 0, -7, 0.4); R.line = add(LG, Cy(0.008, 0.008, 1, 4), BM('#ffffff'), 0, 0, 0, false);
  R.youL = you({ face: 'shock' }); place(R.youL, LG, -3, -3.6, 0); R.youL.position.y = 0.6; tag(R.youL, 'YOU', '#ff9a9a'); R.rugL0 = rug(LG, -3, 0.6, -4.6, PI / 2);
  R.splash = []; for (let i = 0; i < 10; i++) R.splash.push(add(LG, Sp(0.1, 6, 5), BM('#d8f0ff'), 0, -5, 0, false));
  R.copBoatCar = policeCar(LG, -9, 3.5, 0.4);

  // ===== GARAGE =====
  const GG = grp(GR); add(GG, Bx(9, 0.1, 7), SM('#8a8a8a'), 0, 0.05, 0); add(GG, Bx(9, 4, 0.2), SM('#b8b0a0'), 0, 2, -3.5); add(GG, Bx(0.2, 4, 7), SM('#b8b0a0'), -4.5, 2, 0); add(GG, Bx(0.2, 4, 7), SM('#b8b0a0'), 4.5, 2, 0);
  for (const y of [1.2, 2.2, 3.2]) add(GG, Bx(3, 0.08, 0.6), SM('#8a5a32'), 2.6, y, -3.1); for (let i = 0; i < 6; i++) add(GG, Bx(0.4, 0.4, 0.4), SM(['#e67e22', '#3498db', '#95a5a6'][i % 3]), 1.6 + (i % 3) * 0.8, 1.45 + Math.floor(i / 3), -3.1);
  R.freezer = new T3.Group(); R.freezer.position.set(-1.2, 0, -2.2); GG.add(R.freezer); add(R.freezer, Bx(2.4, 1.1, 1.1), SM('#f4f6f8'), 0, 0.55, 0); R.lid = new T3.Group(); R.lid.position.set(0, 1.12, -0.55); R.freezer.add(R.lid); add(R.lid, Bx(2.4, 0.1, 1.1), SM('#e8ecef'), 0, 0, 0.55);
  R.fzLight = add(R.freezer, Bx(0.12, 0.08, 0.02), SM('#002200', { emissive: '#30ff60', emissiveIntensity: 2 }), 0.9, 0.9, 0.56); R.rugF = rug(R.freezer, -0.9, 0.5, 0, 0);
  R.bulbG = new T3.PointLight('#fff2cc', 20, 14, 1.5); R.bulbG.position.set(0, 3.6, 0); GG.add(R.bulbG); R.bulbM = add(GG, Sp(0.15, 8, 6), SM('#fff', { emissive: '#fff2cc', emissiveIntensity: 2 }), 0, 3.7, 0, false);
  R.stink = []; for (let i = 0; i < 6; i++) R.stink.push(add(GG, new T3.TorusGeometry(0.25, 0.04, 6, 14, PI * 1.4), BM('#7dff5a', { transparent: true, opacity: 0 }), 0, 0, 0, false));
  R.youG = you({ face: 'shock' }); place(R.youG, GG, 0.6, -0.8, -0.9); tag(R.youG, 'YOU', '#ff9a9a');
  R.landlord = person({ skin: '#ffd9b8', top: '#8e7cc3', bot: '#4a4a4a', hair: '#dddddd', style: 'bald', extras: ['glasses', 'mustache'], face: 'angry' }); place(R.landlord, GG, 2.6, 2.6, -2.6); tag(R.landlord, 'LANDLORD', '#d7c4ff');
  R.copsG = [cop(1)]; place(R.copsG[0], GG, 3.6, 3.4, -2.6); tag(R.copsG[0], 'POLICE', '#9ad0ff');

  // ===== DRIVEWAY =====
  const DG = grp(DW); house(DG, 0, -7, 0, '#fdffb6', '#16a085'); tree(DG, -6, -3); tree(DG, 6, -4); add(DG, Bx(30, 0.06, 4), SM('#55585e'), 0, 0.03, 6);
  R.conc = add(DG, Bx(3.6, 0.12, 6), SM('#b8b8b8', { roughness: 0.9 }), 0, 0.06, 0.2); R.hand = hand(DG, 0.6, 0.06, 0.8);
  R.builder = person({ skin: '#c68a5a', top: '#ff7a00', bot: '#2e3d66', hair: '#1a1a1a', style: 'short', extras: ['cap'], capCol: '#f1c40f', face: 'grin' }); place(R.builder, DG, -2.6, 1.4, 0.6); tag(R.builder, 'BUILDER', '#ffbf7a');
  R.phB = new T3.Group(); R.builder.userData.armR.add(R.phB); R.phB.position.set(0, -0.82, 0.22); add(R.phB, Bx(0.3, 0.5, 0.05), SM('#111'), 0, 0, 0);
  R.trowel = add(R.builder.userData.armL, Bx(0.3, 0.04, 0.5), SM('#999', { metalness: 0.6 }), 0, -0.85, 0.2);
  R.carD = policeCar(DG, 4.5, 6, -1.2); R.copsD = [cop(0), cop(2)]; R.copsD.forEach((p, i) => { place(p, DG, 1.6 + i * 1.3, 3.8, PI + 0.3); tag(p, 'POLICE', '#9ad0ff'); });
  R.youD = you({ face: 'shout' }); place(R.youD, DG, 3.0, 3.0, 0.3); tag(R.youD, 'YOU', '#ff9a9a');
  R.det = person({ skin: '#8d5a3a', top: '#6b4a2e', bot: '#3a2e24', hair: '#1a1a1a', style: 'short', extras: ['coat', 'mustache'], face: 'neutral' }); place(R.det, DG, -0.4, 4.4, 0.2); tag(R.det, 'DETECTIVE', '#ffd34a'); R.detL = new T3.PointLight('#ffe8c0', 0, 8, 1.5); R.detL.position.set(-0.2, 2.6, 6.4); DG.add(R.detL);
}

// ---------- mood ----------
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [10, 22, 12], hs: '#cfe9ff', win: 0 }, night: { bg: '#0e1733', fog: '#0e1733', hemi: 0.35, sun: 0.7, sc: '#8fa8ff', off: [-10, 22, 12], hs: '#4a5a8a', win: 1.3 }, dark: { bg: '#05060a', fog: '#05060a', hemi: 0.12, sun: 0.0, sc: '#8fa8ff', off: [-10, 22, 12], hs: '#3a4a6a', win: 0.4 } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 40; scene.fog.far = 160; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); WINM.forEach(w => w.emissiveIntensity = M.win); }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];

// ---------- shots ----------
const SH = [
  [0, 'day', YD, (k, T) => dolly(P(YD, -1.5, 3.4, 9.5), P(YD, -1.2, 3.2, 8.4), P(YD, 2.5, 1.0, 2.5), P(YD, 2.6, 1.1, 2.4), k, T)],
  [E.hide - 0.1, 'night', YD, (k, T) => dolly(P(YD, 3.6, 2.2, 4.6), P(YD, 3.2, 2.1, 3.8), P(YD, 1.2, 1.0, 0.4), P(YD, 1.2, 1.1, 0.4), k, T)],
  [E.bury - 0.1, 'night', YD, (k, T) => dolly(P(YD, -2.6, 2.8, 4.4), P(YD, -2.2, 2.6, 3.6), P(YD, 1.2, 0.8, 0.4), P(YD, 1.2, 0.8, 0.4), k, T)],
  [E.dog - 0.1, 'day', YD, (k, T) => dolly(P(YD, -1.5, 2.6, 8.5), P(YD, -1.2, 2.8, 7.5), P(YD, 2.5, 0.8, 2.6), P(YD, 2.5, 0.9, 2.6), k, T)],
  [E.a2, 'night', LK, (k, T) => dolly(P(LK, 0.5, 2.4, 1.6), P(LK, 0.2, 2.3, 0.8), P(LK, -3, 1.2, -4.2), P(LK, -3, 1.0, -4.8), k, T)],
  [E.fisher - 0.1, 'day', LK, (k, T) => dolly(P(LK, 9, 2.6, -1.5), P(LK, 8, 2.8, -2.5), P(LK, 4, 1.6, -7), P(LK, 4.4, 2.2, -7), k, T)],
  [E.a3, 'day', GR, (k, T) => dolly(P(GR, 2.4, 2.6, 3.2), P(GR, 2.0, 2.5, 2.4), P(GR, -1.0, 1.0, -2.2), P(GR, -1.0, 1.0, -2.2), k, T)],
  [E.power - 0.1, 'dark', GR, (k, T) => dolly(P(GR, 1.8, 2.0, 2.4), P(GR, 1.4, 2.0, 1.8), P(GR, -1.2, 1.0, -2.2), P(GR, -1.2, 1.1, -2.2), k, T)],
  [E.smell - 0.1, 'day', GR, (k, T) => dolly(P(GR, -2.4, 2.4, 1.8), P(GR, -2.0, 2.3, 1.4), P(GR, 2.6, 1.9, 2.6), P(GR, 2.6, 1.9, 2.6), k, T)],
  [E.like, 'day', GR, (k, T) => dolly(P(GR, 0.4, 2.2, 2.6), P(GR, 0.5, 2.1, 1.8), P(GR, 0.6, 1.9, -0.8), P(GR, 0.6, 1.9, -0.8), k, T)],
  [E.a4, 'day', DW, (k, T) => dolly(P(DW, 4.5, 3.2, 8), P(DW, 3.6, 3.0, 6.8), P(DW, -0.6, 0.8, 0.6), P(DW, -0.6, 0.8, 0.6), k, T)],
  [E.posts - 0.1, 'day', DW, (k, T) => dolly(P(DW, -1.0, 2.2, 3.6), P(DW, -1.2, 2.2, 3.0), P(DW, -2.6, 1.9, 1.4), P(DW, -2.6, 1.9, 1.4), k, T)],
  [E.hand - 0.1, 'day', DW, (k, T) => dolly(P(DW, 1.4, 1.0, 2.4), P(DW, 1.0, 0.7, 1.8), P(DW, 0.6, 0.3, 0.8), P(DW, 0.6, 0.35, 0.8), k, T)],
  [E.rage, 'night', DW, (k, T) => dolly(P(DW, 3.2, 2.0, 7.0), P(DW, 3.1, 1.9, 6.0), P(DW, 3.0, 1.7, 3.0), P(DW, 3.0, 1.8, 3.0), k, T)],
  [E.still - 0.1, 'night', DW, (k, T) => dolly(P(DW, 3.2, 2.2, 5.0), P(DW, 3.1, 2.25, 4.6), P(DW, 3.0, 2.15, 3.0), P(DW, 3.0, 2.2, 3.0), k, T)],
  [E.caught, 'night', DW, (k, T) => dolly(P(DW, 0.6, 3.0, 10), P(DW, 1.0, 2.8, 8.8), P(DW, 3.0, 1.5, 3.0), P(DW, 3.0, 1.5, 3.0), k, T)],
  [E.only - 0.1, 'night', DW, (k, T) => dolly(P(DW, -0.2, 2.1, 6.8), P(DW, -0.3, 2.1, 6.0), P(DW, -0.4, 2.0, 4.4), P(DW, -0.4, 2.05, 4.4), k, T)],
  [E.loop, 'day', YD, (k, T) => dolly(P(YD, -1.5, 3.4, 9.5), P(YD, -1.5, 3.4, 9.5), P(YD, 2.5, 1.0, 2.5), P(YD, 2.5, 1.0, 2.5), 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // sirens flash whenever police are on screen
  SIRENS.forEach(s_ => { const ph = Math.floor(Tt * 6) % 2; s_.red.material.emissiveIntensity = ph ? 3 : 0.2; s_.blue.material.emissiveIntensity = ph ? 0.2 : 3; s_.lr.intensity = ph ? 10 : 0; s_.lb.intensity = ph ? 0 : 10; });
  // ----- backyard -----
  const dig = (cl === 0 && T > E.hide - 0.1) || (cl === 1 && T < E.dog - 0.1); const fail1 = loop || (cl === 0 && T < E.hide - 0.1) || (cl === 1 && T > E.dog - 0.1);
  R.youY.visible = dig; R.shovel.visible = R.youY.visible; R.rugY.visible = !fail1; R.hole.visible = !fail1;
  if (R.youY.visible) { const u = R.youY.userData; const s_ = S(T * 7); u.armL.rotation.x = -1.2 + 0.5 * s_; u.armR.rotation.x = -1.2 + 0.5 * s_; u.body.rotation.x = 0.25 + 0.15 * s_; R.shovel.position.set(1.8, 0.2 + 0.25 * s_, 0.4); R.shovel.rotation.z = 0.5 + 0.2 * s_; setFace(R.youY, cl === 1 && T > E.bury ? 'tired' : 'shock'); if (cl === 0) { u.armL.rotation.x = u.armR.rotation.x = -0.4; u.body.rotation.x = 0; } }
  R.rugY.position.y = cl === 1 ? -0.35 * prog(T, E.bury, E.dog - 0.3) : 0; R.mound.scale.set(1, dig ? 0.3 + 0.7 * prog(T, E.bury, E.dog - 0.3) : 0.6, 1);
  R.dog.visible = R.rugDog.visible = fail1; const dk = cl === 0 ? 0.6 + 0.4 * prog(Tt, 0, 3) : prog(T, E.dog - 0.1, E.a2); R.dog.position.set(lerp(-1, 3, dk), 0, lerp(0.6, 2.6, dk)); R.dog.rotation.y = 1.05; R.dog.userData.legs.forEach((l, i) => l.rotation.x = S(Tt * 14 + i * PI) * 0.6); R.dog.userData.tail.rotation.y = S(Tt * 18) * 0.6;
  R.rugDog.position.set(R.dog.position.x - 1.3, 0, R.dog.position.z - 0.6); R.rugDog.rotation.y = 0.45;
  const copsOnY = fail1; R.copsY.forEach((p, i) => { p.visible = copsOnY; setFace(p, i ? 'shock' : 'angry'); p.userData.armR.rotation.x = i ? -2.4 : -0.3; }); R.carY.visible = copsOnY; R.tapeY.forEach(m => m.visible = copsOnY);
  // ----- lake -----
  const throwK = cl === 2 && T < E.fisher - 0.1 ? prog(T, E.a2 + 0.4, E.fisher - 0.3) : 1; R.rugL0.visible = cl === 2 && T < E.fisher - 0.1 && throwK < 0.98; R.rugL0.position.set(-3 + 0, lerp(0.6, -0.4, throwK), lerp(-4.6, -6.6, throwK)); R.rugL0.rotation.x = throwK * 2;
  R.youL.visible = cl === 2 && T < E.fisher - 0.1; R.youL.userData.armL.rotation.x = R.youL.userData.armR.rotation.x = -1.4 + throwK; setFace(R.youL, 'shock');
  R.splash.forEach((m, i) => { const ph = prog(T, E.fisher - 0.6, E.fisher - 0.1); if (cl !== 2 || ph <= 0 || ph >= 1) { m.position.y = -5; return; } const a = i / 10 * 2 * PI; m.position.set(-3 + C(a) * ph * 1.2, 0.2 + S(ph * PI) * 1.4, -6.6 + S(a) * ph * 1.2); });
  const reel = cl === 2 ? prog(T, E.fisher, E.fisher + 1.8) : 0; R.rugL.visible = cl === 2 && T > E.fisher - 0.1; R.rugL.position.set(5.6, lerp(-0.4, 2.2, ease(reel)), -6.6); R.rugL.rotation.z = 0.25 * S(T * 4);
  R.line.visible = R.rugL.visible; R.line.position.set(5.4, 3.0 + R.rugL.position.y * 0.5, -6.7); R.line.scale.y = Math.max(0.2, 4.6 - R.rugL.position.y); R.line.position.y = (R.rugL.position.y + 0.6 + 4.2) / 2 + 0.5;
  R.fisher.userData.armR.rotation.x = -1.2 - 0.3 * reel; R.fisher.userData.armL.rotation.x = -1.0; R.fisher.userData.body.rotation.x = -0.2 * reel; setFace(R.fisher, reel > 0.5 ? 'shock' : 'grin'); R.boat.rotation.z = S(T * 1.5) * 0.04;
  // ----- garage -----
  const lidOpen = cl === 3 && T < E.power - 0.3 ? 1 - prog(T, E.frz, E.power - 0.3) : 0; R.lid.rotation.x = -1.4 * lidOpen; R.rugF.visible = lidOpen > 0.05;
  const dark = cl === 3 && T > E.power - 0.1 && T < E.smell - 0.1; R.bulbG.intensity = dark ? 0 : 20; R.bulbM.material.emissiveIntensity = dark ? 0 : 2; R.fzLight.material.emissiveIntensity = cl === 3 && T > E.power ? 0 : 2;
  const stinkOn = (cl === 3 && T > E.power) || cl === 4; R.stink.forEach((m, i) => { const ph = (Tt * 0.5 + i / 6) % 1; m.position.set(-1.6 + i * 0.4, 1.3 + ph * 2.2, -2.2 + S(i) * 0.3); m.rotation.set(0, 0.4, ph * 4); m.material.opacity = stinkOn ? 0.9 * S(ph * PI) : 0; });
  R.youG.visible = cl === 3 || cl === 4; setFace(R.youG, cl === 4 ? 'tired' : (T > E.smell ? 'shock' : 'neutral')); R.youG.userData.armR.rotation.x = cl === 3 && T < E.power ? -1.3 : (cl === 4 ? -2.6 : 0);
  if (cl === 4) R.youG.userData.head.rotation.z = 0.1 * S(T * 3);
  R.landlord.visible = R.copsG[0].visible = (cl === 3 && T > E.smell - 0.1) || cl === 4; R.landlord.userData.armR.rotation.set(-2.5, 0, -0.4); R.landlord.userData.head.rotation.x = 0.1; setFace(R.landlord, 'angry');
  // ----- driveway -----
  const bk = cl === 5 && T < E.posts - 0.1; R.trowel.visible = bk; R.builder.userData.armL.rotation.x = bk ? -0.8 - 0.3 * S(T * 6) : 0; R.builder.userData.body.rotation.x = bk ? 0.4 : 0;
  R.phB.visible = cl === 5 && T > E.posts - 0.1; if (R.phB.visible) { R.builder.userData.armR.rotation.x = -2.6; R.builder.userData.armR.rotation.z = -0.3; setFace(R.builder, 'grin'); }
  R.builder.visible = cl === 5; R.hand.visible = true; R.hand.rotation.z = cl === 5 && T > E.hand ? 0.15 * S(T * 2) : 0;
  const end = cl >= 6; R.carD.visible = end || (cl === 5 && T > E.hand + 0.6); R.copsD.forEach((p, i) => { p.visible = end; p.position.set(3.0 + (i ? 0.95 : -0.95), 0, 3.0); p.rotation.y = 0.3; p.userData[i ? 'armL' : 'armR'].rotation.set(-0.9, 0, i ? 0.6 : -0.6); setFace(p, 'angry'); });
  R.youD.visible = end; if (end) { const u = R.youD.userData; u.armL.rotation.set(0.5, 0, 0.35); u.armR.rotation.set(0.5, 0, -0.35); // cuffed behind
    const stomp = Math.abs(S(T * (cl === 6 ? 10 : 5))); u.legL.rotation.x = cl === 6 ? -0.5 * stomp : 0; u.body.position.y = u.legH + (cl === 6 ? 0.08 * stomp : 0); u.head.rotation.z = cl === 6 ? 0.12 * S(T * 12) : 0; u.body.rotation.x = cl === 6 ? -0.15 : 0.1;
    setFace(R.youD, cl === 6 ? (talking(6, T) && S(T * 26) > -0.2 ? 'shout' : 'angry') : 'angry'); }
  R.det.visible = cl === 7 && T > E.only - 0.2; R.detL.intensity = R.det.visible ? 16 : 0; R.det.userData.armR.rotation.x = -1.5; mouth(R.det, 7, T, 'neutral');
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.4 && d < 30; });
  return { si, t0 }; }
