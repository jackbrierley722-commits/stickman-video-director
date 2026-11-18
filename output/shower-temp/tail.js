// ---------- captions: small white mid-frame; her lines in pink with a tag ----------
const SWEAR = /^(fuck|fucking)$/i;
const CAPS = []; CL.forEach((c0) => { const her = c0.voice !== TM.voice; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' '), her }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: SWEAR.test(w0.w) ? w0.w[0] + '***' + (w0.w.length > 4 ? 'ing' : '') : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.88)'; if (c.her) { octx.font = '600 24px CapFont'; octx.strokeText('HER', 360, 846); octx.fillStyle = '#ff9ac0'; octx.fillText('HER', 360, 846); octx.font = '600 46px CapFont'; }
  octx.strokeText(c.t, 360, 890); octx.fillStyle = c.her ? '#ffc8dc' : '#ffffff'; octx.fillText(c.t, 360, 890); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function thermo(T) { const t_ = tempAt(T), k = clamp((t_ - 30) / 20); octx.save(); octx.fillStyle = 'rgba(10,10,16,0.75)'; octx.beginPath(); octx.roundRect(590, 120, 110, 330, 22); octx.fill(); octx.fillStyle = '#e8e8ec'; octx.beginPath(); octx.roundRect(628, 150, 34, 220, 17); octx.fill(); octx.beginPath(); octx.arc(645, 385, 28, 0, 7); octx.fill();
  const col = t_ > 42 ? '#e83a2a' : t_ > 39 ? '#e8a030' : '#3a8ae8'; octx.fillStyle = col; octx.beginPath(); octx.arc(645, 385, 21, 0, 7); octx.fill(); const hh = 200 * k; octx.fillRect(636, 372 - hh, 18, hh + 10); txt(Math.round(t_) + '°C', 645, 430, 26, '#fff'); if (t_ > 44) txt('LAVA', 645, 136, 18, '#ff8a7a', 'CapFont'); octx.restore(); }
function sonar(T) { const a = new T3.Vector3(...GH()).project(camera), b = new T3.Vector3(); R.dial.getWorldPosition(b); b.project(camera); const ax = (a.x + 1) / 2 * W, ay = (1 - a.y) / 2 * H, bx = (b.x + 1) / 2 * W, by = (1 - b.y) / 2 * H;
  octx.save(); for (let i = 0; i < 4; i++) { const ph = (T * 1.2 + i / 4) % 1; octx.strokeStyle = `rgba(90,255,140,${1 - ph})`; octx.lineWidth = 5; octx.beginPath(); octx.arc(ax, ay, 20 + ph * 160, 0, PI * 2); octx.stroke(); } octx.setLineDash([12, 10]); octx.strokeStyle = 'rgba(90,255,140,0.9)'; octx.lineWidth = 4; octx.beginPath(); octx.moveTo(ax, ay); octx.lineTo(bx, by); octx.stroke(); octx.setLineDash([]); octx.fillStyle = '#5aff8a'; octx.beginPath(); octx.arc(bx, by, 10 + 4 * S(T * 12), 0, 7); octx.fill();
  octx.font = '28px Russo'; octx.textAlign = 'center'; octx.lineWidth = 8; octx.strokeStyle = '#111'; octx.strokeText('TARGET LOCKED', bx, by - 40); octx.fillStyle = '#5aff8a'; octx.fillText('TARGET LOCKED', bx, by - 40); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#d8e4ea'); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 100); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = END;
window.renderFrame = function (T) { const ci = CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 17) { octx.fillStyle = '#0a0a10'; octx.fillRect(0, 0, W, H); txt('15 MINUTES', 360, 600, 70, '#ffd27a'); txt('LATER', 360, 680, 50, '#fff'); }
  if (ci === 13) sonar(T); if (ci <= 15) thermo(T);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && ci !== 17) caption(cap); };
})();
