# Day 3 soundtrack: rain to dawn, scratching and thuds, dawn birds, pouring water, car alarm, phone buzz; narrator on top
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
ign = wt(0, 'ignored'); msg = wt(4, 'another'); knk = wt(5, 'knocks'); drag = wt(5, 'dragging'); peep = wt(5, 'check'); optB = wt(6, 'option', 1)
out += ma(rng.normal(0, 1, N), 3) * 0.02 + ma(rng.normal(0, 1, N), 40) * 0.03   # light rain / room tone
beat = 0.8
lvl = np.interp(t, [0, 0.3, peep, peep + 1, knk - 1.2, knk - 0.6, knk + 1, D - 1, D], [0, 1, 1, 0.5, 0.5, 0.05, 1, 1, 0])
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvl
for i_, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.8, [174.6, 164.8, 155.6, 164.8][i_ % 4], 0.04 * float(np.interp(b, [0, peep, peep + 1, D], [1, 1, 0.3, 0.6])), 1.1)
# hook: phone buzz then stamp
for k in range(3):
    m = int(0.3 * SR); x = np.arange(m) / SR; add(0.2 + k * 0.6, 0.12 * np.sign(np.sin(2 * np.pi * 150 * x)) * np.hanning(m))
thump(ign + 0.05, 0.9, 60); burst(ign + 0.05, 0.2, 0.4, 4, 20)
# phone flipped face down
thump(wt(1, 'phone') + 0.6, 0.25, 220)
# noise rings + zombie groans in the diagram
groan(wt(2, 'brings'), 1.8, 0.1, 80)
# ration clinks
for i_ in range(3): tone(wt(3, 'ten') + 0.3 + i_ * 0.15, 0.2, 1800 + i_ * 200, 0.04, 18)
# second message: harsh buzz
for k in range(4):
    m = int(0.35 * SR); x = np.arange(m) / SR; add(msg + k * 0.7, 0.14 * np.sign(np.sin(2 * np.pi * 140 * x)) * np.hanning(m))
burst(wt(4, 'i') - 0.05, 1.0, 0.5, 30, 3); thump(wt(4, 'i'), 0.7, 42)
# peephole: muffled corridor, dragging sound getting louder
m = int((knk - drag + 0.5) * SR); x = np.arange(m) / SR; add(drag - 0.2, 0.09 * ma(rng.normal(0, 1, m), 30) * (0.4 + 0.6 * (x / x[-1])) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 0.9 * x))))
groan(drag + 1.0, 2.0, 0.12, 70)
# three slow knocks (and repeats in the decision)
for base in [0, 4.2, 8.4]:
    for d_ in [-0.6, -0.05, 0.5]: thump(knk + base + d_, 0.95, 70); burst(knk + base + d_, 0.15, 0.35, 3, 25)
hb = drag
while hb < D - 0.6: thump(hb, 0.28); thump(hb + 0.27, 0.18); hb += 0.85
# roof option: helicopter far away
m = int(3.0 * SR); x = np.arange(m) / SR; add(CL[6]['start'] + 0.3, 0.1 * ma(rng.normal(0, 1, m), 30) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * x))) * np.hanning(m))
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
