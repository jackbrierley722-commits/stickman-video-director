// ---------- timeline ----------
const E = { again: AT(0, 'again'), dead: CL[1].start, endlife: AT(1, 'and'), wakes: CL[2].start, coffee: AT(2, 'a'), woman: AT(2, 'the'), never: AT(2, "he's"), refl: CL[3].start, sean: AT(3, "it's"), boomC: CL[4].start, passes: AT(4, 'as'), blow: AT(4, 'whole') + 0.45,
  cock: CL[5].start, screen: AT(5, 'a', 1), find: AT(5, 'find'), dirty: AT(5, 'because'), loops: CL[6].start, sameC: AT(6, 'same'), sameW: AT(6, 'same', 1), sameE: AT(6, 'same', 2), like: CL[7].start, follow7: AT(7, 'follow'), notreal: AT(7, 'because'),
  clues: CL[8].start, vent: AT(8, 'the'), chase: AT(8, 'he', 1), dies: AT(8, 'and'), lookup: CL[9].start, name: AT(9, 'captain'), kia: AT(9, 'killed'), body: AT(9, 'most'), mach: AT(9, 'machines'), head: AT(9, 'the'),
  wallet: CL[10].start, falls: AT(10, 'a'), frost: AT(10, 'derek'), plate: AT(10, 'colter'), police: CL[11].start, second: AT(11, 'the', 1), wipe: CL[12].start, begs: AT(12, 'so'), letdie: AT(12, 'and', 1),
  final: CL[13].start, dad: AT(13, 'he', 1), kiss: AT(13, 'he', 2), eight: CL[14].start, off: AT(14, 'they'), freeze: AT(14, 'everything'), goes: CL[15].start, keeps: AT(15, 'it'), bean: CL[16].start, sim: AT(16, 'the'), realw: AT(16, 'each'), alive: AT(16, 'and'),
  email: CL[17].start, never2: AT(17, 'but'), yet: AT(17, 'yet'), title: CL[18].start, yr: AT(18, 'twenty'), end: CL[19].start, deal: AT(19, 'a'), cmt: AT(19, 'comment') };
E.loop = TM.total - 0.4;
const FROZEN = (T) => (T > E.freeze && T < E.keeps) ? E.freeze : T;
// interior booms (toilet end), exterior booms (hero car)
const IN_BOOMS = [E.sameE + 0.5, E.dies + 0.25], EX_BOOMS = [E.again + 0.2, E.blow];

// ---------- shots ----------
const HERO = (k) => TR(k, [9.5, 3.4, 34], [9.0, 3.6, 28], [0, 2.0, -40], [0, 2.2, -40]);
const ICOLT = (k) => TR(k, [0.35, 1.55, -2.6], [0.3, 1.5, -2.3], [-0.64, 1.05, 0.3], [-0.64, 1.1, 0.3]);
const ICHRIS = (k) => TR(k, [-0.15, 1.75, 1.25], [-0.1, 1.72, 1.05], [-0.64, 1.15, -1.41], [-0.64, 1.15, -1.41]);
const ISHOE = (k) => TR(k, [0.45, 0.85, -0.7], [0.42, 0.8, -0.62], [-0.45, 0.08, -0.38], [-0.45, 0.08, -0.38]);
const IVENT = (k) => TR(k, [0.1, 1.65, 6.9], [0.15, 1.7, 7.4], [0.62, 2.0, 9.86], [0.62, 2.0, 9.86]);
const IKISS = (k) => TR(k, [1.3, 1.62, -0.7], [1.25, 1.62, -0.6], [0, 1.5, -0.54], [0, 1.5, -0.54]);
const COCK = (k) => TR(k, [1000.75, 1.75, -0.45], [1000.65, 1.72, -0.35], [1000, 1.25, 0.62], [1000, 1.25, 0.62]);
const SCREEN = (k) => TR(k, [1000.35, 1.7, 0.75], [1000.3, 1.65, 0.55], [1000, 1.45, -0.85], [1000, 1.45, -0.85]);
const SH = [
  [0, 'world', (k, T) => HERO(k)],
  [E.dead, 'cock', (k, T) => COCK(k)], [E.endlife - 0.1, 'park', (k, T) => TR(k, [1400 + 9, 2.2, 16], [1400 + 7, 2.4, 13], [1400, 2.6, -6], [1400, 2.8, -6])],
  [E.wakes, 'world', (k, T) => ICOLT(k)], [E.coffee - 0.1, 'world', (k, T) => ISHOE(k)], [E.woman - 0.1, 'world', (k, T) => ICHRIS(k)], [E.never - 0.1, 'world', (k, T) => ICOLT(k)],
  [E.refl, 'world', (k, T) => TR(k, [-0.75, 1.5, -0.9], [-0.8, 1.48, -0.7], [-1.6, 1.38, 0.15], [-1.6, 1.38, 0.15])],
  [E.boomC, 'world', (k, T) => { const sh = T > E.blow ? S(T * 60) * 0.35 * clamp(1.5 - (T - E.blow)) : 0; TR(k, [16 + sh, 7, 42], [15, 7.5, 38], [0, 2, -6], [0, 2, -4]); }],
  [E.cock, 'cock', (k, T) => COCK(k)], [E.screen - 0.1, 'cock', (k, T) => SCREEN(k)],
  [E.loops, 'world', (k, T) => ICOLT(k)], [E.sameC - 0.1, 'world', (k, T) => ISHOE(k)], [E.sameW - 0.1, 'world', (k, T) => ICHRIS(k)], [E.sameE - 0.1, 'world', (k, T) => TR(k, [0, 1.7, -6], [0, 1.72, -5.5], [0, 1.6, 9], [0, 1.6, 9])],
  [E.like, 'world', (k, T) => TR(k, [-11, 3.2, 14], [-10.5, 3.3, 10], [0, 2, -24], [0, 2, -24])], [E.notreal - 0.1, 'cock', (k, T) => COCK(k)],
  [E.clues, 'world', (k, T) => TR(k, [0, 2.0, -8.5], [0, 2.0, -6], [0, 1.4, 6], [0, 1.4, 6])], [E.vent - 0.1, 'world', (k, T) => IVENT(k)],
  [E.chase - 0.1, 'station', (k, T) => { const z = lerp(4, 16, prog(T, E.chase, E.dies)); look([600 - 3.2, GROUND + 2.6, z - 5.5], [600 - 4.2, GROUND + 1.8, z + 2]); }],
  [E.dies - 0.1, 'station', (k, T) => look([600 + 1.0, GROUND + 1.5, 22], [600 + 4.6, GROUND + 1.6, -10])],
  [E.lookup, 'world', (k, T) => TR(k, [0.2, 1.4, -0.75], [0.15, 1.38, -0.6], [-0.62, 1.02, 0.08], [-0.62, 1.02, 0.08])],
  [E.body - 0.1, 'lab', (k, T) => TR(k, [1103.2, 2.6, 2.6], [1102.4, 2.3, 1.8], [1100, 1.0, -0.8], [1100, 1.0, -0.8])], [E.head - 0.1, 'cock', (k, T) => COCK(k)],
  [E.wallet, 'world', (k, T) => TR(k, [0.5, 0.75, -2.2], [0.45, 0.7, -2.4], [0, 0.15, -4.2], [0, 0.1, -4.4])],
  [E.police, 'street', (k, T) => TR(k, [-600 + 9, 3.2, 24], [-600 + 7.5, 3.0, 21], [-604, 1.0, 6], [-604, 1.0, 6])],
  [E.wipe, 'cock', (k, T) => SCREEN(k)], [E.begs - 0.1, 'cock', (k, T) => COCK(k)],
  [E.final, 'world', (k, T) => IVENT(k)], [E.dad - 0.1, 'world', (k, T) => ICOLT(k)], [E.kiss - 0.1, 'world', (k, T) => IKISS(k)],
  [E.eight, 'world', (k, T) => IKISS(1)], [E.goes, 'world', (k, T) => TR(k, [-11, 3.2, 14], [-10.5, 3.3, 8], [0, 2, -24], [0, 2, -30])],
  [E.bean, 'park', (k, T) => TR(k, [1400 + 12, 2.0, 22], [1400 + 9, 2.2, 15], [1400, 3.5, -6], [1400, 3.5, -6])], [E.realw - 0.1, 'park', (k, T) => TR(k, [1400 - 6, 1.2, 4], [1400 - 4, 1.0, 2.5], [1400, 3.5, -6], [1400, 4.0, -6])], [E.alive - 0.1, 'park', (k, T) => TR(k, [1400 + 1.4, 1.55, 0.9], [1400 + 1.2, 1.55, 1.2], [1400, 1.35, 3.2], [1400, 1.35, 3.2])],
  [E.email, 'cock', (k, T) => SCREEN(k)],
  [E.title, 'world', (k, T) => TR(k, [14, 6, 60], [12, 8, 48], [0, 30, -400], [0, 40, -500])],
  [E.end, 'world', (k, T) => HERO(k * 0.4)], [E.loop, 'world', (k, T) => HERO(0)] ];
SH.sort((a, b) => a[0] - b[0]);
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
const boomT = (list, T) => { let v = -1; for (const b of list) { const d = T - b; if (d >= 0 && d < 4.5) v = d; } return v; };

function anim(T0) { const T = FROZEN(T0); const ci = CLI(T0); const loop = T0 >= E.loop;
  // the train moves (scenery scrolls past)
  const moving = !(ci === 8 && T0 > E.chase - 0.1 && T0 < E.lookup); R.scroll.position.z = ((T * SPEED) % TILE); R.ties.forEach(ti => ti.position.z = (T * SPEED) % 0.6);
  R.other.visible = ci === 4; if (ci === 4) R.other.position.z = -260 + (T - E.boomC) * 52;
  // interior booms + exterior booms
  R.inBoom.update(boomT(IN_BOOMS, T)); R.exBoom.update(boomT(EX_BOOMS, T)); R.inBoom.g.visible = R.inBoom.g.visible && SH[shotAt(T0)][1] === 'world';
  // people on the train
  const standingKiss = (ci === 13 && T > E.kiss - 0.1) || ci === 14;
  seatPose(R.colt, SEAT_TOP); R.colt.position.set(-0.64, R.colt.position.y, 0.31); R.colt.rotation.y = PI; seatPose(R.chris, SEAT_TOP); R.chris.position.set(-0.64, R.chris.position.y, -1.41); R.chris.rotation.y = 0;
  R.colt.userData.head.rotation.x = ci === 2 && T < E.coffee ? lerp(0.5, 0, ease(prog(T, E.wakes, E.wakes + 1))) : 0; talk(R.chris, T, (ci === 2 && T > E.woman) || (ci === 6 && T > E.sameW - 0.1 && T < E.sameE));
  if (standingKiss) { rest(R.colt); rest(R.chris); R.colt.position.set(0.02, 0, -0.3); R.colt.rotation.y = PI; R.chris.position.set(0.02, 0, -0.78); R.chris.rotation.y = 0; R.colt.userData.up.rotation.x = 0.14; R.chris.userData.up.rotation.x = 0.1; R.colt.userData.head.rotation.x = 0.15; R.chris.userData.head.rotation.x = -0.12; R.colt.userData.armL.rotation.set(-0.7, 0, -0.35); R.colt.userData.armR.rotation.set(-0.7, 0, 0.35); R.chris.userData.armL.rotation.set(-0.9, 0, -0.2); R.chris.userData.armR.rotation.set(-0.9, 0, 0.2); }
  const phoneOn = (ci === 9 && T < E.body - 0.1) || (ci === 13 && T > E.dad - 0.1 && T < E.kiss - 0.1); R.phone.visible = phoneOn; if (phoneOn) { const u = R.colt.userData; if (ci === 9) { u.armR.rotation.set(-1.2, 0, 0.3); u.armR.userData.e.rotation.x = -0.9; u.head.rotation.x = 0.35; R.phone.position.set(-0.55, 0.98, 0.05); R.phone.rotation.set(-0.9, PI, 0); } else { u.armR.rotation.set(-2.5, 0, 0.35); u.armR.userData.e.rotation.x = -2.3; R.phone.position.set(-0.53, 1.36, 0.27); R.phone.rotation.set(0, PI / 2, 0); } }
  { const c = R.phoneScr.material; c.color.set(ci === 9 ? '#e8f0ff' : '#5ad88a'); }
  // coffee spill on his shoe (each loop)
  const cs = ci === 2 ? prog(T, E.coffee, E.coffee + 0.6) : ci === 6 ? prog(T, E.sameC, E.sameC + 0.6) : -1; R.cup.visible = cs >= 0 && cs < 1; R.cup.position.set(-0.42, lerp(1.1, 0.12, cs), -0.32); R.cup.rotation.z = cs * 2.4; R.spill.visible = cs > 0.6 || (ci === 2 && T > E.coffee + 0.6) || (ci === 6 && T > E.sameC + 0.6 && T < E.sameW); R.spill.position.set(-0.45, 0.006, -0.32); R.spill.scale.setScalar(0.4 + 0.6 * clamp((cs - 0.6) * 3));
  // bomb vent
  const vo = (ci === 8 && T > E.vent - 0.1) || ci === 13 ? 1 : 0; R.ventPanel.position.y = 2.0 - vo * 0.45; R.ventPanel.rotation.x = vo * 0.3; R.bomb.visible = vo > 0; const defused = ci === 13 && T > E.final + 1.4; R.led.visible = !defused && Math.floor(T * 4) % 2 === 0; R.ledG.material.opacity = R.led.visible ? 0.9 : 0.05;
  // wallet drop: a passenger walks the aisle, the wallet falls
  R.walker.visible = ci === 10; R.wallet.visible = ci === 10; if (ci === 10) { const wz = lerp(-7.5, -3.0, prog(T, E.wallet, E.frost)); walkPose(R.walker, T * 6, 0.9); R.walker.position.set(0.05, 0, wz); R.walker.rotation.y = 0; const df = prog(T, E.falls + 0.2, E.falls + 0.6); R.wallet.position.set(0.12, lerp(0.9, 0.03, df * df), Math.min(wz - 0.1, lerp(wz - 0.1, -4.3, 0) ) ); if (T > E.falls + 0.6) R.wallet.position.set(0.12, 0.03, -4.3); R.wallet.rotation.set(df * 2, 0, 0); }
  // reflection: Sean in the window
  R.sean.visible = ci === 3; // station chase + death
  if (ci === 8) { const z = lerp(4, 16, prog(T, E.chase, E.dies)); walkPose(R.susp, T * 9, 1.2); R.susp.position.set(-4.2, GROUND + 1.1, z + 3.5); R.susp.rotation.y = 0; walkPose(R.chase, T * 9 + 1, 1.2); R.chase.position.set(-3.9, GROUND + 1.1, z); R.chase.rotation.y = 0; if (T > E.dies - 0.1) { R.chase.position.set(1.3, GROUND + 0.35, 12); R.chase.rotation.y = -PI / 2; } }
  R.st2.position.z = ci === 8 && T > E.dies - 0.1 ? lerp(-90, 40, prog(T, E.dies - 0.1, E.dies + 1.2)) : -400;
  // cockpit screen + red alarm
  drawScreen(T, ci === 5 && T > E.find - 0.1 ? 'mission' : ci === 12 && T < E.begs - 0.1 ? 'wipe' : (ci === 7 || (ci === 9 && T > E.head - 0.1)) ? 'glitch' : 'face'); R.cockRed.intensity = ci === 12 ? 3 + S(T * 4) * 2 : 0; R.scrL.color.set(ci === 12 && T < E.begs ? '#ff6a5a' : '#8ac8ff'); drawMon(T); R.podGlow.material.opacity = 0.35 + 0.1 * S(T * 2);
  { const u = R.pilot.userData; u.head.rotation.x = ci === 5 && T < E.screen ? lerp(0.45, 0, ease(prog(T, E.cock, E.cock + 0.9))) : ci === 1 ? 0.35 : 0; }
  // police lights
  R.cops.forEach(([rl, bl, pl], i) => { const f = Math.floor(T * 7 + i) % 2; rl.material.opacity = f ? 1 : 0.1; bl.material.opacity = f ? 0.1 : 1; pl.color.set(f ? '#ff3a3a' : '#3a6aff'); }); R.officers.forEach((o_, i) => { rest(o_); o_.userData.armR.rotation.x = -1.3; o_.userData.armL.rotation.x = -1.1; });
  // park
  const pw = ci === 16 ? prog(T, E.bean, E.realw) : 1; for (const [p, dx] of [[R.parkC, 0.35], [R.parkX, -0.35]]) { walkPose(p, T * 5 + dx, ci === 16 && T < E.alive ? 0.8 : 0); p.position.set(dx * 1.5, GROUND, lerp(12, 3, pw) + (ci === 1 ? 6 : 0)); p.rotation.y = PI; } if (ci === 16 && T > E.alive - 0.1) { R.parkC.rotation.y = PI + 0.6; R.parkX.rotation.y = PI - 0.6; R.parkC.userData.head.rotation.y = 0.3; talk(R.parkX, T, true); }
  R.walkers.forEach((w_, i) => { walkPose(w_, T * 5 + i, 0.8); const a = w_.rotation.y; w_.position.x = -16 + ((i * 3.7 + T * 0.9 * S(a)) % 32 + 32) % 32; });
  R.inL.forEach(l => l.intensity = 5); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.near = 0.03; camera.updateProjectionMatrix(); anim(T);
  const place = sh[1]; R.world.visible = R.train.visible = place === 'world'; R.station.visible = place === 'station'; R.street.visible = place === 'street'; R.cock.visible = place === 'cock'; R.lab.visible = place === 'lab'; R.park.visible = place === 'park';
  const inside = place === 'world' && Math.abs(camera.position.x) < 1.6 && camera.position.y < 4.5 && Math.abs(camera.position.z) < 10; R.ins.visible = place === 'world';
  const fogC = place === 'cock' || place === 'lab' ? '#05070a' : '#c8d0d4'; scene.fog.color.set(fogC); scene.fog.near = place === 'world' || place === 'park' ? 120 : 40; scene.fog.far = place === 'world' || place === 'park' ? 1900 : 300; R.sky.visible = !(place === 'cock' || place === 'lab');
  sunAt(place === 'station' ? 600 : place === 'street' ? -600 : place === 'park' ? 1400 : 0, 0, place === 'world' ? 0 : 0);
  sh[2](prog(T, t0, t1), T); if (place === 'park' && cubeCam) { R.bean.visible = false; cubeCam.update(renderer, scene); R.bean.visible = true; }
  return { si, t0, place }; }

// ---------- HUD ----------
function loopN(T) { if (T < E.dead) return 9; if (T < E.loops) return 1; if (T < E.like) return 2 + Math.floor((T - E.loops) / 2); if (T < E.final) return 7; return 9; }
function timer(T) { const ci = CLI(T); if (![0, 2, 3, 4, 6, 8, 10, 13, 14, 19].includes(ci)) return null; if (T > E.freeze && T < E.goes) return '0.00'; const st = [0, E.wakes, E.loops, E.clues, E.wallet, E.final, E.end].filter(x => x <= T).pop() || 0; const sp = ci === 14 ? 30 : ci === 0 || ci === 19 ? 1 : 7; const left = Math.max(0, 480 - (T - st) * sp); return Math.floor(left / 60) + '.' + String(Math.floor(left % 60)).padStart(2, '0'); }
function hud(T) { const ci = CLI(T); const nw = T > E.keeps && T < E.end; octx.save(); octx.fillStyle = 'rgba(6,10,16,0.75)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#3affea'; octx.lineWidth = 3; octx.stroke(); txt(nw ? 'NEW WORLD' : 'LOOP ' + loopN(T), 149, 69, nw ? 26 : 30, '#3affea'); octx.restore();
  const tm = timer(T); if (tm) { octx.save(); octx.fillStyle = 'rgba(30,4,4,0.8)'; octx.beginPath(); octx.roundRect(470, 36, 226, 110, 22); octx.fill(); octx.strokeStyle = '#ff3a2a'; octx.lineWidth = 3; octx.stroke(); txt('UNTIL IMPACT', 583, 64, 18, '#ff8a7a'); txt(tm, 583, 110, 52, '#ff3a2a'); octx.restore(); } }
