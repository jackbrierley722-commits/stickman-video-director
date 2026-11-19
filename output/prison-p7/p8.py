# Prison escape finale v2 (vote B): dog chase, river, home. Builds on p7.py's scene patches.
exec(open('p7.py').read().replace("open('scenes.js', 'w').write(s)\nprint('ok')", ""))
def region(a, b, new):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]
def rep(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)
region("const E = { c1: CL[1].start, drove", "  recap: CL[1].start,", """const E = { c1: CL[1].start, photo: AT(1, 'your') + 0.05, c2: CL[2].start, betrayed: AT(2, 'betrayed'), walked: AT(2, 'walked'), c3: CL[3].start, saw: AT(3, 'saw'), lead: AT(3, 'off'), c4: CL[4].start, barking: AT(4, 'barking'), closer2: AT(4, 'and'), c5: CL[5].start, jump: AT(5, 'jump'), c6: CL[6].start, scent: AT(6, 'scent'), c7: CL[7].start,
  c8: CL[8].start, knock: AT(8, 'knock'), three: AT(8, 'three'), c9: CL[9].start, opens: AT(9, 'opens'), behind: AT(9, 'behind'), girl: AT(9, 'girl'), eyes: AT(9, 'your', 1) + 0.35,
  past: 999, sunrise: 999, note: 999, welcome: 999, seven: 999, one: 999, every: 999, comment: 999, nobody: 999, rb: 999, drove: 999,
  gotin: 999, coffee: 999, says: 999, brother: 999, smiles: 999, waves: 999, photo2: 999, atYou: 999, atDex: 999, train: 999, dexR: 999,
""")
rep("E.loop = TM.total - 0.4;", "E.loop = 999;")
region("const WALK = T =>", "function shot(T)", open('p7_finale.js').read())
rep("build4(); build5();", "build4(); build5(); build6();")
region("function hud(T) {", "function likePill", r"""function hud(T) { const ci = CLI(T); if (ci >= 7) return; octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(24, 36, 270, 64, 32); octx.fill(); octx.strokeStyle = '#ffd27a'; octx.lineWidth = 3; octx.stroke(); txt('ESCAPE . FINALE', 159, 69, 26, '#ffd27a'); octx.restore();
  octx.save(); octx.fillStyle = 'rgba(6,6,10,0.8)'; octx.beginPath(); octx.roundRect(496, 36, 200, 64, 32); octx.fill(); txt('2.47 AM', 596, 69, 32, '#ff3a2a'); octx.restore();
  if ((ci === 3 && T > E.lead) || ci === 4 || ci === 5 || ci === 0) { const dist = ci === 0 ? 2 : ci === 3 ? 20 : ci === 4 ? Math.round(lerp(14, 3, prog(T, E.c4, E.c5))) : 3; octx.save(); octx.fillStyle = Math.floor(T * 4) % 2 ? 'rgba(150,0,0,0.92)' : 'rgba(100,0,0,0.92)'; octx.beginPath(); octx.roundRect(470, 116, 226, 80, 22); octx.fill(); txt('K9 UNIT', 583, 142, 20, '#ffb0a0'); txt(ci === 5 && T > E.jump ? 'LOST YOU?' : 'DOG ' + dist + ' M', 583, 174, 28, '#fff'); octx.restore(); } }
""")
rep("!loop && ![9].includes(si)", "!loop && ![2, 5, 7, 8].includes(si)")
region("  if (!loop && ci < 5 && (ci === 0 || ci >= 2))", "  const cap = CAPS.find", r"""  const under = SECTION(T) === 'riv' && camera.position.y < RIVW[1] - 0.5;
  if (under) { octx.fillStyle = 'rgba(20,80,120,0.3)'; octx.fillRect(0, 0, W, H); octx.save(); octx.globalAlpha = 0.07; for (let i = 0; i < 5; i++) { const x = 120 + i * 130 + 30 * S(T + i); octx.fillStyle = '#9ad8ff'; octx.beginPath(); octx.moveTo(x - 30, 0); octx.lineTo(x + 30, 0); octx.lineTo(x + 90, H); octx.lineTo(x - 10, H); octx.fill(); } octx.restore();
    octx.save(); octx.strokeStyle = 'rgba(220,240,255,0.7)'; octx.lineWidth = 2; R.bubbles.forEach(b => { const ph = (T * 0.25 + b.ph) % 1; octx.beginPath(); octx.arc(b.x * W + 20 * S(T * 3 + b.ph * 9), H - ph * H * 1.1, b.s, 0, PI * 2); octx.stroke(); }); octx.restore(); }
  if (((ci === 3 && T > E.saw - 0.1) || ci === 4 || ci === 5) && !under) { const hb = Math.max(0, S(T * 9)) ** 4; const vg = octx.createRadialGradient(360, 640, 300, 360, 640, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(150,0,0,${0.25 + 0.3 * hb})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  if (ci === 4) { const r_ = rng(Math.floor(T * 3)); if (r_() < 0.45) { octx.save(); octx.strokeStyle = 'rgba(12,24,14,0.85)'; octx.lineCap = 'round'; octx.lineWidth = 26 + r_() * 30; const x0 = r_() * W; octx.beginPath(); octx.moveTo(x0, -20); octx.lineTo(x0 + (r_() - 0.5) * 500, H * (0.4 + r_() * 0.5)); octx.stroke(); octx.restore(); } }
  if (ci === 5 && T > E.jump + 0.42 && T < E.jump + 0.75) { octx.fillStyle = `rgba(235,250,255,${1 - prog(T, E.jump + 0.42, E.jump + 0.75)})`; octx.fillRect(0, 0, W, H); }
  if (ci === 7) { const a = 1 - prog(T, E.c7, E.c7 + 0.4); octx.fillStyle = `rgba(8,50,80,${0.6 * a})`; octx.fillRect(0, 0, W, H); }
  if (ci === 8) { const a = 1 - prog(T, E.c8, E.c8 + 0.8); octx.fillStyle = `rgba(255,236,200,${a})`; octx.fillRect(0, 0, W, H); }
  if (ci === 9) { const a = prog(T, E.eyes, E.eyes + 2.2); const vg = octx.createRadialGradient(360, 640, 200, 360, 640, 820); vg.addColorStop(0, 'rgba(255,220,170,0)'); vg.addColorStop(1, `rgba(255,220,170,${0.35 * a})`); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  hud(T);
  const tag = (s1, s2, col, a) => { octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(6,6,10,0.85)'; octx.beginPath(); octx.roundRect(150, 560, 420, 96, 24); octx.fill(); octx.strokeStyle = col; octx.lineWidth = 3; octx.stroke(); txt(s1, 360, 592, 30, col); txt(s2, 360, 630, 22, '#fff'); octx.restore(); };
  if (ci === 0) big("DON'T BREATHE", 480, 64, '#ff4a4a', 1);
  if (ci === 1) { big('INNOCENT', 480, 70, '#5ad88a', prog(T, AT(1, 'innocent') - 0.1, AT(1, 'innocent') + 0.1)); }
  if (ci === 2) { if (T < E.betrayed - 0.1) tag('DEX', 'YOUR CELLMATE', '#ffad6a', prog(T, AT(2, 'dex') - 0.1, AT(2, 'dex') + 0.1)); else if (T < E.walked - 0.1) big('HE BETRAYED YOU', 480, 50, '#ff4a4a', prog(T, E.betrayed - 0.1, E.betrayed + 0.1)); else big('YOU WALK AWAY', 480, 54, '#fff', prog(T, E.walked - 0.1, E.walked + 0.1)); }
  if (ci === 3 && T < E.saw - 0.1) big('ROADBLOCK', 480, 64, '#ff4a4a', prog(T, AT(3, 'roadblock') - 0.1, AT(3, 'roadblock') + 0.1));
  if (ci === 3 && T > E.saw - 0.1 && T < E.lead - 0.1) big('HE SAW YOU', 480, 64, '#ff4a4a', prog(T, E.saw - 0.1, E.saw + 0.1));
  if (ci === 3 && T > E.lead - 0.1) big('K9 RELEASED', 480, 64, '#ff4a4a', prog(T, E.lead - 0.1, E.lead + 0.1));
  if (ci === 5 && T > E.jump - 0.1 && T < E.jump + 0.45) big('JUMP', 480, 110, '#fff', prog(T, E.jump - 0.1, E.jump + 0.05));
  if (ci === 6 && T > E.scent - 0.1) big('SCENT LOST', 480, 66, '#5ad88a', prog(T, E.scent - 0.1, E.scent + 0.1));
  if (ci === 8 && T > E.three - 0.1) big('3 YEARS', 480, 70, '#ffd27a', prog(T, E.three - 0.1, E.three + 0.1));
  if (ci === 9 && T > E.eyes + 0.6) big('HOME', 150, 80, '#ffd27a', prog(T, E.eyes + 0.6, E.eyes + 1.2));
""")
open('scenes.js', 'w').write(s)
print('ok')
