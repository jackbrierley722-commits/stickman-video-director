// ---------- captions (game-style subtitles) ----------
const NUMW = { one: '1', two: '2', three: '3' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const pv = c0.words[j - 1]; const w = Object.assign({}, w0, { w: pv && /^day$/i.test(pv.w) && NUMW[w0.w.toLowerCase()] ? NUMW[w0.w.toLowerCase()] : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^day$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1010); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 1010); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(s_, 360, y); octx.fillStyle = col; octx.fillText(s_, 360, y); octx.restore(); }
// ---------- news HUD ----------
const TICK = 'DINOSAURS CONFIRMED IN 40 CITIES  ///  STAY INDOORS  ///  ALL FLIGHTS GROUNDED  ///  DO NOT APPROACH ANY ANIMAL  ///  ';
function news(T, ci) { octx.save(); octx.fillStyle = 'rgba(180,16,16,0.95)'; octx.fillRect(0, 1150, 210, 60); txt('BREAKING', 105, 1181, 30, '#fff'); octx.fillStyle = 'rgba(12,14,22,0.88)'; octx.fillRect(210, 1150, 510, 60); octx.beginPath(); octx.rect(210, 1150, 510, 60); octx.clip();
  octx.font = '600 28px CapFont'; const w = octx.measureText(TICK).width; const off = (T * 140) % w; octx.fillStyle = '#fff'; octx.textBaseline = 'middle'; octx.textAlign = 'left'; octx.fillText(TICK + TICK, 220 - off, 1181); octx.restore();
  const day = ci === 1 && T >= E.day1 - 0.1 || ci === 2 ? 'DAY 1' : ci === 3 ? 'DAY 2' : ci === 4 ? 'DAY 3' : ci >= 5 ? 'DAY 4' : null; if (day) { octx.save(); octx.fillStyle = 'rgba(12,14,22,0.85)'; octx.beginPath(); octx.roundRect(24, 40, 170, 62, 10); octx.fill(); octx.fillStyle = '#c81414'; octx.fillRect(24, 40, 10, 62); txt(day, 116, 72, 32, '#fff'); octx.restore(); }
  octx.save(); octx.fillStyle = Math.floor(T * 2) % 2 ? '#e82020' : '#901010'; octx.beginPath(); octx.arc(600, 70, 10, 0, 7); octx.fill(); txt('LIVE', 650, 71, 26, '#fff'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#8a86a0', 30, 320); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.1, 3000); scene.add(camera);
  build(); R.sunGlow.material.fog = false; R.sunDisc.material.fog = false; out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.88)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 4 && !loop && T > E.hunt && Math.floor(T * 4) % 2) { octx.fillStyle = 'rgba(255,160,40,0.08)'; octx.fillRect(0, 0, W, H); }
  if (ci === 0 || loop) { big("DON'T GO OUTSIDE", 330, 54, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15)); }
  if (ci === 1 && T < E.day1 - 0.1) { big('66,000,000', 330, 72, '#ffd27a', prog(T, E.c1, E.c1 + 0.2)); big('YEARS LATER', 400, 44, '#fff', prog(T, E.c1 + 0.2, E.c1 + 0.4)); }
  if (ci === 3 && T > E.flight - 0.1) big('ALL FLIGHTS GROUNDED', 330, 42, '#ff4a3a', prog(T, E.flight - 0.1, E.flight + 0.1));
  if (ci === 7 && !loop) { big('WOULD YOU SURVIVE', 300, 50, '#fff', prog(T, E.c7, E.c7 + 0.2)); big('WEEK ONE?', 370, 62, '#ffd27a', prog(T, E.c7 + 0.15, E.c7 + 0.35)); if (T > E.comment - 0.1) big('COMMENT WHERE YOU\'D HIDE', 900, 34, '#fff', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  if (!loop) news(T, ci);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
