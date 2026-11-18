# In this town (lies): SFX + low music bed, under the narration: SFX only, under the narration
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
def pop(at, f=500, amp=0.06): n = int(0.12 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(f * (1 + 2.5 * np.exp(-x * 40))) / SR) * np.exp(-x * 30) * amp)
def chirp(at, f=3200, amp=0.012): n = int(0.12 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(f + 900 * np.sin(x * 90)) / SR) * np.sin(np.pi * x / 0.12) * amp)
def meow(at, amp=0.04): n = int(0.45 * SR); x = np.arange(n) / SR; f = 700 + 300 * np.sin(np.pi * x / 0.45); y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR); add(at, (ma(y, 4) - ma(y, 25)) * np.sin(np.pi * x / 0.45) * amp)
# town ambience: birds + light chatter in the street shots
for k in range(16): chirp(0.2 + k * 0.17 + rng.random() * 0.1, 2800 + rng.random() * 1200)
i1 = int(S0[1] * SR); out[:i1] += ma(rng.normal(0, 1, i1), 14) * 0.02
for k in range(8): chirp(S0[11] + 0.1 + k * 0.3, 3000 + rng.random() * 800)
v = wt(3, 'then')[0]; thump(v + 0.75, 0.4, 120, 30); n = int(0.6 * SR); x = np.arange(n) / SR; w = rng.normal(0, 1, n); glass = (w - ma(w, 4)) * np.exp(-x * 7) * 0.3
for _ in range(8): fq = 2500 + rng.random() * 4000; glass += np.sin(2 * np.pi * fq * x + rng.random() * 6) * np.exp(-x * (10 + rng.random() * 15)) * 0.05
add(v + 0.75, glass)  # vase smashes
meow(wt(3, 'cat')[0] + 0.25)
pop(wt(4, 'i')[0] + 0.2, 420)  # first shrink
for i, q in enumerate(['homework', 'teeth', 'room']): pop(wt(5, q)[0] + 0.6 - (0.1 if q == 'room' else 0), 460 + i * 60)
t0, t1 = wt(5, 'room')[0] + 0.6, S0[6] - 0.1; k = 0; tt = t0
while tt < t1: pop(tt, 520 + k * 18, 0.04); tt += 0.11; k += 1  # all day long
tone(wt(6, 'shoe')[0] + 0.1, 0.4, 330, 0.02, 6)
for k in range(3): pop(wt(8, ["we're", "i'm", 'i'][k])[0] + 0.3, 300 - k * 30, 0.05)  # dad shrinking in the flashback
for j, f in enumerate([784, 988, 1175, 1568]): tone(wt(9, 'and')[0] + 0.1 + j * 0.07, 0.9, f, 0.02, 3)  # grows from the truth
for k in range(6): tone(S0[10] + 0.9 + k * 0.25, 0.04, 1800, 0.012, 60)  # list ticks
tone(S0[11] + 0.1, 0.3, 880, 0.025, 10)
# ---------- low music bed: playful plucks, turning gentle at the truth ----------
mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12); turn = S0[7]
def note(at, f, dur, amp, soft=False):
    n = int(dur * SR); x = np.arange(n) / SR; y = (np.sin(2 * np.pi * f * x) + (0.15 if soft else 0.35) * np.sin(4 * np.pi * f * x)) * (np.minimum(1, x / 0.08) * np.exp(-x * 1.2) if soft else np.exp(-x * 6)); i = int(at * SR)
    if i < N: mus[i:i + n] += amp * y[:N - i]
beat = 60 / 112; ch = [(48, [64, 67, 72]), (53, [65, 69, 72]), (55, [67, 71, 74]), (48, [64, 67, 72])]; tb = 0.0; kk = 0
while tb < turn: r_, c_ = ch[(kk // 4) % 4]; note(tb, mf(r_), beat * 0.8, 0.3); note(tb + beat / 2, mf(c_[kk % 3]), beat * 0.45, 0.12); tb += beat; kk += 1
sad = [(45, [60, 64, 69]), (41, [60, 65, 69]), (48, [60, 64, 67]), (43, [59, 62, 67])]; tb = turn; kk = 0
while tb < D: r_, c_ = sad[kk % 4]; note(tb, mf(r_), 2.2, 0.25, True); [note(tb + j * 0.5, mf(m + 12), 1.2, 0.06, True) for j, m in enumerate(c_)]; tb += 2.0; kk += 1
mus *= np.interp(t, [0, 0.5, D - 1.0, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)); pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
