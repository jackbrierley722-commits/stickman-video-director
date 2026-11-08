# Day 4 soundtrack: rain to dawn, scratching and thuds, dawn birds, pouring water, car alarm, phone buzz; narrator on top
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
stuck = wt(0, 'stuck'); nine = wt(2, 'nine'); txtT = wt(2, 'her'); noon = wt(3, 'noon'); pack = wt(4, 'packs'); choc = wt(4, 'chocolate'); slide = wt(5, 'slides'); opens = wt(5, 'opens'); corr = wt(5, 'corridor'); up = wt(6, 'two'); chain = wt(6, 'chained'); below = wt(7, 'below'); heli = wt(7, 'above'); optA = CL[8]['start']; optB = wt(8, 'option', 1)
out += ma(rng.normal(0, 1, N), 40) * 0.03
beat = 0.75
lvl = np.interp(t, [0, 0.3, chain - 0.2, chain, below, below + 0.5, D - 1, D], [0, 1, 1, 0.3, 0.3, 1.1, 1.1, 0])
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvl
for i_, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.8, [174.6, 164.8, 155.6, 164.8][i_ % 4], 0.045, 1.1)
# soft music-box motif for Mia (hook + text)
for k_, f in enumerate([784, 659, 587, 523, 587, 659]): tone(0.3 + k_ * 0.45, 0.6, f, 0.05, 3); tone(txtT + k_ * 0.4, 0.6, f, 0.04, 3)
# phone buzz on her message
for k in range(2):
    m = int(0.3 * SR); x = np.arange(m) / SR; add(0.1 + k * 0.6, 0.1 * np.sign(np.sin(2 * np.pi * 150 * x)) * np.hanning(m))
# low battery beeps
for k in range(3): tone(nine + k * 0.35, 0.12, 1200, 0.06, 12, )
# clock ticks under the countdown
for s_ in np.arange(noon - 0.5, CL[4]['start'], 0.5): tone(s_, 0.03, 2500, 0.04, 80)
# packing zips + clinks
m = int(0.6 * SR); x = np.arange(m) / SR; add(pack + 2.0, 0.08 * np.sign(np.sin(2 * np.pi * (300 + 900 * x) * x)) * np.hanning(m))
for i_ in range(3): tone(pack + 0.8 + i_ * 0.3, 0.15, 1600 + i_ * 200, 0.04, 20)
# bookcase scrape + door creak
m = int(1.0 * SR); x = np.arange(m) / SR; add(slide, 0.14 * ma(np.sign(np.sin(2 * np.pi * np.cumsum(120 + 40 * np.sin(x * 18)) / SR)) + 0.5 * rng.normal(0, 1, m), 10) * np.hanning(m))
m = int(0.9 * SR); x = np.arange(m) / SR; add(opens, 0.1 * ma(np.sign(np.sin(2 * np.pi * np.cumsum(200 + 90 * np.sin(x * 6)) / SR)), 6) * np.hanning(m))
# corridor: buzzing emergency light hum
out += 0.02 * np.sign(np.sin(2 * np.pi * 100 * t)) * (t > corr - 0.3) * (t < up)
# echoing footsteps up the stairs
for s_ in np.arange(up, chain - 0.2, 0.32):
    for d_, a_ in [(0, 0.15), (0.15, 0.07), (0.3, 0.03)]: burst(s_ + d_, 0.07, a_, 2, 40)
# chain rattle
for i_ in range(6): tone(chain + i_ * 0.06, 0.08, 2200 + (i_ * 330) % 900, 0.06, 30, )
# dragging below + groan
m = int(3.0 * SR); x = np.arange(m) / SR; add(below - 0.2, 0.1 * ma(rng.normal(0, 1, m), 30) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 0.8 * x))) * np.minimum(1, x))
groan(below + 0.6, 2.0, 0.15, 70)
# helicopter getting louder from 'above' to the end
m = int((D - heli) * SR); x = np.arange(m) / SR; add(heli - 0.3, 0.16 * ma(rng.normal(0, 1, m), 30) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 10 * x))) * np.minimum(1, x / 1.5))
hb = below
while hb < D - 0.6: thump(hb, 0.28); thump(hb + 0.27, 0.18); hb += 0.75
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
