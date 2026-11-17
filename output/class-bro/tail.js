// ---------- captions only: small white, 2-3 words, mid-frame (house style) ----------
const CAPS = []; CL.forEach((c0, ci) => { if (c0.voice !== TM.voice) return; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: /^fucking$/i.test(w0.w) ? 'f***ing' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 900); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 900); octx.restore(); }
function big(s_, y, size, col, a = 1, shake = 0) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.4 : 1; octx.translate(360 + shake * (Math.random() - 0.5) * 10, y + shake * (Math.random() - 0.5) * 10); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function ring(T, wp) { const v = wp.clone().project(camera); const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; const r = 70 + 8 * S(T * 8); octx.save(); octx.strokeStyle = '#ff3a3a'; octx.lineWidth = 7; octx.beginPath(); octx.arc(x, y, r, 0, PI * 2); octx.stroke(); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#c8c0a8'); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.03, 200); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.92)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 1) { big('STOP', 330, 120, '#ff3a2a', prog(T, E.c1, E.c1 + 0.08), 1); if (T > AT(1, 'touching') - 0.05) big('TOUCHING', 450, 92, '#ff3a2a', prog(T, AT(1, 'touching') - 0.05, AT(1, 'touching') + 0.05), 1); if (T > AT(1, 'me') - 0.05) big('ME!', 560, 120, '#ff3a2a', prog(T, AT(1, 'me') - 0.05, AT(1, 'me') + 0.05), 1); }
  if (loop) big('STOP TOUCHING ME!', 330, 56, '#ff3a2a', 1);
  if (ci === 4 && T > E.graze - 0.05 && T < E.c5) big('*graze*', 360, 54, '#fff', prog(T, E.graze - 0.05, E.graze + 0.1));
  if ((ci === 5 && T > E.hand + 0.2) || (ci === 6 && T < E.c6 + 0.6)) { const e = R.bro.userData.armR.userData.e; const v = new T3.Vector3(0, -0.3, 0); e.localToWorld(v); ring(T, v); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 1) caption(cap); };
})();
