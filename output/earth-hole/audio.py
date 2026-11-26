# Earth hole: SFX + low music bed, under the narration: SFX only, under the narration
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(11)
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
def bell(at, amp=0.04): tone(at, 0.5, 2200, amp, 6); tone(at + 0.12, 0.6, 2200, amp, 6)
def rattle(a, b, amp=0.05):
    for k in range(int((b - a) / 0.05)): add(a + k * 0.05, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * amp * (0.6 + 0.4 * rng.random()))
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
def baa(at, amp=0.06, f0=330):
    n = int(0.6 * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 9 * x)) * (1 - 0.15 * x); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.sign(np.sin(ph)) * 0.5 + np.sin(ph); y = ma(y, 4) - ma(y, 30); add(at, y * np.sin(np.pi * x / 0.6) ** 0.5 * amp)
def boing(at, amp=0.05): n = int(0.4 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(220 + 500 * np.exp(-x * 8) * (1 + 0.3 * np.sin(x * 60))) / SR) * np.exp(-x * 6) * amp)
here = wt(0, "here's")[0]; whoosh(here + 0.2, 0.12, 0.6); thump(here + 0.1, 0.3, 120, 30)
# falling wind: grows with speed through the tunnel, silent while weightless
i0, i1 = int(S0[1] * SR), int(S0[5] * SR); xx = t[i0:i1]; w = rng.normal(0, 1, i1 - i0); wind = ma(w, 3) - ma(w, 25)
lvl = np.interp(xx, [S0[1], S0[2], S0[3], S0[4] - 0.4, S0[4], S0[5]], [0.15, 0.4, 1.0, 1.0, 0.05, 0.05]); out[i0:i1] += wind * 0.08 * lvl
i0, i1 = int(S0[3] * SR), int(S0[4] * SR); out[i0:i1] += (ma(rng.normal(0, 1, i1 - i0), 80) * 4 + np.sin(2 * np.pi * 40 * t[i0:i1]) * 0.15) * 0.12  # deep heat rumble
for k in range(8): add(S0[3] + 0.3 + k * 0.6, (nz(0.25, 1) - nz(0.25, 3)) * env(int(0.25 * SR), 0.01, 8) * 0.05)  # sizzles
for j, f in enumerate([1046, 1318, 1568, 2093]): tone(S0[4] + 0.2 + j * 0.12, 1.4, f, 0.02, 1.5)  # weightless shimmer
for k, p in enumerate([wt(5, 'pop')[0], wt(6, 'every')[0] + 0.5, wt(6, 'sheep')[0] - 0.25, S0[7] + 0.2]):
    boing(p, 0.05); baa(p + 0.45, 0.07 if k < 2 else 0.05, 330 - k * 20)
    if k >= 2: baa(p + 0.65, 0.04, 280); baa(p + 0.8, 0.035, 360)
whoosh(wt(6, 'forever')[0] - 0.2, 0.08, 0.5)
i0 = int(wt(5, 'pop')[0] * SR) - int(0.15 * SR); xx = t[i0:]; out[i0:] += ma(rng.normal(0, 1, N - i0), 60) * 0.12 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * xx)) * np.clip((xx - xx[0]) * 3, 0, 1)  # ocean
# ---------- low curious music bed: plucky, light, original ----------
BPM = 104; beat = 60 / BPM; mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def note(at, f, dur, amp):
    n = int(dur * SR); x = np.arange(n) / SR; y = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 6); i = int(at * SR)
    if i < N: mus[i:i + n] += amp * y[:N - i]
chords = [(50, [62, 65, 69]), (46, [62, 65, 70]), (48, [60, 64, 67]), (45, [61, 64, 69])]
bar = 0; t0 = 0.0
while t0 < D:
    root, ch = chords[bar % 4]
    for bt in range(4):
        tb = t0 + bt * beat; note(tb, mf(root), beat * 0.9, 0.35); arp = ch + [ch[0] + 12]; note(tb, mf(arp[bt] + 12), beat * 0.5, 0.12); note(tb + beat / 2, mf(arp[(bt + 2) % 4] + 12), beat * 0.5, 0.09)
    bar += 1; t0 += 4 * beat
mus *= np.interp(t, [0, 0.8, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
