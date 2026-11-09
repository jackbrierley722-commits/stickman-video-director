# Day 5 soundtrack: chain clang + echo, running infected, helicopter, extinguisher hiss, fists on the door; narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(31)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y):
    i = int(at * SR)
    if 0 <= i < N: out[i:i + len(y)] += y[:N - i]
def burst(at, dur, amp, k=8, decay=8):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, ma(rng.normal(0, 1, n), k) * amp * np.exp(-x * decay))
def thump(at, amp=0.5, f=48):
    n = int(0.3 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 20))
def tone(at, dur, f, amp, decay=4):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x) * np.exp(-x * decay))
def groan(at, dur=1.8, amp=0.15, f0=90):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + 8 * np.sin(2 * np.pi * 5 * x) - 12 * x; g = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + 0.3 * rng.normal(0, 1, n); add(at, amp * ma(g, 22) * np.hanning(n))
def metal(at, amp=0.5, base=520):
    n = int(1.6 * SR); x = np.arange(n) / SR; y = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, d in [(base, 3), (base * 2.76, 5), (base * 5.4, 8), (base * 8.9, 12)])
    add(at, amp * 0.4 * y); burst(at, 0.08, amp * 0.8, 1, 30); thump(at, amp, 55)
def echo(at, amp, n=6):
    for k in range(n): metal(at + 0.28 * (k + 1), amp * 0.5 ** (k + 1), 520 * (0.97 ** k))
def heliN(t0, t1, amp):
    m = int((t1 - t0) * SR); x = np.arange(m) / SR; return m
grabs = wt(2, 'grabs'); heli = wt(2, 'helicopter'); one = wt(2, 'one'); two = wt(2, 'two'); three = wt(2, 'three'); clang = wt(3, 'clang'); echoes = wt(3, 'echoes')
snaps = wt(4, 'snaps'); below = wt(5, 'below'); running = wt(5, 'running'); bursts = wt(6, 'bursts'); away = wt(6, 'turning'); pin = wt(7, 'pin'); sprays = wt(7, 'sprays'); sees = wt(7, 'sees')
jams = wt(8, 'jams'); fists = wt(8, 'fists'); lands = wt(9, 'lands'); dies = wt(9, 'dies'); comment = wt(10, 'comment'); hit2 = snaps - 0.25
out += ma(rng.normal(0, 1, N), 40) * 0.025
beat = 0.6
lvl = np.interp(t, [0, 0.3, clang - 0.1, clang, clang + 2, below, below + 0.5, bursts, bursts + 0.3, sees, sees + 1, D - 1, D], [0, 0.8, 0.9, 0.2, 0.6, 0.7, 1.2, 1.2, 0.7, 0.8, 1.1, 1.1, 0])
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvl
for i_, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.4, [174.6, 164.8, 155.6, 185.0][i_ % 4], 0.045, 1.2)
# hook: chain rattle + held breath
for i_ in range(8): tone(0.5 + i_ * 0.07, 0.08, 2200 + (i_ * 330) % 900, 0.05, 30)
# helicopter: muffled indoors (clips 0-5), loud on the roof, fades away then returns
hl = np.interp(t, [0, heli, heli + 0.5, bursts, bursts + 0.2, away, away + 4, sees, sees + 1.5, lands, lands + 1, D], [0.25, 0.3, 0.55, 0.45, 1.3, 1.3, 0.35, 0.3, 0.8, 1.5, 1.2, 1.0])
blade = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9.5 * t)); out += 0.12 * ma(rng.normal(0, 1, N), 30) * blade * hl
# grab extinguisher off the wall
tone(grabs + 0.3, 0.1, 900, 0.08, 25); thump(grabs + 0.35, 0.2, 90)
# count: heartbeat thumps on 1, 2, 3
for c in (one, two, three): thump(c, 0.5, 45)
# swing whooshes + CLANG + echo down 28 floors
for h in (clang, hit2): burst(h - 0.22, 0.22, 0.25, 6, 4)
metal(clang, 0.7); echo(clang, 0.7, 8)
# second hit + snap + chain falls
metal(hit2, 0.6, 600); burst(snaps, 0.1, 0.4, 1, 40)
for i_ in range(10): tone(snaps + 0.3 + i_ * 0.05, 0.1, 1800 + (i_ * 410) % 1200, 0.06, 25)
thump(snaps + 0.8, 0.25, 120)
# footsteps turn into running + groans
for s_ in np.arange(below, running, 0.5): burst(s_, 0.06, 0.12, 2, 40)
for s_ in np.arange(running, bursts, 0.11): burst(s_ + rng.uniform(0, 0.05), 0.05, 0.13 + 0.05 * rng.random(), 2, 45)
for g_ in range(5): groan(running + g_ * 0.55, 1.4, 0.1, 60 + g_ * 9)
# doors burst open
thump(bursts, 0.6, 70); burst(bursts, 0.25, 0.3, 4, 10)
# wind on the roof
out += 0.03 * ma(rng.normal(0, 1, N), 120) * (t > bursts)
# pin pull + spray hiss
tone(pin, 0.08, 2600, 0.08, 30)
m = int(4.0 * SR); x = np.arange(m) / SR; hs = rng.normal(0, 1, m); add(sprays, 0.16 * (hs - ma(hs, 4)) * np.interp(x, [0, 0.1, 3.4, 4.0], [0, 1, 0.8, 0]))
# extinguisher jammed: metal clunk
metal(jams + 0.1, 0.3, 800)
# fists on the door from 'fists' to the end, with groans
for k_, s_ in enumerate(np.arange(fists, D - 0.5, 0.28)):
    thump(s_ + rng.uniform(0, 0.08), 0.35 + 0.15 * rng.random(), 60 + rng.uniform(-10, 10)); burst(s_, 0.05, 0.08, 3, 40)
    if k_ % 7 == 0: groan(s_, 1.3, 0.08, 65 + k_ % 3 * 10)
# phone dies: descending tones
for i_, f in enumerate([880, 660, 440]): tone(dies + 0.15 + i_ * 0.14, 0.15, f, 0.08, 10)
# rising hit on 'Comment'
m = int(1.0 * SR); x = np.arange(m) / SR; add(comment - 0.6, 0.12 * ma(rng.normal(0, 1, m), 8) * (x / x[-1]) ** 2); metal(comment + 0.4, 0.25, 260)
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
