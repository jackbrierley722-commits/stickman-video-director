// ---------- captions ----------
const NUMW = { four: '4', twelve: '12' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; c.t = c.t.replace(/hundred and fifty/i, '150'); });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1080); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 1080); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.92)'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function fact(T, t0, l1, l2, col = '#5ad8ff') { const a = ease(prog(T, t0 - 0.1, t0 + 0.15)); if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(8,10,18,0.86)'; octx.beginPath(); octx.roundRect(110, 400, 500, l2 ? 150 : 100, 18); octx.fill(); octx.strokeStyle = col; octx.lineWidth = 3; octx.stroke(); octx.fillStyle = col; octx.beginPath(); octx.roundRect(130, 384, 110, 34, 17); octx.fill(); txt('FACT', 185, 402, 22, '#0a0a10'); txt(l1, 360, 452, 40, '#fff'); if (l2) txt(l2, 360, 505, 30, col, 'CapFont'); octx.restore(); }
function hud(T, ci) { const loop = T >= E.loop; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.82)'; octx.beginPath(); octx.roundRect(24, 36, 270, 62, 31); octx.fill(); octx.strokeStyle = '#6ad85a'; octx.lineWidth = 3; octx.stroke(); txt('SURVIVE . PART 1', 159, 68, 26, '#9af08a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.82)'; octx.beginPath(); octx.roundRect(486, 36, 210, 62, 31); octx.fill(); txt('DAY 4 . 9:42 PM', 591, 68, 22, '#ffd27a'); octx.restore();
  const items = [['WATER', loop || ci >= 3 ? 1 : 0], ['FOOD', loop || ci >= 5 && !(ci === 5 && T < E.tins) ? 1 : 0], ['POWER', loop || ci >= 6 && (ci > 6 || T > E.low) ? 1 : 0]]; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.72)'; octx.beginPath(); octx.roundRect(24, 112, 180, 168, 16); octx.fill(); txt('SUPPLIES', 114, 136, 20, '#9a9aa8', 'CapFont');
  items.forEach(([s_, d], i) => { txt(d ? '✓' : '□', 50, 176 + i * 40, 26, d ? '#5ad88a' : '#9a9aa8'); txt(s_, 76, 177 + i * 40, 24, d ? '#fff' : '#9a9aa8', 'Russo', 'left'); }); octx.restore();
  if (ci === 0 || loop) { const left = loop ? 4 * 3600 : Math.max(0, 4 * 3600 - Math.floor(T * 37)); const hh = Math.floor(left / 3600), mm = Math.floor(left / 60) % 60, ss = left % 60; octx.save(); octx.fillStyle = 'rgba(120,0,0,0.88)'; octx.beginPath(); octx.roundRect(470, 112, 226, 70, 18); octx.fill(); txt('FRIDGE', 583, 132, 18, '#ffb0a0', 'CapFont'); txt(`${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 583, 160, 32, '#fff'); octx.restore(); } }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#141a2a', 40, 330); camera = new T3.PerspectiveCamera(66, 360 / 640, 0.03, 3000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.9)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const peep = ci === 7 && T >= E.peep - 0.05; if (peep) { octx.save(); octx.fillStyle = '#000'; octx.beginPath(); octx.rect(0, 0, W, H); octx.arc(360, 600, 330, 0, PI * 2, true); octx.fill('evenodd'); const g = octx.createRadialGradient(360, 600, 200, 360, 600, 335); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); octx.fillStyle = g; octx.beginPath(); octx.arc(360, 600, 335, 0, PI * 2); octx.fill(); octx.restore(); }
  else { const vg = octx.createRadialGradient(360, 640, 380, 360, 640, 880); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  if (ci === 7 && T > E.slam && T < E.slam + 0.12) { octx.fillStyle = 'rgba(255,255,255,0.25)'; octx.fillRect(0, 0, W, H); }
  hud(T, ci);
  if (ci === 0 || loop) { big("DON'T OPEN", 420, 74, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15)); big('YOUR FRIDGE', 500, 56, '#fff', loop ? 1 : prog(T, 0.3, 0.5)); }
  if (ci === 1) big('THE CITY IS DARK', 420, 50, '#ffd27a', prog(T, AT(1, 'the') - 0.1, AT(1, 'the') + 0.1));
  if (ci === 2) fact(T, E.pumps, 'TAPS NEED PUMPS', 'no power = no water pressure');
  if (ci === 3) { fact(T, AT(3, 'hundred'), 'TANK = 150 L', T > E.month - 0.1 ? '4 L a day = 37 days' : ''); }
  if (ci === 4) fact(T, E.closed, T < E.freezer - 0.1 ? 'FRIDGE: 4 HOURS' : 'FREEZER: 48 HOURS', 'if you keep it shut', '#ffd27a');
  if (ci === 5) fact(T, AT(5, 'eat'), T < E.tins - 0.1 ? 'FRESH FOOD FIRST' : 'TINS LAST FOR YEARS', '', '#6ad85a');
  if (ci === 6) fact(T, E.low, 'LOW POWER MODE', T > E.torch - 0.1 ? 'torch only when needed' : 'stretch every %', '#ffd27a');
  if (ci === 7 && !peep && T > E.slam - 0.05) big('BANG', 430, 96, '#ff4a3a', prog(T, E.slam - 0.05, E.slam + 0.1));
  if (ci === 8 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. BARRICADE' : 'B. THE ROOF', 400, 64, A ? '#ff9a5a' : '#5ad8ff', 1); big(A ? 'GUARD YOUR SUPPLIES' : 'OUT THE WINDOW', 470, 36, '#fff', 1); } else big('COMMENT A OR B', 430, 62, '#ffd27a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
