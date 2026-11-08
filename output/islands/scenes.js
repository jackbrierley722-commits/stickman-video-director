// Pick an island — low-poly 3D, game-show HUD.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, person, run, idle, cheer } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
const AT = (ci, w, n = 0) => { let k = 0; for (const x of CL[ci].words) if (x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w) { if (k === n) return x.a; k++; } return CL[ci].start; };
let renderer, camera, scene, water, waterBase;
const ISL = { A: [-3.7, -4.6], B: [3.7, -4.6], C: [-3.7, 4.6], D: [3.7, 4.6] };
const BADGE = { A: '#ff5a5a', B: '#ffb02a', C: '#ff7ad0', D: '#3ad06a' };
function mixc(a, b, k) { const ca = new T3.Color(a), cb = new T3.Color(b); return '#' + ca.lerp(cb, clamp(k)).getHexString(); }
function G(x, z) { const g = new T3.Group(); g.position.set(x, 0, z); scene.add(g); return g; }
function base(g, r, sand = '#e8d29a', grass = '#6ab84a', seed = 1) { const rr = rng(seed);
  const sg = new T3.CylinderGeometry(r, r + 0.3, 0.7, 12); const p = sg.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 + 0.12 * S(a * 3 + seed) + 0.06 * S(a * 7); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } sg.computeVertexNormals();
  const s = new T3.Mesh(sg, mat(sand)); s.position.y = 0.0; g.add(s);
  const gg = sg.clone(); gg.scale(0.82, 0.5, 0.82); const gm = new T3.Mesh(gg, mat(grass)); gm.position.y = 0.42; g.add(gm);
  const foam = new T3.Mesh(new T3.TorusGeometry(r + 0.45, 0.08, 4, 24), new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 })); foam.rotation.x = Math.PI / 2; foam.position.y = -0.02; g.add(foam); g.userData.foam = foam; }
function palm(g, x, z, h = 2.2, lean = 0.25, rot = 0) { const p = new T3.Group(); p.position.set(x, 0.5, z); p.rotation.y = rot; g.add(p); let y = 0; for (let i = 0; i < 5; i++) { const s = cyl(0.11 - i * 0.012, 0.13 - i * 0.012, h / 5, 5, i % 2 ? '#8a6a3a' : '#7a5a30', S(i * 0.4) * 0 + i * lean * 0.12, y + h / 10, 0); s.rotation.z = -lean * 0.3; p.add(s); y += h / 5; }
  const top = new T3.Group(); top.position.set(5 * lean * 0.12, y, 0); p.add(top); for (let i = 0; i < 6; i++) { const lf = box(0.9, 0.04, 0.22, '#3a9a3a', 0, 0, 0); lf.geometry.translate(0.45, 0, 0); lf.rotation.y = i / 6 * Math.PI * 2; lf.rotation.z = -0.5; top.add(lf); } return p; }
function bush(g, x, z, c = '#3a8a3a', s = 1) { const b = new T3.Mesh(new T3.IcosahedronGeometry(0.4 * s, 0), mat(c)); b.position.set(x, 0.6 + 0.2 * s, z); g.add(b); return b; }
function blossom(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0.5, z); g.add(t); t.add(cyl(0.08 * s, 0.12 * s, 1.0 * s, 5, '#5a3a2a', 0, 0.5 * s, 0)); for (let i = 0; i < 5; i++) { const b = new T3.Mesh(new T3.IcosahedronGeometry(0.42 * s, 0), mat(i % 2 ? '#ffb8d0' : '#ff9ac0')); b.position.set(C(i * 1.3) * 0.35 * s, (1.1 + (i % 3) * 0.2) * s, S(i * 1.3) * 0.35 * s); t.add(b); } return t; }
function jungle(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0.5, z); g.add(t); t.add(cyl(0.07, 0.1, 0.6 * s, 5, '#4a3020', 0, 0.3 * s, 0)); const c = new T3.Mesh(new T3.IcosahedronGeometry(0.5 * s, 0), mat(['#2a6a2a', '#3a7a30', '#1e5a26'][Math.floor(x * 7 + z * 3) & 1 ? 0 : 2])); c.position.y = 0.85 * s; t.add(c); return t; }
function cabin(g, x, z) { const c = new T3.Group(); c.position.set(x, 0.55, z); g.add(c); c.add(box(1.4, 1.0, 1.2, '#a0703a', 0, 0.5, 0)); for (let i = 0; i < 4; i++) c.add(box(1.42, 0.04, 1.22, '#7a5028', 0, 0.15 + i * 0.25, 0));
  const roof = new T3.Mesh(new T3.CylinderGeometry(0.01, 1.15, 0.7, 4), mat('#c8402a')); roof.rotation.y = Math.PI / 4; roof.position.y = 1.35; c.add(roof); const door = box(0.36, 0.62, 0.05, '#5a3018', 0.2, 0.31, 0.62); c.add(door); c.add(box(0.3, 0.26, 0.04, '#9ad0f0', -0.38, 0.6, 0.61)); c.userData = { roof, door }; return c; }
function lighthouse(g, x, z) { const l = new T3.Group(); l.position.set(x, 0.5, z); g.add(l); l.add(cyl(0.22, 0.3, 1.4, 8, '#f0f0ec', 0, 0.7, 0)); l.add(cyl(0.24, 0.24, 0.12, 8, '#c8302a', 0, 0.9, 0)); l.add(cyl(0.18, 0.18, 0.25, 8, '#ffe8a0', 0, 1.52, 0)); const r = new T3.Mesh(new T3.ConeGeometry(0.26, 0.3, 8), mat('#c8302a')); r.position.y = 1.8; l.add(r); return l; }
function rock(g, x, z, s = 1) { const r = new T3.Mesh(new T3.DodecahedronGeometry(0.35 * s, 0), mat('#8a8a90')); r.position.set(x, 0.55, z); r.scale.y = 0.6; g.add(r); }
function snake(g, seed) { const s = new T3.Group(); g.add(s); const segs = []; for (let i = 0; i < 9; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.075 - i * 0.004, 5, 4), mat(i % 3 === 0 ? '#c8902a' : '#e8b83a')); s.add(m); segs.push(m); } const head = segs[0]; head.scale.set(1.3, 0.9, 1.5); s.userData = { segs, seed }; return s; }
function eyebrowed(p) { const h = p.userData.head; const L = box(0.1, 0.025, 0.02, '#1a1a1a', -0.08, 0.12, 0.245), R = box(0.1, 0.025, 0.02, '#1a1a1a', 0.08, 0.12, 0.245); h.add(L, R); p.userData.brows = [L, R]; }

// ---------- build ----------
let guyA, goose, guyB, sky, signB, guyC, foodsC = [], broc = [], guyD, crabs = [], light, houseD;
function makeGoose() { const g = new T3.Group(); const body = sph(0.32, '#f4f4f0', 0, 0.38, 0, 8, 6); body.scale.set(0.8, 0.75, 1.25); g.add(body); const neck = cyl(0.07, 0.09, 0.45, 6, '#f4f4f0', 0, 0.7, 0.28); neck.rotation.x = -0.35; g.add(neck);
  const head = sph(0.11, '#f4f4f0', 0, 0.94, 0.38, 6, 5); g.add(head); const beak = new T3.Mesh(new T3.ConeGeometry(0.05, 0.16, 5), mat('#ff9a2a')); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.92, 0.52); g.add(beak);
  for (const sx of [-1, 1]) { g.add(box(0.04, 0.02, 0.04, '#111', sx * 0.07, 0.97, 0.45)); g.add(cyl(0.025, 0.025, 0.25, 4, '#ff9a2a', sx * 0.1, 0.12, 0)); } const wl = box(0.05, 0.22, 0.45, '#e0e0dc', -0.27, 0.42, 0), wr = box(0.05, 0.22, 0.45, '#e0e0dc', 0.27, 0.42, 0); g.add(wl, wr); g.userData = { wl, wr, head, beak }; return g; }
function makeCrab() { const c = new T3.Group(); const b = sph(0.1, '#d8301a', 0, 0.06, 0, 6, 4); b.scale.set(1.3, 0.5, 1); c.add(b); for (const sx of [-1, 1]) { for (let k = 0; k < 3; k++) { const l = box(0.12, 0.015, 0.015, '#b8200a', sx * 0.14, 0.04, -0.05 + k * 0.05); l.rotation.z = sx * 0.6; c.add(l); } c.add(sph(0.045, '#e8401a', sx * 0.1, 0.07, 0.12, 5, 4)); } return c; }
function build() {
  sky = new T3.Mesh(new T3.SphereGeometry(200, 12, 8), new T3.MeshBasicMaterial({ color: '#8ac8f0', side: T3.BackSide, fog: false })); scene.add(sky);
  const wg = new T3.PlaneGeometry(90, 90, 45, 45); wg.rotateX(-Math.PI / 2); waterBase = wg.attributes.position.array.slice(); water = new T3.Mesh(wg, new T3.MeshLambertMaterial({ color: '#3aa0e0', flatShading: true })); water.position.y = -0.15; scene.add(water);
  // A — mansion, pool and a goose
  const A = G(...ISL.A); base(A, 3.0, '#e8d8b0', '#7ac85a', 1); const m = new T3.Group(); m.position.set(0, 0.55, -1.3); A.add(m); m.add(box(2.4, 1.2, 1.2, '#f4f2ec', 0, 0.6, 0)); m.add(box(2.6, 0.12, 1.4, '#8a8a92', 0, 1.26, 0)); m.add(box(1.2, 0.7, 1.0, '#f4f2ec', 0.4, 1.65, -0.1)); m.add(box(1.35, 0.1, 1.15, '#8a8a92', 0.4, 2.05, -0.1));
  for (let i = 0; i < 4; i++) m.add(box(0.36, 0.42, 0.03, '#7ac0f0', -0.85 + i * 0.56, 0.75, 0.61)); m.add(box(0.4, 0.6, 0.03, '#6a4a2a', 0.0, 0.3, 0.62)); for (const x of [-1.1, 1.1]) m.add(cyl(0.06, 0.06, 1.2, 6, '#ffffff', x, 0.6, 0.7));
  A.add(box(1.8, 0.06, 1.0, '#ffffff', 0, 0.56, 0.7)); A.add(box(1.6, 0.07, 0.8, new T3.MeshLambertMaterial({ color: '#4ad0f0' }), 0, 0.57, 0.7)); palm(A, -2.0, 0.6, 1.8, 0.25, 1); palm(A, 2.0, 0.9, 1.9, 0.25, 2);
  guyA = person({ shirt: '#4ab0e0', shorts: '#e8c040', skin: '#e8b896', hair: '#5a3a1a' }); A.add(guyA); goose = makeGoose(); A.add(goose);
  // B — beaches, walk backwards
  const B = G(...ISL.B); base(B, 3.0, '#f6e6b8', '#88c858', 2); [[-1.6, -0.9], [1.4, -1.3], [-0.5, -1.9], [1.9, 0.6], [0.2, -0.4]].forEach(([x, z], i) => palm(B, x, z, 1.8 + (i % 2) * 0.4, 0.25, i));
  signB = W3.signBoard('BACKWARDS\nONLY', 1.1, 0.6, { bg: '#f0e0b0', fg: '#3a2a1a', pw: 96, ph: 52, size: 9 }); signB.position.set(-1.0, 1.3, 1.2); B.add(signB); B.add(cyl(0.04, 0.04, 0.9, 4, '#7a5a30', -1.0, 0.9, 1.19));
  guyB = person({ shirt: '#ffb02a', shorts: '#3a5ab0', skin: '#d8a880', hair: '#1a1a1a' }); B.add(guyB);
  // C — free food (that all tastes like broccoli)
  const Cc = G(...ISL.C); base(Cc, 2.9, '#e8d8b0', '#8ad070', 3); const tb = new T3.Group(); tb.position.set(0, 0.55, 0); Cc.add(tb); tb.add(box(2.0, 0.08, 0.9, '#f0f0ea', 0, 0.75, 0)); for (const [x, z] of [[-0.9, -0.38], [0.9, -0.38], [-0.9, 0.38], [0.9, 0.38]]) tb.add(cyl(0.04, 0.04, 0.75, 4, '#8a8a92', x, 0.37, z));
  const awn = box(2.3, 0.08, 1.2, '#ff5a5a', 0, 1.9, -0.1); tb.add(awn); for (let i = 0; i < 5; i++) tb.add(box(0.46, 0.085, 1.21, i % 2 ? '#ffffff' : '#ff5a5a', -0.92 + i * 0.46, 1.9, -0.1)); for (const x of [-1.1, 1.1]) tb.add(cyl(0.04, 0.04, 1.15, 4, '#8a8a92', x, 1.33, -0.6));
  const pizza = new T3.Group(); pizza.add(cyl(0.28, 0.28, 0.04, 10, '#e8a848', 0, 0, 0)); pizza.add(cyl(0.25, 0.25, 0.045, 10, '#d8402a', 0, 0.005, 0)); pizza.position.set(-0.7, 0.82, 0); tb.add(pizza);
  const burger = new T3.Group(); burger.add(cyl(0.15, 0.16, 0.07, 8, '#d8a050', 0, 0, 0)); burger.add(cyl(0.16, 0.16, 0.05, 8, '#5a3220', 0, 0.06, 0)); burger.add(cyl(0.165, 0.165, 0.02, 8, '#5aa83a', 0, 0.1, 0)); const top = new T3.Mesh(new T3.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d8a050')); top.position.y = 0.11; burger.add(top); burger.position.set(-0.15, 0.82, 0.05); tb.add(burger);
  const cake = new T3.Group(); cake.add(cyl(0.2, 0.2, 0.22, 10, '#f0a0b8', 0, 0.11, 0)); cake.add(cyl(0.21, 0.21, 0.04, 10, '#ffffff', 0, 0.23, 0)); cake.add(sph(0.05, '#d8302a', 0, 0.28, 0, 5, 4)); cake.position.set(0.4, 0.8, -0.05); tb.add(cake);
  const ice = new T3.Group(); const cone = new T3.Mesh(new T3.ConeGeometry(0.08, 0.26, 6), mat('#d8a050')); cone.rotation.x = Math.PI; cone.position.y = 0.13; ice.add(cone); ice.add(sph(0.09, '#ffd0e0', 0, 0.3, 0, 6, 5)); ice.add(sph(0.08, '#fff4c8', 0, 0.42, 0, 6, 5)); ice.position.set(0.8, 0.8, 0.1); tb.add(ice);
  foodsC = [pizza, burger, cake, ice]; foodsC.forEach(f => { const b = new T3.Group(); b.add(cyl(0.035, 0.05, 0.22, 5, '#5aa83a', 0, 0.11, 0)); for (let k = 0; k < 4; k++) { const c = new T3.Mesh(new T3.IcosahedronGeometry(0.1, 0), mat(k % 2 ? '#2a8a2a' : '#3aa03a')); c.position.set(C(k * 1.6) * 0.07, 0.27 + (k % 2) * 0.05, S(k * 1.6) * 0.07); b.add(c); } b.position.copy(f.position); tb.add(b); broc.push(b); });
  [[-2.0, -1.2], [2.0, -1.0], [-1.8, 1.4]].forEach(([x, z], i) => palm(Cc, x, z, 1.7, 0.2, i)); guyC = person({ shirt: '#5ab05a', trousers: '#3a3a40', skin: '#ecc4a0', hair: '#c09050' }); guyC.position.set(1.45, 0.5, 0.45); guyC.rotation.y = -0.3; Cc.add(guyC);
  // D — Christmas Island: forest, a road, a house, crabs
  const D = G(...ISL.D); base(D, 3.2, '#c8b890', '#4a9a3a', 4); const road = new T3.Mesh(new T3.PlaneGeometry(6.2, 0.7), mat('#4a4a50')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.6, 0.6); D.add(road); for (let i = 0; i < 8; i++) { const ln = new T3.Mesh(new T3.PlaneGeometry(0.35, 0.05), mat('#f0f0e8')); ln.rotation.x = -Math.PI / 2; ln.position.set(-2.6 + i * 0.75, 0.605, 0.6); D.add(ln); }
  houseD = new T3.Group(); houseD.position.set(0.8, 0.55, -0.9); D.add(houseD); houseD.add(box(1.2, 0.8, 0.9, '#f0e8d0', 0, 0.4, 0)); { const r = new T3.Mesh(new T3.CylinderGeometry(0.01, 1.0, 0.55, 4), mat('#4a6a9a')); r.rotation.y = Math.PI / 4; r.position.y = 1.08; houseD.add(r); } houseD.add(box(0.3, 0.5, 0.03, '#6a4a2a', 0, 0.25, 0.46));
  const r = rng(9); for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = 1.9 + r() * 1.0; jungle(D, C(a) * d, S(a) * d, 0.8 + r() * 0.5); } for (let i = 0; i < 4; i++) rock(D, (r() - 0.5) * 5, (r() - 0.5) * 5, 0.6 + r());
  for (let i = 0; i < 90; i++) { const c = makeCrab(); D.add(c); c.userData.seed = r(); c.userData.seed2 = r(); crabs.push(c); }
  guyD = person({ shirt: '#3a6ab0', trousers: '#2a2a30', skin: '#e8b896', hair: '#3a2416' }); guyD.position.set(0.8, 0.5, -0.2); D.add(guyD);
  scene.add(new T3.HemisphereLight('#ffffff', '#5a8aa8', 1.0)); const sun = new T3.DirectionalLight('#fff4dd', 1.0); sun.position.set(6, 12, 8); scene.add(sun);
}

// ---------- events ----------
const EV = { pick: AT(0, 'pick'), year: AT(0, 'year'), fast: AT(0, 'fast'), A: CL[6].start, mansion: AT(6, 'mansion'), goose: AT(6, 'goose'), hates: AT(6, 'hates'), faster: AT(6, 'faster'),
  B: CL[7].start, back: AT(7, 'backwards'), sunset: AT(7, 'sunset'), turn: AT(7, 'turn'), Cs: CL[8].start, pizza: AT(8, 'pizza'), burgers: AT(8, 'burgers'), cake: AT(8, 'cake'), broc: AT(8, 'broccoli'), ice: AT(8, 'ice'),
  D: CL[9].start, real: AT(9, 'real'), called: AT(9, 'christmas'), millions: AT(9, 'millions'), roads: AT(9, 'roads'), gardens: AT(9, 'gardens'), door: AT(9, 'door'), end: CL[10].start, comment: AT(10, 'comment') };
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const OVER = [0, 27, 15], OVL = [0, 0, 0.6];
function isl(k, dx, dy, dz) { const [x, z] = ISL[k]; return [x + dx, dy, z + dz]; }

// ---------- HUD ----------
function bigText(ctx, txt, x, y, size, col = '#ffd23a', a = 1, outline = '#0a2a5a', font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.24; ctx.strokeStyle = outline; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }
function badge(ctx, L, x, y, r, a = 1, pulse = 0) { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(1 + pulse, 1 + pulse); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, 7); ctx.fill(); ctx.fillStyle = BADGE[L]; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.font = `${r * 1.2}px Russo`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.lineWidth = 6; ctx.strokeStyle = '#0a2a5a'; ctx.strokeText(L, 0, 4); ctx.fillText(L, 0, 4); ctx.restore(); }
const V = new T3.Vector3();
function proj(x, y, z) { V.set(x, y, z).project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H, V.z]; }
function catchBanner(ctx, title, line, col, k) { if (k <= 0) return; const y = 300; ctx.save(); ctx.translate(lerp(-700, 0, ease(k)), 0); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(40, y - 60); ctx.lineTo(690, y - 60); ctx.lineTo(670, y + 60); ctx.lineTo(20, y + 60); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.font = '22px PressStart'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(title, 60, y - 30); ctx.font = (line.length > 20 ? 34 : 44) + 'px Russo'; ctx.fillText(line, 60, y + 20); ctx.restore(); }
function stamp(ctx, s, x, y, col, k, rot = -0.2, size = 70) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = 1 + 1.2 * (1 - ease(k)); ctx.scale(sc, sc); ctx.globalAlpha = ease(k); ctx.font = `${size}px Russo`; const w = ctx.measureText(s).width; ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.strokeRect(-w / 2 - 20, -size * 0.7, w + 40, size * 1.4); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 4); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,30,70,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 36); ctx.font = '16px PressStart'; ctx.fillStyle = '#0a2a5a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 19); ctx.restore(); }
function xmasMap(ctx, T, a) { const x = 110, y = 690, w = 500, h = 330; card(ctx, 'THIS PLACE IS REAL', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#2a6aa8'; ctx.fillRect(x + 20, y + 50, 230, 260); ctx.fillStyle = '#d8b87a'; ctx.beginPath(); [[0.55, 0.1], [0.95, 0.15], [1.0, 0.55], [0.75, 0.8], [0.45, 0.7], [0.35, 0.35]].forEach(([u, v], i) => { const px = x + 20 + u * 230, py = y + 50 + v * 260; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4a9a4a'; ctx.beginPath(); [[0.0, 0.0], [0.3, 0.0], [0.25, 0.25], [0.0, 0.3]].forEach(([u, v], i) => { const px = x + 20 + u * 230, py = y + 50 + v * 260; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.fill();
  const px = x + 20 + 0.3 * 230, py = y + 50 + 0.42 * 260; ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(px, py - 18, 14, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(px - 10, py - 12); ctx.lineTo(px + 10, py - 12); ctx.lineTo(px, py + 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,90,90,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 20 + ((T * 40) % 30), 0, 7); ctx.stroke();
  ctx.font = '14px PressStart'; ctx.fillStyle = '#9ad0ff'; ctx.textAlign = 'left'; ctx.fillText('INDIAN OCEAN', x + 30, y + 290); ctx.fillStyle = '#ffffff'; ctx.fillText('AUSTRALIA', x + 150, y + 160);
  ctx.font = '26px Russo'; ctx.fillStyle = '#fff'; ctx.fillText('CHRISTMAS', x + 275, y + 100); ctx.fillText('ISLAND', x + 275, y + 132); ctx.font = '13px PressStart'; ctx.fillStyle = '#ffd23a'; ctx.fillText('AUSTRALIAN', x + 275, y + 170); ctx.fillText('TERRITORY', x + 275, y + 192);
  if (T > EV.millions - 0.2) { ctx.font = '22px Russo'; ctx.fillStyle = '#ff5a5a'; ctx.fillText('TENS OF MILLIONS', x + 275, y + 240); ctx.fillText('OF RED CRABS', x + 275, y + 270); } ctx.restore(); }
// captions
const CAPS = [];
CL.forEach((c, ci) => { if (ci >= 1 && ci <= 5) return; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(You|Choose|A|The|It|And|But|Want|Better|Any|Pizza|Burgers|Cake|Even|Every|It's|On|In|At|Comment|So)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, ''); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1120 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#0a2a5a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(50, RW / RH, 0.05, 400); scene = new T3.Scene(); scene.fog = new T3.Fog('#8ac8f0', 40, 120); build();
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  // water waves
  const p = water.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = waterBase[i * 3], z = waterBase[i * 3 + 2]; p.setY(i, 0.12 * S(x * 0.5 + T * 1.4) + 0.1 * C(z * 0.6 + T * 1.1)); } p.needsUpdate = true; water.geometry.computeVertexNormals();
  // A: the goose chase around the pool
  const ck = T - EV.goose; const chasing = ck > 0; const ga = chasing ? ck * (1.6 + Math.min(1, ck * 0.2) * 0.8) : 0; const pa = chasing ? ck * 1.6 + 0.9 - Math.min(0.8, ck * 0.18) : 0.9;
  guyA.position.set(C(pa) * 1.3, 0.5, 0.7 + S(pa) * 0.85); guyA.rotation.y = -pa + (chasing ? Math.PI : Math.PI / 2); if (chasing) run(guyA, T * 14, 1); else idle(guyA, T); if (chasing) { guyA.userData.armL.rotation.z = -2.4; guyA.userData.armR.rotation.z = 2.4; }
  goose.position.set(C(ga) * 1.3, 0.5, 0.7 + S(ga) * 0.85); goose.rotation.y = -ga + Math.PI; const fl = chasing ? S(T * 30) * 0.6 : 0; goose.userData.wl.rotation.z = fl; goose.userData.wr.rotation.z = -fl; goose.userData.head.position.z = 0.38 + (chasing ? 0.08 : 0); goose.visible = T > EV.goose - 0.6;
  // B: walking backwards, bumping into a palm, sunset behind
  const bk = prog(T, EV.back - 0.2, EV.sunset); guyB.position.set(lerp(1.0, 0.25, bk), 0.5, lerp(1.6, -0.15, bk)); guyB.rotation.y = 0.35; if (bk > 0 && bk < 1) { run(guyB, -T * 9, 0.7); } else idle(guyB, T); if (T > EV.sunset && T < EV.turn + 0.5) { guyB.userData.body.rotation.x = -0.25; guyB.userData.head.rotation.z = S(T * 12) * 0.2; }
  const sunsetK = ci === 7 ? prog(T, EV.sunset - 0.4, EV.sunset + 0.6) : 0; sky.material.color.set(mixc('#8ac8f0', '#f08a5a', sunsetK));
  // C: eating; broccoli takes over the food
  idle(guyC, T); if (T > EV.pizza - 0.2 && T < EV.ice + 1) guyC.userData.armR.rotation.x = -1.6 + Math.abs(S(T * 5)) * 0.4; if (T > EV.broc + 0.2) guyC.userData.head.rotation.z = S(T * 9) * 0.25;
  const bt = [EV.broc - 0.1, EV.broc + 0.15, EV.broc + 0.4, EV.ice]; broc.forEach((b, i) => { const k = ease(prog(T, bt[i], bt[i] + 0.35)); b.visible = k > 0; b.scale.setScalar(Math.max(0.01, k * (1 + 0.15 * S(T * 8 + i)))); foodsC[i].visible = k < 0.6; });
  // D: crabs swarm over the road and to the front door
  const ck2 = prog(T, EV.millions - 0.5, EV.door + 1.0); crabs.forEach((c, i) => { const u = c.userData.seed, v = c.userData.seed2; const side = i % 3; let x, z;
    if (T < EV.door - 0.3) { x = -3 + ((u * 6 + T * (0.25 + v * 0.2)) % 6); z = lerp(2.5, 0.6, v) - (side === 0 ? 0 : (side === 1 ? 1.2 : -0.6)) * (1 - v); } else { const k = ease(prog(T, EV.door - 0.3, EV.door + 1)); x = lerp(-3 + ((u * 6 + T * (0.25 + v * 0.2)) % 6), 0.8 + (u - 0.5) * 0.8, k * (i % 2)); z = lerp(0.6 + (v - 0.5) * 1.6, -0.3 + v * 0.4, k * (i % 2)); }
    c.position.set(x, 0.6, z); c.rotation.y = S(T * 3 + i) * 0.4; c.visible = i < 90 * Math.max(ck2, ci === 10 ? 1 : 0); });
  idle(guyD, T); if (T > EV.door - 0.3) { guyD.userData.armL.rotation.z = -2.6; guyD.userData.armR.rotation.z = 2.6; guyD.userData.body.position.y = Math.abs(S(T * 9)) * 0.15; }
  light = light || null;
  // cameras
  if (ci === 0) camL([0, 40, 34], OVER, prog(T, 0, CL[1].start), [0, 0, -2], OVL);
  else if (ci <= 5) { const a = (T - CL[1].start) * 0.04; cam([S(a) * 4, OVER[1], OVER[2] + C(a) * 0.5], OVL); }
  else if (ci === 6) { const k = prog(T, EV.A, EV.A + 1.6); if (T < EV.goose - 0.3) camL([0, 25, 16], isl('A', 2.4, 3.4, 5.2), k, OVL, isl('A', 0, 0.9, -0.5)); else camL(isl('A', 0.4, 4.2, 4.2), isl('A', 0.0, 4.6, 4.6), prog(T, EV.goose - 0.3, CL[7].start), isl('A', 0, 0.5, 0.6), isl('A', 0, 0.5, 0.6)); }
  else if (ci === 7) { const k = prog(T, EV.B, EV.B + 1.4); if (T < EV.back - 0.3) camL(isl('A', 2, 3, 4), isl('B', -2.2, 2.6, 4.2), k, isl('A', 0, 1, 0), isl('B', 0, 0.9, 0)); else camL(isl('B', 2.6, 1.6, 2.6), isl('B', 2.0, 1.5, 2.0), prog(T, EV.back - 0.3, CL[8].start), isl('B', 0.4, 1.1, 0.4), isl('B', 0.2, 1.1, -0.1)); }
  else if (ci === 8) { const k = prog(T, EV.Cs, EV.Cs + 1.4); if (T < EV.pizza - 0.3) camL(isl('B', 1, 3, 4), isl('C', 0.4, 2.6, 3.8), k, isl('B', 0, 1, 0), isl('C', 0, 1.0, 0)); else camL(isl('C', 0.4, 1.9, 3.0), isl('C', 0.6, 1.8, 2.6), prog(T, EV.pizza - 0.3, CL[9].start), isl('C', 0.4, 1.3, 0), isl('C', 0.6, 1.4, 0.2)); }
  else if (ci === 9) { const k = prog(T, EV.D, EV.D + 1.4); if (T < EV.millions - 0.4) camL(isl('C', 2, 3, 4), isl('D', 2.0, 5.0, 5.4), k, isl('C', 0, 1, 0), isl('D', 0, 0.5, 0)); else if (T < EV.door - 0.3) camL(isl('D', -1.8, 1.4, 2.8), isl('D', 0.6, 1.3, 2.8), prog(T, EV.millions - 0.4, EV.door - 0.3), isl('D', -0.6, 0.6, 0.6), isl('D', 0.6, 0.6, 0.6)); else camL(isl('D', 1.6, 1.4, 1.6), isl('D', 1.4, 1.2, 1.3), prog(T, EV.door - 0.3, CL[10].start), isl('D', 0.8, 0.9, -0.5), isl('D', 0.8, 0.9, -0.6)); }
  else camL(isl('D', 3.5, 6, 6), OVER, prog(T, EV.end, EV.end + 1.5), isl('D', 0, 0.5, 0), OVL);
  renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.05)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  // overview badges
  const showBadges = ci <= 5 || (ci === 10); if (showBadges) for (const L of ['A', 'B', 'C', 'D']) { const [x, z] = ISL[L]; const [sx, sy, sz] = proj(x, 2.6, z); if (sz < 1) { const cnt = ci >= 1 && ci <= 5; badge(octx, L, sx, sy - 20 + S(T * 3 + x) * 6, 40, ci === 0 ? prog(T, EV.year, EV.year + 0.4) : 1, 0); } }
  // intro titles
  if (ci === 0) { const a = prog(T, 0.1, 0.5); octx.save(); octx.fillStyle = 'rgba(8,30,70,0.85)'; octx.translate(0, lerp(-200, 0, ease(a))); octx.fillRect(0, 70, W, 220); octx.fillStyle = '#ffd23a'; octx.fillRect(0, 286, W, 8); octx.restore(); bigText(octx, 'PICK AN ISLAND', 360, 150, 80, '#ffd23a', a); bigText(octx, 'YOU LIVE THERE FOR 1 YEAR', 360, 240, 36, '#ffffff', prog(T, EV.year - 0.2, EV.year + 0.2)); if (T > EV.fast - 0.1) bigText(octx, 'CHOOSE FAST!', 360, 1000, 64, '#ff5a5a', prog(T, EV.fast - 0.1, EV.fast + 0.2)); }
  // countdown ring
  if (ci >= 1 && ci <= 5) { const n = 6 - ci; const k = (T - CL[ci].start) / CL[ci].dur; const cx = 360, cy = 640, R = 120; octx.save(); octx.fillStyle = 'rgba(8,30,70,0.85)'; octx.beginPath(); octx.arc(cx, cy, R, 0, 7); octx.fill(); octx.strokeStyle = n <= 2 ? '#ff5a5a' : '#ffd23a'; octx.lineWidth = 18; octx.beginPath(); octx.arc(cx, cy, R - 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); octx.stroke(); octx.restore(); const pop = 1 + 0.4 * (1 - ease(Math.min(1, k * 4))); octx.save(); octx.translate(cx, cy); octx.scale(pop, pop); bigText(octx, String(n), 0, 8, 150, '#ffffff', 1); octx.restore(); bigText(octx, 'PICK NOW', 360, 830, 44, '#ffffff', 1); }
  // island reveals
  const reveal = (L, t0) => { const a = prog(T, t0, t0 + 0.4); badge(octx, L, 80, 90, 44, a); bigText(octx, `ISLAND ${L}`, 300, 92, 56, '#ffffff', a); };
  if (ci === 6) { reveal('A', EV.A); if (T > EV.mansion - 0.1 && T < EV.goose - 0.2) bigText(octx, 'FREE MANSION + POOL', 360, 300, 46, '#7dffb0', prog(T, EV.mansion - 0.1, EV.mansion + 0.2)); catchBanner(octx, 'THE CATCH', 'A GOOSE THAT HATES YOU', '#d8302a', prog(T, EV.goose - 0.2, EV.goose + 0.2));
    if (T > EV.hates - 0.1) for (let k = 0; k < 3; k++) { const t0 = EV.hates - 0.1 + k * 0.7; const d = T - t0; if (d > 0 && d < 0.6) { octx.save(); octx.globalAlpha = 1 - d / 0.6; bigText(octx, 'HONK!', 200 + k * 160, 520 - k * 30, Math.round(70 * (1 + 0.6 * (0.6 - d))), '#ffffff', 1, '#d8302a'); octx.restore(); } }
    stamp(octx, "IT'S FASTER", 360, 700, '#ff5a5a', prog(T, EV.faster - 0.1, EV.faster + 0.25), -0.12, 62); }
  if (ci === 7) { reveal('B', EV.B); if (T < EV.back - 0.3) bigText(octx, 'BEST BEACHES ON EARTH', 360, 300, 42, '#7dffb0', prog(T, EV.B + 0.4, EV.B + 0.7)); catchBanner(octx, 'THE CATCH', 'BACKWARDS ONLY', '#d8302a', prog(T, EV.back - 0.2, EV.back + 0.2)); if (T > EV.sunset - 0.1) bigText(octx, 'THE SUNSET', 360, 520, 52, '#ffd23a', prog(T, EV.sunset - 0.1, EV.sunset + 0.2)); if (T > EV.sunset + 0.4) bigText(octx, 'IS BEHIND YOU', 360, 590, 52, '#ffffff', prog(T, EV.sunset + 0.4, EV.sunset + 0.7)); if (T > EV.sunset + 0.2 && T < EV.sunset + 1.0) bigText(octx, 'BONK!', 520, 700, 70, '#ffffff', 1, '#d8302a'); }
  if (ci === 8) { reveal('C', EV.Cs); if (T < EV.broc - 0.3) bigText(octx, 'FREE FOOD. ANY FOOD.', 360, 300, 46, '#7dffb0', prog(T, EV.Cs + 0.4, EV.Cs + 0.7)); [['PIZZA', EV.pizza], ['BURGERS', EV.burgers], ['CAKE', EV.cake]].forEach(([w_, t0], k) => { if (T > t0 - 0.1 && T < EV.broc - 0.2) bigText(octx, w_, 360, 400 + k * 64, 50, '#ffd23a', prog(T, t0 - 0.1, t0 + 0.15)); });
    catchBanner(octx, 'THE CATCH', 'IT ALL TASTES LIKE BROCCOLI', '#2a8a2a', prog(T, EV.broc - 0.2, EV.broc + 0.2)); if (T > EV.ice - 0.1) stamp(octx, 'EVEN ICE CREAM', 360, 620, '#3ad06a', prog(T, EV.ice - 0.1, EV.ice + 0.25), -0.12, 56); }
  if (ci === 9) { reveal('D', EV.D); if (T < EV.real - 0.2) bigText(octx, 'LOOKS NORMAL...', 360, 300, 50, '#ffffff', prog(T, EV.D + 0.4, EV.D + 0.7)); stamp(octx, 'REAL PLACE', 360, 330, '#ffd23a', prog(T, EV.real - 0.1, EV.real + 0.3), -0.12, 64); if (T > EV.called - 0.2 && T < EV.millions + 2.5) xmasMap(octx, T, Math.min(prog(T, EV.called - 0.2, EV.called + 0.2), 1 - prog(T, EV.millions + 2.2, EV.millions + 2.5)));
    [['ON THE ROADS', EV.roads], ['IN THE GARDENS', EV.gardens], ['AT YOUR DOOR', EV.door]].forEach(([w_, t0], k) => { if (T > t0 - 0.1) bigText(octx, w_, 360, 420 + k * 66, 48, k === 2 ? '#ff5a5a' : '#ffffff', prog(T, t0 - 0.1, t0 + 0.15)); }); }
  if (ci === 10) { bigText(octx, 'WHICH ONE', 360, 140, 64, '#ffffff', prog(T, EV.end, EV.end + 0.3)); bigText(octx, 'DID YOU PICK?', 360, 220, 64, '#ffd23a', prog(T, EV.end + 0.2, EV.end + 0.5)); if (T > EV.comment - 0.2) bigText(octx, 'COMMENT A, B, C OR D', 360, 940, 46, '#ffffff', prog(T, EV.comment - 0.2, EV.comment + 0.2)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
