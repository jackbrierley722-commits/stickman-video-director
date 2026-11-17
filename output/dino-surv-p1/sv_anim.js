
// ---------- shots (first person, eye height 1.65) ----------
const P = (x, y, z) => [x, AY + y, z];
function fp(p, l, T, bob = 0) { const br = S(T * 1.6) * 0.006, b = bob ? Math.abs(S(T * 8)) * 0.04 * bob : 0, bx = bob ? S(T * 4) * 0.025 * bob : 0; look([p[0] + bx, p[1] + br + b, p[2]], [l[0], l[1] + br * 3 + b * 0.5, l[2]]); }
const L3_ = (a, b, k) => L3(a, b, ease(k));
const SH = [
  [0, (k, T) => fp(P(-1.6, 1.65, 1.6), L3_(P(-3.2, 1.4, 2.35), P(-3.4, 1.3, 2.35), k), T)],
  [E.c1, (k, T) => fp(L3_(P(-0.4, 1.65, 0.8), P(0.1, 1.65, -3.0), prog(k, 0, 0.6)), P(-10, 12, -80), T, k < 0.6 ? 1 : 0)],
  [E.c2, (k, T) => fp(L3_(P(3.0, 1.65, 0.2), P(5.0, 1.75, -0.2), prog(k, 0, 0.35)), L3_(P(6.0, 1.2, -1.2), P(6.6, 0.45, -2.0), prog(k, 0.3, 0.7)), T, k < 0.35 ? 1 : 0)],
  [E.c3, (k, T) => fp(L3_(P(5.0, 1.65, -0.6), P(5.2, 1.6, -0.3), k), L3_(P(6.9, 1.0, 1.0), P(7.0, 1.0, 1.1), k), T)],
  [E.c4, (k, T) => fp(L3_(P(-1.0, 1.65, 1.0), P(-2.4, 1.6, 2.0), prog(k, 0, 0.3)), P(-3.4, 1.25, 2.35), T, k < 0.3 ? 1 : 0)],
  [E.c5, (k, T) => fp(P(-2.5, 1.6, 0.2), T < E.tins - 0.1 ? P(-3.6, 1.0, 0.1) : P(-3.85, 1.6, -2.4), T)],
  [E.c6, (k, T) => fp(P(-1.0, 1.65, 0.6), P(-0.6, 0.9, -1.6), T)],
  [E.c7, (k, T) => { const k2 = ease(prog(T, E.slam, E.slam + 0.4)); fp(P(-1.0, 1.65, 0.6), T < E.slam ? P(-0.6, 0.9, -1.6) : L3(P(1.5, 1.5, 0), P(2.7, 1.4, 4.1), k2), T); }],
  [E.peep - 0.05, (k, T) => { const h = R.H.position; camera.fov = 98; look([h.x, h.y + 1.6, h.z + 0.02], [h.x + 0.1, h.y + 1.0, h.z + 3]); }],
  [E.c8, (k, T) => fp(P(1.8, 1.65, 1.6), P(2.6, 1.2, 4.1), T)],
  [E.optB - 0.1, (k, T) => fp(P(0.4, 1.65, -1.6), P(0.6, 1.4, -6), T)],
  [E.comment - 0.1, (k, T) => fp(P(0.0, 1.65, 1.0), P(0.0, 1.5, -6), T)],
  [E.loop, (k, T) => fp(P(-1.6, 1.65, 1.6), P(-3.2, 1.4, 2.35), T)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
let PHK = '';
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  // outside: fires flicker, pterosaurs circle, the long neck walks
  R.fires.forEach((f, i) => f.material.opacity = 0.6 + 0.3 * S(T * 7 + i * 3)); R.fireL.intensity = 4 + 1.5 * S(T * 5);
  R.brach.position.x = -40 + T * 1.6; walkDino(R.brach, T * 1.6, 1, 'b'); R.pteros.forEach((p, i) => { const a = T * 0.3 + i * 1.3; p.position.set(S(a) * 40 - 10, 60 + i * 6, -110 + C(a) * 30); p.rotation.set(0, a + PI / 2, -0.3); p.userData.wings.forEach((w, j) => w.rotation.z = (j ? -1 : 1) * S(T * 4 + i) * 0.5); });
  // water: tap runs from "fill", bath rises
  const run = !loop && (ci === 2 && T > E.fill - 0.1 || ci === 3); R.stream.visible = run; R.tapH.rotation.y = run ? 1.2 : 0; const lvl = ci === 2 ? prog(T, E.fill, E.c3) * 0.35 : ci > 2 && !loop ? 0.35 + (ci === 3 ? prog(T, E.c3, E.c4) * 0.12 : 0.12) : 0; R.water.position.y = 0.1 + lvl; R.stream.scale.y = 0.85 - lvl; R.stream.position.y = 0.95 - (0.85 - lvl) / 2;
  // fridge LED off (power out); fresh food gets eaten
  R.fridgeLED.visible = false; R.fresh.forEach((f, i) => f.visible = !(ci === 5 && i === 2 && T > AT(5, 'eat') + 0.6 || ci > 5 && i === 2 && !loop));
  // front door slams
  const sl = ci === 7 && T > E.slam ? Math.max(0, 1 - (T - E.slam) / 0.5) : 0; R.door.rotation.y = -0.03 * sl * S(T * 60); R.door.position.z = 4.04 - 0.03 * sl;
  // raptor in the corridor
  R.rap.visible = ci === 7 && T >= E.peep - 0.05; if (R.rap.visible) { walkDino(R.rap, T * 2, 0.2, 'r'); R.rap.userData.jaw.rotation.x = 0.4 + 0.2 * S(T * 9); R.rap.userData.head.rotation.y = 0.3 * S(T * 2.2); } R.emer.intensity = 4 + 3 * (Math.floor(T * 3) % 2);
  // torch: on until "torch off", back on at the slam
  const torchOn = !loop && !(ci === 6 && T > E.torch + 0.1) && !(ci === 7 && T < E.slam + 0.2) && ci !== 8 || loop; R.torch.intensity = torchOn && !(ci === 7 && T >= E.peep - 0.05) ? 7 : 0;
  // hands
  const hr = R.hR, hl = R.hL; hr.visible = hl.visible = false; R.phone.visible = false; if (loop) { hr.visible = true; hr.position.set(0.1, -0.2, -0.4); hr.rotation.set(0.25, 0, 0); return; }
  if (ci <= 1 || ci === 4 || ci === 7 && T < E.peep - 0.05) { hr.visible = true; const s = S(T * 8) * (ci === 1 ? 1 : 0.2); hr.position.set(0.1, -0.2 + s * 0.02, -0.4); hr.rotation.set(0.25, 0, 0); }
  if (ci === 2 && T > E.fill - 0.4) { hl.visible = true; const r_ = ease(prog(T, E.fill - 0.4, E.fill)); hl.position.set(-0.06 + 0.06 * r_, -0.17 + 0.03 * r_, -0.34 - 0.1 * r_); hl.rotation.set(0.6 - 0.5 * r_, -0.3, 0.5 * r_); }
  if (ci === 4) { hl.visible = true; const reach = ease(prog(T, E.c4 + 0.6, E.keep)) * (1 - ease(prog(T, E.keep, E.keep + 0.4))); hl.position.set(-0.07, -0.16 + 0.05 * reach, -0.34 - 0.18 * reach); hl.rotation.set(0.3 - 0.2 * reach, -0.4, 0.2); }
  if (ci === 5 && T < E.tins - 0.1) { hl.visible = true; const g_ = ease(prog(T, AT(5, 'eat'), AT(5, 'eat') + 0.6)); hl.position.set(-0.06, -0.17 + 0.04 * g_, -0.34 - 0.12 * g_); hl.rotation.set(0.4, -0.3, 0.1); }
  if (ci === 6) { R.phone.visible = true; hr.visible = false; hl.visible = true; const tap = T > E.low - 0.15 && T < E.low + 0.15 || T > E.torch - 0.1 && T < E.torch + 0.2; hl.position.set(-0.075 + (tap ? 0.02 : 0), -0.15 + (tap ? 0.02 : 0), -0.3); hl.rotation.set(0.7, -0.5, 0); }
  const pct = 12, low = !loop && (ci === 6 && T > E.low || ci > 6); const k_ = pct + (low ? 'L' : ''); if (k_ !== PHK) { drawPhone(pct, low); PHK = k_; } }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 66; anim(T); sh[1](prog(T, t0, t1), T); camera.updateProjectionMatrix();
  const ci = T >= E.loop ? 0 : CLI(T); if (ci === 7 && T > E.slam && T < E.slam + 0.4) { const k = 1 - (T - E.slam) / 0.4; camera.position.x += 0.04 * k * S(T * 80); camera.rotation.z += 0.02 * k * S(T * 70); } return { si, t0 }; }
