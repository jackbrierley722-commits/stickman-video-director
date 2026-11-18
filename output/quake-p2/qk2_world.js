
// ---------- timing ----------
const E = { c1: CL[1].start, shirt: AT(1, 'shirt'), c2: CL[2].start, cleanest: AT(2, 'and'), c3: CL[3].start, hits: AT(3, 'hits'), c4: CL[4].start, grab: AT(4, 'grab'), c5: CL[5].start, coming: AT(5, "it's"), c6: CL[6].start, touch: AT(6, 'touch'), cool: AT(6, "it's"),
  c7: CL[7].start, optB: AT(7, 'option', 1), comment: AT(7, 'comment') };
E.loop = TM.total - 0.4;
// aftershock strength (0..1)
function quake(T) { if (T >= E.loop || T < E.hits - 0.15) return 0; const d = T - (E.hits - 0.15); return d < 0.3 ? d / 0.3 : Math.max(0, 1 - (d - 0.3) / (E.c5 - 0.4 - E.hits)); }
const shk = (T, f, p) => S(T * f + p) * 0.6 + S(T * f * 2.3 + p * 1.7) * 0.4;
function signTex(t, bg, fg = '#fff', sz = 40) { return ctex(256, 96, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = `${sz}px Russo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
const FLOOR = T => { const ci = T >= E.loop ? 0 : CLI(T); return ci <= 2 ? 20 : ci <= 4 ? 12 : 4; };
// stair flights: f1 x=+0.75 going -z (y 0 -> -1.5), f2 x=-0.75 going +z (y -1.5 -> -3)
function onFlight(f, s) { s = clamp(s); return f === 1 ? [0.75, -1.5 * s, lerp(1.6, -1.6, s)] : [-0.75, -1.5 - 1.5 * s, lerp(-1.6, 1.6, s)]; }
function build() {
  R.hemi = new T3.HemisphereLight('#dfe6f0', '#4a4440', 0.7); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff0dc', 0.8); R.sun.position.set(3, 9, 6); scene.add(R.sun); scene.add(R.sun.target);
  scene.background = new T3.Color('#1a1c22');
  const G = R.G = new T3.Group(); scene.add(G); const conc = SM('#a8a49c', { roughness: 0.95 }), conc2 = SM('#8e8a82', { roughness: 0.95 }), step = SM('#b8b2a6', { roughness: 0.9 }), nose = SM('#e8c020'), rail = SM('#c83a2a', { roughness: 0.4, metalness: 0.3 });
  for (let lv = 0; lv < 3; lv++) { const y0 = -3 * lv;
    add(G, Bx(3, 0.2, 0.9), conc, 0, y0 - 0.1, 2.05); add(G, Bx(3, 0.2, 0.9), conc, 0, y0 - 1.6, -2.05);
    for (let i = 0; i < 10; i++) { const z1 = 1.6 - i * 0.32, z2 = -1.6 + i * 0.32; add(G, Bx(1.4, 0.15, 0.32), step, 0.75, y0 - 0.075 - i * 0.15, z1 - 0.16); add(G, Bx(1.4, 0.02, 0.04), nose, 0.75, y0 - 0.01 - i * 0.15, z1 - 0.02, false); add(G, Bx(1.4, 0.15, 0.32), step, -0.75, y0 - 1.575 - i * 0.15, z2 + 0.16); add(G, Bx(1.4, 0.02, 0.04), nose, -0.75, y0 - 1.51 - i * 0.15, z2 + 0.02, false); }
    // undersides so flights read as solid slabs
    const u1 = add(G, Bx(1.4, 0.12, 3.6), conc2, 0.75, y0 - 0.85, 0); u1.rotation.x = -Math.atan2(1.5, 3.2); const u2 = add(G, Bx(1.4, 0.12, 3.6), conc2, -0.75, y0 - 2.35, 0); u2.rotation.x = Math.atan2(1.5, 3.2);
    // centre rail (red, sloped) on both flights
    rod(G, [0.06, y0 + 0.9, 1.6], [0.06, y0 - 0.6, -1.6], 0.025, rail); rod(G, [-0.06, y0 - 0.6, -1.6], [-0.06, y0 - 2.1, 1.6], 0.025, rail); for (const z of [-1.2, 0, 1.2]) { const s = (1.6 - z) / 3.2; add(G, Cy(0.015, 0.015, 0.9, 6), rail, 0.06, y0 + 0.45 - 1.5 * s, z); add(G, Cy(0.015, 0.015, 0.9, 6), rail, -0.06, y0 - 1.05 - 1.5 * (1 - s), z); }
    // walls

    // emergency light
    add(G, Bx(0.3, 0.12, 0.1), BM('#fff2c8'), -0.8, y0 + 2.2, 2.45, false); const pl = new T3.PointLight('#ffe8c0', 5, 7, 1.3); pl.position.set(-0.6, y0 + 2.0, 2.0); G.add(pl);
    add(G, Bx(0.3, 0.12, 0.1), BM('#fff2c8'), 0.8, y0 + 0.7, -2.45, false); }
  add(G, Bx(0.15, 13, 5.2), conc2, 1.55, -3, 0); add(G, Bx(0.15, 13, 5.2), conc2, -1.55, -3, 0); add(G, Bx(3.2, 13, 0.15), conc, 0, -3, -2.55); add(G, Bx(3.2, 13, 0.15), conc, 0, -3, 2.55); add(G, Bx(3.2, 0.15, 5.2), conc, 0, 3.0, 0);
  // door on the top landing (pivot at x=0.2)
  R.door = new T3.Group(); R.door.position.set(0.2, 0, 2.47); G.add(R.door); add(R.door, Bx(1.0, 2.1, 0.06), SM('#5a6a7a'), 0.5, 1.05, 0); R.handle = add(R.door, Bx(0.16, 0.04, 0.05), SM('#c8ccd2', { metalness: 0.7 }), 0.85, 1.05, -0.05);
  add(G, new T3.PlaneGeometry(0.62, 0.24), BM('#ffffff', { map: signTex('EXIT', '#1a9a4a', '#fff', 40) }), 0.7, 2.35, 2.46, false).rotation.y = PI;
  R.signC = document.createElement('canvas'); R.signC.width = 128; R.signC.height = 160; R.signT = new T3.CanvasTexture(R.signC); R.signT.colorSpace = T3.SRGBColorSpace; R.signN = -1;
  R.sign = add(G, new T3.PlaneGeometry(0.42, 0.52), BM('#ffffff', { map: R.signT }), -0.35, 1.55, 2.46, false); R.sign.rotation.y = PI;
  R.alarm = add(G, Bx(0.16, 0.2, 0.08), SM('#d8282a', { emissive: '#ff2020', emissiveIntensity: 0 }), -1.2, 2.1, 2.46); R.alarmL = new T3.PointLight('#ff2a2a', 0, 8, 1.4); R.alarmL.position.set(-0.8, 2.0, 1.6); G.add(R.alarmL);
  // smoke: a layer under the ceiling + smoke rising from below
  R.layer = []; const r = rng(5); for (let i = 0; i < 60; i++) { const s = spr(G, GLOW, '#2a2a30', 2.6, 0, 0, 0, 0, T3.NormalBlending); s.userData = { x: -1.4 + r() * 2.8, z: -2.4 + r() * 4.8, y: r(), ph: r() }; R.layer.push(s); }
  R.rise = []; for (let i = 0; i < 40; i++) { const s = spr(G, GLOW, '#2e2e34', 2.0, 0, 0, 0, 0, T3.NormalBlending); s.userData = { x: -0.9 + r() * 1.8, z: -1.6 + r() * 3.2, ph: r() }; R.rise.push(s); }
  R.you = human({ top: '#3a6ad8', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you);
  R.mask = add(R.you.userData.head, Sp(0.1, 14, 10), SM('#3a6ad8'), 0, -0.07, 0.07); R.mask.scale.set(1.25, 0.75, 0.9);
}
function drawSign(n) { if (R.signN === n) return; R.signN = n; const c = R.signC.getContext('2d'); c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, 128, 160); c.fillStyle = '#1a1c22'; c.fillRect(6, 6, 116, 148); c.fillStyle = '#ffe04a'; c.font = '26px Russo'; c.textAlign = 'center'; c.fillText('FLOOR', 64, 44); c.font = '78px Russo'; c.fillText(String(n), 64, 128); R.signT.needsUpdate = true; }
// ---------- shots ----------
const YP = () => R.you.position;
const SH = [
  [0, (k, T) => { const p = YP(); TR(k, [0.8, -0.45, -2.25], [0.75, -0.5, -2.15], [p.x, p.y + 0.95, p.z], [p.x, p.y + 0.95, p.z]); }],
  [E.c1, (k, T) => TR(k, [-1.1, 1.5, 0.4], [-1.05, 1.45, 0.5], [1.0, 1.0, 2.3], [0.8, 0.8, 1.8])],
  [E.shirt - 0.15, (k, T) => { const p = YP(); TR(k, [p.x - 0.2, p.y + 1.1, p.z - 1.7], [p.x - 0.2, p.y + 1.05, p.z - 1.55], [p.x, p.y + 1.05, p.z], [p.x, p.y + 1.05, p.z]); }],
  [E.c2, (k, T) => { const p = YP(); TR(k, [-1.4, p.y + 0.9, p.z + 0.5], [-1.4, p.y + 0.8, p.z + 0.3], [p.x, p.y + 1.0, p.z], [p.x, p.y + 1.0, p.z]); }],
  [E.c3, (k, T) => TR(k, [-0.4, 0.9, 0.6], [-0.4, 0.85, 0.8], [-0.2, 1.4, 2.5], [-0.2, 1.3, 2.5])],
  [E.hits - 0.1, (k, T) => { const p = YP(); TR(k, [0.7, -0.4, -2.25], [0.7, -0.45, -2.15], [p.x, p.y + 0.8, p.z], [p.x, p.y + 0.8, p.z]); }],
  [E.c4, (k, T) => { const p = YP(); TR(k, [-1.4, p.y + 1.0, p.z - 0.4], [-1.4, p.y + 0.95, p.z - 0.2], [p.x - 0.3, p.y + 0.75, p.z], [p.x - 0.3, p.y + 0.75, p.z]); }],
  [E.c5, (k, T) => TR(k, [0.0, 1.9, -2.2], [0.0, 1.8, -2.1], [0.0, -2.4, 0.3], [0.0, -2.8, 0.6])],
  [E.c6, (k, T) => TR(k, [-1.3, 1.4, 0.9], [-1.25, 1.35, 1.0], [0.6, 0.9, 2.3], [0.6, 0.9, 2.3])],
  [E.touch - 0.1, (k, T) => TR(k, [1.4, 1.3, 1.45], [1.38, 1.25, 1.55], [0.75, 1.0, 2.45], [0.75, 1.0, 2.45])],
  [E.c7, (k, T) => TR(k, [-1.3, 1.5, 0.5], [-1.3, 1.5, 0.6], [0.6, 1.0, 2.4], [0.6, 1.0, 2.4])],
  [E.optB - 0.1, (k, T) => TR(k, [1.1, 1.6, 2.0], [1.0, 1.5, 1.8], [-0.3, -2.2, -1.0], [-0.3, -2.5, -0.8])],
  [E.comment - 0.1, (k, T) => TR(k, [-1.3, 1.6, 0.0], [-1.35, 1.7, -0.3], [0.5, 0.7, 1.9], [0.5, 0.7, 1.9])],
  [E.loop, (k, T) => { const p = YP(); look([0.8, -0.45, -2.25], [p.x, p.y + 0.95, p.z]); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function crouch(p, T, walk) { const u = p.userData; const s = walk ? S(T * 7) : 0; u.legL.rotation.x = -1.2 + 0.3 * s; u.legR.rotation.x = -1.2 - 0.3 * s; u.legL.userData.k.rotation.x = 1.8; u.legR.userData.k.rotation.x = 1.8; u.up.rotation.x = 0.75; u.head.rotation.x = -0.55; p.position.y -= 0.42; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T), q = quake(T); drawSign(FLOOR(T)); const you = R.you, u = you.userData; rest(you); you.visible = true; face(you, 'shock', T);
  // alarm strobe
  const fl = Math.floor(T * 3) % 2 === 0; R.alarm.material.emissiveIntensity = fl ? 1.5 : 0.1; R.alarmL.intensity = fl ? 7 : 0;
  // smoke amounts: ceiling layer thickens with depth, smoke from below on floor 4
  const dens = ci <= 2 || loop ? 0.55 : ci <= 4 ? 0.65 : 0.8; const low = ci <= 2 || loop ? 1.55 : ci <= 4 ? 1.45 : 1.3;
  R.layer.forEach((s, i) => { const d = s.userData; const ph = (T * 0.05 + d.ph) % 1; s.position.set(d.x + 0.3 * S(T * 0.3 + i), low + 0.35 + d.y * 1.2, d.z + 0.2 * C(T * 0.25 + i)); s.scale.setScalar(2.2 + 0.6 * S(ph * PI * 2)); s.material.opacity = Math.min(0.95, dens * 1.3 * (0.6 + 0.25 * S(ph * PI * 2))); });
  const riseOn = !loop && ci >= 5; R.rise.forEach((s, i) => { const d = s.userData; const ph = (T * 0.22 + d.ph) % 1; s.position.set(d.x * (1 - ph * 0.3), -4.2 + ph * 3.8, d.z); s.scale.setScalar(0.9 + ph * 1.8); s.material.opacity = riseOn ? 0.8 * S(ph * PI) * Math.min(1, (T - E.c5) * 1.2 + 0.2) : 0; });
  // door
  R.door.rotation.y = ci === 1 ? -1.5 * (1 - ease(prog(T, E.c1 + 1.2, E.c1 + 1.9))) * ease(prog(T, E.c1, E.c1 + 0.4)) : 0;
  R.mask.visible = loop || ci >= 2 || (ci === 1 && T > E.shirt - 0.05) || ci === 0;
  you.rotation.set(0, PI, 0);
  if (ci === 0 || loop) { const p = onFlight(1, loop ? 0.35 : lerp(0.3, 0.42, prog(T, 0, E.c1))); you.position.set(...p); crouch(you, T, !loop); }
  if (ci === 1) { const w = prog(T, E.c1 + 0.5, E.shirt - 0.2); if (T < E.c1 + 0.5) { you.position.set(0.7, 0, 2.6); you.rotation.y = PI; you.visible = T > E.c1 + 0.25; } else if (w < 1) { you.position.set(0.72, 0, lerp(2.3, 1.75, w)); walkPose(you, T * 9, 0.8); you.rotation.y = PI; } else { you.position.set(...onFlight(1, 0.05 * prog(T, E.shirt, E.c2))); crouch(you, T, false); }
    if (T > E.shirt - 0.15) { const a = ease(prog(T, E.shirt - 0.15, E.shirt + 0.3)); u.armL.rotation.set(-1.1 * a, 0, 0.3 * a); u.armL.userData.e.rotation.x = -2.0 * a; } }
  if (ci === 2) { you.position.set(...onFlight(1, lerp(0.1, 0.65, prog(T, E.c2, E.c3)))); crouch(you, T, true); }
  if (ci === 3 || ci === 4) { const s = ci === 3 ? lerp(0.05, 0.2, prog(T, E.c3, E.hits - 0.1)) : 0.22; you.position.set(...onFlight(1, s)); crouch(you, T, ci === 3 && T < E.hits - 0.1); if (q > 0 || ci === 4) { you.position.y -= 0.12; u.up.rotation.x = 0.8; you.rotation.z = 0.05 * q * shk(T, 13, 1); }
    if (ci === 4 || T > E.hits) { u.armR.rotation.set(-0.7, 0, 0.9); u.armR.userData.e.rotation.x = -0.4; } }
  if (ci === 5) { you.position.set(...onFlight(1, lerp(0.25, 0.4, prog(T, E.c5, E.c6)))); crouch(you, T, true); }
  if (ci >= 6 && !loop) { you.position.set(0.55, 0, 2.05); you.rotation.y = 0; crouch(you, T, false); u.up.rotation.x = 0.35; u.head.rotation.x = 0.1;
    if (ci === 6 && T > E.touch - 0.15) { const a = ease(prog(T, E.touch - 0.15, E.touch + 0.35)); u.armR.rotation.set(-1.5 * a, 0, -0.2 * a); u.armR.userData.e.rotation.x = -0.3 * a; u.armR.userData.h.rotation.y = PI * a; face(you, T > E.cool - 0.1 ? 'neutral' : 'shock', T); }
    if (ci === 7) { you.rotation.y = T > E.optB - 0.1 && T < E.comment - 0.1 ? PI + 0.6 : 0.4; face(you, 'neutral', T); if (T > E.comment - 0.1) you.rotation.y = PI - 0.5; } }
  if (R.mask.visible) { u.mouth.visible = false; } else u.mouth.visible = true;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 74; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const q = quake(T); camera.position.x += q * 0.05 * shk(T, 23, 0); camera.position.y += q * 0.05 * shk(T, 19, 2); camera.rotation.z += q * 0.02 * shk(T, 17, 4); return { si, t0 }; }
