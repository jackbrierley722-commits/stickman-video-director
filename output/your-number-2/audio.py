# Part 2: drone, small footsteps, phone buzzes, stingers, double laugh, window knocks, choice tick
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(45)
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
def sine(f, dur): x = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * x)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def buzz(at, n=2):
    for k in range(n): m = int(0.35 * SR); x = np.arange(m) / SR; add(at + k * 0.5, np.sign(np.sin(2 * np.pi * 165 * x)) * np.hanning(m) * 0.05)
def pop(at, f=1400): m = int(0.12 * SR); add(at, (sine(f, 0.12) + 0.5 * sine(f * 1.5, 0.12)) * env(m, 0.002, 30) * 0.08)
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
open0 = wt(0, 'open'); small = wt(1, 'small'); w2 = CL[2]['start']; buzz3 = wt(3, 'buzzes'); ask3 = wt(3, 'ask'); lily4 = wt(4, 'lily'); sil = wt(4, 'silence'); w5 = CL[5]['start']; buzz6 = wt(6, 'buzzes'); thats = wt(6, "that's")
real = wt(6, 'the'); rule = wt(7, 'rule'); laugh = wt(8, 'laughing'); andL = wt(8, 'and'); k = [wt(9, 'knock'), wt(9, 'knock', 1), wt(9, 'knock', 2)]; its10 = wt(10, "it's"); never = wt(10, 'i'); opt = CL[11]['start']
lvl = np.interp(t, [0, 0.5, sil - 0.1, sil, w5 + 0.3, real, laugh, laugh + 0.5, k[0] - 0.4, k[0], D - 1, D], [0, 0.8, 0.9, 0.15, 1.1, 0.8, 0.9, 1.2, 0.3, 1.2, 1.2, 0])
out += (0.06 * np.sin(2 * np.pi * 43 * t) + 0.035 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.11 * t)) + 0.018 * np.sin(2 * np.pi * 129 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * t)) * lvl
out += ma(rng.normal(0, 1, N), 50) * 0.035 * lvl
mel = [72, 75, 79, 78, 75, 72, 70, 71]
for i, s_ in enumerate(np.arange(0.6, sil - 0.3, 0.8)):
    f = 440 * 2 ** ((mel[i % 8] - 69) / 12); n = int(0.9 * SR); add(s_, (sine(f, 0.9) + 0.3 * sine(f * 3.01, 0.9)) * env(n, 0.002, 5) * 0.024)
# door creak
m = int(1.4 * SR); x = np.arange(m) / SR; add(open0 - 0.1, ma(np.sign(np.sin(2 * np.pi * np.cumsum(260 + 120 * np.sin(x * 5)) / SR)), 5) * np.hanning(m) * 0.07)
# small footsteps
for s_ in np.arange(small, small + 1.8, 0.32): thump(s_, 0.18, 110, 40); add(s_, nz(0.03, 3) * env(int(0.03 * SR), 0.001, 70) * 0.06)
buzz(buzz3 - 0.1); pop(ask3 - 0.05, 1200)
sting(w5, 92, 0.08); buzz(buzz6 - 0.1); pop(thats - 0.05, 1000)
# music box returns softly over the real Lily
for i, s_ in enumerate(np.arange(real, CL[8]['start'] - 0.3, 0.7)):
    f = 440 * 2 ** (([76, 74, 72, 71][i % 4] - 69) / 12); add(s_, sine(f, 0.8) * env(int(0.8 * SR), 0.002, 5) * 0.03)
# double laugh: two pitched pulse trains
for f0, a0 in ((140, laugh + 0.1), (300, andL)):
    for j in range(7):
        s_ = a0 + j * 0.2; m = int(0.14 * SR); x = np.arange(m) / SR; add(s_, (ma(rng.normal(0, 1, m), 4) * 0.5 + np.sin(2 * np.pi * f0 * (1 + 0.1 * np.sin(j)) * x)) * np.hanning(m) * 0.05)
# knocks on glass + low hit
for s_ in k:
    m = int(0.12 * SR); x = np.arange(m) / SR; add(s_, (np.sin(2 * np.pi * 2300 * x) * 0.5 + np.sin(2 * np.pi * 3500 * x) * 0.3 + rng.normal(0, 1, m) * 0.4) * np.exp(-x * 55) * 0.35); thump(s_, 0.35, 70, 30)
sting(wt(9, 'nine'), 82, 0.07)
pop(its10 - 0.05, 1000); pop(never - 0.05, 900); sting(never + 0.8, 73, 0.06)
for s_ in np.arange(opt, D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
m = int((D - opt) * SR); x = np.arange(m) / SR; add(opt, np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
for c in (2, 5):
    a0, a1 = int(CL[c]['start'] * SR), int((CL[c]['start'] + CL[c]['dur']) * SR); seg = vo[a0:a1].copy(); echo = np.zeros_like(seg); d = int(0.07 * SR); echo[d:] += seg[:-d] * 0.35; d2 = int(0.15 * SR); echo[d2:] += seg[:-d2] * 0.2; vo[a0:a1] = seg * 1.3 + echo
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
