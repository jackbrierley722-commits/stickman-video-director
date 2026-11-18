# Upbeat explainer bed + SFX for the AI image video; narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(77)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N); mus = np.zeros(N)
def add(at, y, buf=None):
    b = out if buf is None else buf; i = int(at * SR)
    if 0 <= i < N: b[i:i + len(y)] += y[:N - i]
def env(n, d=8): x = np.arange(n) / SR; e = np.exp(-x * d); a = max(1, int(0.003 * SR)); e[:a] *= np.linspace(0, 1, a); return e
def tone(at, dur, f, amp, d=6, sq=False): m = int(dur * SR); x = np.arange(m) / SR; w = np.sign(np.sin(2 * np.pi * f * x)) if sq else np.sin(2 * np.pi * f * x); add(at, amp * w * env(m, d))
bpm = 120; beat = 0.5; nb = int(D / beat) + 1
chords = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]]
for b in range(nb):
    at = b * beat; ch = chords[(b // 8) % 4]
    if b % 2 == 0: x = np.arange(int(0.2 * SR)) / SR; add(at, 0.4 * np.sin(2 * np.pi * (48 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.12 * SR); add(at, 0.12 * ma(rng.normal(0, 1, m), 2) * env(m, 25), mus)
    m = int(0.03 * SR); hn = rng.normal(0, 1, m); add(at + beat / 2, 0.04 * (hn - ma(hn, 3)) * env(m, 80), mus)
    for q in range(2): f = ch[(b * 2 + q) % 3] * 2; m = int(beat / 2 * SR); x = np.arange(m) / SR; add(at + q * beat / 2, 0.03 * np.sign(np.sin(2 * np.pi * f * x)) * env(m, 12), mus)
    m = int(beat * SR); x = np.arange(m) / SR; add(at, 0.08 * np.sin(2 * np.pi * ch[0] / 2 * x) * env(m, 3), mus)
out += mus * np.interp(t, [0, 0.3, D - 1.5, D], [0, 0.8, 0.8, 0])
def ev(ci, w, n=0): return wt(ci, w, n)
# scribble + sad trombone-ish
for s in np.arange(0.4, ev(0, 'draw', 1), 0.07): m = int(0.05 * SR); add(s, 0.03 * ma(rng.normal(0, 1, m), 1) * env(m, 40))
for i, f in enumerate([392, 370, 349, 311]): tone(ev(0, 'draw', 1) + i * 0.22, 0.3, f, 0.06, 4, True)
# photos whooshing into the computer
for i in range(16): s = ev(1, 'computer') + i * 0.22 + 1.2; m = int(0.15 * SR); add(s, 0.05 * ma(rng.normal(0, 1, m), 8) * np.hanning(m)); tone(s + 0.1, 0.06, 1500 + (i % 4) * 200, 0.03, 30)
# data blips for numbers
for i in range(14): tone(ev(2, 'numbers') + i * 0.09, 0.05, 900 + (i * 137) % 600, 0.04, 40, True)
# noise hiss rising while noise is added, then falling while removed
m = int(2.0 * SR); x = np.arange(m) / SR; add(ev(3, 'adds'), 0.08 * rng.normal(0, 1, m) * (x / x[-1]))
m = int(1.6 * SR); x = np.arange(m) / SR; add(ev(3, 'practises'), 0.06 * rng.normal(0, 1, m) * (1 - x / x[-1]))
# static for generation start, fading as steps go
g0 = ev(4, 'random') - 0.3; g1 = ev(6, 'brand'); m = int((g1 - g0) * SR); x = np.arange(m) / SR; add(g0, 0.07 * rng.normal(0, 1, m) * np.interp(x, [0, ev(5, 'guide') - g0, g1 - g0], [1, 1, 0]))
# typing
for i in range(14): add(ev(5, 'your') + i * 0.085, 0.08 * rng.normal(0, 1, int(0.02 * SR)) * env(int(0.02 * SR), 80))
# step ticks
for k in range(30): tone(ev(5, 'guide') + k * (g1 - ev(5, 'guide')) / 30, 0.03, 1200 + k * 20, 0.025, 60)
# reveal chord for the finished picture
for f in [523, 659, 784, 1047]: tone(g1, 1.5, f, 0.06, 2)
out *= np.interp(t, [0, 0.1, D - 0.7, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
