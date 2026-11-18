// ---------- captions only: small white, 2-3 words, mid-frame (house style) ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.shadowColor = 'rgba(0,0,0,0.6)'; octx.shadowBlur = 12; octx.lineWidth = 7; octx.strokeStyle = 'rgba(0,0,0,0.75)'; octx.strokeText(c.t, 360, 880); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 880); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#05060e'); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 3000); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
