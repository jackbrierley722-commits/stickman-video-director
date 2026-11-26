// Escape the rings: 2D neon renderer driven by the deterministic sim.
(function () {
  const C = SIM.CFG, RUN = SIM.best(), W = 720, H = 1280, PI = Math.PI;
  const cv = document.getElementById('c'), x = cv.getContext('2d');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const hue = i => 185 + i * 14; // cyan -> violet -> pink
  const BOUNCES = RUN.ev.filter(e => e.type === 'bounce'), BREAKS = RUN.ev.filter(e => e.type === 'break');
  // shatter particles per ring
  const SHARDS = BREAKS.map(b => { const r = rng(100 + b.ring), ring = RUN.R[b.ring]; const out = []; for (let k = 0; k < 46; k++) { const a = r() * PI * 2, sp = 140 + r() * 360; out.push({ a, sp, rot: r() * 6, len: 6 + r() * 14, x0: C.cx + Math.cos(a) * ring.rad, y0: C.cy + Math.sin(a) * ring.rad }); } return { t: b.t, ring: b.ring, out }; });
  const STARS = (() => { const r = rng(7), s = []; for (let i = 0; i < 140; i++) s.push([r() * W, r() * H, r() * 1.6 + 0.3, r() * 6]); return s; })();
  window.DURATION = RUN.total; window.ready = Promise.all(['60px Russo', '600 30px CapFont'].map(f => document.fonts.load(f)));
  function txt(s, X, Y, size, col, font = 'Russo', stroke = 10) { x.font = `${size}px ${font}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; if (stroke) { x.lineWidth = stroke; x.strokeStyle = 'rgba(0,0,0,0.85)'; x.strokeText(s, X, Y); } x.fillStyle = col; x.fillText(s, X, Y); }
  window.renderFrame = function (T) { const fi = Math.min(RUN.frames.length - 1, Math.max(0, Math.round(T * C.fps))), F = RUN.frames[fi];
    const loop = T > RUN.total - 0.35; const g = x.createRadialGradient(C.cx, C.cy, 50, C.cx, C.cy, 900); g.addColorStop(0, '#141a3a'); g.addColorStop(1, '#05060f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (const [sx, sy, sr, ph] of STARS) { x.globalAlpha = 0.35 + 0.35 * Math.sin(T * 1.5 + ph); x.fillStyle = '#cfd8ff'; x.fillRect(sx, sy, sr, sr); } x.globalAlpha = 1;
    const left = RUN.R.filter(q => !(q.tBreak !== null && T >= q.tBreak) || loop).length;
    // rings
    for (const q of RUN.R) { if (q.tBreak !== null && T >= q.tBreak && !loop) continue; const ang = q.a0 + q.w * (loop ? 0 : T); const hit = BOUNCES.filter(b => b.ring === q.i && T >= b.t && T - b.t < 0.18).length ? 1 : 0; const last = left === 1 && !loop;
      x.save(); x.lineCap = 'round'; x.shadowColor = `hsl(${hue(q.i)},100%,60%)`; x.shadowBlur = 18 + hit * 22; x.strokeStyle = last ? `hsl(${0 + 10 * Math.sin(T * 8)},100%,${58 + 10 * hit}%)` : `hsl(${hue(q.i)},95%,${58 + 18 * hit}%)`; x.lineWidth = C.th + hit * 3;
      x.beginPath(); x.arc(C.cx, C.cy, q.rad, ang + q.gap, ang + PI * 2); x.stroke(); x.restore(); }
    // shards from broken rings
    for (const s of SHARDS) { const d = T - s.t; if (d < 0 || d > 1.6 || loop) continue; const a = 1 - d / 1.6; x.save(); x.strokeStyle = `hsla(${hue(s.ring)},100%,65%,${a})`; x.lineWidth = 4; x.shadowColor = `hsl(${hue(s.ring)},100%,60%)`; x.shadowBlur = 10;
      for (const p of s.out) { const px = p.x0 + Math.cos(p.a) * p.sp * d, py = p.y0 + Math.sin(p.a) * p.sp * d + 300 * d * d; const r_ = p.rot + d * 9; x.beginPath(); x.moveTo(px - Math.cos(r_) * p.len / 2, py - Math.sin(r_) * p.len / 2); x.lineTo(px + Math.cos(r_) * p.len / 2, py + Math.sin(r_) * p.len / 2); x.stroke(); } x.restore();
      if (d < 0.25) { x.save(); x.globalAlpha = (1 - d / 0.25) * 0.5; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(C.cx, C.cy, RUN.R[s.ring].rad + d * 160, 0, PI * 2); x.stroke(); x.restore(); } }
    // ball + trail
    const bx = loop ? C.cx + 3 : F.x, by = loop ? C.cy - 10 : F.y; const cur = RUN.R.find(q => !(q.tBreak !== null && T >= q.tBreak)); const bh = cur ? hue(cur.i) : 50;
    if (!loop) F.trail.forEach(([tx, ty], i) => { const k = (i + 1) / F.trail.length; x.globalAlpha = k * 0.45; x.fillStyle = `hsl(${bh},100%,70%)`; x.beginPath(); x.arc(tx, ty, C.ballR * k, 0, PI * 2); x.fill(); }); x.globalAlpha = 1;
    x.save(); x.shadowColor = '#ffffff'; x.shadowBlur = 24; x.fillStyle = '#ffffff'; x.beginPath(); x.arc(bx, by, C.ballR, 0, PI * 2); x.fill(); x.restore();
    // escape flash + confetti
    const dn = RUN.done; if (dn && T >= dn && !loop) { const d = T - dn; const DF = RUN.frames[Math.min(RUN.frames.length - 1, Math.round(dn * C.fps))]; const ex = DF.x, ey = DF.y; if (d < 0.3) { x.fillStyle = `rgba(255,255,255,${0.5 * (1 - d / 0.3)})`; x.fillRect(0, 0, W, H); } const r = rng(77); for (let i = 0; i < 120; i++) { const a = r() * PI * 2, sp = 200 + r() * 600, px = ex + Math.cos(a) * sp * Math.min(d, 2), py = ey + Math.sin(a) * sp * Math.min(d, 2) + 260 * d * d; x.fillStyle = `hsl(${r() * 360},100%,65%)`; x.save(); x.translate(px, py); x.rotate(d * 8 + i); x.fillRect(-5, -3, 10, 6); x.restore(); } }
    // HUD
    if (!(dn && T >= dn) || loop) { txt('CAN IT ESCAPE', 360, 120, 58, '#ffffff'); txt('ALL 12 RINGS?', 360, 190, 58, '#ffd23a'); }
    const nb = loop ? 0 : F.b; x.save(); x.fillStyle = 'rgba(10,12,30,0.75)'; x.beginPath(); x.roundRect(110, 1060, 230, 110, 26); x.fill(); x.beginPath(); x.roundRect(380, 1060, 230, 110, 26); x.fill(); x.restore();
    txt('RINGS LEFT', 225, 1090, 24, '#9aa6d8', 'CapFont', 0); txt(String(left), 225, 1135, 50, left === 1 && !loop ? '#ff5a4a' : '#ffffff', 'Russo', 0); txt('BOUNCES', 495, 1090, 24, '#9aa6d8', 'CapFont', 0); txt(String(nb), 495, 1135, 50, '#ffffff', 'Russo', 0);
    if (left === 1 && !loop) { const a = 0.6 + 0.4 * Math.sin(T * 8); x.globalAlpha = a; txt('LAST RING', 360, 300, 46, '#ff5a4a'); x.globalAlpha = 1; }
    if (dn && T >= dn && !loop) { const k = ease(prog(T, dn + 0.15, dn + 0.5)); x.save(); x.globalAlpha = k; x.translate(360, 170); const sc = 0.7 + 0.3 * k; x.scale(sc, sc); txt('ESCAPED!', 0, 0, 92, '#5aff8a', 'Russo', 14); x.restore(); x.globalAlpha = k; txt(`in ${RUN.bounces} bounces`, 360, 260, 40, '#ffffff', 'CapFont', 8); const k2 = ease(prog(T, dn + 1.0, dn + 1.4)); x.globalAlpha = k2; txt('Did you think it would make it?', 360, 960, 40, '#ffd23a', 'CapFont', 8); x.globalAlpha = 1; } };
})();
