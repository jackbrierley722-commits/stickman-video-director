// ---------- captions: 2-3 words, yellow with ink outline ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const prv = c0.words[j - 1]; const w = Object.assign({}, w0, { w: (prv && /^day$/i.test(prv.w) && /^one$/i.test(w0.w)) ? '1' : (({ three: '3' })[w0.w.toLowerCase()] || w0.w) }); const prev = cur[cur.length - 1]; if (cur.length && ((/^no$/i.test(w0.w) && c0.words[j + 1] && /^nut$/i.test(c0.words[j + 1].w)) || cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1030); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1030); octx.restore(); }
// ---------- the clock that never reaches December ----------
function clockCard(T) { const k = ease(prog(T, E.fly + 0.1, E.fly + 0.4)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(255,255,255,0.96)'; octx.beginPath(); octx.roundRect(190, 150, 340, 120, 22); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.stroke();
  octx.fillStyle = '#d63a2a'; octx.font = '30px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('NOV 30', 360, 186); octx.fillStyle = '#111'; octx.font = '52px Russo'; octx.fillText(Math.floor(T * 2) % 2 ? '23:59' : '23 59', 360, 238); stampDraw(octx, 360, 215, STAMP(T, E.seat + 0.45), 1.5); octx.restore(); }
// ---------- group chat ----------
function bubble(y, text, mine, name, k, col) { if (k <= 0) return; const s = lerp(0.6, 1, ease(k)); octx.save(); octx.globalAlpha = Math.min(1, k * 1.5); octx.font = '600 30px CapFont'; const w = octx.measureText(text).width + 44, h = 58, x = mine ? 548 - w : 190;
  octx.translate(mine ? x + w : x, y + h / 2); octx.scale(s, s); octx.translate(mine ? -(x + w) : -x, -(y + h / 2));
  if (!mine) { octx.fillStyle = col; octx.beginPath(); octx.arc(160, y + h / 2, 22, 0, 7); octx.fill(); octx.fillStyle = '#fff'; octx.font = '600 22px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(name[0], 160, y + h / 2 + 1); }
  octx.fillStyle = mine ? '#2a7af0' : '#e8e8ee'; octx.beginPath(); octx.roundRect(x, y, w, h, 26); octx.fill(); octx.fillStyle = mine ? '#fff' : '#111'; octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(text, x + 22, y + h / 2 + 1);
  if (!mine) { octx.fillStyle = '#8a8a96'; octx.font = '600 18px CapFont'; octx.fillText(name, x + 6, y - 11); } octx.restore(); }
function chat(T) { const k = ease(prog(T, E.tell - 0.25, E.tell + 0.15)); if (k <= 0) return; const dy = (1 - k) * 900; octx.save(); octx.translate(0, dy);
  octx.fillStyle = '#111'; octx.beginPath(); octx.roundRect(118, 120, 484, 820, 52); octx.fill(); octx.fillStyle = '#ffffff'; octx.beginPath(); octx.roundRect(134, 136, 452, 788, 40); octx.fill();
  octx.fillStyle = '#f2f2f6'; octx.fillRect(134, 170, 452, 90); octx.fillStyle = '#111'; octx.beginPath(); octx.roundRect(310, 146, 100, 22, 11); octx.fill();
  ['#e8453a', '#2a7af0', '#2aa84a', '#e8a030'].forEach((c, i) => { octx.fillStyle = c; octx.beginPath(); octx.arc(184 + i * 22, 215, 20, 0, 7); octx.fill(); octx.strokeStyle = '#f2f2f6'; octx.lineWidth = 3; octx.stroke(); });
  octx.fillStyle = '#111'; octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText('THE BROS', 270, 204); octx.fillStyle = '#8a8a96'; octx.font = '600 18px CapFont'; octx.fillText('6 members', 270, 234);
  // typed then sent
  const typed = 'still going strong'; const n = Math.round(typed.length * prog(T, E.tell + 0.1, E.strong + 0.1)); const sent = T > E.strong + 0.15;
  if (sent) bubble(300, typed, true, '', prog(T, E.strong + 0.15, E.strong + 0.35), '');
  octx.fillStyle = '#f2f2f6'; octx.beginPath(); octx.roundRect(150, 852, 420, 54, 27); octx.fill(); octx.fillStyle = sent || n === 0 ? '#9a9aa6' : '#111'; octx.font = '600 26px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(sent || n === 0 ? 'Message' : typed.slice(0, n) + (Math.floor(T * 4) % 2 ? '|' : ''), 176, 880);
  const B = [['Jake', '#2a7af0'], ['Tom', '#d8a020'], ['Kyle', '#e8a030'], ['Mo', '#9a4ad8']]; B.forEach(([nm, c], i) => bubble(400 + i * 92, 'same', false, nm, prog(T, E.replies[i], E.replies[i] + 0.18), c));
  if (T > E.except && T < E.dave2 - 0.15) { const y = 400 + 4 * 92; octx.fillStyle = '#2aa84a'; octx.beginPath(); octx.arc(160, y + 29, 22, 0, 7); octx.fill(); octx.fillStyle = '#e8e8ee'; octx.beginPath(); octx.roundRect(190, y, 96, 58, 26); octx.fill(); for (let i = 0; i < 3; i++) { octx.fillStyle = '#8a8a96'; octx.beginPath(); octx.arc(218 + i * 20, y + 29 - 5 * Math.max(0, S(T * 10 - i)), 7, 0, 7); octx.fill(); } }
  bubble(400 + 4 * 92, 'I know.', false, 'Bro', prog(T, E.dave2 - 0.15, E.dave2 + 0.05), '#2aa84a'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo', '44px Bangers'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  build(); goldenHour(); toonify(scene); R.sun.shadow.camera.left = R.sun.shadow.camera.bottom = -6; R.sun.shadow.camera.right = R.sun.shadow.camera.top = 6; R.sun.shadow.camera.updateProjectionMatrix();
  out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const ci_ = CLI(T); if (!loop && ci_ === 4) clockCard(T); if (!loop && (ci_ === 5 || ci_ === 6)) chat(T);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
