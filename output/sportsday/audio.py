# Sports day: SFX + bouncy music bed (original, generated here), under the narration
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
def whistle(at, dur=0.5): n = int(dur * SR); x = np.arange(n) / SR; f = 2900 + 120 * np.sign(np.sin(2 * np.pi * 32 * x)); add(at, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 1.5) * np.minimum(1, (dur - x) * 20) * 0.03)
def cheer(at, dur=1.6, amp=0.06): n = int(dur * SR); x = np.arange(n) / SR; add(at, (nz(dur, 3) - nz(dur, 20)) * np.sin(np.pi * x / dur) ** 0.5 * amp)
# summer field ambience: distant crowd murmur + birds
out += (ma(rng.normal(0, 1, N), 30) - ma(rng.normal(0, 1, N), 200)) * 0.15 * 0.08
for k in range(int(D / 1.3)): tt = k * 1.3 + rng.random(); n = int(0.1 * SR); x = np.arange(n) / SR; add(tt, np.sin(2 * np.pi * (3200 + 1500 * np.sin(x * 120)) * x) * env(n, 0.005, 25) * 0.006)
whoosh(0.0, 0.08, 1.6)  # drone drop
w = wt(2, 'whistle'); whistle(w + 0.05); thump(wt(2, 'fall') + 0.25, 0.4, 90, 18)
for k in range(6): thump(w + 0.4 + k * 0.28, 0.18, 120, 30)  # sack hops
eg = wt(3, "kid's"); n = int(0.15 * SR); add(eg + 0.3, nz(0.15, 1) * env(n, 0.001, 30) * 0.08)  # an egg goes splat
thump(wt(4, 'ends') - 0.15, 0.5, 80, 14); thump(wt(4, 'ends') - 0.05, 0.4, 90, 16)  # both down
tone(wt(5, 'sticker'), 0.06, 1800, 0.02, 40); add(wt(5, 'sticker') + 0.05, nz(0.12, 2) * env(int(0.12 * SR), 0.001, 25) * 0.04)  # peel and stick
mg = CL[6]['start']; n = int(0.5 * SR); x = np.arange(n) / SR; add(mg, np.sin(2 * np.pi * (2400 + 600 * x) * x) * env(n, 0.05, 3) * 0.02)  # megaphone squeal
st = CL[7]['start']; [whoosh(st + k * 0.9, 0.04, 0.5) for k in range(5)]
c8 = CL[8]['start']; whistle(c8 - 0.05, 0.35); [thump(c8 + 0.1 + k * 0.17, 0.14, 130, 35) for k in range(int((wt(8, 'wins') - c8) / 0.17))]
tone(wt(8, 'hamstring') + 0.1, 0.3, 900, 0.03, 12); cheer(wt(8, 'wins'), 2.2, 0.09)
# music: bouncy major plucks + light kick (original)
mf = lambda m: 440 * 2 ** ((m - 69) / 12); mus = np.zeros(N); beat = 60 / 112; prog_ = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
for k, tb in enumerate(np.arange(0, D, beat / 2)):
    ch = prog_[(k // 8) % 4]; m = ch[k % 3] + (12 if k % 4 == 3 else 0); i0 = int(tb * SR); n = min(N - i0, int(0.3 * SR)); xx = np.arange(n) / SR
    mus[i0:i0 + n] += (np.sin(2 * np.pi * mf(m) * xx) + 0.4 * np.sin(2 * np.pi * mf(m) * 2 * xx)) * np.exp(-xx * 10) * 0.09
    if k % 2 == 0: mus[i0:i0 + n] += np.sin(2 * np.pi * 55 * xx * (1 - 0.4 * xx)) * np.exp(-xx * 22) * 0.25
mus *= np.interp(t, [0, 0.6, D - 1.2, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1); pk = lambda y: np.percentile(np.abs(y), 99.9)
bus = out * duck; bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus)); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= duck
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9; mix *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
