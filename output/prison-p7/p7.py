exec(open('p6.py').read().replace("open('scenes.js', 'w').write(s)\nprint('ok')", ""))
def rep(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)
def region(a, b, new):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]
region("const E = { recap:", "E.loop = TM.total - 0.4;", """const E = { c1: CL[1].start, drove: AT(2, 'drove'), c2: CL[2].start, rb: AT(2, 'roadblock'), c3: CL[3].start, nobody: AT(3, 'nobody'), c4: CL[4].start, past: AT(4, 'past'), c5: CL[5].start, sunrise: AT(5, 'sunrise'), c6: CL[6].start, note: AT(6, 'note'), welcome: AT(6, "you're"),
  c7: CL[7].start, seven: AT(7, 'seven'), one: AT(7, 'one'), every: AT(7, 'and'), comment: AT(7, 'comment'), gotin: 999, coffee: 999, says: 999, brother: 999, smiles: 999, waves: 999, photo: 999, atYou: 999, atDex: 999, train: 999, dexR: 999,
  recap: CL[1].start, id: 999, lifted: 999, swap: 999, ditch: 999, sirens: 999, window: 999, dex: 999, optA: 999, optB: 999,
  threw: 999, lightF: 999, climbed: 999, found: 999, engine: 999, guard: 999, think: 999, leaves: 999, cap: 999, driver: 999, wants: 999, steps: 999, torch: 999, c4_: 0 };
""")
region("function truckAt", "// ---------- overlay ----------", r"""const RB = -205, STOPC = -202, TRN = [-600, 0, 800];
function attach(o, p, x, y, z) { if (o.parent !== p) p.add(o); o.position.set(x, y, z); }
function build5() { const g = R.yardG;
  // Dex changed too: hoodie instead of the orange top
  R.dex.traverse(m => { if (m.material && m.material.color && m.material.color.getHexString() === SM('#d8581a').color.getHexString()) { m.material = m.material.clone(); m.material.color.set('#2e3a2e'); } if (m.isSprite && m !== R.dexEyes[0] && m !== R.dexEyes[1]) m.visible = false; });
  // car interior: dash, windscreen, wheel
  const car = R.car; add(car, Bx(0.45, 0.32, 1.62), SM('#1c1c22'), -0.95, 1.0, 0); add(car, Bx(0.04, 0.5, 1.6), new T3.MeshStandardMaterial({ color: '#203040', transparent: true, opacity: 0.18, roughness: 0.05 }), -1.15, 1.3, 0, false).rotation.z = -0.5;
  R.wheel = add(car, new T3.TorusGeometry(0.17, 0.02, 6, 16), SM('#111'), -0.72, 1.15, 0.4); R.wheel.rotation.y = PI / 2; R.wheel.rotation.x = 0.4;
  R.cup = new T3.Group(); car.add(R.cup); add(R.cup, Cy(0.04, 0.032, 0.12, 10), SM('#f2efe6'), 0, 0, 0); add(R.cup, Cy(0.043, 0.043, 0.035, 10), SM('#8a5a32'), 0, 0.01, 0);
  // the roadblock: police car, cones, flashing bar
  const pc = R.pcar = new T3.Group(); pc.position.set(RB - 4, 0, -15.2); pc.rotation.y = 0.5; g.add(pc); const wht = SM('#e8e8ea', { roughness: 0.4 }), blk = SM('#14161c', { roughness: 0.4 });
  add(pc, Bx(4.3, 0.7, 1.8), wht, 0, 0.6, 0); add(pc, Bx(4.32, 0.25, 1.82), SM('#1a3aa8'), 0, 0.55, 0); add(pc, Bx(2.3, 0.6, 1.66), blk, 0.25, 1.25, 0); add(pc, Bx(0.9, 0.12, 1.2), blk, 0.25, 1.62, 0);
  for (const [x, z] of [[-1.35, 0.85], [1.35, 0.85], [-1.35, -0.85], [1.35, -0.85]]) add(pc, Cy(0.36, 0.36, 0.25, 12), SM('#111'), x, 0.36, z).rotation.x = PI / 2;
  R.pbar = [glow(pc, '#ff2020', 1.6, 0.25, 1.75, 0.4, 1), glow(pc, '#2050ff', 1.6, 0.25, 1.75, -0.4, 1)]; R.pbarL = [new T3.PointLight('#ff2020', 0, 18, 1.2), new T3.PointLight('#2050ff', 0, 18, 1.2)]; R.pbarL.forEach((l, i) => { l.position.set(0.25, 2.2, i ? -0.4 : 0.4); pc.add(l); });
  const cone = SM('#ff6a10', { roughness: 0.6 }); for (const z of [-14.6, -13.4, -9.8]) { add(g, new T3.ConeGeometry(0.18, 0.55, 8), cone, RB, 0.28, z); add(g, Bx(0.4, 0.04, 0.4), cone, RB, 0.02, z); }
  add(g, Bx(0.12, 0.9, 0.12), SM('#c8c8c8'), RB - 0.5, 0.45, -8.9); R.sign = add(g, Bx(1.4, 0.5, 0.05), new T3.MeshBasicMaterial({ map: ctex(140, 50, c => { c.fillStyle = '#f0d020'; c.fillRect(0, 0, 140, 50); c.fillStyle = '#111'; c.font = '22px Russo'; c.textAlign = 'center'; c.fillText('POLICE CHECK', 70, 33); }) }), RB - 0.5, 1.15, -8.9, false); R.sign.rotation.y = PI / 2;
  const fl = new T3.PointLight('#fff0d0', 14, 14, 1.2); fl.position.set(RB - 1, 4, -9.5); g.add(fl);
  // the mugshot the cop is holding
  R.mug = new T3.Sprite(new T3.SpriteMaterial({ map: ctex(120, 156, c => { c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, 120, 156); c.fillStyle = '#c81e1e'; c.fillRect(0, 0, 120, 26); c.fillStyle = '#fff'; c.font = '17px Russo'; c.textAlign = 'center'; c.fillText('ESCAPED', 60, 19); c.fillStyle = '#9aa0aa'; c.fillRect(10, 32, 100, 92); c.fillStyle = '#e0601c'; c.beginPath(); c.ellipse(60, 128, 42, 26, 0, PI, 0); c.fill(); c.fillStyle = '#d8b088'; c.fillRect(42, 52, 36, 46); c.fillStyle = '#222'; c.fillRect(48, 68, 6, 6); c.fillRect(66, 68, 6, 6); c.fillRect(52, 86, 16, 3); c.fillStyle = '#111'; c.font = '15px Russo'; c.fillText('INMATE 2291', 60, 148); }) }));
  R.mug.scale.set(0.24, 0.31, 1); g.add(R.mug);
  R.note = add(R.vm, new T3.PlaneGeometry(0.28, 0.196), new T3.MeshBasicMaterial({ map: ctex(200, 140, c => { c.fillStyle = '#f4efe0'; c.fillRect(0, 0, 200, 140); c.strokeStyle = '#c8c0a8'; for (let y = 30; y < 140; y += 22) { c.beginPath(); c.moveTo(8, y); c.lineTo(192, y); c.stroke(); } c.fillStyle = '#1a2a6a'; c.font = 'italic 24px Russo'; c.textAlign = 'center'; c.fillText("You're welcome.", 100, 72); c.font = 'italic 26px Russo'; c.fillText('- D', 150, 115); }), toneMapped: false }), 0, -0.16, -0.42, false);
  // ---- the sunrise train ----
  const tr = R.train = new T3.Group(); tr.position.set(...TRN); scene.add(tr); const wall = SM('#d8d2c4', { roughness: 0.8 }), seatM = SM('#2a4a8a', { roughness: 0.9 }), fr = SM('#5a5e66', { metalness: 0.5, roughness: 0.4 });
  add(tr, Bx(12, 0.1, 3), SM('#4a4a50'), 0, 0, 0); add(tr, Bx(12, 0.1, 3), wall, 0, 2.5, 0); add(tr, Bx(12, 2.5, 0.1), wall, 0, 1.25, -1.5); add(tr, Bx(12, 0.85, 0.1), wall, 0, 0.42, 1.5); add(tr, Bx(12, 0.5, 0.1), wall, 0, 2.25, 1.5);
  for (let x = -6; x <= 6; x += 1.8) add(tr, Bx(0.18, 1.2, 0.12), fr, x, 1.45, 1.5); add(tr, Bx(12, 0.06, 0.18), fr, 0, 0.86, 1.48);
  for (const x of [-1.6, 1.6, -4.8, 4.8]) { const sx = x > 0 ? 1 : -1; add(tr, Bx(0.5, 0.45, 1.2), seatM, x, 0.45, 0.6); add(tr, Bx(0.15, 0.85, 1.2), seatM, x + sx * 0.25, 1.0, 0.6); }
  add(tr, Bx(0.8, 0.05, 0.6), SM('#8a8e94'), 0, 0.75, 1.15); add(tr, Cy(0.04, 0.04, 0.75, 8), SM('#8a8e94'), 0, 0.37, 1.15);
  R.tLight = new T3.DirectionalLight('#ffb070', 0); R.tLight.position.set(TRN[0] + 2, 6, TRN[2] + 10); R.tLight.target.position.set(TRN[0], 0, TRN[2]); scene.add(R.tLight); scene.add(R.tLight.target); R.tFill = new T3.PointLight('#ffe8d0', 0, 10, 1.2); R.tFill.position.set(0, 2.2, 0); tr.add(R.tFill);
  const skyT = ctex(16, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a7a'); gr.addColorStop(0.42, '#d87a6a'); gr.addColorStop(0.52, '#ffc070'); gr.addColorStop(1, '#ffd8a0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  R.tSky = add(tr, Sp(260, 24, 16), new T3.MeshBasicMaterial({ map: skyT, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); R.tSun = glow(tr, '#fff0b0', 40, -30, 6, 160, 1); R.tSun.material.fog = false;
  add(tr, Bx(600, 0.1, 400), SM('#5a6a3a', { roughness: 1 }), 0, -0.6, 200, false);
  R.land = []; const r = rng(91); for (let i = 0; i < 40; i++) { const z = 5 + r() * 60, h = 2 + r() * 3; const o = new T3.Group(); tr.add(o); add(o, new T3.ConeGeometry(1 + r(), h, 7), SM(r() < 0.5 ? '#2a4a2a' : '#3a5a30'), 0, h / 2 - 0.5, 0); o.userData = { x0: r() * 200, z }; R.land.push(o); }
  for (let i = 0; i < 8; i++) { const o = new T3.Group(); tr.add(o); add(o, Cy(0.06, 0.06, 5, 6), SM('#3a2a1e'), 0, 2, 0); o.userData = { x0: i * 25, z: 3.5 }; R.land.push(o); }
  R.tCity = new T3.Group(); tr.add(R.tCity); for (let i = 0; i < 14; i++) { const h = 6 + r() * 20, w = 4 + r() * 5; add(R.tCity, Bx(w, h, w), new T3.MeshBasicMaterial({ color: '#4a3a5a', fog: false }), -20 + i * 4 + r() * 2, h / 2 - 0.5, 0, false); }
  tr.visible = false; }
const WALK = T => { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci === 1) return [lerp(-161, -163.5, prog(T, E.c1, E.c2)), -8.4]; if (ci === 2) return [lerp(-163.5, -165, prog(T, E.c2, E.c3)), -8.4];
  if (ci === 0 || loop) return [lerp(-192, -194, loop ? 0 : prog(T, 0, E.c1)), -5.6]; if (ci === 3) return [lerp(-194, -196.5, prog(T, E.c3, E.c4)), -5.6]; return [lerp(-196.5, -214, prog(T, E.c4, E.c5)), lerp(-5.6, -5.0, prog(T, E.c4, E.c5))]; };
const carX = T => { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci === 1) return T < E.c2 - 0.5 ? WALK(T)[0] + 0.25 : lerp(WALK(T)[0] + 0.25, WALK(T)[0] - 3, ease(prog(T, E.c2 - 0.5, E.c2))); if (ci === 2) return lerp(-166.5, STOPC, ease(prog(T, E.c2, E.rb + 0.3))); return STOPC; };
const DEXOUT = T => { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); return ci === 0 || loop || ci === 3 || ci === 4; };
const SH = [
  [0, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(STOPC - 0.2, 1.3, -10.2), T, 0.6, 0.6); }],
  [E.c1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.c1 + 1.0 ? Y(carX(T) - 0.3, 1.2, -11.0) : Y(w[0] - 20, 1.6, -9.5), T, 1, 0.6); }],
  [E.c2, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(carX(T) - 3, 1.0, -11.5), T, 0.6, 0.6); }],
  [E.c3, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.nobody - 0.1 ? Y(STOPC - 0.2, 1.3, -10.2) : L3(Y(STOPC - 0.2, 1.3, -10.2), Y(w[0] - 20, 1.5, -4.5), ease(prog(T, E.nobody - 0.1, E.nobody + 0.5))), T, 0.6, 0.6); }],
  [E.c4, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.past + 0.2 ? Y(w[0] - 20, 1.5, -4.5) : L3(Y(w[0] - 15, 1.3, -10), Y(w[0] - 40, 4, -7), ease(prog(T, E.past + 0.2, E.c5))), T, 1, 0.6); }],
  [E.c5, (k, T) => fp([TRN[0] - 0.3 + 0.2 * k, 1.3, TRN[2] - 0.2], [TRN[0] + 0.4, 1.3, TRN[2] + 3], T, 0, 0.3)],
  [E.c6, (k, T) => fp([TRN[0] - 0.3, 1.3, TRN[2] - 0.2], [TRN[0] - 0.25, 0.75, TRN[2] + 0.35], T, 0, 0.2)],
  [E.c7, (k, T) => fp([TRN[0] - 0.3, 1.3, TRN[2] - 0.2], [TRN[0] + 0.8 + 0.3 * k, 1.4, TRN[2] + 3], T, 0, 0.3)],
  [E.loop, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(STOPC - 0.2, 1.3, -10.2), T, 0.6, 0.6); }],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = R.brim.visible = R.idc.visible = R.jkH.visible = R.hood.visible = false; R.sleeveM.color.set('#7a7a82'); const loop = T >= E.loop, ci = loop ? 0 : CLI(T); R.note.visible = false;
  if (ci <= 4 || loop) { const s = S(T * 9); hr.visible = hl.visible = true; hr.position.set(0.18, -0.3 + s * 0.04, -0.38); hr.rotation.set(0.4 + s * 0.2, 0.2, -0.2); hl.position.set(-0.2, -0.3 - s * 0.05, -0.4); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); }
  if (ci === 6) { const a = ease(prog(T, E.c6, E.note)); hr.visible = hl.visible = true; R.note.visible = T > E.c6 + 0.2; R.note.position.set(0, lerp(-0.45, -0.04, a), -0.62); hr.position.set(0.17, lerp(-0.43, -0.07, a), -0.42); hr.rotation.set(1.3, 0, -0.5); hl.position.set(-0.17, lerp(-0.43, -0.07, a), -0.42); hl.rotation.set(1.3, 0, 0.5); } }
function anim(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); R.truck.position.set(DITCH[0], 0, DITCH[2]); R.truck.rotation.y = -PI / 2 + 0.4; R.smoke.forEach(m => m.material.opacity = 0); R.tLamp.intensity = 0; R.bar.rotation.x = 1.35;
  R.slBeam.material.opacity = 0.05; R.sl.intensity = 30; R.gate.rotation.y = -1.5; R.dexWin.intensity = 0; R.jk.visible = false; R.guards.forEach(p => p.visible = false); R.driver.visible = false; R.cabCap.visible = false; R.gL.intensity = 0; R.cops.forEach(c => c.material.opacity = 0); R.mug.visible = false; R.cup.visible = false;
  R.alarm.forEach(a_ => { a_.l.intensity = 0; });
  const train = !loop && ci >= 5; R.train.visible = train; R.tLight.intensity = train ? 2.6 : 0; R.tFill.intensity = train ? 6 : 0; scene.fog.color.set(train ? '#e8a080' : '#05060e'); scene.fog.near = train ? 40 : 30; scene.fog.far = train ? 260 : 180; scene.background.set(train ? '#f0a878' : '#05060a');
  if (train) { const sp = 22; R.land.forEach(o => { const u = o.userData; o.position.set(((u.x0 - T * sp) % 200 + 200) % 200 - 100, 0, u.z); }); const k = prog(T, E.c5, TM.total); R.tCity.position.set(-60 - 40 * k, 0, 120 + 80 * k); R.tCity.scale.setScalar(1 - 0.4 * k); }
  const ph = Math.floor(T * 5) % 2; R.pbar[0].material.opacity = ph ? 1 : 0.15; R.pbar[1].material.opacity = ph ? 0.15 : 1; R.pbarL[0].intensity = ph ? 20 : 2; R.pbarL[1].intensity = ph ? 2 : 20;
  // Dex's car: alongside you, drives off, stops at the roadblock
  const cx = carX(T); R.car.visible = !train; R.car.position.set(cx, 0, -11.2); R.carL.intensity = !train ? 40 : 0; R.carWin.scale.y = 0.02; R.carWin.position.y = 1.05; R.wheel.rotation.z = 0;
  const dx = R.dex, u = dx.userData; dx.visible = !train; pose(dx); dx.scale.setScalar(0.85); R.dexEyes.forEach(e => e.material.opacity = 0.5);
  if (!DEXOUT(T)) { sit(dx); dx.rotation.set(0, -PI / 2, 0); attach(dx, R.car, -0.25, -0.12, 0.4); u.armL.rotation.set(-1.1, 0, 0); u.armR.rotation.set(-1.1, 0, 0); u.armL.userData.e.rotation.x = -0.3; u.armR.userData.e.rotation.x = -0.3; u.head.rotation.y = ci === 1 && T < E.c2 - 0.5 ? 1.2 : 0; }
  else { const pull = ci === 0 && !loop ? ease(prog(T, 0.2, 1.4)) : 1; attach(dx, R.yardG, STOPC - 0.3, 0, lerp(-10.5, -9.8, pull)); dx.rotation.set(0, PI, 0); dx.scale.setScalar(1.0); if (pull >= 1) { u.armL.rotation.set(-2.2, 0, 0); u.armR.rotation.set(-2.2, 0, 0); } else { u.armR.rotation.set(-0.6, 0, 0.4); } u.head.rotation.y = ci === 3 && T > E.nobody - 0.1 ? 0 : 0.5; }
  // cops: one holds Dex, one with a torch, one by the cars; before that they wave traffic down
  const c = R.gg; pose(c); c.visible = !train; const g_ = c.userData; const g1 = R.guards[0], g2 = R.guards[1]; [g1, g2].forEach(p => { pose(p); p.visible = !train; });
  if (DEXOUT(T)) { c.position.set(STOPC + 0.5, 0, -9.6); c.rotation.set(0, -PI / 2, 0); g_.armR.rotation.set(-1.4, 0, 0.2); g_.armL.rotation.set(-1.0, 0, -0.2); g1.position.set(STOPC - 1.3, 0, -9.4); g1.rotation.set(0, PI / 2, 0); g1.userData.armR.rotation.set(-1.5, 0, 0); g2.position.set(STOPC - 0.3, 0, -8.5); g2.rotation.set(0, PI, 0); g2.userData.armL.rotation.set(-0.3, 0, -0.4); }
  else { c.position.set(RB + 1, 0, -11.2); c.rotation.set(0, PI / 2, 0); g_.armR.rotation.set(-2.6, 0, 0); g1.position.set(RB - 1, 0, -13.5); g1.rotation.set(0, PI / 2, 0); g2.position.set(RB - 1.5, 0, -9.5); g2.rotation.set(0, PI / 2, 0); }
  R.ggL.intensity = 0; if (!train) { R.ggL.position.set(g1.position.x + 0.3, 1.4, g1.position.z); R.ggLT.position.set(STOPC - 0.3, 1.4, -9.8); R.ggL.intensity = DEXOUT(T) ? 14 : 0; }
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
""")
region("function hud(T) {", "function likePill", r"""function hud(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const train = !loop && ci >= 5; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 270, 64, 32); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . FINALE', 159, 69, 26, '#ffd27a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt(train ? '6.12 AM' : '2.41 AM', 596, 69, 32, train ? '#ffd27a' : '#ff3a2a'); octx.restore();
  const lbl = train ? 'FREE' : ci === 4 ? 'SLIPPING PAST' : ci === 1 ? 'DEX BESIDE YOU' : ci === 2 ? 'ROADBLOCK AHEAD' : 'DEX STOPPED'; const red = !train && ci !== 4;
  octx.save(); octx.fillStyle = red ? 'rgba(120,0,0,0.9)' : 'rgba(10,80,30,0.9)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt(lbl, 583, 156, 22, Math.floor(T * 4) % 2 ? '#fff' : (red ? '#ff8a7a' : '#9af0b0')); octx.restore();
  const items = [['GATE', 1], ['CLOTHES', 1], ['DITCH TRUCK', 1], ['ROADBLOCK', !loop && (ci > 4 || (ci === 4 && T > E.past)) ? 1 : 0], ['FREEDOM', train && T > E.sunrise ? 1 : 0]];
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 116, 230, 260, 18); octx.fill();
  items.forEach(([s_, d], i) => { txt(d > 0 ? '✓' : '□', 50, 151 + i * 46, 26, d > 0 ? '#5ad88a' : '#9a9aa8'); txt(s_, 78, 152 + i * 46, 24, d > 0 ? '#fff' : '#9a9aa8', 'left'); }); octx.restore(); }
""")
rep("const SEQ = [[['sixty', 'seconds'], '60 seconds'], [['one', 'kilometre'], '1 km']];", "const SEQ = [[['ten', 'minutes'], '10 minutes']];")
rep("build4();", "build4(); build5();")
rep("!loop && ![2, 7, 9, 10].includes(si)", "!loop && ![9].includes(si)")
region("  if (ci >= 5 && !loop && T > E.sirens - 0.2)", "  const cap = CAPS.find", r"""  if (!loop && ci < 5 && (ci === 0 || ci >= 2)) { octx.fillStyle = Math.floor(T * 5) % 2 ? 'rgba(160,0,0,0.06)' : 'rgba(0,40,170,0.06)'; octx.fillRect(0, 0, W, H); }
  if (ci === 5 && !loop) { const a = 1 - prog(T, E.c5, E.c5 + 0.6); octx.fillStyle = `rgba(255,236,200,${a})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) big("DON'T LOOK", 480, 66, '#ff4a4a', 1);
  if (ci === 1) big('10 MINUTES AGO', 480, 54, '#ffd27a', prog(T, E.c1, E.c1 + 0.2));
  if (ci === 2 && T > E.rb - 0.1) big('ROADBLOCK', 480, 64, '#ff4a4a', prog(T, E.rb - 0.1, E.rb + 0.1));
  if (ci === 3 && T > E.nobody - 0.1) big("NOBODY'S WATCHING YOU", 480, 42, '#5ad88a', prog(T, E.nobody - 0.1, E.nobody + 0.1));
  if (ci === 4 && T > E.past - 0.1) big('PAST THE ROADBLOCK', 480, 46, '#5ad88a', prog(T, E.past - 0.1, E.past + 0.1));
  if (ci === 5 && T > E.sunrise) big('FREE', 470, 110, '#ffd27a', prog(T, E.sunrise, E.sunrise + 0.15));
  if (ci === 7 && !loop) { if (T < E.comment - 0.1) { big('7 PARTS', 430, 58, '#ffd27a', prog(T, E.seven, E.seven + 0.15)); if (T > E.one) big('1 ESCAPE', 500, 58, '#ff9a5a', prog(T, E.one, E.one + 0.15)); if (T > E.every) big('YOU MADE EVERY CHOICE', 570, 36, '#fff', prog(T, E.every, E.every + 0.15)); }
    else { big('THE END', 440, 70, '#ffd27a', 1); big('COMMENT WHAT WE', 520, 40, '#fff', prog(T, E.comment - 0.1, E.comment + 0.1)); big('ESCAPE NEXT', 570, 40, '#fff', prog(T, E.comment - 0.1, E.comment + 0.1)); } }
""")
open('scenes.js', 'w').write(s)
print('ok')
