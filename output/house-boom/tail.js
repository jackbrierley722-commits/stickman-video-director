// ---------- captions (game-style subtitles) ----------
const NUMW = { one: '1', two: '2', three: '3' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const w = Object.assign({}, w0, { w: /^fucking$/i.test(w0.w) ? 'f***ing' : /^forty$/i.test(w0.w) ? '40' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^day$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1010); octx.fillStyle = c.who ? '#ff9ac8' : '#ffffff'; octx.fillText(c.t, 360, 1010); if (c.who) { octx.font = '600 30px CapFont'; octx.lineWidth = 8; octx.strokeText(c.who, 360, 958); octx.fillStyle = '#ff9ac8'; octx.fillText(c.who, 360, 958); } octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(s_, 360, y); octx.fillStyle = col; octx.fillText(s_, 360, y); octx.restore(); }
// ---------- game HUD ----------
function hud(T) { const ci = CLI(T); const m = money(T); const neg = ci >= 5;
  octx.save(); octx.font = '44px Russo'; octx.textAlign = 'right'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.9)'; const ms = '$' + m.toLocaleString('en-US'); octx.strokeText(ms, 690, 70); octx.fillStyle = neg && Math.floor(T * 4) % 2 ? '#ff4a3a' : '#7ae07a'; octx.fillText(ms, 690, 70);
  const lastBuy = BUYS.filter(([t]) => t > 0.5 && T >= t && T < t + 0.9).pop(); if (lastBuy) { octx.font = '30px Russo'; octx.globalAlpha = 1 - prog(T, lastBuy[0] + 0.5, lastBuy[0] + 0.9); const d = '-$' + Math.abs(lastBuy[1]).toLocaleString('en-US'); octx.strokeText(d, 690, 115); octx.fillStyle = '#ff6a5a'; octx.fillText(d, 690, 115); } octx.restore();
  // minimap
  octx.save(); octx.beginPath(); octx.arc(120, 1140, 95, 0, 7); octx.fillStyle = 'rgba(30,40,50,0.85)'; octx.fill(); octx.clip(); octx.fillStyle = '#5a7a4a'; octx.fillRect(20, 1040, 200, 200); octx.fillStyle = '#d8d0c0'; octx.fillRect(20, 1162, 200, 18); octx.fillRect(150, 1040, 14, 200); octx.fillStyle = '#4a8ac8'; octx.fillRect(20, 1040, 60, 200);
    octx.fillStyle = neg ? '#ff3a2a' : '#f0e8d8'; octx.fillRect(100, 1110, 34, 26); octx.restore(); octx.save(); octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.beginPath(); octx.arc(120, 1140, 95, 0, 7); octx.stroke(); octx.translate(120, 1150); octx.fillStyle = '#fff'; octx.beginPath(); octx.moveTo(0, -12); octx.lineTo(9, 9); octx.lineTo(-9, 9); octx.fill(); octx.restore();
  // task complete pop-ups
  const tk = TASKS.filter(([t]) => T >= t - 0.05 && T < t + 1.1).pop(); if (tk && ci >= 1 && ci <= 3) { const a = Math.min(1, prog(T, tk[0] - 0.05, tk[0] + 0.1)) * (1 - prog(T, tk[0] + 0.8, tk[0] + 1.1)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(0,0,0,0.7)'; octx.fillRect(0, 300, W, 120); txt('TASK COMPLETE', 360, 335, 44, '#ffd23a'); txt(tk[1], 360, 388, 30, '#fff'); octx.restore(); } }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#8a86a0', 30, 320); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.1, 3000); scene.add(camera);
  build(); R.sunGlow.material.fog = false; scene.fog.color.set('#c89aa8'); scene.fog.near = 60; scene.fog.far = 420; R.sunDisc.material.fog = false; out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.88)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const bt = T - E.boom;
  if (bt > 0 && bt < 0.5) { octx.fillStyle = `rgba(255,245,220,${1 - bt / 0.5})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0) { big("DON'T GET ATTACHED", 470, 56, '#ff4a3a', prog(T, 0, 0.15)); if (T > AT(0, "you'll") - 0.1) big('40 HOURS OF WORK', 550, 44, '#fff', prog(T, AT(0, "you'll") - 0.1, AT(0, "you'll") + 0.1)); }
  if (ci === 2) { const sw = [['TROPICAL GREEN', '#3aa86a'], ['STORMY BLUE', '#4a6a9a'], ['PASTEL PEACH', '#f6c2a0']]; const pick = T > E.peach - 0.1; sw.forEach(([n, c], i) => { const x = 130 + i * 230, sel = i === 2 && pick; octx.save(); octx.fillStyle = 'rgba(0,0,0,0.7)'; octx.fillRect(x - 100, 470, 200, 150); octx.fillStyle = c; octx.fillRect(x - 85, 485, 170, 90); if (sel) { octx.strokeStyle = '#ffd23a'; octx.lineWidth = 8; octx.strokeRect(x - 100, 470, 200, 150); } txt(n, x, 598, 18, sel ? '#ffd23a' : '#fff'); octx.restore(); }); }
  if (ci === 4 && T > E.day - 0.15) big('1 DAY LATER', 500, 64, '#fff', prog(T, E.day - 0.15, E.day + 0.05));
  if (bt > 0.15 && ci === 5) { const a = prog(T, E.boom + 0.15, E.boom + 0.4); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(0,0,0,0.65)'; octx.fillRect(0, 420, W, 150); octx.restore(); big('HOUSE DESTROYED', 495, 64, '#ff3a2a', a); }
  if (ci === 6 && T > AT(6, 'survived') - 0.1) big('SNAKE: FINE', 470, 56, '#7ae07a', prog(T, AT(6, 'survived') - 0.1, AT(6, 'survived') + 0.1));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
