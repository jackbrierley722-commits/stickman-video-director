# Fat friend: light upbeat bed, can crack + X, step ticks, plate clinks, snore, chart, share whoosh
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
bpm = 112; beat = 60 / bpm; notes = [64, 67, 71, 67, 62, 66, 69, 66, 60, 64, 67, 64, 62, 66, 69, 72]
for i, s_ in enumerate(np.arange(0, D - 0.4, beat / 2)):
    tone(s_, 0.18, 440 * 2 ** ((notes[i % 16] - 69) / 12), 0.014, 14)
    if i % 4 == 0: thump(s_, 0.12, 60, 22)
    if i % 4 == 2: add(s_, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 60) * 0.02)
for c in S0[1:6]: tone(c + 0.05, 0.12, 1320, 0.04, 30); tone(c + 0.12, 0.12, 1760, 0.03, 30)  # step chime
nS = wt(1, 'not'); add(nS - 0.1, nz(0.12, 1) * env(int(0.12 * SR), 0.001, 30) * 0.12); thump(nS + 0.05, 0.4, 160, 30)  # can + X
for k in range(9): thump(wt(2, 'walk') + k * 0.45, 0.12, 100, 40)  # footsteps
for k in range(4): tone(wt(3, 'protein') + k * 0.22, 0.15, 2600 + k * 150, 0.02, 25)  # plate clinks
m = int(1.4 * SR); x = np.arange(m) / SR; add(S0[4] + 0.4, ma(nz(1.4, 1), 30) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * x)) * 0.12)  # soft snore
for k in range(6): tone(wt(5, 'go') + k * 0.25, 0.12, 900 - k * 60, 0.025, 25)  # chart descending blips
tone(S0[6], 0.12, 1400, 0.06, 30); tone(wt(6, 'follow') + 0.2, 0.12, 2100, 0.05, 30)
m = int(0.5 * SR); x = np.arange(m) / SR; add(wt(6, 'them'), np.sin(2 * np.pi * np.cumsum(500 + 1500 * x) / SR) * np.hanning(m) * 0.04)  # send whoosh
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.3 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
