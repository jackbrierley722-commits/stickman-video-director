
// ---------- timing ----------
const E = { invent: AT(0, 'you'), c1: CL[1].start, walks: AT(1, 'your'), shit: AT(1, 'shit'), c2: CL[2].start, bump: AT(2, 'and'), bone: AT(2, 'they'),
  c3: CL[3].start, genius: AT(3, 'genius'), pebble: AT(3, 'until'), over: AT(3, 'sends'), c4: CL[4].start, chain: AT(4, 'a'), same: AT(4, 'same'), safety: AT(4, 'the'),
  c5: CL[5].start, air: AT(5, 'so'), c6: CL[6].start, bus: AT(6, 'he') };
E.loop = TM.total - 0.4;

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
function bikeDraisine() { const b = new T3.Group(); const wd = WOOD(); const ir = IRON();
  const mk = (x) => { const w = wheelR(0.36, { tyre: 0.02, rim: 0.03, rimM: wd, spokes: 12, spokeR: 0.012, spokeM: wd, tyreCol: '#3a3a3a' }); w.position.set(x, 0.36, 0); b.add(w); return w; };
  b.userData.wheels = [mk(0.55), mk(-0.55)]; rod(b, [-0.75, 0.74, 0], [0.62, 0.74, 0], 0.035, wd); rod(b, [0.55, 0.36, 0.05], [0.58, 0.76, 0.05], 0.012, ir); rod(b, [0.55, 0.36, -0.05], [0.58, 0.76, -0.05], 0.012, ir); rod(b, [-0.55, 0.36, 0.05], [-0.55, 0.74, 0.05], 0.012, ir); rod(b, [-0.55, 0.36, -0.05], [-0.55, 0.74, -0.05], 0.012, ir);
  add(b, RB(0.32, 0.06, 0.2, 0.03), LEATHER(), -0.12, 0.8, 0); rod(b, [0.6, 0.76, 0], [0.62, 1.02, 0], 0.014, ir); rod(b, [0.62, 1.02, -0.26], [0.62, 1.02, 0.26], 0.012, wd); b.userData.seatY = 0.83; b.userData.seatX = -0.12; return b; }
function bikeBoneshaker() { const b = new T3.Group(); const wd = WOOD(); const ir = IRON();
  const f = wheelR(0.46, { tyre: 0.018, rim: 0.03, rimM: wd, spokes: 14, spokeR: 0.011, spokeM: wd, tyreCol: '#55585e' }); f.position.set(0.6, 0.46, 0); b.add(f); const r = wheelR(0.38, { tyre: 0.018, rim: 0.03, rimM: wd, spokes: 12, spokeR: 0.011, spokeM: wd, tyreCol: '#55585e' }); r.position.set(-0.62, 0.38, 0); b.add(r); b.userData.wheels = [f, r];
  const cv = new T3.CatmullRomCurve3([new T3.Vector3(0.62, 1.02, 0), new T3.Vector3(0.2, 0.92, 0), new T3.Vector3(-0.35, 0.86, 0), new T3.Vector3(-0.62, 0.42, 0)]); add(b, new T3.TubeGeometry(cv, 30, 0.028, 10), ir, 0, 0, 0);
  rod(b, [0.6, 0.46, 0.06], [0.62, 1.02, 0.03], 0.016, ir); rod(b, [0.6, 0.46, -0.06], [0.62, 1.02, -0.03], 0.016, ir); rod(b, [0.64, 1.0, 0], [0.66, 1.2, 0], 0.016, ir); rod(b, [0.66, 1.2, -0.3], [0.66, 1.2, 0.3], 0.013, ir);
  add(b, RB(0.34, 0.06, 0.2, 0.03), LEATHER(), -0.08, 0.95, 0); b.userData.crank = crankR(b, 0.6, 0.46, 0.13); b.userData.seatY = 0.98; b.userData.seatX = -0.08; return b; }
function bikePenny() { const b = new T3.Group(); const ir = SM('#1e1e20', { metalness: 0.75, roughness: 0.35 });
  const f = wheelR(0.72, { tyre: 0.022, spokes: 40, spokeR: 0.0025 }); f.position.set(0.3, 0.72, 0); b.add(f); const r = wheelR(0.2, { tyre: 0.02, spokes: 16 }); r.position.set(-0.95, 0.2, 0); b.add(r); b.userData.wheels = [f, r];
  const cv = new T3.CatmullRomCurve3([new T3.Vector3(0.24, 1.5, 0), new T3.Vector3(-0.35, 1.42, 0), new T3.Vector3(-0.8, 0.95, 0), new T3.Vector3(-0.95, 0.24, 0)]); add(b, new T3.TubeGeometry(cv, 30, 0.026, 10), ir, 0, 0, 0);
  rod(b, [0.3, 0.72, 0.07], [0.26, 1.5, 0.03], 0.014, ir); rod(b, [0.3, 0.72, -0.07], [0.26, 1.5, -0.03], 0.014, ir); rod(b, [0.26, 1.48, 0], [0.3, 1.68, 0], 0.014, ir); rod(b, [0.3, 1.68, -0.32], [0.3, 1.68, 0.32], 0.012, ir);
  add(b, RB(0.3, 0.06, 0.18, 0.03), LEATHER(), 0.05, 1.56, 0); b.userData.crank = crankR(b, 0.3, 0.72, 0.13); b.userData.seatY = 1.59; b.userData.seatX = 0.02; return b; }
function bikeSafety() { const b = new T3.Group(); const paint = SM('#b8202a', { metalness: 0.55, roughness: 0.25 }); const steel = SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 });
  const mk = (x) => { const w = wheelR(0.36, { tyre: 0.02, spokes: 32 }); w.position.set(x, 0.36, 0); b.add(w); return w; }; b.userData.wheels = [mk(0.55), mk(-0.55)];
  const BB = [0, 0.32, 0], HT = [0.42, 0.82, 0], ST = [-0.12, 0.86, 0]; rod(b, BB, HT, 0.022, paint); rod(b, BB, ST, 0.02, paint); rod(b, ST, HT, 0.018, paint); rod(b, [-0.55, 0.36, 0.05], BB, 0.012, paint); rod(b, [-0.55, 0.36, -0.05], BB, 0.012, paint); rod(b, [-0.55, 0.36, 0.05], ST, 0.011, paint); rod(b, [-0.55, 0.36, -0.05], ST, 0.011, paint);
  rod(b, [0.55, 0.36, 0.05], [0.44, 0.9, 0.02], 0.012, steel); rod(b, [0.55, 0.36, -0.05], [0.44, 0.9, -0.02], 0.012, steel); rod(b, [0.44, 0.9, 0], [0.42, 1.02, 0], 0.014, steel); rod(b, [0.42, 1.02, -0.28], [0.42, 1.02, 0.28], 0.012, steel);
  rod(b, ST, [-0.15, 0.96, 0], 0.012, steel); add(b, RB(0.26, 0.05, 0.13, 0.025), SM('#1a1a1a', { roughness: 0.5 }), -0.17, 0.99, 0);
  const ring = add(b, new T3.TorusGeometry(0.1, 0.008, 6, 32), steel, 0, 0.32, 0.07, false); b.userData.ring = ring; const cm = SM('#5a5e64', { metalness: 0.9, roughness: 0.4 }); rod(b, [0, 0.42, 0.07], [-0.55, 0.4, 0.07], 0.006, cm); rod(b, [0, 0.22, 0.07], [-0.55, 0.32, 0.07], 0.006, cm);
  b.userData.crank = crankR(b, 0, 0.32, 0.16); b.userData.seatY = 1.02; b.userData.seatX = -0.17; return b; }

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

function build() {
  buildSky(); R.sun.intensity = 2.8; R.hemi.intensity = 1.0;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(900, 0.1, 400), SM('#ffffff', { map: noiseTex(256, 256, '#5e7a3a', [['rgba(0,0,0,0.08)', 3000, 2], ['rgba(255,255,200,0.05)', 2000, 2]], 2, [120, 60]), roughness: 1 }), 150, -0.06, 0, false);
  add(G, Bx(420, 0.08, 6.4), SM('#ffffff', { map: noiseTex(256, 256, '#3c3d41', [['rgba(255,255,255,0.05)', 2500, 2], ['rgba(0,0,0,0.12)', 800, 3]], 11, [60, 1]), roughness: 0.92 }), 150, 0.0, 0.2);
  for (let x = -60; x < 360; x += 5) add(G, Bx(2.4, 0.09, 0.12), SM('#e8e4d8', { roughness: 0.7 }), x, 0.0, 1.0, false);
  add(G, Bx(420, 0.22, 2.6), SM('#ffffff', { map: noiseTex(256, 64, '#a8a49a', [['rgba(0,0,0,0.1)', 800, 2]], 13, [80, 1]), roughness: 0.9 }), 150, 0.06, -4.3); add(G, Bx(420, 0.24, 0.18), SM('#8a8680'), 150, 0.07, -3.0);
  // cobbles for the boneshaker stretch
  const ct = ctex(256, 256, (c, w, h) => { c.fillStyle = '#4a4a48'; c.fillRect(0, 0, w, h); const r = rng(7); for (let y = 0; y < h; y += 24) for (let x = (y / 24 % 2) * 14; x < w; x += 28) { const v = 110 + r() * 50; c.fillStyle = `rgb(${v},${v - 4},${v - 10})`; c.beginPath(); c.roundRect(x + 2, y + 2, 24, 20, 6); c.fill(); } }); ct.wrapS = ct.wrapT = T3.RepeatWrapping; ct.repeat.set(8, 1);
  add(G, Bx(46, 0.1, 6.4), SM('#ffffff', { map: ct, roughness: 0.75 }), 82, 0.01, 0.2);
  const bricks = ['#a8584a', '#b87a5a', '#9a4a3a', '#c89a7a', '#8a5a4a'], doors = ['#1f3a5a', '#7a1f2a', '#2a5a3a', '#1a1a1a', '#c8a040'];
  for (let i = 0; i < 46; i++) { const x = -40 + i * 8; houseR(G, x, -11, bricks[i % 5], doors[(i * 2) % 5], i + 3); hedge(G, x, -6.6, 6.6); if (i % 3 === 0) treeR(G, x + 4, -5.2, 0.9, i); if (i % 4 === 1) lamp(G, x + 2, -3.4); if (i % 5 === 2) carR(G, x + 1, -2.2, i); }
  // school
  const sc = R.school = new T3.Group(); sc.position.set(300, 0, -12); G.add(sc); const sbt = brickTex('#b8704a', 99); sbt.repeat.set(6, 3); add(sc, Bx(22, 8, 8), SM('#ffffff', { map: sbt, roughness: 0.9 }), 0, 4, 0); add(sc, Bx(22.4, 0.5, 8.4), SM('#e8e4dc'), 0, 8.1, 0);
  add(sc, Bx(7, 1.1, 0.1), BM('#fff', { map: ctex(512, 80, q => { q.fillStyle = '#1d3f8a'; q.fillRect(0, 0, 512, 80); q.fillStyle = '#fff'; q.font = '52px Russo'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('HILLSIDE SCHOOL', 256, 44); }) }), 0, 6.6, 4.06, false);
  for (let i = 0; i < 6; i++) add(sc, Bx(2, 1.8, 0.1), SM('#9ab4c8', { metalness: 0.3, roughness: 0.05 }), -8 + i * 3.2, 3.4, 4.05); add(sc, RB(2.4, 3, 0.15, 0.04), SM('#1f3a5a'), 0, 1.5, 4.06);
  for (let i = 0; i < 12; i++) rod(G, [292 + i * 1.4, 0, -3.2], [292 + i * 1.4, 1.4, -3.2], 0.03, SM('#2a5a3a', { metalness: 0.6 }));
  R.pebble = add(G, Sp(0.07, 12, 8), SM('#8a8680', { roughness: 0.8 }), 0, 0.06, 0.2);
  R.bikes = [bikeDraisine(), bikeBoneshaker(), bikePenny(), bikeSafety()]; R.bikes.forEach(b => G.add(b));
  R.you = human({ skin: '#d8a078', top: '#2a5aa8', bot: '#2a2e3a', hair: '#3a2410', eye: '#4a3020', shoe: '#e8e8e8' }); R.you.scale.setScalar(0.82); G.add(R.you);
  R.bro = human({ skin: '#d8a078', top: '#2e8a4a', bot: '#3a3a42', hair: '#3a2410', eye: '#4a3020', shoe: '#1a1a1e' }); R.bro.scale.setScalar(0.85); G.add(R.bro); add(R.bro.userData.up, RB(0.3, 0.38, 0.14, 0.04), SM('#c0392b', { roughness: 0.7 }), 0, 0.3, -0.17);
  // bus
  const bus = R.bus = new T3.Group(); G.add(bus); const yel = SM('#e8b820', { metalness: 0.3, roughness: 0.4 }); add(bus, RB(9, 2.6, 2.5, 0.25), yel, 0, 1.75, 0); add(bus, Bx(9.02, 0.25, 2.52), SM('#1a1a1a'), 0, 1.0, 0);
  const bg = SM('#2a3a48', { metalness: 0.4, roughness: 0.05, transparent: true, opacity: 0.55 }); for (let i = 0; i < 6; i++) add(bus, Bx(1.15, 0.85, 0.04), bg, -3.6 + i * 1.4, 2.35, 1.26, false); add(bus, Bx(0.04, 1.0, 2.0), bg, 4.5, 2.2, 0, false);
  for (const x of [-2.9, 2.9]) for (const z of [-1.15, 1.15]) add(bus, Cy(0.5, 0.5, 0.32, 20), SM('#151515', { roughness: 0.7 }), x, 0.5, z).rotation.x = PI / 2;
  R.broBus = human({ skin: '#d8a078', top: '#2e8a4a', bot: '#3a3a42', hair: '#3a2410' }); R.broBus.scale.setScalar(0.85); R.broBus.position.set(-1.6, 0.75, 0.6); bus.add(R.broBus);
  R.pump = new T3.Group(); G.add(R.pump); add(R.pump, Cy(0.03, 0.03, 0.6, 12), SM('#b8202a', { metalness: 0.4 }), 0, 0.32, 0); R.pumpH = add(R.pump, Cy(0.012, 0.012, 0.22, 8), SM('#222'), 0, 0.68, 0); R.pumpH.rotation.z = PI / 2; add(R.pump, Bx(0.16, 0.02, 0.06), SM('#333'), 0, 0.02, 0);
  R.dust = []; for (let i = 0; i < 12; i++) R.dust.push(spr(G, GLOW, '#d8ccb0', 0.4, 0, -5, 0, 0, T3.NormalBlending));
}

// ---------- rider ----------
function riderX(T) { const ci = CLI(T); if (T >= E.loop || ci === 0) return 270 + (T >= E.loop ? 0 : T) * 6;
  if (ci === 1) return 10 + (T - E.c1) * 1.3; if (ci === 2) return 62 + (T - E.c2) * 2.6; if (ci === 3) return 120 + (Math.min(T, E.over + 0.1) - E.c3) * 3.6; if (ci === 4) return 180; if (ci === 5) return 200 + (T - E.c5) * 2.5; return 262 + (T - E.c6) * 6; }
function face(p, kind, T) { const u = p.userData; u.mouth.scale.set(1, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12; b.position.y = 0.04; });
  if (kind === 'angry') u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.45; b.position.y = 0.034; });
  if (kind === 'shock') { u.mouth.scale.set(0.8, 3.2, 1); u.brows.forEach(b => b.position.y = 0.05); }
  if (kind === 'grin') u.mouth.scale.set(1.5, 1.4, 1);
  if (kind === 'smug') { u.mouth.scale.set(1.3, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12 + (b.userData.sx > 0 ? 0.3 : 0); b.position.y = b.userData.sx > 0 ? 0.048 : 0.038; }); }
  if (kind === 'yell') { u.mouth.scale.set(1.2, 2.6 + Math.abs(S(T * 18)), 1); u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.4; }); } }
function ride(b, x, T, pedalAng) { b.visible = true; b.position.set(x, 0, 0); b.rotation.set(0, 0, 0); const p = R.you, u = p.userData; rest(p); const s = p.scale.x;
  p.position.set(x + b.userData.seatX, b.userData.seatY - 0.92 * s + 0.02, 0); p.rotation.set(0, PI / 2, 0);
  b.userData.wheels.forEach(w => { const r = w.userData.tyre.geometry.parameters.radius; w.rotation.z = -(x / r); });
  const ph = pedalAng; if (b.userData.crank) b.userData.crank.rotation.z = -ph; u.up.rotation.x = 0.22;
  u.legL.rotation.x = -1.15 + 0.38 * S(ph); u.legR.rotation.x = -1.15 - 0.38 * S(ph); u.legL.userData.k.rotation.x = 1.25 - 0.35 * S(ph); u.legR.userData.k.rotation.x = 1.25 + 0.35 * S(ph);
  u.armL.rotation.x = u.armR.rotation.x = -1.05; u.armL.userData.e.rotation.x = u.armR.userData.e.rotation.x = -0.35; }
const MAXT = { day: 1 };
const SH = [
  [0, (k, T) => { const x = riderX(T); look([x - 1.2, 1.35, 6.2], [x + 0.6, 1.0, 0]); }],
  [E.c1, (k, T) => { const x = riderX(T); look([x + 0.9, 1.25, 4.6], [x + 0.6, 0.95, 0]); }],
  [E.walks - 0.1, (k, T) => { const x = riderX(T); look([x + 1.2, 1.25, 4.4], [x + 1.0, 1.05, -0.4]); }],
  [E.c2, (k, T) => { const x = riderX(T); const sh = T > E.bump - 0.1 ? 0.03 * S(T * 70) : 0; look([x + 0.3, 1.35 + sh, 4.4], [x + 0.3, 1.0 + sh, 0]); }],
  [E.bone - 0.1, (k, T) => { const x = riderX(T); const sh = 0.04 * S(T * 70); look([x + 1.1, 1.3 + sh, 2.4], [x, 1.25 + sh, 0]); }],
  [E.c3, (k, T) => { const x = riderX(T); look([x - 0.4, 1.8, 6.6], [x + 0.4, 1.5, 0]); }],
  [E.pebble - 0.1, (k, T) => { const x = riderX(T); look([x + 2.2, 1.7, 7.4], [x + 2.2, 1.1, 0]); }],
  [E.c4, (k, T) => { const x = riderX(T); TR(k, [x, 0.95, 3.4], [x, 0.9, 2.7], [x, 0.62, 0], [x, 0.62, 0]); }],
  [E.c5, (k, T) => { const x = riderX(T); look([x + 0.5, 1.05, 3.4], [x + 0.2, 0.75, 0]); }],
  [E.c6, (k, T) => { const x = riderX(T); look([x - 2, 1.9, 8.5], [x + 1, 1.3, -2]); }],
  [E.bus - 0.1, (k, T) => { look([295.5, 2.1, 12.5], [295.5, 1.6, -1]); }],
  [E.loop, (k, T) => { const x = riderX(0); look([x - 1.2, 1.35, 6.2], [x + 0.6, 1.0, 0]); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  R.bikes.forEach(b => b.visible = false); R.bus.visible = false; R.pump.visible = false; R.pebble.visible = false; R.dust.forEach(d => d.material.opacity = 0); R.you.visible = true; R.bro.visible = true;
  const x = riderX(T); const bro = R.bro; rest(bro); bro.rotation.set(0, PI / 2, 0); face(bro, 'smug', T);
  if (cl === 0 || (cl === 6 && T < E.bus - 0.1)) { const b = R.bikes[3]; ride(b, x, Tt, x * 2.0); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 1.9)); face(R.you, 'grin', T);
    bro.position.set(cl === 0 ? 271.6 - Tt * 0.5 : 284, 0, -0.9); walkPose(bro, Tt * 6, 0.6); bro.rotation.y = PI / 2; face(bro, 'shock', T); bro.userData.head.rotation.y = -0.6;
    R.dust.forEach((d, i) => { const ph = (Tt * 2 + i / 12) % 1; d.position.set(x - 0.7 - ph * 2.2, 0.15 + ph * 0.4, (i % 3 - 1) * 0.2); d.scale.setScalar(0.3 + ph * 1.2); d.material.opacity = 0.45 * (1 - ph); }); }
  if (cl === 1) { const b = R.bikes[0]; b.visible = true; b.position.set(x, 0, 0); b.userData.wheels.forEach(w => w.rotation.z = -x / 0.36); const p = R.you; walkPose(p, T * 9, 0.95); const s = p.scale.x; p.position.set(x + b.userData.seatX, b.userData.seatY - 0.92 * s + 0.12, 0); p.rotation.set(0, PI / 2, 0); p.userData.up.rotation.x = 0.25; p.userData.armL.rotation.x = p.userData.armR.rotation.x = -1.05; face(p, T > E.walks ? 'angry' : 'neutral', T);
    bro.position.set(lerp(x - 1.2, x + 2.0, prog(T, E.walks - 0.3, E.c2)), 0, -0.9); if (T > E.shit - 0.4) { bro.userData.head.rotation.y = -1.2; bro.userData.armR.rotation.set(-1.3, 0, -0.3); } walkPose(bro, T * 6.5, 0.7); bro.rotation.y = PI / 2; bro.userData.head.rotation.y = -0.7; face(bro, 'smug', T); }
  if (cl === 2) { const b = R.bikes[1]; const sh = T > E.bump - 0.1 ? 0.035 * Math.abs(S(T * 45)) : 0; ride(b, x, T, x * 2.2); b.position.y = sh; R.you.position.y += sh * 2; face(R.you, T > E.bump - 0.1 ? 'shock' : 'grin', T); bro.visible = false; }
  if (cl === 3) { const b = R.bikes[2]; const crashK = prog(T, E.over - 0.15, E.over + 0.9); const px = 120 + (E.over + 0.1 - E.c3) * 3.6 + 1.05; R.pebble.visible = true; R.pebble.position.set(px, 0.06, 0);
    if (crashK <= 0) { ride(b, x, T, x * 1.4); face(R.you, T > E.genius - 0.1 ? 'grin' : 'neutral', T); }
    else { b.visible = true; b.position.set(x, 0, 0); b.rotation.z = -0.45 * Math.min(1, crashK * 2); const p = R.you, u = p.userData; rest(p); const fx = x + 0.4 + crashK * 3.0, fy = 1.0 + S(crashK * PI) * 1.2 - crashK * 1.0; p.position.set(fx, Math.max(0.05, fy), 0); p.rotation.set(0, 0, 0); p.rotation.y = PI / 2; p.rotateX(crashK * 3.5); u.armL.rotation.x = u.armR.rotation.x = -2.9; u.legL.rotation.x = 0.5; u.legR.rotation.x = -0.6; face(p, 'shock', T); }
    bro.visible = false; }
  if (cl === 4) { const b = R.bikes[3]; ride(b, x, T, T * 2.2); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 1)); R.you.visible = T < E.chain - 0.2 || T > E.safety - 0.1; face(R.you, 'grin', T); bro.visible = false; }
  if (cl === 5) { const b = R.bikes[3]; const inflate = prog(T, E.air, E.c6 - 0.2); const sh = T < E.air ? 0.03 * Math.abs(S(T * 50)) : 0; ride(b, x, T, x * 2.0); b.position.y = sh; R.you.position.y += sh * 2; b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1 + inflate * 0.03, 1 + inflate * 0.03, 1 + inflate * 0.9)); face(R.you, T < E.air ? 'shock' : 'grin', T);
    R.pump.visible = T > E.air - 0.1 && T < E.c6 - 0.3; R.pump.position.set(x - 0.75, 0, 0.5); R.pumpH.position.y = 0.6 + 0.12 * Math.abs(S(T * 12)); bro.visible = false; }
  if (cl === 6 && T >= E.bus - 0.1) { const b = R.bikes[3]; b.visible = true; b.position.set(294.2, 0, 0.6); b.rotation.set(0, 0, 0); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 1.9)); const p = R.you; rest(p); p.position.set(295.3, 0, 0.9); p.rotation.set(0, 0.2, 0); face(p, 'grin', T); p.userData.armR.rotation.x = -2.9; p.userData.armR.rotation.z = -0.2 + 0.25 * S(T * 10);
    R.bus.visible = true; R.bus.position.set(lerp(289, 297, prog(T, E.bus - 0.1, E.loop)), 0, -1.9); rest(R.broBus); R.broBus.rotation.y = PI / 2 + 0.6; face(R.broBus, 'angry', T); bro.visible = false; }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(riderX(T), 0, 0); return { si, t0 }; }
