# Gas station Night 2: freezer hum, knocking from inside, frost, pump buzz, scrape, coins, heartbeat
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(77)
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
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07): m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
E = dict(paid=wt(0, 'paid'), for0=wt(0, 'for'), n2=S0[1], inside1=wt(1, "he's", 1), recap=S0[2], kept=wt(2, 'and'), rule3=wt(2, 'rule'), thought=wt(2, 'you', 2), like=S0[3], t158=S0[4], lockN=wt(4, 'you'), frost=wt(4, 'the', 1),
         t241=S0[5], pump=wt(5, 'pump'), nobody=wt(5, "nobody's"), knock=wt(5, 'then'), inside5=wt(5, 'from'), scrape=S0[6], never=wt(6, 'never'), paid2=S0[7], optA=S0[8], optB=wt(8, 'option', 1), comment=wt(8, 'comment'), follow=wt(8, 'follow'))
# beds: crickets outside, fluorescent hum, freezer compressor drone, low drone that thickens
out += np.sin(2 * np.pi * 4400 * t) * (np.sin(2 * np.pi * 17 * t) > 0.55) * (np.sin(2 * np.pi * 0.6 * t) > -0.2) * 0.005
out += np.sign(np.sin(2 * np.pi * 120 * t)) * 0.004 + ma(rng.normal(0, 1, N), 30) * 0.01 + np.sin(2 * np.pi * 58 * t) * 0.012 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * t))
lvl = np.interp(t, [0, E['n2'], E['n2'] + 0.5, E['t241'], E['knock'], E['scrape'], E['never'], E['paid2'], E['optA'], D], [1.2, 1.2, 0.6, 0.9, 1.3, 1.0, 1.4, 1.4, 0.9, 1.2])
out += (0.05 * np.sin(2 * np.pi * 41 * t) + 0.03 * np.sin(2 * np.pi * 61.5 * t + np.sin(2 * np.pi * 0.1 * t)) + 0.012 * np.sin(2 * np.pi * 123 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)) * lvl
def knocks(at, n=3, amp=0.6, gap=0.26):  # muffled knocking on a steel freezer door
    for k in range(n): thump(at + k * gap, amp, 120, 22); add(at + k * gap, ma(nz(0.12, 1), 12) * env(int(0.12 * SR), 0.001, 30) * 0.08 * amp)
for s_ in np.arange(0.0, E['n2'] - 0.3, 1.1): knocks(s_, 3, 0.55)  # hook: knocking from frame 1
for s_ in np.arange(E['knock'] + 0.2, E['scrape'] - 0.2, 1.1): knocks(s_, 3, 0.6)
for s_ in np.arange(E['paid2'], E['optA'] - 0.2, 1.1): knocks(s_, 3, 0.6)
for s_ in np.arange(E['comment'], D - 0.3, 1.1): knocks(s_, 3, 0.45)
sting(E['inside1'], 65, 0.1); thump(E['inside1'], 0.6, 40, 8)
for k in range(9): tone(E['recap'] + 0.6 + k * 0.08 + rng.random() * 0.03, 0.2, 2600 + rng.random() * 2000, 0.02, 20)  # coins clink
creak(E['kept'] + 0.1, 0.8, 260, 0.04)  # ice chest lid
for d_ in (0, 0.7): tone(E['rule3'] + d_ + 0.15, 0.12, 1800, 0.03, 30)  # two ticks
sting(E['thought'], 58, 0.09)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
tone(E['t158'], 0.6, 880, 0.03, 4); thump(E['lockN'] + 0.4, 0.6, 140, 30); tone(E['lockN'] + 0.4, 0.08, 1800, 0.05, 50)
m = int(1.0 * SR); add(E['frost'] + 0.6, (nz(1.0, 1) - nz(1.0, 3)) * np.hanning(m) * 0.03)  # frost crackle
for k in range(10): tone(E['frost'] + 0.6 + rng.random() * 0.9, 0.03, 5000 + rng.random() * 3000, 0.012, 80)
tone(E['t241'], 0.6, 880, 0.03, 4)
m = int(1.0 * SR); x = np.arange(m) / SR; add(E['pump'], np.sign(np.sin(2 * np.pi * 120 * x)) * (np.sin(2 * np.pi * 14 * x) > 0) * 0.03)  # pump 4 buzz
sting(E['inside5'], 62, 0.1)
for k in range(5): m = int(0.22 * SR); add(E['scrape'] + 0.2 + k * 0.24, (nz(0.22) - nz(0.22, 3)) * np.hanning(m) * 0.07)  # scraping the scratches
sting(E['never'], 52, 0.12); thump(E['never'], 0.8, 36, 6)
for k in range(4): thump(E['never'] + 1.0 + k * 0.7, 0.45, 48); thump(E['never'] + 1.25 + k * 0.7, 0.28, 45)  # heartbeat
creak(E['optA'] + 0.3, 1.2, 120, 0.06); m = int(2.0 * SR); add(E['optA'] + 0.6, nz(2.0, 6) * np.hanning(m) * 0.05)  # door + cold air hiss
for k in range(7): tone(E['optB'] + 0.4 + k * 0.2, 0.08, 2400 + k * 120, 0.025, 40); add(E['optB'] + 0.4 + k * 0.2, nz(0.15, 2) * env(int(0.15 * SR), 0.002, 20) * 0.02)  # coins sliding
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
