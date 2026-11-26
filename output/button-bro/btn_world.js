
// ---------- timing ----------
const E = { million0: AT(0, 'million'), c1: CL[1].start, bro1: AT(1, 'bro'), c2: CL[2].start, p1: AT(2, 'press') + 0.15, bro2: AT(2, 'bro'), c3: CL[3].start, p2: AT(3, 'again'), house: AT(3, 'he'),
  c4: CL[4].start, p3: AT(4, 'again'), renames: AT(4, 'he'), broSt: AT(4, 'bro'), c5: CL[5].start, billion: AT(5, 'bro'), c6: CL[6].start, c7: CL[7].start, c8: CL[8].start, comment: AT(8, 'comment') };
E.loop = TM.total - 0.4;
E.mont = []; for (let i = 0; i < 7; i++) E.mont.push(E.c5 + 0.35 + i * 0.36);
const PRESSES = [E.p1, E.p2, E.p3, ...E.mont];
const nPress = T => T >= E.loop ? 0 : PRESSES.filter(p => T >= p).length;
const fmt = m => m >= 1000 ? '£' + (m / 1000).toFixed(2) + 'B' : '£' + m + 'M';
function billTex() { return ctex(128, 64, (c, w, h) => { c.fillStyle = '#6ac46a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a7a3a'; c.lineWidth = 4; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = '#2a7a3a'; c.beginPath(); c.arc(64, 32, 16, 0, 7); c.fill(); c.fillStyle = '#d8f4c8'; c.font = '24px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£', 64, 33); }); }
function signTex(t, bg = '#2a8a4a') { return ctex(256, 72, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#fff'; c.font = '44px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.6); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -7; sc.right = sc.top = 7; sc.near = 1; sc.far = 40; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#8a6a5a', 1.25); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ab8f0'); g.addColorStop(0.45, '#bfe0f8'); g.addColorStop(0.55, '#ffe6c0'); g.addColorStop(1, '#f4c890'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  add(scene, Sp(80, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Cy(9, 9, 0.2, 64), SM('#8ad06a'), 0, -0.1, -2, false); add(G, Cy(3.2, 3.2, 0.06, 64), SM('#f4e2b8'), 0, 0.03, 0.2, false); add(G, Cy(3.0, 3.0, 0.065, 64), SM('#f8ecd0'), 0, 0.035, 0.2, false);
  // the button
  add(G, Cy(0.5, 0.6, 0.1, 32), SM('#3a3e4a'), 0, 0.05, 0); add(G, Cy(0.28, 0.34, 0.95, 32), SM('#e8e8ee'), 0, 0.55, 0); add(G, Cy(0.38, 0.38, 0.12, 32), SM('#ffd23a'), 0, 1.06, 0); add(G, Cy(0.34, 0.34, 0.03, 32), SM('#222'), 0, 1.13, 0);
  R.btn = add(G, new T3.SphereGeometry(0.26, 32, 16, 0, PI * 2, 0, PI / 2), SM('#e8282a', { emissive: '#ff2a2a', emissiveIntensity: 0.15 }), 0, 1.13, 0); R.btn.scale.y = 0.7;
  R.btnGlow = spr(G, GLOW, '#ff5a3a', 1.6, 0, 1.25, 0, 0);
  // you and bro
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you); R.bro = human({ top: '#2aa84a', bot: '#3a3a44', hair: '#1a1210', skin: '#c88a60' }); G.add(R.bro);
  // bro bling: gold chain + shades (shown when rich)
  const bu = R.bro.userData; R.chain = add(bu.up, new T3.TorusGeometry(0.15, 0.022, 8, 24), SM('#ffc83a', { metalness: 0.8, roughness: 0.25, emissive: '#6a4a00', emissiveIntensity: 0.3 }), 0, 0.55, 0.06); R.chain.rotation.x = 1.25; R.chain.scale.set(1, 1.2, 1);
  R.shades = new T3.Group(); bu.head.add(R.shades); for (const sx of [-1, 1]) add(R.shades, Bx(0.085, 0.05, 0.02), SM('#111'), sx * 0.052, 0.012, 0.145); add(R.shades, Bx(0.04, 0.012, 0.02), SM('#111'), 0, 0.025, 0.145);
  R.phone = new T3.Group(); R.you.userData.armR.userData.h.add(R.phone); R.phone.position.set(-0.02, -0.06, 0.05); add(R.phone, RB(0.09, 0.17, 0.014, 0.012), SM('#1a1a1e'), 0, 0, 0);
  // cash piles
  const bm = SM('#ffffff', { map: billTex() }), side = SM('#4aa04a'); R.youCash = []; R.broCash = [];
  const brick = (p, x, y, z) => { const m = new T3.Mesh(Bx(0.32, 0.08, 0.16), [side, side, bm, side, side, side]); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  for (let i = 0; i < 20; i++) R.youCash.push(brick(G, -1.25 + (i % 2) * 0.34, 0.08 + Math.floor(i / 2) * 0.085, 0.75));
  for (let i = 0; i < 64; i++) { const lay = Math.floor(i / 16), k = i % 16; R.broCash.push(brick(G, 1.25 + (k % 4) * 0.34 - lay * 0.0, 0.08 + lay * 0.085, 0.35 + Math.floor(k / 4) * 0.17)); }
  R.throne = new T3.Mesh(Bx(1.4, 1.0, 1.0), [side, side, SM('#ffffff', { map: (() => { const t = billTex(); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(4, 6); return t; })() }), side, SM('#ffffff', { map: (() => { const t = billTex(); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(4, 12); return t; })() }), side]); R.throne.position.set(1.4, 0.5, 0.2); R.throne.castShadow = true; G.add(R.throne);
  // the house bro buys (your house) and the street sign
  const hs = R.house = new T3.Group(); hs.position.set(2.2, 0, -3.6); G.add(hs); add(hs, Bx(3, 2.2, 2.4), SM('#f4ecd8'), 0, 1.1, 0); const roof = add(hs, Cy(0.01, 2.4, 1.4, 4), SM('#c8463a'), 0, 2.9, 0); roof.rotation.y = PI / 4; roof.scale.set(1.3, 1, 1.05);
  add(hs, Bx(0.6, 1.1, 0.05), SM('#7a4a2a'), 0, 0.55, 1.21); for (const x of [-0.95, 0.95]) { add(hs, Bx(0.6, 0.55, 0.05), SM('#8ac8f0'), x, 1.35, 1.21); add(hs, Bx(0.7, 0.08, 0.08), SM('#ffffff'), x, 1.05, 1.24); }
  R.sold = new T3.Group(); R.sold.position.set(-1.3, 0, 1.8); hs.add(R.sold); add(R.sold, Bx(0.06, 1.1, 0.06), SM('#7a4a2a'), 0, 0.55, 0); R.soldM = add(R.sold, new T3.PlaneGeometry(0.9, 0.3), BM('#ffffff', { map: signTex("BRO'S NOW", '#d8282a') }), 0, 1.0, 0.04, false);
  R.street = new T3.Group(); R.street.position.set(-2.0, 0, -1.2); G.add(R.street); add(R.street, Cy(0.04, 0.04, 2.6, 10), SM('#8a8e94'), 0, 1.3, 0); R.stA = add(R.street, new T3.PlaneGeometry(1.2, 0.34), BM('#ffffff', { map: signTex('MAPLE ST') }), 0, 2.45, 0.05, false); R.stB = add(R.street, new T3.PlaneGeometry(1.2, 0.34), BM('#ffffff', { map: signTex('BRO ST') }), 0, 2.45, 0.05, false);
  // money rain
  R.rain = []; for (let i = 0; i < 46; i++) { const m = add(G, new T3.PlaneGeometry(0.22, 0.11), new T3.MeshBasicMaterial({ map: billTex(), side: T3.DoubleSide }), 0, -5, 0, false); m.castShadow = false; R.rain.push(m); }
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [0.05, 1.5, 1.7], [0.04, 1.42, 1.25], [0, 1.08, 0], [0, 1.1, 0])],
  [E.c1 - 0.05, (k, T) => TR(k, [0.2, 1.65, 4.6], [0.2, 1.6, 4.2], [0.2, 0.95, 0], [0.2, 0.95, 0])],
  [E.c2, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.bro2 - 0.1, (k, T) => TR(k, [1.0, 1.5, 3.0], [1.0, 1.5, 2.7], [1.2, 1.0, 0.3], [1.2, 1.0, 0.3])],
  [E.c3 - 0.05, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.house - 0.6, (k, T) => TR(k, [0.4, 2.0, 6.4], [0.5, 2.2, 6.0], [1.4, 1.4, -2], [1.4, 1.6, -2])],
  [E.c4 - 0.05, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.renames - 0.1, (k, T) => TR(k, [-1.4, 2.1, 1.6], [-1.5, 2.2, 1.2], [-2.0, 2.2, -1.2], [-2.0, 2.4, -1.2])],
  [E.c5, (k, T) => { const sh = 0.02 * S(T * 60); look([-0.2 + sh, 1.7, 1.25], [-0.1, 1.1, 0]); }],
  [E.billion - 0.15, (k, T) => TR(k, [0.6, 1.6, 3.6], [0.8, 1.5, 3.0], [1.4, 1.3, 0.2], [1.4, 1.4, 0.2])],
  [E.c6, (k, T) => TR(k, [-0.4, 1.6, 1.4], [-0.45, 1.58, 1.15], [-0.78, 1.5, 0.1], [-0.78, 1.5, 0.1])],
  [E.c8, (k, T) => TR(k, [0.2, 1.9, 5.2], [0.2, 1.75, 4.6], [0.2, 1.0, 0], [0.2, 1.0, 0])],
  [E.loop, (k, T) => look([0.05, 1.5, 1.7], [0, 1.08, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T), n = nPress(T); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData; rest(you); rest(bro);
  // button press: last press time drives the hand + button travel
  const lp = PRESSES.filter(p => T >= p - 0.15).pop(); const pk = lp !== undefined && !loop ? Math.max(0, 1 - Math.abs(T - lp) / 0.15) : 0; R.btn.position.y = 1.13 - 0.07 * pk; R.btnGlow.material.opacity = (ci === 0 || ci === 8 || loop ? 0.35 + 0.2 * S(T * 5) : 0) + pk * 0.8;
  you.position.set(-0.62, 0, 0.12); you.rotation.y = PI / 2 - 0.35; face(you, 'neutral', T);
  const reach = ci === 0 || loop ? 0.55 : (lp !== undefined && T - lp < 0.5 && T - lp > -0.2 ? 1 : 0.25); u.armR.rotation.set(-1.0 - 0.6 * reach + 0.5 * pk, 0, 0.25); u.armR.userData.e.rotation.x = -0.4 + 0.3 * pk; u.up.rotation.x = 0.08 + 0.12 * pk;
  bro.visible = !(ci === 0 || loop) && !(ci === 1 && T < E.bro1 - 0.1); const pop = ci === 1 ? ease(prog(T, E.bro1 - 0.1, E.bro1 + 0.15)) : 1; bro.scale.setScalar(Math.max(0.01, pop)); bro.position.set(0.95, 0, 0.15); bro.rotation.y = -0.55; face(bro, 'grin', T);
  const rich = n >= 4 || ci >= 5; R.chain.visible = n >= 2 && !loop; R.shades.visible = rich && !loop;
  if (lp !== undefined && T - lp > 0 && T - lp < 0.6 && !loop) { bro.position.y = 0.25 * S(PI * prog(T, lp, lp + 0.45)); b.armL.rotation.set(-2.8, 0, 0.2); b.armR.rotation.set(-2.8, 0, -0.2); }
  if (ci === 5 && T > E.billion - 0.15 || ci >= 6 && !loop) { seatPose(bro, 1.0); bro.position.x = 1.4; bro.position.z = 0.25; bro.rotation.y = -0.35; b.armL.rotation.set(-0.4, 0, -0.9); b.armR.rotation.set(-0.4, 0, 0.9); face(bro, 'smug', T); }
  if (ci === 7) { b.armR.rotation.set(-1.4, 0, 0.2); b.armR.userData.e.rotation.x = -1.3; face(bro, 'smug', T); b.mouth.scale.y = 1 + Math.abs(S(T * 16)) * 1.6; }
  if (ci >= 3 && ci <= 5) face(you, 'shock', T); if (ci === 6 || ci === 7) { R.phone.visible = true; u.armR.rotation.set(-1.15, 0, 0.25); u.armR.userData.e.rotation.set(-1.25, 0, 0); you.rotation.y = 0.3; face(you, 'shock', T); u.head.rotation.x = 0.2; } else R.phone.visible = false;
  if (ci === 8) { you.rotation.y = 0.4; face(you, 'neutral', T); u.armR.rotation.set(-0.9, 0, 0.25); }
  // cash piles: you grow by 1 per press, bro doubles
  const yN = Math.min(20, n * 2); R.youCash.forEach((m, i) => m.visible = i < yN && !loop); const bN = Math.min(64, Math.round(2 ** n)); R.broCash.forEach((m, i) => m.visible = i < bN && !loop && !(ci >= 5 && T > E.billion - 0.15));
  R.throne.visible = !loop && (ci >= 6 || (ci === 5 && T > E.billion - 0.15)); if (R.throne.visible) R.throne.scale.setScalar(ci === 5 ? 0.3 + 0.7 * ease(prog(T, E.billion - 0.15, E.billion + 0.2)) : 1);
  // house drops in, sign says it's bro's now
  const hk = ci < 3 || loop ? -1 : ci === 3 ? prog(T, E.house - 0.4, E.house + 0.1) : 1; R.house.visible = hk >= 0; R.house.position.y = hk >= 0 ? (hk < 1 ? lerp(9, 0, hk * hk) : 0.12 * Math.max(0, S((T - E.house - 0.1) * 18)) * Math.exp(-(T - E.house - 0.1) * 6)) : 0; R.sold.visible = hk >= 1 && T > E.house + 0.35 || ci > 3;
  R.street.visible = ci >= 4 && !loop; const flip = ci > 4 || (ci === 4 && T > E.broSt - 0.1); R.stA.visible = !flip; R.stB.visible = flip; R.street.rotation.y = ci === 4 ? 0.0 + (Math.abs(T - E.broSt) < 0.2 ? (0.2 - Math.abs(T - E.broSt)) * 15 : 0) : 0;
  // money rain once bro is a billionaire
  const rainOn = !loop && (ci === 5 && T > E.billion - 0.3 || ci >= 6); R.rain.forEach((m, i) => { m.visible = rainOn; if (!rainOn) return; const ph = (T * 0.35 + i * 0.137) % 1; m.position.set(1.4 + S(i * 2.3) * 2.2, 4.2 - ph * 4.4, 0.2 + C(i * 1.7) * 1.6); m.rotation.set(T * 3 + i, T * 2 + i * 0.5, S(T * 4 + i)); }); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
