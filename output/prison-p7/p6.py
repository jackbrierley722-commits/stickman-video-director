import re
exec(open('p5.py').read().replace("open('scenes.js', 'w').write(s)\nprint('ok')", ""))
def rep(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)
def region(a, b, new):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]
# timing for part 6
region("const E = { think:", "E.loop = TM.total - 0.4;", """const E = { recap: CL[1].start, id: AT(1, 'handed'), c2: CL[2].start, photo: AT(2, 'photo'), atYou: AT(2, 'then'), lifted: AT(2, 'then', 1), c3: CL[3].start, swap: AT(3, 'swap'), c4: CL[4].start, ditch: AT(4, 'you'), c5: CL[5].start, sirens: AT(5, 'sirens'),
  c6: CL[6].start, window: AT(6, 'the'), c7: CL[7].start, dex: AT(7, 'dex'), optA: CL[8].start, optB: AT(8, 'option', 1), comment: AT(8, 'comment'),
  threw: 999, lightF: 999, climbed: 999, found: 999, engine: 999, guard: 999, think: 999, leaves: 999, cap: 999, driver: 999, wants: 999, steps: 999, torch: 999, c4_: 0 };
""")
# new set pieces (road, city, car) + all part 6 shots and animation
region("const tx = T =>", "// ---------- overlay ----------", r"""const DITCH = [-150, 0, -17.6];
function build4() { const g = R.yardG; const asph = SM('#2a2a2e', { roughness: 0.9 }), line = SM('#d8d4c0'), grass = SM('#26341f', { roughness: 1 });
  add(g, Bx(260, 0.1, 90), grass, -150, -0.07, -10); add(g, Bx(240, 0.06, 6.5), asph, -150, -0.02, -12, false); for (let x = -30; x > -270; x -= 5) add(g, Bx(2.4, 0.07, 0.14), line, x, 0.0, -12, false);
  const trunk = SM('#3a2a1e'), leaf = SM('#1e3a22'), leaf2 = SM('#244a28'); const r = rng(61); for (let i = 0; i < 70; i++) { const x = -40 - r() * 200, side = r() < 0.5 ? -1 : 1, z = side < 0 ? -16 - r() * 9 : -7.5 + r() * 6; if (Math.abs(x - DITCH[0]) < 3 && side < 0) continue; const h = 2 + r() * 2.5; add(g, Cy(0.15, 0.2, h * 0.4, 6), trunk, x, h * 0.2, z); add(g, new T3.ConeGeometry(1.1 + r() * 0.6, h, 7), r() < 0.5 ? leaf : leaf2, x, h * 0.4 + h / 2, z); }
  for (const dx of [-3, -1.5, 1.5, 3, 0, -2.2, 2.2]) { const h = 3 + r(); add(g, Cy(0.15, 0.2, 1.2, 6), trunk, DITCH[0] + dx, 0.6, DITCH[2] - 2.2 - r() * 1.5); add(g, new T3.ConeGeometry(1.4, h, 7), leaf, DITCH[0] + dx, 1.2 + h / 2, DITCH[2] - 2.2 - r() * 1.5); }
  for (let x = -45; x > -240; x -= 28) { add(g, Cy(0.08, 0.1, 5.5, 8), SM('#3a3e44'), x, 2.75, -8.3); add(g, Bx(0.8, 0.15, 0.4), new T3.MeshBasicMaterial({ color: '#ffe0a8', toneMapped: false }), x, 5.5, -8.8, false); const pl = new T3.PointLight('#ffd8a0', 18, 18, 1.4); pl.position.set(YX + x, 5.2, -9); scene.add(pl); }
  // city skyline glowing ahead
  R.city = []; for (let i = 0; i < 40; i++) { const x = -420 - r() * 40, z = -12 + (r() - 0.5) * 150, w = 8 + r() * 10, h = 14 + r() * 50; const t = ctex(64, 128, (c) => { c.fillStyle = '#14161e'; c.fillRect(0, 0, 64, 128); for (let y = 4; y < 128; y += 8) for (let xx = 4; xx < 64; xx += 8) if (Math.random() < 0.45) { c.fillStyle = Math.random() < 0.5 ? '#ffd890' : '#cfe0ff'; c.fillRect(xx, y, 4, 4); } }); add(g, Bx(w, h, w), new T3.MeshBasicMaterial({ map: t, fog: false }), x, h / 2, z, false); }
  for (let i = 0; i < 6; i++) { const s_ = glow(g, '#ffb070', 70, -440, 6, -60 + i * 24, 0.25); s_.material.fog = false; }
  // police lights far behind (near the prison)
  R.cops = [glow(g, '#ff2020', 8, -45, 1.5, -11, 0), glow(g, '#2050ff', 8, -46, 1.5, -12.5, 0)]; R.cops.forEach(c => c.material.fog = false);
  // the car Dex drives
  const car = R.car = new T3.Group(); g.add(car); const paint = SM('#a8323a', { metalness: 0.15, roughness: 0.45 }), glass = new T3.MeshStandardMaterial({ color: '#141820', roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.35 });
  add(car, Bx(4.3, 0.7, 1.8), paint, 0, 0.6, 0); add(car, Bx(2.3, 0.08, 1.66), paint, 0.25, 1.56, 0); for (const px of [-0.85, 0.25, 1.35]) for (const pz of [-0.8, 0.8]) add(car, Bx(0.08, 0.5, 0.08), paint, px, 1.27, pz); R.carSeat = add(car, Bx(0.15, 0.55, 1.4), SM('#2a2a30'), 0.6, 1.2, 0);
  for (const [x, z] of [[-1.35, 0.85], [1.35, 0.85], [-1.35, -0.85], [1.35, -0.85]]) add(car, Cy(0.36, 0.36, 0.25, 12), SM('#111'), x, 0.36, z).rotation.x = PI / 2;
  R.carWin = add(car, Bx(0.95, 0.46, 0.04), glass, -0.25, 1.27, 0.86, false); R.carHL = [glow(car, '#fff4d0', 2.4, -2.2, 0.7, 0.6, 1), glow(car, '#fff4d0', 2.4, -2.2, 0.7, -0.6, 1)]; glow(car, '#ff2020', 0.8, 2.2, 0.75, 0.6, 0.9); glow(car, '#ff2020', 0.8, 2.2, 0.75, -0.6, 0.9);
  R.carL = new T3.SpotLight('#fff0d0', 0, 40, 0.5, 0.5, 1.2); R.carL.position.set(-2.2, 0.8, 0); car.add(R.carL); R.carLT = new T3.Object3D(); R.carLT.position.set(-20, 0, 0); car.add(R.carLT); R.carL.target = R.carLT;
  R.inCar = new T3.PointLight('#ffd8a8', 6, 5, 1.2); R.inCar.position.set(-0.2, 1.4, 0); car.add(R.inCar);
  R.tLamp = new T3.PointLight('#ffe2b0', 0, 6, 1.2); R.tLamp.position.set(0, 2.6, -0.8); R.truck.add(R.tLamp); R.hood = add(R.handR.userData.h, Bx(0.2, 0.14, 0.12), SM('#7a7a82', { roughness: 0.9 }), 0, 0.03, -0.1, false); }
function truckAt(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci === 0 || loop) return [lerp(STOPX - 6, STOPX - 50, loop ? 0 : ease(prog(T, 0, CL[1].start))), -12, -PI / 2]; if (ci <= 2) return [STOPX, -12, -PI / 2]; if (ci === 3) return [-90, -10.4, -PI / 2]; return [DITCH[0], DITCH[2], -PI / 2 + 0.4]; }
const WALK = T => { const ci = CLI(T); if (ci === 4) return [lerp(DITCH[0] - 0.5, DITCH[0] - 2.5, prog(T, E.c4, E.c5)), lerp(-15.5, -10.2, prog(T, E.c4, E.c5))]; if (ci === 5) return [lerp(DITCH[0] - 2.5, DITCH[0] - 9.5, prog(T, E.c5, E.c6)), -9.6]; return [DITCH[0] - 9.5 - (ci === 6 ? 1.5 * prog(T, E.c6, E.window) : 1.5), ci === 6 ? lerp(-9.6, -8.4, prog(T, E.c6, E.window)) : -8.4]; };
const carX = T => { const ci = CLI(T); const stop = DITCH[0] - 11.2; if (ci < 6) return 60; if (ci === 6) return lerp(stop + 45, stop, ease(prog(T, E.c6 - 0.2, E.window))); return stop; };
const SH = [
  [0, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(0.45, 1.5, 9)), T, 0, 0.4)],
  [E.recap, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(4, 1.6, 2.5)), T, 0, 0.3)],
  [E.lifted - 0.1, (k, T) => fp(Y(...TW(0.5, 1.85, 2.15)), Y(BARX, 1.8, -12.2), T, 0, 0.3)],
  [E.c3, (k, T) => fp(Y(...TW(0.55, 2.2, -2.5)), L3(Y(...TW(-0.3, 0.9, 0.9)), Y(...TW(0.0, 0.8, 0.2)), ease(k)), T, 0, 0.4)],
  [E.c4, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(DITCH[0] + 0.5, 1.2, DITCH[2]), T, 1, 0.6); }],
  [E.c5, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), T < E.sirens - 0.1 ? Y(w[0] - 30, 3, -12) : L3(Y(w[0] - 30, 3, -12), Y(w[0] + 30, 1.6, -11.5), ease(prog(T, E.sirens - 0.1, E.sirens + 0.5))), T, T < E.sirens ? 1 : 0, 0.6); }],
  [E.c6, (k, T) => { const w = WALK(T); const cx = carX(T); fp(Y(w[0], 1.62, w[1]), Y(cx + 1, 1.0, -11.2), T, 0, 0.5); }],
  [E.c7, (k, T) => { const w = WALK(T); fp(Y(w[0] + 0.3, 1.5, w[1] - 0.3), Y(carX(T) - 0.3, 1.15, -11.0), T, 0, 0.3); }],
  [E.optA, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(carX(T) - 0.25, 1.2, -11.2), T, 0, 0.4); }],
  [E.optB - 0.1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(w[0] - 40, 4, -11), T, 0, 0.4); }],
  [E.comment - 0.1, (k, T) => { const w = WALK(T); fp(Y(w[0], 1.62, w[1]), Y(carX(T) - 0.25, 1.3, -11.2), T, 0, 0.4); }],
  [E.loop, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(0.45, 1.5, 9)), T, 0, 0.4)],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = false; R.brim.visible = false; R.idc.visible = false; R.jkH.visible = false; R.hood.visible = false; const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  const grey = !loop && (ci > 3 || (ci === 3 && T > E.swap + 0.3)); R.sleeveM.color.set(grey ? '#7a7a82' : '#2a5a8a'); if (ci <= 2 || loop) R.brim.visible = true;
  if (ci === 0 || loop || (ci === 2 && T > E.lifted - 0.1)) { hr.visible = hl.visible = true; const steer = 0.05 * S(T * 1.4); hr.position.set(0.15, -0.25 + steer, -0.42); hr.rotation.set(0.5, 0.2, -0.5); hl.position.set(-0.15, -0.25 - steer, -0.42); hl.rotation.set(0.5, -0.2, 0.5); }
  if (ci === 1 || (ci === 2 && T < E.lifted - 0.1)) { hr.visible = true; const k = ci === 1 ? ease(prog(T, E.id - 0.3, E.id + 0.2)) : 1; R.idc.visible = ci === 1; hr.position.set(0.2 + 0.05 * k, -0.2 + 0.08 * k, -0.4 - 0.08 * k); hr.rotation.set(0.6 + 0.4 * k, 0.4, -0.2); hl.visible = true; hl.position.set(-0.15, -0.27, -0.42); hl.rotation.set(0.5, -0.2, 0.5); }
  if (ci === 3) { hr.visible = hl.visible = true; const pull = ease(prog(T, E.c3 + 1.2, E.swap)); R.hood.visible = T < E.swap + 0.3; hr.position.set(0.12, -0.22 + 0.06 * pull, -0.45 + 0.08 * pull); hr.rotation.set(0.3 - 0.4 * pull, 0, -0.2); hl.position.set(-0.12, -0.24, -0.45); hl.rotation.set(0.3, 0, 0.2); }
  if (ci === 4 || ci === 5) { const s = S(T * 9); hr.visible = hl.visible = true; hr.position.set(0.18, -0.3 + s * 0.04, -0.38); hr.rotation.set(0.4 + s * 0.2, 0.2, -0.2); hl.position.set(-0.2, -0.3 - s * 0.05, -0.4); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); } }
function anim(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); const tp = truckAt(T); R.truck.position.set(tp[0], 0, tp[1]); R.truck.rotation.y = tp[2]; R.dL.rotation.y = -0.05; R.dR.rotation.y = 0.05;
  R.slBeam.material.opacity = 0.05; R.sl.intensity = 30; R.shackle.position.y = 0.12; R.gate.rotation.y = -1.5; R.dex.visible = false; R.dexWin.intensity = 0; R.jk.visible = false; R.guards.forEach(p => p.visible = false); R.driver.visible = false; R.cabCap.visible = false; R.gL.intensity = 0;
  R.wins.forEach(m => m.material.color.set('#f4d890')); R.alarm.forEach((a_, i) => { const on = Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; });
  const moving = ci === 0 || loop; R.smoke.forEach((m, i) => { const ph = (T * (moving ? 2 : 0.8) + i / 8) % 1; m.position.set(0.8 + ph * 0.3, 0.3 + ph * 1.2, -3 - ph * (moving ? 2 : 0.6)); m.scale.setScalar(0.4 + ph * 1.2); m.material.opacity = ci >= 4 && !loop ? 0 : 0.35 * (1 - ph); });
  // gate guard at the window: takes the ID, checks it, looks at you, lifts the barrier
  pose(R.gg); R.gg.visible = (ci === 1 || ci === 2) && !loop; R.ggL.intensity = 0; if (R.gg.visible) { R.gg.position.set(STOPX - 2.4, 0, -10.1); R.gg.rotation.y = PI; const u = R.gg.userData; u.armR.rotation.set(-1.4, 0, 0.3); u.armR.userData.e.rotation.x = -0.3;
    if (ci === 2 && T < E.lifted - 0.1) { u.armL.rotation.set(-1.3, 0, -0.4); u.armL.userData.e.rotation.x = -0.9; u.head.rotation.x = T < E.atYou - 0.1 ? 0.45 : 0; } if (ci === 2 && T > E.lifted - 0.1) { u.armL.rotation.set(-1.8, 0, -1.0); R.gg.rotation.y = -2.4; }
    const cp = camera.position; R.ggL.position.copy(R.gg.position).add(new T3.Vector3(0.25, 1.4, -0.3)); R.ggLT.position.set(cp.x - YX, cp.y, cp.z); R.ggL.intensity = 12; }
  R.tLamp.intensity = ci === 3 && !loop ? 14 : 0; R.bar.rotation.x = ci === 2 ? 1.35 * ease(prog(T, E.lifted, E.lifted + 0.9)) : ci > 2 && !loop ? 1.35 : 0;
  // sirens behind you
  const sir = !loop && ci >= 5 && T > E.sirens - 0.2; R.cops.forEach((c, i) => { c.material.opacity = sir ? (Math.floor(T * 5 + i) % 2 ? 0.95 : 0.15) : 0; });
  // Dex's car pulls up beside you, window rolls down
  R.car.position.set(carX(T), 0, -11.2); R.car.rotation.y = 0; R.carL.intensity = ci >= 6 && !loop ? 40 : 0; const wd = ci === 6 ? ease(prog(T, E.window, E.window + 0.8)) : ci > 6 && !loop ? 1 : 0; R.carWin.scale.y = 1 - wd; R.carWin.position.y = 1.27 - 0.23 * wd;
  const dx = R.dex; if (ci >= 6 && !loop) { if (dx.parent !== R.car) { R.car.add(dx); } dx.visible = true; pose(dx); sit(dx); dx.position.set(-0.25, -0.12, 0.15); dx.rotation.y = PI / 2 - 1.2; dx.scale.setScalar(0.85); dx.userData.head.rotation.y = 0.9; const u = dx.userData; if (u.mouth) u.mouth.scale.y = 1; u.armL.rotation.set(-1.0, 0, 0); u.armR.rotation.set(-1.0, 0, 0); if (ci >= 7) { u.armR.rotation.set(-1.6, 0, -0.4); u.armR.userData.e.rotation.x = -0.6; } R.dexEyes.forEach(e => e.material.opacity = 0.5); }
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); const tp = truckAt(T); R.truck.position.set(tp[0], 0, tp[1]); R.truck.rotation.y = tp[2]; anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
""")
# hud for part 6
region("function hud(T) {", "function likePill", r"""function hud(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#e8641e'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . PART 6', 149, 69, 26, '#ff9a5a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.24 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  const sir = !loop && ci >= 5 && T > E.sirens - 0.2; const lbl = sir ? 'SIRENS BEHIND' : (ci === 1 || ci === 2) && !loop ? 'GUARD AT GATE' : 'CHECKPOINT CLEARED'; const red = sir || ((ci === 1 || ci === 2) && !loop && T < E.lifted);
  octx.save(); octx.fillStyle = red ? 'rgba(120,0,0,0.9)' : 'rgba(10,80,30,0.9)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt(lbl, 583, 156, 21, Math.floor(T * 4) % 2 ? '#fff' : (red ? '#ff8a7a' : '#9af0b0')); octx.restore();
  const items = [['GATE', loop || ci === 0 || ci >= 3 || (ci === 2 && T > E.lifted) ? 1 : 0], ['CLOTHES', !loop && (ci > 3 || (ci === 3 && T > E.swap + 0.3)) ? 1 : 0], ['DITCH TRUCK', !loop && (ci > 4 || (ci === 4 && T > E.ditch)) ? 1 : 0], ['CITY', 0]];
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 116, 230, 214, 18); octx.fill();
  items.forEach(([s_, d], i) => { txt(d > 0 ? '✓' : '□', 50, 151 + i * 46, 26, d > 0 ? '#5ad88a' : '#9a9aa8'); txt(s_, 78, 152 + i * 46, 24, d > 0 ? '#fff' : '#9a9aa8', 'left'); }); octx.restore();
  if (ci >= 4 && ci <= 5 && !loop) { octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(470, 212, 226, 64, 22); octx.fill(); txt('CITY 1 KM', 583, 245, 26, '#ffd27a'); octx.restore(); } }
""")
rep("const SEQ = [[['sixty', 'seconds'], '60 seconds'], [['fifty', 'metres'], '50 metres']];", "const SEQ = [[['sixty', 'seconds'], '60 seconds'], [['one', 'kilometre'], '1 km']];")
rep("build(); build2(); build3();", "build(); build2(); build3(); build4(); ")
s = s.replace('scene.fog.near = 14; scene.fog.far = 70;', 'scene.fog.near = 30; scene.fog.far = 180; camera.far = 500; camera.updateProjectionMatrix();')
rep("!loop && ![3, 5, 10, 12].includes(si)", "!loop && ![2, 7, 9, 10].includes(si)")
region("  if (ci === 1 && !loop) { const g_ = 0.22", "  const cap = CAPS.find", r"""  if (ci >= 5 && !loop && T > E.sirens - 0.2) { octx.fillStyle = Math.floor(T * 5) % 2 ? 'rgba(160,0,0,0.08)' : 'rgba(0,40,170,0.08)'; octx.fillRect(0, 0, W, H); }
  if (ci === 6 && !loop) { const g_ = 0.12 * ease(prog(T, E.c6, E.window)); octx.fillStyle = `rgba(255,244,215,${g_})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big("DON'T LOOK BACK", 480, 58, '#ff4a4a', 1); }
  if (ci === 1) big('60 SECONDS AGO', 480, 54, '#ffd27a', prog(T, E.recap, E.recap + 0.2));
  if (ci === 2 && T > E.lifted) big('BARRIER UP', 480, 60, '#5ad88a', prog(T, E.lifted, E.lifted + 0.15));
  if (ci === 3 && T > E.swap - 0.1) { big('NEW CLOTHES', 480, 56, '#9ad0ff', prog(T, E.swap - 0.1, E.swap + 0.1)); const a = ease(prog(T, E.swap, E.swap + 0.3)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(6,6,10,0.85)'; octx.beginPath(); octx.roundRect(170, 530, 380, 54, 27); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 2; octx.stroke(); txt('IDEA FROM THE COMMENTS', 360, 558, 22, '#ffd27a'); octx.restore(); }
  if (ci === 4 && T > E.ditch - 0.1) big('TRUCK DITCHED', 480, 56, '#ff9a5a', prog(T, E.ditch - 0.1, E.ditch + 0.1));
  if (ci === 7) big('DEX', 460, 110, '#ffad6a', prog(T, E.dex - 0.1, E.dex + 0.05));
  if (ci === 8 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. GET IN THE CAR' : 'B. KEEP WALKING', 480, 52, A ? '#ff9a5a' : '#7ad0ff', 1); big(A ? 'WITH DEX' : "PRETEND YOU DON'T KNOW HIM", 550, 34, '#fff', 1); } else big('COMMENT A OR B', 480, 64, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
""")
open('scenes.js', 'w').write(s)
print('ok')
