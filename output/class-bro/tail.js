// ---------- captions only: small white, 2-3 words, mid-frame (house style) ----------
const TAGS = { 1: ['BRO', '#8af0a0'], 3: ['YOU', '#9ac8ff'], 4: ['BRO', '#8af0a0'], 7: ['YOU', '#9ac8ff'], 8: ['BRO', '#8af0a0'], 10: ['TEACHER', '#ffb07a'], 14: ['BRO', '#8af0a0'] };
const CAPS = []; CL.forEach((c0, ci) => { const who = TAGS[ci]; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' '), who }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: /^fucking$/i.test(w0.w) ? 'f***ing' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.9)'; if (c.who) { octx.font = '600 24px CapFont'; octx.strokeText(c.who[0], 360, 856); octx.fillStyle = c.who[1]; octx.fillText(c.who[0], 360, 856); octx.font = '600 46px CapFont'; } octx.strokeText(c.t, 360, 900); octx.fillStyle = c.who ? c.who[1] : '#ffffff'; octx.fillText(c.t, 360, 900); octx.restore(); }
function rules(T) { const k = ease(prog(T, E.c9 + 0.2, E.c9 + 0.45)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(250,246,236,0.97)'; octx.beginPath(); octx.roundRect(120, 190, 480, 230, 20); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); octx.fillStyle = '#111'; octx.font = '40px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('THE RULES', 360, 235);
  octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.fillStyle = '#c82a2a'; octx.fillText('✗  your leg touches his', 160, 300); if (T > AT(9, 'your') - 0.1) { octx.fillStyle = '#2a9a4a'; octx.fillText('✓  his hand on your thigh', 160, 360); } octx.restore(); }
function big(s_, y, size, col, a = 1, shake = 0) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.4 : 1; octx.translate(360 + shake * (Math.random() - 0.5) * 10, y + shake * (Math.random() - 0.5) * 10); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function ring(T, wp) { const v = wp.clone().project(camera); const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; const r = 70 + 8 * S(T * 8); octx.save(); octx.strokeStyle = '#ff3a3a'; octx.lineWidth = 7; octx.beginPath(); octx.arc(x, y, r, 0, PI * 2); octx.stroke(); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#c8c0a8'); camera = new T3.PerspectiveCamera(60, RW / RH, 0.03, 200); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = END;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = true; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.92)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if ((ci === 6 && T > E.hand + 0.2) || ci === 9) { const e = R.bro.userData.armR.userData.e; const v = new T3.Vector3(0, -0.3, 0); e.localToWorld(v); ring(T, v); }
  if (ci === 9) rules(T);
  if (ci === 12) { octx.fillStyle = '#0a0a10'; octx.fillRect(0, 0, W, H); big('5 MINUTES', 600, 72, '#ffd27a', 1); big('LATER', 680, 50, '#fff', 1); }

  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 12) caption(cap); };
})();
