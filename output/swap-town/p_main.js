
// ---------- mood / lighting ----------
const MOODS = {
  day: { bg: '#8fd3ff', fog: '#cfeaff', f0: 60, f1: 220, hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [14, 26, 12], win: 0, hs: '#cfe9ff' },
  eve: { bg: '#f6a86e', fog: '#f8c59a', f0: 50, f1: 200, hemi: 0.8, sun: 2.2, sc: '#ffae6a', off: [-26, 9, 10], win: 0.9, hs: '#ffc79a' },
  dawn: { bg: '#ffd7b0', fog: '#ffe6cc', f0: 50, f1: 200, hemi: 0.95, sun: 2.2, sc: '#ffd2a0', off: [26, 10, 8], win: 0.4, hs: '#ffe2c4' },
  night: { bg: '#0e1733', fog: '#0e1733', f0: 30, f1: 130, hemi: 0.32, sun: 0.7, sc: '#8fa8ff', off: [-10, 24, 14], win: 1.4, hs: '#4a5a8a' },
  inside: { bg: '#0e1733', fog: '#0e1733', f0: 40, f1: 140, hemi: 0.18, sun: 0.0, sc: '#8fa8ff', off: [-10, 24, 14], win: 1.2, hs: '#4a5a8a' },
};
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = M.f0; scene.fog.far = M.f1; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc);
  sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); WINM.forEach(w => w.emissiveIntensity = M.win); amb.intensity = m === 'night' || m === 'inside' ? 0.12 : 0.25; }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];
function clockT(hh, mm) { R.hM.rotation.z = -mm / 60 * 2 * PI; R.hH.rotation.z = -((hh % 12) + mm / 60) / 12 * 2 * PI; R.mHands.rotation.z = ((hh % 12) + mm / 60) / 12 * 2 * PI; }

// ---------- shots: [start, mood, focus point, camera fn] ----------
const O = [0, 0, 0];
const SH = [
  [0, 'day', O, (k, T) => dolly([9, 5.2, 16], [7.4, 4.8, 13.2], [0, 3.4, -0.5], [0, 3.6, -1], k, T)],
  [E.except0 - 0.1, 'day', O, (k, T) => dolly([0.7, 2.1, 1.8], [0.5, 2.2, 0.9], [0, 2.4, -2.4], [0, 2.4, -2.4], k, T)],
  [E.now0 - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.6, 5.4), P(MR, 0, 2.4, 4.0), P(MR, 0, 2.3, -0.6), P(MR, 0, 2.3, -0.6), k, T)],
  [E.wake, 'day', BR, (k, T) => dolly(P(BR, 2.0, 2.3, 3.4), P(BR, 1.6, 2.1, 2.6), P(BR, -1.2, 1.3, -1.5), P(BR, -1.3, 1.5, -1.5), k, T)],
  [E.dadB - 0.1, 'day', BK, (k, T) => dolly(P(BK, 0, 2.5, 6.2), P(BK, 0, 2.4, 4.8), P(BK, 0, 1.9, -0.2), P(BK, 0, 2.0, -0.2), k, T)],
  [E.four - 0.1, 'day', BK, (k, T) => dolly(P(BK, 2.8, 2.3, 4.6), P(BK, 2.2, 2.6, 4.2), P(BK, 0, 1.4, 1.1), P(BK, 0, 1.7, 1.0), k, T)],
  [E.toast - 0.1, 'day', BK, (k, T) => dolly(P(BK, 1.2, 2.4, 2.9), P(BK, 1.0, 2.4, 2.4), P(BK, 0.5, 2.1, 0), P(BK, 0.5, 2.1, 0), k, T)],
  [E.teach, 'day', CR, (k, T) => dolly(P(CR, 0, 2.3, 5.6), P(CR, 0, 2.0, 3.6), P(CR, 0, 1.6, -2.2), P(CR, 0, 1.6, -2.2), k, T)],
  [E.hw - 0.1, 'day', CR, (k, T) => dolly(P(CR, 2.0, 2.2, 1.6), P(CR, 1.6, 2.3, 1.2), P(CR, -0.4, 2.0, -3.4), P(CR, -0.4, 2.1, -3.4), k, T)],
  [E.wed, 'day', WD, (k, T) => dolly(P(WD, 0, 2.4, 7.4), P(WD, 0, 2.2, 5.0), P(WD, 0, 2.0, -1.4), P(WD, 0, 2.0, -1.4), k, T)],
  [E.post - 0.1, 'day', WD, (k, T) => dolly(P(WD, 0.7, 2.6, 2.0), P(WD, 0.6, 2.5, 1.4), P(WD, 0.4, 2.3, -1.2), P(WD, 0.4, 2.4, -1.2), k, T)],
  [E.rule, 'eve', O, (k, T) => dolly([0, 9, 23], [0, 7.5, 19], [0, 2.5, 0], [0, 3, 0], k, T)],
  [E.bed - 0.1, 'eve', O, (k, T) => dolly([0, 9.2, 9], [0, 9.2, 6.5], [0, 9.2, -6], [0, 9.2, -6], k, T)],
  [E.who - 0.1, 'day', O, (k, T) => dolly([-5, 4.5, 14], [-4, 4, 12], [-1, 1.6, 2], [-1, 1.6, 2], k, T)],
  [E.hale, 'day', O, (k, T) => dolly([0.4, 2.2, 5.6], [0.2, 2.3, 3.4], [0, 2.4, -2.4], [0, 2.4, -2.4], k, T)],
  [E.every5 - 0.1, 'day', O, (k, T) => dolly([0, 13, 14], [0, 15, 11], [0, 1, 1], [0, 1, 0.5], k, T)],
  [E.never - 0.1, 'day', O, (k, T) => dolly([2.4, 1.3, 2.4], [2.0, 1.2, 1.8], [-0.3, 4.6, -3.5], [-0.3, 5.4, -3.5], k, T)],
  [E.leo, 'inside', BS, (k, T) => dolly(P(BS, 0, 1.7, 4.0), P(BS, 0, 1.6, 2.8), P(BS, 0, 1.3, -0.6), P(BS, 0, 1.4, -0.6), k, T)],
  [E.base - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 2.6, 2.6, 2.8), P(BS, 2.2, 2.4, 2.4), P(BS, 0, 1.0, -0.6), P(BS, 0, 1.1, -0.6), k, T)],
  [E.eyes - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 0, 1.62, 1.3), P(BS, 0, 1.62, 0.75), P(BS, 0, 1.6, -0.6), P(BS, 0, 1.6, -0.6), k, T)],
  [E.swap7, 'dawn', O, (k, T) => dolly([-9, 5, 15], [-7, 4.6, 12.5], [0, 3.2, 0], [0, 3.2, 0], k, T)],
  [E.exLeo - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 1.4, 1.8, 2.6), P(BS, 1.1, 1.7, 2.1), P(BS, 0, 1.4, -0.6), P(BS, 0, 1.4, -0.6), k, T)],
  [E.patrol - 0.1, 'day', O, (k, T) => dolly([6, 2.4, 12], [5, 2.4, 10.5], [1.5, 1.8, 6], [1, 1.8, 4], k, T)],
  [E.drag - 0.1, 'day', O, (k, T) => dolly([3.5, 2.6, 9], [2.0, 2.6, 6.2], [0, 2.2, -2], [0, 2.2, -3], k, T)],
  [E.like, 'night', O, (k, T) => dolly([2.5, 1.0, 10.5], [2.2, 1.0, 9.8], [0, 8, -6], [0, 8.5, -6], k, T)],
  [E.after - 0.1, 'night', O, (k, T) => dolly([0.7, 1.5, 3.6], [0.5, 1.45, 4.2], [0, 1.3, 7], [0, 1.3, 7], k, T)],
  [E.mum, 'day', KT, (k, T) => dolly(P(KT, 0.4, 2.3, 4.6), P(KT, 0.3, 2.2, 3.6), P(KT, -0.5, 1.9, -1), P(KT, -0.5, 1.9, -1), k, T)],
  [E.mondays - 0.1, 'day', KT, (k, T) => dolly(P(KT, 0.2, 2.3, 2.2), P(KT, 0.1, 2.3, 1.8), P(KT, -0.6, 2.3, -1), P(KT, -0.6, 2.3, -1), k, T)],
  [E.mayor - 0.1, 'day', O, (k, T) => dolly([-2.6, 1.7, 11], [-2.8, 1.6, 9.6], [-3, 1.4, 6.6], [-3, 1.4, 6.6], k, T)],
  [E.shrug - 0.1, 'day', O, (k, T) => dolly([-2.7, 1.5, 8.9], [-2.8, 1.5, 8.5], [-3, 1.4, 6.9], [-3, 1.4, 6.9], k, T)],
  [E.climb, 'inside', ST, (k, T) => { const a = (10 + k * 22) * 0.32, y = (10 + k * 22) * 0.32; look(P(ST, C(a - 1.5) * 2.4, y + 2.8, S(a - 1.5) * 2.4), P(ST, C(a) * 2.2, y + 0.9, S(a) * 2.2), T); }],
  [E.mach, 'inside', MR, (k, T) => dolly(P(MR, 0, 3.4, 7.6), P(MR, 0, 3.0, 5.4), P(MR, 0, 3.6, -3), P(MR, 0, 3.4, -3), k, T)],
  [E.wires - 0.1, 'inside', MR, (k, T) => dolly(P(MR, -3.6, 4.8, 3.6), P(MR, -3.0, 5.2, 3.0), P(MR, 2, 5, -2), P(MR, 2, 5.5, -2), k, T)],
  [E.beds - 0.1, 'night', O, (k, T) => dolly([0, 42, 44], [0, 36, 36], [0, 0, -2], [0, 0, -2], k, T)],
  [E.chair - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.3, 4.4), P(MR, 0, 2.1, 3.2), P(MR, 0, 2.0, -0.6), P(MR, 0, 2.0, -0.6), k, T)],
  [E.strap - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0.7, 1.7, 1.5), P(MR, 0.5, 1.7, 1.2), P(MR, 0, 1.55, -0.5), P(MR, 0, 1.55, -0.5), k, T)],
  [E.dark, 'inside', MR, (k, T) => dolly(P(MR, -0.6, 2.0, 4.6), P(MR, -0.4, 2.0, 4.0), P(MR, 2.4, 2.1, 0.2), P(MR, 2.4, 2.1, 0.4), k, T)],
  [E.wall, 'day', FB, (k, T) => dolly(P(FB, 0, 7, 14), P(FB, 0, 5.5, 10.5), P(FB, 0, 1.2, -1), P(FB, 0, 1.4, -1), k, T)],
  [E.hated - 0.1, 'day', FB, (k, T) => dolly(P(FB, -0.9, 2.6, 7.0), P(FB, -1.1, 2.4, 6.0), P(FB, -2.6, 1.7, 0), P(FB, -2.6, 1.7, 0), k, T)],
  [E.built - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 3.8, 2.4, 3.6), P(MR, 3.4, 2.3, 3.0), P(MR, 0.8, 2.0, -0.8), P(MR, 0.8, 2.0, -0.8), k, T)],
  [E.hate - 0.1, 'day', FB, (k, T) => dolly(P(FB, 0, 3.0, 14), P(FB, 0, 2.6, 11.5), P(FB, 0, 1.5, 5), P(FB, 0, 1.6, 5), k, T)],
  [E.needs, 'inside', MR, (k, T) => dolly(P(MR, 0.4, 2.4, 3.6), P(MR, 0.8, 2.3, 3.0), P(MR, 2.6, 2.2, 1.0), P(MR, 2.6, 2.2, 1.0), k, T)],
  [E.old - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 1.2, 2.1, 2.7), P(MR, 1.4, 2.1, 2.4), P(MR, 2.6, 2.0, 1.0), P(MR, 2.6, 2.0, 1.0), k, T)],
  [E.newp - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 3.6, 2.5, 2.0), P(MR, 3.4, 2.4, 1.8), P(MR, -1.6, 1.4, 1.4), P(MR, -1.6, 1.4, 1.4), k, T)],
  [E.shake, 'inside', MR, (k, T) => dolly(P(MR, 0.5, 1.7, 1.5), P(MR, 0.4, 1.7, 1.2), P(MR, 0, 1.55, -0.5), P(MR, 0, 1.55, -0.5), k, T)],
  [E.choice - 0.1, 'inside', MR, (k, T) => dolly(P(MR, -0.6, 2.8, 6.2), P(MR, -0.6, 2.6, 5.2), P(MR, -1, 1.8, -1.4), P(MR, -1, 1.8, -1.4), k, T)],
  [E.unplug - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0.4, 2.1, 0.8), P(MR, 0.0, 2.0, 0.4), P(MR, -2.3, 1.4, -2.2), P(MR, -2.3, 1.4, -2.2), k, T)],
  [E.place - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.3, 3.6), P(MR, 0, 2.1, 2.8), P(MR, 0, 1.9, -0.6), P(MR, 0, 1.9, -0.6), k, T)],
  [E.dadwk, 'day', BR, (k, T) => dolly(P(BR, 1.8, 2.3, 3.2), P(BR, 1.5, 2.2, 2.6), P(BR, -1.3, 1.5, -1.5), P(BR, -1.3, 1.6, -1.5), k, T)],
  [E.tired - 0.1, 'day', BR, (k, T) => dolly(P(BR, -0.3, 2.3, 0.9), P(BR, -0.5, 2.3, 0.6), P(BR, -1.4, 2.2, -1.6), P(BR, -1.4, 2.2, -1.6), k, T)],
  [E.hug - 0.1, 'day', KT, (k, T) => dolly(P(KT, 2.0, 1.9, 3.6), P(KT, 1.6, 1.9, 3.0), P(KT, -0.2, 1.5, -0.7), P(KT, -0.2, 1.5, -0.7), k, T)],
  [E.unstrap, 'inside', MR, (k, T) => dolly(P(MR, 1.0, 2.3, 3.8), P(MR, 0.8, 2.2, 3.2), P(MR, 0, 1.6, -0.5), P(MR, 0, 1.6, -0.5), k, T)],
  [E.sit - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.0, 2.6), P(MR, 0, 2.4, 4.4), P(MR, 0, 2.0, -0.6), P(MR, 0, 2.4, -0.6), k, T)],
  [E.q, 'inside', MR, (k, T) => dolly(P(MR, 0.3, 1.9, 2.0), P(MR, 0.2, 1.9, 1.6), P(MR, 0, 1.8, -0.6), P(MR, 0, 1.8, -0.6), k, T)],
  [E.sunday - 0.1, 'night', O, (k, T) => dolly([7, 4, 17], [6, 4.4, 15], [0, 6, -5], [0, 7, -5], k, T)],
  [E.loop, 'day', O, (k, T) => dolly([9, 5.2, 16], [9, 5.2, 16], [0, 3.4, -0.5], [0, 3.4, -0.5], 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

// ---------- animation ----------
function orbsTown(T, on, pairs, phase0 = 0) { ORBS.forEach((o, i) => { const pr = pairs[i % pairs.length]; if (!on || !pr) { o.material.opacity = 0; o.userData.core.material.opacity = 0; o.position.y = -50; o.userData.core.position.y = -50; o.userData.trail.forEach(t_ => t_.position.y = -50); return; }
  const ph = ((T * 0.55 + i / ORBS.length + phase0) % 1); const a = pr[0].position, b = pr[1].position; const ha = 2.6 * pr[0].scale.x, hb = 2.6 * pr[1].scale.x;
  const pos = q => [lerp(a.x, b.x, q), lerp(ha, hb, q) + S(q * PI) * 3.2, lerp(a.z, b.z, q)]; const [x, y, z] = pos(ph); o.position.set(x, y, z); o.userData.core.position.set(x, y, z); const op = S(ph * PI) ** 0.4; o.material.opacity = 0.95 * op; o.userData.core.material.opacity = op; o.userData.trail.forEach((t_, j) => { const q = Math.max(0, ph - (j + 1) * 0.035); t_.position.set(...pos(q)); t_.material.opacity = 0.6 * op * (1 - j * 0.22); }); }); }
function anim(T, si) {
  const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // town
  const night = SH[si][1] === 'night';
  R.folk.forEach((p, i) => { const b = p.userData.base || (p.userData.base = [p.position.x, p.position.z, p.rotation.y]); p.visible = !night && !(cl === 7 && T > E.patrol - 0.1); p.position.set(b[0], 0, b[1]); p.rotation.y = b[2];
    p.userData.u = 0; if (cl === 0 || cl === 5 && T > E.every5 || cl === 7 && T < E.patrol) { setFace(p, i % 3 === 0 ? 'shock' : i % 3 === 1 ? 'grin' : 'smile'); p.userData.armL.rotation.x = -0.4 - 0.3 * S(Tt * 3 + i); p.userData.armR.rotation.x = -0.4 - 0.3 * S(Tt * 3 + i + 1); }
    else if (cl === 4 && T < E.who - 0.1) { const dir = Math.atan2(b[0], b[1]); const d = prog(T, E.rule, E.who) * 4; p.position.set(b[0] + S(dir) * d, 0, b[1] + C(dir) * d); p.rotation.y = dir; walk(p, T * 9 + i, 0.7); }
    else { p.userData.armL.rotation.z = -0.05; p.userData.head.rotation.y = 0.2 * S(T * 0.7 + i); } });
  R.hale.visible = !(cl === 7 && T > E.patrol) && cl !== 8 && !night; R.hale.position.set(0, 0, -2.4); R.hale.rotation.y = 0; R.hale.userData.body.rotation.x = 0.12;
  if (cl === 5 && T > E.never - 0.1) R.hale.userData.head.rotation.x = -0.45;
  R.haleRing && (R.haleRing.material.opacity = (cl === 5 && T > E.every5 - 0.1) || cl === 0 && T > E.except0 - 0.1 ? 0.55 + 0.15 * S(T * 4) : 0);
  const swapOn = (cl === 0 && !loop) || loop || (cl === 5 && T > E.every5 - 0.1) || (cl === 7 && T < E.patrol);
  const F = R.folk; orbsTown(Tt, swapOn, [[F[0], F[4]], [F[4], F[1]], [F[1], F[7]], [F[2], F[9]], [F[9], F[5]], [F[3], F[8]], [F[8], F[11]], [F[6], F[10]], [F[10], F[2]], [F[11], F[3]], [F[5], F[0]], [F[7], F[6]]]);
  // clock
  if (cl === 4) clockT(6, 55 + 4 * prog(T, E.rule, E.who)); else if (night || cl >= 10) clockT(11, 59); else if (cl === 7 && T > E.patrol) clockT(8, 0); else clockT(7, 0);
  R.tDoor.rotation.y = cl === 7 && T > E.drag ? -1.4 * (1 - prog(T, E.like - 0.6, E.like - 0.3)) : 0;
  // patrol drag
  const pOn = cl === 7 && T > E.patrol - 0.1; R.patrol.forEach(p => p.visible = pOn); R.leoT.visible = pOn;
  if (pOn) { const k = prog(T, E.patrol, E.like - 0.4); const x = lerp(2.2, 0, k), z = lerp(7.5, -2.0, k), ry = Math.atan2(0 - 2.2, -2.0 - 7.5) * 0 + PI;
    R.leoT.position.set(x, 0, z); R.leoT.rotation.y = ry + PI; R.leoT.userData.armL.rotation.x = -1.2; R.leoT.userData.armR.rotation.x = -1.2; walk(R.leoT, T * 12, 0.3); R.leoT.userData.armL.rotation.x = -1.4; R.leoT.userData.armR.rotation.x = -1.4; setFace(R.leoT, S(T * 20) > 0 ? 'shout' : 'shock');
    R.patrol.forEach((p, j) => { p.position.set(x + (j ? 0.85 : -0.85), 0, z - 0.3); p.rotation.y = ry; walk(p, T * 9 + j, 0.5); (j ? p.userData.armL : p.userData.armR).rotation.x = -1.3; }); }
  R.meT.visible = cl === 8; R.meT.position.set(0, 0, 7); R.meT.rotation.y = PI; setFace(R.meT, T > E.after ? 'angry' : 'neutral'); R.meT.userData.head.rotation.x = T < E.after - 0.1 ? -0.5 : 0;
  R.mayor.visible = cl === 9; R.mayor.userData.armL.rotation.z = cl === 9 && T > E.shrug ? -1.1 : 0; R.mayor.userData.armR.rotation.z = cl === 9 && T > E.shrug ? 1.1 : 0; if (cl === 9 && T > E.shrug) setFace(R.mayor, 'neutral');
  R.net.visible = night && (cl === 11 || cl === 18); R.net.children.forEach((l, i) => l.material.opacity = 0.5 + 0.4 * S(T * 6 + i));
  R.towerGlow.material.opacity = night ? 0.5 + 0.2 * S(T * 3) : 0;
  // bakery
  const nC = cl === 1 ? Math.floor(160 * ease(prog(T, E.four - 0.05, E.four + 1.0))) : 160; R.crois.children.forEach(m => m.visible = m.userData.i < nC && (cl === 1 && T > E.four - 0.1 && T < E.toast - 0.1));
  setFace(R.bakerDad, cl === 1 && T > E.toast - 0.1 ? 'sad' : 'grin'); R.toast.visible = cl === 1 && T > E.toast - 0.1; R.bakerDad.userData.armR.rotation.x = R.toast.visible ? -1.5 : -0.3 * Math.abs(S(T * 5));
  if (R.toast.visible) { R.toast.position.set(-0.05, 2.15, 0.6); R.smoke.forEach((m, i) => { const ph = (T * 0.7 + i / 8) % 1; m.position.set(S(i * 2 + T) * 0.15, 0.35 + ph * 1.4, 0); m.scale.setScalar(0.6 + ph * 1.6); m.material.opacity = 0.55 * (1 - ph); }); }
  // bedroom
  R.youGran.visible = cl === 1 && T < E.dadB - 0.1; R.meDad.visible = cl === 16;
  for (const p of [R.youGran, R.meDad]) { if (!p.visible) continue; p.position.set(-1.4, 0.55, -1.9); p.rotation.y = 0; sitP(p); const up = p === R.youGran ? prog(T, E.wake + 0.9, E.wake + 1.3) : 1; p.userData.body.rotation.x = -1.4 * (1 - up); }
  if (R.youGran.visible) { const awake = T > E.wake + 0.7; setFace(R.youGran, !awake ? 'sleep' : T > E.wake + 1.4 ? 'shock' : 'neutral'); if (T > E.wake + 1.4) { R.youGran.userData.armL.rotation.x = -1.6; R.youGran.userData.armR.rotation.x = -1.6; R.youGran.userData.head.rotation.x = 0.4; } }
  if (R.meDad.visible) { setFace(R.meDad, T > E.tired - 0.1 ? (S(T * 3) > 0.3 ? 'talk' : 'tired') : 'tired'); R.meDad.userData.armR.rotation.x = T > E.tired ? -2.6 : 0; }
  R.alarm.rotation.z = cl === 1 && T < E.wake + 1.2 ? S(T * 60) * 0.12 : 0;
  R.bOrb.position.y = -50;
  // kitchen
  R.mumBig.visible = cl === 9; if (cl === 9) { mouth(R.mumBig, -1, T, 'neutral'); if (T > E.mondays - 0.1 && T < E.mayor) { R.mumBig.userData.armL.rotation.z = -1.0; R.mumBig.userData.armR.rotation.z = 1.0; setFace(R.mumBig, S(T * 18) > 0 ? 'talk' : 'smile'); } }
  R.kDad.visible = R.kMe.visible = cl === 16 && T > E.hug - 0.2; if (R.kMe.visible) { R.kMe.position.set(-0.2, 0, -0.5); R.kMe.rotation.y = -2.2; R.kDad.position.set(-0.75, 0, -0.95); R.kDad.rotation.y = 0.9; for (const p of [R.kMe, R.kDad]) { p.userData.armL.rotation.set(-1.4, 0, 0.5); p.userData.armR.rotation.set(-1.4, 0, -0.5); } setFace(R.kMe, 'smile'); setFace(R.kDad, 'grin'); }
  // classroom
  setFace(R.babyT, cl === 2 && T > E.hw ? 'angry' : 'baby'); R.babyT.userData.armR.rotation.x = cl === 2 && T > E.hw ? -2.2 - 0.3 * S(T * 8) : 0; R.babyT.position.y = 1.0; R.kids.forEach((k, i) => { sitP(k); setFace(k, cl === 2 && T > E.hw + 0.3 ? 'sad' : 'shock'); });
  // wedding
  R.bride.visible = !(cl === 3 && T > E.post - 0.1); R.postBride.visible = !R.bride.visible; [R.bride, R.postBride, R.groom].forEach(p => { p.userData.armL.rotation.x = -0.3; });
  if (R.postBride.visible) setFace(R.groom, 'shock');
  // basement
  R.leoB.position.y = 0.3; sitP(R.leoB); R.bulb.position.x = 0.6 + S(T * 1.6) * 0.15; R.bulbL.position.x = R.bulb.position.x; R.bulbG.position.x = R.bulb.position.x; R.bulbL.intensity = SH[si][3] && SH[si][2] === BS ? 6 : 0;
  R.leoB.userData.body.position.x = (cl === 6 && T > E.eyes) || cl === 7 ? S(T * 40) * 0.01 : 0; setFace(R.leoB, cl === 7 && T > E.exLeo + 0.6 ? 'shock' : 'wide');
  if (cl === 7 && T > E.exLeo - 0.3 && T < E.patrol) { const k = prog(T, E.exLeo - 0.3, E.exLeo + 0.6); const bx = k < 0.6 ? lerp(-3, 0, k / 0.6) : lerp(0, 2.6, (k - 0.6) / 0.4); const by = k < 0.6 ? lerp(2.8, 1.7, k / 0.6) : lerp(1.7, 3.2, (k - 0.6) / 0.4); R.bOrb.position.set(bx, by, -0.4); R.bOrb.material.opacity = 0.9; }
  // stairs
  if (SH[si][2] === ST) { const kk = prog(T, E.climb, E.mach); const a = (10 + kk * 22) * 0.32, y = (10 + kk * 22) * 0.32; R.meS.position.set(C(a) * 2.2, y + 0.08, S(a) * 2.2); R.meS.rotation.y = -a + PI; walk(R.meS, T * 10, 0.6); R.stairL.intensity = 8; R.stairL.position.set(C(a) * 1, y + 3, S(a) * 1); } else R.stairL.intensity = 0;
  // machine room
  const meChair = (cl === 0 && T > E.now0 - 0.1) || (cl >= 17 && T > E.sit) || cl === 18;
  R.leoC.visible = cl !== 13 && cl !== 0; R.leoC.position.set(0, 0.45, -0.45); sitP(R.leoC); R.leoC.rotation.y = 0;
  if (cl >= 11 && cl <= 16) R.leoC.userData.body.position.x = S(T * 40) * 0.012;
  if (cl === 18 || (cl === 17 && T > E.unstrap + 0.5)) { const k = cl === 18 ? 1 : prog(T, E.unstrap + 0.5, E.unstrap + 1.2); R.leoC.rotation.y = -0.5 * k; R.leoC.userData.legL.rotation.x = R.leoC.userData.legR.rotation.x = -PI / 2 * (1 - k); R.leoC.position.set(lerp(0, 0.95, k), lerp(0.45, 0, k), lerp(-0.45, 0.2, k)); setFace(R.leoC, T > E.sit ? 'sad' : 'shock'); }
  R.straps.forEach(s_ => s_.visible = !(cl === 17 && T > E.unstrap + 0.3) || meChair);
  R.meM.visible = cl !== 13 && (cl >= 11 || (cl === 0 && T > E.now0 - 0.1)); R.meM.rotation.y = 0.5; R.meM.position.set(-1.6, 0, 1.4);
  if (cl === 17 && T < E.sit) { const k = prog(T, E.unstrap, E.unstrap + 0.5); R.meM.position.set(lerp(-1.6, -0.9, k), 0, lerp(1.4, 0.3, k)); R.meM.rotation.y = 0.9; R.meM.userData.armR.rotation.x = -1.2; }
  if (meChair) { R.meM.position.set(0, 0.45, -0.45); R.meM.rotation.y = 0; sitP(R.meM); setFace(R.meM, cl === 18 && T > E.sunday ? 'wink' : 'neutral'); R.meM.userData.armL.rotation.x = R.meM.userData.armR.rotation.x = -PI / 2 * 0.6; }
  if (cl === 15 && T > E.unplug - 0.1 && T < E.place - 0.1) { R.meM.position.set(-2.0, 0, -1.6); R.meM.rotation.y = -2.55; R.meM.userData.armR.rotation.x = -1.7 - 0.2 * prog(T, E.unplug, E.place); }
  R.lever.rotation.x = 0;
  const glowK = meChair ? (cl === 0 ? 1 : 0.4 + 0.6 * prog(T, E.sit, E.sit + 1.2)) : (cl === 11 && T > E.wires - 0.1 ? 0.6 + 0.3 * S(T * 5) : 0.35);
  R.wireM.emissiveIntensity = cl === 13 ? 0.05 : glowK * (0.8 + 0.2 * S(T * 9)); R.crownG.material.opacity = cl === 13 ? 0 : glowK * 0.9; R.crown.position.y = 3.3 - (meChair ? 0.6 : 0.25);
  R.gears.forEach((g, i) => g.rotation.z = T * (i % 2 ? 0.5 : -0.5) / g.userData.r);
  R.mOrbs.forEach((o, i) => { if (!meChair && !(cl === 11)) { o.position.y = -50; return; } const ph = (T * 0.8 + i / 8) % 1; const a = i / 8 * 2 * PI; o.position.set(MR[0] + C(a) * 6 * (1 - ph), 3.0 + 3 * (1 - ph) + 0.6 * ph, MR[2] - 0.75 + S(a) * 4 * (1 - ph)); o.position.sub(R.mach.position); o.material.opacity = 0.8 * S(ph * PI); });
  R.hale2.visible = cl >= 12 && cl !== 13; R.youngHale.visible = cl === 13; R.youngHale.userData.armR.rotation.x = -1.2 - 0.4 * Math.abs(S(T * 6)); R.youngHale.rotation.y = -0.6; R.youngHale.position.set(1.4, 0, 0.2);
  if (R.hale2.visible) { R.hale2.position.set(2.6, 0, 1.0); R.hale2.rotation.y = -0.9; R.hale2.userData.body.rotation.x = 0.15;
    if (cl === 12) { const k = prog(T, E.dark, E.dark + 1.6); R.hale2.position.set(lerp(5.4, 2.6, k), 0, lerp(-3.0, 1.0, k)); R.hale2.rotation.y = -0.6 - 0.3 * k; walk(R.hale2, T * 7, 0.4 * (1 - k)); }
    mouth(R.hale2, 14, T, cl === 14 && T > E.old - 0.1 && T < E.newp ? 'tired' : 'neutral'); if (cl === 14 && T > E.old - 0.1 && T < E.newp) R.hale2.userData.body.rotation.x = 0.35 + 0.08 * S(T * 9);
    if (cl === 14 && T > E.newp - 0.1) R.hale2.rotation.y = -1.4; if (cl >= 17) R.hale2.rotation.y = -1.1; }
  R.faceL.intensity = 30; R.backFace.material[1].emissiveIntensity = 0.9;
  // flashback wall
  const peace = cl === 13 && T > E.hate - 0.1; R.fbWall.visible = !peace; R.angry.forEach((p, i) => { if (peace) { setFace(p, i % 2 ? 'grin' : 'smile'); p.userData.armR.rotation.x = -0.6 - 0.4 * Math.abs(S(T * 4 + i)); return; } p.userData.armR.rotation.x = -2.6 - 0.3 * Math.abs(S(T * 7 + i)); p.userData.armL.rotation.x = -0.3; setFace(p, S(T * 9 + i) > 0 ? 'shout' : 'angry'); });
  R.hugA.visible = R.hugB.visible = cl === 13 && T > E.hate - 0.1; for (const p of [R.hugA, R.hugB]) { p.userData.armL.rotation.set(-1.4, 0, 0.5); p.userData.armR.rotation.set(-1.4, 0, -0.5); }
  R.hugA.position.x = FB[0] - 0.42 - R.fb.position.x; R.hugB.position.x = 0.42;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  if (sh[2] === O) { sun.target.position.set(camera.position.x * 0.5, 0, camera.position.z * 0.5 - 2); sun.position.copy(sun.target.position).add(new T3.Vector3(...MOODS[sh[1]].off)); }
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 4.0 && d < 32; });
  return { si, t0 }; }
