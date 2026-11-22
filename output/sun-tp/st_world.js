
// ---------- timing ----------
const E = { c1: CL[1].start, gas: AT(1, 'gas'), light: AT(1, 'light'), c2: CL[2].start, mw: AT(2, 'microwaves'), c3: CL[3].start, steam: AT(3, 'steam'), blinded: AT(3, 'blinded'), c4: CL[4].start, fall: AT(4, 'fall'), before: AT(4, 'before'),
  c5: CL[5].start, steaming: AT(5, 'steaming'), tan: AT(5, 'tan'), one: AT(5, 'one'), c6: CL[6].start };
E.loop = TM.total - 0.4;
const HOMEX = [500, 0, 0];
const H3 = (x, y, z) => [HOMEX[0] + x, HOMEX[1] + y, HOMEX[2] + z];
function quake() { return 0; }
const onSun = T => { const ci = T >= E.loop ? 0 : CLI(T); return ci <= 4; };
// slow-motion clock: 0.000 s -> 0.100 s across the time on the Sun
const sunClock = T => clamp(prog(T, 0.9, E.c5) * 0.1, 0, 0.1);
function granTex() { return ctex(512, 512, (c, w, h) => { c.fillStyle = '#ff8a1a'; c.fillRect(0, 0, w, h); const r = rng(11); for (let i = 0; i < 420; i++) { const x = r() * w, y = r() * h, s = 10 + r() * 22; const g = c.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, '#fff2a0'); g.addColorStop(0.55, '#ffc040'); g.addColorStop(1, 'rgba(255,110,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); } }); }
function build() {
  scene.background = new T3.Color('#0a0402'); R.hemi = new T3.HemisphereLight('#ffd8a0', '#ff9a30', 1.2); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff0dc', 1.6); R.sun.position.set(3, 9, 6); scene.add(R.sun); scene.add(R.sun.target);
  R.under = new T3.DirectionalLight('#ffb040', 0); R.under.position.set(0, -6, 4); scene.add(R.under); R.under.target.position.set(0, 1, 0); scene.add(R.under.target);
  // ---- the Sun's surface ----
  const G = R.SG = new T3.Group(); scene.add(G); const gt = granTex(); gt.wrapS = gt.wrapT = T3.RepeatWrapping; gt.repeat.set(30, 30); R.gran = gt;
  R.surf = add(G, new T3.PlaneGeometry(600, 600), new T3.MeshBasicMaterial({ map: gt, toneMapped: false }), 0, 0, 0, false); R.surf.rotation.x = -PI / 2;
  for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.36, d = 90 + (i % 3) * 30; const t = add(G, new T3.TorusGeometry(14 + (i % 2) * 8, 1.6, 8, 40, PI), new T3.MeshBasicMaterial({ color: i % 2 ? '#ff5a1a' : '#ff8a2a', toneMapped: false }), S(a) * d, 0, -C(a) * d, false); t.rotation.y = a + PI / 2; R['prom' + i] = t; }
  R.haze = []; for (let i = 0; i < 18; i++) { const s = spr(G, GLOW, '#ffb040', 30 + (i % 4) * 12, (i - 9) * 18, 4, -60 - (i % 5) * 20, 0.35); R.haze.push(s); }
  R.gas = []; const r = rng(3); for (let i = 0; i < 40; i++) { const s = spr(G, GLOW, '#fff0b0', 0.08, 0, 0, 0, 0.9); s.userData = { x: (r() - 0.5) * 6, y: 0.2 + r() * 2.8, z: (r() - 0.5) * 6, ph: r() }; R.gas.push(s); }
  R.rays = []; for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; const m = add(G, new T3.CylinderGeometry(0.02, 0.16, 2.4, 6, 1, true), new T3.MeshBasicMaterial({ color: '#fff4c0', transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false }), Math.cos(a) * 1.2, 1.0, Math.sin(a) * 1.2, false); m.rotation.z = -Math.cos(a) * 0.5; m.rotation.x = Math.sin(a) * 0.5; R.rays.push(m); }
  // 60,000 microwaves (well, sixty of them)
  R.mws = []; for (let i = 0; i < 60; i++) { const ring = Math.floor(i / 20), a = (i % 20) / 20 * PI * 2 + ring * 0.16, d = 2.6 + ring * 1.5; const g = new T3.Group(); g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); g.lookAt(0, 0, 0); G.add(g); add(g, Bx(0.6, 0.36, 0.42), SM('#e8e8ea'), 0, 0.18, 0); add(g, Bx(0.36, 0.26, 0.02), SM('#1a1c22'), -0.08, 0.19, 0.215); add(g, Bx(0.1, 0.26, 0.02), SM('#8a8e94'), 0.21, 0.19, 0.215); g.userData.d = d; g.userData.i = i; R.mws.push(g); }
  R.steam = []; for (let i = 0; i < 30; i++) R.steam.push(spr(scene, GLOW, '#f4f4f4', 0.5, 0, 0, 0, 0, T3.NormalBlending));
  R.ruler = new T3.Group(); G.add(R.ruler); add(R.ruler, Bx(0.06, 1.4, 0.06), BM('#ffffff'), 0, -0.7, 0, false); for (let i = 0; i <= 14; i++) add(R.ruler, Bx(i % 5 ? 0.12 : 0.22, 0.02, 0.02), BM('#ffffff'), 0.06, -i * 0.1, 0, false);
  // ---- back home: your bedroom ----
  const Hm = R.HG = new T3.Group(); Hm.position.set(...HOMEX); scene.add(Hm);
  add(Hm, Bx(7, 0.1, 6), SM('#b8865a'), 0, -0.05, 0); add(Hm, Bx(7, 3, 0.1), SM('#8ab0c8'), 0, 1.5, -3); add(Hm, Bx(0.1, 3, 6), SM('#9ac0d4'), -3.5, 1.5, 0); add(Hm, Bx(0.1, 3, 6), SM('#9ac0d4'), 3.5, 1.5, 0);
  add(Hm, Bx(1.6, 1.1, 0.06), BM('#bfe6ff'), 1.6, 1.8, -2.94, false); add(Hm, Bx(1.7, 0.08, 0.1), SM('#f4f4f4'), 1.6, 1.25, -2.92);
  add(Hm, Bx(2.0, 0.45, 1.3), SM('#3a5aa8'), -2.2, 0.25, -2.2); add(Hm, Bx(2.0, 0.15, 1.3), SM('#f4f4f4'), -2.2, 0.55, -2.2); add(Hm, Bx(0.6, 0.15, 0.4), SM('#f4f4f4'), -2.9, 0.68, -2.2);
  add(Hm, Bx(0.9, 1.2, 0.04), BM('#e8a040'), -0.6, 1.8, -2.93, false); add(Hm, Bx(1.2, 0.05, 2), SM('#c8584a'), 0.6, 0.01, 0.3);
  R.flash = spr(Hm, GLOW, '#fff4d0', 6, 0, 1.2, 0, 0);
  // you
  R.you = human({ top: '#3a6ad8', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); scene.add(R.you);
  R.tanHead = add(R.you.userData.head, new T3.SphereGeometry(0.153, 18, 12, 0, PI, 0, PI), SM('#6a3418'), 0, 0, 0.004); R.tanHead.rotation.y = -PI / 2; R.tanHead.scale.set(0.97, 1.09, 1.0);
}
// ---------- shots ----------
const YP = () => R.you.position;
const SH = [
  [0, (k, T) => TR(k, [7, 4.5, 12], [3.5, 2.2, 6.5], [0, 1.2, 0], [0, 1.1, 0])],
  [2.0, (k, T) => TR(k, [0.4, 1.6, 2.0], [0.3, 1.55, 1.7], [0, 1.5, 0], [0, 1.5, 0])],
  [E.c1, (k, T) => TR(k, [-4, 0.5, 6], [-3.2, 0.6, 5.2], [0, 2.5, -20], [0, 3.5, -30])],
  [E.gas - 0.1, (k, T) => TR(k, [1.6, 1.4, 2.6], [1.3, 1.4, 2.3], [0, 1.2, 0], [0, 1.2, 0])],
  [E.c2, (k, T) => TR(k, [0.8, 0.25, 2.2], [0.6, 0.3, 1.8], [0, 1.4, 0], [0, 1.6, 0])],
  [E.mw - 0.15, (k, T) => TR(k, [0, 6.5, 8.5], [0, 7.5, 9.5], [0, 0.4, 0], [0, 0.4, 0])],
  [E.c3, (k, T) => TR(k, [0.9, 1.3, 2.4], [0.7, 1.3, 2.0], [0, 1.0, 0], [0, 1.1, 0])],
  [E.blinded - 0.15, (k, T) => TR(k, [0.15, 1.55, 0.9], [0.12, 1.55, 0.8], [0, 1.55, 0], [0, 1.55, 0])],
  [E.c4, (k, T) => { const p = YP(); TR(k, [2.2, 1.0, 2.6], [2.0, 0.6, 2.4], [0, 0.4, 0], [0, -0.2, 0]); }],
  [E.c5, (k, T) => TR(k, H3(0.4, 1.6, 3.2), H3(0.3, 1.55, 2.8), H3(0, 1.1, 0), H3(0, 1.1, 0))],
  [E.tan - 0.2, (k, T) => TR(k, H3(-1.6, 1.4, 2.4), H3(-1.5, 1.4, 2.2), H3(0, 1.0, 0), H3(0, 1.0, 0))],
  [E.c6, (k, T) => TR(k, H3(0.3, 1.5, 2.6), H3(0.2, 1.45, 2.3), H3(0, 1.1, 0), H3(0, 1.15, 0))],
  [E.loop, (k, T) => look([7, 4.5, 12], [0, 1.2, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function tanSide(on) { const u = R.you.userData; if (!R.orig) { R.orig = new Map(); const skinHex = new T3.Color('#e4b08a').getHex(); [u.armL, u.legL].forEach(g => g.traverse(m => { if (m.isMesh && m.material !== INK) { const mat = m.material, alt = mat.clone(); if (mat.color.getHex() === skinHex) alt.color.set('#6a3418'); else alt.color.set('#2a1a14'); R.orig.set(m, [mat, alt]); } })); }
  R.orig.forEach(([a, b], m) => { m.material = on ? b : a; }); R.tanHead.visible = on; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T), sun = loop || onSun(T); const you = R.you, u = you.userData; rest(you); you.visible = true; face(you, 'neutral', T); tanSide(false);
  R.SG.visible = sun; R.HG.visible = !sun; R.under.intensity = sun ? 2.2 : 0; R.hemi.color.set(sun ? '#ffd8a0' : '#eaf0ff'); R.hemi.groundColor.set(sun ? '#ff9a30' : '#7a6a5a'); R.sun.intensity = sun ? 0.6 : 1.8; scene.background.set(sun ? '#0a0402' : '#8ab0c8');
  R.gran.offset.set(T * 0.01, T * 0.007); for (let i = 0; i < 6; i++) R['prom' + i].scale.y = 1 + 0.08 * S(T * 0.8 + i);
  // on the Sun
  if (sun) { you.position.set(0, 0, 0); you.rotation.y = 0; face(you, 'shock', T); u.armL.rotation.set(-0.4, 0, -0.9); u.armR.rotation.set(-0.4, 0, 0.9);
    if (ci === 0 && T < 0.5 && !loop) you.visible = false;
    const sink = ci === 4 ? ease(prog(T, E.fall - 0.1, E.before)) * 1.4 : 0; you.position.y = -sink; if (ci === 4) { face(you, 'yell', T); u.armL.rotation.set(-2.6, 0, -0.3); u.armR.rotation.set(-2.6, 0, 0.3); }
    if (ci === 3) { u.armL.rotation.set(-1.6, 0, -0.3); u.armR.rotation.set(-1.6, 0, 0.3); u.armL.userData.e.rotation.x = -1.2; u.armR.userData.e.rotation.x = -1.2; if (T > E.blinded - 0.15) { u.armL.rotation.set(-2.4, 0, 0.3); u.armR.rotation.set(-2.4, 0, -0.3); u.armL.userData.e.rotation.x = -1.8; u.armR.userData.e.rotation.x = -1.8; } } }
  R.ruler.visible = ci === 4; R.ruler.position.set(0.7, 0.02, 0.3); R.ruler.scale.y = 1;
  // thin glowing gas specks
  R.gas.forEach((s, i) => { const d = s.userData; const ph = (T * 0.2 + d.ph) % 1; s.position.set(d.x + 0.3 * S(T + i), d.y + ph * 0.6, d.z); s.material.opacity = sun && ci === 1 && T > E.gas - 0.2 ? 0.9 : 0.25; });
  // light rays hammering you
  const rayOn = sun && (ci === 1 && T > E.light - 0.1 || ci === 2 || ci === 3); R.rays.forEach((m, i) => { m.material.opacity = rayOn ? 0.35 + 0.2 * S(T * 12 + i) : 0; });
  // microwaves pop in around you
  R.mws.forEach(g => { const k = ci === 2 ? ease(prog(T, E.mw - 0.3 + g.userData.i * 0.012, E.mw + g.userData.i * 0.012)) : ci === 3 ? 1 : 0; g.visible = k > 0; g.scale.setScalar(Math.max(0.001, k)); });
  // steam
  const steamOn = (ci === 3 && T > E.steam - 0.4) || ci === 4 || (ci >= 5 && !loop); R.steam.forEach((s, i) => { const ph = (T * 0.6 + i / 30) % 1; const base = you.position; s.position.set(base.x + 0.35 * S(i * 2.3) + 0.1 * S(T * 2 + i), base.y + 0.3 + (i % 10) * 0.15 + ph * 1.1, base.z + 0.25 * C(i * 1.7)); s.scale.setScalar(0.3 + ph * 0.6); s.material.opacity = steamOn ? 0.55 * (1 - ph) : 0; });
  // back home
  if (!sun) { you.position.set(...H3(0, 0, 0.3)); you.rotation.y = 0; face(you, 'shock', T); tanSide(T > E.tan - 0.2); R.flash.material.opacity = ci === 5 ? 1 - prog(T, E.c5, E.c5 + 0.5) : 0;
    if (ci === 5 && T > E.tan - 0.2) { you.rotation.y = T > E.one - 0.1 ? -0.9 : 0.9; face(you, 'grin', T); }
    if (ci === 6 || loop) { face(you, 'grin', T); u.armR.rotation.set(-1.4, 0, 0.3); u.armR.userData.e.rotation.x = -1.4; you.rotation.y = 0.5; } }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
