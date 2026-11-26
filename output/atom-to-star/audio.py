# Atom to the biggest star: music only, building with scale. Big hits on the space reveals, subtle ticks elsewhere.
import json, numpy as np, soundfile as sf
SR = 44100
SEGS = [["HYDROGEN ATOM",0],["DNA",2.55],["VIRUS",4.8],["RED BLOOD CELL",7.05],["HUMAN HAIR",9.3],["GRAIN OF SAND",11.45],["ANT",13.6],["HUMAN",15.75],["BLUE WHALE",18],["EIFFEL TOWER",20.25],["MOUNT EVEREST",22.5],["THE MOON",24.95],["EARTH",27.3],["JUPITER",29.85],["THE SUN",32.3],["RIGEL",35.05],["BETELGEUSE",37.6],["STEPHENSON",40.45]]
D = 46.45; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(3)
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(at, m, amp, d=6):
    n = int(1.0 * SR); x = np.arange(n) / SR; f = hz(m); add(at, (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 2 * f * x) + 0.1 * np.sin(2 * np.pi * 3 * f * x)) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.4 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.35 * x)) * np.exp(-x * d))
def boom(at, amp=0.9):
    thump(at, amp, 38, 5); n = int(2.5 * SR); add(at, ma(rng.normal(0, 1, n), 40) * env(n, 0.002, 1.6) * amp * 0.4)
def tick(at, amp=0.04):
    n = int(0.12 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * 2400 * x) * env(n, 0.001, 40) * amp)
starts = [s for _, s in SEGS]
ints = np.interp(t, [0, 22.5, 24.9, 40.4, D], [0.3, 0.6, 0.85, 1.0, 1.0])
# chords: one bar per object (each ~2.25 s), Am - F - C - G, lifting a tone in space
prog = [(57, 60, 64), (53, 57, 60), (48, 55, 64), (55, 59, 62)]
for i, s0 in enumerate(starts):
    s1 = starts[i + 1] if i + 1 < len(starts) else D; ch = prog[i % 4]; up = 2 if i >= 11 else 0; dur = s1 - s0
    n = int(dur * SR); x = np.arange(n) / SR; e = np.minimum(1, np.minimum(x / 0.25, (dur - x) / 0.25 + 1e-6))
    pad = sum(np.sin(2 * np.pi * hz(m + up) * x) + 0.4 * np.sin(2 * np.pi * hz(m + up) * 1.003 * x) for m in ch) * e
    add(s0, pad, 0.012 + 0.012 * (i / 17))
    add(s0, np.sin(2 * np.pi * hz(ch[0] + up - 24) * x) * e, 0.05 * float(i >= 7))  # bass from the human onwards
    step = dur / 8
    for k in range(8): pluck(s0 + k * step, [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[0] + 12, ch[2]][k] + up + 12, 0.018 + 0.014 * (i / 17), 7)
    if i >= 11:  # beat in space
        for k in range(4): thump(s0 + k * dur / 4, 0.35, 55, 22)
# subtle tick as each name lands (not a whoosh on every cut)
for s0 in starts[1:]: tick(s0 + 0.95 - 0.05, 0.035)
# big moments: entering space, Earth, the Sun, Betelgeuse, the biggest star
m = int(1.6 * SR); xx = np.linspace(0, 1, m); add(24.95 - 0.2, ma(rng.normal(0, 1, m), 3) * np.sin(np.pi * xx) ** 2 * 0.08)  # whoosh into space
for s0, a in [(27.3, 0.5), (32.3, 0.7), (37.6, 0.8), (40.45, 1.0)]: boom(s0 + 0.95, a)
m = int(2.0 * SR); x = np.arange(m) / SR; add(40.45 - 1.0, np.sin(2 * np.pi * np.cumsum(np.linspace(60, 220, m)) / SR) * np.linspace(0, 1, m) ** 2 * 0.06)  # riser into the final star
# outro: the like-pop for the comment / follow card, then a soft chime that loops back to the atom
n = int(0.12 * SR); xx = np.arange(n) / SR; add(43.85, np.sin(2 * np.pi * 1400 * xx) * env(n, 0.001, 30) * 0.06); add(43.91, np.sin(2 * np.pi * 2100 * xx) * env(n, 0.001, 30) * 0.04)
for k, m_ in enumerate([76, 81, 88]): pluck(D - 0.6 + k * 0.06, m_, 0.03, 5)
out *= ints * 1.6
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
mix = np.tanh(out * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', D)
