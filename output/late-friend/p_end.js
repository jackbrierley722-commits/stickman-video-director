
function pill(x, y, w, h, bg, stroke) { octx.save(); octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (stroke) { octx.strokeStyle = stroke; octx.lineWidth = 3; octx.stroke(); } octx.restore(); }
function captionHL(c) { octx.save(); octx.font = '52px Russo'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; const words = c.txt.split(' '); const lines = []; let cur = []; const wd = a => octx.measureText(a.join(' ')).width;
  for (const w of words) { if (cur.length && wd([...cur, w]) > 620) { lines.push(cur); cur = [w]; } else cur.push(w); } lines.push(cur); const y0 = 1090 - (lines.length - 1) * 33;
  if (c.who) { octx.font = '26px Russo'; octx.textAlign = 'center'; octx.lineWidth = 8; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(c.who, 360, y0 - 50); octx.fillStyle = c.col; octx.fillText(c.who, 360, y0 - 50); octx.font = '52px Russo'; octx.textAlign = 'left'; }
  lines.forEach((l, i) => { let x = 360 - wd(l) / 2; const y = y0 + i * 66; const sp = octx.measureText(' ').width; l.forEach(w => { const bare = w.replace(/[.,?!']/g, '').replace(/s$/, m => m); octx.lineJoin = 'round'; octx.lineWidth = 13; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(w, x, y); octx.fillStyle = HL.test(w.replace(/[.,?!]/g, '')) ? '#ffd34a' : c.col; octx.fillText(w, x, y); x += octx.measureText(w).width + sp; }); }); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['30px Russo', '40px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  makeFaces();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#8fd3ff'); scene.fog = new T3.Fog('#cfeaff', 60, 220); camera = new T3.PerspectiveCamera(50, RW / RH, 0.05, 400); scene.add(camera); build();
  out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};

function bubble(T, t0, msg, time, y = 250) { const k = ease(prog(T, t0 - 0.1, t0 + 0.15)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const sc = 0.8 + 0.2 * k;
  octx.translate(360, y); octx.scale(sc, sc); txt('THEIR TEXT', 0, -62, 24, '#ffd34a'); octx.font = '44px Russo'; const w = octx.measureText(msg).width + 70;
  octx.fillStyle = '#2f8cff'; octx.beginPath(); octx.roundRect(-w / 2, -36, w, 72, 34); octx.fill(); octx.beginPath(); octx.moveTo(w / 2 - 30, 30); octx.lineTo(w / 2 + 6, 46); octx.lineTo(w / 2 - 6, 20); octx.fill();
  txt(msg, 0, 2, 44, '#fff'); txt(time + ' . DELIVERED', 0, 62, 20, '#cfe3ff'); octx.restore(); }
function reality(T, t0, y = 370) { const k = prog(T, t0 - 0.05, t0 + 0.15); if (k <= 0) return; octx.save(); octx.globalAlpha = k; pill(250, y - 28, 220, 56, '#ff3b5c'); txt('REALITY', 360, y + 2, 32, '#fff'); octx.restore(); }
function planGrid(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.3)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const x0 = 70, y0 = 180, w = 580, h = 300; octx.fillStyle = 'rgba(10,12,28,0.88)'; octx.beginPath(); octx.roundRect(x0, y0, w, h, 26); octx.fill();
  txt('THEIR PLAN', x0 + 150, y0 + 44, 32, '#5ad88a'); txt('REALITY', x0 + 430, y0 + 44, 32, '#ff6b81'); octx.fillStyle = 'rgba(255,255,255,0.2)'; octx.fillRect(x0 + 290, y0 + 20, 2, h - 40);
  const rows = [['SHOWER', '2 MIN', '25 MIN'], ['PICK SHIRT', '1 MIN', '15 MIN'], ['ARRIVE', '7.00', '7.45']];
  rows.forEach((r, i) => { const a = prog(T, t0 + 0.2 + i * 0.35, t0 + 0.4 + i * 0.35); if (a <= 0) return; octx.globalAlpha = k * a; const y = y0 + 110 + i * 66; txt(r[0], x0 + 150, y - 18, 20, '#9aa'); txt(r[1], x0 + 150, y + 8, 38, '#fff'); txt(r[0], x0 + 430, y - 18, 20, '#9aa'); txt(r[2], x0 + 430, y + 8, 38, '#ffd34a'); }); octx.restore(); }
function notif(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.25)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = lerp(-120, 40, k); octx.fillStyle = 'rgba(245,245,250,0.96)'; octx.beginPath(); octx.roundRect(40, y, 640, 120, 30); octx.fill();
  octx.fillStyle = '#ff3b5c'; octx.beginPath(); octx.roundRect(66, y + 26, 68, 68, 16); octx.fill(); txt('!', 100, y + 62, 44, '#fff'); txt('NEW MESSAGE . 45 MIN AGO', 160, y + 42, 22, '#666', 'left'); txt('Look what I found about you', 160, y + 80, 30, '#111', 'left'); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { big('SEND THIS TO YOUR FRIEND', 170, 40, '#fff', 1); big("WHO'S ALWAYS LATE", 222, 48, '#ffd34a', 1); bubble(loop ? 1 : T, -0.3, '5 mins away', '7.00', 370); reality(loop ? 1 : T, -0.3, 480); if (T > E.late0 - 0.1 && !loop) big('STILL IN THE SHOWER', 640, 48, '#fff', fi(E.late0)); }
  else if (ci === 1) { bubble(T, E.shirt, 'leaving now', '7.20'); reality(T, E.shirt + 0.6); }
  else if (ci === 2) { bubble(T, E.traffic, 'traffic was crazy', '7.45'); reality(T, E.traffic + 0.5); if (T > E.door - 0.1) big('THEY LIVE NEXT DOOR', 560, 50, '#ffd34a', fi(E.door)); }
  else if (ci === 3) { big('COMMENT "LATE"', 330, 64, '#ffd34a', fi(E.comment)); if (T > E.waited - 0.1) { const m = Math.floor(lerp(0, 40, prog(T, E.waited, E.waited + 1.2))); big('WAITING . ' + m + ' MIN', 410, 50, '#fff', fi(E.waited)); } }
  else if (ci === 4) { if (T > E.brain - 0.1) { planGrid(T, E.brain); if (T > E.every - 0.1) big('EVERY. SINGLE. TIME.', 600, 48, '#ff6b81', fi(E.every)); } else if (T > E.psych - 0.1) { big('THE PLANNING', 330, 62, '#fff', fi(E.psych)); big('FALLACY', 410, 76, '#ffd34a', fi(E.psych + 0.4)); } else if (T > E.notrude - 0.1) big("IT'S NOT JUST RUDE", 360, 56, '#fff', fi(E.notrude)); }
  else if (ci === 5) { big('THEY THINK . 2 MIN', 330, 60, '#5ad88a', fi(E.think)); if (T > E.two + 0.3) big('ACTUALLY . ' + Math.floor(2 + 40 * prog(T, E.two, E.follow)) + ' MIN', 410, 52, '#ff6b81', 1); }
  else if (ci === 6 && !loop) { notif(T, E.see); big('SEND THIS TO THEM', 420, 60, '#ffd34a', fi(E.follow)); likePill(T, E.follow, E.loop - 0.05, E.follow + 0.3); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 0) captionHL(cap); else if (cap && ci === 0 && !loop && T > E.late0 - 0.1) captionHL(cap); };
})();
