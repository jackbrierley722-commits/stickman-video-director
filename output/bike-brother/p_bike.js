
// ---------- one long street; the rider moves along +x ----------
const R = {}; const WINM = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, wall, roof) { const h = new T3.Group(); h.position.set(x, 0, z); g.add(h); add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4; add(h, Bx(1.2, 2.2, 0.12), SM('#7a4a2a'), 0, 1.1, 3.02); for (const wx of [-1.9, 1.9]) add(h, Bx(1.1, 1.1, 0.1), SM('#9fd3ff'), wx, 2.6, 3.02); return h; }
// wheel in the XY plane (spins about Z); tyre thickness can grow (air tyres)
function wheel(r, mat, tube = 0.045) { const w = new T3.Group(); const ty = add(w, new T3.TorusGeometry(r, tube, 8, 28), mat, 0, 0, 0); w.userData.tyre = ty; for (let i = 0; i < 8; i++) { const s_ = add(w, Bx(0.025, r * 2 - 0.05, 0.025), SM('#bbbbbb', { metalness: 0.5 }), 0, 0, 0); s_.rotation.z = i / 8 * PI; } add(w, Cy(0.06, 0.06, 0.14, 10), SM('#555'), 0, 0, 0).rotation.x = PI / 2; return w; }
function crank(g, x, y) { const c = new T3.Group(); c.position.set(x, y, 0); g.add(c); for (const s of [-1, 1]) { const arm = new T3.Group(); arm.rotation.z = s > 0 ? 0 : PI; c.add(arm); add(arm, Bx(0.05, 0.3, 0.04), SM('#333'), 0, -0.15, 0.13 * s); add(arm, Bx(0.18, 0.05, 0.12), SM('#222'), 0, -0.3, 0.2 * s); } return c; }
function bikeDraisine() { const b = new T3.Group(); const wd = SM('#9a6a3a'); const iron = SM('#3a3a3a'); b.userData.wheels = [wheel(0.38, wd, 0.06), wheel(0.38, wd, 0.06)]; b.userData.wheels[0].position.set(0.6, 0.38, 0); b.userData.wheels[1].position.set(-0.6, 0.38, 0); b.userData.wheels.forEach(w => b.add(w));
  add(b, Bx(1.4, 0.12, 0.1), wd, 0, 0.78, 0); add(b, Bx(0.06, 0.42, 0.06), wd, 0.6, 0.58, 0); add(b, Bx(0.06, 0.42, 0.06), wd, -0.6, 0.58, 0); add(b, Bx(0.4, 0.06, 0.24), SM('#5a3a20'), -0.1, 0.86, 0); add(b, Bx(0.05, 0.4, 0.05), iron, 0.62, 1.0, 0); add(b, Bx(0.05, 0.05, 0.6), iron, 0.62, 1.2, 0); b.userData.seatY = 0.9; b.userData.seatX = -0.1; return b; }
function bikeBoneshaker() { const b = new T3.Group(); const wd = SM('#8a5a32'); const iron = SM('#2a2a2a', { metalness: 0.5 }); b.userData.wheels = [wheel(0.5, iron, 0.04), wheel(0.4, iron, 0.04)]; b.userData.wheels[0].position.set(0.65, 0.5, 0); b.userData.wheels[1].position.set(-0.65, 0.4, 0); b.userData.wheels.forEach(w => b.add(w));
  const fr = add(b, Bx(1.35, 0.08, 0.08), iron, 0, 0.95, 0); fr.rotation.z = 0.06; add(b, Bx(0.06, 0.5, 0.06), iron, 0.65, 0.75, 0); add(b, Bx(0.06, 0.55, 0.06), iron, -0.65, 0.68, 0); add(b, Bx(0.42, 0.06, 0.22), SM('#5a3a20'), -0.05, 1.02, 0); add(b, Bx(0.05, 0.4, 0.05), iron, 0.68, 1.2, 0); add(b, Bx(0.05, 0.05, 0.6), iron, 0.68, 1.4, 0);
  b.userData.crank = crank(b, 0.65, 0.5); b.userData.seatY = 1.06; b.userData.seatX = -0.05; b.userData.pedX = 0.65; return b; }
function bikePenny() { const b = new T3.Group(); const iron = SM('#1f1f1f', { metalness: 0.5 }); b.userData.wheels = [wheel(1.0, iron, 0.05), wheel(0.25, iron, 0.04)]; b.userData.wheels[0].position.set(0.35, 1.0, 0); b.userData.wheels[1].position.set(-1.05, 0.25, 0); b.userData.wheels.forEach(w => b.add(w));
  const cv = new T3.QuadraticBezierCurve3(new T3.Vector3(0.25, 2.05, 0), new T3.Vector3(-0.8, 2.0, 0), new T3.Vector3(-1.05, 0.3, 0)); add(b, new T3.TubeGeometry(cv, 20, 0.04, 6), iron, 0, 0, 0); add(b, Bx(0.38, 0.06, 0.22), SM('#5a3a20'), 0.05, 2.1, 0); add(b, Bx(0.05, 0.05, 0.7), iron, 0.4, 2.3, 0); add(b, Bx(0.05, 0.3, 0.05), iron, 0.38, 2.15, 0);
  b.userData.crank = crank(b, 0.35, 1.0); b.userData.seatY = 2.14; b.userData.seatX = 0.05; b.userData.pedX = 0.35; return b; }
function bikeSafety() { const b = new T3.Group(); const paint = SM('#e74c3c', { roughness: 0.35, metalness: 0.3 }); b.userData.tyreM = SM('#151515'); b.userData.wheels = [wheel(0.42, b.userData.tyreM, 0.04), wheel(0.42, b.userData.tyreM, 0.04)]; b.userData.wheels[0].position.set(0.62, 0.42, 0); b.userData.wheels[1].position.set(-0.62, 0.42, 0); b.userData.wheels.forEach(w => b.add(w));
  const tube = (a, c) => { const v = new T3.Vector3(c[0] - a[0], c[1] - a[1], 0); const L = v.length(); const m = add(b, Bx(L, 0.06, 0.06), paint, (a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0); m.rotation.z = Math.atan2(v.y, v.x); };
  tube([0, 0.42], [0.5, 0.95]); tube([0, 0.42], [-0.15, 1.0]); tube([-0.15, 1.0], [0.5, 0.95]); tube([-0.62, 0.42], [0, 0.42]); tube([-0.62, 0.42], [-0.15, 1.0]); tube([0.5, 0.95], [0.62, 0.42]);
  add(b, Bx(0.32, 0.06, 0.2), SM('#222'), -0.18, 1.08, 0); add(b, Bx(0.05, 0.3, 0.05), SM('#999'), 0.52, 1.1, 0); add(b, Bx(0.05, 0.05, 0.6), SM('#999'), 0.52, 1.25, 0);
  b.userData.chain = add(b, Bx(0.64, 0.035, 0.03), SM('#777', { metalness: 0.7 }), -0.31, 0.42, 0.09); b.userData.chain2 = add(b, Bx(0.64, 0.035, 0.03), SM('#777', { metalness: 0.7 }), -0.31, 0.5, 0.09); add(b, Cy(0.11, 0.11, 0.03, 14), SM('#888', { metalness: 0.7 }), 0, 0.46, 0.09).rotation.x = PI / 2;
  b.userData.crank = crank(b, 0, 0.44); b.userData.seatY = 1.12; b.userData.seatX = -0.18; b.userData.pedX = 0; return b; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.25); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const G = grp([0, 0, 0]); R.G = G;
  add(G, Bx(400, 0.06, 5), SM('#55585e'), 150, 0.03, 0); for (let x = -40; x < 340; x += 4) add(G, Bx(1.6, 0.07, 0.15), BM('#f2f2f2'), x, 0.04, 1.6, false);
  add(G, Bx(400, 0.12, 2), SM('#d9d2c3'), 150, 0.06, -3.5); // pavement
  // cobbles for the boneshaker stretch
  const cb = rng(3); for (let i = 0; i < 260; i++) { const m = add(G, Bx(0.4, 0.08, 0.4), SM(['#8a8a8a', '#9c9c9c', '#7a7a7a'][i % 3]), 60 + cb() * 40, 0.07, (cb() - 0.5) * 4.4, false); m.rotation.y = cb(); }
  const cols = [['#ffd6a5', '#c0392b'], ['#a0c4ff', '#2c3e50'], ['#caffbf', '#8e44ad'], ['#ffadad', '#16a085'], ['#fdffb6', '#d35400'], ['#bdb2ff', '#c0392b']];
  for (let i = 0; i < 40; i++) { const x = -30 + i * 9; house(G, x, -9, cols[i % 6][0], cols[i % 6][1]); if (i % 2) tree(G, x + 4.5, -5.5, 0.9); }
  // school at the finish
  R.school = new T3.Group(); R.school.position.set(300, 0, -10); G.add(R.school); add(R.school, Bx(16, 7, 6), SM('#e8a87c'), 0, 3.5, 0); add(R.school, Bx(16.4, 0.5, 6.4), SM('#8a4a2a'), 0, 7.2, 0);
  add(R.school, Bx(5, 1.0, 0.1), BM('#fff', { map: ctex(512, 100, q => { q.fillStyle = '#1d3f8a'; q.fillRect(0, 0, 512, 100); q.fillStyle = '#fff'; q.font = '60px Russo'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('SCHOOL', 256, 54); }) }), 0, 5.8, 3.06, false);
  for (const x of [-5, -2, 2, 5]) add(R.school, Bx(1.6, 1.6, 0.1), SM('#9fd3ff'), x, 3.2, 3.05); add(R.school, Bx(2, 3, 0.1), SM('#5a3a20'), 0, 1.5, 3.05);
  // the pebble
  R.pebble = add(G, Sp(0.12, 8, 6), SM('#777'), 0, 0.1, 0.3);
  // bikes
  R.bikes = [bikeDraisine(), bikeBoneshaker(), bikePenny(), bikeSafety()]; R.bikes.forEach(b => G.add(b));
  R.you = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); G.add(R.you); tag(R.you, 'YOU', '#9ad0ff');
  R.bro = person({ s: 0.8, kid: true, skin: '#e0a878', top: '#2ecc71', bot: '#2d3436', hair: '#3a2410', style: 'spiky', face: 'grin', extras: ['bag'] }); G.add(R.bro); tag(R.bro, 'BRO', '#8ff0a4');
  // bus
  R.bus = new T3.Group(); G.add(R.bus); add(R.bus, Bx(8, 2.8, 2.6), SM('#f1c40f'), 0, 1.8, 0); add(R.bus, Bx(8.02, 0.3, 2.62), SM('#222'), 0, 1.1, 0); for (let i = 0; i < 5; i++) add(R.bus, Bx(1.1, 0.9, 0.05), SM('#bfe6ff', { roughness: 0.1, transparent: true, opacity: 0.35 }), -3 + i * 1.5, 2.4, 1.31, false);
  for (const x of [-2.6, 2.6]) for (const z of [-1.2, 1.2]) add(R.bus, Cy(0.5, 0.5, 0.3, 12), SM('#151515'), x, 0.5, z).rotation.x = PI / 2;
  R.broBus = person({ s: 0.8, kid: true, skin: '#e0a878', top: '#2ecc71', bot: '#2d3436', hair: '#3a2410', style: 'spiky', face: 'sad' }); R.broBus.position.set(-1.5, 1.35, 0.95); R.bus.add(R.broBus); tag(R.broBus, 'BRO', '#8ff0a4');
  // tyre pump
  R.pump = new T3.Group(); G.add(R.pump); add(R.pump, Cy(0.06, 0.06, 0.7, 8), SM('#c0392b'), 0, 0.35, 0); add(R.pump, Bx(0.3, 0.05, 0.05), SM('#222'), 0, 0.75, 0); R.pumpH = R.pump.children[1];
  R.dust = []; for (let i = 0; i < 10; i++) R.dust.push(add(G, Sp(0.15, 6, 5), SM('#d9c9a8', { transparent: true, opacity: 0.6 }), 0, -5, 0, false));
}
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [8, 22, 14], hs: '#cfe9ff' } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 50; scene.fog.far = 180; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); }

// rider x along the street per clip
function riderX(T) { const ci = CLI(T);
  if (T >= E.loop || ci === 0) return 270 + (T >= E.loop ? 0 : T) * 6;  // finale speed (also frame 1)
  if (ci === 1) return 10 + (T - E.c1) * 1.3; if (ci === 2) return 62 + (T - E.c2) * 2.6; if (ci === 3) return 120 + Math.min(T, E.over) * 0 + (Math.min(T, E.over + 0.1) - E.c3) * 3.6; if (ci === 4) return 180 + (T - E.c4) * 0.0;
  if (ci === 5) return 200 + (T - E.c5) * 2.5; return 262 + (T - E.c6) * 6; }
function camFollow(x, k, T, dz = 6.5, dy = 1.6, lx = 0.4, ly = 1.3) { look([x + lx, dy, dz], [x + lx, ly, 0], T); }
const SH = [
  [0, 'day', (k, T) => { const x = riderX(T); look([x - 1.5, 1.6, 7.5], [x + 0.6, 1.2, 0], T); }],
  [E.c1, 'day', (k, T) => { const x = riderX(T); camFollow(x + 0.6, k, T, 5.6, 1.5, 0.3, 1.1); }],
  [E.walks - 0.1, 'day', (k, T) => { const x = riderX(T); look([x + 1.4, 1.4, 4.4], [x + 0.6, 1.2, 0], T); }],
  [E.c2, 'day', (k, T) => { const x = riderX(T); const sh = (T > E.bump - 0.1 && T < E.c3) ? 0.04 * S(T * 70) : 0; look([x + 0.2, 1.7 + sh, 5.4], [x + 0.2, 1.3 + sh, 0], T); }],
  [E.bone - 0.1, 'day', (k, T) => { const x = riderX(T); const sh = 0.05 * S(T * 70); look([x + 1.2, 1.5 + sh, 3.2], [x, 1.5 + sh, 0], T); }],
  [E.c3, 'day', (k, T) => { const x = riderX(T); look([x - 0.6, 2.2, 8.2], [x + 0.4, 1.9, 0], T); }],
  [E.pebble - 0.1, 'day', (k, T) => { const x = riderX(T); look([x + 2.4, 2.0, 8.4], [x + 2.4, 1.4, 0], T); }],
  [E.c4, 'day', (k, T) => { const x = riderX(T); dolly([x, 1.2, 4.6], [x, 1.1, 3.6], [x, 0.85, 0], [x, 0.85, 0], k, T); }],
  [E.c5, 'day', (k, T) => { const x = riderX(T); look([x + 0.4, 1.3, 4.2], [x + 0.2, 0.9, 0], T); }],
  [E.c6, 'day', (k, T) => { const x = riderX(T); look([x - 2, 2.2, 9.5], [x + 1, 1.5, -2], T); }],
  [E.bus - 0.1, 'day', (k, T) => { look([295.5, 2.4, 12.5], [295.5, 1.9, -1], T); }],
  [E.loop, 'day', (k, T) => { const x = riderX(0); look([x - 1.5, 1.6, 7.5], [x + 0.6, 1.2, 0], 0); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function seatRider(b, x, T, pedal, ride = true) { b.position.set(x, 0, 0); b.visible = true; const u = R.you.userData; R.you.position.set(x + b.userData.seatX, b.userData.seatY - u.legH * 0.78 + 0.02, 0); R.you.rotation.y = PI / 2;
  b.userData.wheels.forEach(w => w.rotation.z = -pedal / (w.userData.tyre.geometry.parameters.radius));
  if (b.userData.crank) { b.userData.crank.rotation.z = -pedal / 0.45; } u.armL.rotation.x = u.armR.rotation.x = -1.3; u.body.rotation.x = 0.15;
  const ph = b.userData.crank ? b.userData.crank.rotation.z : 0; u.legL.rotation.x = -1.1 + 0.45 * S(ph); u.legR.rotation.x = -1.1 - 0.45 * S(ph); }
function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest); R.bikes.forEach(b => b.visible = false); R.bus.visible = false; R.pump.visible = false; R.broBus.visible = false; R.dust.forEach(d => d.position.y = -5);
  const x = riderX(T); const bro = R.bro, bu = bro.userData; bro.visible = true; bro.rotation.y = PI / 2;
  if (cl === 0 || cl === 6 && T < E.bus - 0.1) { const b = R.bikes[3]; seatRider(b, x, Tt, x * 1.2); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 2.2)); setFace(R.you, 'grin');
    bro.position.set(cl === 0 ? 271.5 : x + 6 - (Tt - (cl === 0 ? 0 : E.c6)) * 0, 0, -0.6); if (cl === 0) bro.position.x = 270 + 1.5 - Tt * 0.6; else bro.position.x = 285; setFace(bro, 'shock'); bu.armL.rotation.x = -0.4;
    R.dust.forEach((d, i) => { const ph = (Tt * 2 + i / 10) % 1; d.position.set(x - 0.8 - ph * 2.5, 0.2 + ph * 0.5, (i % 3 - 1) * 0.2); d.scale.setScalar(0.5 + ph * 1.5); d.material.opacity = 0.5 * (1 - ph); }); }
  if (cl === 1) { const b = R.bikes[0]; b.position.set(x, 0, 0); b.visible = true; b.userData.wheels.forEach(w => w.rotation.z = -(x * 1.0) / 0.38); const u = R.you.userData; R.you.position.set(x + b.userData.seatX, b.userData.seatY - 0.55 + 0.1, 0); R.you.rotation.y = PI / 2;
    walk(R.you, T * 9, 0.75); u.armL.rotation.x = u.armR.rotation.x = -1.3; u.body.position.y = u.legH; setFace(R.you, T > E.walks ? 'angry' : 'tired');
    const bx = lerp(x - 1.5, x + 3.5, prog(T, E.walks - 0.3, CL[2].start)); bro.position.set(bx, 0, -0.9); walk(bro, T * 7, 0.5); setFace(bro, T > E.shit - 0.2 ? 'wink' : 'grin'); bu.head.rotation.y = -0.6; }
  if (cl === 2) { const b = R.bikes[1]; const shake = T > E.bump - 0.1 ? 0.05 * Math.abs(S(T * 45)) : 0; seatRider(b, x, T, x * 1.3); b.position.y = shake; R.you.position.y += shake * 2.2; setFace(R.you, T > E.bump - 0.1 ? (S(T * 20) > 0 ? 'shock' : 'wide') : 'grin'); bro.visible = false; }
  if (cl === 3) { const b = R.bikes[2]; const crashK = prog(T, E.over - 0.15, E.over + 0.9); const px = 120 + (E.over + 0.1 - E.c3) * 3.6 + 1.4; R.pebble.position.set(px, 0.1, 0); R.pebble.visible = true;
    if (crashK <= 0) { seatRider(b, x, T, x * 2.0); setFace(R.you, T > E.genius - 0.1 ? 'grin' : 'smile'); }
    else { b.visible = true; b.position.set(x, 0, 0); b.rotation.z = -0.5 * Math.min(1, crashK * 2); const u = R.you.userData; const fx = x + 0.4 + crashK * 3.2, fy = 2.2 + S(crashK * PI) * 1.4 - crashK * 2.0; R.you.position.set(fx, Math.max(0, fy), 0); R.you.rotation.set(0, PI / 2, 0); R.you.rotation.x = 0; R.you.rotation.z = 0;
      R.you.rotateZ(0); R.you.userData.body.rotation.x = 0; R.you.rotation.y = PI / 2; R.you.rotateX(crashK * 3.6); u.armL.rotation.x = u.armR.rotation.x = -3.0; u.legL.rotation.x = 0.6; u.legR.rotation.x = -0.6; setFace(R.you, 'shock'); }
    bro.visible = false; } else { R.pebble.visible = false; R.bikes[2].rotation.z = 0; R.you.rotation.x = 0; }
  if (cl === 4) { const b = R.bikes[3]; seatRider(b, x, T, T * 2.2); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 1)); R.you.visible = T < E.chain - 0.2 || T > E.safety - 0.1; setFace(R.you, 'smile'); bro.visible = false; }
  else R.you.visible = true;
  if (cl === 5) { const b = R.bikes[3]; const inflate = prog(T, E.air, E.c6 - 0.2); const shake = T < E.air ? 0.04 * Math.abs(S(T * 50)) : 0; seatRider(b, x, T, x * 1.4); b.position.y = shake; R.you.position.y += shake * 2; b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1 + inflate * 0.04, 1 + inflate * 0.04, 1 + inflate * 1.2));
    setFace(R.you, T < E.air ? (S(T * 25) > 0 ? 'shock' : 'wide') : 'grin'); R.pump.visible = T > E.air - 0.1 && T < E.c6 - 0.3; R.pump.position.set(x - 0.9, 0, 0.6); R.pumpH.position.y = 0.6 + 0.15 * Math.abs(S(T * 12)); bro.visible = false; }
  if (cl === 6 && T >= E.bus - 0.1) { const b = R.bikes[3]; b.visible = true; b.position.set(294.2, 0, 0.6); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 2.2)); R.you.visible = true; R.you.position.set(295.4, 0, 0.9); R.you.rotation.y = 0.15; setFace(R.you, 'grin'); R.you.userData.armR.rotation.x = -2.9;
    R.bus.visible = true; R.broBus.visible = true; R.bus.position.set(lerp(290, 297.5, prog(T, E.bus - 0.1, E.loop)), 0, -2.0); bro.visible = false; }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], [riderX(T), 0, 0]); anim(T, si); sh[2](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.0 && d < 30; });
  return { si, t0 }; }
