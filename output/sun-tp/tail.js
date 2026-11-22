// ---------- captions ----------
const NUMW = {};
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function hud(T) { const loop = T >= E.loop; if (!(loop || onSun(T))) return; const t = loop ? 0.1 : sunClock(T);
  octx.save(); octx.fillStyle = 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(24, 36, 330, 96, 28); octx.fill(); octx.strokeStyle = '#ffb040'; octx.lineWidth = 3; octx.stroke(); txt('TIME ON THE SUN', 189, 64, 20, '#ffb06a'); txt(t.toFixed(3) + ' s', 189, 104, 40, '#fff'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(24, 140, 330, 14, 7); octx.fill(); octx.fillStyle = '#ffb040'; octx.beginPath(); octx.roundRect(24, 140, 330 * t / 0.1, 14, 7); octx.fill(); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(140,30,0,0.88)'; octx.beginPath(); octx.roundRect(476, 36, 220, 64, 32); octx.fill(); txt('5,500 °C', 586, 69, 30, '#fff'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(10,10,14,0.75)'; octx.beginPath(); octx.roundRect(476, 110, 220, 40, 20); octx.fill(); txt('SLOW MOTION', 586, 130, 18, '#ffd23a'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(62, RW / RH, 0.03, 2000); scene.add(camera);
  build(); toonify(scene); R.SG.children.forEach(m => { if (m.isMesh && m.material.isMeshBasicMaterial) {} }); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const sun = loop || onSun(T);
  if (ci === 0 && !loop && T < 0.6) { octx.fillStyle = `rgba(255,250,230,${1 - prog(T, 0.25, 0.6)})`; octx.fillRect(0, 0, W, H); }
  if (sun) { const hg = octx.createLinearGradient(0, H, 0, H * 0.4); hg.addColorStop(0, 'rgba(255,140,30,0.35)'); hg.addColorStop(1, 'rgba(255,140,30,0)'); octx.fillStyle = hg; octx.fillRect(0, 0, W, H); }
  if (ci === 3 && T > E.blinded - 0.1 && !loop) { const a = prog(T, E.blinded - 0.1, E.blinded + 0.2); octx.fillStyle = `rgba(255,255,250,${0.92 * a})`; octx.fillRect(0, 0, W, H); }
  if (ci === 5 && !loop && T < E.c5 + 0.5) { octx.fillStyle = `rgba(255,250,230,${1 - prog(T, E.c5, E.c5 + 0.5)})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0 || loop) { big("NEVER", 420, 80, '#ff4a2a', loop ? 1 : prog(T, 0.0, 0.15)); if (loop || T > AT(0, 'tenth') - 0.1) big('0.1 SECONDS', 510, 62, '#ffd23a', loop ? 1 : prog(T, AT(0, 'tenth') - 0.1, AT(0, 'tenth') + 0.1)); }
  if (ci === 1 && T > E.gas - 0.1) { big('GAS: THINNER THAN AIR', 430, 40, '#fff', prog(T, E.gas - 0.1, E.gas + 0.1)); if (T > E.light - 0.1) big("IT'S THE LIGHT", 500, 54, '#ffd23a', prog(T, E.light - 0.1, E.light + 0.1)); }
  if (ci === 2) { big('63,000,000 W', 420, 62, '#ffd23a', prog(T, AT(2, 'sixty') - 0.1, AT(2, 'sixty') + 0.1)); big('PER SQUARE METRE', 485, 34, '#fff', prog(T, AT(2, 'sixty') + 0.1, AT(2, 'sixty') + 0.3)); if (T > E.mw - 0.15) big('= 60,000 MICROWAVES', 560, 42, '#ff8a3a', prog(T, E.mw - 0.15, E.mw + 0.05)); }
  if (ci === 3 && T < E.blinded - 0.1 && T > E.steam - 0.2) big('BOILS INTO STEAM', 430, 52, '#fff', prog(T, E.steam - 0.2, E.steam));
  if (ci === 3 && T > E.blinded - 0.1) big('BLINDED', 600, 80, '#111', prog(T, E.blinded - 0.1, E.blinded + 0.1));
  if (ci === 4) { big('28x GRAVITY', 420, 64, '#ff4a2a', prog(T, E.c4, E.c4 + 0.15)); if (T > E.fall - 0.1) big('YOU FALL 1.4 M', 495, 44, '#fff', prog(T, E.fall - 0.1, E.fall + 0.1)); }
  if (ci === 5 && T > E.tan - 0.15) { big('BEST TAN EVER', 380, 56, '#ffd23a', prog(T, E.tan - 0.15, E.tan + 0.05)); if (T > E.one - 0.1) big('(ONE SIDE)', 450, 44, '#fff', prog(T, E.one - 0.1, E.one + 0.1)); }
  if (ci === 6 && !loop) big('SEND THIS', 400, 64, '#ffd23a', prog(T, E.c6, E.c6 + 0.15));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
