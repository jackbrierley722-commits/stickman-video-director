
// ---------- timing ----------
const E = { here: AT(0, "here's"), c1: CL[1].start, c2: CL[2].start, centre: AT(2, 'centre'), c3: CL[3].start, sun: AT(3, 'sun'), pressure: AT(3, 'pressure'), c4: CL[4].start, c5: CL[5].start, pop: AT(5, 'pop'),
  c6: CL[6].start, forever: AT(6, 'forever'), every: AT(6, 'every'), sheep: AT(6, 'sheep'), c7: CL[7].start };
E.loop = TM.total - 0.4;
const EG = [500, 0, 0], TG = [1000, 0, 0], NG = [1500, 0, 0];
// fall progress along the tunnel (0 = UK, 0.5 = centre, 1 = New Zealand)
function fallP(T) { if (T < E.c1) return 0; if (T < E.c2) return 0.01 * prog(T, E.c1, E.c2); if (T < E.c3) return lerp(0.01, 0.44, prog(T, E.c2, E.c3) ** 1.6); if (T < E.c4) return lerp(0.44, 0.49, prog(T, E.c3, E.c4)); if (T < E.c5) return 0.5; if (T < E.pop) return lerp(0.5, 1, prog(T, E.c5, E.pop)); return 1; }
const speedAt = p => Math.round(28000 * S(PI * clamp(p)));
function tempAt(p) { const d = 1 - Math.abs(1 - 2 * p); return Math.round(d < 0.03 ? lerp(15, 900, d / 0.03) : d < 0.45 ? lerp(900, 3700, (d - 0.03) / 0.42) : d < 0.81 ? lerp(4000, 5000, (d - 0.45) / 0.36) : lerp(5000, 5200, (d - 0.81) / 0.19)); }
function earthTex() { return ctex(1024, 512, (c, w, h) => { c.fillStyle = '#2f7ad8'; c.fillRect(0, 0, w, h); const r = rng(4); for (const [cx, cy, s] of [[180, 160, 70], [250, 330, 55], [520, 150, 60], [540, 300, 60], [720, 170, 110], [830, 360, 45], [430, 80, 40]]) { c.fillStyle = '#4fae4a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(cx + (r() - 0.5) * s * 2, cy + (r() - 0.5) * s, s * (0.25 + r() * 0.35), 0, 7); c.fill(); } } c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, w, 24); c.fillRect(0, h - 26, w, 26); }); }
function labelTex(t, bg, fg = '#fff', w = 256, h = 72, sz = 40) { return ctex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 16); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 5; c.stroke(); c.fillStyle = fg; c.font = `${sz}px Russo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
function sheep() { const g = new T3.Group(); const wool = SM('#f4f2ec'), dark = SM('#2a2624'); for (let i = 0; i < 7; i++) add(g, Sp(0.28, 12, 10), wool, S(i * 1.9) * 0.22, 0.75 + C(i * 2.3) * 0.08, -0.25 + i * 0.09); const head = new T3.Group(); head.position.set(0, 0.85, 0.45); g.add(head); add(head, Bx(0.22, 0.26, 0.32), dark, 0, 0, 0.08); for (const sx of [-1, 1]) { add(head, Bx(0.14, 0.05, 0.08), dark, sx * 0.16, 0.06, 0.0); add(head, Sp(0.035, 8, 6), SM('#ffffff'), sx * 0.08, 0.06, 0.24, false); add(head, Sp(0.018, 6, 4), new T3.MeshBasicMaterial({ color: '#111' }), sx * 0.08, 0.06, 0.27, false); }
  for (const [x, z] of [[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]]) add(g, Bx(0.08, 0.5, 0.08), dark, x, 0.25, z); g.userData = { head }; return g; }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.4); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#7a6a5a', 1.2); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab0f0'); g.addColorStop(0.5, '#cfe8fa'); g.addColorStop(1, '#e8f0e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(2600, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- field with the hole (UK) ----
  const F = R.F = new T3.Group(); scene.add(F); add(F, Cy(30, 30, 0.2, 48), SM('#7ac85a'), 0, -0.1, 0, false); add(F, Cy(1.45, 1.6, 0.25, 32), SM('#8a6040'), 0, 0.02, 0); add(F, Cy(1.2, 1.2, 0.3, 32), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 0.06, 0, false);
  const sgn = new T3.Group(); sgn.position.set(-1.9, 0, 0.6); F.add(sgn); add(sgn, Bx(0.08, 1.3, 0.08), SM('#7a4a2a'), 0, 0.65, 0); add(sgn, new T3.PlaneGeometry(1.0, 0.36), BM('#ffffff', { map: labelTex('DO NOT JUMP', '#ffd23a', '#111', 256, 92, 34) }), 0, 1.25, 0.05, false).rotation.y = 0.3;
  for (let i = 0; i < 10; i++) { const a = i * 0.7, d = 6 + (i % 4) * 3; add(F, Sp(0.8 + (i % 3) * 0.3, 10, 8), SM('#4a9a3a'), S(a) * d, 0.5, -Math.abs(C(a)) * d - 4); }
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(R.you);
  // ---- tunnel interior ----
  const TT = R.TT = new T3.Group(); TT.position.set(...TG); scene.add(TT); R.rockT = ctex(256, 256, (c, w, h) => { c.fillStyle = '#7a6a5a'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '40,30,20' : '160,140,120'},${0.15 + r() * 0.3})`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 14, 0, 7); c.fill(); } }); R.rockT.wrapS = R.rockT.wrapT = T3.RepeatWrapping; R.rockT.repeat.set(3, 10);
  R.tunM = new T3.MeshStandardMaterial({ map: R.rockT, side: T3.BackSide, roughness: 0.9, emissive: '#ff4a10', emissiveIntensity: 0 }); add(TT, new T3.CylinderGeometry(2.2, 2.2, 80, 24, 1, true), R.tunM, 0, 0, 0, false);
  R.tunL = new T3.PointLight('#ffffff', 25, 20, 1.2); R.tunL.position.set(0, 3, 0); TT.add(R.tunL); R.coreGlow = spr(TT, GLOW, '#ffe080', 9, 0, 0, 0, 0); R.streaks = []; for (let i = 0; i < 26; i++) R.streaks.push(add(TT, Bx(0.04, 1.4, 0.04), new T3.MeshBasicMaterial({ color: '#fff4d8', transparent: true, opacity: 0.6 }), 0, 0, 0, false));
  // ---- New Zealand island ----
  const N_ = R.N = new T3.Group(); N_.position.set(...NG); scene.add(N_); R.sea = add(N_, Cy(120, 120, 0.2, 64), SM('#2a7ac8', { roughness: 0.3, metalness: 0.2 }), 0, -1.2, 0, false); add(N_, Cy(5.5, 7, 2.4, 20), SM('#8a7a62'), 0, -0.2, 0); add(N_, Cy(5.6, 5.6, 0.3, 24), SM('#6ac85a'), 0, 1.05, 0);
  add(N_, Cy(1.45, 1.6, 0.25, 32), SM('#8a6040'), 0, 1.2, 0); add(N_, Cy(1.2, 1.2, 0.3, 32), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 1.25, 0, false);
  R.sheep = []; for (let i = 0; i < 8; i++) { const s = sheep(); s.position.set(1.9 + (i % 4) * 0.9 - (i > 3 ? 0.4 : 0), 1.2, 1.2 + Math.floor(i / 4) * 1.0 - i * 0.05); s.rotation.y = -2.2 + i * 0.12; N_.add(s); R.sheep.push(s); }
  R.hat = add(R.sheep[0].userData.head, new T3.ConeGeometry(0.12, 0.3, 12), SM('#e83a8a'), 0, 0.28, 0.05); for (let i = 0; i < 3; i++) add(N_, Cy(0.35, 0.35, 0.05, 12), SM('#ffffff'), -3 + i * 1.5, -1.05, 7 + i);
  R.nzSign = add(N_, new T3.PlaneGeometry(1.6, 0.45), BM('#ffffff', { map: labelTex('NEW ZEALAND', '#2a8a4a', '#fff', 320, 90, 36) }), -2.6, 2.4, 1.2, false); add(N_, Bx(0.08, 1.4, 0.08), SM('#7a4a2a'), -2.6, 1.7, 1.15);
}
// Earth cutaway is built after toonify so its clipping survives
function buildEarth() { const G = R.EG = new T3.Group(); G.position.set(...EG); scene.add(G); const clip = [new T3.Plane(new T3.Vector3(0, 0, -1), EG[2])];
  R.earth = add(G, Sp(10, 64, 40), new T3.MeshStandardMaterial({ map: earthTex(), roughness: 0.8, clippingPlanes: clip, side: T3.DoubleSide }), 0, 0, 0, false);
  for (const [r, col, em] of [[10, '#7a5a3a', 0], [9.75, '#c8502a', 0.15], [5.46, '#f08a2a', 0.35], [1.91, '#ffe060', 0.7]]) add(G, new T3.CircleGeometry(r, 64), new T3.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: em, roughness: 0.9 }), 0, 0, 0.01 + (10 - r) * 0.002, false);
  add(G, Bx(0.32, 20.2, 0.05), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 0, 0.04, false);
  R.dot = spr(G, GLOW, '#ff3a3a', 1.8, 0, 10, 0.3, 1); R.dot2 = add(G, Sp(0.28, 12, 10), new T3.MeshBasicMaterial({ color: '#ff3a3a' }), 0, 10, 0.3, false);
  for (const [t, y, bg] of [['UK', 11.5, '#c8282a'], ['NEW ZEALAND', -11.6, '#2a8a4a']]) add(G, new T3.PlaneGeometry(t === 'UK' ? 2.4 : 6.0, 1.6), BM('#ffffff', { map: labelTex(t, bg, '#fff', t === 'UK' ? 160 : 400, 100, 52) }), 0, y, 0.2, false);
  const eL = new T3.PointLight('#ffffff', 300, 60, 1.2); eL.position.set(5, 8, 25); G.add(eL); }
