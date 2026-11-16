
function label(T, t0, top, sub, col = '#ffd34a', y = 180) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '30px Russo'; const w = Math.max(octx.measureText(top).width, 160) + 60; pill(360 - w / 2, y, w, 60, col); txt(top, 360, y + 32, 30, '#111'); if (sub) txt(sub, 360, y + 88, 26, '#fff'); octx.restore(); }
function callout(T, t0, s_, x, y, col = '#ffd34a') { const k = ease(prog(T, t0 - 0.05, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; pill(x - w / 2, y - 26, w, 52, 'rgba(10,12,28,0.88)', col); txt(s_, x, y + 1, 28, col); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { big('YOU vs YOUR BRO', 230, 54, '#fff', 1); big('THE RACE TO SCHOOL', 300, 44, '#ffd34a', 1); }
  else if (ci === 1) { label(T, E.c1, '1817 . THE RUNNING MACHINE', 'NO PEDALS'); if (T > E.shit - 0.1) big('THE LITTLE S**T', 400, 58, '#ff6b6b', fi(E.shit)); }
  else if (ci === 2) { label(T, E.c2, '1860s . PEDALS ON THE FRONT', ''); if (T > E.bone - 0.1) big('REAL NICKNAME . THE BONESHAKER', 330, 38, '#fff', fi(E.bone)); }
  else if (ci === 3) { label(T, E.c3, '1870s . THE PENNY FARTHING', 'BIGGER WHEEL = FURTHER PER PEDAL'); if (T > E.genius - 0.1 && T < E.pebble - 0.1) big('GENIUS.', 400, 80, '#5ad88a', fi(E.genius)); if (T > E.pebble - 0.1 && T < E.over) callout(T, E.pebble, 'ONE PEBBLE', 470, 860, '#ff6b6b'); if (T > E.over) big('HEADFIRST', 400, 80, '#ff6b6b', fi(E.over)); }
  else if (ci === 4) { label(T, E.c4, '1885 . THE SAFETY BICYCLE', '', '#5ad88a'); callout(T, E.c4 + 0.2, 'PEDALS IN THE MIDDLE', 360, 960, '#ffd34a'); callout(T, E.chain, 'CHAIN TO THE BACK WHEEL', 360, 1030, '#7fe8ff'); callout(T, E.same, 'SAME SIZE WHEELS', 360, 900, '#ffb6e1'); }
  else if (ci === 5) { if (T < E.air - 0.1) big('*RATTLE RATTLE*', 330, 58, '#fff', fi(E.c5)); else label(T, E.air, '1888 . AIR TYRES', 'SMOOTH', '#7fe8ff'); }
  else if (ci === 6 && !loop) { if (T > E.bus - 0.1) big('HE TAKES THE BUS', 300, 58, '#ffd34a', fi(E.bus)); else big('EVERY. SINGLE. DAY.', 300, 54, '#fff', fi(E.c6)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && !(ci === 4 && T > E.c4)) captionHL(cap); };
})();
