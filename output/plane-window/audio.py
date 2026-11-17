# Why plane windows are round: SFX only, under the narration; the swear is bleeped
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(7)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a'], w['b']
            k += 1
    return CL[ci]['start'], CL[ci]['start'] + 0.3
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
def whoosh(at, amp=0.08, dur=0.4):
    n = int(dur * SR); x = np.arange(n) / SR; y = ma(rng.normal(0, 1, n), 6) - ma(rng.normal(0, 1, n), 30); add(at, y * np.sin(np.pi * x / dur) ** 2 * amp)
def siren(a, b, amp=0.025):
    i0, i1 = int(a * SR), min(N, int(b * SR)); x = np.arange(i1 - i0) / SR; f = 700 + 250 * (np.sin(2 * np.pi * 1.5 * x) > 0); y = np.sin(2 * np.pi * np.cumsum(f) / SR); e = np.minimum(1, np.minimum(x / 0.3, (x[-1] - x) / 0.3 + 1e-9)).clip(0, 1); out[i0:i1] += y * e * amp
def stamp(at): thump(at, 0.7, 70, 14); add(at, nz(0.08, 2) * env(int(0.08 * SR), 0.001, 40) * 0.12); tone(at + 0.02, 0.35, 220, 0.05, 8)
S0 = [c['start'] for c in CL]
fk = wt(0, 'fucking')
thump(0.02, 1.0, 35, 2.5); add(0.02, (nz(1.6, 2) - nz(1.6, 20)) * np.exp(-np.arange(int(1.6 * SR)) / SR * 1.8) * 0.18)  # the explosion
i0 = int(S0[1] * SR); out[i0:] += (ma(rng.normal(0, 1, N - i0), 40) * 0.06 + np.sin(2 * np.pi * 95 * t[i0:]) * 0.008)  # cabin / engine hum
tone(S0[1] + 0.3, 0.3, 880, 0.02, 6)
for k in range(3): m = int(1.0 * SR); x = np.arange(m) / SR; add(S0[2] + 1.3 + k * 1.2, np.sin(2 * np.pi * np.cumsum(140 + 30 * np.sin(x * 4)) / SR) * np.hanning(m) * 0.03)  # metal creak as it swells
for k in range(9): tone(wt(3, 'tiny')[0] + k * 0.32, 0.03, 3200 + 300 * (k % 3), 0.03, 90)  # cracks ticking
m = int(1.2 * SR); add(wt(4, 'broke')[0], (nz(1.2, 2) - nz(1.2, 15)) * np.exp(-np.arange(m) / SR * 2) * 0.12); thump(wt(4, 'broke')[0], 0.6, 50, 5)
m = int(0.8 * SR); x = np.arange(m) / SR; add(S0[5] + 0.2, (nz(0.8, 6) - nz(0.8, 30)) * np.sin(np.pi * x / 0.8) ** 2 * 0.08); tone(wt(5, 'much')[0], 0.5, 1320, 0.03, 5)
tone(wt(6, 'until')[0] + 0.3, 0.4, 330, 0.03, 6); tone(wt(6, 'until')[0] + 0.5, 0.5, 262, 0.03, 5)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
# bleep the swear: silence the word and put a 1 kHz tone at voice level in its place
a, b = int((fk[0] - 0.02) * SR), int((fk[1] + 0.02) * SR); lvl = np.percentile(np.abs(vo[max(0, a - SR):a]), 99) if a > 0 else 0.3
x = np.arange(b - a) / SR; vo[a:b] = np.sin(2 * np.pi * 1000 * x) * lvl * 0.55 * np.minimum(1, np.minimum(x / 0.005, (x[-1] - x) / 0.005 + 1e-9))
# bleep the swear: silence the word and put a 1 kHz tone at voice level in its place
a, b = int((fk[0] - 0.02) * SR), int((fk[1] + 0.02) * SR); lvl = np.percentile(np.abs(vo[max(0, a - SR):a]), 99) if a > 0 else 0.3
x = np.arange(b - a) / SR; vo[a:b] = np.sin(2 * np.pi * 1000 * x) * lvl * 0.55 * np.minimum(1, np.minimum(x / 0.005, (x[-1] - x) / 0.005 + 1e-9))
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2), 'bleep at', fk)
