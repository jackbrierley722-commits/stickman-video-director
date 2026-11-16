
// ---------- timing ----------
const E = { c1: CL[1].start, gorgeous: AT(1, 'you', 1), c2: CL[2].start, c3: CL[3].start, means: AT(3, 'that'), c4: CL[4].start, fish: AT(4, 'to'), c5: CL[5].start, nohill: AT(5, "there's"), hotel: AT(5, 'so', 1),
  c6: CL[6].start, crash: AT(6, 'the'), c7: CL[7].start, first: AT(7, 'but'), stay: AT(7, 'so'), c8: CL[8].start, views: AT(8, 'twelve'), still: AT(8, "he's") };
E.loop = TM.total - 0.4;
// world: beach along x, sea toward -z, land toward +z. Shoreline at z = 0. Hotel at x = 8, z = 26.
const HOT = [8, 0, 26], BAL = [6.25, 13.66, 21.35]; // fifth-floor balcony
function seaTex() { const t = ctex(256, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1a6a9a'); g.addColorStop(1, '#2a8ab8'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); const r = rng(5); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 2; for (let i = 0; i < 120; i++) { const x = r() * 256, y = r() * 256; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 3, x + 20, y); c.stroke(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(20, 20); return t; }
function build() {
  buildSky(); R.sun.intensity = 3.0; R.hemi.intensity = 1.1;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(400, 0.2, 60), SM('#ffffff', { map: noiseTex(256, 256, '#e2cfa0', [['rgba(0,0,0,0.06)', 3000, 2], ['rgba(255,255,255,0.08)', 2000, 2]], 3, [60, 10]), roughness: 1 }), 0, -0.1, 18, false);
  R.wetSand = add(G, Bx(400, 0.2, 80), SM('#ffffff', { map: noiseTex(256, 256, '#a8946a', [['rgba(0,0,0,0.1)', 3000, 2]], 4, [60, 12]), roughness: 0.4 }), 0, -0.14, -40, false);
  R.sea = add(G, Bx(400, 0.2, 300), SM('#ffffff', { map: seaTex(), roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.95 }), 0, 0.0, -150, false);
  R.foam = add(G, Bx(400, 0.06, 1.2), SM('#ffffff', { roughness: 0.6, transparent: true, opacity: 0.85 }), 0, 0.06, -0.6, false);
  add(G, Bx(400, 0.08, 6), SM('#55585e'), 0, 0.0, 34, false); // promenade road
  // the hotel: tall concrete with balconies
  const ht = R.hotel = new T3.Group(); ht.position.set(...HOT); G.add(ht); const conc = SM('#ffffff', { map: noiseTex(128, 128, '#c8c4bc', [['rgba(0,0,0,0.06)', 600, 2]], 9, [4, 8]), roughness: 0.9 }); add(ht, Bx(14, 36, 8), conc, 0, 18, 0);
  for (let f = 0; f < 11; f++) for (let x = -5.25; x <= 5.25; x += 3.5) { add(ht, Bx(2.8, 1.8, 0.1), SM('#4a6a88', { metalness: 0.3, roughness: 0.1 }), x, 1.8 + f * 3.2, -4.02); add(ht, Bx(3, 0.12, 1.2), conc, x, 0.8 + f * 3.2, -4.6); add(ht, Bx(3, 0.8, 0.06), SM('#e8e8ea', { metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.5 }), x, 1.2 + f * 3.2, -5.2); }
  add(ht, Bx(14.4, 1.2, 8.4), SM('#e8e4dc'), 0, 36.6, 0); add(ht, new T3.PlaneGeometry(9, 1.6), new T3.MeshBasicMaterial({ map: ctex(512, 92, c => { c.fillStyle = '#e8e4dc'; c.fillRect(0, 0, 512, 92); c.fillStyle = '#1d3f8a'; c.font = '56px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HOTEL AZUL', 256, 50); }), toneMapped: false }), 0, 34.6, -4.06, false).rotation.y = PI;
  // palms, parasols, towels, siren tower
  const palm = (x, z, s) => { const p = new T3.Group(); p.position.set(x, 0, z); p.scale.setScalar(s); G.add(p); const cv = new T3.CatmullRomCurve3([new T3.Vector3(0, 0, 0), new T3.Vector3(0.4, 3, 0), new T3.Vector3(1.2, 6, 0.2)]); add(p, new T3.TubeGeometry(cv, 16, 0.18, 8), SM('#8a6a48', { roughness: 1 }), 0, 0, 0); for (let i = 0; i < 7; i++) { const a = i / 7 * 2 * PI; const lf = add(p, Bx(2.6, 0.04, 0.5), SM('#3a8a3a', { roughness: 0.9 }), 1.2 + C(a) * 1.1, 6 - 0.3, 0.2 + S(a) * 1.1); lf.rotation.set(0.3 * S(a), -a, -0.5); } return p; };
  [[-14, 10], [-4, 14], [14, 9], [22, 13], [-24, 12]].forEach(([x, z], i) => palm(x, z, 0.9 + (i % 2) * 0.2));
  const pcols = ['#e8263a', '#f1c40f', '#2a6fdb', '#27ae60', '#ff7ab0']; R.parasols = []; [[-8, 5], [-2, 6], [4, 4.5], [10, 6], [16, 5], [-14, 4.5]].forEach(([x, z], i) => { const p = new T3.Group(); p.position.set(x, 0, z); G.add(p); add(p, Cy(0.03, 0.03, 2.2, 6), SM('#eee'), 0, 1.1, 0); add(p, new T3.ConeGeometry(1.3, 0.5, 12), SM(pcols[i % 5], { roughness: 0.7 }), 0, 2.3, 0); add(p, Bx(0.8, 0.02, 1.8), SM(pcols[(i + 2) % 5]), 0.8, 0.02, 0.6); R.parasols.push(p); });
  const sp = new T3.Group(); sp.position.set(-6, 0, 16); G.add(sp); add(sp, Cy(0.15, 0.2, 8, 10), SM('#8a8e94', { metalness: 0.6 }), 0, 4, 0); for (const r of [0, 1, 2]) { const h = add(sp, new T3.ConeGeometry(0.4, 0.8, 12, 1, true), SM('#d8d8d8', { metalness: 0.5, side: T3.DoubleSide }), 0, 7.6, 0); h.rotation.set(PI / 2, r * 2.1, 0); h.position.set(S(r * 2.1) * 0.4, 7.6, C(r * 2.1) * 0.4); }
  R.sirenLight = new T3.PointLight('#ff2020', 0, 30, 1.4); R.sirenLight.position.set(-6, 8.6, 16); G.add(R.sirenLight); R.sirenM = add(sp, Sp(0.25, 12, 8), new T3.MeshBasicMaterial({ color: '#ff2020', toneMapped: false }), 0, 8.4, 0, false);
  // the tsunami wave (far out at first, then crashing in)
  const wv = R.wave = new T3.Group(); G.add(wv); const wm = SM('#2a7a9a', { roughness: 0.25, metalness: 0.1, emissive: '#0a2a3a', emissiveIntensity: 0.4 }); const shape = new T3.Shape(); shape.moveTo(0, 0); shape.lineTo(0, 8); shape.quadraticCurveTo(3, 11, 7, 9); shape.quadraticCurveTo(4, 8.5, 5, 4); shape.lineTo(9, 0); shape.closePath();
  const wg = new T3.ExtrudeGeometry(shape, { depth: 400, bevelEnabled: false, curveSegments: 12 }); wg.translate(0, 0, -200); wg.rotateY(PI / 2); add(wv, wg, wm, 0, 0, 0, false); R.waveFoam = add(wv, Bx(400, 1.4, 3.2), SM('#ffffff', { roughness: 0.7, emissive: '#ffffff', emissiveIntensity: 0.3 }), 0, 9.4, 5.0, false); for (let i = 0; i < 30; i++) spr(wv, GLOW, '#ffffff', 6, -150 + i * 10, 10.2, 5.5, 0.7, T3.NormalBlending);
  // the flood: a rising water sheet that sweeps inland around the hotel
  R.flood = add(G, Bx(400, 0.4, 70), SM('#3a6a6a', { roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92, map: seaTex() }), 0, -1, 24, false);
  R.floodFoam = []; for (let i = 0; i < 40; i++) R.floodFoam.push(spr(G, GLOW, '#ffffff', 2.5, 0, -10, 0, 0, T3.NormalBlending));
  // crowd running away from the sea
  R.crowd = []; const cols = ['#e8263a', '#2a6fdb', '#f1c40f', '#27ae60', '#ff9a3a', '#8e44ad', '#e8e8e8', '#1abc9c']; const r = rng(4);
  for (let i = 0; i < 14; i++) { const p = human({ skin: ['#d8a078', '#e8c0a0', '#8a5a3a', '#c8906a'][i % 4], top: cols[i % 8], bot: ['#2a6fdb', '#e8c860', '#2a2e3a', '#c84a4a'][i % 4], hair: ['#2a1a10', '#d8b45a', '#1a1a1a', '#5a3a1a'][i % 4], short: true }); p.userData.base = [-20 + r() * 40, 1 + r() * 9, 3 + r() * 2.5]; G.add(p); R.crowd.push(p); }
  // you and your bro (bro in a loud shirt)
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a5aa8', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8', short: true }); G.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#ff7ab0', bot: '#f1c40f', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e', short: true }); G.add(R.bro);
  R.broPhone = new T3.Group(); R.bro.userData.armR.userData.h.add(R.broPhone); add(R.broPhone, RB(0.075, 0.15, 0.01, 0.008), SM('#111'), 0, -0.06, 0.03); R.phoneScr = add(R.broPhone, new T3.PlaneGeometry(0.066, 0.135), new T3.MeshBasicMaterial({ map: ctex(64, 128, () => {}), toneMapped: false }), 0, -0.06, 0.036, false);
  R.fish = new T3.Group(); G.add(R.fish); add(R.fish, Sp(0.12, 14, 10), SM('#a8b8c8', { metalness: 0.6, roughness: 0.3 }), 0, 0, 0).scale.set(2.2, 0.9, 0.55); add(R.fish, new T3.ConeGeometry(0.1, 0.18, 4), SM('#a8b8c8', { metalness: 0.6 }), -0.32, 0, 0).rotation.z = PI / 2; add(R.fish, Sp(0.02), SM('#111'), 0.2, 0.03, 0.06);
  R.gold = spr(G, GLOW, '#fff0b0', 1.6, 0, -10, 0, 0);
}
function drawStory(views) { const c = R.phoneScr.material.map.userData.g; c.fillStyle = '#4a8ab8'; c.fillRect(0, 0, 64, 128); c.fillStyle = '#1a3a5a'; c.fillRect(0, 70, 64, 58); c.fillStyle = '#fff'; c.font = '9px Arial'; c.fillText(views >= 0 ? 'Seen by ' + views : 'REC', 6, 12); if (views < 0) { c.fillStyle = '#e8263a'; c.beginPath(); c.arc(54, 9, 4, 0, 7); c.fill(); } R.phoneScr.material.map.needsUpdate = true; }
let STORY = null;
const SH = [
  [0, (k, T) => TR(k, [2.6, 2.6, 13], [2.2, 2.7, 11.5], [0, 4, -60], [0, 4.4, -60])],
  [E.c1, (k, T) => TR(k, [1.4, 1.6, 6.4], [1.3, 1.6, 6.2], [0.6, 1.55, 4.6], [0.6, 1.55, 4.6])],
  [E.gorgeous - 0.1, (k, T) => TR(k, [0.75, 1.6, 5.9], [0.68, 1.58, 5.55], [0.6, 1.58, 4.6], [0.6, 1.58, 4.6])],
  [E.c2, (k, T) => TR(k, [1.05, 1.8, 6.3], [0.95, 1.8, 6.0], [0.45, 1.5, -6], [0.45, 1.6, -6])],
  [E.c3, (k, T) => TR(k, [0, 4.5, 12], [0, 5.5, 10], [0, 0, -25], [0, 0, -30])],
  [E.c4, (k, T) => { const x = R.bro.position; look([x.x + 2.4, 1.6, x.z + 3.4], [x.x, 0.9, x.z - 1]); }],
  [E.c5, (k, T) => { const p = R.you.position; look([p.x + 3, 2.0, p.z - 3.5], [p.x, 1.2, p.z + 2]); }],
  [E.hotel - 0.1, (k, T) => TR(k, [HOT[0] - 14, 2, HOT[2] - 34], [HOT[0] - 12, 3, HOT[2] - 32], [HOT[0], 14, HOT[2]], [HOT[0], 18, HOT[2]])],
  [E.c6, (k, T) => TR(k, [BAL[0] + 2.4, BAL[1] + 2.0, BAL[2] - 1.4], [BAL[0] + 2.6, BAL[1] + 2.2, BAL[2] - 1.8], [BAL[0] - 2, 4, BAL[2] - 30], [BAL[0] - 2, 1, BAL[2] - 18])],
  [E.c7, (k, T) => TR(k, [BAL[0] + 0.4, BAL[1] + 1.65, BAL[2] - 2.9], [BAL[0] + 0.35, BAL[1] + 1.6, BAL[2] - 2.6], [BAL[0], BAL[1] + 1.35, BAL[2]], [BAL[0], BAL[1] + 1.35, BAL[2]])],
  [E.first - 0.1, (k, T) => TR(k, [BAL[0] + 0.2, BAL[1] + 1.9, BAL[2] - 0.6], [BAL[0] + 0.2, BAL[1] + 2.0, BAL[2] - 0.7], [BAL[0], 4, BAL[2] - 100], [BAL[0], 5, BAL[2] - 100])],
  [E.c8, (k, T) => TR(k, [BAL[0] - 0.1, BAL[1] + 1.6, BAL[2] - 2.2], [BAL[0] - 0.2, BAL[1] + 1.55, BAL[2] - 1.9], [BAL[0] - 0.55, BAL[1] + 1.3, BAL[2]], [BAL[0] - 0.55, BAL[1] + 1.25, BAL[2]])],
  [E.loop, (k, T) => look([2.6, 2.6, 13], [0, 4, -60])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const Tt = loop ? 0.5 : T;
  // siren light spins, sea animates
  const flash = Math.floor(Tt * 3) % 2; R.sirenLight.intensity = flash ? 30 : 0; R.sirenM.material.color.set(flash ? '#ff3030' : '#400a0a'); R.sea.material.map.offset.set(Tt * 0.01, Tt * 0.02);
  // the sea pulls back from the beach (clip 3 onward), the wave approaches, then floods inland
  const draw = cl >= 3 ? ease(prog(T, E.c3 + 0.3, E.c4 + 0.8)) : 0; R.sea.position.z = -150 - 60 * draw; R.foam.position.z = -0.6 - 60 * draw; R.foam.visible = draw < 0.95;
  const wz = cl <= 2 ? -95 : cl <= 5 ? lerp(-90, -45, prog(T, E.c3, E.c6)) : cl === 6 ? lerp(-35, 30, ease(prog(T, E.c6, E.crash + 0.6))) : -85; R.wave.position.set(0, cl === 7 || cl === 8 ? -2 : 0, wz); R.wave.visible = wz < 40 && !(cl === 7 && T < E.first - 0.1); R.wave.scale.y = cl === 6 ? 1.6 : cl >= 7 ? 3.2 : 3.4;
  const flood = cl >= 6 ? ease(prog(T, E.crash - 0.1, E.crash + 1.2)) : 0; R.flood.position.y = -1 + 5 * flood + 0.1 * S(T * 2); R.flood.material.map.offset.set(0, -T * 0.05);
  R.floodFoam.forEach((f, i) => { const ph = (T * 0.4 + i / 40) % 1; f.position.set(-25 + (i * 7.3) % 50, R.flood.position.y + 0.25, 4 + ((i * 3.7) % 40)); f.material.opacity = flood > 0.05 ? 0.4 * (1 - Math.abs(ph - 0.5) * 2) : 0; });
  // crowd: panicking, running inland
  R.crowd.forEach((p, i) => { const b = p.userData.base; p.visible = cl <= 5 && !(cl === 1 || cl === 2); const run = cl === 0 ? Tt : T; p.position.set(b[0] + S(i) * 0.5 * run, 0, b[1] + run * (2.2 + (i % 3) * 0.4) % 26); p.rotation.y = 0.15 * S(i); walkPose(p, run * 11 + i, 1.2); p.userData.armL.rotation.x = -2.6; p.userData.armR.rotation.x = -2.4 + 0.3 * S(run * 9 + i); face(p, 'shock', run); });
  // you and bro on the beach
  const you = R.you, bro = R.bro; rest(you); rest(bro); you.visible = bro.visible = true; R.broPhone.visible = true; R.fish.visible = false; R.gold.material.opacity = 0;
  you.position.set(1.4, 0, 6); you.rotation.y = -2.4; bro.position.set(0.6, 0, 4.6); bro.rotation.y = PI * 0.1; face(you, 'shock', T); face(bro, 'grin', T);
  bro.userData.armR.rotation.set(-1.5, 0, -0.2); bro.userData.armR.userData.e.rotation.x = -0.4;
  if (cl === 0) { bro.rotation.y = 0.2; you.rotation.y = PI; bro.userData.armR.rotation.set(-2.5, 0, -0.3); bro.userData.armR.userData.e.rotation.x = -0.6; face(bro, 'grin', T); }
  if (cl === 1) { you.rotation.y = -2.4; face(you, T > E.gorgeous ? 'grin' : 'neutral', T); bro.rotation.y = 0.5; bro.userData.armR.rotation.set(-0.2, 0, -0.1); face(bro, 'grin', T); bro.userData.head.rotation.set(-0.15, 0.3, 0.1); if (T > E.gorgeous) { R.gold.position.set(0.62, 1.62, 4.75); R.gold.material.opacity = 0.35 + 0.15 * S(T * 4); } }
  if (cl === 2) { bro.rotation.y = PI; you.rotation.y = -2.6; you.position.set(1.9, 0, 6.2); }
  if (cl === 3) { bro.rotation.y = PI; face(you, 'shock', T); }
  if (cl === 4) { const k = ease(prog(T, E.c4 + 0.2, E.fish)); bro.position.set(0.6, 0, lerp(4.6, -8, k)); bro.rotation.y = PI; walkPose(bro, T * 11, 1.1); R.broPhone.visible = false; R.fish.visible = true; R.fish.position.set(0.9, 0.12 + 0.12 * Math.abs(S(T * 14)), -8.8); R.fish.rotation.z = 0.4 * S(T * 20);
    if (T > E.fish) { bro.position.z = -8.3; rest(bro); bro.userData.up.rotation.x = 0.8; bro.userData.armR.rotation.x = -1.2; R.fish.position.set(0.85, 0.5, -8.7); face(bro, 'grin', T); } }
  if (cl === 5) { const k = ease(prog(T, E.c5, E.hotel)); const z = lerp(-7, 22, k); you.position.set(lerp(0.8, HOT[0] - 0.5, k), 0, z); bro.position.set(you.position.x - 0.9, 0, z - 0.8); you.rotation.y = bro.rotation.y = 0.2; walkPose(you, T * 11, 1.1); walkPose(bro, T * 11 + 1, 1.0); you.userData.armL.rotation.set(-1.4, 0, -0.4); R.broPhone.visible = false; R.fish.visible = true; bro.userData.armR.rotation.x = -1.0; R.fish.position.copy(bro.position).add(new T3.Vector3(0.3, 1.0, 0.4)); face(bro, 'grin', T); face(you, 'angry', T); }
  if (cl >= 6 || (loop && false)) { you.position.set(BAL[0] + 0.55, BAL[1], BAL[2]); bro.position.set(BAL[0] - 0.55, BAL[1], BAL[2]); you.rotation.y = bro.rotation.y = PI; face(you, 'shock', T); face(bro, 'shock', T);
    if (cl === 7) { bro.rotation.y = PI - 0.5; face(bro, T < E.first ? 'grin' : 'sad', T); you.rotation.y = PI + 0.6; face(you, 'angry', T); you.userData.armR.rotation.set(-1.4, 0, -0.3); if (T > E.stay) { you.userData.armR.rotation.set(-1.2, 0, 0.6); } }
    if (cl === 8) { bro.rotation.y = PI - 0.3; you.rotation.y = PI + 0.4; face(bro, 'sad', T); face(you, 'neutral', T); R.fish.visible = true; bro.userData.armL.rotation.set(-0.6, 0, 0.2); R.fish.position.set(bro.position.x - 0.35, BAL[1] + 0.85, bro.position.z - 0.25); R.fish.rotation.set(0, 0, -1.2); }
    if (cl === 6) { R.fish.visible = true; R.fish.position.set(bro.position.x - 0.35, BAL[1] + 0.85, bro.position.z - 0.2); } }
  const views = cl === 8 && T > E.views - 0.1 ? 12 : -1; if (STORY !== views) { drawStory(views); STORY = views; }
  R.sky.visible = true; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z); return { si, t0 }; }
