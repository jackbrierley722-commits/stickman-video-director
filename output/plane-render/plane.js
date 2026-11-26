// Plane crash survival — scenes and timeline. Driven by narration timings in window.TIMING.
(() => {
const E = window.ENGINE;
const { clamp, lerp, ease, prog, rng, panel, camLerp, FULL, TOP, BOT, line, ellipse, rect, rrect, fillStroke, stroke, glow, comicText, burst, caption, silhouette } = E;
const W = 720, H = 1280, INK = '#111111', SIN = Math.sin, COS = Math.cos;
const TM = window.TIMING;
const CL = TM.clips;
// time (local to clip) of the n-th occurrence of a word in a clip
function wt(ci, word, n = 0) {
  const c = CL[ci]; let k = 0;
  for (const w of c.words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word.toLowerCase()) { if (k === n) return w.a - c.start; k++; }
  return 0;
}
const enter = (t, a, d = 0.35) => clamp((t - a) / d);

// ---------- the two friends ----------
const JAKE = { hair: 'spiky', hairCol: '#2a1c15', top: '#28344d', topLine: '#3d4b68', legs: '#1f2433', hood: true };
const RYAN = { hair: 'swept', hairCol: '#a2713f', top: '#b48c5c', topLine: '#8d6a42', legs: '#5a5e66', hood: false };

function armEnd(sx, sy, spec, len, ox, oy, s) {
  if (spec.to) return [(spec.to[0] - ox) / s, (spec.to[1] - oy) / s];
  const a = spec.a * Math.PI / 180; return [sx + COS(a) * (spec.len || len), sy + SIN(a) * (spec.len || len)];
}
function guy(ctx, who, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((o.lean || 0) * Math.PI / 180);
  const w = o.walk; const sw = w === undefined ? 0 : SIN(w) * 24; ctx.translate(0, w === undefined ? 0 : Math.abs(COS(w)) * -5);
  const shiv = o.shiver ? SIN((o.t || 0) * 60) * 1.5 : 0; ctx.translate(shiv, 0);
  const top = -226, hipY = -112;
  // legs (jeans) — thin dark limb drawn thicker in jeans colour
  if (!o.noLegs) {
    for (const [hx, fx] of [[-16, -16 + sw], [16, 16 - sw]]) { line(ctx, hx, hipY, fx, 0, 15); line(ctx, hx, hipY, fx, 0, 9, who.legs); line(ctx, fx - 7, 2, fx + 9, 2, 10); }
  }
  // top / jacket
  ctx.beginPath(); ctx.moveTo(-48, top + 10); ctx.quadraticCurveTo(-52, top - 4, -30, top - 10); ctx.quadraticCurveTo(0, top - 2, 30, top - 10); ctx.quadraticCurveTo(52, top - 4, 48, top + 10);
  ctx.lineTo(54, hipY + 4); ctx.quadraticCurveTo(0, hipY + 12, -54, hipY + 4); ctx.closePath(); fillStroke(ctx, who.top, 5);
  if (who.hood) { ctx.beginPath(); ctx.moveTo(-30, top - 8); ctx.quadraticCurveTo(0, top + 22, 30, top - 8); stroke(ctx, 3, who.topLine); line(ctx, -8, top + 6, -10, top + 40, 2.5, '#d8d8d8'); line(ctx, 8, top + 6, 10, top + 40, 2.5, '#d8d8d8'); rrect(ctx, -28, hipY - 44, 56, 26, 6); stroke(ctx, 2.5, who.topLine); }
  else { line(ctx, 0, top + 2, 0, hipY + 8, 2.5, who.topLine); ctx.beginPath(); ctx.moveTo(-26, top - 8); ctx.lineTo(-6, top + 22); ctx.lineTo(0, top + 4); ctx.lineTo(6, top + 22); ctx.lineTo(26, top - 8); stroke(ctx, 3, who.topLine); }
  if (o.dirt) { for (const [dx, dy] of [[-30, -170], [22, -140], [-10, -128]]) { ellipse(ctx, dx, dy, 7, 4); ctx.fillStyle = 'rgba(60,45,30,0.55)'; ctx.fill(); } }
  // arms
  const arm = (spec, side) => {
    const sx = side * 42, sy = top + 22; const [ex, ey] = armEnd(sx, sy, spec, 112, x, y, s);
    const mx = lerp(sx, ex, 0.6), my = lerp(sy, ey, 0.6);
    line(ctx, sx, sy, mx, my, 22); line(ctx, sx, sy, mx, my, 15, who.top); line(ctx, mx, my, ex, ey, 6);
    ellipse(ctx, ex, ey, 8.5, 8.5); ctx.fillStyle = INK; ctx.fill();
  };
  arm(o.armL || { a: 100 }, -1); arm(o.armR || { a: 80 }, 1);
  if (o.cross) { line(ctx, -40, top + 62, 40, top + 52, 20); line(ctx, -40, top + 62, 40, top + 52, 13, who.top); line(ctx, 40, top + 62, -40, top + 52, 20); line(ctx, 40, top + 62, -40, top + 52, 13, who.top); }
  // head
  const hy = top - 64; line(ctx, 0, top - 4, 0, hy + 56, 4);
  ctx.save(); ctx.translate(0, hy); ctx.rotate((o.headTilt || 0) * Math.PI / 180);
  ellipse(ctx, 0, 0, 60, 60); fillStroke(ctx, '#ffffff', 5);
  const dx = o.eyeDX || 0, dy = o.eyeDY || 0, k = o.wide ? 1.35 : 1;
  for (const ex of [-21, 21]) {
    if (o.blink || o.closed) line(ctx, ex - 7 + dx, 4 + dy, ex + 7 + dx, 4 + dy, 2.6);
    else { ellipse(ctx, ex + dx, 2 + dy, 5 * k, 9 * k); ctx.fillStyle = INK; ctx.fill(); }
  }
  if (o.worried) { line(ctx, -30 + dx, -16, -12 + dx, -22, 2.5); line(ctx, 30 + dx, -16, 12 + dx, -22, 2.5); }
  if (o.mouth === 'o') { ellipse(ctx, dx * 0.5, 34, 6, 8); ctx.fillStyle = INK; ctx.fill(); } else line(ctx, -12 + dx * 0.4, 32, 12 + dx * 0.4, 32, 2.6);
  if (o.scratch) { line(ctx, 30, -6, 44, 6, 2.2, '#c0473a'); line(ctx, 34, -10, 48, 2, 2.2, '#c0473a'); }
  if (o.breath) { const b = ((o.t || 0) * 0.7) % 1; ellipse(ctx, 70 + b * 40, 30 - b * 30, 10 + b * 16, 7 + b * 10); ctx.fillStyle = `rgba(230,236,245,${0.5 * (1 - b)})`; ctx.fill(); }
  // hair
  ctx.beginPath();
  if (who.hair === 'spiky') {
    ctx.moveTo(-64, 4);
    for (const [px, py] of [[-72, -28], [-60, -22], [-68, -58], [-46, -48], [-44, -84], [-20, -64], [-8, -96], [10, -68], [30, -92], [36, -62], [62, -74], [56, -42], [74, -32], [62, -14], [68, 8]]) ctx.lineTo(px, py);
    ctx.lineTo(58, -10); ctx.lineTo(48, -26); ctx.lineTo(38, -6); ctx.lineTo(26, -30); ctx.lineTo(12, -14); ctx.lineTo(0, -32); ctx.lineTo(-14, -10); ctx.lineTo(-26, -30); ctx.lineTo(-40, -8); ctx.lineTo(-52, -22); ctx.lineTo(-58, 0);
  } else {
    ctx.moveTo(-62, 10); ctx.bezierCurveTo(-74, -50, -40, -82, 4, -80); ctx.bezierCurveTo(52, -80, 78, -50, 64, 6);
    ctx.quadraticCurveTo(58, -18, 48, -26); ctx.quadraticCurveTo(40, -10, 30, -6); ctx.quadraticCurveTo(26, -30, 2, -38);
    ctx.quadraticCurveTo(-24, -30, -36, -14); ctx.quadraticCurveTo(-44, -22, -48, -20); ctx.quadraticCurveTo(-56, -6, -62, 10);
  }
  ctx.closePath(); fillStroke(ctx, who.hairCol, 4);
  if (who.hair === 'swept') { ctx.beginPath(); ctx.moveTo(-30, -60); ctx.quadraticCurveTo(10, -66, 40, -44); stroke(ctx, 2.5, '#7a5230'); }
  ctx.restore();
  ctx.restore();
}
// lying down: rotate whole figure
function lying(ctx, who, x, y, s, o) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2); guy(ctx, who, 0, 0, s, o); ctx.restore(); }

// ---------- environments ----------
const RN = rng(11);
const TREES_FAR = Array.from({ length: 22 }, (_, i) => [i * 40 - 60 + RN() * 20, 60 + RN() * 70]);
const TREES_MID = Array.from({ length: 10 }, (_, i) => [i * 90 - 60 + RN() * 40, RN()]);
const STARS = Array.from({ length: 90 }, () => [RN() * W, RN() * 760, RN()]);
const LEAVES = Array.from({ length: 160 }, () => [RN(), RN(), RN()]);

function skyCols(tod) {
  return {
    sunset: ['#4a4d6e', '#e8834a', '#f3b562'], dusk: ['#1c2140', '#7a4a5e', '#c9704a'], night: ['#03050b', '#0b1222', '#16203a'], day: ['#7aa6c9', '#c7dbe4', '#e8e0c8']
  }[tod];
}
function sky(ctx, tod, t, k = 0) {
  const c = skyCols(tod); const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, c[0]); g.addColorStop(0.65, c[1]); g.addColorStop(1, c[2]); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, 1400);
  if (tod === 'night' || tod === 'dusk') for (const [sx, sy, a] of STARS) { const al = (tod === 'night' ? 1 : 0.35) * (0.3 + 0.6 * a * (0.6 + 0.4 * SIN(t * 2 + a * 9))); ctx.fillStyle = `rgba(225,232,250,${al})`; ctx.fillRect(sx, sy, 2, 2); }
  if (tod === 'night') { glow(ctx, 560, 230, 200, 'rgba(190,210,240,A)', 0.2); ellipse(ctx, 560, 230, 40, 40); ctx.fillStyle = '#dfe6f0'; ctx.fill(); ellipse(ctx, 576, 222, 34, 34); ctx.fillStyle = c[0]; ctx.fill(); }
  if (tod === 'sunset') { const sy = 760 + k * 140; glow(ctx, 470, sy, 280, 'rgba(255,190,100,A)', 0.55); ellipse(ctx, 470, sy, 54, 54); ctx.fillStyle = '#ffd27a'; ctx.fill(); }
}
function treeShape(ctx, x, base, h, col, lw = 3) {
  line(ctx, x, base, x, base - h * 0.5, h * 0.07, col);
  ctx.beginPath(); ctx.moveTo(x - h * 0.28, base - h * 0.32); ctx.lineTo(x, base - h); ctx.lineTo(x + h * 0.28, base - h * 0.32); ctx.closePath(); fillStroke(ctx, col, lw);
  ctx.beginPath(); ctx.moveTo(x - h * 0.22, base - h * 0.55); ctx.lineTo(x, base - h * 1.12); ctx.lineTo(x + h * 0.22, base - h * 0.55); ctx.closePath(); fillStroke(ctx, col, lw);
}
function forest(ctx, o) {
  const t = o.t || 0, tod = o.tod; sky(ctx, tod, t, o.sunK || 0);
  const pal = { sunset: ['#4a3a4a', '#2f3a2a', '#24301f', '#3d4a2a', '#2a2018'], dusk: ['#2a2436', '#1e2620', '#161d17', '#262e1e', '#1a1510'], night: ['#0b0f18', '#0a0f0c', '#070a08', '#121812', '#0c0a08'], day: ['#7f8f8a', '#4b6a3e', '#3a5530', '#5c7a3e', '#5a4530'] }[tod];
  // far hills / trees
  ctx.beginPath(); ctx.moveTo(-400, 860); ctx.bezierCurveTo(100, 800, 400, 830, 1120, 790); ctx.lineTo(1120, 1000); ctx.lineTo(-400, 1000); ctx.closePath(); ctx.fillStyle = pal[0]; ctx.fill();
  for (const [x, h] of TREES_FAR) treeShape(ctx, x, 880, h, pal[1], 2);
  // distant light
  if (o.light) { const [lx, ly, la] = o.light; const fl = 0.7 + 0.3 * SIN(t * 13) * SIN(t * 4.7); glow(ctx, lx, ly, 120, 'rgba(255,214,140,A)', 0.7 * la * fl); ellipse(ctx, lx, ly, 6, 6); ctx.fillStyle = `rgba(255,240,200,${la * fl})`; ctx.fill(); }
  // ground
  const gg = ctx.createLinearGradient(0, 880, 0, 1300); gg.addColorStop(0, pal[3]); gg.addColorStop(1, pal[4]); ctx.fillStyle = gg; ctx.fillRect(-400, 880, W + 800, 600);
  if (o.ground) o.ground(ctx);
  // mid trees (trunks + canopies)
  for (const [x, q] of TREES_MID) { if (o.clearing && x > 120 && x < 600) continue; const h = 520 + q * 160; line(ctx, x, 1010, x, 1010 - h * 0.7, 26 + q * 10); line(ctx, x, 1010, x, 1010 - h * 0.7, 18 + q * 10, pal[4]); treeShape(ctx, x, 1010 - h * 0.25, h * 0.85, pal[2], 4); }
  if (o.mid) o.mid(ctx);
  // foreground ferns/grass
  for (let i = 0; i < 26; i++) { const fx = i * 30 - 20, sw = SIN(t * 1.5 + i) * 4; ctx.beginPath(); ctx.moveTo(fx, 1300); ctx.quadraticCurveTo(fx + sw, 1230, fx + 14 + sw * 2, 1190 + (i % 3) * 20); stroke(ctx, 5, pal[2]); }
  if (o.front) o.front(ctx);
  if (tod === 'night' || tod === 'dusk') { ctx.fillStyle = tod === 'night' ? 'rgba(10,20,45,0.28)' : 'rgba(40,20,50,0.18)'; ctx.fillRect(-400, -400, W + 800, 2000); }
}
function plane(ctx, x, y, s, rot, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // far wing
  ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(40, -70); ctx.lineTo(70, -70); ctx.lineTo(50, -6); ctx.closePath(); fillStroke(ctx, '#b9c0c8', 4);
  // tail
  ctx.beginPath(); ctx.moveTo(-190, -16); ctx.lineTo(-230, -90); ctx.lineTo(-200, -90); ctx.lineTo(-150, -18); ctx.closePath(); fillStroke(ctx, '#d6dce2', 4);
  // fuselage
  ctx.beginPath(); ctx.moveTo(-210, -20); ctx.lineTo(160, -26); ctx.quadraticCurveTo(230, -22, 236, 4); ctx.quadraticCurveTo(220, 24, 160, 26); ctx.lineTo(-200, 18); ctx.quadraticCurveTo(-226, 0, -210, -20); ctx.closePath(); fillStroke(ctx, '#eef1f4', 5);
  line(ctx, -180, 8, 190, 8, 6, '#3d6aa8');
  for (let i = 0; i < 12; i++) { ellipse(ctx, -150 + i * 26, -6, 5, 6); ctx.fillStyle = '#2a3442'; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(196, -14); ctx.quadraticCurveTo(214, -14, 222, -2); ctx.lineTo(196, -2); ctx.closePath(); fillStroke(ctx, '#2a3442', 2.5);
  // near wing + engine
  ctx.beginPath(); ctx.moveTo(-30, 8); ctx.lineTo(30, 100); ctx.lineTo(66, 100); ctx.lineTo(56, 8); ctx.closePath(); fillStroke(ctx, '#c9d0d8', 4);
  rrect(ctx, 6, 40, 62, 26, 12); fillStroke(ctx, '#9aa3ad', 4);
  if (o.fire) { const f = o.fire; for (let i = 0; i < 4; i++) { const fl = SIN((o.t || 0) * 30 + i * 2) * 6; ellipse(ctx, -2 - i * 14, 53 + fl * 0.3, 16 * f - i * 2, 10 * f); ctx.fillStyle = i < 2 ? '#ffcf4a' : '#f0662a'; ctx.fill(); } }
  ctx.restore();
}
function smokeTrail(ctx, pts, t, a = 1, col = '60,60,64') {
  pts.forEach(([x, y], i) => { const r = 18 + i * 5 + SIN(t * 3 + i) * 4; ellipse(ctx, x, y, r, r * 0.85); ctx.fillStyle = `rgba(${col},${a * Math.max(0, 0.65 - i * 0.018)})`; ctx.fill(); });
}
function cabin(ctx, o) {
  const t = o.t || 0; const flick = o.flicker ? (SIN(t * 37) * SIN(t * 13) > 0.2 ? 0.45 : 1) : 1;
  ctx.fillStyle = '#c9c4b8'; ctx.fillRect(-300, -300, W + 600, 1900);
  // ceiling & bins
  ctx.beginPath(); ctx.moveTo(-300, 0); ctx.quadraticCurveTo(360, -200, 1020, 0); ctx.lineTo(1020, 260); ctx.quadraticCurveTo(360, 120, -300, 260); ctx.closePath(); fillStroke(ctx, '#dedad0', 5);
  for (const x of [-120, 140, 400, 660]) { ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x + 240, 170); ctx.lineTo(x + 240, 300); ctx.lineTo(x, 320); ctx.closePath(); fillStroke(ctx, '#e9e6de', 4); }
  // side windows
  for (const [wx, wy, s] of [[30, 470, 1], [690, 470, 1], [-40, 560, 1.3], [760, 560, 1.3]]) { ellipse(ctx, wx, wy, 34 * s, 50 * s); fillStroke(ctx, '#e8a060', 5); ellipse(ctx, wx, wy, 26 * s, 40 * s); ctx.fillStyle = o.night ? '#22283a' : '#f0b878'; ctx.fill(); }
  // rows behind
  for (let r = 3; r >= 1; r--) { const sc = 0.45 + r * 0.0, y = 640 + (3 - r) * 40; for (const sx of [130, 250, 470, 590]) { rrect(ctx, sx - 50 * (0.5 + 0.15 * (3 - r)), y - 140 * (0.5 + 0.15 * (3 - r)), 100 * (0.5 + 0.15 * (3 - r)), 170 * (0.5 + 0.15 * (3 - r)), 14); fillStroke(ctx, '#3c5a8a', 3); } }
  ctx.fillStyle = '#7c7468'; ctx.fillRect(-300, 760, W + 600, 700);
  // light
  ctx.fillStyle = `rgba(0,0,10,${(1 - flick) * 0.6})`; ctx.fillRect(-300, -300, W + 600, 1900);
  if (o.alarm) { const a = (SIN(t * 7) * 0.5 + 0.5) * o.alarm; ctx.fillStyle = `rgba(220,40,30,${0.22 * a})`; ctx.fillRect(-300, -300, W + 600, 1900); }
}
function seatsAndPeople(ctx, o) {
  const t = o.t || 0;
  for (const sx of [230, 490]) { rrect(ctx, sx - 110, 520, 220, 420, 30); fillStroke(ctx, '#33507e', 5); rrect(ctx, sx - 80, 520, 160, 70, 18); fillStroke(ctx, '#e8e4da', 3); }
  guy(ctx, JAKE, 230, 1130, 1.25, Object.assign({ t, armL: { a: 120 }, armR: { a: 60 } }, o.jake || {}));
  guy(ctx, RYAN, 490, 1130, 1.25, Object.assign({ t, armL: { a: 120 }, armR: { a: 60 } }, o.ryan || {}));
  if (o.masks) for (const mx of [300, 560]) { const dr = o.masks, sw = SIN(t * 4 + mx) * 10 * dr; line(ctx, mx, 300, mx + sw, 300 + 300 * dr, 2.5, '#eee'); ellipse(ctx, mx + sw, 320 + 300 * dr, 26, 20); fillStroke(ctx, '#f2d24a', 4); }
  // seat row in front
  rrect(ctx, -60, 900, 840, 500, 40); fillStroke(ctx, '#2c4570', 6); line(ctx, 360, 900, 360, 1400, 5);
}
function wreck(ctx, t) {
  ctx.save(); ctx.translate(250, 1010); ctx.rotate(-0.06);
  ctx.beginPath(); ctx.moveTo(-320, -130); ctx.lineTo(180, -150);
  for (const [x, y] of [[200, -120], [176, -90], [206, -60], [180, -30], [204, 0], [184, 20]]) ctx.lineTo(x, y);
  ctx.lineTo(-320, 30); ctx.closePath(); fillStroke(ctx, '#d6dbe0', 6);
  line(ctx, -320, -10, 190, -14, 9, '#3d6aa8');
  for (let i = 0; i < 9; i++) { ellipse(ctx, -280 + i * 50, -80, 9, 12); ctx.fillStyle = '#2a3442'; ctx.fill(); }
  ellipse(ctx, 186, -64, 40, 80); ctx.fillStyle = '#121418'; ctx.fill();
  ctx.restore();
  for (const [dx, dy, r] of [[520, 1100, 30], [80, 1150, 24], [600, 1180, 18], [430, 1210, 22]]) { ctx.save(); ctx.translate(dx, dy); ctx.rotate(dx); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(0, -r * 0.6); ctx.lineTo(r, -r * 0.1); ctx.lineTo(r * 0.4, r * 0.5); ctx.closePath(); fillStroke(ctx, '#aab2bb', 3); ctx.restore(); }
  const pts = Array.from({ length: 16 }, (_, i) => [430 + i * 14 + SIN(t * 0.8 + i * 0.35) * 22, 930 - i * 46]); smokeTrail(ctx, pts, t, 0.8, '50,50,55');
}
function shelter(ctx, x, y, s, p, t, night) {
  // p: 0..1 ridge, 1..2 side branches, 2..3 leaves
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const br = night ? '#3a2a1c' : '#6a4a2c';
  const k1 = clamp(p), k2 = clamp(p - 1), k3 = clamp(p - 2);
  if (k1 > 0) { line(ctx, -200, 0, -170, -170, 12); line(ctx, -200, 0, -170, -170, 8, br); line(ctx, -140, 0, -170, -170, 12); line(ctx, -140, 0, -170, -170, 8, br); line(ctx, -170, -170, lerp(-170, 230, k1), lerp(-170, 0, k1), 14); line(ctx, -170, -170, lerp(-170, 230, k1), lerp(-170, 0, k1), 9, br); }
  const nb = Math.floor(k2 * 9);
  for (let i = 0; i < nb; i++) { const f = i / 8; const rx = lerp(-160, 200, f), ry = lerp(-165, -10, f); line(ctx, rx, ry, rx - 40, 6, 10); line(ctx, rx, ry, rx - 40, 6, 6, br); }
  const nl = Math.floor(k3 * LEAVES.length);
  for (let i = 0; i < nl; i++) { const [u, v, q] = LEAVES[i]; const f = u; const rx = lerp(-160, 200, f) - v * 40, ry = lerp(lerp(-165, -10, f), 6, v); ellipse(ctx, rx, ry, 16, 9, q * 3); fillStroke(ctx, night ? (q > 0.5 ? '#1e2a18' : '#2a2416') : (q > 0.5 ? '#5d7a32' : q > 0.25 ? '#8a6a2a' : '#4a6a2a'), 2); }
  ctx.restore();
}
function lightOrb(ctx, x, y, a, t, big = 1) { const fl = 0.7 + 0.3 * SIN(t * 13) * SIN(t * 4.7); glow(ctx, x, y, 140 * big, 'rgba(255,214,140,A)', 0.75 * a * fl); ellipse(ctx, x, y, 7 * big, 7 * big); ctx.fillStyle = `rgba(255,244,210,${a * fl})`; ctx.fill(); }

// ---------- clips ----------
const CLIPS = [
  // 1 Hook
  (ctx, lt, T, D) => {
    const s2 = 3.0, s3 = 6.2;
    if (lt < s2) {
      const p = prog(lt, 0, s2);
      panel(ctx, FULL, c => { forest(c, { tod: 'sunset', t: T }); const px = lerp(140, 420, p), py = lerp(420, 470, p); smokeTrail(c, Array.from({ length: Math.floor(ease(prog(lt, 1.8, 3)) * 18) }, (_, i) => [px - 30 - i * 26, py + 60 + i * 3]), T, 0.7); plane(c, px, py, 1.0, 0.04 + SIN(T * 3) * 0.01, { fire: ease(prog(lt, 1.8, 2.4)), t: T }); }, { z: 1.05, cx: lerp(330, 420, p), cy: 640 }, 1);
    } else if (lt < s3) {
      const sh = SIN(lt * 50) * 5;
      ctx.save(); ctx.translate(sh, SIN(lt * 43) * 4);
      panel(ctx, FULL, c => { cabin(c, { t: T, flicker: true, alarm: 1 }); seatsAndPeople(c, { t: T, masks: ease(prog(lt, s2 + 1.2, s2 + 1.8)), jake: { wide: true, eyeDX: 8, worried: true }, ryan: { wide: true, eyeDX: -8, worried: true, mouth: 'o' } }); }, { z: 1.0, cx: 360, cy: 700 }, enter(lt, s2));
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(SIN(lt * 50) * 4, 0);
      panel(ctx, FULL, c => { cabin(c, { t: T, flicker: true, alarm: 1 }); seatsAndPeople(c, { t: T, masks: 1, jake: { wide: true, eyeDX: 14, worried: true, mouth: 'o' }, ryan: { wide: true, eyeDX: -14, worried: true } }); }, { z: lerp(1.5, 1.75, prog(lt, s3, D)), cx: 360, cy: 760 }, enter(lt, s3));
      ctx.restore();
    }
  },
  // 2 The crash
  (ctx, lt, T, D) => {
    const fail = wt(1, 'failed'), tore = wt(1, 'tore'), slam = wt(1, 'slammed');
    if (lt < fail + 0.6) {
      panel(ctx, FULL, c => { cabin(c, { t: T }); seatsAndPeople(c, { t: T, jake: { eyeDX: 6, armR: { a: 20 } }, ryan: { eyeDX: -6, blink: lt % 3 > 2.85 } }); }, { z: 1.25, cx: 360, cy: 780 }, 1);
      const la = enter(lt, 0.6, 0.3) * (1 - enter(lt, fail + 0.2, 0.3));
      comicText(ctx, 'JAKE', 190, 300, 64, '#9fb6e0', la); comicText(ctx, 'RYAN', 530, 300, 64, '#e2b77a', la);
      if (lt > fail - 0.3) { const k = enter(lt, fail - 0.3, 0.3); ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.ellipse(560, 420, 110, 150, 0, 0, 7); ctx.fillStyle = '#e8a060'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(560, 420, 88, 126, 0, 0, 7); ctx.save(); ctx.clip(); ctx.fillStyle = '#e8925a'; ctx.fillRect(440, 280, 240, 280); plane(ctx, 900, 330, 1.6, 0, { fire: 1.2, t: T }); ctx.restore(); ctx.restore(); }
    } else if (lt < tore + 0.3) {
      const p = prog(lt, fail + 0.6, tore + 0.3);
      ctx.save(); ctx.translate(SIN(lt * 60) * 6, 0);
      panel(ctx, FULL, c => { forest(c, { tod: 'sunset', t: T }); const px = lerp(160, 470, p), py = lerp(380, 780, ease(p)); smokeTrail(c, Array.from({ length: 24 }, (_, i) => [px - 40 - i * 18, py - i * 22]), T, 0.85, '40,40,44'); plane(c, px, py, 0.9, 0.35 + p * 0.25, { fire: 1.4, t: T }); }, { z: 1.0 + p * 0.3, cx: lerp(300, 450, p), cy: lerp(560, 760, p) }, enter(lt, fail + 0.6));
      ctx.restore();
    } else {
      const p = prog(lt, tore + 0.3, slam + 0.2), hit = lt > slam;
      const sh = hit ? Math.max(0, 1 - (lt - slam) / 1.2) * 22 : 4;
      ctx.save(); ctx.translate(SIN(lt * 70) * sh, SIN(lt * 55) * sh);
      panel(ctx, FULL, c => {
        forest(c, {
          tod: 'sunset', t: T, mid: c2 => {
            if (!hit) plane(c2, lerp(300, 470, p), lerp(700, 960, p), 0.8, 0.55, { fire: 1.4, t: T });
            if (hit) { const k = clamp((lt - slam) / 2.5); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI, r = 60 + k * 260 * (0.6 + 0.4 * SIN(i * 3)); ellipse(c2, 470 + COS(a) * r, 960 - SIN(a) * r * 0.9, 50 + k * 60, 40 + k * 50); c2.fillStyle = `rgba(55,52,52,${0.8 * (1 - k * 0.5)})`; c2.fill(); } glow(c2, 470, 960, 300, 'rgba(255,150,60,A)', 0.8 * (1 - k)); }
          }
        });
      }, { z: 1.2, cx: 440, cy: 820 }, 1);
      ctx.restore();
      if (hit) { const a = 1 - clamp((lt - slam - 0.6) / 0.6); burst(ctx, 360, 420, 210, a, 'CRASH!'); ctx.fillStyle = `rgba(255,240,220,${Math.max(0, 0.8 - (lt - slam) * 4)})`; ctx.fillRect(0, 0, W, H); }
    }
  },
  // 3 Survivors
  (ctx, lt, T, D) => {
    const bruised = wt(2, 'bruised'), sun = wt(2, 'sun');
    if (lt < bruised - 0.1) {
      const p = prog(lt, 0.2, bruised);
      panel(ctx, FULL, c => forest(c, { tod: 'sunset', t: T, clearing: true, sunK: 0.2, mid: c2 => { wreck(c2, T); guy(c2, RYAN, lerp(430, 520, p), 1070, 0.42, { t: T, lean: 30 * (1 - p), eyeDX: 6, dirt: true, armR: { a: 40 } }); guy(c2, JAKE, lerp(470, 600, ease(p)), 1100, 0.45, { t: T, walk: lt * 6, eyeDX: 8, dirt: true }); } }), { z: 1.45, cx: 440, cy: 900 }, 1);
    } else if (lt < sun - 0.1) {
      panel(ctx, TOP, c => forest(c, { tod: 'sunset', t: T, clearing: true, mid: c2 => guy(c2, JAKE, 360, 1280, 2.5, { t: T, dirt: true, scratch: true, eyeDX: 6, blink: lt % 2.5 > 2.35 }) }), { z: 1.0, cx: 360, cy: 760 }, 1);
      panel(ctx, BOT, c => forest(c, { tod: 'sunset', t: T, clearing: true, mid: c2 => guy(c2, RYAN, 360, 1280, 2.5, { t: T, dirt: true, scratch: true, eyeDX: -6, armR: { to: [470, 680] } }) }), { z: 1.0, cx: 360, cy: 760 }, enter(lt, bruised + 0.4));
    } else {
      const p = prog(lt, sun - 0.1, D);
      panel(ctx, FULL, c => forest(c, { tod: 'sunset', t: T, clearing: true, sunK: 0.3 + p * 0.7, mid: c2 => { wreck(c2, T); guy(c2, JAKE, 520, 1120, 0.4, { t: T, eyeDY: -4 }); guy(c2, RYAN, 590, 1124, 0.4, { t: T, eyeDY: -4 }); } }), { z: lerp(1.2, 1.0, ease(p)), cx: 380, cy: lerp(820, 700, ease(p)) }, enter(lt, sun - 0.1));
    }
  },
  // 4 Rule 1
  (ctx, lt, T, D) => {
    const out = wt(3, 'out');
    if (lt < out - 0.1) {
      const p = prog(lt, 0, out);
      panel(ctx, FULL, c => forest(c, { tod: 'sunset', t: T, clearing: true, sunK: 1, mid: c2 => { guy(c2, JAKE, lerp(260, 330, p), 1110, 0.5, { t: T, walk: lt * 5, armR: { to: [lerp(330, 400, p) + 20, 1030] }, eyeDX: 6 }); line(c2, lerp(330, 400, p) - 60, 1050, lerp(330, 400, p) + 120, 1010, 9, '#5a3e24'); guy(c2, RYAN, 470, 1110, 0.5, { t: T, eyeDX: -6, armL: { a: 150 } }); } }), { z: 1.3, cx: 380, cy: 900 }, 1);
    } else {
      const p = prog(lt, out - 0.1, D);
      panel(ctx, FULL, c => forest(c, { tod: 'dusk', t: T, clearing: true, mid: c2 => { guy(c2, JAKE, 250, 1260, 1.6, { t: T, cross: true, shiver: true, breath: true, worried: true, eyeDX: -4, armL: { a: 30 }, armR: { a: 150 } }); guy(c2, RYAN, 500, 1260, 1.6, { t: T + 0.4, cross: true, shiver: true, breath: true, worried: true, eyeDX: -6, armL: { a: 30 }, armR: { a: 150 } }); } }), { z: 1.0 + p * 0.1, cx: 380, cy: 860 }, enter(lt, out - 0.1));
    }
  },
  // 5 Camp
  (ctx, lt, T, D) => {
    const cover = wt(4, 'cover'), pile = wt(4, 'pile');
    const build = lt < cover ? lerp(0, 2, prog(lt, 0.2, cover)) : lerp(2, 3, prog(lt, cover, pile + 0.5));
    const tod = lt < pile ? 'sunset' : 'dusk';
    if (lt < pile) {
      panel(ctx, FULL, c => forest(c, { tod: lt < cover ? 'dusk' : 'dusk', t: T, clearing: true, mid: c2 => {
        shelter(c2, 360, 1120, 1.0, build, T, false);
        if (lt < cover) guy(c2, JAKE, 600, 1140, 0.55, { t: T, eyeDX: -8, armL: { to: [520, 1000] }, armR: { to: [560, 990] } });
        else guy(c2, RYAN, 610, 1140, 0.55, { t: T, eyeDX: -8, armL: { to: [540 + SIN(lt * 6) * 20, 980] } });
        if (lt < cover) { line(c2, 470, 1020, 640, 940, 10, '#6a4a2c'); }
        guy(c2, lt < cover ? RYAN : JAKE, 140, 1140, 0.55, { t: T, eyeDX: 8, armR: { to: [230, 1060] } });
      } }), { z: 1.35, cx: 380, cy: 960 }, 1);
    } else {
      const p = prog(lt, pile, D);
      panel(ctx, FULL, c => forest(c, { tod: p < 0.5 ? 'dusk' : 'night', t: T, clearing: true, mid: c2 => { shelter(c2, 360, 1120, 1.0, 3, T, p > 0.5); guy(c2, JAKE, 300, 1150, 0.5, { t: T, armL: { to: [260, 1100 - SIN(lt * 5) * 10] } }); guy(c2, RYAN, 430, 1150, 0.5, { t: T, armR: { to: [470, 1100 + SIN(lt * 5) * 10] } }); } }), { z: lerp(1.35, 1.0, ease(p)), cx: 380, cy: lerp(960, 800, ease(p)) }, enter(lt, pile, 0.25));
      ctx.fillStyle = `rgba(5,8,20,${p * 0.35})`; ctx.fillRect(0, 0, W, H);
    }
  },
  // 6 Night & twist
  (ctx, lt, T, D) => {
    const lie = wt(5, 'lie'), close = wt(5, 'close'), sits = wt(5, 'sits'), jake = wt(5, 'jake');
    if (lt < lie - 0.1) {
      panel(ctx, FULL, c => forest(c, { tod: 'night', t: T, clearing: true, mid: c2 => { shelter(c2, 360, 1120, 0.6, 3, T, true); glow(c2, 360, 1060, 260, 'rgba(120,150,210,A)', 0.18); } }), { z: lerp(1.4, 1.7, prog(lt, 0, lie)), cx: 360, cy: 980 }, 1);
    } else if (lt < sits - 0.1) {
      const shut = lt > close + 0.5;
      panel(ctx, FULL, c => {
        c.fillStyle = '#0a0c10'; c.fillRect(-300, -300, 1400, 1900);
        for (let i = 0; i < 40; i++) { const [u, v, q] = LEAVES[i]; ellipse(c, u * 720, 100 + v * 300, 50, 26, q * 3); fillStroke(c, '#1a2214', 3); }
        c.fillStyle = '#1a140e'; c.fillRect(-300, 800, 1400, 800);
        lying(c, JAKE, 60, 700, 0.95, { t: T, closed: shut, blink: !shut && lt % 2 > 1.85, eyeDX: 0 });
        lying(c, RYAN, 60, 1000, 0.95, { t: T, closed: shut });
        for (let i = 40; i < 110; i++) { const [u, v, q] = LEAVES[i]; ellipse(c, 380 + u * 360, 700 + v * 520, 34, 18, q * 3); fillStroke(c, q > 0.5 ? '#2a2a18' : '#22301a', 2.5); }
        c.fillStyle = 'rgba(30,50,90,0.25)'; c.fillRect(-300, -300, 1400, 1900);
      }, { z: 1.0 + prog(lt, lie, sits) * 0.15, cx: 360, cy: 760 }, enter(lt, lie - 0.1));
    } else if (lt < jake + 0.6) {
      panel(ctx, FULL, c => {
        c.fillStyle = '#0a0c10'; c.fillRect(-300, -300, 1400, 1900);
        for (let i = 0; i < 40; i++) { const [u, v, q] = LEAVES[i]; ellipse(c, u * 720, 100 + v * 300, 50, 26, q * 3); fillStroke(c, '#1a2214', 3); }
        c.fillStyle = '#1a140e'; c.fillRect(-300, 800, 1400, 800);
        lying(c, JAKE, 60, 700, 0.95, { t: T, closed: lt < jake + 0.2, eyeDX: 0 });
        guy(c, RYAN, 330, 1200, 1.3, { t: T, wide: true, eyeDX: 10, worried: true, noLegs: true, armR: { to: [560, 860] } });
        c.fillStyle = 'rgba(30,50,90,0.25)'; c.fillRect(-300, -300, 1400, 1900);
      }, { z: 1.1, cx: 380, cy: 820 }, enter(lt, sits - 0.1, 0.15));
    } else {
      const p = prog(lt, jake + 0.6, D);
      panel(ctx, FULL, c => forest(c, { tod: 'night', t: T, light: [lerp(300, 380, p), 850 + SIN(T * 2) * 6, ease(prog(lt, jake + 0.6, jake + 1.2))] }), { z: lerp(1.6, 2.4, ease(p)), cx: lerp(330, 370, p), cy: 830 }, enter(lt, jake + 0.6, 0.2));
    }
  },
  // 7 Decision & ending
  (ctx, lt, T, D) => {
    const optB = wt(6, 'option', 1), comment = wt(6, 'comment');
    if (lt < comment - 0.1) {
      const pa = prog(lt, 0, comment);
      panel(ctx, TOP, c => forest(c, { tod: 'night', t: T, light: [380, 860, 1], mid: c2 => { guy(c2, JAKE, lerp(160, 260, pa), 1180, 0.6, { t: T, walk: lt * 5, eyeDY: -3, armR: { to: [lerp(160, 260, pa) + 70, 1010] } }); line(c2, lerp(160, 260, pa) + 40, 1080, lerp(160, 260, pa) + 110, 960, 9, '#4a3420'); guy(c2, RYAN, lerp(80, 180, pa), 1190, 0.6, { t: T, walk: lt * 5 + 1.5, worried: true, eyeDX: 6 }); } }), { z: 1.4, cx: 300, cy: 980 }, 1);
      panel(ctx, BOT, c => forest(c, { tod: 'night', t: T, clearing: true, light: [600, 870, 1], mid: c2 => { shelter(c2, 340, 1150, 1.0, 3, T, true); guy(c2, JAKE, 250, 1150, 0.42, { t: T, wide: true, eyeDX: 10, noLegs: false }); guy(c2, RYAN, 320, 1150, 0.42, { t: T, wide: true, eyeDX: 10 }); } }), { z: 1.9, cx: 380, cy: 1020 }, enter(lt, optB - 0.2));
      comicText(ctx, 'A: INVESTIGATE', 360, 80, 64, '#f0a94a', enter(lt, 0.1));
      comicText(ctx, 'B: STAY & SLEEP', 360, 712, 64, '#b9c6d8', enter(lt, optB - 0.1));
    } else {
      const p = prog(lt, comment - 0.1, D);
      panel(ctx, FULL, c => forest(c, { tod: 'night', t: T, light: [lerp(330, 360, p), 850, 1], clearing: true, mid: c2 => shelter(c2, 560, 1150, 0.5, 3, T, true) }), { z: lerp(1.3, 1.0, ease(p)), cx: lerp(340, 380, p), cy: lerp(860, 760, p) }, enter(lt, comment - 0.1));
      if (lt > D - 1.0) { ctx.fillStyle = `rgba(0,0,0,${prog(lt, D - 1.0, D) * 0.5})`; ctx.fillRect(0, 0, W, H); }
    }
  },
];

// ---------- overlays & captions ----------
const C0 = i => CL[i].start;
const OVERLAYS = [
  { a: 0.3, b: 2.8, txt: 'DAY 1', size: 130, y: 240 },
  { a: C0(3) + 0.1, b: C0(3) + wt(3, 'out') + 2.5, txt: 'RULE 1: SHELTER BEFORE DARK', size: 54, y: 200 },
  { a: C0(6) + wt(6, 'comment') - 0.1, b: TM.total + 1, txt: 'COMMENT A OR B', size: 84, y: 230 },
  { a: C0(6) + wt(6, 'day') - 0.2, b: TM.total + 1, txt: 'DAY 2 DECIDES...', size: 54, y: 320, fill: '#ffffff' },
];
const CAPS = [];
for (const c of CL) {
  let cur = [];
  const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach((w, i) => {
    if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.28)) flush();
    cur.push(w);
  });
  flush();
}
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.5) : c.b + 0.6; });
const fix = s => s.replace(/\bJake\b look/, 'Jake... look').replace(/^Rule 1/, 'Rule 1:');

window.DURATION = TM.total;
window.renderFrame = function (ctx, T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, W, H);
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start;
  ctx.save(); CLIPS[ci](ctx, lt, T, CL[ci].dur); ctx.restore();
  const vg = ctx.createRadialGradient(360, 640, 400, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const o of OVERLAYS) if (T >= o.a && T < o.b) {
    const a = Math.min(clamp((T - o.a) / 0.2), clamp((o.b - T) / 0.2)); const pop = 1 + 0.25 * (1 - ease(clamp((T - o.a) / 0.25)));
    ctx.save(); ctx.translate(360, o.y); ctx.scale(pop, pop); comicText(ctx, o.txt, 0, 0, o.size, o.fill || '#f0a94a', a, -0.03); ctx.restore();
  }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) caption(ctx, fix(cap.txt), 1);
  if (T < 0.3) { ctx.fillStyle = `rgba(0,0,0,${1 - T / 0.3})`; ctx.fillRect(0, 0, W, H); }
};
window.SFX_TIMES = { fail: C0(1) + wt(1, 'failed'), slam: C0(1) + wt(1, 'slammed'), sits: C0(5) + wt(5, 'sits'), light: C0(5) + wt(5, 'jake') + 0.6, night: C0(4) + wt(4, 'pile'), optA: C0(6), comment: C0(6) + wt(6, 'comment') };
})();
