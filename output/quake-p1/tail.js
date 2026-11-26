// ---------- captions ----------
const NUMW = { twenty: '20', forty: '40' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function hud(T) { const loop = T >= E.loop, q = quake(T); octx.save(); octx.fillStyle = 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(24, 36, 290, 64, 32); octx.fill(); octx.strokeStyle = '#ff8a3a'; octx.lineWidth = 3; octx.stroke(); txt('SURVIVE . PART 1', 169, 69, 26, '#ffb06a'); octx.restore();
  octx.save(); octx.fillStyle = q > 0 ? (Math.floor(T * 4) % 2 ? 'rgba(170,10,10,0.92)' : 'rgba(120,0,0,0.92)') : 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(476, 36, 220, 64, 32); octx.fill(); txt(q > 0 ? 'M 7.4  SHAKING' : 'FLOOR 20', 586, 69, q > 0 ? 22 : 26, '#fff'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(62, RW / RH, 0.03, 2000); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (!loop && ci >= 6 && Math.floor(T * 3) % 2 === 0 && T > AT(6, 'alarm') - 0.1) { octx.fillStyle = 'rgba(200,0,0,0.13)'; octx.fillRect(0, 0, W, H); }
  if (!loop && ci === 4 && T > E.burst && T < E.burst + 0.15) { octx.fillStyle = 'rgba(255,255,255,0.35)'; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big("DON'T RUN", 430, 92, '#ff4a3a', loop ? 1 : prog(T, 0.0, 0.15)); if (!loop && T > E.twenty - 0.1) big('FLOOR 20', 520, 50, '#fff', prog(T, E.twenty - 0.1, E.twenty + 0.1)); }
  if (ci === 2 && T > E.hurt - 0.1) { big('MOST INJURIES', 400, 46, '#fff', prog(T, E.hurt - 0.1, E.hurt + 0.1)); big('HAPPEN WHILE MOVING', 462, 40, '#ffd23a', prog(T, E.hurt, E.hurt + 0.2)); }
  if (ci === 3) { const w = [['DROP', AT(3, 'drop')], ['COVER', AT(3, 'get')], ['HOLD ON', AT(3, 'hold')]]; w.forEach(([s_, t0], i) => { if (T > t0 - 0.1) big(s_, 380 + i * 80, 64, ['#ffd23a', '#5ad8ff', '#5aff8a'][i], prog(T, t0 - 0.1, t0 + 0.1)); }); }
  if (ci === 5 && T > E.stops - 0.1) big('IT STOPS', 430, 70, '#5aff8a', prog(T, E.stops - 0.1, E.stops + 0.1));
  if (ci === 6 && T > E.smell - 0.1) big('SMOKE', 430, 80, '#c8c8cc', prog(T, E.smell - 0.1, E.smell + 0.1));
  if (ci === 7 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. THE STAIRS' : 'B. THE LIFT', 400, 60, A ? '#5aff8a' : '#5ad8ff', 1); big(A ? '20 FLOORS . THROUGH SMOKE' : 'IT STILL WORKS', 470, 36, '#fff', 1); } else big('COMMENT A OR B', 430, 62, '#ffd23a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
