(() => {
const T3 = THREE, W = 720, H = 1280, DUR = 15.0, G = window.GEO;
const P0 = [0, 0], P1 = [-33.58 + 0.002, 255.19 + 0.019];           // Deepdale image centre, Cardiff image centre (km; x east, z south)
const IMA = [0.32, 0.5686], IMB = [0.395, 0.702];                    // ground size of each aerial (km)
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
let renderer, scene, camera, glc, out, octx, MMA, MMB, tex = {};
function loadTex(src) { return new Promise(res => new T3.TextureLoader().load(src, t => { t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 8; res(t); })); }
function loadImg(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; }); }
function plane(t, w, h, x, z, order) { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0, z); m.renderOrder = order; scene.add(m); return m; }
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
window.initFlight = async function () {
  await document.fonts.load('40px Russo');
  const names = ['uk', 'deepdale_region', 'cardiff_region', 'deepdale_city', 'cardiff_city', 'deepdale_clean', 'cardiff_clean', 'cloud0', 'cloud1', 'cloud2', 'cloud3'];
  const ts = await Promise.all(names.map(n => loadTex(n + '.png'))); names.forEach((n, i) => tex[n] = ts[i]); MMA = await loadImg('deepdale_mm.png'); MMB = await loadImg('cardiff_mm.png');
  glc = document.createElement('canvas'); glc.width = W; glc.height = H; renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  scene = new T3.Scene(); scene.background = new T3.Color('#16324a'); camera = new T3.PerspectiveCamera(60, W / H, 0.01, 2000); scene.add(camera);
  plane(tex.uk, G.X1 - G.X0, G.Z1 - G.Z0, (G.X0 + G.X1) / 2, (G.Z0 + G.Z1) / 2, 0);
  plane(tex.deepdale_region, 40, 40, P0[0], P0[1], 1); plane(tex.cardiff_region, 40, 40, P1[0], P1[1], 1);
  plane(tex.deepdale_city, 3.2, 3.2, P0[0], P0[1], 2); plane(tex.cardiff_city, 3.2, 3.2, P1[0], P1[1], 2);
  plane(tex.deepdale_clean, IMA[0], IMA[1], P0[0], P0[1], 3); plane(tex.cardiff_clean, IMB[0], IMB[1], P1[0], P1[1], 3);
  // clouds: low banks over each city (you fly through these), and scattered cloud along the route
  const r = rng(9); const cl = (x, y, z, s, op) => { const sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex['cloud' + ((r() * 4) | 0)], transparent: true, opacity: op, depthTest: false, depthWrite: false })); sp.position.set(x, y, z); sp.scale.set(s, s, 1); sp.renderOrder = 5; scene.add(sp); };
  for (const [cx, cz] of [P0, P1]) for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 7; cl(cx + Math.cos(a) * d, 1.6 + r() * 2.4, cz + Math.sin(a) * d, 1.6 + r() * 3.2, 0.95); }
  for (let i = 0; i < 220; i++) cl(-150 + r() * 260, 6 + r() * 4, -120 + r() * 480, 18 + r() * 45, 0.85);
  out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = DUR;
// ---------- camera path ----------
const HK = [[0, 0.4925], [0.6, 0.4925], [5.0, 30], [7.4, 430], [10.6, 30], [14.2, 0.6085], [DUR, 0.6085]];
function altAt(t) { for (let i = 0; i < HK.length - 1; i++) { const [a, ha] = HK[i], [b, hb] = HK[i + 1]; if (t <= b) { const k = ease(prog(t, a, b)); return Math.exp(lerp(Math.log(ha), Math.log(hb), k)); } } return HK[HK.length - 1][1]; }
const travel = t => ease(prog(t, 5.2, 10.4));
function groundAt(t) { const s = travel(t); return [lerp(P0[0], P1[0], s), lerp(P0[1], P1[1], s)]; }
const pitchAt = t => 0.56 * Math.sin(Math.PI * prog(t, 9.8, 14.0));
function shot(t) { const h = altAt(t), g = groundAt(t), p = pitchAt(t); camera.near = Math.max(0.004, h * 0.03); camera.far = h * 12 + 60; camera.updateProjectionMatrix();
  camera.up.set(0, 0, -1); camera.position.set(g[0], h, g[1] + h * Math.tan(p)); camera.lookAt(g[0], 0, g[1]); return { h, g }; }
// ---------- overlay: fixed minimap + map labels ----------
function toScreen(x, z) { const v = new T3.Vector3(x, 0, z).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }
function label(name, x, z, a, big) { const [sx, sy, sz] = toScreen(x, z); if (sz > 1 || sx < -100 || sx > W + 100 || sy < -50 || sy > H + 50) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = big ? '#ffd23a' : '#fff'; octx.beginPath(); octx.arc(sx, sy, big ? 7 : 4, 0, 7); octx.fill();
  octx.font = (big ? 34 : 24) + 'px Russo'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.lineWidth = 6; octx.strokeStyle = 'rgba(0,0,0,0.85)'; octx.strokeText(name, sx + 12, sy); octx.fillText(name, sx + 12, sy); octx.restore(); }
const SC = W / 941, MA = [133 * SC, 1520 * SC, 112 * SC], MB = [143 * SC, 1455 * SC, 126 * SC];
function minimap(t, h, g) { const gen = prog(t, 0.8, 1.8) * (1 - prog(t, 13.6, 14.4)); const k = ease(prog(t, 5.2, 10.4)); const cx = lerp(MA[0], MB[0], k), cy = lerp(MA[1], MB[1], k), R = lerp(MA[2], MB[2], k);
  if (gen < 1 && t < 7) { octx.globalAlpha = 1 - gen; octx.drawImage(MMA, (133 - 112 - 4) * SC, (1520 - 112 - 30) * SC, MMA.width * SC, MMA.height * SC); }
  if (t > 7 && gen < 1) { octx.globalAlpha = 1 - gen; octx.drawImage(MMB, (143 - 126 - 4) * SC, (1455 - 126 - 30) * SC, MMB.width * SC, MMB.height * SC); }
  octx.globalAlpha = 1; if (gen <= 0) return;
  octx.save(); octx.globalAlpha = gen; octx.beginPath(); octx.arc(cx, cy, R, 0, 7); octx.fillStyle = '#1c2836'; octx.fill(); octx.clip();
  const span = Math.max(1.2, h * 1.4), sc = R / span; const P = (x, z) => [cx + (x - g[0]) * sc, cy + (z - g[1]) * sc];
  octx.fillStyle = '#5c636c'; for (const poly of [G.GB, G.IE]) { octx.beginPath(); poly.forEach(([x, z], i) => { const [px, py] = P(x, z); i ? octx.lineTo(px, py) : octx.moveTo(px, py); }); octx.closePath(); octx.fill(); }
  octx.strokeStyle = '#ffd23a'; octx.lineWidth = 3; octx.setLineDash([8, 6]); octx.beginPath(); octx.moveTo(...P(P0[0], P0[1])); octx.lineTo(...P(P1[0], P1[1])); octx.stroke(); octx.setLineDash([]);
  for (const [n, [x, z]] of Object.entries(G.cities)) { const [px, py] = P(x, z); octx.fillStyle = (n === 'Preston' || n === 'Cardiff') ? '#ffd23a' : '#c8ccd2'; octx.beginPath(); octx.arc(px, py, (n === 'Preston' || n === 'Cardiff') ? 5 : 3, 0, 7); octx.fill(); }
  octx.restore(); octx.save(); octx.globalAlpha = gen;
  octx.lineWidth = 9; octx.strokeStyle = '#2a2e34'; octx.beginPath(); octx.arc(cx, cy, R, 0, 7); octx.stroke();
  octx.lineWidth = 6; octx.strokeStyle = '#4aa84a'; octx.beginPath(); octx.arc(cx, cy, R, Math.PI * 0.55, Math.PI * 1.15); octx.stroke(); octx.strokeStyle = '#3a8ad8'; octx.beginPath(); octx.arc(cx, cy, R, Math.PI * 0.05, Math.PI * 0.5); octx.stroke();
  octx.fillStyle = '#1a1e24'; octx.beginPath(); octx.arc(cx, cy - R, 15, 0, 7); octx.fill(); octx.fillStyle = '#fff'; octx.font = '18px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('N', cx, cy - R + 1);
  const turn = ease(prog(t, 5.3, 6.1)) * (1 - ease(prog(t, 10.0, 10.8))); octx.translate(cx, cy); octx.rotate(Math.PI * turn); octx.fillStyle = '#fff'; octx.beginPath(); octx.moveTo(0, -15); octx.lineTo(11, 12); octx.lineTo(0, 6); octx.lineTo(-11, 12); octx.closePath(); octx.fill(); octx.restore(); }
window.renderFrame = function (t) { const { h, g } = shot(t); renderer.render(scene, camera); octx.globalAlpha = 1; octx.drawImage(glc, 0, 0, W, H);
  // map labels once you're high enough to see the country
  const la = prog(h, 60, 160); if (la > 0) { for (const [n, [x, z]] of Object.entries(G.cities)) if (!['Preston', 'Cardiff'].includes(n)) label(n.toUpperCase(), x, z, la * 0.9, false); label('PRESTON', G.cities.Preston[0], G.cities.Preston[1], la, true); label('CARDIFF', G.cities.Cardiff[0], G.cities.Cardiff[1], la, true); }
  minimap(t, h, g); };
})();
