
// ---------- timing ----------
const C_ = i => CL[i].start, E = { c: C_, ctrl: AT(3, "there's"), burning: AT(5, 'burning'), handUnder: AT(7, 'you'), disagree: AT(7, 'your'), moves: AT(11, 'she'), lava: AT(11, 'unfortunately'), turnDown: AT(12, 'you'), turnBack: AT(12, 'she'), sonar: AT(13, 'she'), out: AT(15, 'she'), stepIn: AT(15, 'and'), cut: AT(19, 'fucking') + 0.14 };
const END = E.cut; E.loop = 1e9;
const SC = [1.25, 0, -0.75]; // shower centre
function tileTex(col, line) { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = 4; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
function dialTex() { return ctex(256, 256, (c, w, h) => { c.fillStyle = '#e8e8ec'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); for (let i = 0; i < 40; i++) { const a = PI * 0.75 + i / 39 * PI * 1.5; const k = i / 39; c.strokeStyle = `rgb(${Math.round(60 + 195 * k)},${Math.round(120 - 60 * k)},${Math.round(230 - 200 * k)})`; c.lineWidth = 14; c.beginPath(); c.arc(128, 128, 100, a, a + 0.13); c.stroke(); }
  c.fillStyle = '#2a5ad8'; c.font = '28px Russo'; c.textAlign = 'center'; c.fillText('COLD', 70, 215); c.fillStyle = '#d83a2a'; c.fillText('LAVA', 186, 215); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff4e8', 1.8); R.sun.position.set(-3, 7, 5); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -6; sc.right = sc.top = 6; sc.near = 1; sc.far = 30; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#f0f4ff', '#8a8078', 1.5); scene.add(R.hemi); const bl = new T3.PointLight('#fff4e0', 8, 8, 1.4); bl.position.set(0, 2.7, 0.5); scene.add(bl);
  const G = R.G = new T3.Group(); scene.add(G); const wt = tileTex('#cfe4ea', '#a8c4cc'); wt.repeat.set(4, 2); const ft = tileTex('#8aa0b0', '#6a8090'); ft.repeat.set(6, 6);
  add(G, Bx(6, 0.1, 5), SM('#ffffff', { map: ft }), 0, -0.05, 0); add(G, Bx(6, 3, 0.1), SM('#ffffff', { map: wt }), 0, 1.5, -1.55); add(G, Bx(0.1, 3, 5), SM('#ffffff', { map: wt }), 2.1, 1.5, 0); add(G, Bx(0.1, 3, 5), SM('#e8dcd0'), -3, 1.5, 0);
  // shower enclosure: frosted lower glass (hides everything below the shoulders), clear top
  const frost = new T3.MeshStandardMaterial({ color: '#e4f0f6', roughness: 0.4, map: ctex(64, 64, (c) => { c.fillStyle = '#e4f0f6'; c.fillRect(0, 0, 64, 64); const r = rng(2); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(255,255,255,${r() * 0.5})`; c.fillRect(r() * 64, r() * 64, 2, 2); } }) }), clear = new T3.MeshStandardMaterial({ color: '#cfe8f4', transparent: true, opacity: 0.16, roughness: 0.05 });
  add(G, Bx(1.25, 1.42, 0.03), frost, 1.45, 0.71, 0.15, false); add(G, Bx(1.25, 0.95, 0.03), clear, 1.45, 1.9, 0.15, false); add(G, Bx(0.03, 1.42, 1.7), frost, 0.4, 0.71, -0.7, false); add(G, Bx(0.03, 0.95, 1.7), clear, 0.4, 1.9, -0.7, false);
  add(G, Bx(1.7, 0.08, 1.7), SM('#e8eef0'), 1.25, 0.04, -0.7); add(G, Bx(0.06, 2.4, 0.06), SM('#c8ccd2', { metalness: 0.8 }), 0.82, 1.2, 0.15);
  add(G, Cy(0.02, 0.02, 0.5, 8), SM('#c8ccd2', { metalness: 0.9 }), SC[0], 2.45, -1.3).rotation.x = PI / 2; add(G, Cy(0.17, 0.12, 0.08, 16), SM('#c8ccd2', { metalness: 0.9 }), SC[0], 2.4, -1.05);
  R.dial = new T3.Group(); R.dial.position.set(1.85, 1.65, -1.48); G.add(R.dial); add(R.dial, new T3.CircleGeometry(0.14, 32), BM('#ffffff', { map: dialTex() }), 0, 0, 0.01, false); R.knob = new T3.Group(); R.knob.position.z = 0.03; R.dial.add(R.knob); add(R.knob, Cy(0.05, 0.05, 0.05, 16), SM('#c8ccd2', { metalness: 0.8 }), 0, 0, 0).rotation.x = PI / 2; add(R.knob, Bx(0.018, 0.11, 0.02), SM('#222'), 0, 0.05, 0.03);
  R.drops = []; for (let i = 0; i < 70; i++) { const d = add(G, Bx(0.012, 0.16, 0.012), new T3.MeshBasicMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.7 }), 0, 0, 0, false); d.userData = { a: (i * 2.39) % (PI * 2), r: 0.04 + ((i * 0.618) % 1) * 0.2, ph: (i * 0.37) % 1 }; R.drops.push(d); }
  R.steam = []; for (let i = 0; i < 26; i++) R.steam.push(spr(G, GLOW, '#ffffff', 1.2, 0, 0, 0, 0, T3.NormalBlending));
  // sink, mirror, towel rail, door
  add(G, Bx(0.9, 0.8, 0.5), SM('#f4f0e8'), -1.3, 0.4, -1.25); add(G, Cy(0.28, 0.22, 0.12, 20), SM('#ffffff'), -1.3, 0.86, -1.25); add(G, Bx(0.7, 0.9, 0.03), SM('#cfe0e8', { metalness: 0.6, roughness: 0.1 }), -1.3, 1.75, -1.49);
  add(G, Bx(0.8, 0.03, 0.03), SM('#c8ccd2'), -2.95, 1.2, -0.4).rotation.y = PI / 2; add(G, Bx(0.05, 0.7, 0.6), SM('#e86a8a'), -2.93, 0.9, -0.4);
  add(G, Bx(0.06, 2.1, 0.9), SM('#c8a070'), -2.96, 1.05, 1.3); add(G, Sp(0.04), SM('#c8a040'), -2.9, 1.0, 0.95);
  // people: you (shirtless, towel) and her (long hair, behind the frosted glass)
  R.you = human({ top: '#e4b08a', bot: '#ffffff', hair: '#3a2416', skin: '#e4b08a', short: true }); scene.add(R.you);
  R.gf = human({ top: '#d8a07c', bot: '#d8a07c', hair: '#6a3a1e', skin: '#d8a07c', short: true }); scene.add(R.gf); const h = R.gf.userData.head, hm = SM('#6a3a1e');
  add(h, Bx(0.3, 0.38, 0.12), hm, 0, -0.1, -0.1); for (const sx of [-1, 1]) add(h, Bx(0.05, 0.3, 0.1), hm, sx * 0.145, -0.08, -0.07); add(h, Sp(0.16, 14, 10, 0, PI * 2, 0, PI * 0.5), hm, 0, 0.02, 0);
  R.robe = add(R.gf.userData.up, Cap(0.19, 0.4, 12), SM('#e86a8a'), 0, 0.28, 0); R.robe.scale.z = 0.8; R.towelH = add(h, Cy(0.17, 0.2, 0.18, 16), SM('#f4f0e8'), 0, 0.15, -0.02);
  R.yourTowel = add(R.you.userData.up, Cy(0.2, 0.22, 0.25, 16), SM('#5a8ad8'), 0, -0.05, 0);
}
