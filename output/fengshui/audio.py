# Feng shui: SFX + gentle pentatonic music bed (original, generated here), under the narration
import json, numpy as np, soundfile as sf
SR = 44100; TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(8)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k): c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0): x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def buzz(at): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, np.sign(np.sin(2 * np.pi * 140 * x)) * env(n, 0.005, 6) * 0.04)
def chime(at): [tone(at + k * 0.08, 0.6, f, 0.04, 5) for k, f in enumerate([784, 988, 1319])]
def boing(at): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(300 + 400 * np.exp(-x * 9) * (1 + 0.3 * np.sin(x * 80))) / SR) * env(n, 0.002, 7) * 0.05)
def whoosh(at, amp=0.08, dur=0.4): n = int(dur * SR); x = np.arange(n) / SR; add(at, (nz(dur, 4) - nz(dur, 30)) * np.sin(np.pi * x / dur) ** 2 * amp)
# snoring under the hook
for k in range(2): n = int(1.0 * SR); x = np.arange(n) / SR; add(0.3 + k * 1.4, (ma(rng.normal(0, 1, n), 40) * 6 * np.sin(np.pi * x) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * x))) * 0.05)
buzz(wt(1, 'coffin'))
fx = wt(2, 'fix'); n = int(1.2 * SR); x = np.arange(n) / SR; add(fx, (nz(1.2, 2) - nz(1.2, 10)) * np.hanning(n) * 0.06); thump(fx + 1.2, 0.3, 90, 20)  # bed scrapes across the floor
chime(wt(2, 'see'))
b = wt(3, 'bounces'); [boing(b + k * 0.28) for k in range(3)]; buzz(wt(3, 'mirror')); whoosh(b + 1.0, 0.06, 0.5)
j = wt(4, 'junk'); [whoosh(j + k * 0.12, 0.07, 0.3) for k in range(3)]; p = wt(4, 'plant'); n = int(0.12 * SR); add(p, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, n)) / SR) * env(n, 0.002, 15) * 0.06)  # pop
pf = wt(5, 'perfect'); [tone(pf - 0.6 + k * 0.13 + rng.random() * 0.05, 1.2, f, 0.025, 2.5) for k, f in enumerate([1047, 1175, 1319, 1568, 1760, 1568, 1319])]  # wind chimes
c = wt(6, 'cat'); n = int(0.5 * SR); x = np.arange(n) / SR; add(c + 0.2, np.sin(2 * np.pi * np.cumsum(500 + 300 * np.sin(np.pi * x / 0.5)) / SR) * np.sin(np.pi * x / 0.5) * 0.04)  # meow
thump(wt(6, 'lies') + 0.3, 0.25, 100, 20); buzz(wt(6, 'feet') + 0.1)
# music: soft pentatonic plucks over a low pad
mf = lambda m: 440 * 2 ** ((m - 69) / 12); mus = np.zeros(N); beat = 60 / 88; scale = [62, 64, 66, 69, 71, 74, 76, 78]
r2 = np.random.default_rng(3)
for k, tb in enumerate(np.arange(0, D, beat / 2)):
    if r2.random() < 0.3: continue
    i0 = int(tb * SR); n = min(N - i0, int(0.6 * SR)); xx = np.arange(n) / SR; m = scale[r2.integers(0, len(scale))]
    mus[i0:i0 + n] += (np.sin(2 * np.pi * mf(m) * xx) + 0.3 * np.sin(2 * np.pi * mf(m) * 2 * xx)) * np.exp(-xx * 5) * 0.08
mus += (np.sin(2 * np.pi * mf(50) * t) + 0.6 * np.sin(2 * np.pi * mf(57) * t)) * 0.03 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * t))
mus *= np.interp(t, [0, 0.6, D - 1.2, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1); pk = lambda y: np.percentile(np.abs(y), 99.9)
bus = out * duck; bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus)); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= duck
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9; mix *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
