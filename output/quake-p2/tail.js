// ---------- captions ----------
const NUMW = { twenty: '20', twelve: '12', four: '4' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function hud(T) { const loop = T >= E.loop, q = quake(T); octx.save(); octx.fillStyle = 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(24, 36, 290, 64, 32); octx.fill(); octx.strokeStyle = '#ff8a3a'; octx.lineWidth = 3; octx.stroke(); txt('SURVIVE . PART 2', 169, 69, 26, '#ffb06a'); octx.restore();
  octx.save(); octx.fillStyle = q > 0 ? (Math.floor(T * 4) % 2 ? 'rgba(170,10,10,0.92)' : 'rgba(120,0,0,0.92)') : 'rgba(10,10,14,0.82)'; octx.beginPath(); octx.roundRect(476, 36, 220, 64, 32); octx.fill(); txt(q > 0 ? 'AFTERSHOCK' : 'FLOOR ' + FLOOR(T), 586, 69, q > 0 ? 24 : 28, '#fff'); octx.restore();
  // floors-left bar
  const f = FLOOR(T), k = 1 - (f - 1) / 19; octx.save(); octx.fillStyle = 'rgba(10,10,14,0.75)'; octx.beginPath(); octx.roundRect(476, 112, 220, 34, 17); octx.fill(); octx.fillStyle = '#5aff8a'; octx.beginPath(); octx.roundRect(480, 116, 212 * Math.max(0.06, k), 26, 13); octx.fill(); txt(f - 1 + ' FLOORS TO GO', 586, 130, 17, '#fff'); octx.restore(); }
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
  if (!loop && Math.floor(T * 3) % 2 === 0) { octx.fillStyle = 'rgba(200,0,0,0.08)'; octx.fillRect(0, 0, W, H); }
  { const sg = octx.createLinearGradient(0, 0, 0, 600); const d = ci >= 5 && !loop ? 0.7 : 0.55; sg.addColorStop(0, `rgba(40,40,46,${d})`); sg.addColorStop(1, 'rgba(40,40,46,0)'); octx.fillStyle = sg; octx.fillRect(0, 0, W, 600); }
  hud(T);
  if (ci === 0 || loop) { big("DON'T STAND UP", 430, 70, '#ff4a3a', loop ? 1 : prog(T, 0.0, 0.15)); if (!loop && T > AT(0, 'smoke') - 0.1) big('SMOKE RISES', 510, 44, '#fff', prog(T, AT(0, 'smoke') - 0.1, AT(0, 'smoke') + 0.1)); }
  if (ci === 1 && T < E.c1 + 1.4) big('YOU CHOSE A', 430, 60, '#5aff8a', prog(T, E.c1, E.c1 + 0.15));
  if (ci === 2) { big('SMOKE KILLS MORE', 380, 46, '#fff', prog(T, E.c2, E.c2 + 0.15)); big('THAN FLAMES', 440, 46, '#ffd23a', prog(T, E.c2 + 0.2, E.c2 + 0.35)); if (T > E.cleanest - 0.1) { const a = prog(T, E.cleanest - 0.1, E.cleanest + 0.15); octx.save(); octx.globalAlpha = a; octx.setLineDash([16, 12]); octx.strokeStyle = '#ffd23a'; octx.lineWidth = 4; octx.beginPath(); octx.moveTo(0, 620); octx.lineTo(W, 620); octx.stroke(); octx.restore(); big('SMOKE', 560, 40, '#c8c8cc', a); big('CLEAN AIR', 690, 44, '#5aff8a', a); } }
  if (ci === 3 && T < E.hits - 0.1) big('FLOOR 12', 430, 80, '#fff', prog(T, E.c3, E.c3 + 0.15));
  if (ci === 3 && T > E.hits - 0.1) big('AFTERSHOCK', 430, 76, '#ff4a3a', prog(T, E.hits - 0.1, E.hits + 0.1));
  if (ci === 4) big('HOLD THE RAIL', 430, 64, '#ffd23a', prog(T, E.grab - 0.1, E.grab + 0.1));
  if (ci === 5) { big('FLOOR 4', 430, 80, '#fff', prog(T, E.c5, E.c5 + 0.15)); if (T > E.coming - 0.1) big('SMOKE FROM BELOW', 510, 46, '#ff8a3a', prog(T, E.coming - 0.1, E.coming + 0.1)); }
  if (ci === 6 && T > E.touch - 0.1) { big('BACK OF YOUR HAND', 400, 46, '#fff', prog(T, E.touch - 0.1, E.touch + 0.1)); if (T > E.cool - 0.1) big('COOL = NO FIRE BEHIND IT', 465, 34, '#5aff8a', prog(T, E.cool - 0.1, E.cool + 0.1)); }
  if (ci === 7 && !loop) { if (T < E.comment - 0.1) { const A = T < E.optB - 0.1; big(A ? 'A. THE DOOR' : 'B. KEEP GOING DOWN', 400, 58, A ? '#5aff8a' : '#ff8a3a', 1); big(A ? 'ONTO FLOOR 4' : 'THROUGH THE SMOKE', 470, 36, '#fff', 1); } else big('COMMENT A OR B', 430, 62, '#ffd23a', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
