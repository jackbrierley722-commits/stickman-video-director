import re
s = open('../prison-p4/scenes.js').read()
def rep(a, b, cnt=1):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, cnt)
def region(a, b, new):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]

# 1. timing
region("const E = {", "E.loop = TM.total - 0.4;", """const E = { think: AT(0, 'the'), recap: CL[1].start, found: AT(1, 'found'), c2: CL[2].start, threw: AT(2, 'threw'), lightF: AT(2, 'the', 1), c3: CL[3].start, climbed: AT(3, 'climbed'),
  c4: CL[4].start, dogs: AT(4, 'get'), c5: CL[5].start, leaves: AT(5, 'he'), cap: AT(5, 'cap'), c6: CL[6].start, driver: AT(6, 'driver'), engine: AT(6, 'engine'), front: AT(6, 'front'),
  c7: CL[7].start, guard: AT(7, 'guard'), steps: AT(7, 'steps'), torch: AT(7, 'torch'), wants: AT(7, 'he'), optA: CL[8].start, optB: AT(8, 'option', 1), comment: AT(8, 'comment'), follow: AT(8, 'follow') };
""")
# 2. first-person sleeves can change colour (prison orange -> driver blue)
rep("const sleeve = SM('#e0601c')", "const sleeve = R.sleeveM = SM('#e0601c')")

# 3. shots, animation and the new set pieces
region("// ---------- shots (all first person) ----------", "// ---------- overlay ----------", r"""// ---------- part 5 set: walk-in laundry truck, jacket decoy, guards at the wire, front gate ----------
const TRK = [-7, 0, -12], STOPX = -21.6, BARX = -27, JK = [-1, 5.25, -18];
function guardP() { const p = person({ skin: '#b88660', top: '#26324a', bot: '#1c2232', cap: '#1a2236', hair: '#2a1a10', sleeve: true, shoe: '#0a0a0a' }); const fl = add(p.userData.armR.userData.e, Cy(0.025, 0.03, 0.18, 8), SM('#222', { metalness: 0.6 }), 0, -0.36, 0.05); fl.rotation.x = PI / 2; p.userData.torch = glow(p.userData.armR.userData.e, '#fff2c8', 0.5, 0, -0.36, 0.16, 0.9); return p; }
function build3() { const g = R.yardG; g.remove(R.truck);
  add(g, Bx(30, 0.1, 50), SM('#ffffff', { map: concreteT('#4a4a46', [7, 12]), roughness: 0.95 }), -45, -0.05, -8);
  const tr = R.truck = new T3.Group(); tr.position.set(...TRK); tr.rotation.y = -PI / 2; g.add(tr);
  const bodyM = SM('#e4e4e0', { roughness: 0.6, side: T3.DoubleSide }), inM = SM('#9a9a96', { roughness: 0.9, side: T3.DoubleSide }), blue = SM('#2a5a8a', { roughness: 0.5, side: T3.DoubleSide }), dark = SM('#1a1c20', { roughness: 0.7 });
  for (const sx of [-1, 1]) add(tr, Bx(0.05, 2.6, 4.6), bodyM, sx * 1.15, 1.72, -0.6); add(tr, Bx(2.35, 0.05, 4.6), bodyM, 0, 3.0, -0.6); add(tr, Bx(2.3, 0.06, 4.6), inM, 0, 0.44, -0.6); add(tr, Bx(2.3, 2.6, 0.05), inM, 0, 1.72, 1.67);
  for (let i = 0; i < 6; i++) add(tr, Bx(2.25, 0.03, 0.06), inM, 0, 2.95, -2.6 + i * 0.85);
  const sackM = [SM('#e8e6e0', { roughness: 1 }), SM('#c8ccd4', { roughness: 1 }), SM('#d8d0c0', { roughness: 1 })]; const r = rng(31); for (let i = 0; i < 14; i++) { const b = add(tr, Sp(0.38, 9, 7), sackM[i % 3], (r() - 0.5) * 1.6, 0.8 + (i > 9 ? 0.55 : 0), 1.3 - r() * 2.6); b.scale.set(1, 0.85 + r() * 0.3, 1.1); b.rotation.y = r() * 3; }
  R.dL = new T3.Group(); R.dL.position.set(-1.15, 0, -2.92); tr.add(R.dL); add(R.dL, Bx(1.12, 2.5, 0.05), bodyM, 0.56, 1.72, 0); R.dR = new T3.Group(); R.dR.position.set(1.15, 0, -2.92); tr.add(R.dR); add(R.dR, Bx(1.12, 2.5, 0.05), bodyM, -0.56, 1.72, 0);
  for (const d of [R.dL, R.dR]) add(d, Bx(0.04, 0.3, 0.04), SM('#8a8e94', { metalness: 0.8 }), d === R.dL ? 1.0 : -1.0, 1.5, -0.05);
  add(tr, new T3.PlaneGeometry(3.4, 0.7), new T3.MeshBasicMaterial({ map: ctex(256, 52, c => { c.fillStyle = '#e4e4e0'; c.fillRect(0, 0, 256, 52); c.fillStyle = '#2a5a8a'; c.font = '34px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LAUNDRY', 128, 28); }), toneMapped: false }), 1.18, 2.2, -0.6, false).rotation.y = PI / 2;
  // cab with a real interior (open windows, glass, dash, wheel, seats)
  add(tr, Bx(2.3, 0.06, 1.7), blue, 0, 0.5, 2.5); add(tr, Bx(2.3, 0.06, 1.75), blue, 0, 2.32, 2.45); add(tr, Bx(2.3, 0.9, 0.05), blue, 0, 0.95, 3.3); for (const sx of [-1, 1]) { add(tr, Bx(0.05, 0.9, 1.65), blue, sx * 1.15, 0.95, 2.5); add(tr, Bx(0.07, 0.95, 0.07), blue, sx * 1.12, 1.85, 3.28); add(tr, Bx(0.07, 0.95, 0.07), blue, sx * 1.12, 1.85, 1.72); }
  add(tr, Bx(2.2, 0.85, 0.02), new T3.MeshStandardMaterial({ color: '#8ab0d0', transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.5 }), 0, 1.85, 3.3, false);
  add(tr, Bx(2.25, 0.9, 1.0), blue, 0, 0.95, 3.8); add(tr, Bx(2.1, 0.28, 0.45), dark, 0, 1.35, 3.05); R.hl = []; for (const x of [-0.8, 0.8]) R.hl.push(glow(tr, '#fff4c8', 0.9, x, 0.95, 4.33, 0.9));
  R.wheelG = new T3.Group(); R.wheelG.position.set(0.5, 1.55, 2.78); R.wheelG.rotation.x = -0.45; tr.add(R.wheelG); add(R.wheelG, new T3.TorusGeometry(0.2, 0.022, 6, 18), dark, 0, 0, 0); add(R.wheelG, Bx(0.38, 0.03, 0.03), dark, 0, 0, 0); add(R.wheelG, Cy(0.03, 0.03, 0.4, 6), dark, 0, -0.03, 0.2).rotation.x = PI / 2;
  for (const sx of [-1, 1]) { add(tr, Bx(0.62, 0.16, 0.6), SM('#3a3a40'), sx * 0.5, 0.95, 2.15); add(tr, Bx(0.62, 0.8, 0.12), SM('#3a3a40'), sx * 0.5, 1.42, 1.85); }
  R.cabCap = new T3.Group(); R.cabCap.position.set(-0.5, 1.07, 2.25); tr.add(R.cabCap); add(R.cabCap, Bx(0.5, 0.06, 0.42), SM('#2a5a8a'), 0, 0, 0).rotation.y = 0.2; add(R.cabCap, Bx(0.12, 0.05, 0.5), SM('#2a5a8a'), 0.22, 0.01, 0.05).rotation.y = 0.5; add(R.cabCap, Cy(0.11, 0.12, 0.08, 10), SM('#1a2236'), -0.05, 0.08, 0.05); add(R.cabCap, Bx(0.18, 0.015, 0.1), SM('#1a2236'), -0.05, 0.05, 0.16);
  for (const [x, z] of [[-1.05, 2.6], [1.05, 2.6], [-1.05, -2], [1.05, -2]]) add(tr, Cy(0.45, 0.45, 0.3, 14), SM('#151515'), x, 0.45, z).rotation.z = PI / 2;
  R.tIn = new T3.PointLight('#c8d0e8', 1.2, 4, 1.5); R.tIn.position.set(0, 2.5, -1.5); tr.add(R.tIn); R.tCab = new T3.PointLight('#ffe8c8', 4, 3, 1.5); R.tCab.position.set(0, 2.1, 2.4); tr.add(R.tCab);
  R.smoke = []; for (let i = 0; i < 8; i++) R.smoke.push(glow(tr, '#9a9aa2', 0.6, 0.8, 0.3, -3, 0));
  // the jacket on the razor wire
  R.jk = new T3.Group(); g.add(R.jk); R.jk.scale.setScalar(1.4); const jm = SM('#e0601c', { roughness: 0.9 }); add(R.jk, Bx(0.55, 0.6, 0.09), jm, 0, 0, 0); for (const sx of [-1, 1]) add(R.jk, Bx(0.14, 0.5, 0.09), jm, sx * 0.34, -0.06, 0).rotation.z = sx * 0.5; add(R.jk, Bx(0.2, 0.06, 0.1), SM('#c84c10'), 0, 0.3, 0);
  // guards at the fence
  R.guards = [0, 1, 2].map(() => { const p = guardP(); g.add(p); return p; }); R.driver = person({ skin: '#d8a07c', top: '#2a5a8a', bot: '#2a2e3a', cap: '#1a2236', hair: '#3a2416', sleeve: true }); g.add(R.driver);
  R.gL = new T3.SpotLight('#fff2d0', 40, 18, 0.35, 0.5, 1.2); g.add(R.gL); R.gL.position.set(-0.6, 2, -16); R.gLT = new T3.Object3D(); g.add(R.gLT); R.gL.target = R.gLT; R.gLT.position.set(...JK);
  // front gate: wall, barrier, booth, lamp, gate guard
  const wm = SM('#ffffff', { map: concreteT('#7a776e', [6, 1]), roughness: 0.95 }); add(g, Bx(0.6, 4, 19), wm, BARX - 1.5, 2, -23.5); add(g, Bx(0.6, 4, 20), wm, BARX - 1.5, 2, 0); add(g, Bx(0.8, 0.5, 5), SM('#d8b830'), BARX - 1.5, 4.25, -12);
  add(g, new T3.PlaneGeometry(3.2, 0.42), new T3.MeshBasicMaterial({ map: ctex(256, 34, c => { c.fillStyle = '#d8b830'; c.fillRect(0, 0, 256, 34); c.fillStyle = '#111'; c.font = '24px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FRONT GATE', 128, 18); }), toneMapped: false }), BARX - 1.08, 4.25, -12, false).rotation.y = PI / 2;
  R.bar = new T3.Group(); R.bar.position.set(BARX, 1.55, -9.9); g.add(R.bar); add(R.bar, Bx(0.13, 0.13, 4.3), new T3.MeshStandardMaterial({ map: ctex(128, 8, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#e8e8e8' : '#d81e1e'; c.fillRect(i * 16, 0, 16, 8); } }), roughness: 0.5 }), 0, 0, -2.15); add(g, Bx(0.3, 1.6, 0.3), SM('#3a3e44'), BARX, 0.8, -9.7);
  const bo = new T3.Group(); bo.position.set(BARX + 1, 0, -8.3); g.add(bo); add(bo, Bx(1.8, 2.6, 1.8), SM('#c8c4b8'), 0, 1.3, 0); add(bo, Bx(2.1, 0.2, 2.1), SM('#3a3e44'), 0, 2.7, 0); add(bo, Bx(1.2, 0.7, 0.05), new T3.MeshBasicMaterial({ color: '#ffd890', toneMapped: false }), 0, 1.7, -0.92, false); add(bo, Bx(0.05, 0.7, 1.2), new T3.MeshBasicMaterial({ color: '#ffd890', toneMapped: false }), 0.92, 1.7, 0, false);
  const gl = new T3.PointLight('#ffd8a0', 30, 18, 1.4); gl.position.set(BARX + 1.5, 4.5, -12); g.add(gl); add(g, Cy(0.08, 0.1, 5.5, 8), SM('#3a3e44'), BARX + 2.5, 2.75, -14.5); add(g, Bx(0.6, 0.2, 0.4), new T3.MeshBasicMaterial({ color: '#fff0c8', toneMapped: false }), BARX + 2.5, 5.6, -14.2, false);
  R.gg = guardP(); g.add(R.gg); R.ggL = new T3.SpotLight('#fff2d0', 0, 12, 0.3, 0.5, 1.2); g.add(R.ggL); R.ggLT = new T3.Object3D(); g.add(R.ggLT); R.ggL.target = R.ggLT;
  // first-person extras: driver cap brim at the top of view, ID card in hand, the jacket in hand
  R.brim = add(R.vm, Bx(0.6, 0.02, 0.22), SM('#1a2236'), 0, 0.17, -0.2, false); R.brim.rotation.x = 0.2;
  R.idc = add(R.handR.userData.h, Bx(0.09, 0.004, 0.06), new T3.MeshBasicMaterial({ map: ctex(96, 64, c => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, 96, 64); c.fillStyle = '#2a5a8a'; c.fillRect(0, 0, 96, 14); c.fillStyle = '#fff'; c.font = '10px Russo'; c.fillText('LAUNDRY CO', 6, 11); c.fillStyle = '#c8a888'; c.fillRect(6, 20, 28, 36); c.fillStyle = '#333'; c.fillRect(40, 24, 46, 5); c.fillRect(40, 34, 36, 5); c.fillRect(40, 44, 42, 5); }) }), 0, 0.03, -0.09, false);
  R.jkH = add(R.handR.userData.h, Bx(0.16, 0.12, 0.1), SM('#e0601c', { roughness: 0.9 }), 0, 0.03, -0.1, false);
}
const Y = (x, y, z) => [YX + x, y, z];
function TW(lx, ly, lz) { R.truck.updateMatrixWorld(true); const v = R.truck.localToWorld(new T3.Vector3(lx, ly, lz)); return [v.x - YX, v.y, v.z]; }
function jacketPos(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci === 1) return null; if (ci === 2 && T < E.threw + 0.05) return null;
  const k = ci === 2 ? prog(T, E.threw + 0.05, E.threw + 0.7) : 1; const a = [0.4, 1.9, -2.4]; return [lerp(a[0], JK[0], k), lerp(a[1], JK[1], k) + 3.2 * S(PI * k) * (1 - k * 0.3), lerp(a[2], JK[2], k)]; }
// searchlight: on you in the recap, then it follows the jacket to the wire and stays there
function slAim(T) { const ci = T >= E.loop ? 0 : CLI(T); const j = jacketPos(T); if (ci === 1 || (ci === 2 && !j)) { const you = camera.position; const k = ci === 1 ? ease(prog(T, E.recap, E.found + 0.3)) : 1; const sw = Y(-4, 0, -8); return [lerp(sw[0], you.x, k), lerp(0, you.y - 0.4, k), lerp(sw[2], you.z, k)]; }
  const p = j || JK; return [YX + p[0] + 0.15 * S(T * 1.3), p[1] - 0.5, p[2]]; }
const tx = T => T >= E.loop ? TRK[0] : lerp(TRK[0], STOPX, ease(prog(T, E.engine - 0.2, E.guard + 0.3)));
const SH = [
  [0, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.6, 4.3, -17), T, 0, 0.5)],
  [E.recap, (k, T) => fp(Y(0.3, 1.62, -1.6), Y(8.6, 7.6, -14.2), T, 0, 0.8)],
  [E.c2, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(-0.6, 3.2, -18), Y(-0.9, 4.6, -18), ease(k)), T, 0, 0.5)],
  [E.lightF - 0.05, (k, T) => fp(Y(0.3, 1.62, -1.6), L3(Y(-0.9, 4.6, -18), Y(3, 6.5, -16), ease(prog(k, 0, 0.7))), T, 0, 0.5)],
  [E.c3, (k, T) => { const kk = ease(prog(T, E.c3, E.climbed + 0.2)); fp(L3(Y(0.3, 1.62, -1.6), Y(...TW(0, 1.62, -3.6)), kk), Y(...TW(0, 1.2, -1)), T, 1, 0.6); }],
  [E.climbed + 0.2, (k, T) => fp(Y(...TW(0, lerp(1.1, 1.5, ease(k)), lerp(-3.2, -2.3, ease(k)))), Y(...TW(0, 1.0, 1)), T, 0, 0.5)],
  [E.c4, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.4, 2.6, -16.5), T, 0, 0.6)],
  [E.c5, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), L3(Y(-2.6, 1.4, -15.2), Y(-1.4, 2.2, -16.5), ease(k)), T, 0, 0.5)],
  [E.leaves - 0.05, (k, T) => fp(Y(...TW(0.2, 1.75, 1.85)), L3(Y(...TW(-0.9, 1.25, 2.7)), Y(...TW(-0.55, 1.0, 2.3)), ease(k)), T, 0, 0.3)],
  [E.c6, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(0.45, 1.5, 8)), T, 0, 0.3)],
  [E.wants - 0.1, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), L3(Y(...TW(0.45, 1.5, 8)), Y(...TW(4, 1.65, 2.6)), ease(prog(k, 0, 0.4))), T, 0, 0.3)],
  [E.optA, (k, T) => fp(Y(...TW(0.5, 1.85, 2.15)), Y(BARX, 1.6, -12.2), T, 0, 0.3)],
  [E.optB - 0.1, (k, T) => fp(Y(...TW(0.5, 1.75, 2.15)), Y(...TW(4, 1.6, 2.5)), T, 0, 0.3)],
  [E.loop, (k, T) => fp(Y(...TW(0.25, 1.5, -2.3)), Y(-0.6, 4.3, -17), T, 0, 0.5)],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }
function vmPose(T) { const hr = R.handR, hl = R.handL; hr.visible = hl.visible = false; R.key.visible = false; R.brim.visible = false; R.idc.visible = false; R.jkH.visible = false; const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  R.sleeveM.color.set(ci >= 6 && !loop ? '#2a5a8a' : '#e0601c'); if (loop) return;
  if (ci === 1) { hl.visible = true; hl.position.set(-0.12, -0.06, -0.36); hl.rotation.set(1.2, -0.3, 0.3); }
  if (ci === 2 && T < E.threw + 0.15) { hr.visible = true; R.jkH.visible = true; const w = prog(T, E.c2, E.threw - 0.05), f = prog(T, E.threw - 0.05, E.threw + 0.12); hr.position.set(0.2 + 0.05 * w - 0.1 * f, -0.25 + 0.2 * w - 0.1 * f, -0.3 + 0.12 * w - 0.25 * f); hr.rotation.set(0.4 + 1.2 * w - 1.6 * f, 0.2, -0.2); }
  if (ci === 3) { const s = S(T * 9); hr.visible = hl.visible = true; if (T < E.climbed) { hr.position.set(0.18, -0.24 + s * 0.04, -0.38); hr.rotation.set(0.4 + s * 0.2, 0.2, -0.2); hl.position.set(-0.2, -0.28 - s * 0.05, -0.4); hl.rotation.set(0.4 - s * 0.3, -0.2, 0.2); } else { hr.position.set(0.16, -0.22, -0.4); hr.rotation.set(-0.3, 0, 0); hl.position.set(-0.16, -0.22, -0.4); hl.rotation.set(-0.3, 0, 0); } }
  if (ci === 4 || (ci === 5 && T < E.leaves - 0.05)) { hl.visible = true; hl.position.set(-0.2, -0.12, -0.42); hl.rotation.set(0.2, 0.3, 1.2); }
  if (ci >= 6) { R.brim.visible = true; hr.visible = hl.visible = true; const steer = ci === 6 ? 0.06 * S(T * 1.3) : 0; hr.position.set(0.15, -0.25 + steer, -0.42); hr.rotation.set(0.5, 0.2, -0.5); hl.position.set(-0.15, -0.25 - steer, -0.42); hl.rotation.set(0.5, -0.2, 0.5);
    if (ci === 8 && T > E.optB - 0.1 && T < E.comment) { const k = ease(prog(T, E.optB + 0.3, E.optB + 0.7)); R.idc.visible = k > 0; hr.position.set(0.15 + 0.08 * k, -0.25 + 0.1 * k, -0.42 - 0.05 * k); hr.rotation.set(0.5 + 0.5 * k, 0.2, -0.5 + 0.3 * k); } } }
function anim(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T);
  R.truck.position.x = tx(T); const moving = ci === 6 || (ci === 7 && T < E.guard + 0.3);
  R.dL.visible = true; R.dL.rotation.y = ci === 5 && T < E.leaves ? -1.3 : ci === 3 || ci === 4 || ci === 0 || loop ? -1.3 : -0.05; R.dR.rotation.y = ci <= 5 || loop ? 0.35 : 0.05;
  // searchlight
  const aim = slAim(T); R.slT.position.set(aim[0] - YX, aim[1], aim[2]); R.slHead.lookAt(aim[0], aim[1], aim[2]);
  const from = new T3.Vector3(); R.slHead.getWorldPosition(from); const to = new T3.Vector3(...aim); const mid = from.clone().lerp(to, 0.5); const len = from.distanceTo(to); R.slBeam.position.copy(mid).sub(R.yardG.position); R.slBeam.scale.set(1, len / 22, 1); R.slBeam.quaternion.setFromUnitVectors(new T3.Vector3(0, -1, 0), to.clone().sub(from).normalize()); R.slBeam.material.opacity = 0.11;
  R.shackle.position.y = 0.12; R.gate.rotation.y = -1.5; R.dex.visible = false; R.dexWin.intensity = 0;
  R.wins.forEach((m, i) => m.material.color.set('#f4d890')); R.alarm.forEach((a_, i) => { const on = Math.floor(T * 4 + i) % 2 === 0; a_.m.material.color.set(on ? '#ff3030' : '#401010'); a_.l.intensity = on ? 14 : 0; });
  R.smoke.forEach((m, i) => { const ph = (T * (moving ? 2 : 0.8) + i / 8) % 1; m.position.set(0.8 + ph * 0.3, 0.3 + ph * 1.2, -3 - ph * (moving ? 2 : 0.6)); m.scale.setScalar(0.4 + ph * 1.2); m.material.opacity = 0.35 * (1 - ph); });
  // jacket: in hand, flying, then snagged on the wire (guards pull it in the flash-forward)
  const j = jacketPos(T); R.jk.visible = !!j; if (j) { R.jk.position.set(...j); const k = ci === 2 ? prog(T, E.threw + 0.05, E.threw + 0.7) : 1; R.jk.rotation.set(k * 6 * (1 - k) + 0.2, 0.3, (1 - k) * 4 + 0.15); if (k >= 1) R.jk.rotation.set(0.25, 0.15, 0.2 + 0.05 * S(T * 3)); if (ci === 0 || loop) R.jk.position.y = JK[1] - 0.15 + 0.08 * Math.abs(S(T * 5)); }
  // guards run out of the block and swarm the fence
  const GF = [[-1.8, -16.6], [-0.6, -16.9], [0.6, -16.5]]; const run0 = ci === 0 || loop ? 1 : ci < 3 ? -1 : prog(T, E.c3 + 0.3, E.c4 + 1.0);
  R.guards.forEach((p, i) => { pose(p); p.visible = run0 >= 0; if (!p.visible) return; const st = [-2 + i * 2, 4]; const k = ease(run0); p.position.set(lerp(st[0], GF[i][0], k), 0, lerp(st[1], GF[i][1], k)); p.rotation.y = PI + 0.15 * (i - 1); const u = p.userData;
    if (k < 1) run(p, T * 11 + i, 1.1); else { u.armR.rotation.set(-2.0 - 0.3 * i, 0, 0.1); u.armR.userData.e.rotation.x = -0.4; if (i === 1) { u.armL.rotation.set(-2.9, 0, 0.2); u.armR.rotation.set(-2.9, 0, -0.2); u.armL.userData.e.rotation.x = -0.2 + 0.2 * S(T * 8); } }
    if (i === 0) u.mouth.scale.y = (ci === 4 && !loop) ? 3 + 2 * Math.abs(S(T * 20)) : 1; });
  R.gL.intensity = (ci === 0 || loop || ci >= 4) ? 80 : 0; R.gL.position.set(-0.6, 2.2, -16.2);
  // the driver: in the cab, then jumps out and runs to the fence
  pose(R.driver); const dk = ci < 5 && !loop ? -1 : ci === 5 ? prog(T, E.c5 + 0.1, E.leaves + 0.6) : 1; R.driver.visible = dk >= 0 && ci <= 5 && !loop;
  if (R.driver.visible) { const a = [-4.3, -13.5], b = [-3.6, -14.6], c = [-2.4, -16.4]; const k = dk; const p = k < 0.35 ? L3([...a, 0], [...b, 0], k / 0.35) : L3([...b, 0], [...c, 0], (k - 0.35) / 0.65); R.driver.position.set(p[0], 0, p[1]); R.driver.rotation.y = k < 0.35 ? PI - 0.6 : PI - 0.6; run(R.driver, T * 11, 1.2); }
  R.cabCap.visible = ci === 5 && T > E.leaves - 0.1;
  // gate guard steps out with a torch and comes to the window
  pose(R.gg); const gk = ci < 7 ? -1 : ci === 7 ? prog(T, E.steps - 0.1, E.torch + 0.6) : 1; R.gg.visible = gk >= 0 && !loop; R.ggL.intensity = 0;
  if (R.gg.visible) { const a = [BARX + 1, -7.3], b = [tx(T) - 2.4, -10.1]; R.gg.position.set(lerp(a[0], b[0], ease(gk)), 0, lerp(a[1], b[1], ease(gk))); R.gg.rotation.y = gk < 1 ? -2.2 : PI; if (gk < 1) run(R.gg, T * 7, 0.5); const u = R.gg.userData; if (gk >= 1) { u.armR.rotation.set(-1.4, 0, 0.3); u.armR.userData.e.rotation.x = -0.3; if (ci === 8 || T > E.wants) { u.armL.rotation.set(-1.2, 0, -0.2); } }
    const cp = camera.position; R.ggL.position.copy(R.gg.position).add(new T3.Vector3(0.25, 1.4, -0.3)); R.ggLT.position.set(cp.x - YX, cp.y, cp.z); R.ggL.intensity = gk > 0.5 ? 20 : 0; }
  R.bar.rotation.y = 0;
  vmPose(T); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); R.truck.position.x = tx(T); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
""")

# 4. HUD
region("function hud(T) {", "function likePill", r"""function hud(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 250, 64, 32); octx.fill(); octx.strokeStyle = '#e8641e'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . PART 5', 149, 69, 26, '#ff9a5a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.18 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  const fooled = !loop && ((ci === 2 && T > E.lightF) || (ci >= 3 && ci <= 6)) || loop || ci === 0; const atGate = ci >= 7 && !loop; const lbl = atGate ? 'GUARD AT GATE' : fooled ? 'GUARDS FOOLED' : 'GUARDS ALERTED';
  octx.save(); octx.fillStyle = fooled && !atGate ? 'rgba(10,80,30,0.9)' : 'rgba(120,0,0,0.9)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt(lbl, 583, 156, 22, Math.floor(T * 4) % 2 ? '#fff' : (fooled && !atGate ? '#9af0b0' : '#ff8a7a')); octx.restore();
  const items = [['KEYS', 1], ['GATE', 1], ['DEX', -1], ['DECOY', loop || ci === 0 || ci >= 3 || (ci === 2 && T > E.lightF) ? 1 : 0], ['TRUCK', loop || ci === 0 || ci >= 4 || (ci === 3 && T > E.climbed) ? 1 : 0], ['UNIFORM', !loop && ci >= 6 ? 1 : 0]];
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 116, 196, 306, 18); octx.fill();
  items.forEach(([s_, d], i) => { txt(d > 0 ? '✓' : d < 0 ? '✗' : '□', 50, 151 + i * 46, 26, d > 0 ? '#5ad88a' : d < 0 ? '#ff4a4a' : '#9a9aa8'); txt(s_, 78, 152 + i * 46, 24, d > 0 ? '#fff' : d < 0 ? '#ff8a8a' : '#9a9aa8', 'left'); if (d < 0) { octx.fillStyle = '#ff4a4a'; octx.fillRect(74, 151 + i * 46, 62, 3); } }); octx.restore();
  if (ci >= 6 && ci <= 7 && !loop) { const m = Math.max(0, Math.round(50 * (1 - prog(T, E.engine - 0.2, E.guard + 0.3)))); octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(470, 212, 226, 64, 22); octx.fill(); txt('GATE ' + m + ' M', 583, 245, 26, '#ffd27a'); octx.restore(); } }
""")
# 5. captions
rep("const SEQ = [[['thirty', 'seconds'], '30 seconds'], [['thirty', 'metres'], '30 metres']];", "const SEQ = [[['sixty', 'seconds'], '60 seconds'], [['fifty', 'metres'], '50 metres']];")
rep("VWHO = { bm_george: 'DEX', am_onyx: 'REYES' }", "VWHO = { bm_george: 'DEX', am_onyx: 'GUARD' }")
rep("Dex|Officer|Reyes|C|A", "Dex|Officer|Reyes|ID|C|A")
# 6. init
rep("build(); build2();", "build(); build2(); build3();")
# 7. render overlays
rep("!loop && ![2, 9, 12, 13].includes(si)", "!loop && ![3, 5, 10, 12].includes(si)")
region("  if (ci === 0 || loop || (ci === 6 && T > E.light && T < E.yard)) {", "  const cap = CAPS.find", r"""  if (ci === 1 && !loop) { const g_ = 0.22 * ease(prog(T, E.found - 0.2, E.found + 0.4)); octx.fillStyle = `rgba(255,248,225,${g_})`; octx.fillRect(0, 0, W, H); }
  if (ci >= 7 && !loop && R.gg.visible) { const g_ = 0.1 * ease(prog(T, E.torch, E.torch + 0.6)); octx.fillStyle = `rgba(255,244,215,${g_})`; octx.fillRect(0, 0, W, H); }
  if (ci === 4 && !loop) { octx.fillStyle = `rgba(160,0,0,${0.05 + 0.05 * Math.max(0, S(T * 8))})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big("YOU'RE NOT ON THAT FENCE", 470, 44, '#ff4a4a', 1); if (!loop && T > E.think - 0.1) big('THE GUARDS THINK YOU ARE', 540, 36, '#fff', prog(T, E.think - 0.1, E.think + 0.1)); }
  if (ci === 1) big('60 SECONDS AGO', 470, 54, '#ffd27a', prog(T, E.recap, E.recap + 0.2));
  if (ci === 2 && T > E.threw) { big('THE JACKET TRICK', 470, 52, '#ff9a5a', prog(T, E.threw, E.threw + 0.15)); if (T > E.lightF - 0.1) { const a = ease(prog(T, E.lightF - 0.1, E.lightF + 0.2)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(6,6,10,0.85)'; octx.beginPath(); octx.roundRect(170, 520, 380, 54, 27); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 2; octx.stroke(); txt('IDEA FROM THE COMMENTS', 360, 548, 22, '#ffd27a'); octx.restore(); } }
  if (ci === 3 && T > E.climbed - 0.1) big('LAUNDRY TRUCK', 470, 56, '#9ad0ff', prog(T, E.climbed - 0.1, E.climbed + 0.1));
  if (ci === 5 && T > E.cap - 0.1) big('CAP + JACKET', 470, 56, '#9ad0ff', prog(T, E.cap - 0.1, E.cap + 0.1));
  if (ci === 6 && T > E.driver - 0.15) big("YOU'RE THE DRIVER", 470, 50, '#5ad88a', prog(T, E.driver - 0.15, E.driver + 0.05));
  if (ci === 7 && T > E.wants - 0.1) big('ID, PLEASE', 470, 60, '#ff4a4a', prog(T, E.wants - 0.1, E.wants + 0.1));
  if (ci === 8 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. FLOOR IT' : 'B. HAND OVER THE ID', 470, 52, A ? '#ff9a5a' : '#7ad0ff', 1); big(A ? 'THROUGH THE BARRIER' : 'AND KEEP YOUR HEAD DOWN', 540, 36, '#fff', 1); } else big('COMMENT A OR B', 470, 64, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
""")
open('scenes.js', 'w').write(s)
print('ok')
