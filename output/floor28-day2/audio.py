# Day 2 soundtrack: rain to dawn, scratching and thuds, dawn birds, pouring water, car alarm, phone buzz; narrator on top
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
stop = wt(2, 'stops'); lit = wt(3, 'litres'); meals = wt(3, 'meals'); down = wt(4, 'down'); msg = wt(5, 'lights'); how = wt(5, 'how')
out += ma(rng.normal(0, 1, N), 3) * 0.035 + ma(rng.normal(0, 1, N), 40) * 0.05
# rain fades out at dawn
out *= np.interp(t, [0, stop, stop + 4, D], [1, 1, 0.35, 0.35])
# thunder only at night
def mulberry_bolts():
    s = 31; vals = []
    for _ in range(12):
        s = (s * 1664525 + 1013904223) % 4294967296; vals.append(s / 4294967296 * D)
    return vals
for b in mulberry_bolts():
    if b < stop: burst(b + 0.4, 2.5, 0.35, 120, 1.4); thump(b + 0.4, 0.4, 35)
beat = 0.8
lvl = np.interp(t, [0, 0.4, stop - 0.2, stop, stop + 2.5, D - 1, D], [0, 1, 1, 0.1, 0.9, 0.9, 0])
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvl
for i_, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.8, [174.6, 164.8, 155.6, 164.8][i_ % 4], 0.04, 1.1)
# scratching until it stops, thuds on the bookcase
for s_ in np.arange(0.2, stop, 0.09):
    if (s_ * 1.7) % 2 < 1.3: burst(s_, 0.06, 0.06 * rng.uniform(0.4, 1), 1, 50)
for s_ in np.arange(wt(1, 'every'), wt(1, "don't"), 0.6): thump(s_, 0.6, 60); burst(s_, 0.3, 0.2, 8, 12)
hb = 0.3
while hb < stop: thump(hb, 0.25); thump(hb + 0.27, 0.16); hb += 0.85
# dawn birds
for k in range(6): tone(stop + 1.5 + k * 0.7, 0.15, 2600 + 300 * np.sin(k), 0.03, 12); tone(stop + 1.6 + k * 0.7, 0.12, 3100, 0.025, 14)
# pour water + tin + noodle
m = int(1.1 * SR); add(lit + 0.1, 0.07 * ma(rng.normal(0, 1, m), 6) * np.hanning(m)); thump(meals + 0.3, 0.1, 400); thump(meals + 0.5, 0.1, 300)
# car alarm from far below
m = int((CL[5]['start'] - down + 1) * SR); x = np.arange(m) / SR; add(down, 0.035 * np.sign(np.sin(2 * np.pi * (900 + 300 * (np.sin(2 * np.pi * 2 * x) > 0)) * x)) * np.minimum(1, x * 3))
groan_t = down + 1.0
for k in range(3): groan(groan_t + k * 0.7, 1.6, 0.06, 75 + k * 5)
# phone buzz bursts
for k in range(6):
    m = int(0.35 * SR); x = np.arange(m) / SR; add(msg + k * 1.1, 0.12 * np.sign(np.sin(2 * np.pi * 150 * x)) * np.hanning(m))
thump(how, 0.5, 50)
hb = how
while hb < D - 0.6: thump(hb, 0.28); thump(hb + 0.27, 0.18); hb += 0.85
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
