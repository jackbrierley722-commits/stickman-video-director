// ---------- captions ----------
const NUMW = { one: '1', two: '2', four: '4', eight: '8', ten: '10' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1040); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1040); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
// ---------- scoreboard: you vs bro ----------
let SHOWN = [0, 0];
function board(T) { const n = nPress(T); const tY = n, tB = n ? 2 ** n : 0; const lp = PRESSES.filter(p => T >= p).pop(); const k = lp !== undefined ? ease(prog(T, lp, lp + 0.3)) : 1; const prevN = Math.max(0, n - 1);
  const y = Math.round(lerp(prevN, tY, k)), b = Math.round(lerp(prevN ? 2 ** prevN : 0, tB, k)); const a = ease(prog(T, E.million0 - 0.4, E.million0)); if (a <= 0) return;
  octx.save(); octx.globalAlpha = a; for (const [x, lbl, v, col] of [[190, 'YOU', y, '#e8453a'], [530, 'BRO', b, '#2aa84a']]) { if (lbl === 'BRO' && T < E.bro1 - 0.1) continue; const bump = lp !== undefined && T - lp < 0.25 ? 1 + 0.12 * (1 - (T - lp) / 0.25) : 1;
    octx.save(); octx.translate(x, 150); octx.scale(bump, bump); octx.fillStyle = 'rgba(255,255,255,0.95)'; octx.beginPath(); octx.roundRect(-150, -62, 300, 124, 26); octx.fill(); octx.lineWidth = 6; octx.strokeStyle = '#111'; octx.stroke(); octx.fillStyle = col; octx.beginPath(); octx.roundRect(-150, -62, 300, 40, [26, 26, 0, 0]); octx.fill(); octx.strokeStyle = '#111'; octx.beginPath(); octx.roundRect(-150, -62, 300, 124, 26); octx.stroke();
      txt(lbl, 0, -41, 26, '#fff'); txt(v ? fmt(v) : '£0', 0, 22, 50, '#111'); octx.restore(); } octx.restore(); }
function bigCash(T) { const a = ease(prog(T, 0.05, 0.3)) * (1 - ease(prog(T, E.c1 - 0.2, E.c1 + 0.1))); if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = '92px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 16; octx.strokeStyle = '#111'; octx.strokeText('£1,000,000', 360, 330); octx.fillStyle = '#5ad86a'; octx.fillText('£1,000,000', 360, 330); octx.restore(); }
function pressCount(T) { const n = nPress(T); if (n < 1 || CLI(T) > 5) return; octx.save(); octx.fillStyle = 'rgba(17,17,17,0.85)'; octx.beginPath(); octx.roundRect(260, 250, 200, 56, 28); octx.fill(); txt('PRESS ' + n, 360, 279, 30, '#ffd23a'); octx.restore(); }
// ---------- voice note from bro ----------
function voiceNote(T) { const k = ease(prog(T, E.c6 + 0.3, E.c6 + 0.6)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = 360 + (1 - k) * 60;
  octx.fillStyle = 'rgba(255,255,255,0.97)'; octx.beginPath(); octx.roundRect(90, y, 540, 150, 40); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke();
  octx.fillStyle = '#2aa84a'; octx.beginPath(); octx.arc(160, y + 75, 42, 0, 7); octx.fill(); txt('B', 160, y + 77, 40, '#fff'); txt('Bro', 220, y + 34, 26, '#111', 'CapFont', 'left');
  const playing = T >= E.c7 && T < E.c8; octx.fillStyle = '#2a7af0'; octx.beginPath(); if (playing) { octx.rect(222, y + 66, 9, 36); octx.rect(238, y + 66, 9, 36); } else { octx.moveTo(224, y + 64); octx.lineTo(252, y + 84); octx.lineTo(224, y + 104); } octx.fill();
  const prog_ = playing ? prog(T, E.c7, E.c8) : T >= E.c8 ? 1 : 0; for (let i = 0; i < 26; i++) { const x = 272 + i * 12, hh = 8 + 34 * Math.abs(S(i * 1.7) * C(i * 0.6)); octx.fillStyle = i / 26 < prog_ ? '#2a7af0' : '#b8c0cc'; const live = playing && Math.abs(i / 26 - prog_) < 0.08 ? 1.3 : 1; octx.fillRect(x, y + 84 - hh * live / 2, 7, hh * live); }
  txt('0:02', 590, y + 120, 20, '#8a8a96', 'CapFont'); octx.restore(); }
function question(T) { const k = ease(prog(T, E.c8, E.c8 + 0.25)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const sc = 0.8 + 0.2 * k; octx.translate(360, 300); octx.scale(sc, sc);
  octx.font = '64px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 14; octx.strokeStyle = '#111'; octx.strokeText('WOULD YOU', 0, -40); octx.strokeText('PRESS IT?', 0, 40); octx.fillStyle = '#fff'; octx.fillText('WOULD YOU', 0, -40); octx.fillStyle = '#ff4a3a'; octx.fillText('PRESS IT?', 0, 40); octx.restore();
  const k2 = ease(prog(T, E.comment - 0.1, E.comment + 0.2)); if (k2 <= 0) return; octx.save(); octx.globalAlpha = k2; for (const [x, t, c] of [[250, 'YES', '#2aa84a'], [470, 'NO', '#e8453a']]) { octx.fillStyle = c; octx.beginPath(); octx.roundRect(x - 90, 420, 180, 76, 38); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); txt(t, x, 459, 38, '#fff'); } octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 500); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.22)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const lp = PRESSES.filter(p => T >= p).pop(); if (lp !== undefined && T - lp < 0.12 && !loop) { octx.fillStyle = `rgba(255,255,255,${0.35 * (1 - (T - lp) / 0.12)})`; octx.fillRect(0, 0, W, H); }
  if (loop) { octx.save(); octx.font = '92px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 16; octx.strokeStyle = '#111'; octx.strokeText('£1,000,000', 360, 330); octx.fillStyle = '#5ad86a'; octx.fillText('£1,000,000', 360, 330); octx.restore(); }
  else { if (ci === 0) bigCash(T); if (ci >= 1 && ci <= 5) { board(T); } if (ci >= 2 && ci <= 5) pressCount(T); if (ci === 6 || ci === 7) voiceNote(T); if (ci === 8) question(T); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
