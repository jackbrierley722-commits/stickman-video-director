
// ---------- timing ----------
const E = { c1: CL[1].start, clever: AT(1, 'clever'), c2: CL[2].start, c3: CL[3].start, lean: AT(3, 'he'), c4: CL[4].start, stand: AT(4, 'he'),
  c5: CL[5].start, door: AT(5, 'with'), lock: AT(5, 'and'), much: AT(5, 'much'), c6: CL[6].start };
E.reveal = E.c6 + 0.4; E.loop = TM.total - 0.4;
const UX = [-1.2, 0, 1.2, 2.4]; // urinal x positions along the back wall (z = 0)
function tileTex(base, grout, w, h, rep, seed) { const t = ctex(256, 256, (c) => { c.fillStyle = grout; c.fillRect(0, 0, 256, 256); const r = rng(seed); const tw = 256 / w, th = 256 / h; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = (r() - 0.5) * 8; c.fillStyle = base; c.globalAlpha = 1; c.fillRect(i * tw + 2, j * th + 2, tw - 4, th - 4); c.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 60})`; c.fillRect(i * tw + 2, j * th + 2, tw - 4, th - 4); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function urinal(p, x) { const g = new T3.Group(); g.position.set(x, 0, 0.0); p.add(g); const cer = SM('#f6f6f4', { roughness: 0.12, metalness: 0.05 });
  const body = add(g, Sp(0.26, 24, 18), cer, 0, 0.78, 0.2); body.scale.set(0.9, 1.4, 0.75); add(g, RB(0.4, 0.5, 0.18, 0.08), cer, 0, 0.95, 0.06); add(g, Sp(0.2, 20, 14, 0, PI * 2, PI * 0.5, PI * 0.5), SM('#e8eae8', { roughness: 0.2 }), 0, 0.68, 0.24).scale.set(0.9, 0.6, 0.7);
  const ch = SM('#c8ccd2', { metalness: 0.95, roughness: 0.2 }); add(g, Cy(0.018, 0.018, 0.5, 10), ch, 0, 1.45, 0.04); add(g, Cy(0.04, 0.04, 0.08, 14), ch, 0, 1.72, 0.05); add(g, Bx(0.08, 0.02, 0.02), ch, 0.05, 1.72, 0.08); return g; }
function build() {
  buildSky(); R.sun.intensity = 2.6; R.hemi.intensity = 1.0;
  // ===== RESTROOM =====
  const RM = R.room = new T3.Group(); scene.add(RM);
  add(RM, Bx(9, 0.1, 8), SM('#ffffff', { map: tileTex('#8a8e92', '#5a5e62', 8, 8, [6, 5], 3), roughness: 0.35 }), 0.6, -0.05, 2.6);
  const wt = SM('#ffffff', { map: tileTex('#eef1f2', '#c8ccd0', 6, 12, [6, 3], 5), roughness: 0.25 }); add(RM, Bx(9, 3.2, 0.1), wt, 0.6, 1.6, -0.15); add(RM, Bx(0.1, 3.2, 8), wt, -3.9, 1.6, 2.6); add(RM, Bx(0.1, 3.2, 8), wt, 5.1, 1.6, 2.6);
  add(RM, Bx(9, 0.1, 8), SM('#e8e8e4'), 0.6, 3.2, 2.6, false); for (const x of [-1.5, 1.5, 4]) { add(RM, RB(1.2, 0.05, 0.3, 0.02), SM('#ffffff', { emissive: '#ffffff', emissiveIntensity: 1.2 }), x, 3.14, 1.4, false); }
  R.roomL = new T3.PointLight('#fff8ee', 9, 14, 1.4); R.roomL.position.set(0.6, 2.9, 2.2); RM.add(R.roomL); R.roomL.castShadow = true; R.roomL.shadow.mapSize.set(1024, 1024);
  R.urinals = UX.map(x => urinal(RM, x));
  // dividers (stainless steel), grow taller on cue
  R.div = new T3.Group(); R.div.position.set(0.6, 0, 0.32); RM.add(R.div); R.divPanel = add(R.div, RB(0.04, 1, 0.6, 0.015), SM('#c8ccd2', { metalness: 0.9, roughness: 0.28 }), 0, 0.5, 0); R.divPanel.geometry.translate(0, 0, 0);
  R.bolts = []; for (const y of [0.4, 1.0]) { const bb = add(R.div, Cy(0.018, 0.018, 0.05, 10), SM('#9aa0a6', { metalness: 1, roughness: 0.25 }), 0, y, -0.28); bb.rotation.z = PI / 2; R.bolts.push(bb); }
  // cubicle: two side panels, front with a door, the engaged lock
  const lam = SM('#3a6a8a', { roughness: 0.45 }); R.cub = new T3.Group(); R.cub.position.set(-1.2, 0, 0); RM.add(R.cub);
  R.cubL = add(R.cub, RB(0.04, 2.1, 1.5, 0.015), lam, -0.55, 1.12, 0.75); R.cubR = add(R.cub, RB(0.04, 2.1, 1.5, 0.015), lam, 0.55, 1.12, 0.75); R.cubF = add(R.cub, RB(0.2, 2.1, 0.04, 0.015), lam, -0.48, 1.12, 1.5);
  R.doorPiv = new T3.Group(); R.doorPiv.position.set(0.53, 0, 1.5); R.cub.add(R.doorPiv); R.door = add(R.doorPiv, RB(0.92, 1.95, 0.04, 0.015), lam, -0.46, 1.12, 0);
  const ch = SM('#c8ccd2', { metalness: 0.95, roughness: 0.2 }); for (const y of [0.4, 1.7]) add(R.doorPiv, Cy(0.02, 0.02, 0.12, 10), ch, 0, y, 0.0);
  R.lockTex = ctex(128, 48, () => {}); R.lockFace = add(R.doorPiv, new T3.PlaneGeometry(0.16, 0.06), new T3.MeshBasicMaterial({ map: R.lockTex, toneMapped: false }), -0.8, 1.15, 0.04, false); add(R.doorPiv, RB(0.2, 0.1, 0.02, 0.01), ch, -0.8, 1.15, 0.018);
  R.lockKnob = add(R.doorPiv, Cy(0.03, 0.03, 0.03, 14), ch, -0.8, 1.15, -0.03); R.lockKnob.rotation.x = PI / 2; add(R.lockKnob, Bx(0.05, 0.012, 0.02), SM('#222'), 0, -0.02, 0);
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); RM.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); RM.add(R.bro);
  // ===== STADIUM (the reveal) =====
  const ST = R.stadium = new T3.Group(); scene.add(ST); ST.visible = false;
  const pt = ctex(256, 256, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#3f8a3a' : '#4a9a42'; c.fillRect(0, i * 16, 256, 16); } c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; c.strokeRect(8, 8, 240, 240); c.beginPath(); c.moveTo(8, 128); c.lineTo(248, 128); c.stroke(); c.beginPath(); c.arc(128, 128, 30, 0, 7); c.stroke(); });
  add(ST, Bx(70, 0.1, 105), SM('#ffffff', { map: pt, roughness: 0.9 }), 0, -0.06, 0, false);
  const crowd = ctex(512, 128, (c) => { c.fillStyle = '#222630'; c.fillRect(0, 0, 512, 128); const r = rng(5); for (let i = 0; i < 3200; i++) { c.fillStyle = ['#d83a3a', '#f4f4f4', '#2a5aa8', '#f1c40f', '#e8b890', '#3a3a42'][Math.floor(r() * 6)]; c.fillRect(r() * 512, r() * 128, 3, 4); } }); crowd.wrapS = T3.RepeatWrapping; crowd.repeat.set(8, 1);
  const stand = (x, z, w, ry) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; ST.add(g); const m = add(g, new T3.PlaneGeometry(w, 34), SM('#ffffff', { map: crowd, roughness: 1, side: T3.DoubleSide }), 0, 14, 0, false); m.rotation.x = -0.65; add(g, Bx(w, 2, 2), SM('#5a5e66'), 0, 1, 2, false); add(g, Bx(w, 8, 1), SM('#2a2e36'), 0, 30, -12, false); };
  stand(0, -66, 90, 0); stand(0, 66, 90, PI); stand(-48, 0, 120, PI / 2); stand(48, 0, 120, -PI / 2);
  for (const [x, z] of [[-40, -60], [40, -60], [-40, 60], [40, 60]]) { add(ST, Cy(0.5, 0.7, 50, 10), SM('#8a8e94', { metalness: 0.6 }), x, 25, z, false); add(ST, RB(8, 4, 1, 0.2), SM('#ffffff', { emissive: '#fff8e0', emissiveIntensity: 3 }), x * 0.92, 50, z * 0.92, false).lookAt(0, 0, 0); }
  R.screen = add(ST, Bx(18, 9, 0.5), SM('#111'), 0, 26, -58, false); R.screenImg = add(ST, new T3.PlaneGeometry(17, 8.4), new T3.MeshBasicMaterial({ map: ctex(512, 256, (c) => { c.fillStyle = '#0a0a12'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#3a6a8a'; c.fillRect(196, 50, 120, 170); c.fillStyle = '#d83a3a'; c.fillRect(290, 120, 18, 8); c.fillStyle = '#fff'; c.font = '28px Russo'; c.fillText('LIVE', 20, 40); c.fillStyle = '#d83a3a'; c.beginPath(); c.arc(100, 30, 8, 0, 7); c.fill(); }), toneMapped: false }), 0, 26, -57.7, false);
}
function lockDraw(engaged) { const c = R.lockTex.userData.g; c.fillStyle = engaged ? '#c81e1e' : '#1e8a3a'; c.fillRect(0, 0, 128, 48); c.fillStyle = '#fff'; c.font = '22px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(engaged ? 'ENGAGED' : 'VACANT', 64, 25); R.lockTex.needsUpdate = true; }
let LOCKED = null;
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [-0.6, 1.95, 3.6], [-0.6, 1.9, 3.2], [-0.6, 1.3, 0], [-0.6, 1.3, 0])],
  [E.c1, (k, T) => TR(k, [0.3, 2.4, 6.4], [0.3, 2.3, 5.8], [0.3, 1.1, 0], [0.3, 1.1, 0])],
  [E.c2, (k, T) => TR(k, [1.6, 1.8, 3.4], [1.1, 1.7, 2.8], [0.2, 1.3, 0], [-0.2, 1.3, 0])],
  [E.c3, (k, T) => TR(k, [0.6, 1.7, 2.6], [0.6, 1.6, 2.2], [0.6, 0.8, 0.2], [0.6, 0.8, 0.2])],
  [E.lean - 0.1, (k, T) => TR(k, [-0.4, 1.85, 2.4], [-0.3, 1.8, 2.1], [0.2, 1.5, 0.2], [0.2, 1.5, 0.2])],
  [E.c4, (k, T) => TR(k, [0.6, 1.0, 2.6], [0.6, 1.6, 2.6], [0.6, 1.2, 0.3], [0.6, 2.0, 0.3])],
  [E.stand - 0.1, (k, T) => TR(k, [-0.5, 2.2, 3.2], [-0.4, 2.3, 2.8], [0.6, 2.0, 0.2], [0.6, 2.1, 0.2])],
  [E.c5, (k, T) => TR(k, [0.4, 2.6, 4.4], [0.2, 2.5, 3.8], [-1.2, 1.1, 0.8], [-1.2, 1.1, 0.8])],
  [E.door - 0.1, (k, T) => TR(k, [0.6, 1.6, 3.6], [0.4, 1.55, 3.3], [-1.0, 1.15, 1.5], [-1.0, 1.15, 1.5])],
  [E.lock - 0.1, (k, T) => TR(k, [-1.4, 1.1, 2.35], [-1.42, 1.08, 2.15], [-1.47, 0.98, 1.52], [-1.47, 0.98, 1.52])],
  [E.much - 0.1, (k, T) => TR(k, [0.8, 1.7, 3.6], [0.6, 1.7, 3.2], [-1.0, 1.3, 1.2], [-1.0, 1.3, 1.2])],
  [E.c6, (k, T) => { const q = ease(prog(T, E.reveal, E.loop - 0.2)); look(L3([0.6, 2.0, 5], [30, 38, 70], q), L3([-1.2, 1.2, 0.8], [-1.2, 0, 0], q)); }],
  [E.loop, (k, T) => look([-0.6, 1.95, 3.6], [-0.6, 1.3, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function atUrinal(p, x) { rest(p); p.position.set(x, 0, 0.62); p.rotation.set(0, PI, 0); const u = p.userData; u.armL.rotation.x = -0.6; u.armR.rotation.x = -0.6; u.armL.userData.e.rotation.x = -0.6; u.armR.userData.e.rotation.x = -0.6; u.head.rotation.x = 0.25; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci;
  const reveal = cl === 6 && T > E.reveal; R.stadium.visible = reveal; R.sky.visible = reveal; scene.background = reveal ? new T3.Color('#0a1022') : null;
  // the room's walls/ceiling fall away for the reveal, the cubicle stays on the pitch
  R.room.children.forEach(m => { if (m !== R.cub && m !== R.you && m !== R.bro && m !== R.roomL) m.visible = !reveal; }); R.roomL.intensity = reveal ? 0 : 9; R.sun.intensity = reveal ? 1.4 : 1.2; R.hemi.intensity = reveal ? 1.0 : 0.6;
  const you = R.you, bro = R.bro; atUrinal(you, UX[0]); face(you, 'neutral', T); bro.visible = true;
  // bro positions
  if (cl === 0) { atUrinal(bro, UX[1]); bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.35; }
  else if (cl === 1) { const k = prog(T, E.c1 + 0.2, E.clever); atUrinal(bro, lerp(UX[1], UX[2], k)); face(you, T > E.clever - 0.1 ? 'grin' : 'neutral', T); }
  else if (cl === 2) { const k = prog(T, E.c2 + 0.3, E.c3 - 0.3); atUrinal(bro, lerp(UX[2], UX[1], ease(k))); if (k > 0 && k < 1) walkPose(bro, T * 8, 0.5), bro.rotation.y = -PI / 2; bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.4; }
  else if (cl === 3 || cl === 4) { atUrinal(bro, UX[1]); const lean = cl === 3 && T > E.lean - 0.1 ? ease(prog(T, E.lean - 0.1, E.lean + 0.4)) : 0; bro.userData.up.rotation.z = 0.5 * lean; bro.position.x = UX[1] - 0.15 * lean; bro.userData.head.rotation.y = -0.7 * lean; face(bro, 'grin', T); face(you, lean > 0.5 ? 'shock' : 'neutral', T); you.userData.head.rotation.y = 0.4 * lean;
    if (cl === 4) { const up = T > E.stand - 0.1 ? ease(prog(T, E.stand - 0.1, E.stand + 0.5)) : 0; bro.position.set(UX[1], 0.62 * up, 0.62 - 0.32 * up); bro.userData.up.rotation.z = 0; bro.userData.head.rotation.set(0.55 * up, -0.4 * up, 0); face(bro, 'grin', T); face(you, up > 0.5 ? 'angry' : 'neutral', T); you.userData.head.rotation.x = -0.3 * up; you.userData.head.rotation.y = 0.3 * up; } }
  else if (cl >= 5 || loop) { atUrinal(bro, 0.3); bro.position.z = 2.3; bro.rotation.y = PI * 0.9; const knock = cl === 5 && T > E.lock ? Math.abs(S(T * 9)) : 0; bro.userData.armR.rotation.x = -1.5 - 0.3 * knock; face(bro, cl === 6 ? 'shock' : 'angry', T);
    if (reveal) { bro.position.set(0.6, 0, 2.4); bro.rotation.y = 0.3; rest(bro); bro.userData.armR.rotation.set(-2.9, 0, -0.3 + 0.3 * S(T * 8)); bro.userData.armL.rotation.set(-2.9, 0, 0.3); face(bro, 'grin', T); } }
  if (loop) { atUrinal(bro, UX[1]); bro.userData.head.rotation.y = -0.5; face(bro, 'grin', T); face(you, 'angry', T); you.userData.head.rotation.y = 0.35; }
  // divider
  const divOn = cl >= 3 && cl <= 4; R.div.visible = divOn; const tall = cl === 4 ? ease(prog(T, E.c4 + 0.3, E.stand - 0.3)) : 0; R.div.scale.y = 1 + 1.3 * tall; R.div.position.y = 0.45; R.bolts.forEach((b, i) => b.rotation.x = cl === 3 ? T * 20 * (T < E.c3 + 1.2 ? 1 : 0) : 0);
  // cubicle builds around you
  const cubOn = cl >= 5 || (loop && false); R.cub.visible = cl >= 5 && !loop; const rise = cl === 5 ? ease(prog(T, E.c5 + 0.1, E.door - 0.2)) : 1; [R.cubL, R.cubR, R.cubF].forEach(m => { m.scale.y = Math.max(0.01, rise); m.position.y = 1.12 * rise; });
  R.doorPiv.visible = cl > 5 || T > E.door - 0.1; R.doorPiv.rotation.y = cl === 5 ? -1.4 * (1 - ease(prog(T, E.door + 0.1, E.door + 0.7))) : 0;
  const engaged = cl > 5 || T > E.lock + 0.5; R.lockKnob.rotation.z = engaged ? PI / 2 : 0; if (LOCKED !== engaged) { lockDraw(engaged); LOCKED = engaged; }
  if (cl >= 5 && !loop) { you.visible = !(reveal && false); face(you, cl === 6 ? 'grin' : (T > E.much - 0.1 ? 'grin' : 'neutral'), T); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(0, 0, 0); return { si, t0 }; }
