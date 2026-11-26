// ---------- captions ----------
const NUMW = {};
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function dline(p, q, col, a, dash = [18, 12], w = 8) { const A = scr(...p), B_ = scr(...q); if (A[2] > 1 || B_[2] > 1) return; octx.save(); octx.globalAlpha = a; octx.strokeStyle = col; octx.lineWidth = w; octx.lineCap = 'round'; octx.setLineDash(dash); octx.lineDashOffset = -performance.now() / 40;
  octx.beginPath(); octx.moveTo(A[0], A[1]); octx.lineTo(B_[0], B_[1]); octx.stroke(); octx.setLineDash([]); octx.fillStyle = col; const ang = Math.atan2(B_[1] - A[1], B_[0] - A[0]); octx.translate(B_[0], B_[1]); octx.rotate(ang); octx.beginPath(); octx.moveTo(6, 0); octx.lineTo(-18, -13); octx.lineTo(-18, 13); octx.fill(); octx.restore(); }
function mark(x, y, z, good, a) { const [sx, sy, sz] = scr(x, y, z); if (sz > 1) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = good ? '#2ab85a' : '#e8302a'; octx.beginPath(); octx.arc(sx, sy, 40, 0, 7); octx.fill(); octx.strokeStyle = '#fff'; octx.lineWidth = 9; octx.lineCap = 'round'; octx.beginPath();
  if (good) { octx.moveTo(sx - 16, sy); octx.lineTo(sx - 4, sy + 13); octx.lineTo(sx + 18, sy - 13); } else { octx.moveTo(sx - 14, sy - 14); octx.lineTo(sx + 14, sy + 14); octx.moveTo(sx + 14, sy - 14); octx.lineTo(sx - 14, sy + 14); } octx.stroke(); octx.restore(); }
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
  const DR = [DOOR[0], 0.9, DOOR[1]];
  if ((ci <= 1 || loop) && T > 1.0) { dline(bedPoint([0, 0.7, 1.2]), DR, '#e8302a', prog(T, 1.0, 1.4)); if (ci === 1 && T > E.coffin - 0.1) mark(...bedPoint([0, 0.9, 0]), false, prog(T, E.coffin - 0.1, E.coffin + 0.1)); }
  if (ci === 2 && T > E.diag - 0.1) { dline(bedPoint([0, 1.0, -0.9]), DR, '#2ab85a', prog(T, E.diag - 0.1, E.diag + 0.2)); if (T > E.see - 0.1) mark(...bedPoint([0, 1.1, 0]), true, prog(T, E.see - 0.1, E.see + 0.1)); }
  if (ci === 3 && T < E.bounces + 0.9) { const m = [-1.55, 1.1, 0.15]; const b1 = bedPoint([0, 0.9, 0.6]); const a = prog(T, E.bounces - 0.2, E.bounces + 0.1); dline(m, b1, '#e8a02a', a, [10, 10], 6); dline(b1, [m[0] - 0.4, 1.4, m[2]], '#e8a02a', a, [10, 10], 6); dline([m[0] - 0.4, 1.4, m[2]], bedPoint([0.3, 1.0, -0.4]), '#e8a02a', a, [10, 10], 6); if (T > E.mirror - 0.1) mark(m[0], 2.2, m[2], false, prog(T, E.mirror - 0.1, E.mirror + 0.1)); }
  if (ci === 6 && T > E.feet - 0.1) { dline([1.6, 0.2, 1.8], DR, '#e8302a', prog(T, E.feet - 0.1, E.feet + 0.2)); mark(1.6, 0.9, 1.8, false, prog(T, E.feet + 0.1, E.feet + 0.3)); }
  if (ci === 0 || loop) { big('NEVER', 400, 84, '#e8302a', loop ? 1 : prog(T, 0, 0.15)); big('FEET FACING THE DOOR', 480, 40, '#fff', loop ? 1 : prog(T, 0.9, 1.1)); }
  if (ci === 1 && T > E.coffin - 0.1) big('THE COFFIN POSITION', 400, 50, '#e8302a', prog(T, E.coffin - 0.1, E.coffin + 0.1));
  if (ci === 2 && T > E.command - 0.1) big('COMMAND POSITION', 400, 54, '#2ab85a', prog(T, E.command - 0.1, E.command + 0.1));
  if (ci === 3 && T > E.mirror - 0.1) big('NO MIRROR FACING THE BED', 400, 38, '#e8a02a', prog(T, E.mirror - 0.1, E.mirror + 0.1));
  if (ci === 4) { if (T > E.junk - 0.1) big('CLEAR UNDER THE BED', 400, 42, '#fff', prog(T, E.junk - 0.1, E.junk + 0.1)); if (T > E.plant - 0.1) big('+ A PLANT', 470, 50, '#2ab85a', prog(T, E.plant - 0.1, E.plant + 0.1)); }
  if (ci === 5 && T > E.perfect - 0.1) big('PERFECT BALANCE', 400, 56, '#2ab85a', prog(T, E.perfect - 0.1, E.perfect + 0.1));
  if (ci === 6 && T > E.feet - 0.1) big('COFFIN POSITION', 400, 56, '#e8302a', prog(T, E.feet - 0.1, E.feet + 0.1));
  if (ci === 7 && !loop) big('SEND THIS', 400, 64, '#ffd23a', prog(T, E.c7, E.c7 + 0.15));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
