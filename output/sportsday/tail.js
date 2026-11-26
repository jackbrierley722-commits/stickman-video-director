// ---------- captions ----------
const NUMW = {};
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function card(text, y, a, col = '#ffd23a', size = 62) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1.4 - 0.4 * a : 1; octx.translate(360, y); octx.rotate(-0.06); octx.scale(sc, sc); octx.font = size + 'px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round';
  octx.lineWidth = size * 0.28; octx.strokeStyle = '#5a2a0a'; octx.strokeText(text, 0, 4); octx.lineWidth = size * 0.14; octx.strokeStyle = '#fff4d0'; octx.strokeText(text, 0, 0); octx.fillStyle = col; octx.fillText(text, 0, 0); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(62, RW / RH, 0.03, 2000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  { const hz = octx.createLinearGradient(0, 0, 0, H); hz.addColorStop(0, 'rgba(255,220,150,0.18)'); hz.addColorStop(0.5, 'rgba(255,220,150,0)'); octx.fillStyle = hz; octx.fillRect(0, 0, W, H); const fl = octx.createRadialGradient(650, 60, 0, 650, 60, 260); fl.addColorStop(0, 'rgba(255,250,220,0.55)'); fl.addColorStop(1, 'rgba(255,250,220,0)'); octx.fillStyle = fl; octx.fillRect(0, 0, W, H); }
  if (ci === 0 || loop) { card("DON'T ENTER", 300, loop ? 1 : prog(T, 0, 0.15), '#ff5a3a', 66); card("THE PARENTS' RACE", 375, loop ? 1 : prog(T, 0.5, 0.7), '#ffd23a', 50); }
  if (ci === 1) { card('SPORTS DAY', 300, prog(T, E.c1, E.c1 + 0.15)); if (T > E.thirty - 0.1) { const a = prog(T, E.thirty - 0.1, E.thirty + 0.1); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(200,40,20,0.92)'; octx.beginPath(); octx.roundRect(470, 380, 210, 90, 45); octx.fill(); txt('31°C', 575, 426, 54, '#fff'); octx.restore(); } }
  if (ci === 2) { card('SACK RACE', 300, prog(T, E.c2, E.c2 + 0.15)); if (T > E.fall + 0.2 && T < E.whistle) card('FALSE START', 380, prog(T, E.fall + 0.2, E.fall + 0.35), '#ff5a3a', 44); }
  if (ci === 3) { card('EGG & SPOON', 300, prog(T, E.c3, E.c3 + 0.15)); if (T > E.glued - 0.1) card('GLUED?', 380, prog(T, E.glued - 0.1, E.glued + 0.1), '#ff5a3a', 56); }
  if (ci === 4) { card('3-LEGGED RACE', 300, prog(T, E.c4, E.c4 + 0.15), '#ffd23a', 54); if (T > E.ends - 0.1) card('FRIENDSHIP: OVER', 380, prog(T, E.ends - 0.1, E.ends + 0.1), '#ff5a3a', 44); }
  if (ci === 5) card('PARTICIPATION', 300, prog(T, E.c5, E.c5 + 0.15), '#ffd23a', 52);
  if (ci === 6) card("PARENTS' RACE", 300, prog(T, E.c6, E.c6 + 0.15), '#ffd23a', 58);
  if (ci === 7) { card('STRETCHING SINCE 9AM', 300, prog(T, E.c7 + 0.3, E.c7 + 0.45), '#ffd23a', 40); if (T > E.spikes - 0.1) card('RUNNING SPIKES', 380, prog(T, E.spikes - 0.1, E.spikes + 0.1), '#7aff3a', 48); }
  if (ci === 8) { if (T > E.ham - 0.1) card('HAMSTRING', 300, prog(T, E.ham - 0.1, E.ham + 0.1), '#ff5a3a', 58); if (T > E.wins - 0.1) { card('STILL WINS', 380, prog(T, E.wins - 0.1, E.wins + 0.1), '#7aff3a', 56); octx.fillStyle = `rgba(255,255,255,${0.5 * (1 - prog(T, E.wins, E.wins + 0.3))})`; octx.fillRect(0, 0, W, H); } }
  if (ci === 9 && !loop) { card('COMMENT THE RACE', 300, prog(T, E.c9, E.c9 + 0.15), '#ffd23a', 50); card('YOU ALWAYS LOST', 370, prog(T, E.c9 + 0.2, E.c9 + 0.35), '#fff', 50); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
