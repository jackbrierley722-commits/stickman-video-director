
function pill(x, y, w, h, bg, stroke) { octx.save(); octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (stroke) { octx.strokeStyle = stroke; octx.lineWidth = 3; octx.stroke(); } octx.restore(); }
const WHEN = ['MONDAY 7.00', 'MONDAY 7.00', 'MONDAY', 'SATURDAY', 'SUNDAY 6.55 PM', 'MONDAY 7.00', 'SUNDAY 11.58 PM', 'MONDAY 7.00', 'MONDAY NIGHT', 'TUESDAY', 'SUNDAY 11.40 PM', 'SUNDAY 11.45 PM', 'SUNDAY 11.46 PM', '60 YEARS AGO', 'SUNDAY 11.50 PM', 'SUNDAY 11.55 PM', 'LAST MONTH', 'SUNDAY 11.58 PM', 'SUNDAY 11.59 PM'];
function hud(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T);
  pill(24, 36, 290, 64, 'rgba(10,12,28,0.78)', '#ffd34a'); txt('IN THIS TOWN...', 169, 69, 28, '#ffd34a');
  let wh = WHEN[ci]; if (ci === 0 && T > E.now0 - 0.1 && !loop) wh = 'SUNDAY 11.59 PM'; if (ci === 7 && T > E.patrol - 0.1) wh = 'MONDAY 8.00'; if (ci === 15 && false) wh = '';
  octx.font = '28px Russo'; const w = octx.measureText(wh).width + 44; pill(696 - w, 36, w, 64, ci === 13 ? 'rgba(90,60,20,0.85)' : 'rgba(10,12,28,0.78)'); txt(wh, 696 - w / 2, 69, 28, ci === 13 ? '#ffe2a8' : '#ffffff'); }
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
  // clouds
  const cr = rng(31); for (let i = 0; i < 14; i++) { const c = new T3.Group(); c.position.set((cr() - 0.5) * 160, 34 + cr() * 14, -40 - cr() * 80); scene.add(c); for (let j = 0; j < 4; j++) add(c, Bx(6 + cr() * 6, 2 + cr() * 2, 4 + cr() * 3), BM('#ffffff'), j * 4 - 6, cr() * 1.5, cr() * 2, false); R.clouds = (R.clouds || []).concat(c); }
  out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); (R.clouds || []).forEach(c => c.visible = curMood === 'day' || curMood === 'dawn' || curMood === 'eve'); renderer.render(scene, camera);
  const sepia = ci === 13 && !loop; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = sepia ? 'sepia(0.75) contrast(1.05)' : 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  // quick punch-in on cuts
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  if (sepia) { const vg = octx.createRadialGradient(360, 640, 300, 360, 640, 820); vg.addColorStop(0, 'rgba(60,40,10,0)'); vg.addColorStop(1, 'rgba(60,40,10,0.55)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  else { const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  // swap flash on the big swap moments
  for (const f of [E.wake + 0.5, E.swap7 + 0.15, E.sit + 0.3]) { const d = T - f; if (d > 0 && d < 0.3) { octx.fillStyle = `rgba(160,240,255,${0.45 * (1 - d / 0.3)})`; octx.fillRect(0, 0, W, H); } }
  hud(T);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { if (T < E.except0 - 0.1 || loop) { big('EVERY MONDAY', 380, 74, '#ffd34a', 1); big('EVERYONE SWAPS BODIES', 460, 44, '#fff', 1); } else if (T < E.now0 - 0.1) big('EXCEPT HIM', 400, 80, '#ffd34a', fi(E.except0)); else big('AND NOW . ME', 400, 80, '#7fe8ff', fi(E.now0)); }
  else if (ci === 1) { if (T < E.dadB - 0.1) big('7.00 AM . SWAP', 400, 64, '#7fe8ff', fi(E.wake)); else if (T > E.toast - 0.1) big("CAN'T MAKE TOAST", 400, 62, '#fff', fi(E.toast)); else if (T > E.four - 0.1) big('400 CROISSANTS', 400, 70, '#ffd34a', fi(E.four)); }
  else if (ci === 2) { if (T > E.hw - 0.1) big('STILL GAVE HOMEWORK', 400, 54, '#fff', fi(E.hw)); else big('TEACHER . AGE 1', 400, 60, '#ffd34a', fi(E.teach)); }
  else if (ci === 3) { if (T > E.post - 0.1) big('THE WIFE . THIS WEEK', 400, 56, '#ffb6e1', fi(E.post)); else big('NAME TAGS AT WEDDINGS', 400, 52, '#fff', fi(E.wed)); }
  else if (ci === 4) { big('ONE RULE', 380, 72, '#ffd34a', fi(E.rule)); if (T > E.bed - 0.1) big('BE IN BED BY 7', 460, 58, '#fff', fi(E.bed)); }
  else if (ci === 5) { nameTag('MR. HALE', 'CLOCK TOWER KEEPER', '#ffd34a', prog(T, E.hale, E.hale + 0.2) * (1 - prog(T, E.every5 - 0.3, E.every5 - 0.1))); if (T > E.never - 0.1) big('HE NEVER SWAPS', 400, 66, '#ffd34a', fi(E.never)); }
  else if (ci === 6) { nameTag('LEO', 'MY BEST FRIEND', '#ffb0a0', prog(T, E.leo, E.leo + 0.2) * (1 - prog(T, E.eyes - 0.3, E.eyes - 0.1))); if (T > E.eyes - 0.1) big('EYES WIDE OPEN', 400, 66, '#fff', fi(E.eyes)); }
  else if (ci === 7) { if (T > E.exLeo - 0.1 && T < E.patrol - 0.1) big('EXCEPT LEO', 400, 80, '#ff6b6b', fi(E.exLeo)); else if (T > E.patrol - 0.1) big('SWAP PATROL', 400, 66, '#d7a6ff', fi(E.patrol)); else big('7.00 AM', 400, 72, '#7fe8ff', fi(E.swap7)); }
  else if (ci === 9) { if (T > E.mayor - 0.1) big(T > E.shrug - 0.1 ? '*SHRUG*' : 'THE MAYOR . AGE 7', 400, 58, '#ffd34a', fi(T > E.shrug - 0.1 ? E.shrug : E.mayor)); else if (T > E.mondays - 0.1) big('"MONDAYS ARE MONDAYS"', 400, 50, '#fff', fi(E.mondays)); }
  else if (ci === 11) { if (T > E.strap - 0.1) big('LEO', 400, 84, '#ff6b6b', fi(E.strap)); else if (T > E.beds - 0.1 && T < E.chair - 0.1) big('ONE TO EVERY BED', 400, 58, '#7fe8ff', fi(E.beds)); else if (T > E.wires - 0.1 && T < E.beds) big('THOUSANDS OF WIRES', 400, 54, '#7fe8ff', fi(E.wires)); }
  else if (ci === 13) { if (T > E.hate - 0.1) { big("YOU CAN'T HATE SOMEONE", 380, 46, '#fff', fi(E.hate)); big("ONCE YOU'VE BEEN THEM", 450, 46, '#ffd34a', fi(E.hate + 0.6)); } else if (T < E.built - 0.1) big('THE WALL', 400, 76, '#fff', fi(E.wall)); }
  else if (ci === 14) { if (T < E.old - 0.1) big('ONE PERSON WHO NEVER SWAPS', 400, 40, '#ffd34a', fi(E.needs)); else if (T > E.newp - 0.1) big('SOMEONE NEW', 400, 66, '#7fe8ff', fi(E.newp)); }
  else if (ci === 15) { if (T > E.place - 0.1) big("B. TAKE LEO'S PLACE", 400, 54, '#7fe8ff', fi(E.place)); else if (T > E.unplug - 0.1) { big('A. UNPLUG IT', 380, 62, '#ff9a5a', fi(E.unplug)); big('THE WALL GOES BACK UP', 450, 40, '#fff', fi(E.unplug + 0.6)); } }
  else if (ci === 16) { if (T < E.hug - 0.1) big('THE WEEK I WAS DAD', 400, 54, '#9ad0ff', fi(E.dadwk)); }
  else if (ci === 18 && !loop) { if (T > E.sunday - 0.1) big('BE IN BED BY 7', 400, 66, '#ffd34a', fi(E.sunday)); else if (T > E.comment - 0.1) big('COMMENT YES OR NO', 400, 60, '#ffd34a', fi(E.comment)); else big('WOULD YOU SIT DOWN?', 400, 56, '#fff', fi(E.q)); }
  likePill(T, E.like, E.mum - 0.2, E.follow8);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) captionHL(cap); };
})();
