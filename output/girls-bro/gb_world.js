
// ---------- timing ----------
const E = { bro0: AT(0, 'and'), jacket: AT(1, 'jacket'), clever: AT(1, 'clever'), much3: AT(3, 'much'), bin: AT(4, 'bin'), much5: AT(5, 'much'), sw: AT(6, 'they'), past: AT(7, 'walks'), she: AT(7, 'she'), charger: AT(7, 'charger') };
for (let i = 0; i < CL.length; i++) E['c' + i] = CL[i].start; E.loop = TM.total - 0.4;
function heartTex() { return ctex(64, 64, (c) => { c.fillStyle = '#ff4a7a'; c.beginPath(); c.moveTo(32, 54); c.bezierCurveTo(4, 34, 10, 8, 32, 20); c.bezierCurveTo(54, 8, 60, 34, 32, 54); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 3; c.stroke(); }); }
function signTex(t, bg) { return ctex(160, 90, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 160, 90); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(3, 3, 154, 84); c.fillStyle = '#111'; c.font = '46px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 80, 48); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff4e4', 2.3); R.sun.position.set(6, 12, 8); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -14; sc.right = sc.top = 14; sc.near = 1; sc.far = 50; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#dceeff', '#8a8a70', 1.4); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab4f0'); g.addColorStop(0.6, '#cfe8fa'); g.addColorStop(1, '#eef4e8'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); add(scene, Sp(600, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  const G = R.G = new T3.Group(); scene.add(G); add(G, Bx(80, 0.2, 40), FS('#9ac86a'), 10, -0.1, 0, false); add(G, Bx(80, 0.21, 4), FS('#c8c0b0'), 10, -0.095, 0.3, false); add(G, Bx(80, 0.22, 5), FS('#5a5a62'), 10, -0.09, 5.2, false); for (let x = -20; x < 40; x += 3) add(G, Bx(1.5, 0.23, 0.15), FS('#f0f0e8'), x, -0.085, 5.2, false);
  const sc_ = ['#e8a87a', '#8ac0d8', '#e8d07a', '#c89ae8', '#9ad8a8', '#f0a0a8']; for (let i = 0; i < 9; i++) { const x = -10 + i * 5.2, h = 3.5 + (i % 3) * 1.2; add(G, Bx(5, h, 3), FS(sc_[i % 6]), x, h / 2, -3.4); add(G, Bx(3.2, 1.4, 0.1), FS('#cfe8f4'), x, 1.2, -1.88); add(G, Bx(1.0, 1.8, 0.1), FS('#7a5a3a'), x + 1.9, 0.9, -1.88); add(G, Bx(5.1, 0.25, 0.8), FS(['#d83a3a', '#3a8ad8', '#3aa85a'][i % 3]), x, 2.2, -1.6); }
  for (let i = 0; i < 7; i++) { const x = -8 + i * 7; add(G, Cy(0.12, 0.15, 1.6, 6), FS('#8a6040'), x, 0.8, 1.9); add(G, new T3.IcosahedronGeometry(0.9, 0), FS('#4aa04a'), x, 2.2, 1.9); }
  R.bin = new T3.Group(); R.bin.position.set(4.6, 0, 0.4); G.add(R.bin); add(R.bin, Cy(0.28, 0.24, 0.8, 10), FS('#3a7a4a'), 0, 0.4, 0); add(R.bin, Cy(0.31, 0.31, 0.06, 10), FS('#2a5a3a'), 0, 0.82, 0);
  add(G, Bx(1.8, 0.08, 0.5), FS('#a8784a'), -2.6, 0.45, -0.8); for (const x of [-3.3, -1.9]) add(G, Bx(0.08, 0.45, 0.4), FS('#555'), x, 0.22, -0.8);
  R.tumble = add(G, new T3.IcosahedronGeometry(0.35, 1), new T3.MeshStandardMaterial({ color: '#a8885a', wireframe: true }), 0, 0.35, -0.6, false);
  // people: you, bro, five girls, three paid fans (all white, messy hair)
  R.you = person({ top: '#3a5aa8', bot: '#2a3242', hair: '#3a2416' }); G.add(R.you); R.bro = person({ top: '#3a9a4a', bot: '#3a3a40', hair: '#141010', cap: '#d83a3a', capBack: 1, build: 1.12 }); G.add(R.bro);
  R.jacket = new T3.Group(); G.add(R.jacket); add(R.jacket, Bx(0.5, 0.56, 0.3), FS('#6a4028'), 0, 0.28, 0); for (const sx of [-1, 1]) add(R.jacket, Bx(0.17, 0.24, 0.19), FS('#6a4028'), sx * 0.26, 0.4, 0);
  const gc = [['#e86aa8', '#3a3a5a', '#e8c870'], ['#c87ae8', '#2a2a3a', '#8a4a1a'], ['#f0a050', '#3a4a6a', '#141010'], ['#5ac8c8', '#4a3a5a', '#c84a1a'], ['#e8e8f0', '#d84a6a', '#5a3a1a']];
  R.girls = gc.map(([t_, b_, h_], i) => { const p = person({ top: t_, bot: b_, hair: h_ }); G.add(p); return p; });
  R.fans = []; for (let i = 0; i < 3; i++) { const p = person({ top: ['#8a8a92', '#c8a050', '#6a8ac8'][i], bot: '#3a3a40', hair: ['#3a2416', '#141010', '#8a6a3a'][i] }); G.add(p); const sg = new T3.Group(); p.userData.armR.userData.e.add(sg); sg.position.set(0, -0.32, 0.05); add(sg, Bx(0.03, 0.6, 0.03), FS('#8a6040'), 0, 0.15, 0); const mk = (t_, bg) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: signTex(t_, bg) })); s.scale.set(0.62, 0.36, 1); G.add(s); return s; }; p.userData.sA = mk('BRO!', '#ffd23a'); p.userData.sB = mk('YOU!', '#ff8ab0'); R.fans.push(p); }
  R.charger = new T3.Group(); G.add(R.charger); add(R.charger, Bx(0.1, 0.08, 0.06), FS('#f4f4f4'), 0, 0, 0); add(R.charger, Cy(0.008, 0.008, 0.4, 6), FS('#f4f4f4'), 0, -0.2, 0);
  const ht = heartTex(); R.hearts = []; for (let i = 0; i < 12; i++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: ht, transparent: true })); s.scale.setScalar(0.25); G.add(s); R.hearts.push(s); }
}
