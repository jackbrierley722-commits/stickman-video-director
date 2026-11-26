
function failStamp(T, t0, n) { const k = prog(T, t0 - 0.05, t0 + 0.15); if (k <= 0) return; octx.save(); const sc = 1 + (1 - k) * 1.2; octx.globalAlpha = Math.min(1, k * 1.2); octx.translate(360, 560); octx.rotate(-0.12); octx.scale(sc, sc);
  octx.strokeStyle = '#ff2b3a'; octx.lineWidth = 10; octx.strokeRect(-210, -62, 420, 124); octx.font = '86px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#ff2b3a'; octx.fillText('FAILED', 0, 6); octx.restore();
  octx.save(); octx.globalAlpha = k; pill(230, 650, 260, 56, 'rgba(10,10,20,0.85)', '#ff2b3a'); txt('FAILS . ' + n + '/4', 360, 680, 30, '#ffffff'); octx.restore(); }
function attempt(T, t0, n, what) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; pill(205, 150, 310, 60, '#ffd34a'); txt('ATTEMPT ' + n, 360, 182, 34, '#111'); big(what, 330, 56, '#ffffff', k); octx.restore(); }
function postCard(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.3)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = lerp(260, 200, k); octx.fillStyle = 'rgba(250,250,252,0.97)'; octx.beginPath(); octx.roundRect(90, y, 540, 420, 26); octx.fill();
  octx.fillStyle = '#ff7a00'; octx.beginPath(); octx.arc(140, y + 50, 26, 0, 7); octx.fill(); txt('B', 140, y + 52, 26, '#fff'); txt('builder_bob', 180, y + 40, 26, '#111', 'left'); txt('Fresh driveway. 10/10 work', 180, y + 72, 22, '#555', 'left');
  octx.fillStyle = '#b8b8b8'; octx.fillRect(110, y + 100, 500, 230); octx.fillStyle = '#9a9a9a'; for (let i = 0; i < 6; i++) octx.fillRect(110, y + 100 + i * 40, 500, 2);
  const hx = 420, hy = y + 250; octx.fillStyle = '#e0a878'; octx.fillRect(hx, hy - 50, 30, 50); for (let i = 0; i < 4; i++) octx.fillRect(hx + i * 8, hy - 72, 6, 24); octx.strokeStyle = '#ff2b3a'; octx.lineWidth = 5; octx.beginPath(); octx.arc(hx + 15, hy - 40, 52, 0, 7); octx.stroke();
  txt('POLICE: we need to talk', 110, y + 375, 24, '#1d3f8a', 'left'); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  if (curMood === 'night' && SIRENS.length && ci >= 6 && !loop) { const ph = Math.floor(T * 6) % 2; octx.fillStyle = ph ? 'rgba(255,30,50,0.06)' : 'rgba(40,80,255,0.06)'; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { if (T < E.hide - 0.1 || loop) { big('SO YOU KILLED SOMEONE...', 200, 46, '#fff', 1); big('HOW TO HIDE THE BODY', 270, 54, '#ffd34a', 1); failStamp(loop ? 1 : T + 1, 0, 1); } else { big('HOW TO HIDE THE BODY', 270, 54, '#ffd34a', 1); txt('(A COMEDY OF FAILURES)', 360, 240, 26, '#fff'); } }
  else if (ci === 1) { if (T < E.dog - 0.1) attempt(T, E.a1, 1, 'THE BACKYARD'); else failStamp(T, E.dog + 0.3, 1); }
  else if (ci === 2) { if (T < E.fisher - 0.1) attempt(T, E.a2, 2, 'THE LAKE'); else { big('BIGGEST CATCH EVER', 300, 52, '#fff', fi(E.fisher)); failStamp(T, E.fisher + 1.6, 2); } }
  else if (ci === 3) { if (T < E.power - 0.1) attempt(T, E.a3, 3, 'THE FREEZER'); else if (T < E.smell - 0.1) big('POWER CUT', 330, 70, '#7dff5a', fi(E.power)); else failStamp(T, E.smell + 0.6, 3); }
  else if (ci === 4) { likePill(T, E.like, E.dumb + 1.5, E.like + 0.6); if (T > E.comment - 0.1) { big('COMMENT A, B OR C', 240, 54, '#ffd34a', fi(E.comment)); const L = [['A', 'BACKYARD'], ['B', 'LAKE'], ['C', 'FREEZER']]; L.forEach(([a, b], i) => { const k = prog(T, E.comment + 0.2 + i * 0.2, E.comment + 0.4 + i * 0.2); if (k <= 0) return; octx.save(); octx.globalAlpha = k; pill(180, 300 + i * 74, 360, 60, 'rgba(10,10,20,0.85)', '#ffd34a'); txt(a + '. ' + b, 360, 332 + i * 74, 32, '#fff'); octx.restore(); }); } }
  else if (ci === 5) { if (T < E.posts - 0.1) attempt(T, E.a4, 4, 'FRESH CONCRETE'); else if (T < E.hand - 0.1) postCard(T, E.posts); else { postCard(T, E.posts); failStamp(T, E.hand + 0.8, 4); } }
  else if (ci === 6) { big('I TRIED EVERYTHING!', 260, 62, '#ff4040', fi(E.rage)); if (T > E.still - 0.1) big('BUT THE POLICE STILL', 345, 46, '#fff', fi(E.still)); if (T > E.fk - 0.1) big('F***ING FIND IT!', 420, 66, '#ffd34a', fi(E.fk)); }
  else if (ci === 7 && !loop) { if (T < E.only - 0.1) { big('CAUGHT.', 280, 86, '#ff2b3a', fi(E.caught)); if (T > E.again - 0.1) big('AGAIN.', 380, 86, '#fff', fi(E.again)); } else { if (T > E.dont - 0.1) big("DON'T DO IT.", 320, 80, '#ffd34a', fi(E.dont)); else big('THE ONLY WAY TO NEVER GET CAUGHT?', 320, 34, '#fff', fi(E.only)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && !(ci === 0 && T < E.hide - 0.1)) captionHL(cap); };
})();
