const BM = (c) => new T3.MeshBasicMaterial({ color: c, toneMapped: false });
const RIVW = [-600, 0, -400], HOMEW = [600, 0, 800];
const RV = (x, y, z) => [RIVW[0] + x, RIVW[1] + y, RIVW[2] + z], HM = (x, y, z) => [HOMEW[0] + x, HOMEW[1] + y, HOMEW[2] + z];
function dogM() { const g = new T3.Group(); const fur = SM('#5a4430', { roughness: 0.9 }), tan = SM('#9a7040', { roughness: 0.9 }), blk = SM('#0a0a0a');
  add(g, Bx(0.3, 0.3, 0.85), fur, 0, 0.62, 0); add(g, Bx(0.28, 0.2, 0.5), tan, 0, 0.5, 0.15);
  const head = new T3.Group(); head.position.set(0, 0.82, 0.46); g.add(head); add(head, Bx(0.24, 0.24, 0.26), fur, 0, 0, 0); add(head, Bx(0.14, 0.12, 0.2), tan, 0, -0.05, 0.2); add(head, Bx(0.06, 0.05, 0.04), blk, 0, -0.01, 0.31);
  for (const sx of [-1, 1]) { const e = add(head, new T3.ConeGeometry(0.05, 0.16, 4), fur, sx * 0.08, 0.18, -0.04); e.rotation.z = -sx * 0.15; add(head, Bx(0.03, 0.03, 0.02), SM('#e8c040'), sx * 0.07, 0.04, 0.13, false); }
  const legs = []; for (const [x, z] of [[-0.1, 0.32], [0.1, 0.32], [-0.1, -0.32], [0.1, -0.32]]) { const l = new T3.Group(); l.position.set(x, 0.5, z); g.add(l); add(l, Bx(0.08, 0.5, 0.08), fur, 0, -0.25, 0); legs.push(l); }
  const tail = new T3.Group(); tail.position.set(0, 0.7, -0.42); g.add(tail); add(tail, Cy(0.025, 0.04, 0.4, 6), fur, 0, 0.18, -0.06).rotation.x = -0.5;
  g.userData = { head, legs, tail }; return g; }
function dogRun(d, T, a = 1) { const u = d.userData; u.legs.forEach((l, i) => l.rotation.x = (i % 2 === (i < 2 ? 0 : 1) ? 1 : -1) * 0.9 * a * S(T * 16)); d.children[0].position.y = 0.62 + 0.04 * a * Math.abs(S(T * 16)); u.head.rotation.x = 0; u.tail.rotation.x = 0.3 * S(T * 12); }
function dogStill(d, T, sniff) { const u = d.userData; u.legs.forEach(l => l.rotation.x = 0); u.head.rotation.x = sniff ? 0.5 + 0.12 * S(T * 9) : 0; u.tail.rotation.x = 0.2 * S(T * 5); }
function build6() {
  // more woods behind the roadside trees, for the sprint
  const r = rng(77), trunk = SM('#3a2a1e'), leaf = SM('#1e3a22'), leaf2 = SM('#244a28'); for (let i = 0; i < 90; i++) { const x = -165 - r() * 45, z = -1 + r() * 32; if (Math.abs(x + 187) < 1.6) continue; const h = 3 + r() * 3; add(R.yardG, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(R.yardG, new T3.ConeGeometry(1.0 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  R.dog = dogM(); R.dog.scale.setScalar(1.25); R.yardG.add(R.dog);
  // ---- the river ----
  const rv = R.riv = new T3.Group(); rv.position.set(...RIVW); scene.add(rv); const grass = SM('#1e2a1a', { roughness: 1 }), mud = SM('#2a221a', { roughness: 1 });
  add(rv, Bx(90, 3.5, 30), grass, 0, -1.75, -18); add(rv, Bx(90, 3.5, 30), grass, 0, -1.75, 18); add(rv, Bx(90, 0.2, 6), mud, 0, -3.1, 0); add(rv, Bx(90, 0.05, 0.2), mud, 0, -0.02, -3.0);
  const wt = new T3.MeshStandardMaterial({ color: '#1a4050', transparent: true, opacity: 0.62, roughness: 0.15, metalness: 0.3, side: T3.DoubleSide }); R.water = add(rv, new T3.PlaneGeometry(90, 6), wt, 0, -0.5, 0, false); R.water.rotation.x = -PI / 2;
  for (let i = 0; i < 60; i++) { const x = -40 + r() * 80, side = r() < 0.5 ? -1 : 1, z = side * (4.5 + r() * 14); if (Math.abs(x) < 2.5 && side < 0 && z > -9) continue; const h = 3 + r() * 3; add(rv, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(rv, new T3.ConeGeometry(1.1 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  // bridge downstream, city beyond
  const conc = SM('#6a6a70', { roughness: 0.9 }); add(rv, Bx(3.2, 0.5, 16), conc, 18, 2.8, 0); for (const z of [-3.3, 3.3]) add(rv, Bx(0.8, 6.5, 0.8), conc, 18, -0.4, z); for (const z of [-7.8, 7.8]) add(rv, Bx(3.2, 0.9, 0.15), conc, 18, 3.4, z);
  for (const z of [-7, 7]) { glow(rv, '#ffd8a0', 2.5, 18, 5.2, z, 0.9); const pl = new T3.PointLight('#ffd8a0', 20, 16, 1.3); pl.position.set(18, 5, z); rv.add(pl); }
  for (let i = 0; i < 24; i++) { const x = 55 + r() * 60, z = -40 + r() * 80, w = 6 + r() * 8, h = 12 + r() * 40; const t = ctex(64, 128, (c) => { c.fillStyle = '#14161e'; c.fillRect(0, 0, 64, 128); for (let y = 4; y < 128; y += 8) for (let xx = 4; xx < 64; xx += 8) if (Math.random() < 0.45) { c.fillStyle = Math.random() < 0.5 ? '#ffd890' : '#cfe0ff'; c.fillRect(xx, y, 4, 4); } }); add(rv, Bx(w, h, w), new T3.MeshBasicMaterial({ map: t, fog: false }), x, h / 2 - 1, z, false); }
  R.moon = new T3.DirectionalLight('#9ab8ff', 0); R.moon.position.set(RIVW[0] - 10, 20, RIVW[2] - 10); R.moon.target.position.set(...RIVW); scene.add(R.moon); scene.add(R.moon.target);
  R.bankL = new T3.PointLight('#d8e4ff', 0, 10, 1.2); R.bankL.position.set(1.0, 2.5, -5.5); rv.add(R.bankL); R.rdog = dogM(); R.rdog.scale.setScalar(1.25); rv.add(R.rdog); R.rcop = guardP(); rv.add(R.rcop); R.torch = new T3.SpotLight('#fff4d8', 0, 25, 0.35, 0.5, 1.2); rv.add(R.torch); R.torchT = new T3.Object3D(); rv.add(R.torchT); R.torch.target = R.torchT;
  R.bubbles = []; for (let i = 0; i < 16; i++) R.bubbles.push({ x: Math.random(), ph: Math.random(), s: 6 + Math.random() * 10 });
  // ---- home at sunrise ----
  const hm = R.home = new T3.Group(); hm.position.set(...HOMEW); scene.add(hm);
  const sky = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a7ac0'); gr.addColorStop(0.4, '#f0a890'); gr.addColorStop(0.5, '#ffd090'); gr.addColorStop(1, '#ffe8c0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  add(hm, Sp(220, 24, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); const sun = glow(hm, '#fff0c0', 40, 60, 8, -150, 1); sun.material.fog = false;
  add(hm, Bx(120, 0.2, 120), SM('#6a8a4a', { roughness: 1 }), 0, -0.1, 0); add(hm, Bx(1.3, 0.05, 8), SM('#b8b0a0'), 0, 0.01, 4.6); add(hm, Bx(120, 0.06, 2.2), SM('#a8a49c'), 0, 0.02, 9.5); add(hm, Bx(120, 0.05, 6), SM('#3a3a40'), 0, 0.0, 13.5);
  const wall = SM('#ece2cc', { roughness: 0.9 }); for (const sx of [-1, 1]) add(hm, Bx(3.95, 3.4, 0.25), wall, sx * 2.525, 1.7, -0.12); add(hm, Bx(1.1, 1.2, 0.25), wall, 0, 2.8, -0.12); add(hm, Bx(0.25, 3.4, 6), wall, -4.5, 1.7, -3); add(hm, Bx(0.25, 3.4, 6), wall, 4.5, 1.7, -3);
  const roof = add(hm, new T3.ConeGeometry(6.6, 2.4, 4), SM('#8a3a2a'), 0, 4.6, -3); roof.rotation.y = PI / 4; roof.scale.z = 0.7;
  for (const sx of [-1, 1]) add(hm, Bx(0.1, 2.3, 0.12), SM('#f4f0e6'), sx * 0.6, 1.15, 0.02); add(hm, Bx(1.3, 0.1, 0.12), SM('#f4f0e6'), 0, 2.25, 0.02); add(hm, Bx(1.8, 0.15, 1.1), SM('#c8c0b0'), 0, 0.075, 0.6); glow(hm, '#ffe0a0', 0.8, 0.85, 2.3, 0.15, 0.9);
  for (const x of [-2.6, 2.6]) { add(hm, Bx(1.4, 1.1, 0.06), BM('#ffd890'), x, 1.8, 0.02, false); add(hm, Bx(1.5, 0.08, 0.1), SM('#f4f0e6'), x, 1.22, 0.05); }
  R.hdoor = new T3.Group(); R.hdoor.position.set(-0.5, 0, 0.0); hm.add(R.hdoor); add(R.hdoor, Bx(1.0, 2.15, 0.07), SM('#2a4a7a'), 0.5, 1.08, 0); add(R.hdoor, Sp(0.04, 8, 6), SM('#d8b84a', { metalness: 0.7 }), 0.88, 1.05, 0.06);
  add(hm, Bx(1.1, 2.3, 0.05), BM('#e8b878'), 0, 1.1, -2.6, false); add(hm, Bx(1.2, 0.05, 2.6), SM('#8a6a4a'), 0, 0.0, -1.3); for (const x of [-0.6, 0.6]) add(hm, Bx(0.05, 2.3, 2.6), SM('#e8d8b8'), x, 1.15, -1.3);
  R.hall = new T3.PointLight('#ffd8a0', 0, 6, 1.2); R.hall.position.set(0, 2.0, -1.2); hm.add(R.hall);
  for (let i = 0; i < 12; i++) add(hm, Bx(0.08, 0.9, 0.08), SM('#f4f0e6'), -5 + i * 0.4 - (i > 5 ? -1.6 : 0), 0.45, 8.3); add(hm, Bx(4.5, 0.08, 0.06), SM('#f4f0e6'), -3.3, 0.8, 8.3); add(hm, Bx(4.5, 0.08, 0.06), SM('#f4f0e6'), 3.3, 0.8, 8.3);
  add(hm, Cy(0.2, 0.25, 2.5, 8), SM('#5a3a24'), 4.0, 1.25, 4); add(hm, Sp(1.6, 10, 8), SM('#3a6a2a'), 4.0, 3.4, 4);
  for (const x of [-14, 14]) { add(hm, Bx(8, 3.4, 6), SM(x < 0 ? '#d8c8b0' : '#c8d0d8'), x, 1.7, -3); const rf = add(hm, new T3.ConeGeometry(6.4, 2.2, 4), SM('#5a4a4a'), x, 4.5, -3); rf.rotation.y = PI / 4; rf.scale.z = 0.7; }
  R.hSun = new T3.DirectionalLight('#ffd8b0', 0); R.hSun.position.set(HOMEW[0] + 30, 20, HOMEW[2] + 40); R.hSun.target.position.set(...HOMEW); scene.add(R.hSun); scene.add(R.hSun.target); R.hHemi = new T3.HemisphereLight('#ffe8d0', '#6a5a4a', 0); scene.add(R.hHemi);
  R.photo = add(R.vm, new T3.PlaneGeometry(0.2, 0.24), new T3.MeshBasicMaterial({ map: ctex(150, 180, c => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, 150, 180); c.fillStyle = '#e8b890'; c.fillRect(10, 10, 130, 130); c.fillStyle = '#ffe0a8'; c.fillRect(10, 10, 130, 60); c.fillStyle = '#4a2a18'; c.beginPath(); c.ellipse(75, 66, 34, 40, 0, 0, PI * 2); c.fill(); c.fillRect(41, 66, 68, 60); c.fillStyle = '#d8a882'; c.beginPath(); c.ellipse(75, 72, 24, 30, 0, 0, PI * 2); c.fill(); c.fillStyle = '#c86a7a'; c.fillRect(38, 112, 74, 28); c.fillStyle = '#222'; c.fillRect(64, 66, 5, 5); c.fillRect(81, 66, 5, 5); c.fillStyle = '#a04a4a'; c.fillRect(68, 86, 14, 3); c.fillStyle = '#3a3a5a'; c.font = 'italic 17px Russo'; c.textAlign = 'center'; c.fillText('come home', 75, 166); }), toneMapped: false }), 0, -0.06, -0.6, false);
  R.wife = person({ skin: '#d8a882', top: '#c86a7a', bot: '#3a3a4a', hair: '#4a2a18', w: 0.92 }); add(R.wife.userData.head, Bx(0.24, 0.34, 0.1), SM('#4a2a18', { roughness: 0.95 }), 0, -0.1, -0.08); hm.add(R.wife);
  R.girl = person({ skin: '#d8a882', top: '#f0c040', bot: '#e88aa8', hair: '#4a2a18', w: 0.95 }); for (const sx of [-1, 1]) add(R.girl.userData.head, Sp(0.05, 8, 6), SM('#4a2a18'), sx * 0.12, 0.02, -0.04); R.girl.scale.setScalar(0.55); hm.add(R.girl);
}
// ---------- where you are ----------
// clips: 0 hook underwater . 1 prison behind you + photo of your wife . 2 Dex pulls up, you walk away . 3 roadblock, cop sees you, dog released
//        4 sprint . 5 river jump . 6 underwater, scent lost . 7 drift under bridge . 8 sunrise walk + knock . 9 the door
const WALK = T => { const ci = CLI(T); if (ci === 1) return [lerp(-60, -62, prog(T, E.c1, E.c2)), -8.4]; if (ci === 2) return [lerp(-161, -163.5, prog(T, E.c2, E.c3)), -8.4]; if (ci === 3) return [lerp(-184, -186, prog(T, E.c3, E.saw)), -8.4]; return [-186, -8.4]; };
const RUN = T => { const k = prog(T, E.c4, E.c5); return [lerp(-186, -188, k), lerp(-6, 18, k)]; };
const DEXOUT = T => CLI(T) >= 3;
const carX = T => { const ci = CLI(T); if (ci === 2) { const w = WALK(T)[0]; return T < E.walked ? w + 0.25 : w + 0.25 - 30 * prog(T, E.walked, E.c3) ** 1.6; } return STOPC; };
function jumpCam(T) { const j = prog(T, E.jump - 0.05, E.jump + 0.65); if (T < E.jump - 0.05) { const k = prog(T, E.c5, E.jump - 0.05); return RV(0, 1.6, lerp(-12, -3.6, k)); } return RV(0, j < 0.4 ? lerp(1.6, 2.1, j / 0.4) : lerp(2.1, -1.5, (j - 0.4) / 0.6), lerp(-3.6, -0.2, j)); }
const SH = [
  [0, (k, T) => fp(RV(0, -1.5, 0.3), RV(0.2, 1.4, -3.6), T, 0, 1.0)],
  [E.c1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(-5, 4, -12), T, 0.5, 0.5); }],
  [E.photo - 0.15, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(w[0] - 1.2, 0.6, w[1] - 0.2), T, 0, 0.3); }],
  [E.c2, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.walked - 0.1 ? Y(carX(T) - 0.3, 1.2, -11.0) : Y(w[0] - 20, 1.6, -9.5), T, 0.6, 0.5); }],
  [E.c3, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(STOPC - 0.2, 1.3, -10.0), T, 0.6, 0.5); }],
  [E.saw - 0.1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.lead - 0.1 ? Y(STOPC - 1.3, 1.5, -9.3) : Y(R.dog.position.x, 0.6, R.dog.position.z), T, 0, 0.4); }],
  [E.c4, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] - 0.5, 1.3, p[1] + 10), T, 2.2, 1.5); }],
  [E.barking - 0.1, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] + 0.4, 0.5, p[1] - 6), T, 2.2, 1.5); }],
  [E.closer2 - 0.15, (k, T) => { const p = RUN(T); fp(Y(p[0], 1.5, p[1]), Y(p[0] - 0.5, 1.3, p[1] + 10), T, 2.5, 1.6); }],
  [E.c5, (k, T) => { const c = jumpCam(T); const under = c[1] < RIVW[1] - 0.5; fp(c, under ? RV(0, 0.6, -3.0) : RV(0, 0.2, 2.5), T, T < E.jump ? 2.2 : 0, 1.4); }],
  [E.c6, (k, T) => fp(RV(0, -1.5, 0.3), RV(0.2, 1.4, -3.6), T, 0, 1.0)],
  [E.c7, (k, T) => { const x = lerp(0, 22, k); fp(RV(x, -0.22, 0.3), RV(x + 12, 0.9, 0.3), T, 0, 1.2); }],
  [E.c8, (k, T) => { const z = T < E.knock - 0.1 ? lerp(7, 1.3, prog(T, E.c8, E.knock - 0.1)) : 1.3; fp(HM(0, 1.62, z), HM(0, 1.45, -0.2), T, T < E.knock - 0.1 ? 0.8 : 0, 0.4); }],
  [E.c9, (k, T) => { const z = lerp(1.7, 1.3, ease(k)); fp(HM(0, 1.6, z), HM(0.08, 1.15, -0.7), T, 0, 0.3); }],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
const SECTION = T => { const ci = CLI(T); if (ci === 0 || (ci >= 5 && ci <= 7)) return 'riv'; if (ci >= 8) return 'home'; return 'yard'; };
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = R.brim.visible = R.idc.visible = R.jkH.visible = R.hood.visible = false; R.note.visible = false; R.photo.visible = false; R.sleeveM.color.set('#7a7a82'); const ci = CLI(T);
  const swing = (sp, a) => { const s = S(T * sp); hr.visible = hl.visible = true; hr.position.set(0.18, -0.3 + s * 0.06 * a, -0.38 + s * 0.05 * a); hr.rotation.set(0.4 + s * 0.4 * a, 0.2, -0.2); hl.position.set(-0.2, -0.3 - s * 0.06 * a, -0.4 - s * 0.05 * a); hl.rotation.set(0.4 - s * 0.4 * a, -0.2, 0.2); };
  if (ci === 1 && T < E.photo - 0.15) swing(8, 0.5);
  if (ci === 1 && T >= E.photo - 0.15) { const a = ease(prog(T, E.photo - 0.15, E.photo + 0.3)); hr.visible = hl.visible = R.photo.visible = true; R.photo.position.set(0, lerp(-0.42, -0.06, a), -0.6); hr.position.set(0.16, lerp(-0.43, -0.1, a), -0.45); hr.rotation.set(1.3, 0, -0.5); hl.position.set(-0.16, lerp(-0.43, -0.1, a), -0.45); hl.rotation.set(1.3, 0, 0.5); }
  if (ci === 2 || ci === 3) swing(9, 0.6);
  if (ci === 4 || (ci === 5 && T < E.jump)) swing(16, 1.6);
  const float = () => { hr.visible = hl.visible = true; const s = S(T * 2); hr.position.set(0.26, -0.18 + 0.03 * s, -0.42); hr.rotation.set(0.2, 0.5, -0.9 + 0.15 * s); hl.position.set(-0.26, -0.18 - 0.03 * s, -0.42); hl.rotation.set(0.2, -0.5, 0.9 - 0.15 * s); };
  if (ci === 0 || ci === 6 || (ci === 5 && T > E.jump + 0.5)) float();
  if (ci === 8) { if (T < E.knock - 0.1) swing(8, 0.5); else { hr.visible = true; const kn = [0, 0.28, 0.56].some(d => T > E.knock + d && T < E.knock + d + 0.12); hr.position.set(0.06, -0.12, kn ? -0.5 : -0.4); hr.rotation.set(1.5, 0, 0); } } }
function anim(T) { const ci = CLI(T), sec = SECTION(T); R.yardG.visible = sec === 'yard'; R.riv.visible = sec === 'riv'; R.home.visible = sec === 'home'; R.train.visible = false;
  R.truck.position.set(DITCH[0], 0, DITCH[2]); R.smoke.forEach(m => m.material.opacity = 0); R.tLamp.intensity = 0; R.slBeam.material.opacity = ci === 1 ? 0.12 : 0.05; R.dexWin.intensity = 0; R.jk.visible = false; R.guards.forEach(p => p.visible = false); R.driver.visible = false; R.cabCap.visible = false; R.gL.intensity = 0; R.mug.visible = false; R.cup.visible = false;
  R.alarm.forEach((a_, i) => { const on = ci === 1 && Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; }); R.cops.forEach((c, i) => { c.material.opacity = ci === 1 ? (Math.floor(T * 5 + i) % 2 ? 0.95 : 0.15) : 0; });
  R.tLight.intensity = 0; R.tFill.intensity = 0; R.moon.intensity = sec === 'riv' ? 2.2 : 0; R.bankL.intensity = sec === 'riv' ? 18 : 0; R.hSun.intensity = sec === 'home' ? 1.5 : 0; R.hHemi.intensity = sec === 'home' ? 0.7 : 0;
  const fogs = { yard: ['#05060e', 30, 180, '#05060a'], riv: ['#16284a', 6, 60, '#22365e'], home: ['#f4c8a0', 40, 220, '#f4c49a'] }[sec]; scene.fog.color.set(fogs[0]); scene.fog.near = fogs[1]; scene.fog.far = fogs[2]; scene.background.set(fogs[3]);
  const ph = Math.floor(T * 5) % 2; R.pbar[0].material.opacity = ph ? 1 : 0.15; R.pbar[1].material.opacity = ph ? 0.15 : 1; R.pbarL[0].intensity = ph ? 20 : 2; R.pbarL[1].intensity = ph ? 2 : 20;
  // Dex: beside you in his car (clip 2), then pinned at the roadblock
  R.car.position.set(carX(T), 0, -11.2); R.carL.intensity = 40; R.carWin.scale.y = 0.02; R.carWin.position.y = 1.05;
  const dx = R.dex, u = dx.userData; pose(dx); dx.visible = sec === 'yard' && ci >= 2; R.dexEyes.forEach(e => e.material.opacity = 0.5);
  if (!DEXOUT(T)) { sit(dx); dx.scale.setScalar(0.85); dx.rotation.set(0, -PI / 2, 0); attach(dx, R.car, -0.25, -0.12, 0.4); u.armL.rotation.set(-1.1, 0, 0); u.armR.rotation.set(-1.1, 0, 0); u.armL.userData.e.rotation.x = -0.3; u.armR.userData.e.rotation.x = -0.3; u.head.rotation.y = T < E.walked ? 1.2 : 0; }
  else { attach(dx, R.yardG, STOPC - 0.3, 0, -9.8); dx.rotation.set(0, PI, 0); dx.scale.setScalar(1); u.armL.rotation.set(-2.2, 0, 0); u.armR.rotation.set(-2.2, 0, 0); u.head.rotation.y = 0.4; }
  const c = R.gg, g_ = c.userData, g1 = R.guards[0], g2 = R.guards[1]; [c, g1, g2].forEach(p => { pose(p); p.visible = ci >= 3; });
  c.position.set(STOPC + 0.5, 0, -9.6); c.rotation.set(0, -PI / 2, 0); g_.armR.rotation.set(-1.4, 0, 0.2); g2.position.set(STOPC - 0.3, 0, -8.5); g2.rotation.set(0, PI, 0);
  g1.position.set(STOPC - 1.3, 0, -9.3); g1.rotation.set(0, PI / 2, 0); g1.userData.armR.rotation.set(-1.5, 0, 0);
  const seen = ci > 3 || (ci === 3 && T > E.saw - 0.1); if (seen) { g1.rotation.y = Math.atan2(WALK(T)[0] - g1.position.x, WALK(T)[1] - g1.position.z); g1.userData.armR.rotation.set(-1.6, 0, 0); }
  if (ci === 3 && T > E.lead - 0.3) g1.userData.up.rotation.x = 0.5 * (1 - prog(T, E.lead, E.lead + 0.4));
  R.ggL.position.set(g1.position.x + 0.3, 1.4, g1.position.z); if (seen) { const w = WALK(T); R.ggLT.position.set(w[0], 1.5, w[1]); } else R.ggLT.position.set(STOPC - 0.3, 1.4, -9.8); R.ggL.intensity = sec === 'yard' && ci >= 3 ? 16 : 0;
  // the dog: at the cop's side, released, chasing you through the trees
  const d = R.dog; d.visible = sec === 'yard' && ci >= 3; dogStill(d, T, false); d.position.set(STOPC - 0.9, 0, -8.8); d.rotation.y = PI / 2;
  if (ci === 3 && T > E.lead) { const k = prog(T, E.lead, E.c4); const w = WALK(T); d.position.set(lerp(STOPC - 0.9, w[0] - 3, k), 0, lerp(-8.8, w[1] - 0.6, k)); d.rotation.y = Math.atan2(w[0] - d.position.x, w[1] - d.position.z); dogRun(d, T); }
  if (ci === 4) { const p = RUN(T), k = prog(T, E.c4, E.c5); d.position.set(p[0] + 0.4, 0, p[1] - lerp(8, 2.6, k)); d.rotation.y = 0; dogRun(d, T); }
  // river: dog sniffing the bank, cop's torch on the water; then the dog gives up
  const rd = R.rdog; rd.visible = ci === 0 || ci === 6; R.rcop.visible = rd.visible; R.torch.intensity = rd.visible ? 30 : 0;
  rd.position.set(0.3, 0, -3.5); rd.rotation.y = 0; dogStill(rd, T, true); pose(R.rcop); R.rcop.position.set(-1.6, 0, -5.4); R.rcop.rotation.y = 0.3; R.rcop.userData.armR.rotation.set(-1.3, 0, 0);
  R.torch.position.set(-1.4, 1.5, -5.0); R.torchT.position.set(0.3 + 1.5 * S(T * 1.3), -0.5, 0.5);
  if (ci === 6) { const arrive = prog(T, E.c6, E.c6 + 0.8); if (arrive < 1) { rd.position.z = lerp(-9, -3.5, arrive); dogRun(rd, T); } if (T > E.scent) { const a = prog(T, E.scent, E.c7); rd.rotation.y = PI * Math.min(1, a * 3); rd.position.z = -3.5 - 3 * Math.max(0, a - 0.3); dogStill(rd, T, false); if (a > 0.3) dogRun(rd, T, 0.6); } }
  // home: door opens, wife, then the girl peeks out
  R.hall.intensity = sec === 'home' ? 8 : 0; R.hdoor.rotation.y = ci === 9 ? 1.6 * ease(prog(T, E.c9, E.opens + 0.5)) : 0;
  const wf = R.wife, wu = wf.userData, gl = R.girl, gu = gl.userData; pose(wf); pose(gl); wf.visible = gl.visible = ci === 9; wf.position.set(0.05, 0, -0.55); wf.rotation.y = 0;
  if (ci === 9) { const h = ease(prog(T, E.opens + 0.3, E.opens + 0.8)) * (1 - ease(prog(T, E.girl, E.girl + 0.6))); wu.armR.rotation.set(-0.7 * h, 0, 0.35 * h); wu.armR.userData.e.rotation.x = -2.4 * h; wu.armL.rotation.set(-0.7 * h, 0, -0.35 * h); wu.armL.userData.e.rotation.x = -2.4 * h; wu.head.rotation.x = -0.05;
    const reach = ease(prog(T, E.girl + 0.4, E.girl + 1.4)); if (reach > 0) { wu.armR.rotation.set(-1.2 * reach, 0, 0); wu.armL.rotation.set(-1.2 * reach, 0, 0); wf.position.z = -0.55 + 0.25 * reach; } wu.mouth.scale.y = T > E.girl ? 0.5 : 2.2 * h + 1;
    const pk = ease(prog(T, E.behind, E.behind + 0.6)); gl.position.set(lerp(0.0, 0.42, pk), 0, -0.95); gl.rotation.y = -0.3 * pk; gu.up.rotation.z = 0.25 * pk; gu.armL.rotation.set(-0.4, 0, 0); gu.head.rotation.z = 0.2 * pk; }
  vmPose(T); }
