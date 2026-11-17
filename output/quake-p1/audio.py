# Earthquake P1: SFX + low tense music bed, under the narration: SFX only, under the narration
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
stops = wt(5, 'stops')[0]; c4 = S0[4]
# earthquake rumble: low filtered noise, stronger once the windows go
i1 = int(stops * SR); xx = t[:i1]; strength = np.where(xx < c4, 0.6, 1.0) * np.clip(xx * 4, 0, 1) * np.clip((stops - xx) / 0.8, 0, 1)
rum = ma(rng.normal(0, 1, i1), 120) * 6 + np.sin(2 * np.pi * 32 * xx) * 0.2 * (1 + 0.5 * np.sin(2 * np.pi * 0.7 * xx)); out[:i1] += rum * strength * 0.25
for k in range(int(stops / 1.3)): creak(0.6 + k * 1.3 + rng.random() * 0.4, 0.8, 120 + rng.random() * 120, 0.03)  # building creaks
for k in range(int(stops / 0.23)): add(k * 0.23 + rng.random() * 0.1, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * 0.03)  # rattling
h = wt(2, 'hurt')[0]; thump(h, 0.9, 60, 9); add(h, nz(0.35, 2) * env(int(0.35 * SR), 0.001, 10) * 0.2)  # ceiling tile crash
thump(wt(3, 'drop')[0], 0.35, 90, 25); thump(wt(3, 'hold')[0], 0.2, 160, 40)
bu = wt(4, 'burst')[0]; n = int(1.4 * SR); x = np.arange(n) / SR; w = rng.normal(0, 1, n); glass = (w - ma(w, 5)) * np.exp(-x * 4) * 0.45
for _ in range(14): fq = 2200 + rng.random() * 5500; glass += np.sin(2 * np.pi * fq * x + rng.random() * 6) * np.exp(-x * (8 + rng.random() * 18)) * 0.05
add(bu, glass); thump(bu, 1.0, 50, 6); whoosh(bu - 0.1, 0.14, 0.7)
for k in range(10): add(bu + 0.4 + k * 0.12 + rng.random() * 0.05, nz(0.02, 1) * env(int(0.02 * SR), 0.001, 120) * 0.08)  # shards landing
for k in range(5): thump(c4 + 0.2 + k * 0.13, 0.25, 140, 35)  # books
thump(wt(4, 'glass')[0] + 0.1, 0.5, 70, 14)  # monitor falls
al = wt(6, 'alarm')[0]
for k in range(int((D - al) / 0.5)): tone(al + k * 0.5, 0.22, 2900, 0.02, 4)  # fire alarm
i0 = int(wt(6, 'you')[0] * SR); out[i0:] += (nz(D - i0 / SR, 1)[:N - i0] - nz(D - i0 / SR, 4)[:N - i0]) * 0.012  # smoke hiss
tone(S0[7] + 0.2, 0.2, 660, 0.04, 12); tone(wt(7, 'option', 1)[0], 0.2, 990, 0.04, 12); tone(wt(7, 'comment')[0], 0.2, 880, 0.035, 12)
# ---------- low tense music bed: dark pulse + drone, original ----------
BPM = 120; beat = 60 / BPM; mus = np.zeros(N)
def mput(at, y):
    i = int(at * SR)
    if i < N: mus[i:i + len(y)] += y[:N - i]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
seq = [45, 45, 48, 45, 44, 44, 47, 44]; tb = 0.0; k = 0
while tb < D:
    f = mf(seq[k % 8]); nn = int(beat * 0.45 * SR); xx = np.arange(nn) / SR; mput(tb, np.tanh(2.5 * np.sin(2 * np.pi * f * xx)) * np.exp(-xx * 6) * 0.5)
    if k % 2 == 0: kk = int(0.16 * SR); x2 = np.arange(kk) / SR; mput(tb, np.sin(2 * np.pi * 48 * x2 * (1 - 0.4 * x2)) * np.exp(-x2 * 20) * 0.7)
    tb += beat / 2; k += 1
mus += (np.sin(2 * np.pi * mf(33) * t) + 0.5 * np.sin(2 * np.pi * mf(40) * t)) * 0.18 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
mus *= np.interp(t, [0, 0.6, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
