
const H3 = (x, y, z) => [HOME[0] + x, HOME[1] + y, HOME[2] + z], F3 = (x, y, z) => [FB[0] + x, FB[1] + y, FB[2] + z];
// Leo's height in inches: one inch per lie, then he keeps going all day
function leoIn(T) { if (T < E.shrank) return 54; if (T < E.q1 + 0.6) return 53; if (T < E.q2 + 0.6) return 52; if (T < E.q3 + 0.5) return 51; if (T < E.c6) return Math.round(lerp(50, 6, prog(T, E.q3 + 0.6, E.c6 - 0.1) ** 0.7)); return 6; }
const LIES = []; for (let t = E.q3 + 0.6; t < E.c6 - 0.1; t += 0.11) LIES.push(t);
function dadScale(T) { if (CLI(T) === 8) { const n = [E.lie1, E.lie2, E.lie3].filter(t => T > t + 0.3).length; return [1.12, 0.92, 0.74, 0.56][n]; } return T > E.grew + 0.1 && CLI(T) >= 9 ? 0.58 : 0.56; }
const SH = [
  [0, (k, T) => TR(k, [-2.2, 2.2, 4], [-1.0, 1.7, -9.5], [0, 1.2, -14], [0, 1.5, -14])],
  [E.c1, (k, T) => TR(k, H3(1.0, 1.5, 9.2), H3(0.8, 1.4, 8.3), H3(0, 1.1, 5.2), H3(0, 1.1, 5.2))],
  [E.c3, (k, T) => TR(k, H3(3.3, 1.5, -0.6), H3(3.1, 1.4, -0.9), H3(1.5, 0.8, -2.9), H3(1.6, 0.7, -2.9))],
  [E.cat - 0.1, (k, T) => TR(k, H3(4.0, 0.9, -1.7), H3(3.8, 0.8, -1.9), H3(2.6, 0.35, -2.6), H3(2.6, 0.35, -2.6))],
  [E.c4, (k, T) => TR(k, H3(-0.6, 1.3, 1.6), H3(-0.4, 1.2, 1.2), H3(0.8, 0.8, -1.8), H3(0.8, 0.7, -1.8))],
  [E.c5, (k, T) => TR(k, H3(-1.2, 1.5, 2.2), H3(-1.0, 1.3, 1.8), H3(0.2, 0.8, -1.4), H3(0.4, 0.5, -1.4))],
  [E.c6, (k, T) => TR(k, H3(0.0, 0.5, 1.9), H3(0.2, 0.4, 1.6), H3(0.6, 0.15, 0.6), H3(0.6, 0.15, 0.6))],
  [E.c7, (k, T) => TR(k, H3(0.2, 1.0, 2.0), H3(0.3, 0.95, 1.7), H3(0.7, 0.7, 0.6), H3(0.7, 0.75, 0.6))],
  [E.c8, (k, T) => TR(k, F3(0, 1.3, 4.2), F3(0, 1.2, 3.6), F3(0.4, 0.8, -1), F3(0.4, 0.7, -1))],
  [E.c9, (k, T) => TR(k, H3(0.2, 1.0, 2.0), H3(0.3, 0.95, 1.7), H3(0.7, 0.75, 0.6), H3(0.7, 0.8, 0.6))],
  [E.c10, (k, T) => TR(k, H3(2.0, 1.4, 1.4), H3(2.2, 1.3, 1.0), H3(2.5, 0.9, -0.6), H3(2.5, 0.9, -0.6))],
  [E.c11, (k, T) => TR(k, [-2.5, 2.6, 9], [-2.5, 3.0, 10], [0, 1.4, -14], [0, 1.6, -14])],
  [E.loop, (k, T) => look([-2.5, 2.4, 9], [0, 1.2, -14])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const leo = R.leo, dad = R.dad, mum = R.mum, l = leo.userData, d = dad.userData, m = mum.userData; [leo, dad, mum].forEach(rrest); leo.visible = dad.visible = mum.visible = true;
  // town crowd walking, mayor waving
  R.crowd.forEach((p, i) => { rrest(p); const mv = p.userData.mv; p.position.set(mv.x, 0, ((mv.z0 + mv.sp * T + 45) % 90 + 90) % 90 - 45); p.rotation.y = mv.sp > 0 ? 0 : PI; rwalk(p, T * 7 + i, 1); }); rrest(R.mayor); R.mayor.userData.armR.rotation.set(-2.8 + 0.3 * S(T * 6), 0, 0); rface(R.mayor, 'smile');
  const s = leoIn(T) / 54; leo.scale.setScalar(s); rface(leo, 'smile'); dad.scale.setScalar(dadScale(T)); mum.scale.setScalar(1.08); rface(dad, 'smile'); rface(mum, 'neutral');
  // vase + cat
  const fall = ci === 3 ? prog(T, E.vase + 0.3, E.vase + 0.75) : ci > 3 && !loop ? 1 : 0; R.vase.visible = fall < 1; R.vase.rotation.z = -1.4 * fall; R.vase.position.set(1.8 + 0.4 * fall, 0.8 - 0.8 * fall * fall, -3.2);
  R.shards.forEach((sh, i) => { const on = fall >= 1 && (ci === 3 || ci === 4); sh.visible = on; const d_ = ci === 3 ? Math.min(1, (T - E.vase - 0.75) * 3) : 1; sh.position.set(2.2 + Math.cos(sh.userData.a) * 0.5 * d_, 0.03, -3.0 + Math.sin(sh.userData.a) * 0.5 * d_); sh.rotation.y = sh.userData.a * 3; });
  R.cat.position.set(2.6, 0, -2.6); R.cat.rotation.y = PI / 2 + 0.6; R.cat.userData.tail.rotation.z = 0.4 + 0.2 * S(T * 3); R.cat.visible = ci >= 3 && ci <= 5; R.shoe.visible = !(ci === 7 || ci === 9);
  // where everyone is, clip by clip
  if (ci === 0 || loop || ci === 11) { leo.visible = dad.visible = mum.visible = false; }
  if (ci === 1 || ci === 2) { leo.position.set(...H3(-0.35, 0, 5.4)); leo.rotation.y = 0.15; mum.visible = false; dad.position.set(...H3(0.75, 0.35, 4.7)); dad.rotation.y = 0.2; if (ci === 1) dad.visible = false; else { d.armR.rotation.set(-1.4, 0, 0.3); rface(dad, 'smile'); } l.armR.rotation.set(ci === 1 ? -2.7 + 0.3 * S(T * 7) : -0.2, 0, 0); }
  if (ci >= 3 && ci <= 5) { leo.position.set(...H3(0.9, 0, -1.9)); leo.rotation.y = 0.3; dad.visible = false; mum.position.set(...H3(-1.4, 0, -1.2)); mum.rotation.y = 0.9; mum.visible = ci > 3 || T > E.asked - 0.2;
    if (ci === 3) { const bump = Math.max(0, 1 - Math.abs(T - E.vase - 0.3) / 0.3); l.armR.rotation.set(-0.6 * bump, 0, 0.9 * bump); rface(leo, T > E.vase + 0.7 ? 'shock' : 'smile'); if (T > E.asked - 0.2) { m.armL.rotation.set(-0.3, 0, 0.9); m.armR.rotation.set(-0.3, 0, -0.9); rface(mum, 'sad'); } if (T > E.cat - 0.1) { leo.rotation.y = 1.4; l.armR.rotation.set(-1.6, 0, 0); rface(leo, 'side'); } }
    if (ci === 4) { rface(leo, 'smug'); rface(mum, 'neutral'); }
    if (ci === 5) { rface(mum, 'neutral'); m.armR.rotation.set(-1.2 + 0.2 * S(T * 5), 0, 0); rface(leo, T > E.q3 + 0.6 ? 'smug' : 'side'); leo.position.y = 0; } }
  if (ci === 6) { leo.position.set(...H3(0.6, 0.06, 0.7)); leo.rotation.y = 0.2; rface(leo, 'shock'); dad.position.set(...H3(1.5, 0, -0.1)); dad.rotation.y = -0.6; mum.position.set(...H3(3.4, 0, -1.5)); mum.rotation.y = -0.4; rface(mum, 'shock'); }
  if (ci === 7 || ci === 9) { dad.position.set(...H3(0.7, 0, 0.3)); dad.rotation.y = 0.15; d.armL.rotation.set(-1.2, 0, 0.35); d.armR.rotation.set(-1.2, 0, -0.35); rface(dad, ci === 9 ? 'smile' : 'sad'); mum.visible = false; leo.position.set(...H3(0.7, 0.42 * dadScale(T) / 0.56, 0.62)); leo.rotation.y = PI + 0.1; rface(leo, 'shock'); if (ci === 9) rface(leo, 'smile'); }
  if (ci === 8) { leo.visible = mum.visible = false; dad.position.set(...F3(0.0, 0, -0.6)); dad.rotation.y = 0.25; rface(dad, [E.lie1, E.lie2, E.lie3].some(t => Math.abs(T - t - 0.2) < 0.6) ? 'smile' : 'neutral'); d.armR.rotation.set(-0.6, 0, -0.2); }
  if (ci === 10) { dad.visible = false; mum.position.set(...H3(3.4, 0, -1.5)); mum.rotation.y = -0.4; rface(mum, 'neutral'); leo.position.set(...H3(2.5, 0.85, -0.6)); leo.rotation.y = 0.5; rface(leo, 'sad'); }
  // sparkles when dad grows from the truth
  R.sparks.forEach((sp, i) => { const on = ci === 9 && T > E.grew - 0.1 && T < E.grew + 1.2; sp.material.opacity = on ? 0.9 * (1 - prog(T, E.grew, E.grew + 1.2)) : 0; const a = i / 10 * PI * 2 + T * 3; sp.position.set(HOME[0] + 0.7 + Math.cos(a) * 0.5, 0.3 + (i % 5) * 0.2 + (T - E.grew) * 0.4, 0.3 + Math.sin(a) * 0.5); }); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 55; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 4); R.sun.position.set(c.x + 6, 14, c.z + 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
