
// ---------- shots ----------
const U3 = (x, y, z) => [SB[0] + x, SB[1] + y, SB[2] + z];
const SH = [
  [0, (k, T) => TR(k, [-4.8, 1.6, 16], [-4.6, 1.65, 13], [-0.5, 8, -40], [0, 20, -40])],
  [E.c1, (k, T) => TR(k, [-3, 16, 34], [-3, 18, 28], [0, 30, -170], [0, 40, -170])],
  [E.day1 - 0.1, (k, T) => TR(k, [-7.2, 1.6, 6], [-7.0, 1.7, 3], [-6, 9, -22], [-1, 12, -22])],
  [E.c2, (k, T) => TR(k, [5.2, 1.6, 2.0], [5.4, 1.6, 0.5], [8, 2.2, -16], [7, 3, -18])],
  [E.c3, (k, T) => TR(k, [1, 2, -36], [1, 2.4, -40], [6, 60, -170], [6, 125, -170])],
  [E.flight - 0.1, (k, T) => TR(k, [-30, 160, -110], [-26, 158, -116], [6, 140, -170], [6, 140, -170])],
  [E.c4, (k, T) => TR(k, U3(1.2, 0.9, 14), U3(1.0, 0.8, 11), U3(-1, 1.2, -20), U3(-1, 1.0, -20))],
  [E.hunt - 0.1, (k, T) => TR(k, U3(-6, 1.4, -6), U3(-6.4, 1.3, -8), U3(-3, 0.9, -14), U3(-3, 0.9, -14))],
  [E.c5, (k, T) => TR(k, [-1.5, 1.6, 16], [-1.5, 1.6, 14], [0, 4, -40], [0, 4.5, -40])],
  [E.c6, (k, T) => TR(k, [-2, 1.4, -34], [-2.5, 1.3, -38], [12, 13, -62], [8, 15, -62])],
  [E.c7, (k, T) => TR(k, [-3, 2.2, 6], [-3, 2.6, 2], [3, 12, -62], [3, 14, -62])],
  [E.loop, (k, T) => look([-4.8, 1.6, 16], [-0.5, 8, -40])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
const wrapZ = (z, a, b) => { const L = b - a; return a + ((((z - a) % L) + L) % L); };
const STEPS = []; for (let t = E.shake; t < TM.total; t += 0.95) STEPS.push(t);
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  lightMode(ci === 4 ? 'night' : (ci === 1 && T >= E.day1 - 0.1) || ci === 2 ? 'fog' : ci >= 5 ? 'red' : 'dusk');
  // traffic: frozen while the long neck crosses (day 1) and once the ground shakes
  const te = ci === 1 && T >= E.day1 - 0.1 || ci === 2 ? E.day1 : ci >= 5 ? E.c5 : T;
  R.cars.forEach((c, i) => { const m = c.userData.mv; const inner = Math.abs(m.x) < 2; const lx = inner ? m.x : Math.sign(m.x) * 4.2; c.visible = !(ci === 0 && inner) && ci !== 4; c.position.set(lx, 0, wrapZ(m.z0 + m.dir * m.sp * te, -150, 40)); if (c.userData.lb) { const f = Math.floor(T * 6) % 2; c.userData.lb[0].material.emissiveIntensity = f ? 2 : 0.2; c.userData.lb[1].material.emissiveIntensity = f ? 0.2 : 2; } });
  R.fwyCars.forEach((c, i) => { const dir = i % 2 ? 1 : -1; c.position.x = ci >= 6 && !loop ? (i % 2 ? -20 : 20) + i * 8 : wrapZ(-100 + i * 37 + dir * 14 * T, -110, 110); c.visible = !(ci >= 6 && !loop && Math.abs(c.position.x - R.trex.position.x) < 8); });
  // pedestrians: walk, stop and stare, then run
  R.peds.forEach((p, i) => { const m = p.userData.mv; stillP(p); p.visible = ci !== 4;
    if (ci >= 5 && !loop) { const d = T - E.c5; p.position.set(m.x * 0.9, 0, wrapZ(m.z0 - 20, -45, 10) + 5.5 * d); p.rotation.y = 0; walkP(p, T * 13 + m.ph, 1.3, 1); }
    else if (ci === 1 && T >= E.day1 - 0.1 || ci === 2) { const z = wrapZ(m.z0 + m.dir * m.sp * E.day1, -60, 30); p.position.set(m.x, 0, z); if (ci === 2 && i % 3 === 0) { p.position.z = wrapZ(m.z0 + m.dir * m.sp * T, -60, 30); p.rotation.y = m.dir > 0 ? 0 : PI; walkP(p, T * 7 + m.ph, 1); } else { p.rotation.y = Math.atan2(R.brach.position.x - m.x, R.brach.position.z - z); p.userData.head.rotation.x = -0.5; if (i % 4 === 1) { p.userData.armR.rotation.x = -1.6; p.userData.armR.userData.e.rotation.x = -0.6; } } }
    else { p.position.set(m.x, 0, wrapZ(m.z0 + m.dir * m.sp * T, -60, 30)); p.rotation.y = m.dir > 0 ? 0 : PI; walkP(p, T * 7 + m.ph, 1); } });
  // brachiosaurus
  const b = R.brach; b.visible = ci <= 2 || ci === 7 || loop; if (ci === 0 || loop) { const z = loop ? -48 : lerp(-48, -38, T / E.c1); b.position.set(0, 0, z); b.rotation.y = 0.45; walkDino(b, T * 1.6, 1, 'b'); b.userData.neck[0].rotation.x = 0.55; }
  if (ci === 1 || ci === 2) { const x = lerp(-34, 14, prog(T, E.day1 - 0.1, E.c3)); b.position.set(x, 0, -22); b.rotation.y = PI / 2; walkDino(b, T * 1.6, 1, 'b'); if (ci === 1 && T < E.day1 - 0.1) { b.position.set(-40, 0, -120); } }
  if (ci === 7) { b.position.set(-46, 0, -105); b.rotation.y = 0.6; walkDino(b, T * 1.2, 0.6, 'b'); b.userData.neck[0].rotation.x = 0.4; }
  // pterosaurs around the tallest tower
  R.pteros.forEach((p, i) => { p.visible = ci === 3 || ci >= 5 || (ci === 1 && T < E.day1); const tt = R.towerTop; const a = T * (0.28 + i * 0.02) + i * 0.7, rad = 22 + (i % 4) * 7; if (i < 2 && ci === 3) { p.position.set(tt[0] + (i ? 4 : -4), tt[1] + 1.2, tt[2] + (i ? -3 : 3)); p.rotation.set(0, i * 2, 0); p.userData.wings.forEach((w, j) => w.rotation.z = (j ? -1 : 1) * 0.9); return; }
    p.position.set(tt[0] + S(a) * rad, tt[1] - 12 + (i % 3) * 8 + 4 * S(T * 0.9 + i), tt[2] + C(a) * rad); p.rotation.set(0.1 * S(T + i), a + PI / 2, -0.35); p.userData.wings.forEach((w, j) => { const f = S(T * 4.5 + i) * 0.55; w.rotation.z = (j ? -1 : 1) * f; w.userData.t.rotation.z = (j ? -1 : 1) * f * 0.6; }); });
  // T. rex on the freeway
  const tx = R.trex; tx.visible = ci >= 6 && !loop; if (tx.visible) { const roar = ci === 7 ? ease(prog(T, E.c7 + 0.2, E.c7 + 0.7)) : prog(T, E.c6 + 1.6, E.c6 + 2.0); const walking = ci === 6 && T < E.c6 + 1.6; tx.position.set(walking ? lerp(28, 10, prog(T, E.c6, E.c6 + 1.6)) : 10, 8.1, -62); tx.rotation.y = ci === 7 ? -PI / 2 + 0.9 * ease(prog(T, E.c7, E.c7 + 0.8)) : -PI / 2;
    walkDino(tx, T * 3.3, walking ? 1 : 0, 't'); const u = tx.userData; u.jaw.rotation.x = 0.7 * roar * (0.85 + 0.15 * S(T * 30)); u.neck.rotation.x = -0.25 - 0.45 * roar; u.head.rotation.x = -0.2 * roar; }
  // suburbs: raptors weave between parked cars, car alarm flashing
  R.raps.forEach((rp, i) => { rp.visible = ci === 4; if (!rp.visible) return; const d = T - E.c4; const z = -40 + d * (6.5 + i * 0.6) - i * 4; rp.position.set(S(d * 1.8 + i) * 2.6 + (i % 2 ? 1.6 : -1.6), 0, z); rp.rotation.y = 0.5 * C(d * 1.8 + i); walkDino(rp, T * 11 + i, 1, 'r'); rp.userData.jaw.rotation.x = i === 1 && T > E.hunt ? 0.5 * Math.abs(S(T * 6)) : 0.1;
    if (i === 0 && T > E.hunt - 0.2) { const k = prog(T, E.hunt - 0.2, E.hunt + 0.4); rp.position.set(-3.4 + 0.3 * k, 1.4 * Math.min(1, k * 2), lerp(-18, -14.5, k)); rp.rotation.y = 0; } });
  const af = ci === 4 && T > E.hunt && Math.floor(T * 4) % 2; R.alarmL.intensity = af ? 18 : 0;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 60; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const ci = T >= E.loop ? 0 : CLI(T); let sk = 0; if (ci >= 5 && T < E.loop) STEPS.forEach(s => { const d = T - s; if (d >= 0 && d < 0.4) sk = Math.max(sk, (1 - d / 0.4) * (ci === 5 ? 0.6 : 1)); });
  if (ci === 0) { const d = (T * 0.95) % 0.95; sk = Math.max(sk, d < 0.25 ? (1 - d / 0.25) * 0.25 : 0); }
  camera.position.y += sk * 0.12 * S(T * 70); camera.rotation.z += sk * 0.015 * S(T * 55);
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 25); R.sun.position.set(c.x - 120, 70, c.z - 260); R.sun.target.updateMatrixWorld();
  R.sunGlow.position.set(c.x - 260, 55, c.z - 900); R.sunDisc.position.copy(R.sunGlow.position); return { si, t0 }; }
