
const E3 = (x, y, z) => [EG[0] + x, EG[1] + y, EG[2] + z], T3_ = (x, y, z) => [TG[0] + x, TG[1] + y, TG[2] + z], N3 = (x, y, z) => [NG[0] + x, NG[1] + y, NG[2] + z];
// pop-ups in New Zealand: first at "pop", then every 80 minutes (sped up)
const POPS = [E.pop, E.every + 0.5, E.sheep - 0.25, E.c7 + 0.2]; const HELLO = [1, 2, 47, 1000];
const popIdx = T => { let k = -1; POPS.forEach((p, i) => { if (T >= p - 0.05) k = i; }); return k; };
const SH = [
  [0, (k, T) => TR(k, [-0.4, 2.6, 4.2], [-0.2, 2.3, 3.2], [0, 0.4, 0], [0, 0.0, 0])],
  [E.c1, (k, T) => TR(k, E3(0, 0, 52), E3(0, 0, 48), E3(0, 0, 0), E3(0, 0, 0))],
  [E.c2, (k, T) => { camera.up.set(0, 0, -1); look(T3_(0, -1.2, 0.01), T3_(0, -12, 0)); }],
  [E.c4, (k, T) => { camera.up.set(0, 1, 0); TR(k, T3_(3.4, 1.0, 4.6), T3_(3.0, 0.9, 4.0), T3_(0, 0.5, 0), T3_(0, 0.5, 0)); }],
  [E.c5, (k, T) => { camera.up.set(0, 1, 0); TR(k, E3(0, -2, 48), E3(0, -3, 45), E3(0, -1, 0), E3(0, -2, 0)); }],
  [E.pop - 0.15, (k, T) => TR(k, N3(1.2, 3.0, 8.5), N3(1.0, 2.8, 7.6), N3(0.3, 2.2, 0), N3(0.4, 2.2, 0))],
  [E.forever - 0.1, (k, T) => TR(k, E3(0, 0, 50), E3(0, 0, 48), E3(0, 0, 0), E3(0, 0, 0))],
  [E.every + 0.3, (k, T) => TR(k, N3(1.2, 3.0, 8.5), N3(1.4, 3.0, 8.0), N3(0.4, 2.2, 0), N3(0.5, 2.2, 0))],
  [E.loop, (k, T) => look([-0.4, 2.6, 4.2], [0, 0.4, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, u = you.userData; rest(you); you.visible = true; you.rotation.set(0, 0, 0); you.scale.setScalar(1); camera.up.set(0, 1, 0);
  // field: stand at the edge, jump in at "here's"
  if (ci === 0 || loop) { const j = loop ? 0 : prog(T, E.here, E.here + 0.9); you.position.set(0, j < 0.35 ? 0.9 * S(PI * j / 0.7) : lerp(0.65, -3, (j - 0.35) / 0.65), lerp(0.9, 0, ease(prog(j, 0, 0.35)))); you.rotation.y = PI; u.armL.rotation.set(-2.8 * Math.min(1, j * 3), 0, 0.3); u.armR.rotation.set(-2.8 * Math.min(1, j * 3), 0, -0.3); face(you, j > 0 ? 'grin' : 'neutral', T); if (j <= 0) you.position.set(0, 0, 1.35); you.rotation.y = j <= 0 ? PI + 0.2 : PI; }
  // falling (tunnel)
  const p = fallP(T); const inTunnel = ci >= 2 && ci <= 4 && !loop; R.tunM.emissiveIntensity = inTunnel ? clamp((p - 0.1) * 2.2) * 0.9 : 0; R.tunM.color.set(p > 0.3 ? '#a85a3a' : '#7a6a5a'); R.coreGlow.material.opacity = ci === 4 ? 0.7 : ci === 3 ? 0.35 : 0; R.tunL.color.set(p > 0.3 ? '#ffb070' : '#ffffff');
  const sp = speedAt(p) / 28000; R.rockT.offset.y = -(T * (ci === 4 ? 0 : 0.4 + sp * 6)) % 1; R.streaks.forEach((s, i) => { s.visible = inTunnel && ci !== 4; const ph = (T * (1 + sp * 5) + i / 26) % 1; s.position.set(S(i * 2.4) * 1.9, 30 - ph * 60, C(i * 2.4) * 1.9); s.scale.y = 0.5 + sp * 2.5; });
  if (inTunnel) { you.position.set(...T3_(0, ci === 4 ? 0.2 * S(T * 1.4) : -4, 0)); if (ci === 4) { you.rotation.set(T * 0.9, T * 0.6, 0.3); const off = new T3.Vector3(0, 0.9, 0).applyEuler(you.rotation); you.position.set(TG[0] - off.x, TG[1] + 0.5 - off.y + 0.15 * S(T * 1.4), TG[2] - off.z); u.armL.rotation.set(-1.2, 0, 1.2); u.armR.rotation.set(-1.2, 0, -1.2); u.legL.rotation.z = -0.4; u.legR.rotation.z = 0.4; face(you, 'grin', T); }
    else { you.rotation.set(PI, T * 0.3, 0); const fl = S(T * 14); u.armL.rotation.set(-2.6 + 0.3 * fl, 0, 0.6); u.armR.rotation.set(-2.6 - 0.3 * fl, 0, -0.6); u.legL.rotation.x = 0.3 * fl; u.legR.rotation.x = -0.3 * fl; face(you, ci === 3 ? 'yell' : 'shock', T); } }
  // Earth cutaway marker
  if (R.dot) { let y = 10 * C(PI * p); if (ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) y = 10 * C(PI * (1 + (T - E.forever) * 2.2)); R.dot.position.y = y; R.dot2.position.y = y; R.EG.rotation.y = 0.15 * S(T * 0.3); }
  // New Zealand: pop out, wave, fall back; sheep pile up
  const k = popIdx(T); const nz = !loop && ci >= 5 && (ci > 5 || T > E.pop - 0.15) && !(ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3);
  if (nz) { const t0 = POPS[Math.max(0, k)]; const d = T - t0; const h = d < 0 ? -2 : d < 0.35 ? lerp(-1, 2.3, ease(d / 0.35)) : d < 1.1 ? 2.3 + 0.1 * S(d * 6) : lerp(2.3, -2, ease((d - 1.1) / 0.4)); you.position.set(...N3(0, h, 0)); you.rotation.y = 0.3; u.armR.rotation.set(-2.7, 0, -0.3 + 0.35 * S(T * 12)); face(you, 'grin', T); if (k === 3) you.position.set(...N3(0, 2.4 + 0.1 * S(T * 5), 0)); }
  else if (!inTunnel && !(ci === 0 || loop)) you.visible = false;
  const nS = k < 0 ? 1 : [1, 1, 4, 8][k]; R.sheep.forEach((s, i) => { s.visible = i < nS; s.userData.head.rotation.x = nz ? -0.3 + 0.1 * S(T * 3 + i) : 0; s.rotation.y = -2.2 + i * 0.12 + (nz ? 0.1 * S(T + i) : 0); }); R.hat.visible = k === 3;
  R.sky.visible = !(ci === 1 || ci === 5 && T < E.pop - 0.15 || ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) || loop; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const ci = T >= E.loop ? 0 : CLI(T); if ((ci === 2 || ci === 3) && T < E.loop) { const sp = speedAt(fallP(T)) / 28000; camera.position.x += 0.03 * sp * S(T * 60); camera.rotation.z += 0.01 * sp * S(T * 47); }
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 3); R.sun.position.set(c.x + 4, 9, c.z + 4); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
